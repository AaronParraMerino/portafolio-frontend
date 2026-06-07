import {
  BsCalendarEvent,
  BsGeoAlt,
  BsMegaphone,
  BsPeople,
  BsPencil,
  BsPlayFill,
  BsThreeDotsVertical,
  BsFileEarmarkText,
  BsXCircle,
} from 'react-icons/bs';
import { useLanguage } from '../../../../core/i18n';
import {
  getEventStatusMeta,
  getEventTypeMeta,
} from '../services/eventsService';
import EventsEmptyState from './EventsEmptyState';

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
                          <BsThreeDotsVertical />
                        </summary>
                        <div className="evt-card-menu-list">
                          {statusActions.map((action) => {
                            const Icon = action.icon === 'edit'
                              ? BsPencil
                              : action.icon === 'draft'
                                ? BsFileEarmarkText
                                : action.icon === 'cancel'
                                  ? BsXCircle
                                  : BsPlayFill;

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
                                {action.labelKey ? t(action.labelKey) : (t(`adminEvents.action.${action.id}`) || action.label)}
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
                      <BsCalendarEvent />
                      {event.date}{event.time ? ` - ${event.time}` : ''}
                    </span>
                    <span>
                      <BsGeoAlt />
                      {event.location}
                    </span>
                    <span>
                      <BsPeople />
                      {t('adminEvents.grid.registered', { registered: event.registered, capacity: event.capacity || '--' })}
                    </span>
                    {showCommunicationsMeta ? (
                      <span>
                        <BsMegaphone />
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
                      <BsMegaphone />
                      {t('adminEvents.grid.communicate')}
                    </button>
                    ) : null}
                    {showPrimaryAction ? (
                      <button
                        type="button"
                        className="evt-btn evt-btn--primary"
                        onClick={() => onEditEvent(event)}
                      >
                        <BsPencil />
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
          icon={BsCalendarEvent}
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
            onClick={() => onGoToPage(currentPage - 1)}
            disabled={currentPage <= 1 || !sourceReady}
          >
            {t('adminEvents.common.previous')}
          </button>
          {paginationItems.map((page) => (
            <button
              key={page}
              type="button"
              className={`evt-page-btn${page === currentPage ? ' active' : ''}`}
              onClick={() => onGoToPage(page)}
              disabled={!sourceReady || totalPages <= 1}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            className="evt-page-btn"
            onClick={() => onGoToPage(currentPage + 1)}
            disabled={currentPage >= totalPages || !sourceReady}
          >
            {t('adminEvents.common.next')}
          </button>
        </div>
      </div>
    </>
  );
}
