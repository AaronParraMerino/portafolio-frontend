import { useEffect, useMemo, useState } from 'react';
import {
  BsBell,
  BsCheck2,
  BsEnvelope,
  BsMegaphone,
  BsPeople,
  BsPhone,
  BsX,
} from 'react-icons/bs';
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
  { id: 'baja', label: 'Baja', helper: 'Informativa' },
  { id: 'media', label: 'Media', helper: 'Atencion moderada' },
  { id: 'alta', label: 'Alta', helper: 'Prioridad alta' },
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
}) {
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

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.body.trim()) {
      setMessage('Completa el titulo y el mensaje antes de continuar.');
      return;
    }

    setMessage('Anuncio guardado en el formulario.');
  };

  return (
    <div className="evt-modal-backdrop" role="presentation">
      <form className="evt-modal" onSubmit={handleSubmit} aria-label={isTemplateMode ? 'Crear plantilla' : 'Crear comunicacion'}>
        <div className="evt-modal-head">
          <span className="evt-modal-icon">
            <BsMegaphone />
          </span>
          <div className="evt-modal-copy">
            <strong>{isTemplateMode ? 'Plantilla de anuncio' : 'Anuncio de plataforma'}</strong>
            <span>{isTemplateMode ? 'Guarda una base reutilizable para comunicados.' : 'Comunica cambios, oportunidades o novedades sin depender de un evento.'}</span>
          </div>
          <button type="button" className="evt-modal-close" onClick={onClose} aria-label="Cerrar modal">
            <BsX />
          </button>
        </div>

        <div className="evt-modal-body">
          <div className="evt-form-grid">
            {!isTemplateMode ? (
              <label className="evt-field evt-field--full">
                <span>Evento relacionado opcional</span>
                <select
                  className="evt-field-input"
                  value={form.eventId}
                  onChange={(event) => handleChange('eventId', event.target.value)}
                >
                  <option value="">Sin evento relacionado</option>
                  {events.map((event) => (
                    <option key={event.id || event.title} value={event.id}>{event.title}</option>
                  ))}
                </select>
              </label>
            ) : null}

            <label className="evt-field evt-field--full">
              <span>{isTemplateMode ? 'Nombre de la plantilla' : 'Titulo del anuncio'}</span>
              <input
                type="text"
                className="evt-field-input"
                value={form.title}
                onChange={(event) => handleChange('title', event.target.value)}
                placeholder={isTemplateMode ? 'Plantilla de comunicado' : 'Actualizacion importante de la plataforma'}
              />
            </label>

            <label className="evt-field">
              <span>Tipo</span>
              <select
                className="evt-field-input"
                value={form.type}
                onChange={(event) => handleChange('type', event.target.value)}
              >
                {EVENT_COMMUNICATION_TYPES.filter((type) => type.id !== 'todos').map((type) => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </label>

            {!isTemplateMode ? (
              <label className="evt-field">
                <span>Programacion</span>
                <input
                  type="datetime-local"
                  className="evt-field-input"
                  value={form.date}
                  onChange={(event) => handleChange('date', event.target.value)}
                />
              </label>
            ) : null}

            <label className="evt-field evt-field--full">
              <span>Mensaje</span>
              <textarea
                className="evt-field-input evt-field-input--textarea"
                value={form.body}
                onChange={(event) => handleChange('body', event.target.value)}
                placeholder="Contenido del anuncio"
              />
            </label>
          </div>

          {!isTemplateMode ? (
            <div className="evt-modal-section">
              <span className="evt-modal-section-label">Urgencia</span>
              <div className="evt-urgency-grid">
                {URGENCY_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`evt-urgency-card evt-urgency-card--${option.id}${form.urgency === option.id ? ' active' : ''}`}
                    onClick={() => handleChange('urgency', option.id)}
                  >
                    <span className="evt-urgency-dot" />
                    <strong>{option.label}</strong>
                    <small>{option.helper}</small>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="evt-modal-section">
            <span className="evt-modal-section-label">Canales</span>
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
                    {channel.label}
                  </button>
                );
              })}
            </div>
          </div>

          {!isTemplateMode ? (
            <div className="evt-modal-section">
              <span className="evt-modal-section-label">Audiencia del anuncio</span>
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
                      <strong>{segment.label}</strong>
                      <small>{segment.helper}</small>
                    </span>
                    <span className="evt-segment-check">
                      <BsCheck2 />
                    </span>
                  </button>
                ))}
              </div>

              <div className="evt-audience-preview">
                <strong>{form.audiences.length}</strong>
                <span>segmentos seleccionados</span>
                <small>{selectedEvent ? `Relacionado con: ${selectedEvent.title}` : 'Anuncio independiente de eventos.'}</small>
              </div>
            </div>
          ) : null}

          {message ? <div className="evt-modal-message">{message}</div> : null}
        </div>

        <div className="evt-modal-foot">
          <span>Revisa audiencia, canales y programacion antes de guardar.</span>
          <div className="evt-modal-actions">
            <button type="button" className="evt-reason-btn evt-reason-btn--ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="evt-reason-btn evt-reason-btn--primary">
              <BsCheck2 />
              {isTemplateMode ? 'Guardar plantilla' : 'Guardar anuncio'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
