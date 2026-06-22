import { useEffect, useMemo, useState } from 'react';
import {
  FiCheckCircle,
  FiClock,
  FiEye,
  FiRefreshCw,
  FiSearch,
  FiX,
  FiXCircle,
} from 'react-icons/fi';
import AdminHeader from '../../layout/AdminHeader';
import AdminPagination, { buildAdminPaginationItems } from '../../shared/AdminPagination';
import { useLanguage } from '../../../../core/i18n';
import {
  DENUNCIA_STATUS,
  DENUNCIA_STATUS_META,
  fetchAdminDenuncias,
  updateAdminDenuncia,
} from '../services/denunciasService';
import '../styles/denuncias.css';

const INITIAL_META = {
  current_page: 1,
  last_page: 1,
  per_page: 12,
  total: 0,
};

const STATUS_ICONS = {
  pendiente: FiClock,
  en_revision: FiSearch,
  resuelta: FiCheckCircle,
  descartada: FiXCircle,
};

function localeForLanguage(language) {
  if (language === 'en') return 'en-US';
  if (language === 'pt') return 'pt-BR';
  return 'es-BO';
}

function formatDate(value, language, t) {
  if (!value) return t('adminDenuncias.empty.noDate');
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return t('adminDenuncias.empty.noDate');

  return new Intl.DateTimeFormat(localeForLanguage(language), {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getStatusLabel(status, t, plural = false) {
  const keys = {
    todos: 'adminDenuncias.status.all',
    pendiente: plural ? 'adminDenuncias.status.pendingPlural' : 'adminDenuncias.stats.pending',
    en_revision: plural ? 'adminDenuncias.status.reviewPlural' : 'adminDenuncias.stats.review',
    resuelta: plural ? 'adminDenuncias.status.resolvedPlural' : 'adminDenuncias.stats.resolved',
    descartada: plural ? 'adminDenuncias.status.dismissedPlural' : 'adminDenuncias.stats.dismissed',
  };
  return t(keys[status] || keys.pendiente);
}

function getStatusMeta(status, t) {
  const meta = DENUNCIA_STATUS_META[status] || DENUNCIA_STATUS_META.pendiente;
  return {
    ...meta,
    label: getStatusLabel(status, t),
  };
}

function getUserLabel(user, t) {
  return user?.nombre || user?.correo || t('adminDenuncias.empty.user');
}

function getEvidenceImages(evidencia) {
  return Array.isArray(evidencia)
    ? evidencia.filter((item) => item?.tipo === 'imagen' && item?.url)
    : [];
}

export default function DenunciasPage() {
  const { t, language } = useLanguage();
  const [filters, setFilters] = useState({ estado: 'todos', q: '', page: 1, per_page: 12 });
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(INITIAL_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [nextStatus, setNextStatus] = useState('en_revision');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  const stats = useMemo(() => {
    const base = { pendiente: 0, en_revision: 0, resuelta: 0, descartada: 0 };
    items.forEach((item) => {
      if (base[item.estado] !== undefined) base[item.estado] += 1;
    });
    return base;
  }, [items]);

  const loadDenuncias = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = await fetchAdminDenuncias(filters, t('adminDenuncias.error.load'));
      setItems(payload?.data?.items || []);
      setMeta(payload?.data?.meta || INITIAL_META);
    } catch (requestError) {
      setError(requestError.message || t('adminDenuncias.error.load'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDenuncias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.estado, filters.q, filters.page, filters.per_page]);

  const updateFilter = (field, value) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
      page: field === 'page' ? value : 1,
    }));
  };

  const openDetail = (item) => {
    setSelected(item);
    setNextStatus(item.estado === 'pendiente' ? 'en_revision' : item.estado);
    setResponseText(item.respuesta_admin || '');
    setNotice('');
  };

  const saveDetail = async () => {
    if (!selected) return;

    setSaving(true);
    setNotice('');

    try {
      const payload = await updateAdminDenuncia(
        selected.id_denuncia,
        {
          estado: nextStatus,
          respuesta_admin: responseText,
        },
        t('adminDenuncias.error.update'),
      );
      const updated = payload?.data;
      setSelected(updated);
      setItems((current) => current.map((item) => (
        item.id_denuncia === updated.id_denuncia ? updated : item
      )));
      setNotice(payload?.message || t('adminDenuncias.feedback.updated'));
    } catch (requestError) {
      setNotice(requestError.message || t('adminDenuncias.error.update'));
    } finally {
      setSaving(false);
    }
  };

  const totalPages = meta.last_page || 1;
  const currentPage = meta.current_page || filters.page || 1;
  const paginationSummary = meta.total
    ? t('adminDenuncias.summary.count', { count: meta.total })
    : (loading ? t('adminDenuncias.summary.loading') : t('adminDenuncias.summary.empty'));

  return (
    <div className="den-page adm-page-shell">
      <AdminHeader
        eyebrow={t('adminDenuncias.header.eyebrow')}
        title={t('adminDenuncias.header.title')}
        subtitle={t('adminDenuncias.header.subtitle')}
      />

      <div className="den-content">
        <section className="den-stats-grid adm-stats-grid" aria-label={t('adminDenuncias.header.title')}>
          {['pendiente', 'en_revision', 'resuelta', 'descartada'].map((status) => {
            const statusMeta = getStatusMeta(status, t);
            const Icon = STATUS_ICONS[status] || FiClock;
            return (
              <article key={status} className="den-stat adm-stat-card">
                <div className="den-stat-icon adm-module-icon">
                  <Icon aria-hidden="true" />
                </div>
                <strong>{loading ? '--' : (stats[status] || 0)}</strong>
                <span>{statusMeta.label}</span>
                <small>{t(`adminDenuncias.stats.${status}.helper`)}</small>
              </article>
            );
          })}
        </section>

        {error ? <div className="den-error" role="alert">{error}</div> : null}

        <section className="den-panel">
          <div className="den-panel-head">
            <div>
              <span>{t('adminDenuncias.panel.eyebrow')}</span>
              <h3>{t('adminDenuncias.panel.title')}</h3>
            </div>
            <button className="den-icon-action" type="button" onClick={loadDenuncias} disabled={loading}>
              <FiRefreshCw aria-hidden="true" />
              {t('adminDenuncias.actions.refresh')}
            </button>
          </div>

          <div className="den-filters">
            <label className="den-search">
              <FiSearch aria-hidden="true" />
              <input
                type="search"
                value={filters.q}
                placeholder={t('adminDenuncias.filters.search')}
                aria-label={t('adminDenuncias.filters.search')}
                onChange={(event) => updateFilter('q', event.target.value)}
              />
            </label>
            <select
              value={filters.estado}
              aria-label={t('adminDenuncias.filters.status')}
              onChange={(event) => updateFilter('estado', event.target.value)}
            >
              {DENUNCIA_STATUS.map((status) => (
                <option key={status.id} value={status.id}>{getStatusLabel(status.id, t, status.id !== 'todos')}</option>
              ))}
            </select>
          </div>

          <div className="den-table-wrap">
            <table className="den-table">
              <thead>
                <tr>
                  <th>{t('adminDenuncias.table.subject')}</th>
                  <th>{t('adminDenuncias.table.user')}</th>
                  <th>{t('adminDenuncias.table.status')}</th>
                  <th>{t('adminDenuncias.table.date')}</th>
                  <th>{t('adminDenuncias.table.action')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="den-empty">{t('adminDenuncias.empty.loading')}</td></tr>
                ) : items.length ? items.map((item) => {
                  const statusMeta = getStatusMeta(item.estado, t);
                  return (
                    <tr key={item.id_denuncia}>
                      <td>
                        <strong>{item.asunto}</strong>
                        <small>{item.detalle || t('adminDenuncias.empty.noDetail')}</small>
                      </td>
                      <td>
                        <strong>{getUserLabel(item.denunciante, t)}</strong>
                        <small>{item.denunciante?.correo || t('adminDenuncias.empty.noEmail')}</small>
                      </td>
                      <td>
                        <span className={`den-status den-status--${statusMeta.tone}`}>
                          {statusMeta.label}
                        </span>
                      </td>
                      <td>{formatDate(item.created_at, language, t)}</td>
                      <td>
                        <button type="button" className="den-row-action" onClick={() => openDetail(item)}>
                          <FiEye aria-hidden="true" />
                          {t('adminDenuncias.actions.review')}
                        </button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="5" className="den-empty">{t('adminDenuncias.empty.noItems')}</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <AdminPagination
            summary={paginationSummary}
            currentPage={currentPage}
            totalPages={totalPages}
            paginationItems={buildAdminPaginationItems(currentPage, totalPages)}
            previousLabel={t('adminDenuncias.pagination.previous')}
            nextLabel={t('adminDenuncias.pagination.next')}
            disabled={loading}
            onPageChange={(page) => updateFilter('page', page)}
          />
        </section>
      </div>

      {selected ? (
        <div className="den-detail-backdrop" role="presentation" onMouseDown={() => setSelected(null)}>
          <aside className="den-detail" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <div>
                <span>{t('adminDenuncias.detail.title', { id: selected.id_denuncia })}</span>
                <h3>{selected.asunto}</h3>
              </div>
              <button type="button" onClick={() => setSelected(null)} aria-label={t('adminDenuncias.actions.close')}>
                <FiX aria-hidden="true" />
              </button>
            </header>

            <div className="den-detail-body">
              <section>
                <h4>{t('adminDenuncias.detail.detail')}</h4>
                <p>{selected.detalle || t('adminDenuncias.empty.noDetailSentence')}</p>
              </section>

              <section>
                <h4>{t('adminDenuncias.detail.reporter')}</h4>
                <p>{getUserLabel(selected.denunciante, t)}<br />{selected.denunciante?.correo || t('adminDenuncias.empty.noEmail')}</p>
              </section>

              {selected.metadata?.url ? (
                <section>
                  <h4>{t('adminDenuncias.detail.context')}</h4>
                  <a href={selected.metadata.url} target="_blank" rel="noreferrer">
                    {selected.metadata.ruta || selected.metadata.url}
                  </a>
                </section>
              ) : null}

              {getEvidenceImages(selected.evidencia).length ? (
                <section>
                  <h4>{t('adminDenuncias.detail.evidence')}</h4>
                  <div className="den-evidence-grid">
                    {getEvidenceImages(selected.evidencia).map((item, index) => (
                      <a
                        key={`${item.url}-${index}`}
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="den-evidence"
                      >
                        <img src={item.url} alt={item.nombre || t('adminDenuncias.detail.image', { number: index + 1 })} />
                        <span>{item.nombre || t('adminDenuncias.detail.attachedImage')}</span>
                      </a>
                    ))}
                  </div>
                </section>
              ) : null}

              <label>
                <span>{t('adminDenuncias.table.status')}</span>
                <select value={nextStatus} onChange={(event) => setNextStatus(event.target.value)}>
                  {DENUNCIA_STATUS.filter((status) => status.id !== 'todos').map((status) => (
                    <option key={status.id} value={status.id}>{getStatusLabel(status.id, t)}</option>
                  ))}
                </select>
              </label>

              <label>
                <span>{t('adminDenuncias.detail.response')}</span>
                <textarea
                  value={responseText}
                  onChange={(event) => setResponseText(event.target.value)}
                  rows={6}
                  maxLength={4000}
                  placeholder={t('adminDenuncias.detail.responsePlaceholder')}
                />
              </label>

              {notice ? <div className="den-detail-notice">{notice}</div> : null}
            </div>

            <footer>
              <button type="button" className="den-secondary" onClick={() => setSelected(null)}>{t('adminDenuncias.actions.close')}</button>
              <button type="button" className="den-primary" onClick={saveDetail} disabled={saving}>
                {saving ? t('adminDenuncias.actions.saving') : t('adminDenuncias.actions.save')}
              </button>
            </footer>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
