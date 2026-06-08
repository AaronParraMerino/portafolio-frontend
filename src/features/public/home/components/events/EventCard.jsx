import { BsInfoCircle } from 'react-icons/bs';
import EventActionButton from './EventActionButton';
import EventMedia from './EventMedia';
import {
  cx,
  formatEventDate,
  getCapacityLabel,
  getShortDescription,
} from './eventUiHelpers';
import './eventsHome.css';

export default function EventCard({
  event,
  onRegister,
  onViewDetails,
  registering = false,
  containImage = false,
  className = '',
}) {
  return (
    <article className={cx('evh-card', containImage && 'evh-card-contain-image', className)}>
      <button
        type="button"
        className="evh-card-media-button"
        onClick={() => onViewDetails?.(event)}
        aria-label={`Ver detalles de ${event.title}`}
      >
        <EventMedia event={event} className="evh-card-media" containImage={containImage}>
          <span className="evh-badge">{event.typeLabel}</span>
          <span className={cx('evh-status', event.soldOut && 'is-soldout')}>
            {event.soldOut ? 'Agotado' : event.status}
          </span>
        </EventMedia>
      </button>

      <div className="evh-card-body">
        <div className="evh-card-title-row">
          <h3>{event.title}</h3>
        </div>

        <p className="evh-card-summary">{getShortDescription(event.description, 92)}</p>

        <div className="evh-card-meta">
          <span>{formatEventDate(event.startsAt, { withYear: false })}</span>
          <span>{getCapacityLabel(event)}</span>
        </div>

        <div className="evh-card-actions">
          <button
            type="button"
            className="evh-ghost-button"
            onClick={() => onViewDetails?.(event)}
          >
            <BsInfoCircle />
            Ver detalles
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
