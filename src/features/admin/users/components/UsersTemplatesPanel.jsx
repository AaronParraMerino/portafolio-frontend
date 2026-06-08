import { useMemo, useState } from 'react';
import {
  BsBell,
  BsEnvelope,
  BsFileEarmarkPlus,
  BsFileEarmarkText,
  BsPencil,
  BsMagic,
  BsSearch,
  BsSend,
  BsTrash,
} from 'react-icons/bs';
import { useLanguage } from '../../../../core/i18n';
import {
  USER_NOTICE_TYPES,
  getUserNoticeTypeMeta,
} from '../services/usersService';
import UsersWorkspaceEmpty from './UsersWorkspaceEmpty';

const CHANNEL_ICONS = {
  inapp: BsBell,
  email: BsEnvelope,
};

function normalizeTemplate(template = {}) {
  const channels = template.channels || template.canales || [];

  return {
    id: template.id || template.id_plantilla,
    title: template.title || template.titulo || template.name || '',
    body: template.body || template.cuerpo || template.descripcion || '',
    type: template.type || template.tipo || 'sistema',
    urgency: template.urgency || template.urgencia || 'baja',
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
  onEditTemplate,
  onDeleteTemplate,
  onUseTemplate,
}) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState('');

  const normalizedTemplates = useMemo(
    () => templates.map(normalizeTemplate),
    [templates],
  );

  const visibleTemplates = useMemo(
    () => normalizedTemplates.filter((template) => matchesTemplateFilters(template, query, typeFilter)),
    [normalizedTemplates, query, typeFilter],
  );

  const handleDelete = async (template) => {
    if (!window.confirm(t('admin.users.templates.deleteConfirm', { title: template.title }))) return;

    setBusyId(template.id);
    setMessage('');

    try {
      const response = await onDeleteTemplate(template.id);
      setMessage(response?.message || t('admin.users.templates.deleted'));
    } catch (error) {
      setMessage(error.message || t('admin.users.templates.actionError'));
    } finally {
      setBusyId(null);
    }
  };

  const handleUse = async (template) => {
    setBusyId(template.id);
    setMessage('');

    try {
      await onUseTemplate(template);
    } catch (error) {
      setMessage(error.message || t('admin.users.templates.actionError'));
      setBusyId(null);
    }
  };

  return (
    <div className="usr-view-body">
      <section className="usr-sheet usr-sheet--highlight">
        <div className="usr-view-toolbar">
          <div className="usr-view-toolbar-copy">
            <span className="usr-sheet-kicker">{t('admin.users.templates.kicker')}</span>
            <h2 className="usr-sheet-title">{t('admin.users.templates.title')}</h2>
          </div>

          <button
            type="button"
            className="usr-context-btn usr-context-btn--secondary"
            onClick={onCreateTemplate}
          >
            <BsFileEarmarkPlus />
            {t('admin.users.templates.new')}
          </button>
        </div>

        <div className="usr-chip-list">
          <span className="usr-chip usr-chip--ready">
            <BsFileEarmarkText />
            {t('admin.users.templates.recurring')}
          </span>
          <span className="usr-chip usr-chip--ready">
            <BsMagic />
            {t('admin.users.templates.futureReuse')}
          </span>
          <span className="usr-chip usr-chip--ready">
            <BsFileEarmarkPlus />
            {t('admin.users.templates.centralizedEdit')}
          </span>
        </div>
      </section>

      <section className="usr-sheet">
        <div className="usr-view-toolbar">
          <div className="usr-view-toolbar-copy">
            <span className="usr-sheet-kicker">{t('admin.users.templates.catalog')}</span>
            <h2 className="usr-sheet-title">{t('admin.users.templates.available')}</h2>
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
              placeholder={t('admin.users.templates.searchPlaceholder')}
              aria-label={t('admin.users.templates.searchAria')}
            />
          </div>

          <div className="usr-filter-strip usr-filter-strip--compact" aria-label={t('admin.users.templates.typeAria')}>
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
                {t(`admin.users.noticeType.${type.id}`)}
              </button>
            ))}
          </div>
        </div>

        {message ? <div className="usr-notice-message" role="status">{message}</div> : null}

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
                      {t(`admin.users.noticeType.${template.type}`)}
                    </span>
                  </div>
                  <strong>{template.title || t('admin.users.templates.unnamed')}</strong>
                  <p>{template.body || t('admin.users.templates.noContent')}</p>
                  <div className="usr-template-footer">
                    <span>{t('admin.users.templates.uses', { count: template.used })}</span>
                    <div className="usr-channel-icons">
                      {template.channels.map((channel) => {
                        const Icon = CHANNEL_ICONS[channel] || BsBell;

                        return <Icon key={channel} title={channel} />;
                      })}
                      {!template.channels.length ? <span>{t('admin.users.templates.noChannel')}</span> : null}
                    </div>
                  </div>
                  <div className="usr-template-actions">
                    <button
                      type="button"
                      className="usr-mini-action usr-mini-action--primary"
                      disabled={busyId === template.id}
                      onClick={() => handleUse(template)}
                    >
                      <BsSend />
                      {t('admin.users.templates.use')}
                    </button>
                    <button
                      type="button"
                      className="usr-mini-action"
                      disabled={busyId === template.id}
                      onClick={() => onEditTemplate(template)}
                    >
                      <BsPencil />
                      {t('admin.users.templates.edit')}
                    </button>
                    <button
                      type="button"
                      className="usr-mini-action usr-mini-action--danger"
                      disabled={busyId === template.id}
                      onClick={() => handleDelete(template)}
                    >
                      <BsTrash />
                      {t('admin.users.templates.delete')}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <UsersWorkspaceEmpty
            icon={BsFileEarmarkText}
            title={sourceReady ? t('admin.users.templates.emptyFoundTitle') : t('admin.users.templates.emptyTitle')}
            description={sourceReady
              ? t('admin.users.templates.emptyFoundDescription')
              : t('admin.users.templates.emptyDescription')}
            hint={t('admin.users.templates.emptyHint')}
          />
        )}
      </section>
    </div>
  );
}
