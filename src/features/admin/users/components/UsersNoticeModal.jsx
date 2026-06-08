import { useEffect, useMemo, useState } from 'react';
import {
  BsBell,
  BsCheckLg,
  BsEnvelope,
  BsMegaphone,
  BsPeople,
  BsXLg,
} from 'react-icons/bs';
import {
  USER_COMMUNICATION_CHANNELS,
  USER_COMMUNICATION_SEGMENTS,
  USER_GLOBAL_NOTICE_TYPES,
  USER_NOTICE_TYPES,
  USER_NOTICE_URGENCY,
  estimateUsersAudience,
} from '../services/usersService';
import { useLanguage } from '../../../../core/i18n';

const CHANNEL_ICONS = {
  inapp: BsBell,
  email: BsEnvelope,
};

function toggleOption(value, selectedValues, onChange) {
  if (selectedValues.includes(value)) {
    if (selectedValues.length === 1) return;
    onChange(selectedValues.filter((item) => item !== value));
    return;
  }

  if (value === 'todos') {
    onChange([value]);
    return;
  }

  onChange([...selectedValues.filter((item) => item !== 'todos'), value]);
}

function resolveNoticeRecipients({ directUser, users, segments }) {
  if (directUser?.id) return [directUser.id];

  const statuses = {
    activos: 'activo',
    pausados: 'pausado',
    bloqueados: 'bloqueado',
    inactivos: 'inactivo',
  };
  return users
    .filter((user) => (
      segments.includes('todos')
      || segments.some((segment) => statuses[segment] === user.estado)
    ))
    .map((user) => Number(user.id))
    .filter(Boolean);
}

export default function UsersNoticeModal({
  modal,
  users,
  metrics,
  supportsCommunications,
  onSendNotice,
  onClose,
}) {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState(USER_NOTICE_TYPES[0]?.id || '');
  const [urgency, setUrgency] = useState('baja');
  const [segments, setSegments] = useState(['todos']);
  const [channels, setChannels] = useState(['inapp']);
  const [schedule, setSchedule] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!modal) return;

    const initialNotice = modal.initialNotice || {};

    setTitle(initialNotice.title || initialNotice.titulo || (modal.directUser ? t('admin.users.noticeModal.directTitle', { name: modal.directUser.nombre || t('admin.users.table.unknownUser') }) : ''));
    setBody(initialNotice.body || initialNotice.preview || initialNotice.cuerpo || '');
    setType(initialNotice.type || initialNotice.tipo || USER_NOTICE_TYPES[0]?.id || '');
    setUrgency(initialNotice.urgency || initialNotice.urgencia || 'baja');
    setSegments(initialNotice.segments || initialNotice.segmentos || modal.initialSegments || ['todos']);
    setChannels(['inapp']);
    setSchedule(initialNotice.scheduledAt || '');
    setMessage('');
    setSubmitting(false);
  }, [modal, t]);

  const audience = useMemo(() => {
    if (modal?.directUser) return 1;

    return estimateUsersAudience({
      users,
      segments,
    });
  }, [modal, segments, users]);

  const isTemplate = modal?.mode === 'template';
  const isGlobalNotice = !modal?.fromTemplate && !modal?.directUser && segments.length === 1 && segments[0] === 'todos';
  const availableTypes = isGlobalNotice && !isTemplate ? USER_GLOBAL_NOTICE_TYPES : USER_NOTICE_TYPES;
  const modalTitle = isTemplate
    ? (modal?.initialNotice
      ? t('admin.users.noticeModal.editTemplateTitle')
      : t('admin.users.noticeModal.templateTitle'))
    : modal?.initialNotice
      ? t('admin.users.noticeModal.editTitle')
      : t('admin.users.noticeModal.newTitle');
  const modalSubtitle = isTemplate
    ? t('admin.users.noticeModal.templateSubtitle')
    : t('admin.users.noticeModal.noticeSubtitle');
  const selectedType = availableTypes.find((item) => item.id === type);

  useEffect(() => {
    if (!modal) return;
    if (availableTypes.some((item) => item.id === type)) return;

    setType(availableTypes[0]?.id || '');
  }, [availableTypes, modal, type]);

  if (!modal) return null;

  const handleSubmit = async (intent) => {
    if (!title.trim() || !body.trim()) {
      setMessage(t('admin.users.noticeModal.titleRequired'));
      return;
    }

    if (!isTemplate && !audience) {
      setMessage(t('admin.users.noticeModal.noAudience'));
      return;
    }

    if (isTemplate) {
      setSubmitting(true);
      setMessage('');

      try {
        const response = await onSendNotice({
          templateId: modal.initialNotice?.id || modal.initialNotice?.id_plantilla || null,
          titulo: title.trim(),
          contenido: body.trim(),
          tipo: type,
          urgencia: urgency,
          isTemplate: true,
        });
        setMessage(response?.message || t('admin.users.noticeModal.templateReusable'));
      } catch (error) {
        setMessage(error.message || t('admin.users.noticeModal.sendError'));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (intent === 'draft') {
      setMessage(t('admin.users.noticeModal.draftsSoon'));
      return;
    }

    if (schedule) {
      setMessage(t('admin.users.noticeModal.scheduleSoon'));
      return;
    }

    if (!supportsCommunications) {
      setMessage(t('admin.users.noticeModal.inappUnavailable'));
      return;
    }

    const destinatarios = resolveNoticeRecipients({
      directUser: modal.directUser,
      users,
      segments,
    });

    setSubmitting(true);
    setMessage('');

    try {
      const response = await onSendNotice({
        destinatarios,
        titulo: title.trim(),
        contenido: body.trim(),
        tipo: type,
        urgencia: urgency,
        prioridad: selectedType?.priority || (urgency === 'media' ? 'normal' : urgency),
        canales: ['inapp'],
        segmentos: segments,
        directUser: modal.directUser || null,
        forceUserNotice: !!modal.fromTemplate,
      });

      setMessage(response?.message || (isGlobalNotice ? t('admin.users.noticeModal.globalCreated') : t('admin.users.noticeModal.sentCount', { count: destinatarios.length })));
    } catch (error) {
      setMessage(error.message || t('admin.users.noticeModal.sendError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="usr-notice-modal-backdrop" onClick={onClose} aria-hidden="true">
      <div
        className="usr-notice-modal"
        role="dialog"
        aria-modal="true"
        aria-label={modalTitle}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="usr-notice-modal-head">
          <div className="usr-notice-modal-icon">
            <BsMegaphone />
          </div>

          <div className="usr-notice-modal-copy">
            <strong>{modalTitle}</strong>
            <span>{modalSubtitle}</span>
          </div>

          <button
            type="button"
            className="usr-modal-close"
            onClick={onClose}
            title={t('admin.users.actionModal.close')}
            aria-label={t('admin.users.actionModal.close')}
          >
            <BsXLg />
          </button>
        </div>

        <div className="usr-notice-modal-body">
          {modal.directUser ? (
            <div className="usr-direct-user">
              <span>{t('admin.users.noticeModal.directUser')}</span>
              <strong>{modal.directUser.nombre || t('admin.users.table.unknownUser')}</strong>
              <small>{modal.directUser.email || t('admin.users.table.noEmail')}</small>
            </div>
          ) : null}

          <div className="usr-notice-form-grid">
            <label className="usr-field usr-field--full">
              <span className="usr-field-label">{t('admin.users.noticeModal.titleLabel')}</span>
              <input
                type="text"
                className="usr-field-input"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={isTemplate ? t('admin.users.noticeModal.templateNamePlaceholder') : t('admin.users.noticeModal.titlePlaceholder')}
              />
            </label>

            <label className="usr-field usr-field--full">
              <span className="usr-field-label">{t('admin.users.noticeModal.bodyLabel')}</span>
              <textarea
                className="usr-field-input usr-field-input--textarea"
                rows="5"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder={t('admin.users.noticeModal.bodyPlaceholder')}
              />
            </label>

            <label className="usr-field">
              <span className="usr-field-label">{t('admin.users.noticeModal.typeLabel')}</span>
              <select
                className="usr-field-input"
                value={type}
                onChange={(event) => setType(event.target.value)}
              >
                {availableTypes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {t(`admin.users.noticeType.${item.id}`)}
                  </option>
                ))}
              </select>
            </label>

            {!isTemplate ? (
              <label className="usr-field">
                <span className="usr-field-label">{t('admin.users.noticeModal.scheduleLabel')}</span>
                <input
                  type="datetime-local"
                  className="usr-field-input"
                  value={schedule}
                  onChange={(event) => setSchedule(event.target.value)}
                />
                <small>{t('admin.users.noticeModal.scheduleSoonShort')}</small>
              </label>
            ) : null}
          </div>

          <section className="usr-notice-modal-section">
            <span className="usr-field-label">{t('admin.users.noticeModal.urgencyLabel')}</span>
            <div className="usr-urgency-grid">
              {USER_NOTICE_URGENCY.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`usr-urgency-card usr-urgency-card--${item.id}${urgency === item.id ? ' active' : ''}`}
                  onClick={() => setUrgency(item.id)}
                >
                  <span className="usr-urgency-dot" />
                  <strong>{t(`admin.users.urgency.${item.id}.label`)}</strong>
                  <small>{t(`admin.users.urgency.${item.id}.helper`)}</small>
                </button>
              ))}
            </div>
          </section>

          {!modal.directUser ? (
            <section className="usr-notice-modal-section">
              <span className="usr-field-label">{t('admin.users.noticeModal.segmentationLabel')}</span>
              <div className="usr-segment-grid">
                {USER_COMMUNICATION_SEGMENTS.map((segment) => {
                  const selected = segments.includes(segment.id);
                  const count = segment.status
                    ? metrics?.[segment.status] ?? 0
                    : metrics?.total ?? 0;

                  return (
                    <button
                      key={segment.id}
                      type="button"
                      className={`usr-segment-card${selected ? ' active' : ''}`}
                      onClick={() => toggleOption(segment.id, segments, setSegments)}
                    >
                      <span className="usr-segment-icon">
                        <BsPeople />
                      </span>
                      <span>
                        <strong>{t(`admin.users.segment.${segment.id}`)}</strong>
                        <small>{t('admin.users.noticeModal.usersCount', { count })}</small>
                      </span>
                      <span className="usr-segment-check">
                        {selected ? <BsCheckLg /> : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          <section className="usr-notice-modal-section">
            <span className="usr-field-label">{t('admin.users.noticeModal.channelsLabel')}</span>
            <div className="usr-segment-grid usr-segment-grid--channels">
              {USER_COMMUNICATION_CHANNELS.map((channel) => {
                const selected = channels.includes(channel.id);
                const Icon = CHANNEL_ICONS[channel.id] || BsBell;

                return (
                  <button
                    key={channel.id}
                    type="button"
                    className={`usr-segment-card${selected ? ' active' : ''}`}
                    onClick={() => channel.id === 'inapp' && setChannels(['inapp'])}
                    disabled={channel.id !== 'inapp'}
                  >
                    <span className="usr-segment-icon">
                      <Icon />
                    </span>
                    <span>
                      <strong>{t(`admin.users.channel.${channel.id}`)}</strong>
                      <small>{channel.id === 'inapp' ? t('admin.users.noticeModal.included') : t('admin.users.noticeModal.soon')}</small>
                    </span>
                    <span className="usr-segment-check">
                      {selected ? <BsCheckLg /> : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {!isTemplate ? (
            <div className="usr-audience-preview">
              <strong>{audience}</strong>
              <span>{t('admin.users.noticeModal.recipientEstimated', { count: audience })}</span>
              <small>{t(`admin.users.noticeType.${selectedType?.id || type}`)} - {t('admin.users.communications.urgency', { urgency })}</small>
            </div>
          ) : null}

          {message ? (
            <div className="usr-notice-message" role="status">
              {message}
            </div>
          ) : null}
        </div>

        <div className="usr-notice-modal-foot">
          <span>
            {isTemplate
              ? t('admin.users.noticeModal.templateReusable')
              : schedule
                ? t('admin.users.noticeModal.scheduledFoot')
                : t('admin.users.noticeModal.previewFallback')}
          </span>

          <div className="usr-notice-foot-actions">
            {!isTemplate ? (
              <button
                type="button"
                className="usr-reason-btn usr-reason-btn--ghost"
                onClick={() => handleSubmit('draft')}
                disabled={submitting}
              >
                {t('admin.users.noticeModal.saveDraft')}
              </button>
            ) : null}

            <button
              type="button"
              className="usr-reason-btn usr-reason-btn--primary"
              onClick={() => handleSubmit(isTemplate ? 'template' : 'send')}
              disabled={submitting}
            >
              {isTemplate
                ? (submitting
                  ? t('admin.users.noticeModal.sending')
                  : modal.initialNotice
                    ? t('admin.users.noticeModal.updateTemplate')
                    : t('admin.users.noticeModal.saveTemplate'))
                : submitting ? t('admin.users.noticeModal.sending') : t('admin.users.noticeModal.sendNow')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
