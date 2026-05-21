import { USER_STATS } from '../services/profileService';

function UsersStatIcon({ tone }) {
  const commonProps = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  if (tone === 'success') {
    return (
      <svg viewBox="0 0 24 24" {...commonProps}>
        <path d="M9 12.8 11.7 15.5 17.5 9.5" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    );
  }

  if (tone === 'warning') {
    return (
      <svg viewBox="0 0 24 24" {...commonProps}>
        <path d="M12 8v5" />
        <path d="M9 18h6" />
        <path d="M7 4.8h10" />
        <path d="M8 4.8v2.1a4 4 0 0 0 1.2 2.9L12 12.5l2.8-2.7A4 4 0 0 0 16 6.9V4.8" />
      </svg>
    );
  }

  if (tone === 'danger') {
    return (
      <svg viewBox="0 0 24 24" {...commonProps}>
        <circle cx="12" cy="12" r="9" />
        <path d="M8.5 8.5 15.5 15.5" />
        <path d="M15.5 8.5 8.5 15.5" />
      </svg>
    );
  }

  if (tone === 'muted') {
    return (
      <svg viewBox="0 0 24 24" {...commonProps}>
        <path d="M3 12c2.5-4 5.5-6 9-6s6.5 2 9 6c-2.5 4-5.5 6-9 6s-6.5-2-9-6Z" />
        <path d="M3 4l18 16" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" {...commonProps}>
      <path d="M4 18v-1a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v1" />
      <circle cx="12" cy="7.5" r="3.5" />
      <path d="M18 9.5h2.5M19.2 8.2v2.6" />
    </svg>
  );
}

export default function UsersStats({ metrics, sourceReady }) {
  return (
    <section className="usr-stats-grid" aria-label="Resumen de usuarios">
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
          <div className="usr-stat-label">{stat.label}</div>
          <div className="usr-stat-helper">{stat.helper}</div>
        </article>
      ))}
    </section>
  );
}
