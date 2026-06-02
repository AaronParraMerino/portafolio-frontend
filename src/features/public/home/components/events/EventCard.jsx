import { useState } from 'react';
import { BsChevronDown, BsChevronUp, BsGeoAlt, BsInfoCircle } from 'react-icons/bs';
import EventActionButton from './EventActionButton';
import EventMedia from './EventMedia';
import {
  cx,
  formatEventDate,
  getCapacityLabel,
  getShortDescription,
  hasEventDetails,
} from './eventUiHelpers';
import './eventsHome.css';

export default function EventCard({
  event,
  onRegister,
  onViewDetails,
  registering = false,
  className = '',
}) {
  const [expanded, setExpanded] = useState(false);
  const showDetails = hasEventDetails(event);

  return (
    <article className={cx('evh-card', className)}>
      <button
        type="button"
        className="evh-card-media-button"
        onClick={() => onViewDetails?.(event)}
        aria-label={`Ver detalles de ${event.title}`}
      >
        <EventMedia event={event} className="evh-card-media">
          <span className="evh-badge">{event.typeLabel}</span>
          <span className={cx('evh-status', event.soldOut && 'is-soldout')}>
            {event.soldOut ? 'Agotado' : event.status}
          </span>
        </EventMedia>
      </button>

      <div className="evh-card-body">
        <div className="evh-card-title-row">
          <h3>{event.title}</h3>
          {showDetails && (
            <button
              type="button"
              className="evh-icon-button"
              onClick={() => onViewDetails?.(event)}
              aria-label={`Abrir detalle de ${event.title}`}
              title="Ver detalles"
            >
              <BsInfoCircle />
            </button>
          )}
        </div>

        <p className="evh-card-summary">{getShortDescription(event.description, 92)}</p>

        <div className="evh-card-meta">
          <span>{formatEventDate(event.startsAt, { withYear: false })}</span>
          <span>{getCapacityLabel(event)}</span>
        </div>

        {expanded && (
          <div className="evh-card-details">
            {event.location && (
              <span>
                <BsGeoAlt /> {event.location}
              </span>
            )}
            {event.authorName && <span>Por {event.authorName}</span>}
            {event.endsAt && <span>Finaliza {formatEventDate(event.endsAt)}</span>}
          </div>
        )}

        <div className="evh-card-actions">
          <button
            type="button"
            className="evh-ghost-button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
          >
            {expanded ? <BsChevronUp /> : <BsChevronDown />}
            {expanded ? 'Menos' : 'Detalles'}
          </button>

          <EventActionButton
            event={event}
            loading={registering}
            onRegister={onRegister}
          />
        </div>
      </div>
    </article>
  );
}
