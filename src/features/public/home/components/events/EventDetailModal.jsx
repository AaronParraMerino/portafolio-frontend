import { useEffect } from 'react';
import { BsCalendarEvent, BsGeoAlt, BsPeople, BsX } from 'react-icons/bs';
import EventActionButton from './EventActionButton';
import EventMedia from './EventMedia';
import {
  formatEventDate,
  getCapacityLabel,
  hasEventDetails,
} from './eventUiHelpers';
import './eventsHome.css';

export default function EventDetailModal({
  event,
  onClose,
  onRegister,
  registering = false,
}) {
  useEffect(() => {
    if (!event) return undefined;

    const handleKeyDown = (keyboardEvent) => {
      if (keyboardEvent.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [event, onClose]);

  if (!event || !hasEventDetails(event)) return null;

  return (
    <div className="evh-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="evh-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="evh-modal-title"
        onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}
      >
        <button type="button" className="evh-modal-close" onClick={onClose} aria-label="Cerrar detalle">
          <BsX />
        </button>

        <EventMedia event={event} className="evh-modal-media">
          <span className="evh-badge">{event.typeLabel}</span>
        </EventMedia>

        <div className="evh-modal-body">
          <div className="evh-modal-head">
            <div>
              <span className="evh-status">{event.soldOut ? 'Agotado' : event.status}</span>
              <h2 id="evh-modal-title">{event.title}</h2>
              {event.authorName && <p>Por {event.authorName}</p>}
            </div>
            <EventActionButton event={event} loading={registering} onRegister={onRegister} />
          </div>

          {event.description && <p className="evh-modal-description">{event.description}</p>}

          <div className="evh-modal-facts">
            <span>
              <BsCalendarEvent />
              Inicio: {formatEventDate(event.startsAt)}
            </span>
            {event.endsAt && (
              <span>
                <BsCalendarEvent />
                Fin: {formatEventDate(event.endsAt)}
              </span>
            )}
            {event.location && (
              <span>
                <BsGeoAlt />
                {event.location}
              </span>
            )}
            <span>
              <BsPeople />
              {getCapacityLabel(event)}
            </span>
          </div>

          {event.channels?.length > 0 && (
            <div className="evh-modal-channels">
              <strong>Canales</strong>
              <div>
                {event.channels.map((channel, index) => (
                  <span key={`${channel.id || channel.nombre || channel}-${index}`}>
                    {channel.nombre || channel.name || channel.tipo || channel}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
