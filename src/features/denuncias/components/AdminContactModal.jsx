import { useMemo, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useLanguage } from '../../../core/i18n';
import usePausedAccount from '../../../shared/hooks/usePausedAccount';
import { hasActiveStoredSession } from '../../../shared/utils/authStorage';
import { enviarDenunciaAdministracion } from '../services/denunciaService';
import './adminContactModal.css';

const INITIAL_FORM = {
  asunto: '',
  detalle: '',
  imagen: null,
};

function buildPageMetadata() {
  if (typeof window === 'undefined') {
    return {};
  }

  return {
    url: window.location.href,
    modulo: document.title || window.location.pathname,
    ruta: window.location.pathname,
  };
}

export default function AdminContactModal({ onClose }) {
  const { t } = useLanguage();
  const paused = usePausedAccount();
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSending, setIsSending] = useState(false);
  const isLoggedIn = useMemo(() => hasActiveStoredSession(), []);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (status.type === 'error') {
      setStatus({ type: '', message: '' });
    }
  };

  const updateImage = (file) => {
    if (!file) {
      updateField('imagen', null);
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setStatus({ type: 'error', message: t('adminContact.validation.fileType') });
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setStatus({ type: 'error', message: t('adminContact.validation.fileSize') });
      return;
    }

    updateField('imagen', file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (paused) return;

    const asunto = form.asunto.trim();
    const detalle = form.detalle.trim();

    if (!asunto || !detalle) {
      setStatus({ type: 'error', message: t('adminContact.validation.required') });
      return;
    }

    setIsSending(true);
    setStatus({ type: '', message: '' });

    try {
      await enviarDenunciaAdministracion({
        asunto,
        detalle,
        imagen: form.imagen,
        metadata: buildPageMetadata(),
      });
      setStatus({ type: 'success', message: t('adminContact.feedback.sent') });
      setForm(INITIAL_FORM);
    } catch (error) {
      setStatus({ type: 'error', message: error.message || t('adminContact.error.send') });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="adm-contact-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="adm-contact-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="adm-contact-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="adm-contact-modal__header">
          <div>
            <h2 id="adm-contact-modal-title">{t('adminContact.title')}</h2>
            <p>{t('adminContact.description')}</p>
          </div>
          <button
            type="button"
            className="adm-contact-modal__close"
            onClick={onClose}
            aria-label={t('adminContact.actions.close')}
            title={t('adminContact.actions.close')}
          >
            <FaTimes />
          </button>
        </header>

        {!isLoggedIn ? (
          <div className="adm-contact-modal__session">
            {t('adminContact.loginRequired')}
          </div>
        ) : paused ? (
          <div className="adm-contact-modal__session">
            {t('adminContact.paused')}
          </div>
        ) : (
          <form className="adm-contact-modal__form" onSubmit={handleSubmit}>
            <label>
              <span>{t('adminContact.fields.subject')}</span>
              <input
                type="text"
                value={form.asunto}
                onChange={(event) => updateField('asunto', event.target.value)}
                maxLength={180}
                placeholder={t('adminContact.placeholders.subject')}
              />
            </label>

            <label>
              <span>{t('adminContact.fields.detail')}</span>
              <textarea
                value={form.detalle}
                onChange={(event) => updateField('detalle', event.target.value)}
                maxLength={4000}
                rows={6}
                placeholder={t('adminContact.placeholders.detail')}
              />
            </label>

            <label>
              <span>{t('adminContact.fields.evidence')}</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => updateImage(event.target.files?.[0] || null)}
              />
              {form.imagen ? (
                <small className="adm-contact-modal__file">
                  {form.imagen.name}
                </small>
              ) : null}
            </label>

            {status.message && (
              <div className={`adm-contact-modal__status is-${status.type}`}>
                {status.message}
              </div>
            )}

            <footer className="adm-contact-modal__footer">
              <button type="button" className="adm-contact-modal__secondary" onClick={onClose}>
                {t('adminContact.actions.close')}
              </button>
              <button type="submit" className="adm-contact-modal__primary" disabled={isSending}>
                {isSending ? t('adminContact.actions.sending') : t('adminContact.actions.send')}
              </button>
            </footer>
          </form>
        )}
      </section>
    </div>
  );
}
