import { useState } from 'react';
import {
  BsCheck2,
  BsExclamationTriangle,
  BsInfoCircle,
  BsPhone,
  BsShieldCheck,
  BsX,
} from 'react-icons/bs';

const COUNTRIES = [
  { code: 'BO', name: 'Bolivia', dial: '+591', telRegex: /^\d{8}$/, telHint: '8 digitos (ej: 70000000)' },
  { code: 'AR', name: 'Argentina', dial: '+54', telRegex: /^\d{10}$/, telHint: '10 digitos' },
  { code: 'BR', name: 'Brasil', dial: '+55', telRegex: /^\d{10,11}$/, telHint: '10-11 digitos' },
  { code: 'CL', name: 'Chile', dial: '+56', telRegex: /^\d{9}$/, telHint: '9 digitos' },
  { code: 'CO', name: 'Colombia', dial: '+57', telRegex: /^\d{10}$/, telHint: '10 digitos' },
  { code: 'EC', name: 'Ecuador', dial: '+593', telRegex: /^\d{9,10}$/, telHint: '9-10 digitos' },
  { code: 'PE', name: 'Peru', dial: '+51', telRegex: /^\d{9}$/, telHint: '9 digitos' },
  { code: 'PY', name: 'Paraguay', dial: '+595', telRegex: /^\d{9}$/, telHint: '9 digitos' },
  { code: 'UY', name: 'Uruguay', dial: '+598', telRegex: /^\d{8,9}$/, telHint: '8-9 digitos' },
  { code: 'VE', name: 'Venezuela', dial: '+58', telRegex: /^\d{10}$/, telHint: '10 digitos' },
  { code: 'MX', name: 'Mexico', dial: '+52', telRegex: /^\d{10}$/, telHint: '10 digitos' },
  { code: 'US', name: 'Estados Unidos', dial: '+1', telRegex: /^\d{10}$/, telHint: '10 digitos' },
  { code: 'ES', name: 'Espana', dial: '+34', telRegex: /^\d{9}$/, telHint: '9 digitos' },
  { code: 'OTHER', name: 'Otro pais', dial: '', telRegex: /^\d{6,15}$/, telHint: '6-15 digitos' },
];

const DEFAULT_FORM = {
  documentId: '',
  currentPhoneCountry: 'BO',
  currentPhone: '',
  referencePhoneCountry: 'BO',
  referencePhone: '',
  backupEmail: '',
  organization: '',
  role: '',
  reason: '',
  experience: '',
  links: '',
  accepts: false,
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const URL_REGEX = /https?:\/\/[^\s,]+\.[^\s,]{2,}/i;
const INVALID_CHARS_TEXT = /[<>{}[\]\\]/;

function normalize(value) {
  return String(value || '').trim();
}

function digitsOnly(value) {
  return normalize(value).replace(/\D/g, '');
}

function getUserEmail(user) {
  return normalize(user?.correo || user?.email || user?.usuario?.correo || user?.profile?.correo);
}

function getUserPhone(user) {
  return normalize(user?.telefono || user?.phone || user?.usuario?.telefono || user?.profile?.telefono);
}

function getUserName(user) {
  const first = normalize(user?.nombre || user?.name || user?.usuario?.nombre || user?.profile?.nombre);
  const last = normalize(user?.apellido || user?.usuario?.apellido || user?.profile?.apellido);
  return [first, last].filter(Boolean).join(' ') || 'Usuario autenticado';
}

function countryByCode(code) {
  return COUNTRIES.find((country) => country.code === code) || COUNTRIES[0];
}

function detectPhoneCountry(phone) {
  const normalizedPhone = normalize(phone);
  return COUNTRIES.find((country) => country.dial && normalizedPhone.startsWith(country.dial)) || COUNTRIES[0];
}

function buildPhone(countryCode, value) {
  const country = countryByCode(countryCode);
  const number = digitsOnly(value);
  return number ? `${country.dial}${number}` : '';
}

function validatePhone(value, countryCode, label) {
  const onlyDigits = digitsOnly(value);
  const country = countryByCode(countryCode);

  if (!onlyDigits) return `${label} es obligatorio.`;
  if (!/^\d+$/.test(onlyDigits)) return 'Solo se permiten digitos, sin guiones ni parentesis.';
  if (!country.telRegex.test(onlyDigits)) return `Numero invalido para ${country.name}. ${country.telHint}.`;

  return '';
}

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <div className="dbe-field-error" role="alert">
      <BsExclamationTriangle />
      {msg}
    </div>
  );
}

function PhoneField({
  label,
  countryValue,
  phoneValue,
  countryField,
  phoneField,
  error,
  onChange,
}) {
  const country = countryByCode(countryValue);

  return (
    <label className="evt-field">
      <span>{label}</span>
      <div className={`dbe-phone-wrap${error ? ' is-invalid' : ''}`}>
        <select
          className="dbe-phone-country"
          value={countryValue}
          onChange={(event) => onChange(countryField, event.target.value)}
          aria-label={`${label} pais`}
        >
          {COUNTRIES.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name} {item.dial}
            </option>
          ))}
        </select>
        <input
          className="dbe-phone-input"
          value={phoneValue}
          onChange={(event) => onChange(phoneField, event.target.value)}
          placeholder={country.telHint.split(' ')[0] || '00000000'}
          inputMode="numeric"
          maxLength={16}
          required
        />
      </div>
      {!error ? <small className="dbe-field-hint">{country.telHint}. El codigo {country.dial || 'internacional'} se agrega automaticamente.</small> : null}
      <FieldError msg={error} />
    </label>
  );
}

export default function PublisherPermissionModal({
  open,
  user,
  onClose,
  onSubmit,
}) {
  const detectedPhone = getUserPhone(user);
  const detectedCountry = detectPhoneCountry(detectedPhone);
  const [form, setForm] = useState(() => ({
    ...DEFAULT_FORM,
    currentPhoneCountry: detectedCountry.code,
    referencePhoneCountry: detectedCountry.code,
  }));
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (!open) return null;

  const currentEmail = getUserEmail(user);
  const displayName = getUserName(user);
  const currentPhoneValue = detectedPhone || buildPhone(form.currentPhoneCountry, form.currentPhone);
  const currentPhoneDigits = digitsOnly(currentPhoneValue);
  const referencePhoneValue = buildPhone(form.referencePhoneCountry, form.referencePhone);

  const validateField = (field) => {
    const value = normalize(form[field]);

    switch (field) {
      case 'documentId':
        if (!value) return 'El documento de identidad es obligatorio.';
        if (value.length < 5) return 'Minimo 5 caracteres.';
        if (value.length > 30) return 'Maximo 30 caracteres.';
        if (INVALID_CHARS_TEXT.test(value)) return 'Caracteres no permitidos: < > { } [ ]';
        return '';
      case 'currentPhone':
        if (detectedPhone) return '';
        return validatePhone(form.currentPhone, form.currentPhoneCountry, 'El telefono actual');
      case 'referencePhone': {
        const phoneError = validatePhone(form.referencePhone, form.referencePhoneCountry, 'El numero de referencia');
        if (phoneError) return phoneError;
        if (digitsOnly(referencePhoneValue) === currentPhoneDigits) return 'Este numero es igual al telefono actual de tu perfil.';
        return '';
      }
      case 'backupEmail':
        if (!value) return 'El correo de respaldo es obligatorio.';
        if (!EMAIL_REGEX.test(value)) return 'Ingresa un correo valido.';
        if (currentEmail && value.toLowerCase() === currentEmail.toLowerCase()) return 'Este correo es igual al correo actual de tu cuenta.';
        if (value.length > 120) return 'Maximo 120 caracteres.';
        return '';
      case 'organization':
        if (!value) return 'La organizacion o institucion es obligatoria.';
        if (value.length < 3) return 'Minimo 3 caracteres.';
        if (value.length > 100) return 'Maximo 100 caracteres.';
        if (INVALID_CHARS_TEXT.test(value)) return 'Caracteres no permitidos: < > { } [ ]';
        return '';
      case 'role':
        if (!value) return 'El cargo o relacion es obligatorio.';
        if (value.length < 3) return 'Minimo 3 caracteres.';
        if (value.length > 80) return 'Maximo 80 caracteres.';
        if (INVALID_CHARS_TEXT.test(value)) return 'Caracteres no permitidos: < > { } [ ]';
        return '';
      case 'reason':
        if (!value) return 'El motivo de publicacion es obligatorio.';
        if (value.length < 30) return `Minimo 30 caracteres (${value.length}/30).`;
        if (value.length > 500) return `Maximo 500 caracteres (${value.length}/500).`;
        if (INVALID_CHARS_TEXT.test(value)) return 'Caracteres no permitidos: < > { } [ ]';
        return '';
      case 'experience':
        if (!value) return 'La experiencia o referencia es obligatoria.';
        if (value.length < 30) return `Minimo 30 caracteres (${value.length}/30).`;
        if (value.length > 500) return `Maximo 500 caracteres (${value.length}/500).`;
        if (INVALID_CHARS_TEXT.test(value)) return 'Caracteres no permitidos: < > { } [ ]';
        return '';
      case 'links':
        if (!value) return 'Agrega al menos un enlace de respaldo.';
        if (!URL_REGEX.test(value)) return 'Agrega un enlace verificable que empiece con http:// o https://.';
        if (value.length > 300) return 'Maximo 300 caracteres.';
        return '';
      case 'accepts':
        if (!form.accepts) return 'Debes confirmar la responsabilidad de la solicitud.';
        return '';
      default:
        return '';
    }
  };

  const errors = {
    documentId: validateField('documentId'),
    currentPhone: validateField('currentPhone'),
    referencePhone: validateField('referencePhone'),
    backupEmail: validateField('backupEmail'),
    organization: validateField('organization'),
    role: validateField('role'),
    reason: validateField('reason'),
    experience: validateField('experience'),
    links: validateField('links'),
    accepts: validateField('accepts'),
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const showError = (field) => (touched[field] || submitAttempted) ? errors[field] : '';

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setTouched((current) => ({ ...current, [field]: true }));
    setSubmitError('');
  };

  const handleBlur = (field) => {
    setTouched((current) => ({ ...current, [field]: true }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitAttempted(true);
    setTouched({
      documentId: true,
      currentPhone: true,
      referencePhone: true,
      backupEmail: true,
      organization: true,
      role: true,
      reason: true,
      experience: true,
      links: true,
      accepts: true,
    });

    if (hasErrors) return;

    try {
      await onSubmit?.({
        ...form,
        currentEmail,
        currentPhone: currentPhoneValue,
        referencePhone: referencePhoneValue,
        backupEmail: normalize(form.backupEmail),
        requesterName: displayName,
      });
      setForm({
        ...DEFAULT_FORM,
        currentPhoneCountry: detectedCountry.code,
        referencePhoneCountry: detectedCountry.code,
      });
      setTouched({});
      setSubmitAttempted(false);
      setSubmitError('');
    } catch (error) {
      setSubmitError(error.message || 'No se pudo enviar la solicitud.');
    }
  };

  return (
    <div className="evt-modal-backdrop" role="presentation">
      <form className="evt-modal dbe-permission-modal" onSubmit={handleSubmit} aria-label="Solicitar permisos de publicador" noValidate>
        <div className="evt-modal-head">
          <span className="evt-modal-icon">
            <BsShieldCheck />
          </span>
          <div className="evt-modal-copy">
            <strong>Solicitud para publicar eventos</strong>
            <span>Completa la informacion para que administracion revise tu perfil.</span>
          </div>
          <button type="button" className="evt-modal-close" onClick={onClose} aria-label="Cerrar modal">
            <BsX />
          </button>
        </div>

        <div className="evt-modal-body">
          {submitAttempted && hasErrors ? (
            <div className="dbe-form-error-banner" role="alert">
              <BsExclamationTriangle />
              Revisa los campos marcados antes de enviar la solicitud.
            </div>
          ) : null}
          {submitError ? (
            <div className="dbe-form-error-banner" role="alert">
              <BsExclamationTriangle />
              {submitError}
            </div>
          ) : null}

          <div className="dbe-review-warning">
            <BsInfoCircle />
            <span>Esta solicitud habilita publicaciones visibles para otros usuarios. Por eso se revisan identidad, contacto y respaldo antes de aprobar el rol publicador.</span>
          </div>

          <div className="dbe-identity-panel" aria-label="Datos detectados de la cuenta">
            <article className="dbe-identity-card">
              <span>Cuenta detectada</span>
              <strong>{displayName}</strong>
              <small>{currentEmail || 'Correo principal no disponible'}</small>
            </article>
            <article className="dbe-identity-card">
              <BsPhone />
              <span>Telefono actual</span>
              <strong>{detectedPhone || 'No registrado'}</strong>
              <small>{detectedPhone ? 'Tomado de tu perfil' : 'Completa este dato para continuar'}</small>
            </article>
          </div>

          <div className="evt-form-grid">
            <label className="evt-field">
              <span>Documento de identidad *</span>
              <input
                className={`evt-field-input${showError('documentId') ? ' dbe-input-error' : ''}`}
                value={form.documentId}
                onChange={(event) => handleChange('documentId', event.target.value)}
                onBlur={() => handleBlur('documentId')}
                placeholder="CI, pasaporte u otro documento verificable"
                maxLength={31}
                required
              />
              <FieldError msg={showError('documentId')} />
            </label>

            {!detectedPhone ? (
              <PhoneField
                label="Telefono actual *"
                countryValue={form.currentPhoneCountry}
                phoneValue={form.currentPhone}
                countryField="currentPhoneCountry"
                phoneField="currentPhone"
                error={showError('currentPhone')}
                onChange={handleChange}
              />
            ) : null}

            <PhoneField
              label="Numero de referencia *"
              countryValue={form.referencePhoneCountry}
              phoneValue={form.referencePhone}
              countryField="referencePhoneCountry"
              phoneField="referencePhone"
              error={showError('referencePhone')}
              onChange={handleChange}
            />

            <label className="evt-field">
              <span>Correo de respaldo *</span>
              <input
                type="email"
                className={`evt-field-input${showError('backupEmail') ? ' dbe-input-error' : ''}`}
                value={form.backupEmail}
                onChange={(event) => handleChange('backupEmail', event.target.value)}
                onBlur={() => handleBlur('backupEmail')}
                placeholder="correo.respaldo@dominio.com"
                maxLength={121}
                required
              />
              <FieldError msg={showError('backupEmail')} />
            </label>

            <label className="evt-field">
              <span>Organizacion o institucion *</span>
              <input
                className={`evt-field-input${showError('organization') ? ' dbe-input-error' : ''}`}
                value={form.organization}
                onChange={(event) => handleChange('organization', event.target.value)}
                onBlur={() => handleBlur('organization')}
                placeholder="Empresa, universidad, comunidad o independiente"
                maxLength={101}
                required
              />
              <FieldError msg={showError('organization')} />
            </label>

            <label className="evt-field">
              <span>Cargo o relacion *</span>
              <input
                className={`evt-field-input${showError('role') ? ' dbe-input-error' : ''}`}
                value={form.role}
                onChange={(event) => handleChange('role', event.target.value)}
                onBlur={() => handleBlur('role')}
                placeholder="Organizador, reclutador, responsable academico..."
                maxLength={81}
                required
              />
              <FieldError msg={showError('role')} />
            </label>

            <label className="evt-field evt-field--full">
              <span>Motivo para publicar eventos *</span>
              <textarea
                className={`evt-field-input evt-field-input--textarea${showError('reason') ? ' dbe-input-error' : ''}`}
                value={form.reason}
                onChange={(event) => handleChange('reason', event.target.value)}
                onBlur={() => handleBlur('reason')}
                placeholder="Describe que tipo de cursos, trabajos, ferias o convocatorias publicaras, para que audiencia y con que frecuencia."
                maxLength={501}
                required
              />
              <small className="dbe-field-hint">{normalize(form.reason).length}/500</small>
              <FieldError msg={showError('reason')} />
            </label>

            <label className="evt-field evt-field--full">
              <span>Experiencia previa o referencias *</span>
              <textarea
                className={`evt-field-input evt-field-input--textarea${showError('experience') ? ' dbe-input-error' : ''}`}
                value={form.experience}
                onChange={(event) => handleChange('experience', event.target.value)}
                onBlur={() => handleBlur('experience')}
                placeholder="Menciona experiencia organizando eventos, gestionando comunidades, reclutamiento, docencia o referencias verificables."
                maxLength={501}
                required
              />
              <small className="dbe-field-hint">{normalize(form.experience).length}/500</small>
              <FieldError msg={showError('experience')} />
            </label>

            <label className="evt-field evt-field--full">
              <span>Enlaces de respaldo *</span>
              <input
                className={`evt-field-input${showError('links') ? ' dbe-input-error' : ''}`}
                value={form.links}
                onChange={(event) => handleChange('links', event.target.value)}
                onBlur={() => handleBlur('links')}
                placeholder="https://linkedin.com/in/usuario, https://organizacion.edu.bo"
                maxLength={301}
                required
              />
              <FieldError msg={showError('links')} />
            </label>
          </div>

          <label className={`dbe-consent-row${showError('accepts') ? ' is-invalid' : ''}`}>
            <input
              type="checkbox"
              checked={form.accepts}
              onChange={(event) => handleChange('accepts', event.target.checked)}
            />
            <span>Confirmo que la informacion es real y acepto que mis publicaciones sean revisadas.</span>
          </label>
          <FieldError msg={showError('accepts')} />
        </div>

        <div className="evt-modal-foot">
          <span>La solicitud quedara lista para revision administrativa.</span>
          <div className="evt-modal-actions">
            <button type="button" className="evt-reason-btn evt-reason-btn--ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="evt-reason-btn evt-reason-btn--primary">
              <BsCheck2 />
              Enviar solicitud
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
