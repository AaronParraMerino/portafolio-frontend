function IconBtn({ onClick, disabled, title, children, variant = "default" }) {
  return (
    <button
      type="button"
      className={`dash-icon-btn${variant === "danger" ? " dash-icon-btn--danger" : ""}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
    >
      {children}
    </button>
  );
}

export default IconBtn;
