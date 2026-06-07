import { useEffect, useMemo, useState } from 'react';
import { BsCalendarEvent, BsChevronLeft, BsChevronRight, BsGeoAlt } from 'react-icons/bs';
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

export default function EventHeroBanner({
  events = [],
  autoAdvanceMs = 9000,
  onRegister,
  onViewDetails,
  registeringId = null,
}) {
  const visibleEvents = useMemo(() => events.filter(Boolean).slice(0, 5), [events]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const activeEvent = visibleEvents[activeIndex] || visibleEvents[0];

  useEffect(() => {
    if (activeIndex > visibleEvents.length - 1) {
      setActiveIndex(0);
    }
  }, [activeIndex, visibleEvents.length]);

  useEffect(() => {
    if (paused || visibleEvents.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % visibleEvents.length);
    }, autoAdvanceMs);

    return () => window.clearInterval(timer);
  }, [autoAdvanceMs, paused, visibleEvents.length]);

  if (!activeEvent) return null;

  const move = (step) => {
    setActiveIndex((index) => (
      (index + step + visibleEvents.length) % visibleEvents.length
    ));
  };

  const openDetails = () => {
    if (hasEventDetails(activeEvent)) {
      onViewDetails?.(activeEvent);
    }
  };

  return (
    <section
      className="evh-hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <EventMedia event={activeEvent} className="evh-hero-media" containImage>
        <button
          type="button"
          className="evh-hero-hitbox"
          onClick={openDetails}
          aria-label={`Ver detalles de ${activeEvent.title}`}
        />

        <div className="evh-hero-content">
          <div className="evh-hero-topline">
            <span className="evh-badge">{activeEvent.typeLabel}</span>
          </div>

          <h3>{activeEvent.title}</h3>

          <div className="evh-hero-middle">
            <p>{getShortDescription(activeEvent.description, 100)}</p>

            <div className="evh-hero-extra">
              <span className="evh-hero-mobile-capacity">
                {getCapacityLabel(activeEvent)}
              </span>
              <span>
                <BsCalendarEvent />
                {formatEventDate(activeEvent.startsAt)}
              </span>
              {activeEvent.location && (
                <span>
                  <BsGeoAlt />
                  {activeEvent.location}
                </span>
              )}
              {activeEvent.endsAt && (
                <span>
                  <BsCalendarEvent />
                  Finaliza {formatEventDate(activeEvent.endsAt)}
                </span>
              )}
            </div>
          </div>

          <div className="evh-hero-bottom">
            {activeEvent.authorName && (
              <span className="evh-hero-author">Por {activeEvent.authorName}</span>
            )}

            <div className="evh-hero-actions">
              {hasEventDetails(activeEvent) && (
                <button
                  type="button"
                  className="evh-secondary-action"
                  onClick={(event) => {
                    event.stopPropagation();
                    onViewDetails?.(activeEvent);
                  }}
                >
                  Ver detalles
                </button>
              )}
              <EventActionButton
                event={activeEvent}
                loading={String(registeringId || '') === String(activeEvent.id)}
                onRegister={onRegister}
              />
            </div>
          </div>
        </div>

        <span className={cx('evh-hero-status', 'evh-status', activeEvent.soldOut && 'is-soldout')}>
          {activeEvent.soldOut ? 'Agotado' : activeEvent.status}
        </span>
        <span className="evh-hero-capacity">{getCapacityLabel(activeEvent)}</span>

        {visibleEvents.length > 1 && (
          <>
            <button
              type="button"
              className="evh-hero-nav evh-hero-prev"
              onClick={(event) => {
                event.stopPropagation();
                move(-1);
              }}
              aria-label="Evento anterior"
            >
              <BsChevronLeft />
            </button>
            <button
              type="button"
              className="evh-hero-nav evh-hero-next"
              onClick={(event) => {
                event.stopPropagation();
                move(1);
              }}
              aria-label="Siguiente evento"
            >
              <BsChevronRight />
            </button>
          </>
        )}
      </EventMedia>

      {visibleEvents.length > 1 && (
        <div className="evh-hero-dots" aria-label="Eventos destacados">
          {visibleEvents.map((event, index) => (
            <button
              key={event.id}
              type="button"
              className={cx('evh-dot', index === activeIndex && 'active')}
              onClick={() => setActiveIndex(index)}
              aria-label={`Mostrar ${event.title}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
