import { useRef } from 'react';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import EventCard from './EventCard';
import './eventsHome.css';

export default function EventsCarousel({
  events = [],
  showAllPath = '',
  onRegister,
  onViewDetails,
  registeringId = null,
}) {
  const trackRef = useRef(null);

  if (!events.length) return null;

  const scrollBy = (direction) => {
    const node = trackRef.current;
    if (!node) return;

    node.scrollBy({
      left: direction * Math.max(280, node.clientWidth * 0.78),
      behavior: 'smooth',
    });
  };

  return (
    <div className="evh-carousel">
      <div className="evh-carousel-head">
        <h3>Mas eventos</h3>
        <div className="evh-carousel-head-actions">
          {showAllPath && <Link to={showAllPath}>Ver todos</Link>}
          <div className="evh-carousel-controls">
            <button type="button" onClick={() => scrollBy(-1)} aria-label="Ver eventos anteriores">
              <BsChevronLeft />
            </button>
            <button type="button" onClick={() => scrollBy(1)} aria-label="Ver mas eventos">
              <BsChevronRight />
            </button>
          </div>
        </div>
      </div>

      <div className="evh-carousel-track" ref={trackRef}>
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onRegister={onRegister}
            onViewDetails={onViewDetails}
            registering={String(registeringId || '') === String(event.id)}
            containImage
            className="evh-carousel-item"
          />
        ))}
      </div>
    </div>
  );
}
