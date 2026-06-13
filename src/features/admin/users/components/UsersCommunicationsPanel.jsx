import { useEffect, useMemo, useState } from 'react';
import {
  BsBell,
  BsClock,
  BsEnvelope,
  BsMegaphone,
  BsPeople,
  BsPlusLg,
  BsSearch,
  BsSend,
  BsThreeDots,
} from 'react-icons/bs';
import {
  USER_ALL_NOTICE_TYPES,
  USER_NOTICE_STATUSES,
  getUserNoticeStatusMeta,
  getUserNoticeTypeMeta,
  normalizeNoticeUrgency,
} from '../services/usersService';
import UsersWorkspaceEmpty from './UsersWorkspaceEmpty';
import { useLanguage } from '../../../../core/i18n';
import AdminPagination, { getAdminPageSlice } from '../../shared/AdminPagination';

const CHANNEL_ICONS = {
  inapp: BsBell,
  email: BsEnvelope,
};
const COMMUNICATIONS_PAGE_SIZE = 6;

function normalizeNotice(item = {}) {
  const channels = item.channels || item.canales || [];
  const rawStatus = item.status || item.estado || 'borrador';
  const status = rawStatus === 'activo' ? 'enviado' : rawStatus;

  return {
    id: item.id || item.id_aviso || item.id_comunicacion,
    title: item.title || item.titulo || '',
    body: item.body || item.preview || item.cuerpo || item.descripcion || '',
    type: item.type || item.tipo || 'sistema',
    status,
    urgency: normalizeNoticeUrgency(item.urgency || item.urgencia || item.prioridad),
    audience: item.audience || item.dest || item.destinatarios || 0,
    date: item.scheduledAt || item.fecha || item.createdAt || item.creado || '--',
    segments: item.segments || item.segmentos || [],
    channels: Array.isArray(channels) ? channels : [],
    pinned: !!item.pinned,
    raw: item,
  };
}

function matchesNoticeFilters(notice, query, typeFilter, statusFilter) {
  const normalizedQuery = query.trim().toLowerCase();
  const matchesType = typeFilter === 'todos' || notice.type === typeFilter;
  const matchesStatus = statusFilter === 'todos' || notice.status === statusFilter;

  if (!matchesType || !matchesStatus) return false;
  if (!normalizedQuery) return true;

  return [
    notice.title,
    notice.body,
    notice.type,
    notice.status,
    notice.urgency,
  ].some((value) => String(value || '').toLowerCase().includes(normalizedQuery));
}

export default function UsersCommunicationsPanel({
  sourceReady,
  communications,
  onCreateNotice,
  onEditNotice,
}) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);

  const notices = useMemo(
    () => communications.map(normalizeNotice),
    [communications],
  );

  const visibleNotices = useMemo(
    () => notices.filter((notice) => matchesNoticeFilters(notice, query, typeFilter, statusFilter)),
    [notices, query, statusFilter, typeFilter],
  );
  const {
    currentPage: safeCurrentPage,
    pageItems: pagedNotices,
    totalPages,
    paginationItems,
  } = getAdminPageSlice(visibleNotices, currentPage, COMMUNICATIONS_PAGE_SIZE);
  const pageSummary = sourceReady && visibleNotices.length
    ? t('admin.users.pagination.communicationsRange', {
      start: (safeCurrentPage - 1) * COMMUNICATIONS_PAGE_SIZE + 1,
      end: Math.min(safeCurrentPage * COMMUNICATIONS_PAGE_SIZE, visibleNotices.length),
      total: visibleNotices.length,
    })
    : sourceReady ? t('admin.users.pagination.noResults') : t('admin.users.pagination.pending');

  useEffect(() => {
    setCurrentPage(1);
  }, [query, statusFilter, typeFilter]);

  return (
    <div className="usr-view-body">
      <section className="usr-sheet">
        <div className="usr-view-toolbar">
          <div className="usr-view-toolbar-copy">
            <span className="usr-sheet-kicker">{t('admin.users.communications.kicker')}</span>
            <h2 className="usr-sheet-title">{t('admin.users.communications.title')}</h2>
            <p className="usr-sheet-copy">
              {t('admin.users.communications.description')}
            </p>
          </div>

          <div className="usr-view-toolbar-actions">
            <button
              type="button"
              className="usr-context-btn usr-context-btn--primary"
              onClick={onCreateNotice}
            >
              <BsPlusLg />
              {t('admin.users.communications.new')}
            </button>
          </div>
        </div>

        <div className="usr-secondary-toolbar">
          <div className="usr-search-box usr-search-box--compact">
            <span className="usr-search-icon">
              <BsSearch />
            </span>
            <input
              type="text"
              className="usr-search-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('admin.users.communications.searchPlaceholder')}
              aria-label={t('admin.users.communications.searchAria')}
            />
          </div>

          <label className="adm-filter-field">
            <span>{t('admin.users.communications.filterTypeAria')}</span>
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              <option value="todos">{t('admin.users.communications.all')}</option>
              {USER_ALL_NOTICE_TYPES.map((type) => (
                <option key={type.id} value={type.id}>{t(`admin.users.noticeType.${type.id}`)}</option>
              ))}
            </select>
          </label>

          <label className="adm-filter-field">
            <span>{t('admin.users.communications.filterStatusAria')}</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              {USER_NOTICE_STATUSES.map((status) => (
                <option key={status.id} value={status.id}>{t(`admin.users.status.${status.id}.label`)}</option>
              ))}
            </select>
          </label>
        </div>

        {sourceReady && visibleNotices.length > 0 ? (
          <div className="usr-notice-grid">
            {pagedNotices.map((notice) => {
              const typeMeta = getUserNoticeTypeMeta(notice.type);
              const statusMeta = getUserNoticeStatusMeta(notice.status);

              return (
                <article key={notice.id || notice.title} className={`usr-notice-card${notice.pinned ? ' pinned' : ''}`}>
                  <div className={`usr-notice-accent usr-notice-accent--${typeMeta.tone}`} />

                  <div className="usr-notice-card-body">
                    <div className="usr-notice-card-top">
                      <div className="usr-notice-badges">
                        <span className={`usr-type-badge usr-type-badge--${typeMeta.tone}`}>
                          <BsMegaphone />
                          {t(`admin.users.noticeType.${notice.type}`)}
                        </span>
                        <span className={`usr-status-badge usr-status-badge--${statusMeta.tone}`}>
                          <span className="usr-status-dot" />
                          {t(`admin.users.status.${notice.status}.label`)}
                        </span>
                      </div>

                      <button type="button" className="usr-icon-tool usr-icon-tool--sm" title={t('admin.users.communications.moreOptions')} aria-label={t('admin.users.communications.moreOptions')}>
                        <BsThreeDots />
                      </button>
                    </div>

                    <h3 className="usr-notice-title">{notice.title || t('admin.users.communications.defaultTitle')}</h3>
                    <p className="usr-notice-desc">{notice.body || t('admin.users.communications.defaultBody')}</p>

                    <div className="usr-notice-meta-grid">
                      <span>
                        <BsClock />
                        {notice.date}
                      </span>
                      <span>
                        <BsPeople />
                        {t('admin.users.communications.usersCount', { count: notice.audience })}
                      </span>
                      <span>
                        <span className={`usr-urgency-dot usr-urgency-dot--${notice.urgency}`} />
                        {t('admin.users.communications.urgency', { urgency: notice.urgency })}
                      </span>
                    </div>

                    <div className="usr-notice-chip-row">
                      {notice.segments.slice(0, 3).map((segment) => (
                        <span key={segment} className="usr-mini-chip">{t(`admin.users.segment.${segment}`)}</span>
                      ))}
                      {!notice.segments.length ? <span className="usr-mini-chip">{t('admin.users.communications.noSegment')}</span> : null}
                    </div>
                  </div>

                  <div className="usr-notice-card-actions">
                    <div className="usr-channel-icons">
                      {notice.channels.map((channel) => {
                        const Icon = CHANNEL_ICONS[channel] || BsBell;

                        return <Icon key={channel} title={channel} />;
                      })}
                      {!notice.channels.length ? <span>{t('admin.users.communications.noChannel')}</span> : null}
                    </div>

                    <button
                      type="button"
                      className="usr-mini-action"
                      onClick={() => onEditNotice(notice.raw)}
                    >
                      {t('admin.users.communications.edit')}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <UsersWorkspaceEmpty
            icon={BsSend}
            title={sourceReady
              ? t('admin.users.communications.emptyFilteredTitle')
              : t('admin.users.communications.emptyRegisteredTitle')}
            description={sourceReady
              ? t('admin.users.communications.emptyFilteredDescription')
              : t('admin.users.communications.emptyDescription')}
            hint={t('admin.users.communications.emptyHint')}
          />
        )}

        <AdminPagination
          summary={pageSummary}
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          paginationItems={paginationItems}
          previousLabel={t('admin.users.table.previous')}
          nextLabel={t('admin.users.table.next')}
          disabled={!sourceReady}
          onPageChange={setCurrentPage}
        />
      </section>
    </div>
  );
}
