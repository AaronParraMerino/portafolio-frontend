import { useLanguage } from '../../../core/i18n';

const TYPE_CLASS = {
  Personal: 'personal',
  Académico: 'academic',
  Trabajo: 'work',
  Reunión: 'meeting',
  Entrega: 'delivery',
};

const TYPE_LABEL_KEY = {
  Personal: 'calendar.type.personal',
  Académico: 'calendar.type.academic',
  Trabajo: 'calendar.type.work',
  Reunión: 'calendar.type.meeting',
  Entrega: 'calendar.type.delivery',
};

export default function CalendarEventCard({
  event,
  onEdit,
  onDelete,
  canManage = true,
}) {
  const { t } = useLanguage();
  const typeClass = TYPE_CLASS[event.tipo] || 'other';
  const typeLabel = t(TYPE_LABEL_KEY[event.tipo] || 'calendar.type.other');

  return (
    <article className={`cal-event-card ${typeClass}${canManage ? '' : ' locked'}`}>
      <strong>{event.titulo}</strong>

      <span className="cal-event-time">
        {event.hora} · {typeLabel}
      </span>

      {event.descripcion && <p className="cal-event-desc">{event.descripcion}</p>}

      {canManage && (
        <div className="cal-event-actions">
          <button type="button" className="edit" onClick={() => onEdit(event)}>
            {t('calendar.actions.edit')}
          </button>
          <button type="button" className="delete" onClick={() => onDelete(event)}>
            {t('calendar.actions.delete')}
          </button>
        </div>
      )}
    </article>
  );
}
