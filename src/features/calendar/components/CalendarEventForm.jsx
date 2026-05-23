import { useEffect, useMemo, useState } from 'react';

const EMPTY_FORM = {
  titulo: '',
  descripcion: '',
  fecha: '',
  hora: '09:00',
  tipo: 'Personal',
};

const TITLE_MAX_LENGTH = 50;
const DESCRIPTION_MAX_LENGTH = 160;
const URL_REGEX = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|dev|bo|edu|app|tech)\b)/i;
const TITLE_ALLOWED_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;
const DESCRIPTION_FORBIDDEN_REGEX = /[#$%&/*°]/;

export default function CalendarEventForm({
  open,
  mode,
  selectedDate,
  today,
  editingEvent,
  onCancel,
  onSubmit,
}) {
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;

    if (editingEvent) {
      setValues({
        titulo: editingEvent.titulo || '',
        descripcion: editingEvent.descripcion || '',
        fecha: editingEvent.fecha || selectedDate,
        hora: editingEvent.hora || '09:00',
        tipo: editingEvent.tipo || 'Personal',
      });
    } else {
      setValues({
        ...EMPTY_FORM,
        fecha: selectedDate,
      });
    }

    setErrors({});
  }, [open, editingEvent, selectedDate]);

  const formattedDate = useMemo(() => formatDateDisplay(values.fecha), [values.fecha]);

  if (!open) return null;

  const setValue = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '', form: '' }));
  };

  const validate = () => {
    const nextErrors = {};
    const title = values.titulo.trim().replace(/\s+/g, ' ');
    const description = values.descripcion.trim();

    if (!title) {
      nextErrors.titulo = 'El título es obligatorio.';
    } else if (title.length > TITLE_MAX_LENGTH) {
      nextErrors.titulo = `El título no puede superar los ${TITLE_MAX_LENGTH} caracteres.`;
    } else if (/\d/.test(title)) {
      nextErrors.titulo = 'El título no debe contener números.';
    } else if (URL_REGEX.test(title)) {
      nextErrors.titulo = 'El título no debe contener enlaces o URLs.';
    } else if (!TITLE_ALLOWED_REGEX.test(title)) {
      nextErrors.titulo = 'El título solo debe contener letras y espacios, sin símbolos.';
    }

    if (description.length > DESCRIPTION_MAX_LENGTH) {
      nextErrors.descripcion = `La descripción no puede superar los ${DESCRIPTION_MAX_LENGTH} caracteres.`;
    } else if (URL_REGEX.test(description)) {
      nextErrors.descripcion = 'La descripción no debe contener enlaces o URLs.';
    } else if (DESCRIPTION_FORBIDDEN_REGEX.test(description)) {
      nextErrors.descripcion = 'La descripción contiene caracteres no permitidos como # $ % & / * °.';
    }

    if (!values.fecha) {
      nextErrors.fecha = 'La fecha es obligatoria.';
    } else if (today && values.fecha < today) {
      nextErrors.fecha = 'No se pueden crear eventos en fechas pasadas.';
    }

    if (!values.hora) {
      nextErrors.hora = 'La hora es obligatoria.';
    }

    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const result = onSubmit({
      ...values,
      titulo: values.titulo.trim().replace(/\s+/g, ' '),
      descripcion: values.descripcion.trim(),
    });

    if (result === false) {
      setErrors((prev) => ({
        ...prev,
        form: 'No se pudo guardar el evento. Revisa los datos ingresados.',
      }));
      return;
    }

    if (result?.ok === false) {
      setErrors((prev) => ({
        ...prev,
        form: result.message || 'No se pudo guardar el evento.',
      }));
      return;
    }
  };

  return (
    <form className="cal-event-form" onSubmit={handleSubmit}>
      <div className="cal-form-head">
        <strong>{mode === 'edit' ? 'Editar evento' : 'Nuevo evento'}</strong>
        <button type="button" className="cal-form-close" onClick={onCancel} aria-label="Cerrar formulario">×</button>
      </div>

      <div className="cal-field">
        <label>Título del evento *</label>
        <input
          value={values.titulo}
          maxLength={TITLE_MAX_LENGTH}
          onChange={(e) => setValue('titulo', e.target.value)}
          placeholder="Ej: Reunión con QA"
        />
        <div className="cal-field-help">
          <span>Solo letras y espacios. Sin números, símbolos ni enlaces.</span>
          <span>{values.titulo.length}/{TITLE_MAX_LENGTH}</span>
        </div>
        {errors.titulo && <span className="cal-error">{errors.titulo}</span>}
      </div>

      <div className="cal-field">
        <label>Descripción</label>
        <textarea
          value={values.descripcion}
          maxLength={DESCRIPTION_MAX_LENGTH}
          onChange={(e) => setValue('descripcion', e.target.value)}
          placeholder="Detalle breve del evento"
        />
        <div className="cal-field-help">
          <span>No se permiten enlaces ni caracteres como # $ % & / * °.</span>
          <span>{values.descripcion.length}/{DESCRIPTION_MAX_LENGTH}</span>
        </div>
        {errors.descripcion && <span className="cal-error">{errors.descripcion}</span>}
      </div>

      <div className="cal-form-row">
        <div className="cal-field">
          <label>Fecha *</label>
          <input
            type="date"
            value={values.fecha}
            min={today}
            onChange={(e) => setValue('fecha', e.target.value)}
          />
          <div className="cal-field-help">
            <span>Formato visible: {formattedDate || 'dd/mm/aaaa'}</span>
          </div>
          {errors.fecha && <span className="cal-error">{errors.fecha}</span>}
        </div>

        <div className="cal-field">
          <label>Hora *</label>
          <input
            type="time"
            value={values.hora}
            onChange={(e) => setValue('hora', e.target.value)}
          />
          {errors.hora && <span className="cal-error">{errors.hora}</span>}
        </div>
      </div>

      <div className="cal-field">
        <label>Tipo</label>
        <select value={values.tipo} onChange={(e) => setValue('tipo', e.target.value)}>
          <option>Personal</option>
          <option>Académico</option>
          <option>Trabajo</option>
          <option>Reunión</option>
          <option>Entrega</option>
          <option>Otro</option>
        </select>
      </div>

      {errors.form && <div className="cal-error cal-error-form">{errors.form}</div>}

      <div className="cal-form-actions">
        <button type="button" className="cal-btn cal-btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="cal-btn cal-btn-primary">Guardar</button>
      </div>
    </form>
  );
}

function formatDateDisplay(value) {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return '';
  return `${day}/${month}/${year}`;
}
