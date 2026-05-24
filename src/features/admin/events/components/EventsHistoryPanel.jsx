import { useMemo, useState } from 'react';
import {
  BsBell,
  BsClockHistory,
  BsEnvelope,
  BsFileText,
  BsMegaphone,
  BsPhone,
  BsSearch,
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

function matchesHistoryFilters(item, query, typeFilter, statusFilter) {
  const normalizedQuery = query.trim().toLowerCase();
  const matchesType = typeFilter === 'todos' || item.type === typeFilter;
  const matchesStatus = statusFilter === 'todos' || item.status === statusFilter;

  if (!matchesType || !matchesStatus) return false;
  if (!normalizedQuery) return true;

  return [
    item.title,
    item.description,
    item.target,
    item.type,
    item.status,
    item.date,
  ].some((value) => String(value || '').toLowerCase().includes(normalizedQuery));
}

export default function EventsHistoryPanel({
  sourceReady,
  historyItems,
}) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');

  const visibleHistory = useMemo(
    () => historyItems.filter((item) => matchesHistoryFilters(item, query, typeFilter, statusFilter)),
    [historyItems, query, statusFilter, typeFilter],
  );

  return (
    <div className="evt-view-body">
      <section className="evt-sheet">
        <div className="evt-view-toolbar">
          <div className="evt-view-toolbar-copy">
            <span className="evt-sheet-kicker">Historial</span>
            <h2 className="evt-sheet-title">Trazabilidad de eventos</h2>
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
              placeholder="Buscar historial..."
              aria-label="Buscar historial"
            />
          </div>

          <div className="evt-filter-group evt-filter-group--compact" aria-label="Filtrar historial por tipo">
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

          <div className="evt-filter-group evt-filter-group--compact" aria-label="Filtrar historial por estado">
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

        {sourceReady && visibleHistory.length > 0 ? (
          <div className="evt-history-wrap">
            <table className="evt-history-table">
              <thead>
                <tr>
                  <th>Registro</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Destino</th>
                  <th>Canales</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {visibleHistory.map((item) => {
                  const typeMeta = getEventCommunicationTypeMeta(item.type);
                  const statusMeta = getEventCommunicationStatusMeta(item.status);

                  return (
                    <tr key={item.id || `${item.title}-${item.date}`}>
                      <td>
                        <div className="evt-history-main">
                          <span className="evt-history-icon">
                            <BsMegaphone />
                          </span>
                          <span>
                            <strong>{item.title}</strong>
                            {item.description ? <small>{item.description}</small> : null}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`evt-type-badge evt-type-badge--${typeMeta.tone}`}>
                          {typeMeta.label}
                        </span>
                      </td>
                      <td>
                        <span className={`evt-status-badge evt-status-badge--${statusMeta.tone}`}>
                          <span />
                          {statusMeta.label}
                        </span>
                      </td>
                      <td>{item.target}</td>
                      <td>
                        <div className="evt-channel-icons">
                          {item.channels.map((channel) => {
                            const Icon = CHANNEL_ICONS[channel] || BsBell;

                            return <Icon key={channel} title={channel} />;
                          })}
                          {!item.channels.length ? <span>Sin canal</span> : null}
                        </div>
                      </td>
                      <td>{item.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EventsEmptyState
            icon={BsClockHistory}
            title={sourceReady ? 'Sin registros encontrados' : 'Sin historial disponible'}
            description={sourceReady
              ? 'No hay registros que coincidan con la busqueda o los filtros actuales.'
              : 'Aqui se mostraran envios, cambios de estado y acciones administrativas de eventos.'}
            hint="La tabla permite revisar la trazabilidad de eventos y anuncios."
          />
        )}
      </section>

      <section className="evt-sheet evt-sheet--subtle">
        <div className="evt-chip-list">
          <span className="evt-chip">
            <BsFileText />
            Cambios de agenda
          </span>
          <span className="evt-chip">
            <BsFileText />
            Comunicaciones emitidas
          </span>
          <span className="evt-chip">
            <BsFileText />
            Estados de participacion
          </span>
        </div>
      </section>
    </div>
  );
}
