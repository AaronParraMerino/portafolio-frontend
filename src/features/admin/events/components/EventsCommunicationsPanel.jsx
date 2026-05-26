import { useMemo, useState } from 'react';
import {
  BsBell,
  BsEnvelope,
  BsFunnel,
  BsMegaphone,
  BsPeople,
  BsPhone,
  BsPlusLg,
  BsSearch,
  BsSend,
  BsThreeDots,
} from 'react-icons/bs';
import {
  EVENT_COMMUNICATION_STATUS,
  EVENT_COMMUNICATION_TYPES,
  getEventCommunicationStatusMeta,
  getEventCommunicationTypeMeta,
} from '../services/eventsService';
import EventsEmptyState from './EventsEmptyState';

const CHANNEL_ICONS = {
  inapp: BsBell,
  email: BsEnvelope,
  push: BsPhone,
};

function matchesCommunicationFilters(item, query, typeFilter, statusFilter) {
  const normalizedQuery = query.trim().toLowerCase();
  const matchesType = typeFilter === 'todos' || item.type === typeFilter;
  const matchesStatus = statusFilter === 'todos' || item.status === statusFilter;

  if (!matchesType || !matchesStatus) return false;
  if (!normalizedQuery) return true;

  return [
    item.title,
    item.body,
    item.eventTitle,
    item.type,
    item.status,
    item.urgency,
    item.date,
  ].some((value) => String(value || '').toLowerCase().includes(normalizedQuery));
}

export default function EventsCommunicationsPanel({
  sourceReady,
  communications,
  onCreateCommunication,
  onEditCommunication,
}) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');

  const visibleCommunications = useMemo(
    () => communications.filter((item) => matchesCommunicationFilters(item, query, typeFilter, statusFilter)),
    [communications, query, statusFilter, typeFilter],
  );

  return (
    <div className="evt-view-body">
      <section className="evt-sheet">
        <div className="evt-view-toolbar">
          <div className="evt-view-toolbar-copy">
            <span className="evt-sheet-kicker">Comunicaciones</span>
            <h2 className="evt-sheet-title">Anuncios de plataforma</h2>
          </div>

          <div className="evt-view-toolbar-actions">
            <button type="button" className="evt-icon-btn" title="Filtros" aria-label="Filtros">
              <BsFunnel />
            </button>
            <button
              type="button"
              className="evt-context-btn evt-context-btn--primary"
              onClick={onCreateCommunication}
            >
              <BsPlusLg />
              Nuevo anuncio
            </button>
          </div>
        </div>

        <div className="evt-secondary-toolbar">
          <div className="evt-search-box evt-search-box--compact">
            <span className="evt-search-icon">
              <BsSearch />
            </span>
            <input
              type="text"
              className="evt-search-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar anuncio..."
              aria-label="Buscar comunicaciones"
            />
          </div>

          <div className="evt-filter-group evt-filter-group--compact" aria-label="Filtrar comunicaciones por tipo">
            {EVENT_COMMUNICATION_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                className={`evt-filter-chip${typeFilter === type.id ? ' active' : ''}`}
                onClick={() => setTypeFilter(type.id)}
              >
                {type.label}
              </button>
            ))}
          </div>

          <div className="evt-filter-group evt-filter-group--compact" aria-label="Filtrar comunicaciones por estado">
            {EVENT_COMMUNICATION_STATUS.map((status) => (
              <button
                key={status.id}
                type="button"
                className={`evt-filter-chip${statusFilter === status.id ? ' active' : ''}`}
                onClick={() => setStatusFilter(status.id)}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {sourceReady && visibleCommunications.length > 0 ? (
          <div className="evt-communication-grid">
            {visibleCommunications.map((item) => {
              const typeMeta = getEventCommunicationTypeMeta(item.type);
              const statusMeta = getEventCommunicationStatusMeta(item.status);

              return (
                <article key={item.id || `${item.title}-${item.date}`} className={`evt-communication-card${item.pinned ? ' pinned' : ''}`}>
                  <div className={`evt-card-accent evt-card-accent--${typeMeta.tone}`} />

                  <div className="evt-communication-body">
                    <div className="evt-card-top">
                      <div className="evt-card-badges">
                        <span className={`evt-type-badge evt-type-badge--${typeMeta.tone}`}>
                          <BsMegaphone />
                          {typeMeta.label}
                        </span>
                        <span className={`evt-status-badge evt-status-badge--${statusMeta.tone}`}>
                          <span />
                          {statusMeta.label}
                        </span>
                      </div>

                      <button type="button" className="evt-icon-btn evt-icon-btn--sm" title="Mas opciones" aria-label="Mas opciones">
                        <BsThreeDots />
                      </button>
                    </div>

                    <h3 className="evt-card-title">{item.title}</h3>
                    <p className="evt-card-desc">{item.body}</p>

                    <div className="evt-mini-meta">
                      <span>{item.eventId ? item.eventTitle : 'Comunicado general'}</span>
                      <span>{item.date}</span>
                      <span>
                        <BsPeople />
                        {item.audience} destinatarios
                      </span>
                    </div>
                  </div>

                  <div className="evt-card-actions">
                    <div className="evt-channel-icons">
                      {item.channels.map((channel) => {
                        const Icon = CHANNEL_ICONS[channel] || BsBell;

                        return <Icon key={channel} title={channel} />;
                      })}
                      {!item.channels.length ? <span>Sin canal</span> : null}
                    </div>

                    <button
                      type="button"
                      className="evt-mini-action"
                      onClick={() => onEditCommunication(item)}
                    >
                      Editar
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EventsEmptyState
            icon={BsSend}
            title={sourceReady ? 'Sin comunicaciones encontradas' : 'Sin comunicaciones registradas'}
            description={sourceReady
              ? 'No hay mensajes que coincidan con la busqueda o los filtros actuales.'
              : 'Aqui apareceran anuncios de plataforma, oportunidades, seguridad, mantenimiento y comunidad.'}
            hint="Nuevo anuncio abre el modal preparado para audiencias generales o vinculadas a un evento."
          />
        )}
      </section>
    </div>
  );
}
