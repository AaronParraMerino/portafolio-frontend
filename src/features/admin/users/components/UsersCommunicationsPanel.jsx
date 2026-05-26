import { useMemo, useState } from 'react';
import {
  BsBell,
  BsClock,
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
  USER_NOTICE_STATUSES,
  USER_NOTICE_TYPES,
  getUserNoticeStatusMeta,
  getUserNoticeTypeMeta,
} from '../services/usersService';
import UsersWorkspaceEmpty from './UsersWorkspaceEmpty';

const CHANNEL_ICONS = {
  inapp: BsBell,
  email: BsEnvelope,
  push: BsPhone,
};

function normalizeNotice(item = {}) {
  const channels = item.channels || item.canales || [];

  return {
    id: item.id || item.id_aviso || item.id_comunicacion,
    title: item.title || item.titulo || 'Aviso sin titulo',
    body: item.body || item.preview || item.cuerpo || item.descripcion || 'Sin descripcion disponible.',
    type: item.type || item.tipo || 'sistema',
    status: item.status || item.estado || 'borrador',
    urgency: item.urgency || item.urgencia || 'baja',
    audience: item.audience || item.dest || item.destinatarios || 0,
    date: item.scheduledAt || item.fecha || item.createdAt || item.creado || '--',
    segments: item.segments || item.segmentos || [],
    channels: Array.isArray(channels) ? channels : [],
    pinned: !!item.pinned,
    raw: item,
  };
}

function matchesNoticeFilters(notice, query, typeFilter, statusFilter) {
  const normalizedQuery = query.trim().toLowerCase();
  const matchesType = typeFilter === 'todos' || notice.type === typeFilter;
  const matchesStatus = statusFilter === 'todos' || notice.status === statusFilter;

  if (!matchesType || !matchesStatus) return false;
  if (!normalizedQuery) return true;

  return [
    notice.title,
    notice.body,
    notice.type,
    notice.status,
    notice.urgency,
  ].some((value) => String(value || '').toLowerCase().includes(normalizedQuery));
}

export default function UsersCommunicationsPanel({
  sourceReady,
  communications,
  onCreateNotice,
  onEditNotice,
}) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');

  const notices = useMemo(
    () => communications.map(normalizeNotice),
    [communications],
  );

  const visibleNotices = useMemo(
    () => notices.filter((notice) => matchesNoticeFilters(notice, query, typeFilter, statusFilter)),
    [notices, query, statusFilter, typeFilter],
  );

  return (
    <div className="usr-view-body">
      <section className="usr-sheet">
        <div className="usr-view-toolbar">
          <div className="usr-view-toolbar-copy">
            <span className="usr-sheet-kicker">Avisos</span>
            <h2 className="usr-sheet-title">Avisos a usuarios</h2>
          </div>

          <div className="usr-view-toolbar-actions">
            <button type="button" className="usr-icon-tool" title="Filtros" aria-label="Filtros">
              <BsFunnel />
            </button>
            <button
              type="button"
              className="usr-context-btn usr-context-btn--primary"
              onClick={onCreateNotice}
            >
              <BsPlusLg />
              Nuevo aviso
            </button>
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
              placeholder="Buscar aviso..."
              aria-label="Buscar avisos"
            />
          </div>

          <div className="usr-filter-strip usr-filter-strip--compact" aria-label="Filtrar avisos por tipo">
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

          <div className="usr-filter-strip usr-filter-strip--compact" aria-label="Filtrar avisos por estado">
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

        {sourceReady && visibleNotices.length > 0 ? (
          <div className="usr-notice-grid">
            {visibleNotices.map((notice) => {
              const typeMeta = getUserNoticeTypeMeta(notice.type);
              const statusMeta = getUserNoticeStatusMeta(notice.status);

              return (
                <article key={notice.id || notice.title} className={`usr-notice-card${notice.pinned ? ' pinned' : ''}`}>
                  <div className={`usr-notice-accent usr-notice-accent--${typeMeta.tone}`} />

                  <div className="usr-notice-card-body">
                    <div className="usr-notice-card-top">
                      <div className="usr-notice-badges">
                        <span className={`usr-type-badge usr-type-badge--${typeMeta.tone}`}>
                          <BsMegaphone />
                          {typeMeta.label}
                        </span>
                        <span className={`usr-status-badge usr-status-badge--${statusMeta.tone}`}>
                          <span className="usr-status-dot" />
                          {statusMeta.label}
                        </span>
                      </div>

                      <button type="button" className="usr-icon-tool usr-icon-tool--sm" title="Mas opciones" aria-label="Mas opciones">
                        <BsThreeDots />
                      </button>
                    </div>

                    <h3 className="usr-notice-title">{notice.title}</h3>
                    <p className="usr-notice-desc">{notice.body}</p>

                    <div className="usr-notice-meta-grid">
                      <span>
                        <BsClock />
                        {notice.date}
                      </span>
                      <span>
                        <BsPeople />
                        {notice.audience} usuarios
                      </span>
                      <span>
                        <span className={`usr-urgency-dot usr-urgency-dot--${notice.urgency}`} />
                        Urgencia {notice.urgency}
                      </span>
                    </div>

                    <div className="usr-notice-chip-row">
                      {notice.segments.slice(0, 3).map((segment) => (
                        <span key={segment} className="usr-mini-chip">{segment}</span>
                      ))}
                      {!notice.segments.length ? <span className="usr-mini-chip">Sin segmento</span> : null}
                    </div>
                  </div>

                  <div className="usr-notice-card-actions">
                    <div className="usr-channel-icons">
                      {notice.channels.map((channel) => {
                        const Icon = CHANNEL_ICONS[channel] || BsBell;

                        return <Icon key={channel} title={channel} />;
                      })}
                      {!notice.channels.length ? <span>Sin canal</span> : null}
                    </div>

                    <button
                      type="button"
                      className="usr-mini-action"
                      onClick={() => onEditNotice(notice.raw)}
                    >
                      Editar
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <UsersWorkspaceEmpty
            icon={BsSend}
            title={sourceReady ? 'Sin avisos encontrados' : 'Sin avisos registrados'}
            description={sourceReady
              ? 'No hay avisos que coincidan con la busqueda o los filtros actuales.'
              : 'Aqui apareceran los avisos enviados, programados o guardados como borrador cuando exista informacion real.'}
            hint="El boton Nuevo aviso abre el modal de redaccion y segmentacion."
          />
        )}
      </section>
    </div>
  );
}
