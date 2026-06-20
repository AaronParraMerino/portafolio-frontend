import { useLanguage } from '../../../../core/i18n';
import {
  DashboardCalendarIcon,
  DashboardCloseIcon,
  DashboardEditIcon,
  DashboardFileIcon,
  DashboardLocationIcon,
  DashboardMegaphoneIcon,
  DashboardMenuIcon,
  DashboardPlayIcon,
  DashboardUserIcon,
} from '../../../dashboard/layout/DashboardIcons';
import {
  getEventStatusMeta,
  getEventTypeMeta,
} from '../services/eventsService';
import EventsEmptyState from './EventsEmptyState';
import { scrollDashboardPageToTop } from '../../../dashboard/layout/DashboardPagination';

export default function EventsGrid({
  events,
  sourceReady,
  emptyState,
  pageSummary,
  currentPage,
  totalPages,
  paginationItems,
  onGoToPage,
  onEditEvent,
  onCommunicate,
  onStatusAction,
  getStatusActions,
  showCommunicationAction = true,
  showCommunicationsMeta = true,
  showPrimaryAction = true,
  primaryActionLabel,
  emptyHint,
}) {
  const { t } = useLanguage();
  const finalPrimaryActionLabel = primaryActionLabel || t('adminEvents.common.edit');
  const finalEmptyHint = emptyHint || t('adminEvents.grid.defaultHint');
  const handlePageChange = (page) => {
    if (page === currentPage) return;
    onGoToPage(page);
    scrollDashboardPageToTop();
  };

  return (
    <>
      {events.length > 0 ? (
        <div className="evt-grid">
          {events.map((event) => {
            const statusMeta = getEventStatusMeta(event.status);
            const typeMeta = getEventTypeMeta(event.type);
            const statusActions = typeof getStatusActions === 'function' ? getStatusActions(event) : [];

            return (
              <article key={event.id || event.title} className="evt-card">
                <div className={`evt-card-accent evt-card-accent--${statusMeta.tone}`} />
                {event.imageUrl || event.imagePreview ? (
                  <div className="evt-card-cover">
                    <img src={event.imageUrl || event.imagePreview} alt={event.title} />
                  </div>
                ) : null}
                <div className="evt-card-body">
                  <div className="evt-card-top">
                    <div className="evt-card-badges">
                      <span className="evt-type-badge">{t(`adminEvents.type.${event.type}`) || typeMeta.label}</span>
                      <span className={`evt-status-badge evt-status-badge--${statusMeta.tone}`}>
                        <span />
                        {t(`adminEvents.status.${event.status}`) || statusMeta.label}
                      </span>
                    </div>
                    {statusActions.length > 0 ? (
                      <details className="evt-card-menu">
                        <summary className="evt-icon-btn evt-icon-btn--sm" title={t('adminEvents.grid.changeStatus')} aria-label={t('adminEvents.grid.changeStatus')}>
                          <DashboardMenuIcon />
                        </summary>
                        <div className="evt-card-menu-list">
                          {statusActions.map((action) => {
                            const Icon = action.icon === 'edit'
                              ? DashboardEditIcon
                              : action.icon === 'draft'
                                ? DashboardFileIcon
                                : action.icon === 'cancel'
                                  ? DashboardCloseIcon
                                  : DashboardPlayIcon;

                            return (
                              <button
                                key={action.id}
                                type="button"
                                className={`evt-card-menu-item evt-card-menu-item--${action.variant || 'ghost'}`}
                                onClick={(clickEvent) => {
                                  clickEvent.currentTarget.closest('details')?.removeAttribute('open');
                                  onStatusAction?.(event, action);
                                }}
                              >
                                <Icon />
                                {action.labelKey ? t(action.labelKey) : (action.label || t(`adminEvents.action.${action.id}`))}
                              </button>
                            );
                          })}
                        </div>
                      </details>
                    ) : null}
                  </div>

                  <h3 className="evt-card-title">{event.title}</h3>
                  <p className="evt-card-desc">{event.description}</p>

                  <div className="evt-card-meta">
                    <span>
                      <DashboardCalendarIcon />
                      {event.date}{event.time ? ` - ${event.time}` : ''}
                    </span>
                    <span>
                      <DashboardLocationIcon />
                      {event.location}
                    </span>
                    <span>
                      <DashboardUserIcon />
                      {t('adminEvents.grid.registered', { registered: event.registered, capacity: event.capacity || '--' })}
                    </span>
                    {showCommunicationsMeta ? (
                      <span>
                        <DashboardMegaphoneIcon />
                        {t('adminEvents.grid.communications', { count: event.communicationsCount })}
                      </span>
                    ) : null}
                  </div>

                  <div className="evt-card-chips">
                    {event.segments.slice(0, 3).map((segment) => (
                      <span key={segment}>{segment}</span>
                    ))}
                    {!event.segments.length ? <span>{t('adminEvents.grid.noSegments')}</span> : null}
                  </div>
                </div>

                <div className="evt-card-actions">
                  <div className="evt-card-action-group evt-card-action-group--right">
                    {showCommunicationAction ? (
                    <button
                      type="button"
                      className="evt-btn evt-btn--ghost"
                      onClick={() => onCommunicate(event)}
                    >
                      <DashboardMegaphoneIcon />
                      {t('adminEvents.grid.communicate')}
                    </button>
                    ) : null}
                    {showPrimaryAction ? (
                      <button
                        type="button"
                        className="evt-btn evt-btn--primary"
                        onClick={() => onEditEvent(event)}
                      >
                        <DashboardEditIcon />
                        {finalPrimaryActionLabel}
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EventsEmptyState
          icon={DashboardCalendarIcon}
          title={emptyState.title}
          description={emptyState.description}
          hint={finalEmptyHint}
        />
      )}

      <div className="evt-pagination">
        <div className="evt-pagination-info">{pageSummary}</div>
        <div className="evt-pagination-actions">
          <button
            type="button"
            className="evt-page-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || !sourceReady}
          >
            {t('adminEvents.common.previous')}
          </button>
          {paginationItems.map((page) => (
            <button
              key={page}
              type="button"
              className={`evt-page-btn${page === currentPage ? ' active' : ''}`}
              onClick={() => handlePageChange(page)}
              disabled={!sourceReady || totalPages <= 1}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            className="evt-page-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || !sourceReady}
          >
            {t('adminEvents.common.next')}
          </button>
        </div>
      </div>
    </>
  );
}
