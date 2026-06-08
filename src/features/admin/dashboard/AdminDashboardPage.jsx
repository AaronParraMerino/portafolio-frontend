// src/features/admin/dashboard/AdminDashboardPage.jsx

import { Link } from 'react-router-dom';
import { useLanguage } from '../../../core/i18n';
import { getStoredUser } from '../../../shared/utils/authStorage';
import AdminHeader from '../layout/AdminHeader';
import { getAdminSectionConfig } from '../layout/adminHeaderConfig';

const QUICK_MODULES = [
  {
    id: 'users',
    labelKey: 'admin.dashboard.module.users.title',
    descKey: 'admin.dashboard.module.users.description',
    to: '/admin/users',
    icon: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
      </>
    ),
  },
  {
    id: 'events',
    labelKey: 'admin.dashboard.module.events.title',
    descKey: 'admin.dashboard.module.events.description',
    to: '/admin/events',
    icon: (
      <>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <path d="M3 10h18" />
      </>
    ),
  },
  {
    id: 'reports',
    labelKey: 'admin.dashboard.module.reports.title',
    descKey: 'admin.dashboard.module.reports.description',
    to: '/admin/reports',
    icon: (
      <>
        <path d="M4 19V5a2 2 0 0 1 2-2h8l6 6v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
        <path d="M14 3v6h6" />
        <path d="M8 16v-4" />
        <path d="M12 16V9" />
      </>
    ),
  },
  {
    id: 'audit',
    labelKey: 'admin.dashboard.module.audit.title',
    descKey: 'admin.dashboard.module.audit.description',
    to: '/admin/audit',
    icon: (
      <>
        <path d="M8 6h13" />
        <path d="M8 12h13" />
        <path d="M8 18h13" />
        <path d="M3 6h.01" />
        <path d="M3 12h.01" />
        <path d="M3 18h.01" />
      </>
    ),
  },
  {
    id: 'backups',
    labelKey: 'admin.dashboard.module.backups.title',
    descKey: 'admin.dashboard.module.backups.description',
    to: '/admin/backups',
    icon: (
      <>
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 21h14" />
      </>
    ),
  },
];

function getUserName() {
  const user = getStoredUser();

  return [user?.nombre || user?.name, user?.apellido || user?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();
}

export default function AdminDashboardPage({ section = 'dashboard' }) {
  const { t } = useLanguage();
  const config = getAdminSectionConfig(section);
  const storedUserName = getUserName();
  const userName = storedUserName || t('admin.dashboard.defaultUser');

  return (
    <>
      <AdminHeader
        eyebrow={t(config.eyebrowKey || '') || config.eyebrow}
        title={t(config.titleKey || '') || config.title}
      />

      <div className="adm-page">
        <section className="adm-hero">
          <div>
            <span className="adm-hero-label">
              {t('admin.dashboard.brand')}
            </span>

            <h2>
              {t('admin.dashboard.greeting', { name: userName })}
            </h2>

            <p>
              {t('admin.dashboard.description')}
            </p>
          </div>

          <div className="adm-hero-panel">
            <span>{t('admin.dashboard.activeRole')}</span>
            <strong>{t('admin.dashboard.role.admin')}</strong>
          </div>
        </section>

        <div className="adm-stats-grid">
          <div className="adm-stat-card">
            <span>{t('admin.dashboard.stats.users')}</span>
            <strong>--</strong>
            <small>{t('admin.dashboard.stats.pendingManagement')}</small>
          </div>

          <div className="adm-stat-card">
            <span>{t('admin.dashboard.stats.events')}</span>
            <strong>--</strong>
            <small>{t('admin.dashboard.stats.moduleReady')}</small>
          </div>

          <div className="adm-stat-card">
            <span>{t('admin.dashboard.stats.system')}</span>
            <strong>OK</strong>
            <small>{t('admin.dashboard.stats.navigationActive')}</small>
          </div>
        </div>

        <div className="adm-section-head">
          <h3>{t('admin.dashboard.quickManagement')}</h3>
          <span />
        </div>

        <div className="adm-module-grid">
          {QUICK_MODULES.map((item) => (
            <Link key={item.id} to={item.to} className="adm-module-card">
              <div className="adm-module-card-top">
                <span className="adm-module-icon">
                  <svg viewBox="0 0 24 24">
                    {item.icon}
                  </svg>
                </span>
              </div>

              <strong>{t(item.labelKey)}</strong>
              <p>{t(item.descKey)}</p>
            </Link>
          ))}
        </div>

        {section !== 'dashboard' && (
          <div className="adm-placeholder">
            <strong>{t(config.titleKey || '') || config.title}</strong>
            <p>
              {t('admin.dashboard.placeholder.description')}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
