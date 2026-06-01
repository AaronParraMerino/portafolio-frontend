import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ConfirmModal from '../../../shared/ui/ConfirmModal';
import { clearAuthStorage, getStoredUser, isPublisherUser } from '../../../shared/utils/authStorage';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { useLanguage } from '../../../core/i18n';

const ICON_PROPS = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const NAV_SECTIONS = [
  {
    labelKey: 'dashboard.sidebar.section.general',
    items: [
      {
        id: 'dashboard',
        labelKey: 'dashboard.sidebar.dashboard',
        to: '/dashboard',
        exact: true,
        icon: (<><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="5" rx="2" /><rect x="14" y="12" width="7" height="9" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /></>),
      },
      {
        id: 'profile',
        labelKey: 'dashboard.sidebar.profile',
        to: '/dashboard/profile',
        icon: (<><path d="M19 21a7 7 0 0 0-14 0" /><circle cx="12" cy="8" r="4" /></>),
      },
    ],
  },
  {
    labelKey: 'dashboard.sidebar.section.portfolio',
    items: [
      {
        id: 'projects',
        labelKey: 'dashboard.sidebar.projects',
        to: '/dashboard/projects',
        badgeVariant: 'blue',
        icon: (<><path d="M3 7.5V6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1.5" /><path d="M3 9h18l-1.3 9.2A2 2 0 0 1 17.7 20H6.3a2 2 0 0 1-2-1.8L3 9Z" /><path d="m10 14-1.5 1.5L10 17" /><path d="m14 14 1.5 1.5L14 17" /></>),
      },
      {
        id: 'skills',
        labelKey: 'dashboard.sidebar.skills',
        to: '/dashboard/skills',
        badgeVariant: 'gray',
        icon: (<><path d="M12 3v4" /><path d="M12 17v4" /><path d="M5 10v4" /><path d="M19 10v4" /><path d="M3 12h4" /><path d="M17 12h4" /><path d="M10 5h4" /><path d="M10 19h4" /><circle cx="12" cy="12" r="3" /></>),
      },
      {
        id: 'experience',
        labelKey: 'dashboard.sidebar.experience',
        to: '/dashboard/experience',
        badgeVariant: 'amber',
        icon: (<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M3 12h18" /><path d="M12 12v2" /></>),
      },
      {
        id: 'networks',
        labelKey: 'dashboard.sidebar.networks',
        to: '/dashboard/enlaces',
        badgeVariant: 'blue',
        icon: (<><path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-.9.9" /><path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l.9-.9" /></>),
      },
      {
        id: 'preview',
        labelKey: 'dashboard.sidebar.preview',
        to: '/dashboard/view',
        badgeVariant: 'amber',
        icon: (<><rect x="3" y="4" width="18" height="14" rx="2" /><path d="M8 21h8" /><path d="M12 18v3" /><path d="M8 11s1.4-3 4-3 4 3 4 3-1.4 3-4 3-4-3-4-3Z" /><circle cx="12" cy="11" r="1" /></>),
      },
    ],
  },
  {
    label: 'Publicar',
    items: [
      {
        id: 'events',
        label: 'Eventos',
        to: '/dashboard/events',
        badgeVariant: 'teal',
        lockedForUsers: true,
        icon: (<><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /><path d="m9 15 2 2 4-5" /></>),
      },
    ],
  },
  {
    labelKey: 'dashboard.sidebar.section.account',
    items: [
      {
        id: 'settings',
        labelKey: 'dashboard.sidebar.settings',
        to: '/dashboard/settings',
        icon: (<><path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 0 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.3 7A2 2 0 0 1 7.1 4.2l.1.1a1.7 1.7 0 0 0 1.9.3h.1A1.7 1.7 0 0 0 10 3V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 0 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1A1.7 1.7 0 0 0 21 10h.1a2 2 0 0 1 0 4H21a1.7 1.7 0 0 0-1.6 1Z" /></>),
      },
      {
        id: 'logout',
        labelKey: 'dashboard.sidebar.logout',
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

const BADGE_STYLES = {
  blue: { background: 'var(--azul)', color: '#fff' },
  gray: { background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.4)' },
  amber: { background: 'rgba(245,158,11,.2)', color: '#fbbf24' },
  teal: { background: 'rgba(20,184,166,.2)', color: '#5eead4' },
};

export default function Sidebar({ collapsed, paused = false, onToggle }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const activeId = getActiveId(location.pathname);
  const summary = useDashboardSummary(location.pathname);
  const BASE_URL = process.env.REACT_APP_API_URL;
  const storedUser = getStoredUser();
  const canPublishEvents = isPublisherUser(storedUser);

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
      const minSidebarHeight = collapsed ? 160 : 230;
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
    if (id === 'events') return canPublishEvents ? '3/mes' : 'Permiso';

    return null;
  };

  const NavContent = ({ inDrawer = false }) => (
    <>
      {NAV_SECTIONS.map((section, si) => (
        <div className="dsh-nav-section" key={section.labelKey || section.label} style={{ paddingTop: si === 0 ? 18 : undefined }}>
          <div className="dsh-nav-section-label">{section.labelKey ? t(section.labelKey) : section.label}</div>

          {section.items.map((item) => {
            const badge = getItemBadge(item.id);
            const itemLabel = item.labelKey ? t(item.labelKey) : item.label;
            const itemTag = item.tagKey ? t(item.tagKey) : item.tag;

            return (
              <button
                key={item.id}
                className={['dsh-nav-item', activeId === item.id ? 'active' : '', item.danger ? 'danger' : ''].filter(Boolean).join(' ')}
                data-tip={itemLabel}
                onClick={() => {
                  if (item.id === 'logout') {
                    handleLogoutClick();
                  } else {
                    inDrawer ? handleNavClick(item.to) : navigate(item.to);
                  }
                }}
              >
                <svg className="dsh-nav-icon" viewBox="0 0 24 24" {...ICON_PROPS}>
                  {item.icon}
                </svg>
                <span className="dsh-nav-text">{itemLabel}</span>
                {badge !== null && (
                  <span className="dsh-nav-badge" style={BADGE_STYLES[item.badgeVariant]}>{badge}</span>
                )}
                {itemTag && <span className="dsh-nav-vtag">{itemTag}</span>}
              </button>
            );
          })}
        </div>
      ))}

      <div className="dsh-sidebar-footer">
        <div className="dsh-progress-label">
          <span>{t('dashboard.sidebar.progress.label')}</span>
          <strong>{summary.progress}%</strong>
        </div>
        <div className="dsh-progress-bar">
          <div className="dsh-progress-fill" style={{ width: `${summary.progress}%` }} />
        </div>
      </div>
    </>
  );

  const toggleTitle = collapsed ? t('dashboard.sidebar.toggle.expand') : t('dashboard.sidebar.toggle.collapse');
  const mobileMenuLabel = mobileOpen ? t('dashboard.sidebar.mobile.close') : t('dashboard.sidebar.mobile.open');

  return (
    <>
      <aside
        className={`dsh-sidebar${collapsed ? ' collapsed' : ''}${paused ? ' paused' : ''}${footerInset > 4 ? ' footer-near' : ''}`}
        style={{ '--dsh-sidebar-footer-inset': `${footerInset}px` }}
      >
        <NavContent inDrawer={false} />
      </aside>

      <button
        onClick={onToggle}
        title={toggleTitle}
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
      <nav className={`dsh-drawer${mobileOpen ? ' open' : ''}`} aria-label={t('dashboard.sidebar.drawer.aria')}>
        <NavContent inDrawer={true} />
      </nav>

      <button
        className={`dsh-fab${mobileOpen ? ' open' : ''}`}
        onClick={() => setMobileOpen(v => !v)}
        aria-label={mobileMenuLabel}
        title={mobileMenuLabel}
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
        title={t('nav.logoutTitle')}
        message={t('nav.logoutMessage')}
        confirmLabel={t('nav.logoutConfirm')}
        cancelLabel={t('nav.cancel')}
        variant="red"
        icon="logout"
        loading={loggingOut}
        onConfirm={doLogout}
        onClose={() => !loggingOut && setLogoutModal(false)}
      />
    </>
  );
}
