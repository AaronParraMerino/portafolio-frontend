import { useEffect } from 'react';
import { BsExclamationCircle, BsX } from 'react-icons/bs';
import { useLanguage } from '../../../core/i18n';
import '../styles/admin.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

export function AdminEditBody({ children, className = '' }) {
  return <div className={cx('adm-edit-body', className)}>{children}</div>;
}

export function AdminEditFooter({ children, className = '' }) {
  return <div className={cx('adm-edit-footer', className)}>{children}</div>;
}

export function AdminEditSection({ label, children, className = '' }) {
  return (
    <section className={cx('adm-edit-section', className)}>
      {label ? <span className="adm-edit-section-label">{label}</span> : null}
      {children}
    </section>
  );
}

export function AdminEditFieldError({ msg, className = '' }) {
  if (!msg) return null;

  return (
    <div className={cx('adm-edit-field-error', className)} role="alert">
      <BsExclamationCircle />
      {msg}
    </div>
  );
}

export function AdminEditSpinner({ className = '' }) {
  return <span className={cx('adm-edit-spinner', className)} aria-hidden="true" />;
}

export default function AdminEdit({
  title,
  subtitle,
  icon,
  children,
  onClose,
  closeDisabled = false,
  closeOnOverlay = true,
  size = 'md',
  className = '',
  ariaLabel,
  as: Component = 'div',
  onSubmit,
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
    'adm-edit-modal',
    size !== 'md' ? `adm-edit-modal--${size}` : '',
    className,
  );

  const handleOverlayClick = (event) => {
    if (closeOnOverlay && onClose && !closeDisabled && event.target === event.currentTarget) {
      onClose();
    }
  };

  const closeLabel = t('adminEvents.common.closeModal') || t('actions.close');

  return (
    <div className="adm-edit-overlay" onClick={handleOverlayClick}>
      <Component
        className={modalClassName}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel || title}
        onClick={(event) => event.stopPropagation()}
        onSubmit={onSubmit}
      >
        <div className="adm-edit-head">
          {icon ? <span className="adm-edit-icon">{icon}</span> : null}

          <div className="adm-edit-copy">
            {title ? <div className="adm-edit-title">{title}</div> : null}
            {subtitle ? <div className="adm-edit-subtitle">{subtitle}</div> : null}
          </div>

          {onClose ? (
            <button
              type="button"
              className="adm-edit-close"
              onClick={onClose}
              disabled={closeDisabled}
              title={closeLabel}
              aria-label={closeLabel}
            >
              <BsX />
            </button>
          ) : null}
        </div>

        {children}
      </Component>
    </div>
  );
}
