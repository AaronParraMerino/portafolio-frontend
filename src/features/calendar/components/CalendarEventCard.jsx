import { useLanguage } from '../../../core/i18n';

const TYPE_CLASS = {
  Personal: 'personal',
  Academico: 'academic',
  'Académico': 'academic',
  Trabajo: 'work',
  Reunion: 'meeting',
  'Reunión': 'meeting',
  Entrega: 'delivery',
};

const TYPE_LABEL_KEY = {
  Personal: 'calendar.type.personal',
  Academico: 'calendar.type.academic',
  'Académico': 'calendar.type.academic',
  Trabajo: 'calendar.type.work',
  Reunion: 'calendar.type.meeting',
  'Reunión': 'calendar.type.meeting',
  Entrega: 'calendar.type.delivery',
};

export default function CalendarEventCard({
  event,
  onEdit,
  onDelete,
  onUnsubscribe,
  onViewDetails,
  canManage = true,
  paused = false,
}) {
  const { t } = useLanguage();
  const isSubscribed = event.origen === 'inscrito';
  const typeClass = isSubscribed ? 'subscribed' : (TYPE_CLASS[event.tipo] || 'other');
  const typeLabel = isSubscribed
    ? (event.tipoOriginal || t('calendar.type.subscribed'))
    : t(TYPE_LABEL_KEY[event.tipo] || 'calendar.type.other');
  const capacityLabel = event.cupo > 0
    ? `${event.inscritos}/${event.cupo}`
    : String(event.inscritos || 0);

  return (
    <article className={`cal-event-card ${typeClass}${canManage && !paused ? '' : ' locked'}`}>
      <div className="cal-event-title-row">
        <strong>{event.titulo}</strong>
        {isSubscribed && (
          <span className="cal-event-badge subscribed">
            {t('calendar.subscribed.badge')}
          </span>
        )}
      </div>

      <span className="cal-event-time">
        {event.hora}{event.horaFin ? ` - ${event.horaFin}` : ''} · {typeLabel}
      </span>

      {event.descripcion && <p className="cal-event-desc">{event.descripcion}</p>}

      {isSubscribed && (
        <div className="cal-event-public-meta">
          {event.ubicacion && (
            <span className="cal-event-location">
              {t('calendar.event.location', { location: event.ubicacion })}
            </span>
          )}
          <span>{t('calendar.event.capacity', { count: capacityLabel })}</span>
          {event.autorNombre && <span>{t('calendar.event.publisher', { publisher: event.autorNombre })}</span>}
        </div>
      )}

      {(canManage || isSubscribed) && (
        <div className="cal-event-actions">
          {isSubscribed ? (
            <>
              <button type="button" className="details" onClick={() => onViewDetails?.(event)}>
                {t('calendar.actions.viewDetails')}
              </button>
              <button type="button" className="unsubscribe" onClick={() => onUnsubscribe?.(event)} disabled={paused}>
                {t('calendar.actions.unsubscribe')}
              </button>
            </>
          ) : (
            <>
              <button type="button" className="edit" onClick={() => onEdit?.(event)} disabled={paused}>
                {t('calendar.actions.edit')}
              </button>
              <button type="button" className="delete" onClick={() => onDelete?.(event)} disabled={paused}>
                {t('calendar.actions.delete')}
              </button>
            </>
          )}
        </div>
      )}
    </article>
  );
}
