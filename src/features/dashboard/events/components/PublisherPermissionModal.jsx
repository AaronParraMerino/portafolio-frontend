import { useState } from 'react';
import {
  BsCheck2,
  BsExclamationTriangle,
  BsInfoCircle,
  BsPhone,
  BsShieldCheck,
  BsX,
} from 'react-icons/bs';
import { useLanguage } from '../../../../core/i18n';

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

function validatePhone(value, countryCode, label, t) {
  const onlyDigits = digitsOnly(value);
  const country = countryByCode(countryCode);

  if (!onlyDigits) return t('adminEvents.permission.error.required', { label });
  if (!/^\d+$/.test(onlyDigits)) return t('adminEvents.permission.error.onlyDigits');
  if (!country.telRegex.test(onlyDigits)) return t('adminEvents.permission.error.invalidPhone', { country: country.name, hint: country.telHint });

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
  t,
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
          aria-label={t('adminEvents.permission.phoneCountryAria', { label })}
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
      {!error ? <small className="dbe-field-hint">{t('adminEvents.permission.phoneHint', { hint: country.telHint, dial: country.dial || t('adminEvents.permission.internationalCode') })}</small> : null}
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
  const { t } = useLanguage();
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
  const displayName = getUserName(user) || t('adminEvents.permission.defaultUser');
  const currentPhoneValue = detectedPhone || buildPhone(form.currentPhoneCountry, form.currentPhone);
  const currentPhoneDigits = digitsOnly(currentPhoneValue);
  const referencePhoneValue = buildPhone(form.referencePhoneCountry, form.referencePhone);

  const validateField = (field) => {
    const value = normalize(form[field]);

    switch (field) {
      case 'documentId':
        if (!value) return t('adminEvents.permission.error.documentRequired');
        if (value.length < 5) return t('adminEvents.permission.error.min5');
        if (value.length > 30) return t('adminEvents.permission.error.max30');
        if (INVALID_CHARS_TEXT.test(value)) return t('adminEvents.permission.error.invalidChars');
        return '';
      case 'currentPhone':
        if (detectedPhone) return '';
        return validatePhone(form.currentPhone, form.currentPhoneCountry, t('adminEvents.permission.currentPhone'), t);
      case 'referencePhone': {
        const phoneError = validatePhone(form.referencePhone, form.referencePhoneCountry, t('adminEvents.permission.referencePhone'), t);
        if (phoneError) return phoneError;
        if (digitsOnly(referencePhoneValue) === currentPhoneDigits) return t('adminEvents.permission.error.referenceSame');
        return '';
      }
      case 'backupEmail':
        if (!value) return t('adminEvents.permission.error.backupEmailRequired');
        if (!EMAIL_REGEX.test(value)) return t('adminEvents.permission.error.invalidEmail');
        if (currentEmail && value.toLowerCase() === currentEmail.toLowerCase()) return t('adminEvents.permission.error.sameEmail');
        if (value.length > 120) return t('adminEvents.permission.error.max120');
        return '';
      case 'organization':
        if (!value) return t('adminEvents.permission.error.organizationRequired');
        if (value.length < 3) return t('adminEvents.permission.error.min3');
        if (value.length > 100) return t('adminEvents.permission.error.max100');
        if (INVALID_CHARS_TEXT.test(value)) return t('adminEvents.permission.error.invalidChars');
        return '';
      case 'role':
        if (!value) return t('adminEvents.permission.error.roleRequired');
        if (value.length < 3) return t('adminEvents.permission.error.min3');
        if (value.length > 80) return t('adminEvents.permission.error.max80');
        if (INVALID_CHARS_TEXT.test(value)) return t('adminEvents.permission.error.invalidChars');
        return '';
      case 'reason':
        if (!value) return t('adminEvents.permission.error.reasonRequired');
        if (value.length < 30) return t('adminEvents.permission.error.min30', { count: value.length });
        if (value.length > 500) return t('adminEvents.permission.error.max500', { count: value.length });
        if (INVALID_CHARS_TEXT.test(value)) return t('adminEvents.permission.error.invalidChars');
        return '';
      case 'experience':
        if (!value) return t('adminEvents.permission.error.experienceRequired');
        if (value.length < 30) return t('adminEvents.permission.error.min30', { count: value.length });
        if (value.length > 500) return t('adminEvents.permission.error.max500', { count: value.length });
        if (INVALID_CHARS_TEXT.test(value)) return t('adminEvents.permission.error.invalidChars');
        return '';
      case 'links':
        if (!value) return t('adminEvents.permission.error.linksRequired');
        if (!URL_REGEX.test(value)) return t('adminEvents.permission.error.linkInvalid');
        if (value.length > 300) return t('adminEvents.permission.error.max300');
        return '';
      case 'accepts':
        if (!form.accepts) return t('adminEvents.permission.error.acceptsRequired');
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
      setSubmitError(error.message || t('adminEvents.permission.error.submit'));
    }
  };

  return (
    <div className="evt-modal-backdrop" role="presentation">
      <form className="evt-modal dbe-permission-modal" onSubmit={handleSubmit} aria-label={t('adminEvents.permission.aria')} noValidate>
        <div className="evt-modal-head">
          <span className="evt-modal-icon">
            <BsShieldCheck />
          </span>
          <div className="evt-modal-copy">
            <strong>{t('adminEvents.permission.title')}</strong>
            <span>{t('adminEvents.permission.subtitle')}</span>
          </div>
          <button type="button" className="evt-modal-close" onClick={onClose} aria-label={t('adminEvents.common.closeModal')}>
            <BsX />
          </button>
        </div>

        <div className="evt-modal-body">
          {submitAttempted && hasErrors ? (
            <div className="dbe-form-error-banner" role="alert">
              <BsExclamationTriangle />
              {t('adminEvents.permission.reviewFields')}
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
            <span>{t('adminEvents.permission.warning')}</span>
          </div>

          <div className="dbe-identity-panel" aria-label={t('adminEvents.permission.detectedData')}>
            <article className="dbe-identity-card">
              <span>{t('adminEvents.permission.detectedAccount')}</span>
              <strong>{displayName}</strong>
              <small>{currentEmail || t('adminEvents.permission.mainEmailUnavailable')}</small>
            </article>
            <article className="dbe-identity-card">
              <BsPhone />
              <span>{t('adminEvents.permission.currentPhone')}</span>
              <strong>{detectedPhone || t('adminEvents.permission.notRegistered')}</strong>
              <small>{detectedPhone ? t('adminEvents.permission.fromProfile') : t('adminEvents.permission.completeToContinue')}</small>
            </article>
          </div>

          <div className="evt-form-grid">
            <label className="evt-field">
              <span>{t('adminEvents.permission.document')}</span>
              <input
                className={`evt-field-input${showError('documentId') ? ' dbe-input-error' : ''}`}
                value={form.documentId}
                onChange={(event) => handleChange('documentId', event.target.value)}
                onBlur={() => handleBlur('documentId')}
                placeholder={t('adminEvents.permission.documentPlaceholder')}
                maxLength={31}
                required
              />
              <FieldError msg={showError('documentId')} />
            </label>

            {!detectedPhone ? (
              <PhoneField
                label={t('adminEvents.permission.currentPhoneLabel')}
                countryValue={form.currentPhoneCountry}
                phoneValue={form.currentPhone}
                countryField="currentPhoneCountry"
                phoneField="currentPhone"
                error={showError('currentPhone')}
                onChange={handleChange}
                t={t}
              />
            ) : null}

            <PhoneField
              label={t('adminEvents.permission.referencePhone')}
              countryValue={form.referencePhoneCountry}
              phoneValue={form.referencePhone}
              countryField="referencePhoneCountry"
              phoneField="referencePhone"
              error={showError('referencePhone')}
              onChange={handleChange}
              t={t}
            />

            <label className="evt-field">
              <span>{t('adminEvents.permission.backupEmail')}</span>
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
              <span>{t('adminEvents.permission.organization')}</span>
              <input
                className={`evt-field-input${showError('organization') ? ' dbe-input-error' : ''}`}
                value={form.organization}
                onChange={(event) => handleChange('organization', event.target.value)}
                onBlur={() => handleBlur('organization')}
                placeholder={t('adminEvents.permission.organizationPlaceholder')}
                maxLength={101}
                required
              />
              <FieldError msg={showError('organization')} />
            </label>

            <label className="evt-field">
              <span>{t('adminEvents.permission.role')}</span>
              <input
                className={`evt-field-input${showError('role') ? ' dbe-input-error' : ''}`}
                value={form.role}
                onChange={(event) => handleChange('role', event.target.value)}
                onBlur={() => handleBlur('role')}
                placeholder={t('adminEvents.permission.rolePlaceholder')}
                maxLength={81}
                required
              />
              <FieldError msg={showError('role')} />
            </label>

            <label className="evt-field evt-field--full">
              <span>{t('adminEvents.permission.reason')}</span>
              <textarea
                className={`evt-field-input evt-field-input--textarea${showError('reason') ? ' dbe-input-error' : ''}`}
                value={form.reason}
                onChange={(event) => handleChange('reason', event.target.value)}
                onBlur={() => handleBlur('reason')}
                placeholder={t('adminEvents.permission.reasonPlaceholder')}
                maxLength={501}
                required
              />
              <small className="dbe-field-hint">{normalize(form.reason).length}/500</small>
              <FieldError msg={showError('reason')} />
            </label>

            <label className="evt-field evt-field--full">
              <span>{t('adminEvents.permission.experience')}</span>
              <textarea
                className={`evt-field-input evt-field-input--textarea${showError('experience') ? ' dbe-input-error' : ''}`}
                value={form.experience}
                onChange={(event) => handleChange('experience', event.target.value)}
                onBlur={() => handleBlur('experience')}
                placeholder={t('adminEvents.permission.experiencePlaceholder')}
                maxLength={501}
                required
              />
              <small className="dbe-field-hint">{normalize(form.experience).length}/500</small>
              <FieldError msg={showError('experience')} />
            </label>

            <label className="evt-field evt-field--full">
              <span>{t('adminEvents.permission.links')}</span>
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
            <span>{t('adminEvents.permission.accepts')}</span>
          </label>
          <FieldError msg={showError('accepts')} />
        </div>

        <div className="evt-modal-foot">
          <span>{t('adminEvents.permission.footer')}</span>
          <div className="evt-modal-actions">
            <button type="button" className="evt-reason-btn evt-reason-btn--ghost" onClick={onClose}>
              {t('adminEvents.common.cancel')}
            </button>
            <button type="submit" className="evt-reason-btn evt-reason-btn--primary">
              <BsCheck2 />
              {t('adminEvents.permission.submit')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
