import { useEffect, useState } from 'react';
import { useLanguage } from '../../../core/i18n';
import { useLocation, useNavigate } from 'react-router-dom';
import ConfirmModal from '../../../shared/ui/ConfirmModal';
import { clearAuthStorage } from '../../../shared/utils/authStorage';

const ICON_PROPS = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const NAV_SECTIONS = [
  {
    label: 'General',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        to: '/admin',
        exact: true,
        icon: (<><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>),
      },
      {
        id: 'profile',
        label: 'Perfil',
        to: '/admin/profile',
        icon: (<><path d="M19 21a7 7 0 0 0-14 0" /><circle cx="12" cy="8" r="4" /><path d="M16 11.5 18 13l3-4" /></>),
      },
    ],
  },
  {
    label: 'Gestion',
    items: [
      {
        id: 'users',
        label: 'Usuarios',
        to: '/admin/users',
        icon: (<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9" /><path d="M16 3.1a4 4 0 0 1 0 7.8" /></>),
      },
      {
        id: 'events',
        label: 'Eventos',
        to: '/admin/events',
        icon: (<><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M8 2v4" /><path d="M16 2v4" /><path d="M3 10h18" /><path d="M8 14h3" /><path d="M14 14h2" /><path d="M8 17h2" /></>),
      },
      {
        id: 'notices',
        label: 'Avisos',
        to: '/admin/notices',
        icon: (<><path d="M4 11v2a2 2 0 0 0 2 2h2l4 4v-4h4l4-4V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6Z" /><path d="M8 7h8" /><path d="M8 10h5" /></>),
      },
      {
        id: 'reports',
        label: 'Reportes',
        to: '/admin/reports',
        icon: (<><path d="M4 19V5a2 2 0 0 1 2-2h8l6 6v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" /><path d="M14 3v6h6" /><path d="M8 16v-4" /><path d="M12 16V9" /><path d="M16 16v-2" /></>),
      },
      {
        id: 'audit',
        label: 'Bitacora',
        to: '/admin/audit',
        icon: (<><path d="M8 6h13" /><path d="M8 12h13" /><path d="M8 18h13" /><path d="M3 6h.01" /><path d="M3 12h.01" /><path d="M3 18h.01" /></>),
      },
      {
        id: 'backups',
        label: 'Respaldos',
        to: '/admin/backups',
        icon: (<><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /><path d="M5 17v2" /><path d="M19 17v2" /></>),
      },
    ],
  },
  {
    label: 'Cuenta',
    items: [
      {
        id: 'settings',
        label: 'Configuracion',
        to: '/admin/settings',
        icon: (<><path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 0 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.3 7A2 2 0 0 1 7.1 4.2l.1.1a1.7 1.7 0 0 0 1.9.3h.1A1.7 1.7 0 0 0 10 3V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 0 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1A1.7 1.7 0 0 0 21 10h.1a2 2 0 0 1 0 4H21a1.7 1.7 0 0 0-1.6 1Z" /></>),
      },
      {
        id: 'logout',
        label: 'Cerrar sesion',
        to: '/',
        danger: true,
        icon: (<><path d="M10 17 15 12 10 7" /><path d="M15 12H3" /><path d="M21 19V5a2 2 0 0 0-2-2h-5" /></>),
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

export default function AdminSidebar({ collapsed, onToggle }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const activeId = getActiveId(location.pathname);
  const BASE_URL = process.env.REACT_APP_API_URL;

  const [logoutModal, setLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [footerInset, setFooterInset] = useState(0);

  const doLogout = async () => {
    setLoggingOut(true);
    const token = localStorage.getItem('tokenPORT');

    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error(t('admin.layout.logout.error'), err);
    }

    clearAuthStorage();
    window.location.href = '/';
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

  useEffect(() => {
    let frameId = null;

    const readNavHeight = () => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue('--nav-height');
      const parsed = Number.parseFloat(raw);
      return Number.isFinite(parsed) ? parsed : 60;
    };

    const updateFooterInset = () => {
      frameId = null;

      if (window.innerWidth <= 767) {
        setFooterInset(0);
        return;
      }

      const footer = document.querySelector('.spk-footer');

      if (!footer) {
        setFooterInset(0);
        return;
      }

      const footerTop = footer.getBoundingClientRect().top;
      const visibleFooter = Math.max(0, window.innerHeight - footerTop);
      const minSidebarHeight = collapsed ? 156 : 240;
      const maxInset = Math.max(0, window.innerHeight - readNavHeight() - minSidebarHeight);
      const nextInset = Math.round(Math.min(visibleFooter, maxInset));

      setFooterInset((prev) => (Math.abs(prev - nextInset) > 1 ? nextInset : prev));
    };

    const scheduleUpdate = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(updateFooterInset);
    };

    scheduleUpdate();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [collapsed]);

  const getSectionKey = (label) => {
    if (label === 'Gestion') return 'management';
    if (label === 'Cuenta') return 'account';
    return 'general';
  };

  const handleNavClick = (item, inDrawer = false) => {
    if (item.id === 'logout') {
      setMobileOpen(false);
      setLogoutModal(true);
      return;
    }

    navigate(item.to);
    if (inDrawer) setMobileOpen(false);
  };

  const NavContent = ({ inDrawer = false }) => (
    <>
      {NAV_SECTIONS.map((section, sectionIndex) => (
        <div className="dsh-nav-section" key={section.label} style={{ paddingTop: sectionIndex === 0 ? 18 : undefined }}>
          <div className="dsh-nav-section-label">
            {t(`admin.layout.section.${getSectionKey(section.label)}`)}
          </div>

          {section.items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={[
                'dsh-nav-item',
                activeId === item.id ? 'active' : '',
                item.danger ? 'danger' : '',
              ].filter(Boolean).join(' ')}
              data-tip={t(`admin.layout.nav.${item.id}`)}
              onClick={() => handleNavClick(item, inDrawer)}
            >
              <svg className="dsh-nav-icon" viewBox="0 0 24 24" {...ICON_PROPS}>
                {item.icon}
              </svg>
              <span className="dsh-nav-text">{t(`admin.layout.nav.${item.id}`)}</span>
            </button>
          ))}
        </div>
      ))}

      <div className="dsh-sidebar-footer">
        <div className="dsh-progress-label">
          <span>{t('admin.layout.footer.panel')}</span>
          <strong>{t('admin.layout.footer.active')}</strong>
        </div>
        <div className="dsh-progress-bar">
          <div className="dsh-progress-fill" style={{ width: '100%' }} />
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside
        className={`dsh-sidebar${collapsed ? ' collapsed' : ''}${footerInset > 4 ? ' footer-near' : ''}`}
        style={{ '--dsh-sidebar-footer-inset': `${footerInset}px` }}
      >
        <NavContent />
      </aside>

      <button
        type="button"
        onClick={onToggle}
        title={collapsed ? t('admin.layout.toggle.expand') : t('admin.layout.toggle.collapse')}
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
      <nav className={`dsh-drawer${mobileOpen ? ' open' : ''}`} aria-label={t('admin.layout.drawer.aria')}>
        <NavContent inDrawer />
      </nav>

      <button
        type="button"
        className={`dsh-fab${mobileOpen ? ' open' : ''}`}
        onClick={() => setMobileOpen(value => !value)}
        aria-label={mobileOpen ? t('admin.layout.drawer.close') : t('admin.layout.drawer.open')}
        title={mobileOpen ? t('admin.layout.drawer.close') : t('admin.layout.drawer.open')}
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
        title={t('admin.layout.logout.title')}
        message={t('admin.layout.logout.message')}
        confirmLabel={t('admin.layout.logout.confirm')}
        cancelLabel={t('actions.cancel')}
        variant="red"
        icon="logout"
        loading={loggingOut}
        onConfirm={doLogout}
        onClose={() => !loggingOut && setLogoutModal(false)}
      />
    </>
  );
}
