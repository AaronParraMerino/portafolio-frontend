import { useEffect, useMemo, useState } from 'react';
import {
  BsClockHistory,
  BsFileText,
  BsSearch,
  BsShieldCheck,
} from 'react-icons/bs';
import { useLanguage } from '../../../../core/i18n';
import {
  EVENT_HISTORY_STATUS,
  EVENT_HISTORY_TYPES,
  getEventHistoryStatusMeta,
  getEventHistoryTypeMeta,
} from '../services/eventsService';
import EventsEmptyState from './EventsEmptyState';
import AdminPagination, { getAdminPageSlice } from '../../shared/AdminPagination';

const HISTORY_PAGE_SIZE = 8;

function matchesHistoryFilters(item, query, typeFilter, statusFilter) {
  const normalizedQuery = query.trim().toLowerCase();
  const matchesType = typeFilter === 'todos' || item.type === typeFilter;
  const matchesStatus = statusFilter === 'todos' || item.status === statusFilter;

  if (!matchesType || !matchesStatus) return false;
  if (!normalizedQuery) return true;

  return [
    item.title,
    item.description,
    item.target,
    item.actor,
    item.action,
    item.entity,
    item.reason,
    item.module,
    item.type,
    item.status,
    item.date,
  ].some((value) => String(value || '').toLowerCase().includes(normalizedQuery));
}

export default function EventsHistoryPanel({
  sourceReady,
  historyItems,
}) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);

  const visibleHistory = useMemo(
    () => historyItems.filter((item) => matchesHistoryFilters(item, query, typeFilter, statusFilter)),
    [historyItems, query, statusFilter, typeFilter],
  );
  const {
    currentPage: safeCurrentPage,
    pageItems: pagedHistory,
    totalPages,
    paginationItems,
  } = getAdminPageSlice(visibleHistory, currentPage, HISTORY_PAGE_SIZE);
  const pageSummary = sourceReady && visibleHistory.length
    ? t('adminEvents.pagination.showingHistory', {
      start: (safeCurrentPage - 1) * HISTORY_PAGE_SIZE + 1,
      end: Math.min(safeCurrentPage * HISTORY_PAGE_SIZE, visibleHistory.length),
      count: visibleHistory.length,
    })
    : sourceReady ? t('adminEvents.pagination.noResults') : t('adminEvents.pagination.noRecords');

  useEffect(() => {
    setCurrentPage(1);
  }, [query, statusFilter, typeFilter]);

  return (
    <div className="evt-view-body">
      <section className="evt-sheet">
        <div className="evt-view-toolbar">
          <div className="evt-view-toolbar-copy">
            <span className="evt-sheet-kicker">{t('adminEvents.history.kicker')}</span>
            <h2 className="evt-sheet-title">{t('adminEvents.history.title')}</h2>
          </div>
        </div>

        <div className="evt-secondary-toolbar">
          <div className="evt-search-box evt-search-box--compact">
            <span className="evt-search-icon">
              <BsSearch />
            </span>
            <input
              type="text"
              className="evt-search-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('adminEvents.history.searchPlaceholder')}
              aria-label={t('adminEvents.history.searchAria')}
            />
          </div>

          <label className="adm-filter-field">
            <span>{t('adminEvents.history.typeAria')}</span>
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              {EVENT_HISTORY_TYPES.map((type) => (
                <option key={type.id} value={type.id}>{t(`adminEvents.historyType.${type.id}`)}</option>
              ))}
            </select>
          </label>

          <label className="adm-filter-field">
            <span>{t('adminEvents.history.statusAria')}</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              {EVENT_HISTORY_STATUS.map((status) => (
                <option key={status.id} value={status.id}>{t(`adminEvents.status.${status.id}`)}</option>
              ))}
            </select>
          </label>
        </div>

        {sourceReady && visibleHistory.length > 0 ? (
          <div className="evt-history-wrap">
            <table className="evt-history-table">
              <thead>
                <tr>
                  <th>{t('adminEvents.history.table.action')}</th>
                  <th>{t('adminEvents.history.table.actor')}</th>
                  <th>{t('adminEvents.history.table.entity')}</th>
                  <th>{t('adminEvents.history.table.status')}</th>
                  <th>{t('adminEvents.history.table.detail')}</th>
                  <th>{t('adminEvents.history.table.date')}</th>
                </tr>
              </thead>
              <tbody>
                {pagedHistory.map((item) => {
                  const typeMeta = getEventHistoryTypeMeta(item.type);
                  const statusMeta = getEventHistoryStatusMeta(item.status);

                  return (
                    <tr key={item.id || `${item.title}-${item.date}`}>
                      <td>
                        <div className="evt-history-main">
                          <span className="evt-history-icon">
                            <BsShieldCheck />
                          </span>
                          <span>
                            <strong>{item.action || item.title}</strong>
                            <small>{item.module || t('adminEvents.workspace.events')} · {t(`adminEvents.historyType.${item.type}`) || typeMeta.label}</small>
                          </span>
                        </div>
                      </td>
                      <td>
                        <strong className="evt-history-actor">{item.actor}</strong>
                      </td>
                      <td>
                        <span className="evt-history-entity">{item.entity || item.target}</span>
                      </td>
                      <td>
                        <span className={`evt-status-badge evt-status-badge--${statusMeta.tone}`}>
                          <span />
                          {t(`adminEvents.status.${item.status}`) || statusMeta.label}
                        </span>
                      </td>
                      <td>
                        <div className="evt-history-detail">
                          <span>{item.description || item.reason || t('adminEvents.history.noDetail')}</span>
                          {item.reason ? <small>{t('adminEvents.action.reasonLabel')}: {item.reason}</small> : null}
                          {item.previousStatus || item.nextStatus ? (
                            <small>
                              {t('adminEvents.form.status')}: {item.previousStatus || t('adminEvents.history.noStatus')} - {item.nextStatus || item.status}
                            </small>
                          ) : null}
                          {item.ip ? <small>IP: {item.ip}</small> : null}
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
          <EventsEmptyState
            icon={BsClockHistory}
            title={sourceReady ? t('adminEvents.history.emptyFoundTitle') : t('adminEvents.history.emptyTitle')}
            description={sourceReady
              ? t('adminEvents.history.emptyFoundDescription')
              : t('adminEvents.history.emptyDescription')}
            hint={t('adminEvents.history.emptyHint')}
          />
        )}

        <AdminPagination
          summary={pageSummary}
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          paginationItems={paginationItems}
          previousLabel={t('adminEvents.common.previous')}
          nextLabel={t('adminEvents.common.next')}
          disabled={!sourceReady}
          onPageChange={setCurrentPage}
        />
      </section>

      <section className="evt-sheet evt-sheet--subtle">
        <div className="evt-chip-list">
          <span className="evt-chip">
            <BsFileText />
            {t('adminEvents.history.chip.statusChanges')}
          </span>
          <span className="evt-chip">
            <BsFileText />
            {t('adminEvents.adminRequests.kicker')}
          </span>
          <span className="evt-chip">
            <BsFileText />
            {t('adminEvents.history.chip.adminReasons')}
          </span>
        </div>
      </section>
    </div>
  );
}
