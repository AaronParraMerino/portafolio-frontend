import { useMemo, useState } from 'react';
import {
  BsBell,
  BsEnvelope,
  BsFileEarmarkPlus,
  BsFileEarmarkText,
  BsMegaphone,
  BsPhone,
  BsSearch,
} from 'react-icons/bs';
import {
  EVENT_COMMUNICATION_TYPES,
  getEventCommunicationTypeMeta,
} from '../services/eventsService';
import EventsEmptyState from './EventsEmptyState';

const CHANNEL_ICONS = {
  inapp: BsBell,
  email: BsEnvelope,
  push: BsPhone,
};

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

export default function EventsTemplatesPanel({
  sourceReady,
  templates,
  onCreateTemplate,
  onUseTemplate,
}) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('todos');

  const visibleTemplates = useMemo(
    () => templates.filter((template) => matchesTemplateFilters(template, query, typeFilter)),
    [query, templates, typeFilter],
  );

  return (
    <div className="evt-view-body">
      <section className="evt-sheet evt-sheet--highlight">
        <div className="evt-view-toolbar">
          <div className="evt-view-toolbar-copy">
            <span className="evt-sheet-kicker">Plantillas</span>
            <h2 className="evt-sheet-title">Mensajes reutilizables de plataforma</h2>
          </div>

          {onCreateTemplate ? (
            <button
              type="button"
              className="evt-context-btn evt-context-btn--secondary"
              onClick={() => onCreateTemplate()}
            >
              <BsFileEarmarkPlus />
              Nueva plantilla
            </button>
          ) : null}
        </div>

        <div className="evt-chip-list">
          <span className="evt-chip">
            <BsMegaphone />
            Comunicados
          </span>
          <span className="evt-chip">
            <BsFileEarmarkText />
            Oportunidades
          </span>
          <span className="evt-chip">
            <BsFileEarmarkPlus />
            Comunidad
          </span>
        </div>
      </section>

      <section className="evt-sheet">
        <div className="evt-view-toolbar">
          <div className="evt-view-toolbar-copy">
            <span className="evt-sheet-kicker">Catalogo</span>
            <h2 className="evt-sheet-title">Plantillas disponibles</h2>
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
              placeholder="Buscar plantilla..."
              aria-label="Buscar plantillas"
            />
          </div>

          <div className="evt-filter-group evt-filter-group--compact" aria-label="Filtrar plantillas por tipo">
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
        </div>

        {sourceReady && visibleTemplates.length > 0 ? (
          <div className="evt-template-grid">
            {visibleTemplates.map((template) => {
              const typeMeta = getEventCommunicationTypeMeta(template.type);

              return (
                <article key={template.id || template.title} className="evt-template-card">
                  <div className="evt-template-card-top">
                    <span className="evt-template-icon">
                      <BsFileEarmarkText />
                    </span>
                    <span className={`evt-type-badge evt-type-badge--${typeMeta.tone}`}>
                      {typeMeta.label}
                    </span>
                  </div>

                  <strong>{template.title}</strong>
                  <p>{template.body}</p>

                  <div className="evt-template-footer">
                    <span>{template.used} usos</span>
                    <div className="evt-channel-icons">
                      {template.channels.map((channel) => {
                        const Icon = CHANNEL_ICONS[channel] || BsBell;

                        return <Icon key={channel} title={channel} />;
                      })}
                      {!template.channels.length ? <span>Sin canal</span> : null}
                    </div>
                  </div>

                  {onUseTemplate ? (
                    <button
                      type="button"
                      className="evt-mini-action evt-mini-action--wide"
                      onClick={() => onUseTemplate(template)}
                    >
                      Usar plantilla
                    </button>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <EventsEmptyState
            icon={BsFileEarmarkText}
            title={sourceReady ? 'Sin plantillas encontradas' : 'Sin plantillas registradas'}
            description={sourceReady
              ? 'No hay plantillas que coincidan con la busqueda o el filtro actual.'
              : 'El catalogo mostrara plantillas reutilizables para anuncios y convocatorias.'}
            hint="Nueva plantilla abre el modal de creacion de contenido reutilizable."
          />
        )}
      </section>
    </div>
  );
}
