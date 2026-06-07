import {
  BsCalendar2Event,
  BsCalendarCheck,
  BsCalendarX,
  BsClockHistory,
  BsMegaphone,
} from 'react-icons/bs';
import { useLanguage } from '../../../../core/i18n';
import { EVENT_STATS } from '../services/eventsService';

const STAT_ICONS = {
  primary: BsCalendar2Event,
  success: BsCalendarCheck,
  warning: BsClockHistory,
  info: BsMegaphone,
  danger: BsCalendarX,
};

export default function EventsStats({ metrics, sourceReady }) {
  const { t } = useLanguage();

  return (
    <section className="evt-stats-grid" aria-label={t('adminEvents.dashboard.publisherSummaryAria')}>
      {EVENT_STATS.map((stat) => {
        const Icon = STAT_ICONS[stat.tone] || BsCalendar2Event;

        return (
          <article key={stat.id} className={`evt-stat-card evt-stat-card--${stat.tone}`}>
            <div className={`evt-stat-icon evt-stat-icon--${stat.tone}`}>
              <Icon aria-hidden="true" />
            </div>
            <div className="evt-stat-value">
              {sourceReady ? metrics?.[stat.id] ?? 0 : '--'}
            </div>
            <div className="evt-stat-label">{t(`adminEvents.stats.${stat.id}.label`)}</div>
            <div className="evt-stat-helper">{t(`adminEvents.stats.${stat.id}.helper`)}</div>
          </article>
        );
      })}
    </section>
  );
}
