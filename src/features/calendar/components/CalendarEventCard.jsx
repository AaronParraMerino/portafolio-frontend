import { useLanguage } from '../../../core/i18n';

const TYPE_CLASS = {
  Personal: 'personal',
  Académico: 'academic',
  Trabajo: 'work',
  Reunión: 'meeting',
  Entrega: 'delivery',
  Inscrito: 'subscribed',
  Otro: 'other',
};

const TYPE_LABEL_KEY = {
  Personal: 'calendar.type.personal',
  Académico: 'calendar.type.academic',
  Trabajo: 'calendar.type.work',
  Reunión: 'calendar.type.meeting',
  Entrega: 'calendar.type.delivery',
  Inscrito: 'calendar.type.subscribed',
  Otro: 'calendar.type.other',
};

export default function CalendarEventCard({
  event,
  onEdit,
  onDelete,
  onUnsubscribe,
  canManage = true,
}) {
  const { t } = useLanguage();
  const isSubscribed = event.origen === 'inscrito';
  const typeClass = isSubscribed ? 'subscribed' : (TYPE_CLASS[event.tipo] || 'other');
  const typeLabel = isSubscribed
    ? t('calendar.type.subscribed')
    : t(TYPE_LABEL_KEY[event.tipo] || 'calendar.type.other');

  return (
    <article className={`cal-event-card ${typeClass}${canManage ? '' : ' locked'}`}>
      <div className="cal-event-title-row">
        <strong>{event.titulo}</strong>
        {isSubscribed && (
          <span className="cal-event-badge subscribed">
            {t('calendar.subscribed.badge')}
          </span>
        )}
      </div>

      <span className="cal-event-time">
        {event.hora || '--:--'} · {typeLabel}
      </span>

      {event.ubicacion && (
        <span className="cal-event-location">
          {event.ubicacion}
        </span>
      )}

      {event.descripcion && <p className="cal-event-desc">{event.descripcion}</p>}

      {isSubscribed ? (
        canManage && (
          <div className="cal-event-actions">
            <button
              type="button"
              className="unsubscribe"
              onClick={() => onUnsubscribe(event)}
            >
              {t('calendar.actions.unsubscribe')}
            </button>
          </div>
        )
      ) : (
        canManage && (
          <div className="cal-event-actions">
            <button type="button" className="edit" onClick={() => onEdit(event)}>
              {t('calendar.actions.edit')}
            </button>
            <button type="button" className="delete" onClick={() => onDelete(event)}>
              {t('calendar.actions.delete')}
            </button>
          </div>
        )
      )}
    </article>
  );
}
