import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BsCalendarEvent, BsChevronLeft, BsChevronRight, BsClock, BsGeoAlt } from 'react-icons/bs';
import { useLanguage } from '../../../../../core/i18n';
import useHeroInputNavigation from '../../hooks/useHeroInputNavigation';
import EventActionButton from './EventActionButton';
import EventMedia from './EventMedia';
import {
  cx,
  formatActiveDays,
  formatEventDateRange,
  formatEventTimeRange,
  getCapacityLabel,
  getEventStatusLabel,
  getEventTypeLabel,
  getShortDescription,
  hasEventDetails,
} from './eventUiHelpers';
import './eventsHome.css';

export default function EventHeroBanner({
  events = [],
  autoAdvanceMs = 5000,
  onRegister,
  onViewDetails,
  registeringId = null,
}) {
  const { language, t } = useLanguage();
  const visibleEvents = useMemo(() => events.filter(Boolean).slice(0, 5), [events]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interactionKey, setInteractionKey] = useState(0);
  const touchStartX = useRef(null);
  const activeEvent = visibleEvents[activeIndex] || visibleEvents[0];

  const move = useCallback((step) => {
    setActiveIndex((index) => (
      (index + step + visibleEvents.length) % visibleEvents.length
    ));
    setInteractionKey((key) => key + 1);
  }, [visibleEvents.length]);

  const heroInputNavigation = useHeroInputNavigation({
    enabled: visibleEvents.length > 1,
    onMove: move,
  });

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
  }, [autoAdvanceMs, interactionKey, paused, visibleEvents.length]);

  const handleTouchStart = (event) => {
    if (!window.matchMedia('(max-width: 760px)').matches) return;
    touchStartX.current = event.touches?.[0]?.clientX ?? null;
    setPaused(true);
  };

  const handleTouchEnd = (event) => {
    if (!window.matchMedia('(max-width: 760px)').matches) return;
    const endX = event.changedTouches?.[0]?.clientX;
    const startX = touchStartX.current;

    if (typeof startX === 'number' && typeof endX === 'number') {
      const distance = endX - startX;

      if (Math.abs(distance) >= 50) {
        move(distance > 0 ? -1 : 1);
      }
    }

    touchStartX.current = null;
    setInteractionKey((key) => key + 1);
    setPaused(false);
  };

  const openDetails = () => {
    if (hasEventDetails(activeEvent)) {
      onViewDetails?.(activeEvent);
    }
  };

  if (!activeEvent) return null;

  const dateRange = formatEventDateRange(activeEvent.startsAt, activeEvent.endsAt, language, t);
  const timeRange = formatEventTimeRange(activeEvent.startsAt, activeEvent.endsAt, language);
  const activeDays = formatActiveDays(activeEvent.activeDays, language);

  return (
    <section
      className="evh-hero"
      {...heroInputNavigation}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <EventMedia event={activeEvent} className="evh-hero-media" containImage>
        <button
          type="button"
          className="evh-hero-hitbox"
          onClick={openDetails}
          aria-label={t('home.events.detailsAria', { title: activeEvent.title })}
        />

        <div className="evh-hero-content">
          <div className="evh-hero-topline">
            <span className="evh-badge">{getEventTypeLabel(activeEvent, t)}</span>
          </div>

          <h3>{activeEvent.title}</h3>

          <div className="evh-hero-middle">
            <p>{getShortDescription(activeEvent.description, 100)}</p>

            <div className="evh-hero-extra">
              <span className="evh-hero-mobile-capacity">
                {getCapacityLabel(activeEvent, t)}
              </span>
              <span>
                <BsCalendarEvent />
                {dateRange}
              </span>
              {timeRange && (
                <span>
                  <BsClock />
                  {timeRange}
                </span>
              )}
              {activeDays && (
                <span>
                  <BsCalendarEvent />
                  {activeDays}
                </span>
              )}
              {activeEvent.location && (
                <span>
                  <BsGeoAlt />
                  {activeEvent.location}
                </span>
              )}
            </div>
          </div>

          <div className="evh-hero-bottom">
            {activeEvent.authorName && (
              <span className="evh-hero-author">{t('home.events.by', { author: activeEvent.authorName })}</span>
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
                  {t('home.events.details')}
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
          {getEventStatusLabel(activeEvent, t)}
        </span>
        <span className="evh-hero-capacity">{getCapacityLabel(activeEvent, t)}</span>

      </EventMedia>

      {visibleEvents.length > 1 && (
        <>
          <button
            type="button"
            className="evh-hero-nav evh-hero-prev"
            onClick={() => move(-1)}
            aria-label={t('home.events.previous')}
          >
            <BsChevronLeft />
          </button>
          <button
            type="button"
            className="evh-hero-nav evh-hero-next"
            onClick={() => move(1)}
            aria-label={t('home.events.next')}
          >
            <BsChevronRight />
          </button>
        </>
      )}

      {visibleEvents.length > 1 && (
        <div className="evh-hero-dots" aria-label={t('home.events.featuredAria')}>
          {visibleEvents.map((event, index) => (
            <button
              key={event.id}
              type="button"
              className={cx('evh-dot', index === activeIndex && 'active')}
              onClick={() => {
                setActiveIndex(index);
                setInteractionKey((key) => key + 1);
              }}
              aria-label={t('home.events.showAria', { title: event.title })}
            />
          ))}
        </div>
      )}
    </section>
  );
}
