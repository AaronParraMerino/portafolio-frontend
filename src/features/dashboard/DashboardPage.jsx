import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './layout/Header';
import { useDashboardSummary } from './hooks/useDashboardSummary';
import { useLanguage } from '../../core/i18n';
import {
  DashboardAcademicIcon,
  DashboardLinkIcon,
  DashboardOpenIcon,
  DashboardProjectIcon,
  DashboardSettingsIcon,
  DashboardSkillIcon,
  DashboardScreenIcon,
  DashboardUserIcon,
  DashboardWorkIcon,
} from './layout/DashboardIcons';

const QUICK_STATS = [
  { id: 'projects', labelKey: 'dashboard.stats.projects', icon: DashboardProjectIcon },
  { id: 'skills', labelKey: 'dashboard.stats.skills', icon: DashboardSkillIcon },
  { id: 'experiences', labelKey: 'dashboard.stats.experiences', icon: DashboardWorkIcon },
  { id: 'links', labelKey: 'dashboard.stats.links', icon: DashboardLinkIcon },
];

const QUICK_LINKS = [
  {
    id: 'projects',
    labelKey: 'dashboard.quick.projects.label',
    descKey: 'dashboard.quick.projects.desc',
    to: '/dashboard/projects',
    badgeColor: 'var(--azul)',
    badgeBg: 'var(--azul-light)',
    Icon: DashboardProjectIcon,
  },
  {
    id: 'profile',
    labelKey: 'dashboard.quick.profile.label',
    descKey: 'dashboard.quick.profile.desc',
    to: '/dashboard/profile',
    badgeColor: 'var(--azul)',
    badgeBg: 'var(--azul-light)',
    Icon: DashboardUserIcon,
  },
  {
    id: 'skills',
    labelKey: 'dashboard.quick.skills.label',
    descKey: 'dashboard.quick.skills.desc',
    to: '/dashboard/skills',
    badgeColor: 'var(--azul)',
    badgeBg: 'var(--azul-light)',
    Icon: DashboardSkillIcon,
  },
  {
    id: 'experience',
    labelKey: 'dashboard.quick.experience.label',
    descKey: 'dashboard.quick.experience.desc',
    to: '/dashboard/experience',
    badgeColor: 'var(--azul)',
    badgeBg: 'var(--azul-light)',
    Icon: DashboardAcademicIcon,
  },
  {
    id: 'enlaces',
    labelKey: 'dashboard.quick.networks.label',
    descKey: 'dashboard.quick.networks.desc',
    to: '/dashboard/enlaces',
    badgeColor: 'var(--azul)',
    badgeBg: 'var(--azul-light)',
    Icon: DashboardLinkIcon,
  },
  {
    id: 'preview',
    labelKey: 'dashboard.quick.preview.label',
    descKey: 'dashboard.quick.preview.desc',
    to: '/dashboard/view',
    badgeColor: 'var(--azul)',
    badgeBg: 'var(--azul-light)',
    Icon: DashboardScreenIcon,
  },
  {
    id: 'settings',
    labelKey: 'dashboard.quick.settings.label',
    descKey: 'dashboard.quick.settings.desc',
    to: '/dashboard/settings',
    badge: null,
    Icon: DashboardSettingsIcon,
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
          {QUICK_STATS.map(({ id, labelKey, icon: Icon }) => (
            <div className="dsh-stat-card" key={id}>
              <div className="dsh-stat-icon">
                <Icon />
              </div>
              <div>
                <div className="dsh-stat-num">{countText(getStatNumber(id))}</div>
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
            const Icon = item.Icon || DashboardOpenIcon;

            return (
              <Link key={item.id} to={item.to} className="dsh-link-card">
                <div className="dsh-link-card-top">
                  <div className="dsh-link-icon"><Icon /></div>
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
