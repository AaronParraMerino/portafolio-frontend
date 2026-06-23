import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BsActivity,
  BsFlag,
  BsFolder2Open,
  BsPeople,
  BsPersonCheck,
} from 'react-icons/bs';
import { useLanguage } from '../../../../core/i18n';
import AdminHeader from '../../layout/AdminHeader';
import { getAdminSectionConfig } from '../../layout/adminHeaderConfig';
import { fetchAdminReport } from '../services/reportsService';
import '../styles/reports.css';

const REPORT_SECTIONS = [
  { key: 'users', titleKey: 'adminReports.sections.users.title', totalKey: 'adminReports.sections.users.total', icon: BsPeople },
  { key: 'projects', titleKey: 'adminReports.sections.projects.title', totalKey: 'adminReports.sections.projects.total', icon: BsFolder2Open },
  { key: 'participations', titleKey: 'adminReports.sections.participations.title', totalKey: 'adminReports.sections.participations.total', icon: BsPersonCheck },
  { key: 'audit', titleKey: 'adminReports.sections.audit.title', totalKey: 'adminReports.sections.audit.total', icon: BsActivity },
];

function dateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function humanize(value = '') {
  return String(value).replace(/_/g, ' ').replace(/^\w/, (letter) => letter.toUpperCase());
}

function translateLabel(t, value = '') {
  const key = `adminReports.labels.${value}`;
  const translated = t(key);

  return translated === key ? humanize(value) : translated;
}

function detailRows(section = {}, t) {
  return Object.entries(section)
    .filter(([key, value]) => key !== 'total' && typeof value !== 'object')
    .map(([key, value]) => [translateLabel(t, key), value]);
}

function groupRows(section = {}) {
  return Object.entries(section).filter(([, value]) => value && typeof value === 'object');
}

function buildTextReport(report, t, language) {
  const locales = { es: 'es-BO', en: 'en-US', pt: 'pt-BR' };
  const lines = [
    t('adminReports.download.title'),
    t('adminReports.download.period', { from: report.period.from, to: report.period.to }),
    t('adminReports.download.generated', {
      date: new Date(report.period.generatedAt).toLocaleString(locales[language] || locales.es),
    }),
    '',
  ];

  REPORT_SECTIONS.forEach(({ key, titleKey, totalKey }) => {
    const section = report[key] || {};
    lines.push(t(titleKey).toUpperCase(), `${t(totalKey)}: ${section.total || 0}`);

    detailRows(section, t).forEach(([label, value]) => lines.push(`${label}: ${value}`));
    groupRows(section).forEach(([group, values]) => {
      lines.push(`${translateLabel(t, group)}:`);
      Object.entries(values).forEach(([label, value]) => lines.push(`  - ${translateLabel(t, label)}: ${value}`));
    });
    lines.push('');
  });

  return lines.join('\r\n');
}

export default function ReportsPage() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const headerConfig = getAdminSectionConfig('reports');
  const today = new Date();
  const monthAgo = new Date();
  monthAgo.setDate(today.getDate() - 29);

  const [filters, setFilters] = useState({
    desde: dateInputValue(monthAgo),
    hasta: dateInputValue(today),
  });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReport = async () => {
    setLoading(true);
    setError('');

    try {
      setReport(await fetchAdminReport(filters));
    } catch {
      setError(t('adminReports.error.load'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
    // The initial report uses the default 30-day period.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const downloadText = () => {
    if (!report) return;

    const blob = new Blob([buildTextReport(report, t, language)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${t('adminReports.download.filePrefix')}-${report.period.from}-${report.period.to}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rpt-page adm-page-shell">
      <AdminHeader
        eyebrow={t(headerConfig.eyebrowKey || headerConfig.eyebrow)}
        title={t(headerConfig.titleKey || headerConfig.title)}
      />

      <div className="rpt-content">
        <section className="rpt-toolbar">
          <div>
            <span>{t('adminReports.toolbar.kicker')}</span>
            <h2>{t('adminReports.toolbar.title')}</h2>
            <p>{t('adminReports.toolbar.description')}</p>
          </div>

          <div className="rpt-actions">
            <button
              type="button"
              className="rpt-support"
              onClick={() => navigate('/admin/denuncias')}
            >
              <BsFlag aria-hidden="true" />
              {t('adminDenuncias.header.title')}
            </button>
            <label>
              {t('adminReports.filters.from')}
              <input
                type="date"
                value={filters.desde}
                max={filters.hasta}
                onChange={(event) => setFilters((current) => ({ ...current, desde: event.target.value }))}
              />
            </label>
            <label>
              {t('adminReports.filters.to')}
              <input
                type="date"
                value={filters.hasta}
                min={filters.desde}
                onChange={(event) => setFilters((current) => ({ ...current, hasta: event.target.value }))}
              />
            </label>
            <button type="button" onClick={loadReport} disabled={loading}>
              {loading ? t('adminReports.actions.generating') : t('adminReports.actions.generate')}
            </button>
            <button type="button" className="rpt-download" onClick={downloadText} disabled={!report || loading}>
              {t('adminReports.actions.download')}
            </button>
          </div>
        </section>

        {error ? <div className="rpt-error" role="alert">{error}</div> : null}

        <div className="rpt-grid">
          {REPORT_SECTIONS.map(({ key, titleKey, totalKey, icon: Icon }) => {
            const section = report?.[key] || {};
            return (
              <section className="rpt-card" key={key}>
                <div className="rpt-card-head">
                  <span className="rpt-stat-icon">
                    <Icon aria-hidden="true" />
                  </span>
                  <div>
                    <strong>{loading ? '--' : section.total || 0}</strong>
                    <span>{t(titleKey)}</span>
                    <small>{t(totalKey)}</small>
                  </div>
                </div>

                <div className="rpt-details">
                  {detailRows(section, t).map(([label, value]) => (
                    <div key={label}><span>{label}</span><strong>{value}</strong></div>
                  ))}
                  {groupRows(section).map(([group, values]) => (
                    <div className="rpt-group" key={group}>
                      <b>{translateLabel(t, group)}</b>
                      {Object.entries(values).map(([label, value]) => (
                        <div key={label}><span>{translateLabel(t, label)}</span><strong>{value}</strong></div>
                      ))}
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
