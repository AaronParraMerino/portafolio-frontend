// src/features/dashboard/view/components/ViewPreviewNotice.jsx

export default function ViewPreviewNotice() {
  return (
    <div className="preview-notice">
      <svg viewBox="0 0 14 14">
        <circle cx="7" cy="7" r="6" />
        <path d="M7 6v4M7 3.8v.2" />
      </svg>

      <span>
        <strong>Vista previa:</strong> estás trabajando con datos mock. Luego conectaremos backend y visibilidad real.
      </span>
    </div>
  );
}