import { useMemo, useState } from 'react';
import {
  BsCalendar3,
  BsChevronLeft,
  BsChevronRight,
  BsClock,
  BsGeoAlt,
  BsMegaphone,
  BsPencil,
  BsX,
} from 'react-icons/bs';
import { useLanguage } from '../../../../core/i18n';
import {
  EVENT_WEEK_DAYS,
  formatAdminEventActiveDays,
  formatAdminEventDateRange,
  formatAdminEventTimeRange,
  getEventStatusMeta,
  getEventTypeMeta,
} from '../services/eventsService';

const WEEK_DAY_KEYS = [
  'calendar.week.monday.short',
  'calendar.week.tuesday.short',
  'calendar.week.wednesday.short',
  'calendar.week.thursday.short',
  'calendar.week.friday.short',
  'calendar.week.saturday.short',
  'calendar.week.sunday.short',
];

function getLocale(language) {
  if (language === 'en') return 'en-US';
  if (language === 'pt') return 'pt-BR';
  return 'es-BO';
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function toDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function parseEventDate(event) {
  const candidate = event.startsAt || event.date || event.raw?.fecha_inicio || event.raw?.fecha || '';
  if (!candidate || candidate === '--') return null;

  const parsed = new Date(candidate);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const normalized = new Date(`${candidate}T00:00:00`);
  return Number.isNaN(normalized.getTime()) ? null : normalized;
}

function parseEventEndDate(event) {
  const candidate = event.endsAt || event.raw?.fecha_fin || '';
  if (!candidate || candidate === '--') return parseEventDate(event);

  const parsed = new Date(candidate);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const normalized = new Date(`${candidate}T00:00:00`);
  return Number.isNaN(normalized.getTime()) ? parseEventDate(event) : normalized;
}

function normalizeDay(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const DAY_BY_INDEX = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
const EVENT_COLOR_CLASSES = ['mint', 'amber', 'sky', 'lavender', 'rose', 'lime', 'cyan'];

function eventColorClass(event) {
  const text = String(event.id || event.title || '');
  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash + text.charCodeAt(index) * (index + 1)) % EVENT_COLOR_CLASSES.length;
  }

  return `evt-calendar-pill--pastel-${EVENT_COLOR_CLASSES[hash]}`;
}

function activeDaysForEvent(event) {
  const activeDays = Array.isArray(event.activeDays || event.dias_activos)
    ? (event.activeDays || event.dias_activos)
    : [];
  const normalized = activeDays.map(normalizeDay).filter((day) => EVENT_WEEK_DAYS.includes(day));

  return normalized.length ? Array.from(new Set(normalized)) : EVENT_WEEK_DAYS;
}

function buildCalendarDays(monthDate) {
  const firstDay = startOfMonth(monthDate);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });
}

function sortEventsByDate(events) {
  return [...events].sort((first, second) => {
    const firstDate = parseEventDate(first)?.getTime() ?? 0;
    const secondDate = parseEventDate(second)?.getTime() ?? 0;
    return firstDate - secondDate;
  });
}

export default function EventsCalendar({
  events,
  onEditEvent,
  onCommunicate,
  showActions = true,
}) {
  const { t, language } = useLanguage();
  const locale = getLocale(language);
  const monthFormatter = useMemo(() => new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }), [locale]);
  const dayTitleFormatter = useMemo(() => new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }), [locale]);
  const [monthDate, setMonthDate] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState(null);
  const todayKey = toDateKey(new Date());

  const eventsByDay = useMemo(() => {
    const grouped = new Map();

    sortEventsByDate(events).forEach((event) => {
      const startDate = parseEventDate(event);
      const endDate = parseEventEndDate(event);
      if (!startDate || !endDate || endDate < startDate) return;

      const activeDays = activeDaysForEvent(event);
      const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const limit = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      let iterations = 0;

      while (cursor <= limit && iterations < 370) {
        const dayName = DAY_BY_INDEX[cursor.getDay()];

        if (activeDays.includes(dayName)) {
          const key = toDateKey(cursor);
          const current = grouped.get(key) || [];
          grouped.set(key, [...current, {
            ...event,
            calendarDate: new Date(cursor),
            calendarColorClass: eventColorClass(event),
          }]);
        }

        cursor.setDate(cursor.getDate() + 1);
        iterations += 1;
      }
    });

    return grouped;
  }, [events]);

  const days = useMemo(() => buildCalendarDays(monthDate), [monthDate]);
  const selectedEvents = selectedDay ? eventsByDay.get(selectedDay.key) || [] : [];
  const currentMonthLabel = monthFormatter.format(monthDate);

  return (
    <div className="evt-view-body">
      <section className="evt-sheet evt-calendar-shell">
        <div className="evt-calendar-head">
          <div className="evt-view-toolbar-copy">
            <span className="evt-sheet-kicker">{t('adminEvents.dashboard.tab.calendar')}</span>
            <h2 className="evt-sheet-title">{t('adminEvents.calendar.title')}</h2>
          </div>

          <div className="evt-calendar-controls">
            <button
              type="button"
              className="evt-icon-btn"
              onClick={() => setMonthDate((current) => addMonths(current, -1))}
              aria-label={t('adminEvents.calendar.prev')}
            >
              <BsChevronLeft />
            </button>
            <strong>{currentMonthLabel}</strong>
            <button
              type="button"
              className="evt-icon-btn"
              onClick={() => setMonthDate((current) => addMonths(current, 1))}
              aria-label={t('adminEvents.calendar.next')}
            >
              <BsChevronRight />
            </button>
            <button
              type="button"
              className="evt-context-btn evt-context-btn--secondary"
              onClick={() => setMonthDate(startOfMonth(new Date()))}
            >
              <BsCalendar3 />
              {t('adminEvents.calendar.today')}
            </button>
          </div>
        </div>

        <div className="evt-calendar-grid" role="grid" aria-label={t('adminEvents.calendar.title')}>
          {WEEK_DAY_KEYS.map((dayKey) => (
            <div key={dayKey} className="evt-calendar-weekday">{t(dayKey)}</div>
          ))}

          {days.map((date) => {
            const key = toDateKey(date);
            const dayEvents = eventsByDay.get(key) || [];
            const visibleEvents = dayEvents.slice(0, 3);
            const hiddenCount = Math.max(dayEvents.length - visibleEvents.length, 0);
            const isOutsideMonth = date.getMonth() !== monthDate.getMonth();
            const isToday = key === todayKey;

            return (
              <button
                key={key}
                type="button"
                className={[
                  'evt-calendar-day',
                  isOutsideMonth ? 'is-outside' : '',
                  isToday ? 'is-today' : '',
                  dayEvents.length ? 'has-events' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => setSelectedDay({ key, date })}
              >
                <span className="evt-calendar-day-number">{date.getDate()}</span>

                <span className="evt-calendar-day-events">
                  {visibleEvents.map((event) => {
                    return (
                      <span key={`${event.id || event.title}-${key}`} className={`evt-calendar-pill ${event.calendarColorClass || eventColorClass(event)}`}>
                        {event.title}
                      </span>
                    );
                  })}
                  {hiddenCount > 0 ? (
                    <span className="evt-calendar-more">+{hiddenCount} mas</span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {selectedDay ? (
        <div className="evt-modal-backdrop" role="presentation">
          <div className="evt-calendar-modal" role="dialog" aria-modal="true" aria-label={t('adminEvents.calendar.dayEvents')}>
            <div className="evt-modal-head">
              <span className="evt-modal-icon">
                <BsCalendar3 />
              </span>
              <div className="evt-modal-copy">
                <strong>{dayTitleFormatter.format(selectedDay.date)}</strong>
                <span>{selectedEvents.length ? t('adminEvents.calendar.count', { count: selectedEvents.length }) : t('adminEvents.calendar.empty')}</span>
              </div>
              <button type="button" className="evt-modal-close" onClick={() => setSelectedDay(null)} aria-label={t('adminEvents.calendar.close')}>
                <BsX />
              </button>
            </div>

            <div className="evt-calendar-modal-body">
              {selectedEvents.length ? selectedEvents.map((event) => {
                const typeMeta = getEventTypeMeta(event.type);
                const statusMeta = getEventStatusMeta(event.status);
                const dateRange = formatAdminEventDateRange(event, language);
                const timeRange = formatAdminEventTimeRange(event, language);
                const activeDays = formatAdminEventActiveDays(event, language);

                return (
                  <article key={event.id || event.title} className="evt-calendar-event-card">
                    <div className={`evt-card-accent evt-card-accent--${statusMeta.tone}`} />
                    <div className="evt-calendar-event-body">
                      <div className="evt-card-badges">
                        <span className={`evt-type-badge evt-type-badge--${typeMeta.tone || 'primary'}`}>
                          {t(`adminEvents.type.${event.type}`) || typeMeta.label}
                        </span>
                        <span className={`evt-status-badge evt-status-badge--${statusMeta.tone}`}>
                          <span />
                          {t(`adminEvents.status.${event.status}`) || statusMeta.label}
                        </span>
                      </div>
                      <h3 className="evt-card-title">{event.title}</h3>
                      <p className="evt-card-desc">{event.description}</p>
                      <div className="evt-mini-meta">
                        <span>
                          <BsCalendar3 />
                          {dateRange}
                        </span>
                        {timeRange ? (
                        <span>
                          <BsClock />
                          {timeRange}
                        </span>
                        ) : null}
                        {activeDays ? (
                        <span>
                          <BsCalendar3 />
                          {activeDays}
                        </span>
                        ) : null}
                        <span>
                          <BsGeoAlt />
                          {event.location}
                        </span>
                      </div>
                    </div>
                    {showActions ? (
                      <div className="evt-card-actions">
                        <button type="button" className="evt-btn evt-btn--ghost" onClick={() => onCommunicate(event)}>
                          <BsMegaphone />
                          Comunicar
                        </button>
                        <button type="button" className="evt-btn evt-btn--primary" onClick={() => onEditEvent(event)}>
                          <BsPencil />
                          Editar
                        </button>
                      </div>
                    ) : null}
                  </article>
                );
              }) : (
                <div className="evt-calendar-empty">
                  <BsCalendar3 />
                  <strong>{t('adminEvents.calendar.emptyDay')}</strong>
                  <p>{t('adminEvents.calendar.emptyDayHint')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
