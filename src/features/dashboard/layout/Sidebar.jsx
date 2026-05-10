import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ConfirmModal from '../../../shared/ui/ConfirmModal';
import { clearAuthStorage } from '../../../shared/utils/authStorage';
import { useDashboardSummary } from '../hooks/useDashboardSummary';

const NAV_SECTIONS = [
  {
    label: 'General',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        to: '/dashboard',
        exact: true,
        icon: (<svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="1.5" y="1.5" width="5" height="5" rx="1" /><rect x="8.5" y="1.5" width="5" height="5" rx="1" /><rect x="1.5" y="8.5" width="5" height="5" rx="1" /><rect x="8.5" y="8.5" width="5" height="5" rx="1" /></svg>),
      },
      {
        id: 'profile',
        label: 'Mi Perfil',
        to: '/dashboard/profile',
        icon: (<svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="7.5" cy="5" r="3" /><path d="M1.5 14c0-3.3 2.7-6 6-6s6 2.7 6 6" /></svg>),
      },
    ],
  },
  {
    label: 'Portafolio',
    items: [
      {
        id: 'projects',
        label: 'Mis Proyectos',
        to: '/dashboard/projects',
        badgeVariant: 'blue',
        icon: (<svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="2" y="3" width="11" height="10" rx="1.5" /><path d="M5 3V2M10 3V2M2 6.5h11" /></svg>),
      },
      {
        id: 'skills',
        label: 'Habilidades',
        to: '/dashboard/skills',
        badgeVariant: 'gray',
        icon: (<svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M2 11.5V13h1.5l5-5-1.5-1.5-5 5zM12.5 3.5a1 1 0 000-1.4l-1.1-1.1a1 1 0 00-1.4 0L9 2.5 12.5 6l1-1z" /></svg>),
      },
      {
        id: 'experience',
        label: 'Experiencia',
        to: '/dashboard/experience',
        badgeVariant: 'amber',
        icon: (<svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="2" y="3" width="11" height="10" rx="1.5" /><path d="M5 3V1.5M10 3V1.5M2 6.5h11" /></svg>),
      },
      {
        id: 'networks',
        label: 'Redes Profesionales',
        to: '/dashboard/enlaces',
        badgeVariant: 'blue',
        icon: (<svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="7.5" cy="3" r="1.5" /><circle cx="2.5" cy="12" r="1.5" /><circle cx="12.5" cy="12" r="1.5" /><path d="M7.5 4.5v3M7.5 7.5L2.5 10.5M7.5 7.5l5 3" /></svg>),
      },
      {
        id: 'preview',
        label: 'Vista Portafolio',
        to: '/dashboard/view',
        badgeVariant: 'amber',
        icon: (<svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M.5 7.5S3 2 7.5 2 14.5 7.5 14.5 7.5 12 13 7.5 13 .5 7.5.5 7.5z" /><circle cx="7.5" cy="7.5" r="2.5" /></svg>),
      },
    ],
  },
  {
    label: 'Cuenta',
    items: [
      {
        id: 'settings',
        label: 'Configuracion',
        to: '/dashboard/settings',
        icon: (<svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="7.5" cy="7.5" r="2" /><path d="M7.5 1v2M7.5 12v2M1 7.5h2M12 7.5h2M2.9 2.9l1.4 1.4M10.7 10.7l1.4 1.4M2.9 12.1l1.4-1.4M10.7 4.3l1.4-1.4" /></svg>),
      },
      {
        id: 'logout',
        label: 'Cerrar sesion',
        to: '/',
        danger: true,
        icon: (<svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M5.5 13H3a1 1 0 01-1-1V3a1 1 0 011-1h2.5M10 10.5l3.5-3-3.5-3M13.5 7.5H5.5" /></svg>),
      },
    ],
  },
];

function getActiveId(pathname) {
  let match = null;
  let matchLen = 0;

  for (const section of NAV_SECTIONS) {
    for (const item of section.items) {
      if (item.exact) {
        if (pathname === item.to && item.to.length > matchLen) {
          match = item.id;
          matchLen = item.to.length;
        }
      } else if ((pathname === item.to || pathname.startsWith(item.to + '/')) && item.to.length > matchLen) {
        match = item.id;
        matchLen = item.to.length;
      }
    }
  }

  return match || 'dashboard';
}

const BADGE_STYLES = {
  blue: { background: 'var(--azul)', color: '#fff' },
  gray: { background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.4)' },
  amber: { background: 'rgba(245,158,11,.2)', color: '#fbbf24' },
};

export default function Sidebar({ collapsed, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeId = getActiveId(location.pathname);
  const summary = useDashboardSummary(location.pathname);
  const BASE_URL = process.env.REACT_APP_API_URL;

  const [logoutModal, setLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const doLogout = async () => {
    setLoggingOut(true);
    const token = localStorage.getItem('tokenPORT');

    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Error al intentar cerrar sesion:', err);
    }

    clearAuthStorage();
    window.location.href = '/';
  };

  const handleLogoutClick = () => {
    setMobileOpen(false);
    setLogoutModal(true);
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleNavClick = (to) => {
    navigate(to);
    setMobileOpen(false);
  };

  const getItemBadge = (id) => {
    if (summary.loading && !summary.error) return '...';

    const counts = summary.counts || {};

    if (id === 'projects') return String(counts.projects ?? 0);
    if (id === 'skills') return String(counts.skills ?? 0);
    if (id === 'experience') return String(counts.experiences ?? 0);
    if (id === 'networks') return String(counts.links ?? 0);

    return null;
  };

  const NavContent = ({ inDrawer = false }) => (
    <>
      {NAV_SECTIONS.map((section, si) => (
        <div className="dsh-nav-section" key={section.label} style={{ paddingTop: si === 0 ? 18 : undefined }}>
          <div className="dsh-nav-section-label">{section.label}</div>

          {section.items.map((item) => {
            const badge = getItemBadge(item.id);

            return (
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
                {badge !== null && (
                  <span className="dsh-nav-badge" style={BADGE_STYLES[item.badgeVariant]}>{badge}</span>
                )}
                {item.tag && <span className="dsh-nav-vtag">{item.tag}</span>}
              </button>
            );
          })}
        </div>
      ))}

      <div className="dsh-sidebar-footer">
        <div className="dsh-progress-label">
          <span>Completitud del portafolio</span>
          <strong>{summary.progress}%</strong>
        </div>
        <div className="dsh-progress-bar">
          <div className="dsh-progress-fill" style={{ width: `${summary.progress}%` }} />
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside className={`dsh-sidebar${collapsed ? ' collapsed' : ''}`}>
        <NavContent inDrawer={false} />
      </aside>

      <button
        onClick={onToggle}
        title={collapsed ? 'Expandir menu' : 'Colapsar menu'}
        className="dsh-sidebar-toggle"
        style={{ left: collapsed ? 'calc(64px - 13px)' : 'calc(240px - 13px)' }}
      >
        <svg viewBox="0 0 10 8" style={{ transform: collapsed ? 'rotate(180deg)' : 'none' }}>
          <path d="M1 1l4 3-4 3M6 4h3.5" />
        </svg>
      </button>

      <div
        className={`dsh-drawer-overlay${mobileOpen ? ' open' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />
      <nav className={`dsh-drawer${mobileOpen ? ' open' : ''}`} aria-label="Menu principal">
        <NavContent inDrawer={true} />
      </nav>

      <button
        className={`dsh-fab${mobileOpen ? ' open' : ''}`}
        onClick={() => setMobileOpen(v => !v)}
        aria-label={mobileOpen ? 'Cerrar menu' : 'Abrir menu'}
        title={mobileOpen ? 'Cerrar menu' : 'Abrir menu'}
      >
        <svg viewBox="0 0 24 24">
          {mobileOpen ? (
            <><line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" /></>
          ) : (
            <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>
          )}
        </svg>
      </button>

      <ConfirmModal
        open={logoutModal}
        title="Cerrar sesion?"
        message="Tu sesion se cerrara y tendras que volver a iniciar sesion para acceder a tu portafolio."
        confirmLabel="Si, cerrar sesion"
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
