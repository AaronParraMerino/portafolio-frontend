import {
  BsCalendar2Event,
  BsCalendarCheck,
  BsCalendarX,
  BsClockHistory,
  BsMegaphone,
} from 'react-icons/bs';
import { EVENT_STATS } from '../services/eventsService';

const STAT_ICONS = {
  primary: BsCalendar2Event,
  success: BsCalendarCheck,
  warning: BsClockHistory,
  info: BsMegaphone,
  danger: BsCalendarX,
};

export default function EventsStats({ metrics, sourceReady }) {
  return (
    <section className="evt-stats-grid" aria-label="Resumen de eventos">
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
            <div className="evt-stat-label">{stat.label}</div>
            <div className="evt-stat-helper">{stat.helper}</div>
          </article>
        );
      })}
    </section>
  );
}
