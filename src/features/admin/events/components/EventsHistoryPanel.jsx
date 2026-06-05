import { useMemo, useState } from 'react';
import {
  BsClockHistory,
  BsFileText,
  BsSearch,
  BsShieldCheck,
} from 'react-icons/bs';
import {
  EVENT_HISTORY_STATUS,
  EVENT_HISTORY_TYPES,
  getEventHistoryStatusMeta,
  getEventHistoryTypeMeta,
} from '../services/eventsService';
import EventsEmptyState from './EventsEmptyState';

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
    item.actor,
    item.action,
    item.entity,
    item.reason,
    item.module,
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
            <h2 className="evt-sheet-title">Bitacora administrativa de eventos</h2>
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
              placeholder="Buscar por accion, actor, evento o motivo..."
              aria-label="Buscar bitacora administrativa"
            />
          </div>

          <div className="evt-filter-group evt-filter-group--compact" aria-label="Filtrar historial por tipo">
            {EVENT_HISTORY_TYPES.map((type) => (
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
            {EVENT_HISTORY_STATUS.map((status) => (
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
                  <th>Accion</th>
                  <th>Actor</th>
                  <th>Entidad</th>
                  <th>Estado</th>
                  <th>Detalle</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {visibleHistory.map((item) => {
                  const typeMeta = getEventHistoryTypeMeta(item.type);
                  const statusMeta = getEventHistoryStatusMeta(item.status);

                  return (
                    <tr key={item.id || `${item.title}-${item.date}`}>
                      <td>
                        <div className="evt-history-main">
                          <span className="evt-history-icon">
                            <BsShieldCheck />
                          </span>
                          <span>
                            <strong>{item.action || item.title}</strong>
                            <small>{item.module || 'Eventos'} · {typeMeta.label}</small>
                          </span>
                        </div>
                      </td>
                      <td>
                        <strong className="evt-history-actor">{item.actor}</strong>
                      </td>
                      <td>
                        <span className="evt-history-entity">{item.entity || item.target}</span>
                      </td>
                      <td>
                        <span className={`evt-status-badge evt-status-badge--${statusMeta.tone}`}>
                          <span />
                          {statusMeta.label}
                        </span>
                      </td>
                      <td>
                        <div className="evt-history-detail">
                          <span>{item.description || item.reason || 'Sin detalle adicional.'}</span>
                          {item.reason ? <small>Motivo: {item.reason}</small> : null}
                          {item.previousStatus || item.nextStatus ? (
                            <small>
                              Estado: {item.previousStatus || 'sin estado'} - {item.nextStatus || item.status}
                            </small>
                          ) : null}
                          {item.ip ? <small>IP: {item.ip}</small> : null}
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
              : 'Aqui se mostraran aprobaciones, rechazos, pausas, suspensiones y cambios administrativos.'}
            hint="La bitacora permite auditar acciones, actores, motivos y eventos afectados."
          />
        )}
      </section>

      <section className="evt-sheet evt-sheet--subtle">
        <div className="evt-chip-list">
          <span className="evt-chip">
            <BsFileText />
            Cambios de estado
          </span>
          <span className="evt-chip">
            <BsFileText />
            Solicitudes revisadas
          </span>
          <span className="evt-chip">
            <BsFileText />
            Motivos administrativos
          </span>
        </div>
      </section>
    </div>
  );
}
