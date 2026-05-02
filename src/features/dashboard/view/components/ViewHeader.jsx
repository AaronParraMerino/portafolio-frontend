// src/features/dashboard/view/components/ViewHeader.jsx

export default function ViewHeader({
  guardando,
  onPersonalizar,
  onPublicar,
}) {
  return (
    <div className="mod-header">
      <div>
        <div className="mod-eyebrow">Portafolio</div>
        <div className="mod-title">Vista Portafolio</div>
      </div>

      <div className="mod-actions">
        <button
          type="button"
          className="btn-ghost"
          onClick={onPersonalizar}
        >
          <svg viewBox="0 0 14 14">
            <circle cx="7" cy="7" r="2" />
            <path d="M7 1v2M7 11v2M1 7h2M11 7h2M2.9 2.9l1.4 1.4M9.7 9.7l1.4 1.4M2.9 11.1l1.4-1.4M9.7 4.3l1.4-1.4" />
          </svg>
          Personalizar
        </button>

        <button
          type="button"
          className="btn-primary"
          onClick={onPublicar}
          disabled={guardando}
        >
          <svg viewBox="0 0 14 14">
            <path d="M2 7l3 3 7-5" />
          </svg>
          {guardando ? 'Publicando...' : 'Publicar'}
        </button>
      </div>
    </div>
  );
}