export default function EventsEmptyState({
  icon: Icon,
  title,
  description,
  hint = '',
}) {
  return (
    <div className="evt-empty-state">
      <div className="evt-empty-icon">
        {Icon ? <Icon /> : null}
      </div>
      <strong>{title}</strong>
      <p>{description}</p>
      {hint ? <span>{hint}</span> : null}
    </div>
  );
}
