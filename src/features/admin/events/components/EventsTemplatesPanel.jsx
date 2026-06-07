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
import { useLanguage } from '../../../../core/i18n';
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
  const { t } = useLanguage();
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
            <span className="evt-sheet-kicker">{t('adminEvents.workspace.templates')}</span>
            <h2 className="evt-sheet-title">{t('adminEvents.templates.title')}</h2>
          </div>

          {onCreateTemplate ? (
            <button
              type="button"
              className="evt-context-btn evt-context-btn--secondary"
              onClick={() => onCreateTemplate()}
            >
              <BsFileEarmarkPlus />
              {t('adminEvents.templates.new')}
            </button>
          ) : null}
        </div>

        <div className="evt-chip-list">
          <span className="evt-chip">
            <BsMegaphone />
            {t('adminEvents.communications.title')}
          </span>
          <span className="evt-chip">
            <BsFileEarmarkText />
            {t('adminEvents.templates.opportunities')}
          </span>
          <span className="evt-chip">
            <BsFileEarmarkPlus />
            {t('adminEvents.templates.community')}
          </span>
        </div>
      </section>

      <section className="evt-sheet">
        <div className="evt-view-toolbar">
          <div className="evt-view-toolbar-copy">
            <span className="evt-sheet-kicker">{t('adminEvents.templates.catalog')}</span>
            <h2 className="evt-sheet-title">{t('adminEvents.templates.available')}</h2>
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
              placeholder={t('adminEvents.templates.searchPlaceholder')}
              aria-label={t('adminEvents.templates.searchAria')}
            />
          </div>

          <div className="evt-filter-group evt-filter-group--compact" aria-label={t('adminEvents.templates.typeAria')}>
            {EVENT_COMMUNICATION_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                className={`evt-filter-chip${typeFilter === type.id ? ' active' : ''}`}
                onClick={() => setTypeFilter(type.id)}
              >
                {t(`adminEvents.type.${type.id}`)}
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
                      {t(`adminEvents.type.${template.type}`) || typeMeta.label}
                    </span>
                  </div>

                  <strong>{template.title}</strong>
                  <p>{template.body}</p>

                  <div className="evt-template-footer">
                    <span>{t('adminEvents.templates.uses', { count: template.used })}</span>
                    <div className="evt-channel-icons">
                      {template.channels.map((channel) => {
                        const Icon = CHANNEL_ICONS[channel] || BsBell;

                        return <Icon key={channel} title={channel} />;
                      })}
                      {!template.channels.length ? <span>{t('adminEvents.channel.inapp')}</span> : null}
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
            title={sourceReady ? t('adminEvents.templates.emptyFoundTitle') : t('adminEvents.templates.emptyTitle')}
            description={sourceReady
              ? t('adminEvents.templates.emptyFoundDescription')
              : t('adminEvents.templates.emptyDescription')}
            hint={t('adminEvents.templates.emptyHint')}
          />
        )}
      </section>
    </div>
  );
}
