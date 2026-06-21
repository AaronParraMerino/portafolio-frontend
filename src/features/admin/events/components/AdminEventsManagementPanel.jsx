import { useEffect, useState } from 'react';
import {
  BsEnvelope,
  BsPause,
  BsPersonBadge,
  BsPlay,
  BsSlashCircle,
  BsTrash,
} from 'react-icons/bs';
import { useLanguage } from '../../../../core/i18n';
import {
  formatAdminEventActiveDays,
  formatAdminEventDateRange,
  formatAdminEventTimeRange,
  getEventStatusMeta,
  getEventTypeMeta,
} from '../services/eventsService';
import EventsEmptyState from './EventsEmptyState';
import AdminPagination, { getAdminPageSlice } from '../../shared/AdminPagination';

const ACTIONS = [
  { id: 'activar', labelKey: 'adminEvents.action.activar', icon: BsPlay, variant: 'primary' },
  { id: 'pausar', labelKey: 'adminEvents.action.pausar', icon: BsPause, variant: 'ghost' },
  { id: 'suspender', labelKey: 'adminEvents.action.suspender', icon: BsSlashCircle, variant: 'ghost' },
  { id: 'eliminar', labelKey: 'adminEvents.action.eliminar', icon: BsTrash, variant: 'danger' },
];
const EVENTS_PAGE_SIZE = 6;

function getAvailableAdminActions(status) {
  if (status === 'eliminado') return [];

  const blockedByStatus = {
    activo: ['activar'],
    pausado: ['pausar'],
    suspendido: ['suspender', 'pausar'],
    cancelado: ['pausar', 'suspender'],
    programado: [],
    borrador: ['pausar'],
  };
  const blocked = blockedByStatus[status] || [];

  return ACTIONS.filter((action) => !blocked.includes(action.id));
}

export default function AdminEventsManagementPanel({
  sourceReady,
  events,
  onReviewEvent,
}) {
  const { language, t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const {
    currentPage: safeCurrentPage,
    pageItems: pagedEvents,
    totalPages,
    paginationItems,
  } = getAdminPageSlice(events, currentPage, EVENTS_PAGE_SIZE);
  const pageSummary = sourceReady && events.length
    ? t('adminEvents.pagination.showingEvents', {
      start: (safeCurrentPage - 1) * EVENTS_PAGE_SIZE + 1,
      end: Math.min(safeCurrentPage * EVENTS_PAGE_SIZE, events.length),
      count: events.length,
    })
    : sourceReady ? t('adminEvents.pagination.noResults') : t('adminEvents.pagination.noRecords');

  useEffect(() => {
    setCurrentPage(1);
  }, [events.length]);

  return (
    <div className="evt-view-body">
      <section className="evt-sheet">
        <div className="evt-view-toolbar">
          <div className="evt-view-toolbar-copy">
            <span className="evt-sheet-kicker">{t('adminEvents.management.kicker')}</span>
            <h2 className="evt-sheet-title">{t('adminEvents.workspace.events')}</h2>
          </div>
        </div>

        {sourceReady && events.length > 0 ? (
          <div className="evt-admin-event-list">
            {pagedEvents.map((event) => {
              const statusMeta = getEventStatusMeta(event.status);
              const typeMeta = getEventTypeMeta(event.type);
              const availableActions = getAvailableAdminActions(event.status);
              const dateRange = formatAdminEventDateRange(event, language);
              const timeRange = formatAdminEventTimeRange(event, language);
              const activeDays = formatAdminEventActiveDays(event, language);

              return (
                <article key={event.id || event.title} className="evt-admin-event-row">
                  <div className={`evt-card-accent evt-card-accent--${statusMeta.tone}`} />
                  <div className="evt-admin-event-main">
                    <div className="evt-card-badges">
                      <span className="evt-type-badge">{t(`adminEvents.type.${event.type}`) || typeMeta.label}</span>
                      <span className={`evt-status-badge evt-status-badge--${statusMeta.tone}`}>
                        <span />
                        {t(`adminEvents.status.${event.status}`) || statusMeta.label}
                      </span>
                    </div>
                    <strong>{event.title}</strong>
                    <p>{event.description}</p>
                    <small>{[dateRange, timeRange, activeDays, event.location].filter(Boolean).join(' · ')}</small>
                    <div className="evt-admin-publisher-card">
                      <span>
                        <BsPersonBadge />
                        {event.publisherName}
                      </span>
                      <span>
                        <BsEnvelope />
                        {event.publisherEmail}
                      </span>
                    </div>
                  </div>
                  <div className="evt-admin-event-actions">
                    {availableActions.map((action) => {
                      const Icon = action.icon;

                      return (
                        <button
                          key={action.id}
                          type="button"
                          className={`evt-mini-action evt-mini-action--${action.variant}`}
                          onClick={() => onReviewEvent(event, action.id)}
                        >
                          <Icon />
                          {t(action.labelKey)}
                        </button>
                      );
                    })}
                    {!availableActions.length ? (
                      <span className="evt-admin-event-lock">{t('adminEvents.filters.noRecords')}</span>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EventsEmptyState
            icon={BsPlay}
            title={t('adminEvents.management.emptyTitle')}
            description={t('adminEvents.management.emptyDescription')}
            hint={t('adminEvents.management.emptyHint')}
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
    </div>
  );
}
