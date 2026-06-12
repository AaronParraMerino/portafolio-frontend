/* ══════════════════════════════════════════════════════════
   ConfirmModal — v2  (azul · rojo · verde · amarillo · violeta)
══════════════════════════════════════════════════════════ */
import { useEffect } from 'react';

/* ── Mapa de variantes ─────────────────────────────────── */
const VARIANT = {
  blue: {
    iconWrapBg:     'var(--azul-light,   #e8f4fb)',
    iconWrapBorder: 'var(--azul-mid,     #b8ddf0)',
    btnBg:          'var(--azul,         #0077b7)',
    btnHoverBg:     'var(--azul-hover,   #005f95)',
    btnShadow:      'rgba(0,119,183,.30)',
    strokeColor:    'var(--azul,         #0077b7)',
  },
  red: {
    iconWrapBg:     'var(--rojo-bg,      rgba(232,85,85,.08))',
    iconWrapBorder: 'var(--rojo-borde,   rgba(232,85,85,.22))',
    btnBg:          'var(--rojo-soft,    #e85555)',
    btnHoverBg:     'var(--rojo-mid,     #c94040)',
    btnShadow:      'rgba(232,85,85,.30)',
    strokeColor:    'var(--rojo-soft,    #e85555)',
  },
  green: {
    iconWrapBg:     'var(--verde-bg,     rgba(52,211,153,.08))',
    iconWrapBorder: 'var(--verde-borde,  rgba(52,211,153,.25))',
    btnBg:          'var(--verde,        #34d399)',
    btnHoverBg:     'var(--verde-hover,  #28b882)',
    btnShadow:      'rgba(52,211,153,.30)',
    strokeColor:    'var(--verde,        #34d399)',
  },
  yellow: {
    iconWrapBg:     'var(--amarillo-bg,    rgba(251,191,36,.08))',
    iconWrapBorder: 'var(--amarillo-borde, rgba(251,191,36,.30))',
    btnBg:          'var(--amarillo,       #fbbf24)',
    btnHoverBg:     'var(--amarillo-hover, #e0a813)',
    btnShadow:      'rgba(251,191,36,.35)',
    strokeColor:    'var(--amarillo,       #fbbf24)',
    btnTextColor:   '#78350f',   /* texto oscuro para mejor legibilidad */
  },
  violet: {
    iconWrapBg:     'var(--violeta-bg,    rgba(196,181,253,.12))',
    iconWrapBorder: 'var(--violeta-borde, rgba(196,181,253,.35))',
    btnBg:          'var(--violeta,       #c4b5fd)',
    btnHoverBg:     'var(--violeta-hover, #a896e8)',
    btnShadow:      'rgba(196,181,253,.40)',
    strokeColor:    'var(--violeta,       #c4b5fd)',
    btnTextColor:   '#3b0764',   /* texto oscuro para mejor legibilidad */
  },
};

/* ── Estilos base (sin color de variante) ──────────────── */
const BASE_STYLES = `
.cm-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.48);
  backdrop-filter: blur(3px);
  z-index: 2147483600;
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
  animation: cm-fade .18s ease;
}
@keyframes cm-fade { from { opacity: 0; } to { opacity: 1; } }

.cm-modal {
  background: var(--blanco, #fff);
  border-radius: 14px;
  border: 1.5px solid var(--gris-borde, #d1d5db);
  box-shadow: 0 20px 60px rgba(0,0,0,.18);
  width: 100%; max-width: 400px;
  display: flex; flex-direction: column;
  animation: cm-slide .22s cubic-bezier(.4,0,.2,1);
  overflow: hidden;
}
@keyframes cm-slide {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Cabecera ── */
.cm-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 20px 16px;
  border-bottom: 1px solid var(--gris-borde, #d1d5db);
}
.cm-head-left { display: flex; align-items: center; gap: 11px; }

.cm-icon-wrap {
  width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  /* colores inyectados por JS via style inline */
}

.cm-title {
  font-family: var(--font, 'Inter', sans-serif);
  font-size: 15px; font-weight: 700;
  color: var(--negro-texto, #111827);
  letter-spacing: -.01em;
}
.cm-sub {
  font-family: var(--font, 'Inter', sans-serif);
  font-size: 11px; color: var(--gris-texto, #6b7280);
  margin-top: 2px;
}

.cm-close {
  width: 30px; height: 30px; border-radius: 7px;
  border: 1.5px solid var(--gris-borde, #d1d5db);
  background: var(--blanco, #fff);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .12s; flex-shrink: 0;
}
.cm-close:hover {
  border-color: var(--rojo-soft, #e85555);
  background: var(--rojo-bg, rgba(232,85,85,.08));
}
.cm-close:hover svg { stroke: var(--rojo-soft, #e85555); }
.cm-close svg {
  width: 12px; height: 12px;
  stroke: var(--gris-texto, #6b7280); fill: none; stroke-width: 2.2;
}

/* ── Cuerpo ── */
.cm-body {
  padding: 18px 20px;
  font-family: var(--font, 'Inter', sans-serif);
  font-size: 13px; color: var(--gris-oscuro, #374151); line-height: 1.6;
}

/* ── Pie ── */
.cm-foot {
  display: flex; align-items: center; justify-content: flex-end;
  gap: 10px; padding: 14px 20px;
  border-top: 1px solid var(--gris-borde, #d1d5db);
}

.cm-btn-cancel {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 18px; border-radius: 7px;
  border: 1.5px solid var(--gris-borde, #d1d5db);
  background: var(--blanco, #fff);
  font-family: var(--font, 'Inter', sans-serif);
  font-size: 13px; font-weight: 600;
  color: var(--gris-oscuro, #374151);
  cursor: pointer; transition: all .15s;
}
.cm-btn-cancel:hover {
  border-color: var(--rojo-soft, #e85555);
  color: var(--rojo-soft, #e85555);
  background: var(--rojo-bg, rgba(232,85,85,.08));
}
.cm-btn-cancel:disabled { opacity: .55; cursor: not-allowed; }

.cm-btn-confirm {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 20px; border-radius: 7px; border: none;
  font-family: var(--font, 'Inter', sans-serif);
  font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all .15s;
  /* color + bg inyectados via style inline */
}
.cm-btn-confirm:disabled {
  opacity: .55; cursor: not-allowed;
  transform: none !important; box-shadow: none !important;
}
.cm-btn-confirm svg, .cm-btn-cancel svg {
  width: 12px; height: 12px;
  stroke: currentColor; fill: none; stroke-width: 2.2;
}

/* ── Spinner ── */
.cm-spinner {
  width: 13px; height: 13px; flex-shrink: 0;
  border: 2px solid rgba(255,255,255,.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: cm-spin .7s linear infinite;
}
@keyframes cm-spin { to { transform: rotate(360deg); } }
`;

/* ══ Íconos por variante ════════════════════════════════ */

function IconCheck({ stroke }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={stroke} strokeWidth="2.2">
      <path d="M3 8l3.5 3.5L13 4"/>
    </svg>
  );
}

function IconWarning({ stroke }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={stroke} strokeWidth="1.8">
      <path d="M8 1.5L14.5 13H1.5L8 1.5z"/>
      <path d="M8 6v3.5"/>
      <circle cx="8" cy="11.5" r=".6" fill={stroke}/>
    </svg>
  );
}

function IconLogout({ stroke }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={stroke} strokeWidth="1.8">
      <path d="M11 3l3.5 3.5L11 10M14.5 6.5H5.5"/>
      <path d="M7 2H3a1 1 0 00-1 1v10a1 1 0 001 1h4"/>
    </svg>
  );
}

function IconInfo({ stroke }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={stroke} strokeWidth="1.8">
      <circle cx="8" cy="8" r="6.5"/>
      <path d="M8 7v5"/>
      <circle cx="8" cy="5" r=".6" fill={stroke}/>
    </svg>
  );
}

function IconStar({ stroke }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={stroke} strokeWidth="1.8">
      <path d="M8 2l1.8 3.6 4 .6-2.9 2.8.7 4L8 11.1 4.4 13l.7-4L2.2 6.2l4-.6L8 2z"/>
    </svg>
  );
}

/* Ícono por defecto según variant si no se especifica icon */
const DEFAULT_ICON = {
  blue:   'check',
  red:    'warning',
  green:  'check',
  yellow: 'warning',
  violet: 'info',
};

const ICON_MAP = {
  check:   IconCheck,
  warning: IconWarning,
  logout:  IconLogout,
  info:    IconInfo,
  star:    IconStar,
};

/* ══ Componente ════════════════════════════════════════════ */
export default function ConfirmModal({
  open         = false,
  title        = '¿Confirmar acción?',
  subtitle,                         /* opcional — si no se pasa usa el default */
  message      = '¿Estás seguro de que deseas continuar?',
  confirmLabel = 'Confirmar',
  cancelLabel  = 'Cancelar',
  variant      = 'blue',            /* 'blue' | 'red' | 'green' | 'yellow' | 'violet' */
  icon,                             /* 'check' | 'warning' | 'logout' | 'info' | 'star' */
  loading      = false,
  confirmDisabled = false,
  onConfirm,
  onClose,
}) {
  /* Cerrar con Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape' && !loading) onClose?.(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, loading, onClose]);

  if (!open) return null;

  const v   = VARIANT[variant] ?? VARIANT.blue;
  const resolvedIcon = icon ?? DEFAULT_ICON[variant] ?? 'check';
  const IconComp     = ICON_MAP[resolvedIcon] ?? IconCheck;

  /* Colores del botón de confirmar */
  const btnColor    = v.btnTextColor ?? '#ffffff';
  const btnBgStyle  = { background: v.btnBg, color: btnColor };

  /* Hover gestionado con CSS custom property + data-attr */
  const handleBtnEnter = (e) => {
    if (!loading) {
      e.currentTarget.style.background = v.btnHoverBg;
      e.currentTarget.style.boxShadow  = `0 4px 12px ${v.btnShadow}`;
      e.currentTarget.style.transform  = 'translateY(-1px)';
    }
  };
  const handleBtnLeave = (e) => {
    e.currentTarget.style.background = v.btnBg;
    e.currentTarget.style.boxShadow  = 'none';
    e.currentTarget.style.transform  = 'none';
  };

  return (
    <>
      <style>{BASE_STYLES}</style>
      <div
        className="cm-overlay"
        onClick={(e) => e.target === e.currentTarget && !loading && onClose?.()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cm-title"
      >
        <div className="cm-modal">

          {/* ── Cabecera ── */}
          <div className="cm-head">
            <div className="cm-head-left">
              <div
                className="cm-icon-wrap"
                style={{ background: v.iconWrapBg, border: `1.5px solid ${v.iconWrapBorder}` }}
              >
                <IconComp stroke={v.strokeColor} />
              </div>
              <div>
                <div className="cm-title" id="cm-title">{title}</div>
                <div className="cm-sub">
                  {subtitle ?? 'Esta acción requiere confirmación.'}
                </div>
              </div>
            </div>
            <button className="cm-close" onClick={onClose} disabled={loading} title="Cerrar">
              <svg viewBox="0 0 12 12">
                <path d="M1 1l10 10M11 1L1 11"/>
              </svg>
            </button>
          </div>

          {/* ── Cuerpo ── */}
          <div className="cm-body">{message}</div>

          {/* ── Pie ── */}
          <div className="cm-foot">
            <button className="cm-btn-cancel" onClick={onClose} disabled={loading}>
              {cancelLabel}
            </button>
            <button
              className="cm-btn-confirm"
              style={btnBgStyle}
              onMouseEnter={handleBtnEnter}
              onMouseLeave={handleBtnLeave}
              onClick={onConfirm}
              disabled={loading || confirmDisabled}
            >
              {loading ? (
                <><span className="cm-spinner" /> Cargando...</>
              ) : (
                <>
                  <IconComp stroke={btnColor} />
                  {confirmLabel}
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

/* ══ Ejemplos de uso ════════════════════════════════════════

// Acción destructiva (eliminar)
<ConfirmModal
  open={open} variant="red" icon="warning"
  title="Eliminar registro"
  message="Esta acción es permanente y no se puede deshacer."
  confirmLabel="Sí, eliminar"
  onConfirm={handleDelete} onClose={() => setOpen(false)}
/>

// Confirmación estándar
<ConfirmModal
  open={open} variant="blue"
  title="Guardar cambios"
  message="¿Deseas guardar los cambios realizados?"
  onConfirm={handleSave} onClose={() => setOpen(false)}
/>

// Éxito / acción positiva
<ConfirmModal
  open={open} variant="green" icon="check"
  title="Aprobar solicitud"
  message="Confirma que deseas aprobar esta solicitud."
  confirmLabel="Aprobar"
  onConfirm={handleApprove} onClose={() => setOpen(false)}
/>

// Advertencia leve
<ConfirmModal
  open={open} variant="yellow" icon="warning"
  title="Cambio importante"
  subtitle="Revisa bien antes de continuar."
  message="Este cambio afectará a todos los usuarios del proyecto."
  confirmLabel="Entendido, continuar"
  onConfirm={handleContinue} onClose={() => setOpen(false)}
/>

// Informativo / especial
<ConfirmModal
  open={open} variant="violet" icon="info"
  title="Acción especial"
  message="Esta función está en fase beta. ¿Deseas activarla?"
  confirmLabel="Activar"
  onConfirm={handleActivate} onClose={() => setOpen(false)}
/>

// Cerrar sesión
<ConfirmModal
  open={open} variant="red" icon="logout"
  title="Cerrar sesión"
  message="¿Estás seguro de que deseas cerrar tu sesión?"
  confirmLabel="Cerrar sesión"
  onConfirm={handleLogout} onClose={() => setOpen(false)}
/>

══════════════════════════════════════════════════════════ */
