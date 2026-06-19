import { DashboardStatusIcon } from "./DashboardIcons";

export default function DashboardListSummary({
  title,
  description,
  count,
  label,
}) {
  const heading = description || title;

  return (
    <div className="dash-panel dash-list-summary">
      <div className="dash-list-summary-copy">
        {heading ? (
          <h2 className="dash-list-summary-title">{heading}</h2>
        ) : null}
      </div>

      <div className="dash-list-summary-metric" aria-hidden="true">
        <span className="dash-list-summary-icon">
          <DashboardStatusIcon />
        </span>
        <span className="dash-list-summary-count">{count}</span>
        <small>{label}</small>
      </div>
    </div>
  );
}
