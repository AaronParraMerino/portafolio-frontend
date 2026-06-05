import { useEffect, useState } from 'react';
import {
  BsCheck2,
  BsShieldExclamation,
  BsX,
} from 'react-icons/bs';

const ACTION_LABELS = {
  aceptar: 'Aceptar solicitud',
  rechazar: 'Rechazar solicitud',
  activar: 'Activar evento',
  pausar: 'Pausar evento',
  suspender: 'Suspender evento',
  eliminar: 'Eliminar evento',
};

export default function AdminEventActionModal({
  action,
  target,
  onClose,
  onConfirm,
}) {
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setReason('');
    setMessage('');
  }, [action, target?.id]);

  if (!action || !target) return null;

  const label = ACTION_LABELS[action] || 'Confirmar accion';
  const targetName = target.title || target.name || 'Registro seleccionado';

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!reason.trim()) {
      setMessage('Registra un motivo para notificar al usuario.');
      return;
    }

    try {
      await onConfirm?.({ action, target, reason });
      setReason('');
      setMessage('');
    } catch (error) {
      setMessage(error.message || 'No se pudo confirmar la accion.');
    }
  };

  return (
    <div className="evt-modal-backdrop" role="presentation">
      <form className="evt-modal evt-admin-action-modal" onSubmit={handleSubmit}>
        <div className="evt-modal-head">
          <span className="evt-modal-icon">
            <BsShieldExclamation />
          </span>
          <div className="evt-modal-copy">
            <strong>{label}</strong>
            <span>{targetName}</span>
          </div>
          <button type="button" className="evt-modal-close" onClick={onClose} aria-label="Cerrar modal">
            <BsX />
          </button>
        </div>

        <div className="evt-modal-body">
          <label className="evt-field evt-field--full">
            <span>Motivo para notificar</span>
            <textarea
              className="evt-field-input evt-field-input--textarea"
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                setMessage('');
              }}
              placeholder="Explica de forma clara por que se realiza esta accion."
            />
          </label>
          {message ? <div className="evt-modal-message">{message}</div> : null}
        </div>

        <div className="evt-modal-foot">
          <span>El motivo se usara como base para la notificacion al usuario.</span>
          <div className="evt-modal-actions">
            <button type="button" className="evt-reason-btn evt-reason-btn--ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="evt-reason-btn evt-reason-btn--primary">
              <BsCheck2 />
              Confirmar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
