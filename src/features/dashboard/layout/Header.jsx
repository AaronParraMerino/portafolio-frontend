import { useLanguage } from '../../../core/i18n';

const toArray = (actions) => {
  if (!actions) return [];
  return Array.isArray(actions) ? actions.filter(Boolean) : [actions];
};

const PlusIcon = () => (
  <svg
    viewBox="0 0 16 16"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8 3v10M3 8h10" />
  </svg>
);

export default function Header({
  eyebrow = 'Portafolio',
  title = '',
  subtitle = '',
  actions = [],
  children,
  className = '',
  dense = false,
  breadcrumb = [],
  count,
  actionLabel,
  onAction,
}) {
  const { t } = useLanguage();
  const fallbackTitle = breadcrumb.find((item) => item.active)?.label
    || breadcrumb.at(-1)?.label
    || t('dashboard.header.defaultTitle');
  const visibleTitle = title || fallbackTitle;
  const visibleActions = [
    ...toArray(actions),
    actionLabel
      ? {
          label: actionLabel,
          icon: <PlusIcon />,
          onClick: onAction,
        }
      : null,
  ].filter(Boolean);

  const headerClassName = [
    'dash-module-header',
    dense ? 'dash-module-header--dense' : '',
    className,
  ].filter(Boolean).join(' ');
  const hasBreadcrumb = breadcrumb.length > 0;

  return (
    <header className={headerClassName}>
      <div className="dash-module-header-copy">
        {hasBreadcrumb ? (
          <nav className="dash-module-header-breadcrumb" aria-label={t('dashboard.header.currentLocation')}>
            {breadcrumb.map((item, index) => (
              <span
                key={item.key || `${item.label}-${index}`}
                className={[
                  'dash-module-header-breadcrumb-item',
                  item.active ? 'active' : '',
                ].filter(Boolean).join(' ')}
              >
                {item.label}
              </span>
            ))}
          </nav>
        ) : null}
        {eyebrow ? <p className="dash-module-header-eyebrow">{eyebrow}</p> : null}
        <h1 className="dash-module-header-title">{visibleTitle}</h1>
        {subtitle ? <p className="dash-module-header-subtitle">{subtitle}</p> : null}
      </div>

      {(visibleActions.length > 0 || count || children) && (
        <div className="dash-module-header-actions">
          {count ? (
            <span className="dash-module-header-count">
              {count.value} {count.label}
            </span>
          ) : null}

          {visibleActions.map((action, index) => {
            const {
              label,
              icon,
              variant = 'primary',
              disabled = false,
              loading = false,
              type = 'button',
              onClick,
              href,
              title: actionTitle,
              ariaLabel,
              className: actionClassName = '',
            } = action;
            const loadingLabel = action.loadingLabel || t('dashboard.header.loading');
            const actionLabel = loading ? loadingLabel : label;
            const actionClasses = [
              'dash-module-header-action',
              `dash-module-header-action--${variant}`,
              actionClassName,
            ].filter(Boolean).join(' ');

            if (href) {
              return (
                <a
                  key={action.key || label || index}
                  className={actionClasses}
                  href={href}
                  title={actionTitle || label}
                  aria-label={ariaLabel || label}
                >
                  {icon ? <span className="dash-module-header-action-icon">{icon}</span> : null}
                  {actionLabel ? <span className="dash-module-header-action-label">{actionLabel}</span> : null}
                </a>
              );
            }

            return (
              <button
                key={action.key || label || index}
                type={type}
                className={actionClasses}
                onClick={onClick}
                disabled={disabled || loading}
                title={actionTitle || label}
                aria-label={ariaLabel || label}
              >
                {icon ? <span className="dash-module-header-action-icon">{icon}</span> : null}
                {actionLabel ? <span className="dash-module-header-action-label">{actionLabel}</span> : null}
              </button>
            );
          })}

          {children}
        </div>
      )}
    </header>
  );
}
