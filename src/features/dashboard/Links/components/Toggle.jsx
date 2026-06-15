function Toggle({ on, onChange, disabled }) {
  return (
    <button
      type="button"
      className="dash-toggle"
      aria-pressed={on}
      disabled={disabled}
      onClick={() => !disabled && onChange(!on)}
    >
      <span />
    </button>
  );
}

export default Toggle;
