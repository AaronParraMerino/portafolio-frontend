import { useEffect, useMemo, useState } from 'react';
import {
  BsDatabase,
  BsHddStack,
  BsListOl,
  BsTable,
} from 'react-icons/bs';
import { useLanguage } from '../../../../core/i18n';
import AdminHeader from '../../layout/AdminHeader';
import { getAdminSectionConfig } from '../../layout/adminHeaderConfig';
import { fetchBackupMetadata, generateBackup } from '../services/backupsService';
import '../styles/backups.css';

const LOCALES = { es: 'es-BO', en: 'en-US', pt: 'pt-BR' };

const BACKUP_STAT_ICONS = [BsDatabase, BsTable, BsListOl, BsHddStack];

function backupFilename(mode) {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    '-',
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
  ].join('');

  return `creafolio-${mode === 'full' ? 'completo' : 'tablas'}-${stamp}.json`;
}

export default function BackupsPage() {
  const { language, t } = useLanguage();
  const headerConfig = getAdminSectionConfig('backups');
  const [metadata, setMetadata] = useState(null);
  const [mode, setMode] = useState('full');
  const [selectedTables, setSelectedTables] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState(null);

  const loadMetadata = async () => {
    setLoading(true);
    setMessage(null);

    try {
      setMetadata(await fetchBackupMetadata());
    } catch (error) {
      setMessage({ type: 'error', text: error.translationKey ? t(error.translationKey) : error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetadata();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tables = useMemo(() => metadata?.tables || [], [metadata]);
  const visibleTables = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? tables.filter((table) => table.name.toLowerCase().includes(term)) : tables;
  }, [search, tables]);
  const totalRows = tables.reduce((sum, table) => sum + Number(table.rowCount || 0), 0);
  const totalSize = tables.reduce((sum, table) => sum + Number(table.sizeBytes || 0), 0);
  const numberFormatter = new Intl.NumberFormat(LOCALES[language] || LOCALES.es);
  const sizeFormatter = new Intl.NumberFormat(LOCALES[language] || LOCALES.es, {
    style: 'unit',
    unit: 'megabyte',
    maximumFractionDigits: 2,
  });
  const filePickerSupported = typeof window !== 'undefined' && 'showSaveFilePicker' in window;
  const canGenerate = metadata?.ready
    && filePickerSupported
    && !generating
    && (mode === 'full' || selectedTables.length > 0);

  const toggleTable = (name) => {
    setSelectedTables((current) => (
      current.includes(name) ? current.filter((table) => table !== name) : [...current, name]
    ));
  };

  const selectVisible = () => {
    const visibleNames = visibleTables.map((table) => table.name);
    setSelectedTables((current) => Array.from(new Set([...current, ...visibleNames])));
  };

  const saveBackup = async () => {
    if (!canGenerate) return;

    let fileHandle;
    try {
      fileHandle = await window.showSaveFilePicker({
        suggestedName: backupFilename(mode),
        types: [{
          description: t('adminBackups.file.description'),
          accept: { 'application/json': ['.json'] },
        }],
      });
    } catch (error) {
      if (error.name !== 'AbortError') {
        setMessage({ type: 'error', text: t('adminBackups.error.picker') });
      }
      return;
    }

    setGenerating(true);
    setMessage(null);

    try {
      const blob = await generateBackup(mode === 'tables'
        ? { mode, tables: selectedTables }
        : { mode });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      setMessage({ type: 'success', text: t('adminBackups.success.saved', { name: fileHandle.name }) });
    } catch (error) {
      setMessage({ type: 'error', text: error.translationKey ? t(error.translationKey) : error.message });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bkp-page adm-page-shell">
      <AdminHeader
        eyebrow={t(headerConfig.eyebrowKey || headerConfig.eyebrow)}
        title={t(headerConfig.titleKey || headerConfig.title)}
      />

      <div className="bkp-content">
        <section className="bkp-hero">
          <div>
            <span>{t('adminBackups.hero.kicker')}</span>
            <h2>{t('adminBackups.hero.title')}</h2>
            <p>{t('adminBackups.hero.description')}</p>
          </div>
          <div className={`bkp-readiness ${metadata?.ready ? 'ready' : 'blocked'}`}>
            <small>{t('adminBackups.compatibility.title')}</small>
            <strong>{metadata?.ready ? t('adminBackups.compatibility.ready') : t('adminBackups.compatibility.blocked')}</strong>
          </div>
        </section>

        {message ? <div className={`bkp-message ${message.type}`} role="alert">{message.text}</div> : null}

        {!filePickerSupported ? (
          <div className="bkp-message warning">{t('adminBackups.compatibility.filePicker')}</div>
        ) : null}

        <div className="bkp-stats">
          {[
            [t('adminBackups.stats.database'), metadata?.database?.name || '--', metadata?.database?.format || '--'],
            [t('adminBackups.stats.tables'), loading ? '--' : tables.length, t('adminBackups.stats.available')],
            [t('adminBackups.stats.rows'), loading ? '--' : numberFormatter.format(totalRows), t('adminBackups.stats.approximate')],
            [t('adminBackups.stats.size'), loading ? '--' : sizeFormatter.format(totalSize / 1048576), t('adminBackups.stats.databaseSize')],
          ].map(([label, value, helper], index) => {
            const Icon = BACKUP_STAT_ICONS[index] || BsDatabase;

            return (
              <div key={label}>
                <div className="bkp-stat-top">
                  <span className="bkp-stat-icon">
                    <Icon aria-hidden="true" />
                  </span>
                </div>
                <strong>{value}</strong>
                <span>{label}</span>
                <small>{helper}</small>
              </div>
            );
          })}
        </div>

        <section className="bkp-panel">
          <div className="bkp-panel-head">
            <div>
              <span>{t('adminBackups.panel.kicker')}</span>
              <h3>{t('adminBackups.panel.title')}</h3>
            </div>
            <button type="button" onClick={loadMetadata} disabled={loading || generating}>
              {t('adminBackups.actions.refresh')}
            </button>
          </div>

          <div className="bkp-mode-grid">
            <button type="button" className={mode === 'full' ? 'active' : ''} onClick={() => setMode('full')}>
              <strong>{t('adminBackups.mode.full.title')}</strong>
              <span>{t('adminBackups.mode.full.description')}</span>
            </button>
            <button type="button" className={mode === 'tables' ? 'active' : ''} onClick={() => setMode('tables')}>
              <strong>{t('adminBackups.mode.tables.title')}</strong>
              <span>{t('adminBackups.mode.tables.description')}</span>
            </button>
          </div>

          <p className="bkp-external-note">{t('adminBackups.mode.externalFiles')}</p>
          <p className="bkp-sensitive-note">{t('adminBackups.mode.sensitiveData')}</p>

          {mode === 'tables' ? (
            <div className="bkp-table-selector">
              <div className="bkp-table-tools">
                <input
                  type="search"
                  value={search}
                  placeholder={t('adminBackups.tables.search')}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <button type="button" onClick={selectVisible}>{t('adminBackups.tables.selectVisible')}</button>
                <button type="button" onClick={() => setSelectedTables([])}>{t('adminBackups.tables.clear')}</button>
                <span>{t('adminBackups.tables.selected', { count: selectedTables.length })}</span>
              </div>

              <div className="bkp-table-grid">
                {visibleTables.map((table) => (
                  <label key={table.name} className={selectedTables.includes(table.name) ? 'selected' : ''}>
                    <input
                      type="checkbox"
                      checked={selectedTables.includes(table.name)}
                      onChange={() => toggleTable(table.name)}
                    />
                    <span><strong>{table.name}</strong><small>{numberFormatter.format(table.rowCount)} {t('adminBackups.tables.rows')}</small></span>
                    <b>{sizeFormatter.format(table.sizeBytes / 1048576)}</b>
                  </label>
                ))}
              </div>

              <p className="bkp-note">{t('adminBackups.tables.warning')}</p>
            </div>
          ) : null}

          <div className="bkp-footer">
            <div>
              <strong>{t('adminBackups.save.title')}</strong>
              <span>{t('adminBackups.save.description')}</span>
            </div>
            <button type="button" className="bkp-save" disabled={!canGenerate} onClick={saveBackup}>
              {generating ? t('adminBackups.actions.generating') : t('adminBackups.actions.chooseLocation')}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
