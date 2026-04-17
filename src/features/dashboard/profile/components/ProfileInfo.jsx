import { useState } from 'react';
import '../styles/profile.css';
import ConfirmModal from '../../../../shared/ui/ConfirmModal';

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

const ICONS = {
  correo:    () => <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="1" y="3" width="12" height="8" rx="1.5"/><path d="M1 3l6 5 6-5"/></svg>,
  pais:      () => <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="7" cy="7" r="5.5"/><path d="M7 1.5c-2 2-2 9 0 11M7 1.5c2 2 2 9 0 11M1.5 7h11"/></svg>,
  ciudad:    () => <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M7 1C4.8 1 3 2.8 3 5c0 3 4 8 4 8s4-5 4-8c0-2.2-1.8-4-4-4z"/><circle cx="7" cy="5" r="1.3"/></svg>,
  profesion: () => <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="1" y="4.5" width="12" height="8" rx="1.5"/><path d="M5 4.5V3a1 1 0 011-1h2a1 1 0 011 1v1.5"/><line x1="1" y1="8" x2="13" y2="8"/></svg>,
  telefono:  () => <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M2 2.5A1.5 1.5 0 013.5 1h.5a1 1 0 011 1v2a1 1 0 01-1 1H3C3 9 5 11 8.5 11v-1a1 1 0 011-1h2a1 1 0 011 1v.5A1.5 1.5 0 0111 13C6 13 1 8 1 3V2.5z"/></svg>,
  biografia: () => <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="7" cy="4.5" r="2.5"/><path d="M1.5 13c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/></svg>,
};

const CAMPOS = [
  { key: 'correo',    label: 'Correo electrónico' },
  { key: 'pais',      label: 'País' },
  { key: 'ciudad',    label: 'Ciudad' },
  { key: 'profesion', label: 'Profesión' },
  { key: 'telefono',  label: 'Teléfono' },
  { key: 'biografia', label: 'Acerca de mí' },
];

const SIEMPRE_VISIBLE = ['nombre'];

export default function ProfileInfo({ perfil, onToggleVisibilidad }) {
  /* NUEVO: estado del panel de confirmación de visibilidad */
  const [confirm, setConfirm] = useState(null); // null | { key, label, nextVisible }

  /* En vez de llamar onToggleVisibilidad directo → abrir confirmación */
  const handleToggleClick = (key, label, currentlyVisible) => {
    setConfirm({ key, label, nextVisible: !currentlyVisible });
  };

  /* Al confirmar en el panel */
  const handleConfirmar = () => {
    if (confirm) {
      onToggleVisibilidad(confirm.key);
      setConfirm(null);
    }
  };

  return (
    <>
      <div className="prf-card">
        <div className="prf-card-head">
          <span className="prf-card-title">Controla qué información es pública</span>
        </div>

        <div className="prf-lista">
          {CAMPOS.map(({ key, label }) => {
            const valor   = perfil[key] || null;
            const visible = perfil.visibilidad?.[key] ?? true;
            const siempre = SIEMPRE_VISIBLE.includes(key);
            const Icon    = ICONS[key];

            return (
              <div key={key} className="prf-fila">
                <div className="prf-fila-left" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: 7,
                    background: 'var(--azul-light)', border: '1px solid var(--azul-mid)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, color: 'var(--azul)',
                  }}>
                    {Icon && <span style={{ width: 13, height: 13, display: 'flex' }}><Icon /></span>}
                  </span>
                  <div>
                    <span className="prf-campo-label">{label}</span>
                    <span className={`prf-campo-valor${!valor ? ' empty' : ''}`}>
                      {valor || 'Sin completar'}
                    </span>
                  </div>
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
                      {/* Toggle → abre panel de confirmación */}
                      <button
                        className={`prf-toggle ${visible ? 'on' : 'off'}`}
                        onClick={() => handleToggleClick(key, label, visible)}
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

      {/* Panel de confirmación de visibilidad */}
      <ConfirmModal
        open={!!confirm}
        title={confirm?.nextVisible ? `¿Hacer visible ${confirm.label}?` : `¿Ocultar ${confirm?.label}?`}
        message={
          confirm?.nextVisible
            ? `${confirm.label} será visible para cualquier persona que visite tu perfil público.`
            : `${confirm?.label} quedará oculto y no será visible en tu perfil público.`
        }
        confirmLabel={confirm?.nextVisible ? 'Sí, hacer visible' : 'Sí, ocultar'}
        variant="blue"
        icon="check"
        loading={false}
        onConfirm={handleConfirmar}
        onClose={() => setConfirm(null)}
      />
    </>
  );
}