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
import { useLanguage } from '../../../../core/i18n';
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
  title,
  kicker,
  createLabel,
}) {
  const { t } = useLanguage();
  const finalTitle = title || t('adminEvents.communications.title');
  const finalKicker = kicker || t('adminEvents.workspace.events');
  const finalCreateLabel = createLabel || t('adminEvents.communications.new');
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
        {!onCreateCommunication ? (
          <div className="evt-admin-notification-context">
            <strong>{t('adminEvents.communications.adminCenterTitle')}</strong>
            <p>{t('adminEvents.communications.adminCenterDescription')}</p>
          </div>
        ) : null}

        <div className="evt-view-toolbar">
          <div className="evt-view-toolbar-copy">
            <span className="evt-sheet-kicker">{finalKicker}</span>
            <h2 className="evt-sheet-title">{finalTitle}</h2>
          </div>

          <div className="evt-view-toolbar-actions">
            <button type="button" className="evt-icon-btn" title={t('adminEvents.communications.filters')} aria-label={t('adminEvents.communications.filters')}>
              <BsFunnel />
            </button>
            {onCreateCommunication ? (
              <button
                type="button"
                className="evt-context-btn evt-context-btn--primary"
                onClick={onCreateCommunication}
              >
                <BsPlusLg />
                {finalCreateLabel}
              </button>
            ) : null}
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
              placeholder={t('adminEvents.communications.searchPlaceholder')}
              aria-label={t('adminEvents.communications.searchAria')}
            />
          </div>

          <div className="evt-filter-group evt-filter-group--compact" aria-label={t('adminEvents.communications.typeAria')}>
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

          <div className="evt-filter-group evt-filter-group--compact" aria-label={t('adminEvents.communications.statusAria')}>
            {EVENT_COMMUNICATION_STATUS.map((status) => (
              <button
                key={status.id}
                type="button"
                className={`evt-filter-chip${statusFilter === status.id ? ' active' : ''}`}
                onClick={() => setStatusFilter(status.id)}
              >
                {t(`adminEvents.status.${status.id}`)}
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
                          {t(`adminEvents.type.${item.type}`) || typeMeta.label}
                        </span>
                        <span className={`evt-status-badge evt-status-badge--${statusMeta.tone}`}>
                          <span />
                          {t(`adminEvents.status.${item.status}`) || statusMeta.label}
                        </span>
                      </div>

                      <button type="button" className="evt-icon-btn evt-icon-btn--sm" title={t('adminEvents.communications.more')} aria-label={t('adminEvents.communications.more')}>
                        <BsThreeDots />
                      </button>
                    </div>

                    <h3 className="evt-card-title">{item.title}</h3>
                    <p className="evt-card-desc">{item.body}</p>

                    <div className="evt-mini-meta">
                      <span>{item.eventId ? item.eventTitle : t('adminEvents.communications.general')}</span>
                      <span>{item.date}</span>
                      <span>
                        <BsPeople />
                        {t('adminEvents.communications.recipients', { count: item.audience })}
                      </span>
                    </div>
                  </div>

                  <div className="evt-card-actions">
                    <div className="evt-channel-icons">
                      {item.channels.map((channel) => {
                        const Icon = CHANNEL_ICONS[channel] || BsBell;

                        return <Icon key={channel} title={channel} />;
                      })}
                      {!item.channels.length ? <span>{t('adminEvents.channel.inapp')}</span> : null}
                    </div>

                    <button
                      type="button"
                      className="evt-mini-action"
                      onClick={() => onEditCommunication?.(item)}
                    >
                      Revisar
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EventsEmptyState
            icon={BsSend}
            title={sourceReady ? t('adminEvents.communications.emptyFoundTitle') : t('adminEvents.communications.emptyTitle')}
            description={sourceReady
              ? t('adminEvents.communications.emptyFoundDescription')
              : t('adminEvents.communications.emptyDescription')}
            hint={t('adminEvents.communications.emptyHint')}
          />
        )}
      </section>
    </div>
  );
}
