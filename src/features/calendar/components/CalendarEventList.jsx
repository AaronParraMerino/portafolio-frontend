import CalendarEventCard from './CalendarEventCard';

export default function CalendarEventList({
  selectedDate,
  today,
  events,
  onCreate,
  onEdit,
  onDelete,
  onDeleteAll,
}) {
  const title = formatSelectedDate(selectedDate);
  const isPastDate = selectedDate < today;
  const canManage = !isPastDate;
  const hasEvents = events.length > 0;

  return (
    <section className="cal-events-section">
      <div className="cal-events-head">
        <div>
          <h3>Eventos del {title}</h3>
          <span className="cal-events-date">{formatNumericDate(selectedDate)}</span>
        </div>
        <span className={`cal-event-count${isPastDate && hasEvents ? ' history' : ''}`}>
          {events.length} {events.length === 1 ? 'evento' : 'eventos'}
        </span>
      </div>


      {hasEvents && events.length >= 2 && canManage && (
        <button type="button" className="cal-delete-day-btn" onClick={onDeleteAll}>
          Eliminar todos
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
          <strong>No hay eventos registrados para esta fecha.</strong>
          {canManage ? (
            <>
              <p>Puedes crear un nuevo evento usando la fecha seleccionada.</p>
              <button type="button" className="cal-empty-create" onClick={onCreate}>
                Crear evento para este día
              </button>
            </>
          ) : (
            <p>No se pueden crear eventos en fechas pasadas.</p>
          )}
        </div>
      )}
    </section>
  );
}

function formatSelectedDate(value) {
  if (!value) return '';
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
  });
}

function formatNumericDate(value) {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}
