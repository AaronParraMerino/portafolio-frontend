import { useEffect, useState } from 'react';
import { useLanguage } from '../../../core/i18n';
import {
  DashboardCheckIcon,
  DashboardCloseIcon,
  DashboardWarningIcon,
} from './DashboardIcons';
import '../styles/dashboard.css';

export default function DashboardFeedback({ feedback, className = '' }) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(Boolean(feedback));

  useEffect(() => {
    setVisible(Boolean(feedback));
    if (!feedback) return undefined;

    const timer = window.setTimeout(() => setVisible(false), 3200);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  if (!feedback || !visible) return null;

  const type = feedback.tipo || feedback.type || 'ok';
  const message = feedback.msg || feedback.message || t('actions.saved');
  const isError = type === 'error';
  const isWarning = type === 'warning' || type === 'info';
  const Icon = isError ? DashboardCloseIcon : isWarning ? DashboardWarningIcon : DashboardCheckIcon;
  const title = isError
    ? t('actions.feedback.errorTitle')
    : isWarning
      ? t('actions.feedback.infoTitle')
      : t('actions.feedback.successTitle');

  return (
    <div className={`dash-feedback dash-feedback--${isError ? 'error' : isWarning ? 'info' : 'success'} ${className}`.trim()}
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
    >
      <span className="dash-feedback__icon"><Icon /></span>
      <span className="dash-feedback__copy">
        <strong>{title}</strong>
        <span>{message}</span>
      </span>
    </div>
  );
}
