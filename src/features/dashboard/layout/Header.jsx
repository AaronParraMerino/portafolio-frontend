/* ══════════════════════════════════════
   Header.jsx — barra superior del dashboard
   (breadcrumb + badge count + botón acción)
══════════════════════════════════════ */

export default function Header({
  breadcrumb = [],   // [{ label: 'portafolio' }, { label: 'mis proyectos', active: true }]
  count,             // { value: 4, label: 'proyectos' } — badge rojo
  actionLabel,       // 'Agregar proyecto'
  onAction,          // callback
  sidebarCollapsed,  // para ajustar margin-left (desktop)
}) {
  const sidebarW = sidebarCollapsed ? 64 : 240;

  // Filtra el crumb "dashboard" que queda raro solo
  const visibleCrumbs = breadcrumb.filter(
    (c) => c.label?.toLowerCase() !== 'dashboard' || breadcrumb.length > 1
  );

  return (
    <>
      <style>{`
        .dsh-header {
          position: sticky;
          top: var(--nav-height, 60px);
          z-index: 50;
          height: 52px;
          background: var(--blanco, #fff);
          border-bottom: 1px solid var(--gris-borde, #d1d5db);
          display: flex; align-items: center;
          padding: 0 28px;
          gap: 12px;
          transition: margin-left .22s cubic-bezier(.4,0,.2,1);
          margin-left: ${sidebarW}px;
        }

        /* Móvil: sin sidebar → sin margen */
        @media (max-width: 767px) {
          .dsh-header {
            margin-left: 0 !important;
            padding: 0 16px;
          }
        }

        /* breadcrumb */
        .dsh-header-bc {
          font-size: 13px; font-weight: 500;
          color: var(--gris-texto, #6b7280);
          white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis;
        }
        .dsh-header-bc span {
          color: var(--negro-texto, #111827);
        }

        /* badge count */
        .dsh-header-count {
          font-size: 11px; font-weight: 600;
          padding: 2px 8px; border-radius: 10px;
          background: var(--rojo-bg, rgba(232,85,85,.08));
          color: var(--rojo-mid, #c94040);
          border: 1px solid var(--rojo-borde, rgba(232,85,85,.22));
          font-family: var(--mono, 'IBM Plex Mono', monospace);
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* botón acción */
        .dsh-header-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 18px;
          background: var(--azul, #0077b7); color: #fff;
          border: none; border-radius: 7px;
          font-family: var(--font, 'Inter', sans-serif);
          font-size: 13px; font-weight: 600;
          cursor: pointer;
          transition: background .15s, transform .15s, box-shadow .15s;
          margin-left: auto;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .dsh-header-btn:hover {
          background: var(--azul-hover, #005f95);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,119,183,.3);
        }
        .dsh-header-btn svg {
          width: 12px; height: 12px;
          stroke: #fff; fill: none; stroke-width: 2.4;
        }

        /* Móvil: botón más compacto */
        @media (max-width: 480px) {
          .dsh-header-btn {
            padding: 7px 12px;
            font-size: 12px;
          }
          .dsh-header-btn .dsh-btn-label { display: none; }
          .dsh-header-btn svg {
            width: 14px; height: 14px;
          }
        }
      `}</style>

      <div className="dsh-header">
        {/* Breadcrumb — solo se muestra si hay algo visible */}
        {visibleCrumbs.length > 0 && (
          <span className="dsh-header-bc">
            {visibleCrumbs.map((crumb, i) => (
              <span key={i}>
                {i > 0 && ' / '}
                {crumb.active ? <span>{crumb.label}</span> : crumb.label}
              </span>
            ))}
          </span>
        )}

        {/* Badge count */}
        {count && (
          <span className="dsh-header-count">
            {count.value} {count.label}
          </span>
        )}

        {/* Botón acción */}
        {actionLabel && (
          <button className="dsh-header-btn" onClick={onAction}>
            <svg viewBox="0 0 13 13">
              <line x1="6.5" y1="1" x2="6.5" y2="12" />
              <line x1="1" y1="6.5" x2="12" y2="6.5" />
            </svg>
            <span className="dsh-btn-label">{actionLabel}</span>
          </button>
        )}
      </div>
    </>
  );
}