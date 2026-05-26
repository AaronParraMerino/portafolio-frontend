export default function UsersWorkspaceEmpty({
  icon: Icon,
  title,
  description,
  hint = '',
}) {
  return (
    <div className="usr-empty-state usr-empty-state--workspace">
      <div className="usr-empty-icon">
        {Icon ? <Icon /> : null}
      </div>
      <strong>{title}</strong>
      <p>{description}</p>
      {hint ? <span className="usr-empty-hint">{hint}</span> : null}
    </div>
  );
}
