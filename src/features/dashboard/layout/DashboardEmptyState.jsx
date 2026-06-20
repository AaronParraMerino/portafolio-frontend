import { DashboardAddIcon } from './DashboardIcons';
import '../styles/dashboard.css';

export default function DashboardEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <section className="dash-empty-state" role="status">
      {Icon ? <span className="dash-empty-state__icon"><Icon /></span> : null}
      <div className="dash-empty-state__copy">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {actionLabel && onAction ? (
        <button type="button" className="dash-empty-state__action" onClick={onAction}>
          <DashboardAddIcon />
          <span>{actionLabel}</span>
        </button>
      ) : null}
    </section>
  );
}
