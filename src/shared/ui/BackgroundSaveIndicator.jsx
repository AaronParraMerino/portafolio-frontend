export default function BackgroundSaveIndicator({
  active,
  label,
  className = '',
}) {
  if (!active || !label) return null;

  return (
    <div
      className={['dash-bg-save-indicator', className].filter(Boolean).join(' ')}
      role="status"
      aria-live="polite"
    >
      <span className="dash-bg-save-indicator__spinner" />
      <strong>{label}</strong>
    </div>
  );
}
