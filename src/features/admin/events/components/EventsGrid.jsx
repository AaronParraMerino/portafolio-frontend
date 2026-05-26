import {
  BsCalendarEvent,
  BsGeoAlt,
  BsMegaphone,
  BsPeople,
  BsPencil,
  BsThreeDots,
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
}) {
  return (
    <>
      {events.length > 0 ? (
        <div className="evt-grid">
          {events.map((event) => {
            const statusMeta = getEventStatusMeta(event.status);
            const typeMeta = getEventTypeMeta(event.type);

            return (
              <article key={event.id || event.title} className="evt-card">
                <div className={`evt-card-accent evt-card-accent--${statusMeta.tone}`} />
                <div className="evt-card-body">
                  <div className="evt-card-top">
                    <div className="evt-card-badges">
                      <span className="evt-type-badge">{typeMeta.label}</span>
                      <span className={`evt-status-badge evt-status-badge--${statusMeta.tone}`}>
                        <span />
                        {statusMeta.label}
                      </span>
                    </div>
                    <button type="button" className="evt-icon-btn evt-icon-btn--sm" title="Mas opciones" aria-label="Mas opciones">
                      <BsThreeDots />
                    </button>
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
                    <span>
                      <BsMegaphone />
                      {event.communicationsCount} comunicaciones
                    </span>
                  </div>

                  <div className="evt-card-chips">
                    {event.segments.slice(0, 3).map((segment) => (
                      <span key={segment}>{segment}</span>
                    ))}
                    {!event.segments.length ? <span>Sin segmentos</span> : null}
                  </div>
                </div>

                <div className="evt-card-actions">
                  <button
                    type="button"
                    className="evt-btn evt-btn--ghost"
                    onClick={() => onCommunicate(event)}
                  >
                    <BsMegaphone />
                    Comunicar
                  </button>
                  <button
                    type="button"
                    className="evt-btn evt-btn--primary"
                    onClick={() => onEditEvent(event)}
                  >
                    <BsPencil />
                    Editar
                  </button>
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
          hint="Las estadisticas no navegan; usa los botones del panel para crear o comunicar eventos."
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
