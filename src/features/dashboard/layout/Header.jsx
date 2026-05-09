const toArray = (actions) => {
  if (!actions) return [];
  return Array.isArray(actions) ? actions.filter(Boolean) : [actions];
};

const PlusIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
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
  const fallbackTitle = breadcrumb.find((item) => item.active)?.label || breadcrumb.at(-1)?.label || 'Dashboard';
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

  return (
    <>
      <style>{`
        .dash-module-header {
          background: #0c1a2e;
          border-bottom: 3px solid var(--azul);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.22);
          color: var(--blanco);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          min-height: 88px;
          padding: 20px 28px;
          position: relative;
          z-index: 1;
        }

        .dash-module-header--dense {
          min-height: 76px;
          padding-top: 16px;
          padding-bottom: 16px;
        }

        .dash-module-header-copy {
          min-width: 0;
        }

        .dash-module-header-eyebrow,
        .dash-module-header-title,
        .dash-module-header-subtitle {
          letter-spacing: 0;
        }

        .dash-module-header-eyebrow {
          color: rgba(255, 255, 255, 0.52);
          font-family: var(--mono);
          font-size: 11px;
          font-weight: 600;
          line-height: 1.2;
          margin: 0 0 4px;
          text-transform: uppercase;
        }

        .dash-module-header-title {
          color: var(--blanco);
          font-family: var(--font);
          font-size: 22px;
          font-weight: 800;
          line-height: 1.15;
          margin: 0;
          overflow-wrap: anywhere;
          text-transform: uppercase;
        }

        .dash-module-header-subtitle {
          color: rgba(255, 255, 255, 0.68);
          font-size: 13px;
          line-height: 1.5;
          margin: 7px 0 0;
          max-width: 760px;
        }

        .dash-module-header-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 10px;
          margin-left: auto;
        }

        .dash-module-header-count {
          align-items: center;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.78);
          display: inline-flex;
          font-family: var(--mono);
          font-size: 11px;
          font-weight: 600;
          min-height: 36px;
          padding: 0 12px;
          white-space: nowrap;
        }

        .dash-module-header-action {
          align-items: center;
          border: 1px solid transparent;
          border-radius: 8px;
          cursor: pointer;
          display: inline-flex;
          font-family: var(--font);
          font-size: 13px;
          font-weight: 700;
          gap: 8px;
          justify-content: center;
          line-height: 1;
          min-height: 40px;
          padding: 0 16px;
          text-decoration: none;
          transition: background 0.15s, border-color 0.15s, box-shadow 0.15s, color 0.15s, transform 0.15s;
          white-space: nowrap;
        }

        .dash-module-header-action:hover {
          transform: translateY(-1px);
        }

        .dash-module-header-action:disabled {
          cursor: not-allowed;
          opacity: 0.65;
          transform: none;
        }

        .dash-module-header-action--primary {
          background: var(--azul);
          box-shadow: 0 2px 12px rgba(0, 119, 183, 0.35);
          color: var(--blanco);
        }

        .dash-module-header-action--primary:hover {
          background: var(--azul-hover);
          box-shadow: 0 6px 18px rgba(0, 119, 183, 0.45);
          color: var(--blanco);
        }

        .dash-module-header-action--secondary {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.16);
          color: rgba(255, 255, 255, 0.82);
        }

        .dash-module-header-action--secondary:hover {
          background: rgba(255, 255, 255, 0.14);
          color: var(--blanco);
        }

        .dash-module-header-action--danger {
          background: var(--rojo-soft);
          box-shadow: 0 2px 12px rgba(232, 85, 85, 0.28);
          color: var(--blanco);
        }

        .dash-module-header-action--danger:hover {
          background: var(--rojo-mid);
          color: var(--blanco);
        }

        .dash-module-header-action-icon {
          display: inline-flex;
          flex-shrink: 0;
        }

        .dash-module-header-action-icon svg {
          display: block;
          fill: none;
          height: 16px;
          stroke: currentColor;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-width: 2;
          width: 16px;
        }

        .dash-module-header-action-label {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @media (max-width: 720px) {
          .dash-module-header {
            align-items: stretch;
            flex-direction: column;
            gap: 14px;
            min-height: 0;
            padding: 16px 18px;
          }

          .dash-module-header-title {
            font-size: 19px;
          }

          .dash-module-header-subtitle {
            font-size: 12px;
          }

          .dash-module-header-actions {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(148px, 1fr));
            margin-left: 0;
            width: 100%;
          }

          .dash-module-header-action,
          .dash-module-header-count {
            min-width: 0;
            padding-left: 12px;
            padding-right: 12px;
            width: 100%;
          }
        }

        @media (max-width: 420px) {
          .dash-module-header {
            padding: 14px;
          }

          .dash-module-header-actions {
            grid-template-columns: 1fr;
          }

          .dash-module-header-action {
            min-height: 38px;
          }
        }
      `}</style>

      <header className={headerClassName}>
        <div className="dash-module-header-copy">
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
                loadingLabel = 'Cargando...',
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
    </>
  );
}
