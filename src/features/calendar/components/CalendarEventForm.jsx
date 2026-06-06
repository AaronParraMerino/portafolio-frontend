import { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../../../core/i18n';

const EMPTY_FORM = {
  titulo: '',
  descripcion: '',
  fecha: '',
  hora: '09:00',
  tipo: 'Personal',
};

const CALENDAR_FORM_DRAFT_KEY = 'creafolio_calendar_event_form_draft_v2';

const TITLE_MAX_LENGTH = 50;
const DESCRIPTION_MAX_LENGTH = 160;
const URL_REGEX = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|dev|bo|edu|app|tech)\b)/i;
const TITLE_ALLOWED_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;
const EMOJI_REGEX = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const DESCRIPTION_ALLOWED_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s.,;:¿?¡!()'"_-]*$/;
const DESCRIPTION_REPEATED_SYMBOL_REGEX = /([.,;:¿?¡!()'"_-])\1{2,}/;

const EVENT_TYPES = [
  { value: 'Personal', labelKey: 'calendar.type.personal' },
  { value: 'Académico', labelKey: 'calendar.type.academic' },
  { value: 'Trabajo', labelKey: 'calendar.type.work' },
  { value: 'Reunión', labelKey: 'calendar.type.meeting' },
  { value: 'Entrega', labelKey: 'calendar.type.delivery' },
];

const EVENT_TYPE_VALUES = new Set(EVENT_TYPES.map((type) => type.value));

function getSafeEventType(value) {
  return EVENT_TYPE_VALUES.has(value) ? value : EMPTY_FORM.tipo;
}

function readDraft(today) {
  if (typeof window === 'undefined') return null;

  try {
    const rawDraft = window.localStorage.getItem(CALENDAR_FORM_DRAFT_KEY);
    if (!rawDraft) return null;

    const draft = JSON.parse(rawDraft);
    const values = draft?.values || {};
    const draftDate = values.fecha || '';

    if (today && draftDate && draftDate < today) {
      window.localStorage.removeItem(CALENDAR_FORM_DRAFT_KEY);
      return null;
    }

    return {
      ...draft,
      values: {
        ...EMPTY_FORM,
        ...values,
        tipo: getSafeEventType(values.tipo),
      },
    };
  } catch (error) {
    window.localStorage.removeItem(CALENDAR_FORM_DRAFT_KEY);
    return null;
  }
}

function clearDraft() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(CALENDAR_FORM_DRAFT_KEY);
}

function hasMeaningfulDraft(values, selectedDate) {
  return Boolean(
    values.titulo?.trim()
    || values.descripcion?.trim()
    || values.tipo !== EMPTY_FORM.tipo
    || values.hora !== EMPTY_FORM.hora
    || (values.fecha && values.fecha !== selectedDate)
  );
}

function countReadableCharacters(value) {
  return String(value || '').replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]/g, '').length;
}

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
  const [draftRestored, setDraftRestored] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      initializedRef.current = false;
      return;
    }

    if (editingEvent) {
      setValues({
        titulo: editingEvent.titulo || '',
        descripcion: editingEvent.descripcion || '',
        fecha: editingEvent.fecha || selectedDate,
        hora: editingEvent.hora || EMPTY_FORM.hora,
        tipo: getSafeEventType(editingEvent.tipo),
      });
      setDraftRestored(false);
    } else {
      const draft = readDraft(today);

      if (draft?.values) {
        setValues({
          ...EMPTY_FORM,
          ...draft.values,
          fecha: draft.values.fecha || selectedDate,
          tipo: getSafeEventType(draft.values.tipo),
        });
        setDraftRestored(true);
      } else {
        setValues({
          ...EMPTY_FORM,
          fecha: selectedDate,
        });
        setDraftRestored(false);
      }
    }

    initializedRef.current = true;
    setErrors({});
  }, [open, editingEvent, selectedDate, today]);

  useEffect(() => {
    if (!open || !initializedRef.current || editingEvent) return;

    if (!hasMeaningfulDraft(values, selectedDate)) {
      clearDraft();
      return;
    }

    window.localStorage.setItem(CALENDAR_FORM_DRAFT_KEY, JSON.stringify({
      mode,
      selectedDate,
      updatedAt: new Date().toISOString(),
      values,
    }));
  }, [editingEvent, mode, open, selectedDate, values]);

  useEffect(() => {
    if (!open || editingEvent) return undefined;

    const handleBeforeUnload = (event) => {
      if (!hasMeaningfulDraft(values, selectedDate)) return undefined;

      event.preventDefault();
      event.returnValue = '';

      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [editingEvent, open, selectedDate, values]);

  const formattedDate = useMemo(() => formatDateDisplay(values.fecha), [values.fecha]);

  if (!open) return null;

  const setValue = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '', form: '' }));
    setDraftRestored(false);
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
    } else if (EMOJI_REGEX.test(description)) {
      nextErrors.descripcion = t('calendar.validation.descriptionNoEmoji');
    } else if (URL_REGEX.test(description)) {
      nextErrors.descripcion = t('calendar.validation.descriptionNoUrls');
    } else if (description && !DESCRIPTION_ALLOWED_REGEX.test(description)) {
      nextErrors.descripcion = t('calendar.validation.descriptionOnlyBasic');
    } else if (DESCRIPTION_REPEATED_SYMBOL_REGEX.test(description)) {
      nextErrors.descripcion = t('calendar.validation.descriptionRepeatedSymbols');
    } else if (description && countReadableCharacters(description) < 3) {
      nextErrors.descripcion = t('calendar.validation.descriptionReadable');
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

  const handleCancel = () => {
    clearDraft();
    setDraftRestored(false);
    onCancel();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const result = await onSubmit({
      ...values,
      titulo: values.titulo.trim().replace(/\s+/g, ' '),
      descripcion: values.descripcion.trim().replace(/\s+/g, ' '),
      tipo: getSafeEventType(values.tipo),
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
      return;
    }

    clearDraft();
    setDraftRestored(false);
  };

  return (
    <form className="cal-event-form" onSubmit={handleSubmit}>
      <div className="cal-form-head">
        <strong>{mode === 'edit' ? t('calendar.form.editTitle') : t('calendar.form.newTitle')}</strong>
        <button type="button" className="cal-form-close" onClick={handleCancel} aria-label={t('calendar.form.closeAria')}>×</button>
      </div>

      {draftRestored && (
        <div className="cal-draft-notice">
          {t('calendar.feedback.draftRestored')}
        </div>
      )}

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
            aria-label={t('calendar.form.timeAria')}
            title={t('calendar.form.timeAria')}
            onChange={(e) => setValue('hora', e.target.value)}
          />
          <div className="cal-field-help cal-time-help">
            <span>{t('calendar.form.timeHelp')}</span>
          </div>
          <div className="cal-time-labels" aria-hidden="true">
            <span>{t('calendar.form.timeHourLabel')}</span>
            <span>{t('calendar.form.timeMinuteLabel')}</span>
          </div>
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
        <button type="button" className="cal-btn cal-btn-secondary" onClick={handleCancel}>{t('calendar.actions.cancel')}</button>
        <button type="submit" className="cal-btn cal-btn-primary">{t('calendar.actions.save')}</button>
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
