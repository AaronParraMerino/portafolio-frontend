import { useEffect, useMemo, useState } from 'react';
import {
  BsCalendar2Plus,
  BsCheck2,
  BsCodeSlash,
  BsEnvelope,
  BsGlobe2,
  BsMortarboard,
  BsPeople,
  BsPhone,
  BsPersonWorkspace,
  BsBriefcase,
  BsSearch,
  BsBell,
  BsX,
} from 'react-icons/bs';
import {
  EVENT_COMMUNICATION_CHANNELS,
  EVENT_PROFILE_TARGET_GROUPS,
  EVENT_STATUS_FILTERS,
  EVENT_TARGET_MODES,
  EVENT_TYPES,
} from '../services/eventsService';

const DEFAULT_FORM = {
  title: '',
  type: 'taller',
  status: 'borrador',
  startsAt: '',
  endsAt: '',
  sendAt: '',
  location: '',
  capacity: '',
  description: '',
  targetMode: 'all_users',
  channels: ['inapp'],
  targetSearch: '',
  targetSelections: {
    technicalSkills: [],
    softSkills: [],
    academicExperience: [],
    workExperience: [],
  },
};

const TARGET_ICONS = {
  all_users: BsGlobe2,
  segmented: BsPeople,
};

const PROFILE_TARGET_ICONS = {
  technicalSkills: BsCodeSlash,
  softSkills: BsPersonWorkspace,
  academicExperience: BsMortarboard,
  workExperience: BsBriefcase,
};

const CHANNEL_ICONS = {
  inapp: BsBell,
  email: BsEnvelope,
  push: BsPhone,
};

function toggleValue(values, value) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

export default function EventFormModal({
  modal,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!modal) return;

    const event = modal.event || {};
    setForm({
      title: event.title || '',
      type: event.type || 'taller',
      status: event.status || 'borrador',
      startsAt: event.startsAt || event.fecha_inicio || '',
      endsAt: event.endsAt || event.fecha_fin || '',
      sendAt: event.sendAt || event.fecha_envio || '',
      location: event.location || '',
      capacity: event.capacity || '',
      description: event.description || '',
      targetMode: event.targetMode || event.target_mode || 'all_users',
      channels: Array.isArray(event.channels) && event.channels.length ? event.channels : ['inapp'],
      targetSearch: '',
      targetSelections: {
        technicalSkills: toArray(event.targetSelections?.technicalSkills || event.habilidades_tecnicas),
        softSkills: toArray(event.targetSelections?.softSkills || event.habilidades_blandas),
        academicExperience: toArray(event.targetSelections?.academicExperience || event.experiencia_academica),
        workExperience: toArray(event.targetSelections?.workExperience || event.experiencia_laboral),
      },
    });
    setMessage('');
  }, [modal]);

  const selectedTargetsCount = Object.values(form.targetSelections)
    .reduce((total, items) => total + items.length, 0);

  const filteredTargetGroups = useMemo(() => {
    const normalizedQuery = form.targetSearch.trim().toLowerCase();

    return EVENT_PROFILE_TARGET_GROUPS.map((group) => ({
      ...group,
      visibleOptions: normalizedQuery
        ? group.options.filter((option) => option.toLowerCase().includes(normalizedQuery))
        : group.options,
    }));
  }, [form.targetSearch]);

  if (!modal) return null;

  const isEditing = modal.mode === 'edit';

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage('');
  };

  const handleToggleTarget = (groupId, option) => {
    setForm((current) => ({
      ...current,
      targetSelections: {
        ...current.targetSelections,
        [groupId]: toggleValue(current.targetSelections[groupId] || [], option),
      },
    }));
    setMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.location.trim()) {
      setMessage('Completa al menos el titulo y la ubicacion del evento.');
      return;
    }

    try {
      await onSave?.({
        title: form.title,
        type: form.type,
        status: form.status,
        startsAt: form.startsAt || null,
        endsAt: form.endsAt || null,
        sendAt: form.sendAt || null,
        location: form.location,
        capacity: form.capacity === '' ? 0 : Number(form.capacity),
        description: form.description,
        targetMode: form.targetMode,
        channels: form.channels,
        segments: form.targetMode === 'segmented'
          ? Object.values(form.targetSelections).flat()
          : ['all_users'],
        targetSelections: form.targetSelections,
      });
    } catch (error) {
      setMessage(error.message || 'No se pudo guardar el evento.');
    }
  };

  return (
    <div className="evt-modal-backdrop" role="presentation">
      <form className="evt-modal" onSubmit={handleSubmit} aria-label={isEditing ? 'Editar evento' : 'Crear evento'}>
        <div className="evt-modal-head">
          <span className="evt-modal-icon">
            <BsCalendar2Plus />
          </span>
          <div className="evt-modal-copy">
            <strong>{isEditing ? 'Editar evento' : 'Crear evento'}</strong>
            <span>{isEditing ? 'Ajusta la informacion del evento.' : 'Configura la convocatoria, su audiencia y envio.'}</span>
          </div>
          <button type="button" className="evt-modal-close" onClick={onClose} aria-label="Cerrar modal">
            <BsX />
          </button>
        </div>

        <div className="evt-modal-body">
          <div className="evt-form-grid">
            <label className="evt-field evt-field--full">
              <span>Titulo del evento</span>
              <input
                type="text"
                className="evt-field-input"
                value={form.title}
                onChange={(event) => handleChange('title', event.target.value)}
                placeholder="Ej. Curso de React para portafolios profesionales"
              />
            </label>

            <label className="evt-field">
              <span>Tipo</span>
              <select
                className="evt-field-input"
                value={form.type}
                onChange={(event) => handleChange('type', event.target.value)}
              >
                {EVENT_TYPES.filter((type) => type.id !== 'todos').map((type) => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </label>

            <label className="evt-field">
              <span>Estado</span>
              <select
                className="evt-field-input"
                value={form.status}
                onChange={(event) => handleChange('status', event.target.value)}
              >
                {EVENT_STATUS_FILTERS.filter((status) => status.id !== 'todos').map((status) => (
                  <option key={status.id} value={status.id}>{status.label}</option>
                ))}
              </select>
            </label>

            <label className="evt-field">
              <span>Fecha y hora de inicio</span>
              <input
                type="datetime-local"
                className="evt-field-input"
                value={form.startsAt}
                onChange={(event) => handleChange('startsAt', event.target.value)}
              />
            </label>

            <label className="evt-field">
              <span>Fecha y hora de fin</span>
              <input
                type="datetime-local"
                className="evt-field-input"
                value={form.endsAt}
                onChange={(event) => handleChange('endsAt', event.target.value)}
              />
            </label>

            <label className="evt-field">
              <span>Programar envio</span>
              <input
                type="datetime-local"
                className="evt-field-input"
                value={form.sendAt}
                onChange={(event) => handleChange('sendAt', event.target.value)}
              />
            </label>

            <label className="evt-field">
              <span>Ubicacion</span>
              <input
                type="text"
                className="evt-field-input"
                value={form.location}
                onChange={(event) => handleChange('location', event.target.value)}
                placeholder="Ej. Auditorio principal, Google Meet o Laboratorio 3"
              />
            </label>

            <label className="evt-field">
              <span>Cupos</span>
              <input
                type="number"
                min="0"
                className="evt-field-input"
                value={form.capacity}
                onChange={(event) => handleChange('capacity', event.target.value)}
                placeholder="Ej. 80"
              />
            </label>

            <label className="evt-field evt-field--full">
              <span>Descripcion</span>
              <textarea
                className="evt-field-input evt-field-input--textarea"
                value={form.description}
                onChange={(event) => handleChange('description', event.target.value)}
                placeholder="Describe el objetivo, requisitos, beneficios y detalles importantes para los usuarios."
              />
            </label>
          </div>

          <div className="evt-modal-section">
            <span className="evt-modal-section-label">Metodo de envio</span>
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

          <div className="evt-modal-section">
            <span className="evt-modal-section-label">A quien va dirigido</span>
            <div className="evt-target-mode-grid">
              {EVENT_TARGET_MODES.map((mode) => {
                const Icon = TARGET_ICONS[mode.id] || BsPeople;

                return (
                  <button
                    key={mode.id}
                    type="button"
                    className={`evt-target-mode-card${form.targetMode === mode.id ? ' active' : ''}`}
                    onClick={() => handleChange('targetMode', mode.id)}
                  >
                    <span className="evt-segment-icon">
                      <Icon />
                    </span>
                    <span>
                      <strong>{mode.label}</strong>
                      <small>{mode.helper}</small>
                    </span>
                    <span className="evt-segment-check">
                      <BsCheck2 />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {form.targetMode === 'segmented' ? (
            <div className="evt-modal-section">
              <div className="evt-section-headline">
                <span className="evt-modal-section-label">Segmentacion por portafolio</span>
                <strong>{selectedTargetsCount} seleccionados</strong>
              </div>

              <div className="evt-target-search">
                <span className="evt-search-icon">
                  <BsSearch />
                </span>
                <input
                  type="text"
                  className="evt-search-input"
                  value={form.targetSearch}
                  onChange={(event) => handleChange('targetSearch', event.target.value)}
                  placeholder="Buscar habilidad, carrera, rol o experiencia..."
                  aria-label="Buscar criterios de audiencia"
                />
              </div>

              <div className="evt-profile-checklist-grid">
                {filteredTargetGroups.map((group) => {
                  const Icon = PROFILE_TARGET_ICONS[group.id] || BsPeople;

                  return (
                    <article key={group.id} className="evt-profile-checklist-card">
                      <div className="evt-profile-checklist-head">
                        <span className="evt-profile-target-icon">
                          <Icon />
                        </span>
                        <span>
                          <strong>{group.label}</strong>
                          <small>{group.helper}</small>
                        </span>
                      </div>

                      <div className="evt-checkbox-list">
                        {group.visibleOptions.map((option) => (
                          <label key={option} className="evt-checkbox-row">
                            <input
                              type="checkbox"
                              checked={(form.targetSelections[group.id] || []).includes(option)}
                              onChange={() => handleToggleTarget(group.id, option)}
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                        {!group.visibleOptions.length ? (
                          <span className="evt-checkbox-empty">
                            {form.targetSearch ? 'Sin coincidencias' : 'Sin opciones cargadas'}
                          </span>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
              <p className="evt-section-note">
                Puedes combinar habilidades tecnicas, blandas y experiencia para dirigir cursos, trabajos o convocatorias.
              </p>
            </div>
          ) : (
            <div className="evt-audience-preview">
              <strong>Todos</strong>
              <span>usuarios de la plataforma</span>
              <small>El evento quedara disponible como convocatoria abierta.</small>
            </div>
          )}

          {message ? <div className="evt-modal-message">{message}</div> : null}
        </div>

        <div className="evt-modal-foot">
          <span>Revisa audiencia, fechas y metodo de envio antes de guardar.</span>
          <div className="evt-modal-actions">
            <button type="button" className="evt-reason-btn evt-reason-btn--ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="evt-reason-btn evt-reason-btn--primary">
              <BsCheck2 />
              Guardar evento
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
