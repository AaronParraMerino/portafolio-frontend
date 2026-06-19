function IconBtn({ onClick, disabled, title, children, variant = "default" }) {
  const variantClass = variant === "danger"
    ? " dash-icon-btn--danger is-delete"
    : variant === "edit"
      ? " dash-icon-btn--edit is-edit"
      : "";

  return (
    <button
      type="button"
      className={`dash-icon-btn${variantClass}`}
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
