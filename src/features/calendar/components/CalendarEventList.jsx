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
}) {
  const { t, language } = useLanguage();
  const title = formatSelectedDate(selectedDate, language);
  const isPastDate = selectedDate < today;
  const canManage = !isPastDate;
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

      {hasEvents && events.length >= 2 && canManage && (
        <button type="button" className="cal-delete-day-btn" onClick={onDeleteAll}>
          {t('calendar.actions.deleteAll')}
        </button>
      )}

      {hasEvents ? (
        <div className="cal-event-list">
          {events.map((event) => (
            <CalendarEventCard
              key={event.id}
              event={event}
              canManage={canManage}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
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
