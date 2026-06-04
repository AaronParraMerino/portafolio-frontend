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
  primaryActionLabel = 'Editar',
  emptyHint = 'Las estadisticas no navegan; usa los botones del panel para crear o comunicar eventos.',
}) {
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
                      <span className="evt-type-badge">{typeMeta.label}</span>
                      <span className={`evt-status-badge evt-status-badge--${statusMeta.tone}`}>
                        <span />
                        {statusMeta.label}
                      </span>
                    </div>
                    {statusActions.length > 0 ? (
                      <details className="evt-card-menu">
                        <summary className="evt-icon-btn evt-icon-btn--sm" title="Cambiar estado" aria-label="Cambiar estado">
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
                                {action.label}
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
                      {event.registered}/{event.capacity || '--'} inscritos
                    </span>
                    {showCommunicationsMeta ? (
                      <span>
                        <BsMegaphone />
                        {event.communicationsCount} comunicaciones
                      </span>
                    ) : null}
                  </div>

                  <div className="evt-card-chips">
                    {event.segments.slice(0, 3).map((segment) => (
                      <span key={segment}>{segment}</span>
                    ))}
                    {!event.segments.length ? <span>Sin segmentos</span> : null}
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
                      Comunicar
                    </button>
                    ) : null}
                    {showPrimaryAction ? (
                      <button
                        type="button"
                        className="evt-btn evt-btn--primary"
                        onClick={() => onEditEvent(event)}
                      >
                        <BsPencil />
                        {primaryActionLabel}
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
          hint={emptyHint}
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
            Anterior
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
            Siguiente
          </button>
        </div>
      </div>
    </>
  );
}
