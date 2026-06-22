import { useMemo, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
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
      setStatus({ type: 'error', message: 'La evidencia debe ser JPG, PNG o WebP.' });
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setStatus({ type: 'error', message: 'La imagen no puede superar 4 MB.' });
      return;
    }

    updateField('imagen', file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const asunto = form.asunto.trim();
    const detalle = form.detalle.trim();

    if (!asunto || !detalle) {
      setStatus({ type: 'error', message: 'Completa el asunto y el detalle.' });
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
      setStatus({ type: 'success', message: 'Reporte enviado a administracion.' });
      setForm(INITIAL_FORM);
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'No se pudo enviar el reporte.' });
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
            <h2 id="adm-contact-modal-title">Contactar administracion</h2>
            <p>Reporta cualquier asunto de la plataforma.</p>
          </div>
          <button
            type="button"
            className="adm-contact-modal__close"
            onClick={onClose}
            aria-label="Cerrar"
            title="Cerrar"
          >
            <FaTimes />
          </button>
        </header>

        {!isLoggedIn ? (
          <div className="adm-contact-modal__session">
            Inicia sesion para enviar un reporte a administracion.
          </div>
        ) : (
          <form className="adm-contact-modal__form" onSubmit={handleSubmit}>
            <label>
              <span>Asunto</span>
              <input
                type="text"
                value={form.asunto}
                onChange={(event) => updateField('asunto', event.target.value)}
                maxLength={180}
                placeholder="Ej. Problema con una publicacion"
              />
            </label>

            <label>
              <span>Detalle</span>
              <textarea
                value={form.detalle}
                onChange={(event) => updateField('detalle', event.target.value)}
                maxLength={4000}
                rows={6}
                placeholder="Describe que paso y que deberia revisar administracion."
              />
            </label>

            <label>
              <span>Evidencia</span>
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
                Cerrar
              </button>
              <button type="submit" className="adm-contact-modal__primary" disabled={isSending}>
                {isSending ? 'Enviando...' : 'Enviar'}
              </button>
            </footer>
          </form>
        )}
      </section>
    </div>
  );
}
