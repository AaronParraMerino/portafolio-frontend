import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ConfirmModal from '../../../shared/ui/ConfirmModal';

/* ══════════════════════════════════════
   Sidebar.jsx
   Props: collapsed (bool), onToggle (fn)
══════════════════════════════════════ */

const NAV_SECTIONS = [
  {
    label: 'General',
    items: [
      {
        id: 'dashboard', label: 'Dashboard', to: '/dashboard', exact: true,
        icon: (<svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="1.5" y="1.5" width="5" height="5" rx="1" /><rect x="8.5" y="1.5" width="5" height="5" rx="1" /><rect x="1.5" y="8.5" width="5" height="5" rx="1" /><rect x="8.5" y="8.5" width="5" height="5" rx="1" /></svg>),
      },
      {
        id: 'profile', label: 'Mi Perfil', to: '/dashboard/profile',
        icon: (<svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="7.5" cy="5" r="3" /><path d="M1.5 14c0-3.3 2.7-6 6-6s6 2.7 6 6" /></svg>),
      },
    ],
  },
  {
    label: 'Portafolio',
    items: [
      {
        id: 'projects', label: 'Mis Proyectos', to: '/dashboard/projects', badge: '4', badgeVariant: 'blue',
        icon: (<svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="2" y="3" width="11" height="10" rx="1.5" /><path d="M5 3V2M10 3V2M2 6.5h11" /></svg>),
      },
      {
        id: 'skills', label: 'Habilidades', to: '/dashboard/skills', badge: '8', badgeVariant: 'gray',
        icon: (<svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M2 11.5V13h1.5l5-5-1.5-1.5-5 5zM12.5 3.5a1 1 0 000-1.4l-1.1-1.1a1 1 0 00-1.4 0L9 2.5 12.5 6l1-1z" /></svg>),
      },
      {
        id: 'experience', label: 'Experiencia', to: '/dashboard/experience', badge: '3', badgeVariant: 'amber',
        icon: (<svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="2" y="3" width="11" height="10" rx="1.5" /><path d="M5 3V1.5M10 3V1.5M2 6.5h11" /></svg>),
      },
      {
        id: 'networks', label: 'Redes Profesionales', to: '/dashboard/enlaces', badge: '3', badgeVariant: 'blue',
        icon: (<svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="7.5" cy="3" r="1.5" /><circle cx="2.5" cy="12" r="1.5" /><circle cx="12.5" cy="12" r="1.5" /><path d="M7.5 4.5v3M7.5 7.5L2.5 10.5M7.5 7.5l5 3" /></svg>),
      },
      {
        id: 'preview', label: 'Vista Portafolio', to: '/dashboard/preview', badgeVariant: 'amber',
        icon: (<svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M.5 7.5S3 2 7.5 2 14.5 7.5 14.5 7.5 12 13 7.5 13 .5 7.5.5 7.5z" /><circle cx="7.5" cy="7.5" r="2.5" /></svg>),
      },
    ],
  },
  {
    label: 'Cuenta',
    items: [
      {
        id: 'settings', label: 'Configuración', to: '/dashboard/settings',
        icon: (<svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="7.5" cy="7.5" r="2" /><path d="M7.5 1v2M7.5 12v2M1 7.5h2M12 7.5h2M2.9 2.9l1.4 1.4M10.7 10.7l1.4 1.4M2.9 12.1l1.4-1.4M10.7 4.3l1.4-1.4" /></svg>),
      },
      {
        id: 'logout', label: 'Cerrar sesión', to: '/', danger: true,
        icon: (<svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M5.5 13H3a1 1 0 01-1-1V3a1 1 0 011-1h2.5M10 10.5l3.5-3-3.5-3M13.5 7.5H5.5" /></svg>),
      },
    ],
  },
];

function getActiveId(pathname) {
  let match = null, matchLen = 0;
  for (const section of NAV_SECTIONS) {
    for (const item of section.items) {
      if (item.exact) {
        if (pathname === item.to && item.to.length > matchLen) { match = item.id; matchLen = item.to.length; }
      } else {
        if ((pathname === item.to || pathname.startsWith(item.to + '/')) && item.to.length > matchLen) { match = item.id; matchLen = item.to.length; }
      }
    }
  }
  return match || 'dashboard';
}

const BADGE_STYLES = {
  blue:  { background: 'var(--azul)',          color: '#fff' },
  gray:  { background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.4)' },
  amber: { background: 'rgba(245,158,11,.2)',  color: '#fbbf24' },
};

export default function Sidebar({ collapsed, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeId = getActiveId(location.pathname);

  const BASE_URL = process.env.REACT_APP_API_URL;

  /* NUEVO: estado del modal de confirmación */
  const [logoutModal, setLogoutModal] = useState(false);
  const [loggingOut,  setLoggingOut]  = useState(false);

  /* Ejecuta el logout real (solo llamado desde el modal) */
  const doLogout = async () => {
    setLoggingOut(true);
    const token = sessionStorage.getItem('tokenPORT');
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Error al intentar cerrar sesión:', err);
    }
    sessionStorage.removeItem('tokenPORT');
    sessionStorage.removeItem('usuario');
    sessionStorage.removeItem('perfil_cache');
    window.location.href = '/';
  };

  /* Abre el modal en vez de cerrar sesión directamente */
  const handleLogoutClick = () => {
    setMobileOpen(false);
    setLogoutModal(true);
  };

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleNavClick = (to) => { navigate(to); setMobileOpen(false); };

  const NavContent = ({ inDrawer = false }) => (
    <>
      {NAV_SECTIONS.map((section, si) => (
        <div className="dsh-nav-section" key={section.label} style={{ paddingTop: si === 0 ? 18 : undefined }}>
          <div className="dsh-nav-section-label">{section.label}</div>
          {section.items.map((item) => (
            <button
              key={item.id}
              className={['dsh-nav-item', activeId === item.id ? 'active' : '', item.danger ? 'danger' : ''].filter(Boolean).join(' ')}
              data-tip={item.label}
              onClick={() => {
                if (item.id === 'logout') {
                  handleLogoutClick();
                } else {
                  inDrawer ? handleNavClick(item.to) : navigate(item.to);
                }
              }}
            >
              <svg className="dsh-nav-icon" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.7">
                {item.icon.props.children}
              </svg>
              <span className="dsh-nav-text">{item.label}</span>
              {item.badge && (
                <span className="dsh-nav-badge" style={BADGE_STYLES[item.badgeVariant]}>{item.badge}</span>
              )}
              {item.tag && <span className="dsh-nav-vtag">{item.tag}</span>}
            </button>
          ))}
        </div>
      ))}
      <div className="dsh-sidebar-footer">
        <div className="dsh-progress-label">
          <span>Completitud del perfil</span>
          <strong>72%</strong>
        </div>
        <div className="dsh-progress-bar">
          <div className="dsh-progress-fill" />
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        /* ══ SIDEBAR — DESKTOP ══ */
        .dsh-sidebar {
          position: fixed;
          top: var(--nav-height, 60px);
          left: 0; bottom: 0;
          width: 240px;
          background: #0c1220;
          border-right: 1px solid rgba(255,255,255,.06);
          display: flex; flex-direction: column;
          z-index: 100;
          transition: width .22s cubic-bezier(.4,0,.2,1);
          overflow: hidden;
        }
        .dsh-sidebar.collapsed { width: 64px; }

        /* botón toggle desktop */
        .dsh-sidebar-toggle {
          position: fixed;
          top: calc(var(--nav-height, 60px) + 18px);
          width: 26px; height: 26px; border-radius: 50%;
          background: var(--azul, #0077b7);
          border: 2px solid #004f7c;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; z-index: 150;
          transition: left .22s cubic-bezier(.4,0,.2,1), background .15s;
          box-shadow: 0 2px 8px rgba(0,119,183,.35);
        }
        .dsh-sidebar-toggle:hover { background: var(--azul-hover, #005f95); }
        .dsh-sidebar-toggle svg {
          width: 10px; height: 10px;
          stroke: #fff; fill: none; stroke-width: 2.2;
          transition: transform .2s;
        }

        /* sección */
        .dsh-nav-section { padding: 12px 8px 2px; }
        .dsh-nav-section-label {
          font-size: 10px; font-weight: 600;
          color: rgba(255,255,255,.18);
          text-transform: uppercase; letter-spacing: .1em;
          padding: 0 8px; margin-bottom: 3px;
          white-space: nowrap;
          transition: opacity .15s;
        }
        .dsh-sidebar.collapsed .dsh-nav-section-label { opacity: 0; }

        /* ítem */
        .dsh-nav-item {
          display: flex; align-items: center; gap: 9px;
          padding: 7px 9px; border-radius: 7px;
          font-size: 13px; font-weight: 400;
          color: rgba(255,255,255,.42);
          background: transparent; border: none; width: 100%;
          text-align: left; cursor: pointer;
          font-family: var(--font, 'Inter', sans-serif);
          transition: all .12s; margin-bottom: 1px;
          white-space: nowrap; overflow: hidden;
          position: relative;
        }
        .dsh-nav-item:hover {
          background: rgba(255,255,255,.07);
          color: rgba(255,255,255,.82);
        }
        .dsh-nav-item.active {
          background: rgba(0,119,183,.22);
          color: #7ec8e8; font-weight: 600;
        }
        .dsh-nav-item.danger { color: rgba(232,85,85,.55); }
        .dsh-nav-item.danger:hover {
          background: rgba(232,85,85,.1);
          color: var(--rojo-soft, #e85555);
        }

        .dsh-nav-icon {
          width: 16px; height: 16px; flex-shrink: 0;
        }
        .dsh-nav-text { transition: opacity .15s; white-space: nowrap; }
        .dsh-sidebar.collapsed .dsh-nav-text,
        .dsh-sidebar.collapsed .dsh-nav-badge,
        .dsh-sidebar.collapsed .dsh-nav-vtag { opacity: 0; width: 0; overflow: hidden; }

        .dsh-nav-badge {
          margin-left: auto;
          font-size: 10px; font-weight: 600;
          padding: 1px 7px; border-radius: 20px;
          flex-shrink: 0;
          transition: opacity .15s;
        }
        .dsh-nav-vtag {
          margin-left: auto;
          font-size: 9px; font-weight: 600;
          padding: 1px 6px; border-radius: 10px;
          background: rgba(232,85,85,.18); color: var(--rojo-soft, #e85555);
          border: 1px solid rgba(232,85,85,.22);
          letter-spacing: .06em; text-transform: uppercase;
          flex-shrink: 0; transition: opacity .15s;
        }

        /* tooltip en modo colapsado */
        .dsh-nav-item::after {
          content: attr(data-tip);
          position: absolute; left: 52px;
          background: #111827;
          color: #fff; font-size: 12px; font-weight: 500;
          padding: 4px 10px; border-radius: 6px;
          white-space: nowrap; pointer-events: none;
          opacity: 0; transform: translateX(-4px);
          transition: opacity .15s, transform .15s;
          z-index: 200;
        }
        .dsh-sidebar.collapsed .dsh-nav-item:hover::after {
          opacity: 1; transform: translateX(0);
        }

        /* footer con progreso */
        .dsh-sidebar-footer {
          margin-top: auto; padding: 14px;
          border-top: 1px solid rgba(255,255,255,.06);
        }
        .dsh-progress-label {
          display: flex; justify-content: space-between;
          font-size: 11px; color: rgba(255,255,255,.28);
          margin-bottom: 6px;
          transition: opacity .15s;
        }
        .dsh-progress-label strong { color: #60a5fa; font-weight: 600; }
        .dsh-sidebar.collapsed .dsh-progress-label,
        .dsh-sidebar.collapsed .dsh-progress-bar { opacity: 0; }
        .dsh-progress-bar {
          width: 100%; height: 3px;
          background: rgba(255,255,255,.1); border-radius: 2px; overflow: hidden;
          transition: opacity .15s;
        }
        .dsh-progress-fill {
          height: 100%; width: 72%;
          background: linear-gradient(90deg, var(--azul, #0077b7), #60a5fa);
          border-radius: 2px;
        }

        /* ══ MOBILE — ocultar sidebar y toggle desktop ══ */
        @media (max-width: 767px) {
          .dsh-sidebar         { display: none !important; }
          .dsh-sidebar-toggle  { display: none !important; }
        }

        /* ══ MOBILE DRAWER ══ */
        /* overlay */
        .dsh-drawer-overlay {
          display: none;
          pointer-events: none;
          position: fixed; inset: 0;
          background: rgba(0,0,0,.55);
          backdrop-filter: blur(2px);
          z-index: 400;
          opacity: 0;
          transition: opacity .25s;
        }
        .dsh-drawer-overlay.open {
          opacity: 1;
          pointer-events: auto;
        }

        /* drawer */
        .dsh-drawer {
          position: fixed;
          top: var(--nav-height, 60px);
          left: 0; bottom: 0;
          width: 270px;
          background: #0c1220;
          border-right: 1px solid rgba(255,255,255,.06);
          display: flex; flex-direction: column;
          z-index: 410;
          transform: translateX(-100%);
          transition: transform .28s cubic-bezier(.4,0,.2,1);
          overflow-y: auto;
          overflow-x: hidden;
        }
        .dsh-drawer.open {
          transform: translateX(0);
        }

        /* en drawer los textos siempre visibles */
        .dsh-drawer .dsh-nav-section-label { opacity: 1 !important; }
        .dsh-drawer .dsh-nav-text          { opacity: 1 !important; width: auto !important; overflow: visible !important; }
        .dsh-drawer .dsh-nav-badge         { opacity: 1 !important; width: auto !important; overflow: visible !important; }
        .dsh-drawer .dsh-nav-vtag          { opacity: 1 !important; width: auto !important; overflow: visible !important; }
        /* sin tooltip en drawer */
        .dsh-drawer .dsh-nav-item::after   { display: none; }

        /* ══ FAB — botón flotante móvil ══ */
        .dsh-fab {
          display: none;
          position: fixed;
          bottom: 24px;
          right: 20px;
          width: 52px; height: 52px;
          border-radius: 16px;
          background: var(--azul, #0077b7);
          border: none;
          box-shadow: 0 4px 20px rgba(0,119,183,.45), 0 1px 4px rgba(0,0,0,.3);
          cursor: pointer; z-index: 420;
          align-items: center; justify-content: center;
          transition: background .15s, transform .15s, box-shadow .15s;
        }
        .dsh-fab:active {
          transform: scale(.93);
          box-shadow: 0 2px 10px rgba(0,119,183,.35);
        }
        .dsh-fab svg {
          width: 22px; height: 22px;
          stroke: #fff; fill: none; stroke-width: 2;
          transition: transform .25s cubic-bezier(.4,0,.2,1);
        }
        .dsh-fab.open svg {
          transform: rotate(45deg);
        }

        @media (max-width: 767px) {
          .dsh-drawer-overlay { display: block; }
          .dsh-fab            { display: flex; }
        }
      `}</style>

      {/* ── DESKTOP sidebar ── */}
      <aside className={`dsh-sidebar${collapsed ? ' collapsed' : ''}`}>
        <NavContent inDrawer={false} />
      </aside>

      {/* Botón toggle desktop */}
      <button
        onClick={onToggle}
        title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        className="dsh-sidebar-toggle"
        style={{ left: collapsed ? 'calc(64px - 13px)' : 'calc(240px - 13px)' }}
      >
        <svg viewBox="0 0 10 8" style={{ transform: collapsed ? 'rotate(180deg)' : 'none' }}>
          <path d="M1 1l4 3-4 3M6 4h3.5" />
        </svg>
      </button>

      {/* ── MOBILE: overlay + drawer ── */}
      <div className={`dsh-drawer-overlay${mobileOpen ? ' open' : ''}`} onClick={() => setMobileOpen(false)} aria-hidden="true" />
      <nav className={`dsh-drawer${mobileOpen ? ' open' : ''}`} aria-label="Menú principal">
        <NavContent inDrawer={true} />
      </nav>

      {/* ── FAB móvil ── */}
      <button
        className={`dsh-fab${mobileOpen ? ' open' : ''}`}
        onClick={() => setMobileOpen(v => !v)}
        aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
        title={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
      >
        <svg viewBox="0 0 24 24">
          {mobileOpen ? (
            <><line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" /></>
          ) : (
            <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>
          )}
        </svg>
      </button>

      {/* ── Modal de confirmación de cierre de sesión ── */}
      <ConfirmModal
        open={logoutModal}
        title="¿Cerrar sesión?"
        message="Tu sesión se cerrará y tendrás que volver a iniciar sesión para acceder a tu portafolio."
        confirmLabel="Sí, cerrar sesión"
        cancelLabel="Cancelar"
        variant="red"
        icon="logout"
        loading={loggingOut}
        onConfirm={doLogout}
        onClose={() => !loggingOut && setLogoutModal(false)}
      />
    </>
  );
}