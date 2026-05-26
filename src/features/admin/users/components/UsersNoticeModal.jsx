import { useEffect, useMemo, useState } from 'react';
import {
  BsBell,
  BsCheckLg,
  BsEnvelope,
  BsMegaphone,
  BsPeople,
  BsPhone,
  BsXLg,
} from 'react-icons/bs';
import {
  USER_COMMUNICATION_CHANNELS,
  USER_COMMUNICATION_SEGMENTS,
  USER_NOTICE_TYPES,
  USER_NOTICE_URGENCY,
  estimateUsersAudience,
} from '../services/usersService';

const CHANNEL_ICONS = {
  inapp: BsBell,
  email: BsEnvelope,
  push: BsPhone,
};

function toggleOption(value, selectedValues, onChange) {
  if (selectedValues.includes(value)) {
    if (selectedValues.length === 1) return;
    onChange(selectedValues.filter((item) => item !== value));
    return;
  }

  if (value === 'todos' || value === 'seleccionados') {
    onChange([value]);
    return;
  }

  onChange([...selectedValues.filter((item) => !['todos', 'seleccionados'].includes(item)), value]);
}

function resolveNoticeRecipients({ directUser, users, selectedIds, segments }) {
  if (directUser?.id) return [directUser.id];

  if (segments.includes('seleccionados')) {
    return selectedIds.map((id) => Number(id)).filter(Boolean);
  }

  const statuses = {
    activos: 'activo',
    pausados: 'pausado',
    bloqueados: 'bloqueado',
    inactivos: 'inactivo',
  };

  return users
    .filter((user) => segments.includes('todos') || segments.some((segment) => statuses[segment] === user.estado))
    .map((user) => Number(user.id))
    .filter(Boolean);
}

export default function UsersNoticeModal({
  modal,
  users,
  selectedIds,
  metrics,
  supportsCommunications,
  onSendNotice,
  onClose,
}) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState('cuenta');
  const [urgency, setUrgency] = useState('baja');
  const [segments, setSegments] = useState(['todos']);
  const [channels, setChannels] = useState(['inapp']);
  const [schedule, setSchedule] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!modal) return;

    const initialNotice = modal.initialNotice || {};

    setTitle(initialNotice.title || initialNotice.titulo || (modal.directUser ? `Aviso para ${modal.directUser.nombre || 'usuario'}` : ''));
    setBody(initialNotice.body || initialNotice.preview || initialNotice.cuerpo || '');
    setType(initialNotice.type || initialNotice.tipo || (modal.mode === 'template' ? 'sistema' : 'cuenta'));
    setUrgency(initialNotice.urgency || initialNotice.urgencia || 'baja');
    setSegments(initialNotice.segments || initialNotice.segmentos || (modal.directUser ? ['seleccionados'] : modal.initialSegments || ['todos']));
    setChannels(['inapp']);
    setSchedule(initialNotice.scheduledAt || '');
    setMessage('');
    setSubmitting(false);
  }, [modal]);

  const audience = useMemo(() => {
    if (modal?.directUser) return 1;

    return estimateUsersAudience({
      users,
      selectedIds,
      segments,
    });
  }, [modal, selectedIds, segments, users]);

  if (!modal) return null;

  const isTemplate = modal.mode === 'template';
  const modalTitle = isTemplate
    ? 'Nueva plantilla de usuarios'
    : modal.initialNotice
      ? 'Editar aviso a usuarios'
      : 'Nuevo aviso a usuarios';
  const modalSubtitle = isTemplate
    ? 'Guarda una estructura reutilizable para avisos frecuentes.'
    : 'Segmenta por estado, seleccion o usuario puntual.';
  const selectedType = USER_NOTICE_TYPES.find((item) => item.id === type);

  const handleSubmit = async (intent) => {
    if (!title.trim() || !body.trim()) {
      setMessage('Completa titulo y mensaje antes de continuar.');
      return;
    }

    if (!isTemplate && !audience) {
      setMessage('La segmentacion actual no tiene destinatarios.');
      return;
    }

    if (isTemplate) {
      setMessage('Las plantillas se habilitaran en una siguiente integracion.');
      return;
    }

    if (intent === 'draft') {
      setMessage('El guardado de borradores aun no esta disponible.');
      return;
    }

    if (schedule) {
      setMessage('La programacion aun no esta disponible. Quita la fecha para enviar ahora.');
      return;
    }

    if (!supportsCommunications) {
      setMessage('El envio in-app todavia no esta disponible.');
      return;
    }

    const destinatarios = resolveNoticeRecipients({
      directUser: modal.directUser,
      users,
      selectedIds,
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
        canales: ['inapp'],
        segmentos: segments,
      });

      setMessage(response?.message || `Aviso enviado a ${destinatarios.length} usuario(s).`);
    } catch (error) {
      setMessage(error.message || 'No se pudo enviar el aviso.');
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
            title="Cerrar"
            aria-label="Cerrar"
          >
            <BsXLg />
          </button>
        </div>

        <div className="usr-notice-modal-body">
          {modal.directUser ? (
            <div className="usr-direct-user">
              <span>Usuario directo</span>
              <strong>{modal.directUser.nombre || 'Usuario sin nombre'}</strong>
              <small>{modal.directUser.email || 'Sin correo registrado'}</small>
            </div>
          ) : null}

          <div className="usr-notice-form-grid">
            <label className="usr-field usr-field--full">
              <span className="usr-field-label">Titulo</span>
              <input
                type="text"
                className="usr-field-input"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={isTemplate ? 'Nombre visible de la plantilla' : 'Titulo del aviso'}
              />
            </label>

            <label className="usr-field usr-field--full">
              <span className="usr-field-label">Mensaje</span>
              <textarea
                className="usr-field-input usr-field-input--textarea"
                rows="5"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Contenido que recibiran los usuarios."
              />
            </label>

            <label className="usr-field">
              <span className="usr-field-label">Tipo</span>
              <select
                className="usr-field-input"
                value={type}
                onChange={(event) => setType(event.target.value)}
              >
                {USER_NOTICE_TYPES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            {!isTemplate ? (
              <label className="usr-field">
                <span className="usr-field-label">Programacion</span>
                <input
                  type="datetime-local"
                  className="usr-field-input"
                  value={schedule}
                  onChange={(event) => setSchedule(event.target.value)}
                />
                <small>Proximamente. Por ahora el envio es inmediato.</small>
              </label>
            ) : null}
          </div>

          <section className="usr-notice-modal-section">
            <span className="usr-field-label">Urgencia</span>
            <div className="usr-urgency-grid">
              {USER_NOTICE_URGENCY.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`usr-urgency-card usr-urgency-card--${item.id}${urgency === item.id ? ' active' : ''}`}
                  onClick={() => setUrgency(item.id)}
                >
                  <span className="usr-urgency-dot" />
                  <strong>{item.label}</strong>
                  <small>{item.helper}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="usr-notice-modal-section">
            <span className="usr-field-label">Segmentacion</span>
            <div className="usr-segment-grid">
              {USER_COMMUNICATION_SEGMENTS.map((segment) => {
                const selected = segments.includes(segment.id);
                const count = segment.id === 'seleccionados'
                  ? selectedIds.length
                  : segment.status
                    ? metrics?.[segment.status] ?? 0
                    : metrics?.total ?? 0;

                return (
                  <button
                    key={segment.id}
                    type="button"
                    className={`usr-segment-card${selected ? ' active' : ''}`}
                    onClick={() => toggleOption(segment.id, segments, setSegments)}
                    disabled={!!modal.directUser && segment.id !== 'seleccionados'}
                  >
                    <span className="usr-segment-icon">
                      <BsPeople />
                    </span>
                    <span>
                      <strong>{segment.label}</strong>
                      <small>{count} usuario{count === 1 ? '' : 's'}</small>
                    </span>
                    <span className="usr-segment-check">
                      {selected ? <BsCheckLg /> : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="usr-notice-modal-section">
            <span className="usr-field-label">Canales</span>
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
                      <strong>{channel.label}</strong>
                      <small>{channel.id === 'inapp' ? 'Incluido' : 'Proximamente'}</small>
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
              <span>
                destinatario{audience === 1 ? '' : 's'} estimado{audience === 1 ? '' : 's'}
              </span>
              <small>{selectedType?.label || 'Aviso'} - urgencia {urgency}</small>
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
              ? 'Plantilla reutilizable para futuros avisos.'
              : schedule
                ? 'El aviso quedara programado con la fecha elegida.'
                : 'Sin fecha: preparado para envio inmediato.'}
          </span>

          <div className="usr-notice-foot-actions">
            {!isTemplate ? (
              <button
                type="button"
                className="usr-reason-btn usr-reason-btn--ghost"
                onClick={() => handleSubmit('draft')}
                disabled={submitting}
              >
                Guardar borrador
              </button>
            ) : null}

            <button
              type="button"
              className="usr-reason-btn usr-reason-btn--primary"
              onClick={() => handleSubmit(isTemplate ? 'template' : 'send')}
              disabled={submitting}
            >
              {isTemplate ? 'Guardar plantilla' : submitting ? 'Enviando...' : 'Enviar ahora'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
