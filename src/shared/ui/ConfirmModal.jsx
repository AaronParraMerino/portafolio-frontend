/* ══════════════════════════════════════════════════════════
   ConfirmModal
══════════════════════════════════════════════════════════ */
import { useEffect } from 'react';

const STYLES = `
.cm-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.48);
  backdrop-filter: blur(3px);
  z-index: 9000;
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
  width: 100%;
  max-width: 400px;
  display: flex; flex-direction: column;
  animation: cm-slide .22s cubic-bezier(.4,0,.2,1);
  overflow: hidden;
}
@keyframes cm-slide {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}

.cm-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 20px 16px;
  border-bottom: 1px solid var(--gris-borde, #d1d5db);
}
.cm-head-left { display: flex; align-items: center; gap: 11px; }
.cm-icon-wrap {
  width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.cm-icon-wrap.blue {
  background: var(--azul-light, #e8f4fb);
  border: 1.5px solid var(--azul-mid, #b8ddf0);
}
.cm-icon-wrap.red {
  background: var(--rojo-bg, rgba(232,85,85,.08));
  border: 1.5px solid var(--rojo-borde, rgba(232,85,85,.22));
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
.cm-close svg { width: 12px; height: 12px; stroke: var(--gris-texto, #6b7280); fill: none; stroke-width: 2.2; }

.cm-body {
  padding: 18px 20px;
  font-family: var(--font, 'Inter', sans-serif);
  font-size: 13px; color: var(--gris-oscuro, #374151);
  line-height: 1.6;
}

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
  font-size: 13px; font-weight: 600; color: #fff;
  cursor: pointer; transition: all .15s;
}
.cm-btn-confirm.blue  { background: var(--azul, #0077b7); }
.cm-btn-confirm.blue:hover  { background: var(--azul-hover, #005f95); box-shadow: 0 4px 12px rgba(0,119,183,.3); transform: translateY(-1px); }
.cm-btn-confirm.red   { background: var(--rojo-soft, #e85555); }
.cm-btn-confirm.red:hover   { background: var(--rojo-mid, #c94040); box-shadow: 0 4px 12px rgba(232,85,85,.3); transform: translateY(-1px); }
.cm-btn-confirm:disabled { opacity: .55; cursor: not-allowed; transform: none; box-shadow: none; }
.cm-btn-confirm svg, .cm-btn-cancel svg { width: 12px; height: 12px; stroke: currentColor; fill: none; stroke-width: 2.2; }

.cm-spinner {
  width: 13px; height: 13px; flex-shrink: 0;
  border: 2px solid rgba(255,255,255,.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: cm-spin .7s linear infinite;
}
@keyframes cm-spin { to { transform: rotate(360deg); } }
`;

function IconCheck({ color }) {
  const c = color === 'red' ? 'var(--rojo-soft,#e85555)' : 'var(--azul,#0077b7)';
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="2">
      <path d="M3 8l3.5 3.5L13 4"/>
    </svg>
  );
}

function IconWarning() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--rojo-soft,#e85555)" strokeWidth="1.8">
      <path d="M8 1.5L14.5 13H1.5L8 1.5z"/>
      <path d="M8 6v3.5"/>
      <circle cx="8" cy="11.5" r=".6" fill="var(--rojo-soft,#e85555)"/>
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--rojo-soft,#e85555)" strokeWidth="1.8">
      <path d="M11 3l3.5 3.5L11 10M14.5 6.5H5.5"/>
      <path d="M7 2H3a1 1 0 00-1 1v10a1 1 0 001 1h4"/>
    </svg>
  );
}

export default function ConfirmModal({
  open         = false,
  title        = '¿Confirmar acción?',
  message      = '¿Estás seguro de que deseas continuar?',
  confirmLabel = 'Confirmar',
  cancelLabel  = 'Cancelar',
  variant      = 'blue',
  icon         = 'check',
  loading      = false,
  onConfirm,
  onClose,
}) {
  // Cerrar con Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape' && !loading) onClose?.(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, loading, onClose]);

  if (!open) return null;

  const iconVariant = (icon === 'warning' || icon === 'logout') ? 'red' : 'blue';

  return (
    <>
      <style>{STYLES}</style>
      <div
        className="cm-overlay"
        onClick={(e) => e.target === e.currentTarget && !loading && onClose?.()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cm-title"
      >
        <div className="cm-modal">

          {/* Cabecera */}
          <div className="cm-head">
            <div className="cm-head-left">
              <div className={`cm-icon-wrap ${iconVariant}`}>
                {icon === 'warning' && <IconWarning />}
                {icon === 'logout'  && <IconLogout />}
                {icon === 'check'   && <IconCheck color={variant} />}
              </div>
              <div>
                <div className="cm-title" id="cm-title">{title}</div>
                <div className="cm-sub">Esta acción requiere confirmación.</div>
              </div>
            </div>
            <button className="cm-close" onClick={onClose} disabled={loading} title="Cerrar">
              <svg viewBox="0 0 12 12">
                <path d="M1 1l10 10M11 1L1 11"/>
              </svg>
            </button>
          </div>

          {/* Cuerpo */}
          <div className="cm-body">{message}</div>

          {/* Pie */}
          <div className="cm-foot">
            <button className="cm-btn-cancel" onClick={onClose} disabled={loading}>
              {cancelLabel}
            </button>
            <button
              className={`cm-btn-confirm ${variant}`}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <><span className="cm-spinner" /> Cargando...</>
              ) : (
                <>
                  {variant === 'red' ? (
                    <svg viewBox="0 0 14 14"><path d="M7 1L1 12h12L7 1z"/><path d="M7 5.5v3M7 10v.5"/></svg>
                  ) : (
                    <svg viewBox="0 0 14 14"><path d="M2 7l3.5 3.5L12 3"/></svg>
                  )}
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