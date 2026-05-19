function Toggle({ on, onChange, disabled }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={disabled}
      onClick={() => !disabled && onChange(!on)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 999,
        border: "none",
        background: disabled
          ? "var(--gris-borde)"
          : on
            ? "var(--azul)"
            : "var(--gris-borde)",
        position: "relative",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 0.2s ease, opacity 0.2s ease",
        flexShrink: 0,
        opacity: disabled ? 0.6 : 1,
        padding: 0,
        boxShadow: on && !disabled ? "0 6px 14px rgba(0, 119, 183, 0.22)" : "none",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: on ? 22 : 3,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "var(--blanco)",
          transition: "left 0.2s ease",
          boxShadow: "0 2px 6px rgba(17, 24, 39, 0.22)",
        }}
      />
    </button>
  );
}

export default Toggle;