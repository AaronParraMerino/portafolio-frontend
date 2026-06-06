import {
  BsPauseCircle,
  BsPeople,
  BsPersonCheck,
  BsPersonDash,
  BsPersonGear,
  BsShieldExclamation,
} from 'react-icons/bs';
import { USER_STATS } from '../services/usersService';
import { useLanguage } from '../../../../core/i18n';

const STAT_ICONS = {
  primary: BsPeople,
  success: BsPersonCheck,
  warning: BsPauseCircle,
  info: BsPersonGear,
  danger: BsShieldExclamation,
  muted: BsPersonDash,
};

function UsersStatIcon({ tone }) {
  const Icon = STAT_ICONS[tone] || BsPeople;

  return <Icon aria-hidden="true" />;
}

export default function UsersStats({ metrics, sourceReady }) {
  const { t } = useLanguage();

  return (
    <section className="usr-stats-grid" aria-label={t('admin.users.stats.aria')}>
      {USER_STATS.map((stat) => (
        <article key={stat.id} className={`usr-stat-card usr-stat-card--${stat.tone}`}>
          <div className="usr-stat-card-top">
            <div className={`usr-stat-icon usr-stat-icon--${stat.tone}`}>
              <UsersStatIcon tone={stat.tone} />
            </div>
          </div>

          <div className="usr-stat-value">
            {sourceReady ? metrics?.[stat.id] ?? 0 : '--'}
          </div>
          <div className="usr-stat-label">{t(`admin.users.stats.${stat.id}.label`)}</div>
          <div className="usr-stat-helper">{t(`admin.users.stats.${stat.id}.helper`)}</div>
        </article>
      ))}
    </section>
  );
}
