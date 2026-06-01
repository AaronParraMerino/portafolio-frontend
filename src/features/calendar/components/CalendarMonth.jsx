import { useLanguage } from '../../../core/i18n';

const LOCALE_BY_LANGUAGE = {
  es: 'es-ES',
  en: 'en-US',
  pt: 'pt-BR',
};

function monthLabel(date, language) {
  return date.toLocaleDateString(LOCALE_BY_LANGUAGE[language] || 'es-ES', {
    month: 'long',
    year: 'numeric',
  });
}

export default function CalendarMonth({
  currentMonth,
  selectedDate,
  today,
  eventDates,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
}) {
  const { t, language } = useLanguage();
  const weekDays = [
    t('calendar.week.monday.short'),
    t('calendar.week.tuesday.short'),
    t('calendar.week.wednesday.short'),
    t('calendar.week.thursday.short'),
    t('calendar.week.friday.short'),
    t('calendar.week.saturday.short'),
    t('calendar.week.sunday.short'),
  ];

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const firstWeekDay = (firstDay.getDay() + 6) % 7;
  const startDate = new Date(year, month, 1 - firstWeekDay);

  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);

    const iso = toISODate(date);
    const isCurrentMonth = date.getMonth() === month;
    const isSelected = iso === selectedDate;
    const hasEvent = eventDates.has(iso);
    const isPast = iso < today;
    const isPastEvent = isPast && hasEvent;

    return {
      date,
      iso,
      day: date.getDate(),
      isCurrentMonth,
      isSelected,
      hasEvent,
      isPast,
      isPastEvent,
    };
  });

  return (
    <section className="cal-month-card" aria-label={t('calendar.month.aria')}>
      <div className="cal-month-head">
        <div>
          <div className="cal-month-title">{capitalize(monthLabel(currentMonth, language))}</div>
          <small>{t('calendar.month.help')}</small>
        </div>

        <div className="cal-month-actions">
          <button type="button" onClick={onPrevMonth} aria-label={t('calendar.month.prev')}>‹</button>
          <button type="button" onClick={onNextMonth} aria-label={t('calendar.month.next')}>›</button>
        </div>
      </div>

      <div className="cal-grid">
        {weekDays.map((day, index) => (
          <div className="cal-dow" key={`${day}-${index}`}>{day}</div>
        ))}

        {days.map((item) => {
          const className = [
            'cal-day',
            !item.isCurrentMonth ? 'other-month' : '',
            item.isSelected ? 'selected' : '',
            item.hasEvent ? 'has-event' : '',
            item.isPast ? 'past' : '',
            item.isPastEvent ? 'past-event' : '',
          ].filter(Boolean).join(' ');

          const dateText = formatDateDisplay(item.iso);
          const title = item.isPastEvent
            ? t('calendar.day.titlePastEvent', { date: dateText })
            : item.hasEvent
              ? t('calendar.day.titleHasEvent', { date: dateText })
              : item.isPast
                ? t('calendar.day.titlePastDate', { date: dateText })
                : t('calendar.day.titleSelect', { date: dateText });

          return (
            <button
              key={item.iso}
              type="button"
              className={className}
              onClick={() => onSelectDate(item.iso)}
              title={title}
            >
              {item.day}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function capitalize(value) {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDateDisplay(value) {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}
