import { useEffect, useMemo, useState } from 'react';
import {
  BsBell,
  BsCheck2,
  BsEnvelope,
  BsMegaphone,
  BsPeople,
  BsPhone,
} from 'react-icons/bs';
import { useLanguage } from '../../../../core/i18n';
import AdminEdit, { AdminEditBody, AdminEditFieldError, AdminEditFooter, AdminEditSection } from '../../layout/AdminEdit';
import {
  EVENT_COMMUNICATION_AUDIENCES,
  EVENT_COMMUNICATION_CHANNELS,
  EVENT_COMMUNICATION_TYPES,
} from '../services/eventsService';

const DEFAULT_FORM = {
  eventId: '',
  title: '',
  type: 'plataforma',
  urgency: 'baja',
  date: '',
  body: '',
  audiences: ['all_users'],
  channels: ['inapp'],
};

const CHANNEL_ICONS = {
  inapp: BsBell,
  email: BsEnvelope,
  push: BsPhone,
};

const URGENCY_OPTIONS = [
  { id: 'baja' },
  { id: 'media' },
  { id: 'alta' },
];

function toggleValue(values, value) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export default function EventCommunicationModal({
  modal,
  events,
  onClose,
  onSave,
}) {
  const { t } = useLanguage();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!modal) return;

    const source = modal.communication || modal.template || {};
    setForm({
      eventId: modal.event?.id || source.eventId || '',
      title: source.title || '',
      type: source.type || 'plataforma',
      urgency: source.urgency || 'baja',
      date: source.date && source.date !== '--' ? source.date : '',
      body: source.body || '',
      audiences: Array.isArray(source.audiences) && source.audiences.length
        ? source.audiences
        : Array.isArray(source.segments) && source.segments.length
          ? source.segments
          : ['all_users'],
      channels: Array.isArray(source.channels) && source.channels.length ? source.channels : ['inapp'],
    });
    setMessage('');
  }, [modal]);

  const selectedEvent = useMemo(
    () => events.find((event) => String(event.id) === String(form.eventId)) || modal?.event || null,
    [events, form.eventId, modal],
  );

  if (!modal) return null;

  const isTemplateMode = modal.mode === 'template';

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.body.trim()) {
      setMessage(t('adminEvents.communicationModal.validationRequired'));
      return;
    }

    const payload = isTemplateMode
      ? {
          title: form.title,
          type: form.type,
          body: form.body,
          channels: form.channels,
          payload: {
            channels: form.channels,
          },
        }
      : {
          eventId: form.eventId || null,
          title: form.title,
          type: form.type,
          urgency: form.urgency,
          status: modal.communication?.status || (form.date ? 'programado' : 'borrador'),
          date: form.date || null,
          body: form.body,
          audiences: form.audiences,
          segments: form.audiences,
          channels: form.channels,
        };

    try {
      await onSave?.(payload);
    } catch (error) {
      setMessage(error.message || t('adminEvents.communicationModal.saveError'));
    }
  };

  return (
    <AdminEdit
      as="form"
      title={isTemplateMode ? t('adminEvents.communicationModal.templateTitle') : t('adminEvents.communicationModal.announcementTitle')}
      subtitle={isTemplateMode ? t('adminEvents.communicationModal.templateSubtitle') : t('adminEvents.communicationModal.announcementSubtitle')}
      icon={<BsMegaphone />}
      onClose={onClose}
      onSubmit={handleSubmit}
      size="lg"
      ariaLabel={isTemplateMode ? t('adminEvents.communicationModal.createTemplate') : t('adminEvents.communicationModal.createCommunication')}
    >
        <AdminEditBody>
          <div className="evt-form-grid">
            {!isTemplateMode ? (
              <label className="evt-field evt-field--full">
                <span>{t('adminEvents.communicationModal.related', { title: '' }).replace(': ', '')}</span>
                <select
                  className="evt-field-input"
                  value={form.eventId}
                  onChange={(event) => handleChange('eventId', event.target.value)}
                >
                  <option value="">{t('adminEvents.communicationModal.independent')}</option>
                  {events.map((event) => (
                    <option key={event.id || event.title} value={event.id}>{event.title}</option>
                  ))}
                </select>
              </label>
            ) : null}

            <label className="evt-field evt-field--full">
              <span>{isTemplateMode ? t('adminEvents.communicationModal.nameLabel') : t('adminEvents.communicationModal.titleLabel')}</span>
              <input
                type="text"
                className="evt-field-input"
                value={form.title}
                onChange={(event) => handleChange('title', event.target.value)}
                placeholder={isTemplateMode ? t('adminEvents.communicationModal.templatePlaceholder') : t('adminEvents.communicationModal.announcementPlaceholder')}
              />
            </label>

            <label className="evt-field">
              <span>{t('adminEvents.form.type')}</span>
              <select
                className="evt-field-input"
                value={form.type}
                onChange={(event) => handleChange('type', event.target.value)}
              >
                {EVENT_COMMUNICATION_TYPES.filter((type) => type.id !== 'todos').map((type) => (
                  <option key={type.id} value={type.id}>{t(`adminEvents.type.${type.id}`)}</option>
                ))}
              </select>
            </label>

            {!isTemplateMode ? (
              <label className="evt-field">
                <span>{t('adminEvents.communicationModal.schedule')}</span>
                <input
                  type="datetime-local"
                  className="evt-field-input"
                  value={form.date}
                  onChange={(event) => handleChange('date', event.target.value)}
                />
              </label>
            ) : null}

            <label className="evt-field evt-field--full">
              <span>{t('adminEvents.communicationModal.message')}</span>
              <textarea
                className="evt-field-input evt-field-input--textarea"
                value={form.body}
                onChange={(event) => handleChange('body', event.target.value)}
                placeholder={t('adminEvents.communicationModal.contentPlaceholder')}
              />
            </label>
          </div>

          {!isTemplateMode ? (
            <AdminEditSection label={t('adminEvents.communicationModal.urgency')}>
              <div className="evt-urgency-grid">
                {URGENCY_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`evt-urgency-card evt-urgency-card--${option.id}${form.urgency === option.id ? ' active' : ''}`}
                    onClick={() => handleChange('urgency', option.id)}
                  >
                    <span className="evt-urgency-dot" />
                    <strong>{t(`adminEvents.urgency.${option.id}`)}</strong>
                    <small>{t(`adminEvents.urgency.${option.id}Helper`)}</small>
                  </button>
                ))}
              </div>
            </AdminEditSection>
          ) : null}

          <AdminEditSection label={t('adminEvents.communicationModal.channels')}>
            <div className="evt-option-row">
              {EVENT_COMMUNICATION_CHANNELS.map((channel) => {
                const Icon = CHANNEL_ICONS[channel.id] || BsBell;

                return (
                  <button
                    key={channel.id}
                    type="button"
                    className={`evt-option-btn${form.channels.includes(channel.id) ? ' active' : ''}`}
                    onClick={() => handleChange('channels', toggleValue(form.channels, channel.id))}
                  >
                    <Icon />
                    {t(`adminEvents.channel.${channel.id}`)}
                  </button>
                );
              })}
            </div>
          </AdminEditSection>

          {!isTemplateMode ? (
            <AdminEditSection label={t('adminEvents.communicationModal.audience')}>
              <div className="evt-segment-grid">
                {EVENT_COMMUNICATION_AUDIENCES.map((segment) => (
                  <button
                    key={segment.id}
                    type="button"
                    className={`evt-segment-card${form.audiences.includes(segment.id) ? ' active' : ''}`}
                    onClick={() => handleChange('audiences', toggleValue(form.audiences, segment.id))}
                  >
                    <span className="evt-segment-icon">
                      <BsPeople />
                    </span>
                    <span>
                      <strong>{t(`adminEvents.communicationAudience.${segment.id}.label`)}</strong>
                      <small>{t(`adminEvents.communicationAudience.${segment.id}.helper`)}</small>
                    </span>
                    <span className="evt-segment-check">
                      <BsCheck2 />
                    </span>
                  </button>
                ))}
              </div>

              <div className="evt-audience-preview">
                <strong>{form.audiences.length}</strong>
                <span>{t('adminEvents.common.selected', { count: form.audiences.length })}</span>
                <small>{selectedEvent ? t('adminEvents.communicationModal.related', { title: selectedEvent.title }) : t('adminEvents.communicationModal.independent')}</small>
              </div>
            </AdminEditSection>
          ) : null}

          <AdminEditFieldError msg={message} />
        </AdminEditBody>

        <AdminEditFooter>
          <span>{t('adminEvents.communicationModal.footer')}</span>
          <div className="evt-modal-actions">
            <button type="button" className="evt-reason-btn evt-reason-btn--ghost" onClick={onClose}>
              {t('adminEvents.common.cancel')}
            </button>
            <button type="submit" className="evt-reason-btn evt-reason-btn--primary">
              <BsCheck2 />
              {isTemplateMode ? t('adminEvents.communicationModal.saveTemplate') : t('adminEvents.communicationModal.saveAnnouncement')}
            </button>
          </div>
        </AdminEditFooter>
    </AdminEdit>
  );
}
