const TYPE_CLASS = {
  Personal: 'personal',
  Académico: 'academic',
  Trabajo: 'work',
  Reunión: 'meeting',
  Entrega: 'delivery',
  Otro: 'other',
};

export default function CalendarEventCard({
  event,
  onEdit,
  onDelete,
  canManage = true,
}) {
  const typeClass = TYPE_CLASS[event.tipo] || 'other';

  return (
    <article className={`cal-event-card ${typeClass}${canManage ? '' : ' locked'}`}>
      <strong>{event.titulo}</strong>

      <span className="cal-event-time">
        {event.hora} · {event.tipo}
      </span>

      {event.descripcion && <p className="cal-event-desc">{event.descripcion}</p>}

      {canManage && (
        <div className="cal-event-actions">
          <button type="button" className="edit" onClick={() => onEdit(event)}>
            Editar
          </button>
          <button type="button" className="delete" onClick={() => onDelete(event)}>
            Eliminar
          </button>
        </div>
      )}
    </article>
  );
}
