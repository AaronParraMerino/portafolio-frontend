import '../styles/profile.css';

const EyeOpen = () => (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M1 7S3.5 2 7 2s6 5 6 5-2.5 5-6 5-6-5-6-5z"/>
    <circle cx="7" cy="7" r="2"/>
  </svg>
);
const EyeClosed = () => (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M1 1l12 12M5.5 3.5A5 5 0 017 3c3.5 0 6 4 6 4s-.7 1.2-2 2.3M8.8 10A5.3 5.3 0 017 11c-3.5 0-6-4-6-4s.9-1.5 2.5-2.8"/>
  </svg>
);

/* Campos que se muestran y sus labels */
const CAMPOS = [
  { key: 'correo',    label: 'Correo electrónico' },
  { key: 'pais',      label: 'País' },
  { key: 'ciudad',    label: 'Ciudad' },
  { key: 'telefono',  label: 'Teléfono' },
  { key: 'biografia', label: 'Acerca de mí' },
];

const SIEMPRE_VISIBLE = ['nombre'];

export default function ProfileInfo({ perfil, onToggleVisibilidad }) {
  return (
    <div className="prf-card">
      <div className="prf-card-head">
        <span className="prf-card-title">Datos personales</span>
        <span className="prf-card-sub">Controla qué información es pública</span>
      </div>

      <div className="prf-lista">
        {CAMPOS.map(({ key, label }) => {
          const valor   = perfil[key] || null;
          const visible = perfil.visibilidad?.[key] ?? true;
          const siempre = SIEMPRE_VISIBLE.includes(key);

          return (
            <div key={key} className="prf-fila">
              <div className="prf-fila-left">
                <span className="prf-campo-label">{label}</span>
                <span className={`prf-campo-valor${!valor ? ' empty' : ''}`}>
                  {valor || 'Sin completar'}
                </span>
              </div>

              <div className="prf-fila-right">
                {siempre ? (
                  <span className="prf-pill prf-pill-siempre">
                    <EyeOpen /> Siempre visible
                  </span>
                ) : (
                  <>
                    <span className={`prf-pill ${visible ? 'prf-pill-visible' : 'prf-pill-oculto'}`}>
                      {visible ? <><EyeOpen /> Visible</> : <><EyeClosed /> Oculto</>}
                    </span>
                    {/* BACKEND: onToggleVisibilidad → PUT /api/profile/visibility */}
                    <button
                      className={`prf-toggle ${visible ? 'on' : 'off'}`}
                      onClick={() => onToggleVisibilidad(key)}
                      title={visible ? 'Ocultar' : 'Mostrar'}
                      aria-label={visible ? `Ocultar ${label}` : `Mostrar ${label}`}
                    >
                      <span className="prf-toggle-thumb" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}