import { useEffect } from 'react';
import { useLanguage } from '../../../core/i18n';
import '../styles/dashboard.css';

const CloseIcon = () => (
  <svg viewBox="0 0 12 12" aria-hidden="true">
    <path d="M1 1l10 10M11 1L1 11" />
  </svg>
);

const ErrorIcon = () => (
  <svg viewBox="0 0 12 12" aria-hidden="true">
    <circle cx="6" cy="6" r="5" />
    <path d="M6 3.5v3M6 8.5v.5" />
  </svg>
);

const cx = (...classes) => classes.filter(Boolean).join(' ');

export function DashboardEditBody({ children, className = '' }) {
  return <div className={cx('dash-edit-body', className)}>{children}</div>;
}

export function DashboardEditFooter({ children, className = '' }) {
  return <div className={cx('dash-edit-footer', className)}>{children}</div>;
}

export function DashboardEditSection({ label, children, className = '' }) {
  return (
    <section className={cx('dash-edit-section', className)}>
      {label ? <span className="dash-edit-section-label">{label}</span> : null}
      {children}
    </section>
  );
}

export function DashboardEditFieldError({ msg, className = '' }) {
  if (!msg) return null;

  return (
    <div className={cx('dash-edit-field-error', className)} role="alert">
      <ErrorIcon />
      {msg}
    </div>
  );
}

export function DashboardEditSpinner({ className = '' }) {
  return <span className={cx('dash-edit-spinner', className)} aria-hidden="true" />;
}

export default function DashboardEdit({
  title,
  subtitle,
  children,
  onClose,
  closeDisabled = false,
  closeOnOverlay = false,
  size = 'md',
  className = '',
  ariaLabel,
}) {
  const { t } = useLanguage();

  useEffect(() => {
    if (!onClose || closeDisabled) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeDisabled, onClose]);

  const modalClassName = cx(
    'dash-edit-modal',
    size !== 'md' ? `dash-edit-modal--${size}` : '',
    className,
  );

  const handleOverlayClick = (event) => {
    if (closeOnOverlay && onClose && !closeDisabled && event.target === event.currentTarget) {
      onClose();
    }
  };

  const closeLabel = t('dashboard.edit.close');

  return (
    <div className="dash-edit-overlay" onClick={handleOverlayClick}>
      <div className={modalClassName} role="dialog" aria-modal="true" aria-label={ariaLabel || title}>
        <div className="dash-edit-head">
          <div>
            {title ? <div className="dash-edit-title">{title}</div> : null}
            {subtitle ? <div className="dash-edit-subtitle">{subtitle}</div> : null}
          </div>

          {onClose ? (
            <button
              type="button"
              className="dash-edit-close"
              onClick={onClose}
              disabled={closeDisabled}
              title={closeLabel}
              aria-label={closeLabel}
            >
              <CloseIcon />
            </button>
          ) : null}
        </div>

        {children}
      </div>
    </div>
  );
}
