import { useEffect, useState } from 'react';
import {
  BsCheck2,
  BsShieldExclamation,
  BsX,
} from 'react-icons/bs';
import { useLanguage } from '../../../../core/i18n';

export default function AdminEventActionModal({
  action,
  target,
  onClose,
  onConfirm,
}) {
  const { t } = useLanguage();
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setReason('');
    setMessage('');
  }, [action, target?.id]);

  if (!action || !target) return null;

  const label = t(`adminEvents.action.${action}`) || t('adminEvents.action.confirmTitle');
  const targetName = target.title || target.name || t('adminEvents.action.selectedRecord');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!reason.trim()) {
      setMessage(t('adminEvents.action.reasonRequired'));
      return;
    }

    try {
      await onConfirm?.({ action, target, reason });
      setReason('');
      setMessage('');
    } catch (error) {
      setMessage(error.message || t('adminEvents.action.confirmError'));
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
          <button type="button" className="evt-modal-close" onClick={onClose} aria-label={t('adminEvents.common.closeModal')}>
            <BsX />
          </button>
        </div>

        <div className="evt-modal-body">
          <label className="evt-field evt-field--full">
            <span>{t('adminEvents.action.reasonLabel')}</span>
            <textarea
              className="evt-field-input evt-field-input--textarea"
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                setMessage('');
              }}
              placeholder={t('adminEvents.action.reasonPlaceholder')}
            />
          </label>
          {message ? <div className="evt-modal-message">{message}</div> : null}
        </div>

        <div className="evt-modal-foot">
          <span>{t('adminEvents.action.footer')}</span>
          <div className="evt-modal-actions">
            <button type="button" className="evt-reason-btn evt-reason-btn--ghost" onClick={onClose}>
              {t('adminEvents.common.cancel')}
            </button>
            <button type="submit" className="evt-reason-btn evt-reason-btn--primary">
              <BsCheck2 />
              {t('adminEvents.common.confirm')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
