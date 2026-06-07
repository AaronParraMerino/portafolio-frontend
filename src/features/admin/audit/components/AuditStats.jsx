import {
  BsActivity,
  BsCalendarCheck,
  BsShieldLock,
  BsPeople,
} from 'react-icons/bs';
import { useLanguage } from '../../../../core/i18n';
import { AUDIT_METRICS } from '../services/auditService';

const ICONS = {
  total: BsActivity,
  today: BsCalendarCheck,
  users: BsPeople,
  security: BsShieldLock,
};

export default function AuditStats({ metrics = {}, loading = false }) {
  const { t } = useLanguage();

  return (
    <section className="aud-stats-grid" aria-label={t('adminAudit.stats.aria')}>
      {AUDIT_METRICS.map((metric) => {
        const Icon = ICONS[metric.id] || BsActivity;

        return (
          <article className={`aud-stat-card aud-stat-card--${metric.tone}`} key={metric.id}>
            <div className="aud-stat-card-top">
              <div className={`aud-stat-icon aud-stat-icon--${metric.tone}`}>
                <Icon aria-hidden="true" />
              </div>
            </div>

            <div className="aud-stat-value">
              {loading ? '--' : (metrics[metric.id] ?? 0)}
            </div>
            <div className="aud-stat-label">{t(metric.labelKey)}</div>
            <div className="aud-stat-helper">{t(metric.helperKey)}</div>
          </article>
        );
      })}
    </section>
  );
}
