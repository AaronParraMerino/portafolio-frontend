import { useEffect, useState } from 'react';
import {
  BsCheck2,
  BsShieldExclamation,
} from 'react-icons/bs';
import { useLanguage } from '../../../../core/i18n';
import AdminEdit, { AdminEditBody, AdminEditFieldError, AdminEditFooter } from '../../layout/AdminEdit';

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
    <AdminEdit
      as="form"
      title={label}
      subtitle={targetName}
      icon={<BsShieldExclamation />}
      onClose={onClose}
      onSubmit={handleSubmit}
      size="sm"
      ariaLabel={label}
    >
        <AdminEditBody>
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
          <AdminEditFieldError msg={message} />
        </AdminEditBody>

        <AdminEditFooter>
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
        </AdminEditFooter>
    </AdminEdit>
  );
}
