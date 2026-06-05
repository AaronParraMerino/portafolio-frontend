import {
  BsEnvelope,
  BsPause,
  BsPersonBadge,
  BsPlay,
  BsSlashCircle,
  BsTrash,
} from 'react-icons/bs';
import {
  getEventStatusMeta,
  getEventTypeMeta,
} from '../services/eventsService';
import EventsEmptyState from './EventsEmptyState';

const ACTIONS = [
  { id: 'activar', label: 'Activar', icon: BsPlay, variant: 'primary' },
  { id: 'pausar', label: 'Pausar', icon: BsPause, variant: 'ghost' },
  { id: 'suspender', label: 'Suspender', icon: BsSlashCircle, variant: 'ghost' },
  { id: 'eliminar', label: 'Eliminar', icon: BsTrash, variant: 'danger' },
];

function getAvailableAdminActions(status) {
  if (status === 'eliminado') return [];

  const blockedByStatus = {
    activo: ['activar'],
    pausado: ['pausar'],
    suspendido: ['suspender', 'pausar'],
    cancelado: ['pausar', 'suspender'],
    programado: [],
    borrador: ['pausar'],
  };
  const blocked = blockedByStatus[status] || [];

  return ACTIONS.filter((action) => !blocked.includes(action.id));
}

export default function AdminEventsManagementPanel({
  sourceReady,
  events,
  onReviewEvent,
}) {
  return (
    <div className="evt-view-body">
      <section className="evt-sheet">
        <div className="evt-view-toolbar">
          <div className="evt-view-toolbar-copy">
            <span className="evt-sheet-kicker">Gestion</span>
            <h2 className="evt-sheet-title">Eventos publicados por publicadores</h2>
          </div>
        </div>

        {sourceReady && events.length > 0 ? (
          <div className="evt-admin-event-list">
            {events.map((event) => {
              const statusMeta = getEventStatusMeta(event.status);
              const typeMeta = getEventTypeMeta(event.type);
              const availableActions = getAvailableAdminActions(event.status);

              return (
                <article key={event.id || event.title} className="evt-admin-event-row">
                  <div className={`evt-card-accent evt-card-accent--${statusMeta.tone}`} />
                  <div className="evt-admin-event-main">
                    <div className="evt-card-badges">
                      <span className="evt-type-badge">{typeMeta.label}</span>
                      <span className={`evt-status-badge evt-status-badge--${statusMeta.tone}`}>
                        <span />
                        {statusMeta.label}
                      </span>
                    </div>
                    <strong>{event.title}</strong>
                    <p>{event.description}</p>
                    <small>{event.date}{event.time ? ` · ${event.time}` : ''} · {event.location}</small>
                    <div className="evt-admin-publisher-card">
                      <span>
                        <BsPersonBadge />
                        {event.publisherName}
                      </span>
                      <span>
                        <BsEnvelope />
                        {event.publisherEmail}
                      </span>
                    </div>
                  </div>
                  <div className="evt-admin-event-actions">
                    {availableActions.map((action) => {
                      const Icon = action.icon;

                      return (
                        <button
                          key={action.id}
                          type="button"
                          className={`evt-mini-action evt-mini-action--${action.variant}`}
                          onClick={() => onReviewEvent(event, action.id)}
                        >
                          <Icon />
                          {action.label}
                        </button>
                      );
                    })}
                    {!availableActions.length ? (
                      <span className="evt-admin-event-lock">Sin acciones disponibles</span>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EventsEmptyState
            icon={BsPlay}
            title="Sin eventos para gestionar"
            description="Aqui apareceran los eventos publicados para activar, pausar, suspender o eliminar."
            hint="Cada accion administrativa debe registrar un motivo para notificar al publicador."
          />
        )}
      </section>
    </div>
  );
}
