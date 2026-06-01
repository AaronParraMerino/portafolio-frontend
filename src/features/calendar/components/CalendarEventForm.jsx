import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../../core/i18n';

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

const EVENT_TYPES = [
  { value: 'Personal', labelKey: 'calendar.type.personal' },
  { value: 'Académico', labelKey: 'calendar.type.academic' },
  { value: 'Trabajo', labelKey: 'calendar.type.work' },
  { value: 'Reunión', labelKey: 'calendar.type.meeting' },
  { value: 'Entrega', labelKey: 'calendar.type.delivery' },
  { value: 'Otro', labelKey: 'calendar.type.other' },
];

export default function CalendarEventForm({
  open,
  mode,
  selectedDate,
  today,
  editingEvent,
  onCancel,
  onSubmit,
}) {
  const { t } = useLanguage();
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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
    setSubmitting(false);
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
      nextErrors.titulo = t('calendar.validation.titleRequired');
    } else if (title.length > TITLE_MAX_LENGTH) {
      nextErrors.titulo = t('calendar.validation.titleMax', { count: TITLE_MAX_LENGTH });
    } else if (/\d/.test(title)) {
      nextErrors.titulo = t('calendar.validation.titleNoNumbers');
    } else if (URL_REGEX.test(title)) {
      nextErrors.titulo = t('calendar.validation.titleNoUrls');
    } else if (!TITLE_ALLOWED_REGEX.test(title)) {
      nextErrors.titulo = t('calendar.validation.titleOnlyLetters');
    }

    if (description.length > DESCRIPTION_MAX_LENGTH) {
      nextErrors.descripcion = t('calendar.validation.descriptionMax', { count: DESCRIPTION_MAX_LENGTH });
    } else if (URL_REGEX.test(description)) {
      nextErrors.descripcion = t('calendar.validation.descriptionNoUrls');
    } else if (DESCRIPTION_FORBIDDEN_REGEX.test(description)) {
      nextErrors.descripcion = t('calendar.validation.descriptionForbidden');
    }

    if (!values.fecha) {
      nextErrors.fecha = t('calendar.validation.dateRequired');
    } else if (today && values.fecha < today) {
      nextErrors.fecha = t('calendar.validation.noPastDate');
    }

    if (!values.hora) {
      nextErrors.hora = t('calendar.validation.timeRequired');
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);

    try {
      const result = await onSubmit({
        ...values,
        titulo: values.titulo.trim().replace(/\s+/g, ' '),
        descripcion: values.descripcion.trim(),
      });

      if (result === false) {
        setErrors((prev) => ({
          ...prev,
          form: t('calendar.validation.saveGeneric'),
        }));
        return;
      }

      if (result?.ok === false) {
        setErrors((prev) => ({
          ...prev,
          form: result.message || t('calendar.validation.saveShort'),
        }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="cal-event-form" onSubmit={handleSubmit}>
      <div className="cal-form-head">
        <strong>{mode === 'edit' ? t('calendar.form.editTitle') : t('calendar.form.newTitle')}</strong>
        <button type="button" className="cal-form-close" onClick={onCancel} aria-label={t('calendar.form.closeAria')}>×</button>
      </div>

      <div className="cal-field">
        <label>{t('calendar.form.titleLabel')} *</label>
        <input
          value={values.titulo}
          maxLength={TITLE_MAX_LENGTH}
          onChange={(e) => setValue('titulo', e.target.value)}
          placeholder={t('calendar.form.titlePlaceholder')}
        />
        <div className="cal-field-help">
          <span>{t('calendar.form.titleHelp')}</span>
          <span>{values.titulo.length}/{TITLE_MAX_LENGTH}</span>
        </div>
        {errors.titulo && <span className="cal-error">{errors.titulo}</span>}
      </div>

      <div className="cal-field">
        <label>{t('calendar.form.descriptionLabel')}</label>
        <textarea
          value={values.descripcion}
          maxLength={DESCRIPTION_MAX_LENGTH}
          onChange={(e) => setValue('descripcion', e.target.value)}
          placeholder={t('calendar.form.descriptionPlaceholder')}
        />
        <div className="cal-field-help">
          <span>{t('calendar.form.descriptionHelp')}</span>
          <span>{values.descripcion.length}/{DESCRIPTION_MAX_LENGTH}</span>
        </div>
        {errors.descripcion && <span className="cal-error">{errors.descripcion}</span>}
      </div>

      <div className="cal-form-row">
        <div className="cal-field">
          <label>{t('calendar.form.dateLabel')} *</label>
          <input
            type="date"
            value={values.fecha}
            min={today}
            onChange={(e) => setValue('fecha', e.target.value)}
          />
          <div className="cal-field-help">
            <span>{t('calendar.form.visibleFormat', { date: formattedDate || 'dd/mm/aaaa' })}</span>
          </div>
          {errors.fecha && <span className="cal-error">{errors.fecha}</span>}
        </div>

        <div className="cal-field">
          <label>{t('calendar.form.timeLabel')} *</label>
          <input
            type="time"
            value={values.hora}
            onChange={(e) => setValue('hora', e.target.value)}
          />
          {errors.hora && <span className="cal-error">{errors.hora}</span>}
        </div>
      </div>

      <div className="cal-field">
        <label>{t('calendar.form.typeLabel')}</label>
        <select value={values.tipo} onChange={(e) => setValue('tipo', e.target.value)}>
          {EVENT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>{t(type.labelKey)}</option>
          ))}
        </select>
      </div>

      {errors.form && <div className="cal-error cal-error-form">{errors.form}</div>}

      <div className="cal-form-actions">
        <button type="button" className="cal-btn cal-btn-secondary" onClick={onCancel} disabled={submitting}>{t('calendar.actions.cancel')}</button>
        <button type="submit" className="cal-btn cal-btn-primary" disabled={submitting}>{submitting ? t('calendar.actions.processing') : t('calendar.actions.save')}</button>
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
