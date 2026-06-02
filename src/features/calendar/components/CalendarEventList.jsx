import { useMemo } from 'react';
import { useLanguage } from '../../../core/i18n';
import CalendarEventCard from './CalendarEventCard';

const LOCALE_BY_LANGUAGE = {
  es: 'es-ES',
  en: 'en-US',
  pt: 'pt-BR',
};

export default function CalendarEventList({
  selectedDate,
  today,
  events,
  onCreate,
  onEdit,
  onDelete,
  onDeleteAll,
  onUnsubscribe,
}) {
  const { t, language } = useLanguage();
  const title = formatSelectedDate(selectedDate, language);
  const isPastDate = selectedDate < today;
  const canManage = !isPastDate;

  const personalEvents = useMemo(() => (
    events.filter((event) => event.origen !== 'inscrito')
  ), [events]);

  const subscribedEvents = useMemo(() => (
    events.filter((event) => event.origen === 'inscrito')
  ), [events]);

  const hasEvents = events.length > 0;
  const countLabel = events.length === 1
    ? t('calendar.events.countSingular')
    : t('calendar.events.countPlural');

  return (
    <section className="cal-events-section">
      <div className="cal-events-head">
        <div>
          <h3>{t('calendar.events.title', { date: title })}</h3>
          <span className="cal-events-date">{formatNumericDate(selectedDate)}</span>
        </div>
        <span className={`cal-event-count${isPastDate && hasEvents ? ' history' : ''}`}>
          {events.length} {countLabel}
        </span>
      </div>

      {personalEvents.length >= 2 && canManage && (
        <button type="button" className="cal-delete-day-btn" onClick={onDeleteAll}>
          {t('calendar.actions.deleteAll')}
        </button>
      )}

      {hasEvents ? (
        <div className="cal-event-list">
          <EventGroup
            title={t('calendar.personal.title')}
            emptyText={t('calendar.personal.empty')}
            events={personalEvents}
            titleClass="personal-title"
            canManage={canManage}
            onEdit={onEdit}
            onDelete={onDelete}
            onUnsubscribe={onUnsubscribe}
          />

          <EventGroup
            title={t('calendar.subscribed.title')}
            emptyText={t('calendar.subscribed.empty')}
            events={subscribedEvents}
            titleClass="subscribed-title"
            canManage={canManage}
            onEdit={onEdit}
            onDelete={onDelete}
            onUnsubscribe={onUnsubscribe}
          />
        </div>
      ) : (
        <div className="cal-empty-state">
          <strong>{t('calendar.empty.title')}</strong>
          {canManage ? (
            <>
              <p>{t('calendar.empty.createHelp')}</p>
              <button type="button" className="cal-empty-create" onClick={onCreate}>
                {t('calendar.empty.createButton')}
              </button>
            </>
          ) : (
            <p>{t('calendar.empty.pastHelp')}</p>
          )}
        </div>
      )}
    </section>
  );
}

function EventGroup({
  title,
  emptyText,
  events,
  titleClass,
  canManage,
  onEdit,
  onDelete,
  onUnsubscribe,
}) {
  return (
    <div className="cal-event-group">
      <div className={`cal-event-group-title ${titleClass || ''}`}>
        {title}
      </div>

      {events.length ? (
        events.map((event) => (
          <CalendarEventCard
            key={event.id}
            event={event}
            canManage={canManage}
            onEdit={onEdit}
            onDelete={onDelete}
            onUnsubscribe={onUnsubscribe}
          />
        ))
      ) : (
        <div className={`cal-empty-mini ${titleClass === 'subscribed-title' ? 'subscribed' : ''}`}>
          {emptyText}
        </div>
      )}
    </div>
  );
}

function formatSelectedDate(value, language) {
  if (!value) return '';
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(LOCALE_BY_LANGUAGE[language] || 'es-ES', {
    day: 'numeric',
    month: 'long',
  });
}

function formatNumericDate(value) {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}
