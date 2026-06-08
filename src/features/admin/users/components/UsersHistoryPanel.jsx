import { useMemo, useState } from 'react';
import {
  BsBell,
  BsClockHistory,
  BsEnvelope,
  BsMegaphone,
  BsPeople,
  BsSearch,
} from 'react-icons/bs';
import { useLanguage } from '../../../../core/i18n';
import {
  USER_NOTICE_STATUSES,
  USER_NOTICE_TYPES,
  getUserNoticeStatusMeta,
  getUserNoticeTypeMeta,
} from '../services/usersService';
import UsersWorkspaceEmpty from './UsersWorkspaceEmpty';

const CHANNEL_ICONS = {
  inapp: BsBell,
  email: BsEnvelope,
};

function normalizeHistoryItem(item = {}) {
  const channels = item.channels || item.canales || [];

  return {
    id: item.id || item.id_historial,
    title: item.title || item.titulo || item.action || '',
    body: item.body || item.preview || item.descripcion || '',
    type: item.type || item.tipo || 'sistema',
    status: item.status || item.estado || 'enviado',
    audience: item.audience || item.dest || item.destinatarios || item.usuario || '',
    date: item.date || item.fecha || item.createdAt || item.creado || '--',
    channels: Array.isArray(channels) ? channels : [],
  };
}

function matchesHistoryFilters(item, query, typeFilter, statusFilter) {
  const normalizedQuery = query.trim().toLowerCase();
  const matchesType = typeFilter === 'todos' || item.type === typeFilter;
  const matchesStatus = statusFilter === 'todos' || item.status === statusFilter;

  if (!matchesType || !matchesStatus) return false;
  if (!normalizedQuery) return true;

  return [
    item.title,
    item.body,
    item.type,
    item.status,
    item.audience,
    item.date,
  ].some((value) => String(value || '').toLowerCase().includes(normalizedQuery));
}

export default function UsersHistoryPanel({
  sourceReady,
  historyItems,
}) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');

  const normalizedHistory = useMemo(
    () => historyItems.map(normalizeHistoryItem),
    [historyItems],
  );

  const visibleHistory = useMemo(
    () => normalizedHistory.filter((item) => matchesHistoryFilters(item, query, typeFilter, statusFilter)),
    [normalizedHistory, query, statusFilter, typeFilter],
  );

  return (
    <div className="usr-view-body">
      <section className="usr-sheet">
        <div className="usr-view-toolbar">
          <div className="usr-view-toolbar-copy">
            <span className="usr-sheet-kicker">{t('admin.users.history.kicker')}</span>
            <h2 className="usr-sheet-title">{t('admin.users.history.title')}</h2>
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
              placeholder={t('admin.users.history.searchPlaceholder')}
              aria-label={t('admin.users.history.searchAria')}
            />
          </div>

          <div className="usr-filter-strip usr-filter-strip--compact" aria-label={t('admin.users.history.typeAria')}>
            <button
              type="button"
              className={`usr-filter-chip${typeFilter === 'todos' ? ' active' : ''}`}
              onClick={() => setTypeFilter('todos')}
            >
              Todos
            </button>
            {USER_NOTICE_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                className={`usr-filter-chip${typeFilter === type.id ? ' active' : ''}`}
                onClick={() => setTypeFilter(type.id)}
              >
                {t(`admin.users.noticeType.${type.id}`)}
              </button>
            ))}
          </div>

          <div className="usr-filter-strip usr-filter-strip--compact" aria-label={t('admin.users.history.statusAria')}>
            {USER_NOTICE_STATUSES.map((status) => (
              <button
                key={status.id}
                type="button"
                className={`usr-filter-chip${statusFilter === status.id ? ' active' : ''}`}
                onClick={() => setStatusFilter(status.id)}
              >
                {t(`admin.users.status.${status.id}.label`)}
              </button>
            ))}
          </div>
        </div>

        {sourceReady && visibleHistory.length > 0 ? (
          <div className="usr-history-wrap">
            <table className="usr-history-table">
              <thead>
                <tr>
                  <th>{t('admin.users.history.record')}</th>
                  <th>{t('admin.users.history.type')}</th>
                  <th>{t('admin.users.history.status')}</th>
                  <th>{t('admin.users.history.destination')}</th>
                  <th>{t('admin.users.history.channels')}</th>
                  <th>{t('admin.users.history.date')}</th>
                </tr>
              </thead>
              <tbody>
                {visibleHistory.map((item) => {
                  const typeMeta = getUserNoticeTypeMeta(item.type);
                  const statusMeta = getUserNoticeStatusMeta(item.status);

                  return (
                    <tr key={item.id || `${item.title}-${item.date}`}>
                      <td>
                        <div className="usr-history-main">
                          <span className="usr-history-icon">
                            <BsMegaphone />
                          </span>
                          <span>
                            <strong>{item.title || t('admin.users.history.untitled')}</strong>
                            {item.body ? <small>{item.body}</small> : null}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`usr-type-badge usr-type-badge--${typeMeta.tone}`}>
                          {t(`admin.users.noticeType.${item.type}`)}
                        </span>
                      </td>
                      <td>
                        <span className={`usr-status-badge usr-status-badge--${statusMeta.tone}`}>
                          <span className="usr-status-dot" />
                          {t(`admin.users.status.${item.status}.label`)}
                        </span>
                      </td>
                      <td>
                        <span className="usr-history-audience">
                          <BsPeople />
                          {item.audience || t('admin.users.history.noRecipients')}
                        </span>
                      </td>
                      <td>
                        <div className="usr-channel-icons">
                          {item.channels.map((channel) => {
                            const Icon = CHANNEL_ICONS[channel] || BsBell;

                            return <Icon key={channel} title={channel} />;
                          })}
                          {!item.channels.length ? <span>{t('admin.users.history.noChannel')}</span> : null}
                        </div>
                      </td>
                      <td>{item.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <UsersWorkspaceEmpty
            icon={BsClockHistory}
            title={sourceReady ? t('admin.users.history.emptyFoundTitle') : t('admin.users.history.emptyTitle')}
            description={sourceReady
              ? t('admin.users.history.emptyFoundDescription')
              : t('admin.users.history.emptyDescription')}
            hint={t('admin.users.history.emptyHint')}
          />
        )}
      </section>

    </div>
  );
}
