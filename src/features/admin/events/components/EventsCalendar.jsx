import { useMemo, useState } from 'react';
import {
  BsCalendar3,
  BsChevronLeft,
  BsChevronRight,
  BsClock,
  BsGeoAlt,
  BsX,
} from 'react-icons/bs';
import {
  getEventStatusMeta,
  getEventTypeMeta,
} from '../services/eventsService';

const WEEK_DAYS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
const MONTH_FORMATTER = new Intl.DateTimeFormat('es-BO', { month: 'long', year: 'numeric' });
const DAY_TITLE_FORMATTER = new Intl.DateTimeFormat('es-BO', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const TIME_FORMATTER = new Intl.DateTimeFormat('es-BO', {
  hour: '2-digit',
  minute: '2-digit',
});

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
  const [monthDate, setMonthDate] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState(null);
  const todayKey = toDateKey(new Date());

  const eventsByDay = useMemo(() => {
    const grouped = new Map();

    sortEventsByDate(events).forEach((event) => {
      const parsedDate = parseEventDate(event);
      if (!parsedDate) return;

      const key = toDateKey(parsedDate);
      const current = grouped.get(key) || [];
      grouped.set(key, [...current, { ...event, calendarDate: parsedDate }]);
    });

    return grouped;
  }, [events]);

  const days = useMemo(() => buildCalendarDays(monthDate), [monthDate]);
  const selectedEvents = selectedDay ? eventsByDay.get(selectedDay.key) || [] : [];
  const currentMonthLabel = MONTH_FORMATTER.format(monthDate);

  return (
    <div className="evt-view-body">
      <section className="evt-sheet evt-calendar-shell">
        <div className="evt-calendar-head">
          <div className="evt-view-toolbar-copy">
            <span className="evt-sheet-kicker">Calendario</span>
            <h2 className="evt-sheet-title">Agenda mensual</h2>
          </div>

          <div className="evt-calendar-controls">
            <button
              type="button"
              className="evt-icon-btn"
              onClick={() => setMonthDate((current) => addMonths(current, -1))}
              aria-label="Mes anterior"
            >
              <BsChevronLeft />
            </button>
            <strong>{currentMonthLabel}</strong>
            <button
              type="button"
              className="evt-icon-btn"
              onClick={() => setMonthDate((current) => addMonths(current, 1))}
              aria-label="Mes siguiente"
            >
              <BsChevronRight />
            </button>
            <button
              type="button"
              className="evt-context-btn evt-context-btn--secondary"
              onClick={() => setMonthDate(startOfMonth(new Date()))}
            >
              <BsCalendar3 />
              Hoy
            </button>
          </div>
        </div>

        <div className="evt-calendar-grid" role="grid" aria-label="Calendario de eventos">
          {WEEK_DAYS.map((day) => (
            <div key={day} className="evt-calendar-weekday">{day}</div>
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
                    const statusMeta = getEventStatusMeta(event.status);

                    return (
                      <span key={event.id || `${event.title}-${key}`} className={`evt-calendar-pill evt-calendar-pill--${statusMeta.tone}`}>
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
          <div className="evt-calendar-modal" role="dialog" aria-modal="true" aria-label="Eventos del dia">
            <div className="evt-modal-head">
              <span className="evt-modal-icon">
                <BsCalendar3 />
              </span>
              <div className="evt-modal-copy">
                <strong>{DAY_TITLE_FORMATTER.format(selectedDay.date)}</strong>
                <span>{selectedEvents.length ? `${selectedEvents.length} eventos` : 'Sin eventos'}</span>
              </div>
              <button type="button" className="evt-modal-close" onClick={() => setSelectedDay(null)} aria-label="Cerrar modal">
                <BsX />
              </button>
            </div>

            <div className="evt-calendar-modal-body">
              {selectedEvents.length ? selectedEvents.map((event) => {
                const typeMeta = getEventTypeMeta(event.type);
                const statusMeta = getEventStatusMeta(event.status);
                const eventDate = parseEventDate(event);

                return (
                  <article key={event.id || event.title} className="evt-calendar-event-card">
                    <div className={`evt-card-accent evt-card-accent--${statusMeta.tone}`} />
                    <div className="evt-calendar-event-body">
                      <div className="evt-card-badges">
                        <span className={`evt-type-badge evt-type-badge--${typeMeta.tone || 'primary'}`}>
                          {typeMeta.label}
                        </span>
                        <span className={`evt-status-badge evt-status-badge--${statusMeta.tone}`}>
                          <span />
                          {statusMeta.label}
                        </span>
                      </div>
                      <h3 className="evt-card-title">{event.title}</h3>
                      <p className="evt-card-desc">{event.description}</p>
                      <div className="evt-mini-meta">
                        <span>
                          <BsClock />
                          {eventDate ? TIME_FORMATTER.format(eventDate) : 'Sin hora'}
                        </span>
                        <span>
                          <BsGeoAlt />
                          {event.location}
                        </span>
                      </div>
                    </div>
                    {showActions ? (
                      <div className="evt-card-actions">
                        <button type="button" className="evt-btn evt-btn--ghost" onClick={() => onCommunicate(event)}>
                          Comunicar
                        </button>
                        <button type="button" className="evt-btn evt-btn--primary" onClick={() => onEditEvent(event)}>
                          Editar
                        </button>
                      </div>
                    ) : null}
                  </article>
                );
              }) : (
                <div className="evt-calendar-empty">
                  <BsCalendar3 />
                  <strong>Sin eventos para este dia</strong>
                  <p>Selecciona otro dia o navega entre meses para revisar la agenda.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
