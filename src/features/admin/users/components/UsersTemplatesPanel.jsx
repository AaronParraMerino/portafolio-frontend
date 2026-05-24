import { useMemo, useState } from 'react';
import {
  BsBell,
  BsEnvelope,
  BsFileEarmarkPlus,
  BsFileEarmarkText,
  BsMagic,
  BsPhone,
  BsSearch,
} from 'react-icons/bs';
import {
  USER_NOTICE_TYPES,
  getUserNoticeTypeMeta,
} from '../services/profileService';
import UsersWorkspaceEmpty from './UsersWorkspaceEmpty';

const CHANNEL_ICONS = {
  inapp: BsBell,
  email: BsEnvelope,
  push: BsPhone,
};

function normalizeTemplate(template = {}) {
  const channels = template.channels || template.canales || [];

  return {
    id: template.id || template.id_plantilla,
    title: template.title || template.titulo || template.name || 'Plantilla sin nombre',
    body: template.body || template.cuerpo || template.descripcion || 'Sin contenido disponible.',
    type: template.type || template.tipo || 'sistema',
    channels: Array.isArray(channels) ? channels : [],
    used: template.used || template.usadas || 0,
  };
}

function matchesTemplateFilters(template, query, typeFilter) {
  const normalizedQuery = query.trim().toLowerCase();
  const matchesType = typeFilter === 'todos' || template.type === typeFilter;

  if (!matchesType) return false;
  if (!normalizedQuery) return true;

  return [
    template.title,
    template.body,
    template.type,
  ].some((value) => String(value || '').toLowerCase().includes(normalizedQuery));
}

export default function UsersTemplatesPanel({
  sourceReady,
  templates,
  onCreateTemplate,
}) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('todos');

  const normalizedTemplates = useMemo(
    () => templates.map(normalizeTemplate),
    [templates],
  );

  const visibleTemplates = useMemo(
    () => normalizedTemplates.filter((template) => matchesTemplateFilters(template, query, typeFilter)),
    [normalizedTemplates, query, typeFilter],
  );

  return (
    <div className="usr-view-body">
      <section className="usr-sheet usr-sheet--highlight">
        <div className="usr-view-toolbar">
          <div className="usr-view-toolbar-copy">
            <span className="usr-sheet-kicker">Plantillas</span>
            <h2 className="usr-sheet-title">Plantillas reutilizables</h2>
          </div>

          <button
            type="button"
            className="usr-context-btn usr-context-btn--secondary"
            onClick={onCreateTemplate}
          >
            <BsFileEarmarkPlus />
            Nueva plantilla
          </button>
        </div>

        <div className="usr-chip-list">
          <span className="usr-chip usr-chip--ready">
            <BsFileEarmarkText />
            Mensajes recurrentes
          </span>
          <span className="usr-chip usr-chip--ready">
            <BsMagic />
            Reutilizacion futura
          </span>
          <span className="usr-chip usr-chip--ready">
            <BsFileEarmarkPlus />
            Edicion centralizada
          </span>
        </div>
      </section>

      <section className="usr-sheet">
        <div className="usr-view-toolbar">
          <div className="usr-view-toolbar-copy">
            <span className="usr-sheet-kicker">Catalogo</span>
            <h2 className="usr-sheet-title">Plantillas disponibles</h2>
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
              placeholder="Buscar plantilla..."
              aria-label="Buscar plantillas"
            />
          </div>

          <div className="usr-filter-strip usr-filter-strip--compact" aria-label="Filtrar plantillas por tipo">
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
        </div>

        {sourceReady && visibleTemplates.length > 0 ? (
          <div className="usr-template-list">
            {visibleTemplates.map((template) => {
              const typeMeta = getUserNoticeTypeMeta(template.type);

              return (
                <article key={template.id || template.title} className="usr-template-card">
                  <div className="usr-template-card-top">
                    <span className="usr-template-card-icon">
                      <BsFileEarmarkText />
                    </span>
                    <span className={`usr-type-badge usr-type-badge--${typeMeta.tone}`}>
                      {typeMeta.label}
                    </span>
                  </div>
                  <strong>{template.title}</strong>
                  <p>{template.body}</p>
                  <div className="usr-template-footer">
                    <span>{template.used} usos</span>
                    <div className="usr-channel-icons">
                      {template.channels.map((channel) => {
                        const Icon = CHANNEL_ICONS[channel] || BsBell;

                        return <Icon key={channel} title={channel} />;
                      })}
                      {!template.channels.length ? <span>Sin canal</span> : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <UsersWorkspaceEmpty
            icon={BsFileEarmarkText}
            title={sourceReady ? 'Sin plantillas encontradas' : 'Sin plantillas registradas'}
            description={sourceReady
              ? 'No hay plantillas que coincidan con la busqueda o el filtro actual.'
              : 'La coleccion quedo preparada para alojar mensajes reutilizables de bienvenida, cuenta y seguridad.'}
            hint="Usa Nueva plantilla para abrir el modal de creacion."
          />
        )}
      </section>
    </div>
  );
}
