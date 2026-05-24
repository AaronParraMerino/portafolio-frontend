import { useMemo, useState } from 'react';
import {
  BsBell,
  BsClockHistory,
  BsEnvelope,
  BsFileText,
  BsMegaphone,
  BsPeople,
  BsPhone,
  BsSearch,
} from 'react-icons/bs';
import {
  USER_NOTICE_STATUSES,
  USER_NOTICE_TYPES,
  getUserNoticeStatusMeta,
  getUserNoticeTypeMeta,
} from '../services/profileService';
import UsersWorkspaceEmpty from './UsersWorkspaceEmpty';

const CHANNEL_ICONS = {
  inapp: BsBell,
  email: BsEnvelope,
  push: BsPhone,
};

function normalizeHistoryItem(item = {}) {
  const channels = item.channels || item.canales || [];

  return {
    id: item.id || item.id_historial,
    title: item.title || item.titulo || item.action || 'Registro sin titulo',
    body: item.body || item.preview || item.descripcion || '',
    type: item.type || item.tipo || 'sistema',
    status: item.status || item.estado || 'enviado',
    audience: item.audience || item.dest || item.destinatarios || item.usuario || 'Sin destinatarios',
    date: item.date || item.fecha || item.createdAt || item.creado || '--',
    channels: Array.isArray(channels) ? channels : [],
  };
}

function matchesHistoryFilters(item, query, typeFilter, statusFilter) {
  const normalizedQuery = query.trim().toLowerCase();
  const matchesType = typeFilter === 'todos' || item.type === typeFilter;
  const matchesStatus = statusFilter === 'todos' || item.status === statusFilter;

  if (!matchesType || !matchesStatus) return false;
  if (!normalizedQuery) return true;

  return [
    item.title,
    item.body,
    item.type,
    item.status,
    item.audience,
    item.date,
  ].some((value) => String(value || '').toLowerCase().includes(normalizedQuery));
}

export default function UsersHistoryPanel({
  sourceReady,
  historyItems,
}) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');

  const normalizedHistory = useMemo(
    () => historyItems.map(normalizeHistoryItem),
    [historyItems],
  );

  const visibleHistory = useMemo(
    () => normalizedHistory.filter((item) => matchesHistoryFilters(item, query, typeFilter, statusFilter)),
    [normalizedHistory, query, statusFilter, typeFilter],
  );

  return (
    <div className="usr-view-body">
      <section className="usr-sheet">
        <div className="usr-view-toolbar">
          <div className="usr-view-toolbar-copy">
            <span className="usr-sheet-kicker">Historial</span>
            <h2 className="usr-sheet-title">Seguimiento unificado</h2>
          </div>
        </div>

        <div className="usr-secondary-toolbar">
          <div className="usr-search-box usr-search-box--compact">
            <span className="usr-search-icon">
              <BsSearch />
            </span>
            <input
              type="text"
              className="usr-search-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar historial..."
              aria-label="Buscar historial"
            />
          </div>

          <div className="usr-filter-strip usr-filter-strip--compact" aria-label="Filtrar historial por tipo">
            <button
              type="button"
              className={`usr-filter-chip${typeFilter === 'todos' ? ' active' : ''}`}
              onClick={() => setTypeFilter('todos')}
            >
              Todos
            </button>
            {USER_NOTICE_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                className={`usr-filter-chip${typeFilter === type.id ? ' active' : ''}`}
                onClick={() => setTypeFilter(type.id)}
              >
                {type.label}
              </button>
            ))}
          </div>

          <div className="usr-filter-strip usr-filter-strip--compact" aria-label="Filtrar historial por estado">
            {USER_NOTICE_STATUSES.map((status) => (
              <button
                key={status.id}
                type="button"
                className={`usr-filter-chip${statusFilter === status.id ? ' active' : ''}`}
                onClick={() => setStatusFilter(status.id)}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {sourceReady && visibleHistory.length > 0 ? (
          <div className="usr-history-wrap">
            <table className="usr-history-table">
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
                  const typeMeta = getUserNoticeTypeMeta(item.type);
                  const statusMeta = getUserNoticeStatusMeta(item.status);

                  return (
                    <tr key={item.id || `${item.title}-${item.date}`}>
                      <td>
                        <div className="usr-history-main">
                          <span className="usr-history-icon">
                            <BsMegaphone />
                          </span>
                          <span>
                            <strong>{item.title}</strong>
                            {item.body ? <small>{item.body}</small> : null}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`usr-type-badge usr-type-badge--${typeMeta.tone}`}>
                          {typeMeta.label}
                        </span>
                      </td>
                      <td>
                        <span className={`usr-status-badge usr-status-badge--${statusMeta.tone}`}>
                          <span className="usr-status-dot" />
                          {statusMeta.label}
                        </span>
                      </td>
                      <td>
                        <span className="usr-history-audience">
                          <BsPeople />
                          {item.audience}
                        </span>
                      </td>
                      <td>
                        <div className="usr-channel-icons">
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
          <UsersWorkspaceEmpty
            icon={BsClockHistory}
            title={sourceReady ? 'Sin registros encontrados' : 'Sin historial disponible'}
            description={sourceReady
              ? 'No hay registros que coincidan con la busqueda o los filtros actuales.'
              : 'Cuando el backend este conectado, aqui veras envios, cambios de cuenta y trazabilidad de las acciones hechas sobre usuarios.'}
            hint="La estructura ya esta preparada para mostrar datos reales del backend."
          />
        )}
      </section>

      <section className="usr-sheet usr-sheet--subtle">
        <div className="usr-chip-list">
          <span className="usr-chip">
            <BsFileText />
            Acciones de cuenta
          </span>
          <span className="usr-chip">
            <BsFileText />
            Comunicaciones emitidas
          </span>
          <span className="usr-chip">
            <BsFileText />
            Cambios administrativos
          </span>
        </div>
      </section>
    </div>
  );
}
