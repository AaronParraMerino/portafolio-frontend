import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './layout/Header';
import { useDashboardSummary } from './hooks/useDashboardSummary';
import { useLanguage } from '../../core/i18n';

const QUICK_STATS = [
  { id: 'projects', labelKey: 'dashboard.stats.projects', color: 'var(--azul)', bg: 'var(--azul-light)', border: 'var(--azul-mid)' },
  { id: 'skills', labelKey: 'dashboard.stats.skills', color: 'var(--azul)', bg: 'var(--azul-light)', border: 'var(--azul-mid)' },
  { id: 'experiences', labelKey: 'dashboard.stats.experiences', color: 'var(--azul)', bg: 'var(--azul-light)', border: 'var(--azul-mid)' },
  { id: 'links', labelKey: 'dashboard.stats.links', color: 'var(--rojo-mid)', bg: 'var(--rojo-bg)', border: 'var(--rojo-borde)' },
];

const QUICK_LINKS = [
  {
    id: 'projects',
    labelKey: 'dashboard.quick.projects.label',
    descKey: 'dashboard.quick.projects.desc',
    to: '/dashboard/projects',
    badgeColor: 'var(--azul)',
    badgeBg: 'var(--azul-light)',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="4" width="14" height="13" rx="2" />
        <path d="M7 4V3M13 4V3M3 8h14" />
      </svg>
    ),
  },
  {
    id: 'profile',
    labelKey: 'dashboard.quick.profile.label',
    descKey: 'dashboard.quick.profile.desc',
    to: '/dashboard/profile',
    badgeColor: '#f59e0b',
    badgeBg: 'rgba(245,158,11,.1)',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="10" cy="7" r="4" />
        <path d="M2 19c0-4.4 3.6-8 8-8s8 3.6 8 8" />
      </svg>
    ),
  },
  {
    id: 'skills',
    labelKey: 'dashboard.quick.skills.label',
    descKey: 'dashboard.quick.skills.desc',
    to: '/dashboard/skills',
    badgeColor: 'var(--azul)',
    badgeBg: 'var(--azul-light)',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M3 15V17h2l7-7-2-2-7 7zM17 5a1.4 1.4 0 000-2l-1.5-1.5a1.4 1.4 0 00-2 0L12 3l3.5 3.5L17 5z" />
      </svg>
    ),
  },
  {
    id: 'experience',
    labelKey: 'dashboard.quick.experience.label',
    descKey: 'dashboard.quick.experience.desc',
    to: '/dashboard/experience',
    badgeColor: '#f59e0b',
    badgeBg: 'rgba(245,158,11,.1)',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="4" width="14" height="13" rx="2" />
        <path d="M7 4V2M13 4V2M3 9h14M7 13h2M7 16h6" />
      </svg>
    ),
  },
  {
    id: 'enlaces',
    labelKey: 'dashboard.quick.networks.label',
    descKey: 'dashboard.quick.networks.desc',
    to: '/dashboard/enlaces',
    badgeColor: 'var(--azul)',
    badgeBg: 'var(--azul-light)',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M13 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
        <path d="M13 10l4-4M7 10l-4 4M10 7V3M10 17v-4" />
      </svg>
    ),
  },
  {
    id: 'preview',
    labelKey: 'dashboard.quick.preview.label',
    descKey: 'dashboard.quick.preview.desc',
    to: '/dashboard/view',
    badgeColor: 'var(--rojo-mid)',
    badgeBg: 'var(--rojo-bg)',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M1 10S4.5 3 10 3s9 7 9 7-3.5 7-9 7-9-7-9-7z" />
        <circle cx="10" cy="10" r="3" />
      </svg>
    ),
  },
  {
    id: 'settings',
    labelKey: 'dashboard.quick.settings.label',
    descKey: 'dashboard.quick.settings.desc',
    to: '/dashboard/settings',
    badge: null,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="10" cy="10" r="3" />
        <path d="M10 1v2.5M10 16.5V19M1 10h2.5M16.5 10H19M3.2 3.2l1.8 1.8M15 15l1.8 1.8M3.2 16.8L5 15M15 5l1.8-1.8" />
      </svg>
    ),
  },
];

export default function DashboardPage() {
  const { t } = useLanguage();
  const [nombreUsuario, setNombreUsuario] = useState('');
  const summary = useDashboardSummary('dashboard');
  const counts = summary.counts || {};
  const loadingSummary = summary.loading && !summary.error;
  const progress = summary.progress || 0;
  const missingCount = summary.missingRequirements?.length || 0;
  const nombreVisible = summary.profileName || nombreUsuario || t('dashboard.defaultUser');

  const countText = (value) => loadingSummary ? '...' : String(value ?? 0);

  const getStatNumber = (id) => ({
    projects: counts.projects,
    skills: counts.skills,
    experiences: counts.experiences,
    links: counts.links,
  }[id]);

  const getQuickBadge = (id) => {
    if (loadingSummary) return t('dashboard.badge.loading');

    if (id === 'projects') return t('dashboard.badge.projects', { count: counts.projects ?? 0 });
    if (id === 'profile') return t('dashboard.badge.profile', { progress });
    if (id === 'skills') return t('dashboard.badge.skills', { count: counts.skills ?? 0 });
    if (id === 'experience') return t('dashboard.badge.experience', { count: counts.experiences ?? 0 });
    if (id === 'enlaces') return t('dashboard.badge.networks', { count: counts.links ?? 0 });
    if (id === 'preview') return missingCount > 0
      ? t('dashboard.badge.pending', { count: missingCount })
      : t('dashboard.badge.ready');

    return null;
  };

  useEffect(() => {
    const userStr = localStorage.getItem('usuario');
    if (!userStr) return;

    const user = JSON.parse(userStr);
    const nombreReal = user.nombre || user.name;
    if (nombreReal) {
      setNombreUsuario(nombreReal);
    }
  }, []);

  return (
    <>
      <Header
        eyebrow={t('dashboard.page.eyebrow')}
        title={t('dashboard.page.title')}
        subtitle={t('dashboard.page.subtitle')}
      />

      <div className="dsh-overview">
        <div className="dsh-welcome">
          <div className="dsh-welcome-text">
            <div className="dsh-welcome-label">CreaFolio</div>
            <div className="dsh-welcome-title">
              {t('dashboard.welcome.title', { name: nombreVisible })}
            </div>
            <div className="dsh-welcome-sub">
              {t('dashboard.welcome.subtitle')}
            </div>
          </div>

          <div className="dsh-welcome-badges">
            <div className="dsh-welcome-badge">
              <div>
                <div className="dsh-welcome-badge-num">{loadingSummary ? '...' : `${progress}%`}</div>
                <div className="dsh-welcome-badge-lbl">
                  {t('dashboard.welcome.portfolioCompleteLine1')}<br />{t('dashboard.welcome.portfolioCompleteLine2')}
                </div>
              </div>
            </div>
            <div className="dsh-welcome-badge">
              <div>
                <div className="dsh-welcome-badge-num">{countText(counts.projects)}</div>
                <div className="dsh-welcome-badge-lbl">
                  {t('dashboard.welcome.projectsRegisteredLine1')}<br />{t('dashboard.welcome.projectsRegisteredLine2')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dsh-stats-row">
          {QUICK_STATS.map(({ id, labelKey, color, bg, border }) => (
            <div className="dsh-stat-card" key={id}>
              <div
                className="dsh-stat-icon"
                style={{ background: bg, border: `1px solid ${border}`, color }}
              >
                <svg viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="8" />
                  <path d="M10 6v4l3 3" />
                </svg>
              </div>
              <div>
                <div className="dsh-stat-num" style={{ color }}>{countText(getStatNumber(id))}</div>
                <div className="dsh-stat-lbl">{t(labelKey)}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="dsh-section-header">
          <div className="dsh-section-title">{t('dashboard.quickAccess.title')}</div>
          <div className="dsh-section-line" />
        </div>

        <div className="dsh-links-grid">
          {QUICK_LINKS.map((item) => {
            const badge = getQuickBadge(item.id);

            return (
              <Link key={item.id} to={item.to} className="dsh-link-card">
                <div className="dsh-link-card-top">
                  <div className="dsh-link-icon">{item.icon}</div>
                  <svg className="dsh-link-arrow" viewBox="0 0 14 14">
                    <path d="M3 11L11 3M5 3h6v6" />
                  </svg>
                </div>

                <div className="dsh-link-content">
                  <div className="dsh-link-name">{t(item.labelKey)}</div>
                  <div className="dsh-link-desc">{t(item.descKey)}</div>
                  {badge && (
                    <span
                      className="dsh-link-badge"
                      style={{
                        color: item.badgeColor,
                        background: item.badgeBg,
                        border: `1px solid ${item.badgeColor}33`,
                        marginTop: 6,
                      }}
                    >
                      {badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="dsh-profile-progress">
          <div className="dsh-pp-text">
            <div className="dsh-pp-title">{t('dashboard.progress.title')}</div>
            <div className="dsh-pp-sub">{t('dashboard.progress.subtitle')}</div>
          </div>
          <div className="dsh-pp-bar-wrap">
            <div className="dsh-pp-bar-labels">
              <span>{t('dashboard.progress.label')}</span>
              <strong>{loadingSummary ? '...' : `${progress}%`}</strong>
            </div>
            <div className="dsh-pp-bar">
              <div className="dsh-pp-bar-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="dsh-pp-hint">
            {missingCount > 0 ? (
              <>{t('dashboard.progress.missingPrefix')} <span>{missingCount}</span> {t('dashboard.progress.missingSuffix')}</>
            ) : (
              <>{t('dashboard.progress.complete')}</>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
