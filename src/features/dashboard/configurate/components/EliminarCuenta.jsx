import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EliminarCuenta() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ confirmacion: "", contrasena: "" });
  const [toast, setToast] = useState(null); // { type: 'error' | 'success', message: string }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const showToast = (type, message) => {
    setToast({ type, message });
    if (type !== 'success') {
      setTimeout(() => setToast(null), 4000);
    }
  };

  const handleEliminar = () => {
    const sinConfirmacion = form.confirmacion.trim() === "";
    const sinContrasena = form.contrasena.trim() === "";

    // Ambos vacíos
    if (sinConfirmacion && sinContrasena) {
      showToast('error', 'Debes completar todos los campos para continuar.');
      return;
    }

    // Solo falta la confirmación
    if (sinConfirmacion) {
      showToast('error', 'Escribe "ELIMINAR" en el campo de confirmación.');
      return;
    }

    // Solo falta la contraseña
    if (sinContrasena) {
      showToast('error', 'Ingresa tu contraseña para confirmar la eliminación.');
      return;
    }

    // Confirmación incorrecta
    if (form.confirmacion.toLowerCase() !== "eliminar") {
      showToast('error', 'El texto de confirmación no es correcto. Escribe exactamente "ELIMINAR".');
      return;
    }

    // Todo correcto → mostrar éxito
    showToast('success', '✓ Tu cuenta ha sido eliminada correctamente. Lamentamos verte partir.');
    // Aquí conectas tu API y luego redirige:
    // await deleteAccount(form.contrasena);
    // setTimeout(() => navigate('/'), 3000);
  };

  return (
    <div style={pageStyle}>
      <div style={innerStyle}>

        {/* ── Toast de notificación ── */}
        {toast && (
          <div style={toast.type === 'success' ? toastSuccessStyle : toastErrorStyle}>
            <div style={toastLeftStyle}>
              {toast.type === 'success' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
              <span style={{ fontSize: 14, fontWeight: 600, color: toast.type === 'success' ? '#15803d' : '#b91c1c' }}>
                {toast.message}
              </span>
            </div>
            {toast.type !== 'success' && (
              <button onClick={() => setToast(null)} style={toastCloseBtnStyle}>✕</button>
            )}
          </div>
        )}

        <button onClick={() => navigate('/dashboard/settings')} style={backBtnStyle}>
          ← Volver a Configuración
        </button>

        <div style={badgeStyle}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Zona de peligro
        </div>

        <h1 style={titleStyle}>Eliminar cuenta</h1>
        <p style={subtitleStyle}>Una vez eliminada tu cuenta, no hay vuelta atrás. Esta acción es permanente.</p>

        <div style={warningCardStyle}>
          <div style={warnIconWrapStyle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <p style={warningTitleStyle}>Esto eliminará permanentemente:</p>
            <ul style={warningListStyle}>
              {[
                "Tu cuenta y toda tu información personal",
                "Todos tus proyectos y habilidades registradas",
                "Tu experiencia laboral en la plataforma",
                "Tu portafolio público y su URL única",
              ].map((item, i) => (
                <li key={i} style={{ fontSize: 13, color: "#374151" }}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div style={dividerStyle} />

        <div style={fieldStyle}>
          <label style={labelStyle}>
            Escribe <span style={{ color: "#ef4444", fontWeight: 800 }}>ELIMINAR</span> para confirmar
          </label>
          <input
            type="text"
            name="confirmacion"
            value={form.confirmacion}
            onChange={handleChange}
            placeholder="eliminar"
            style={{
              ...inputStyle,
              borderColor: toast?.type === 'error' && form.confirmacion.trim() === '' ? '#f87171' : '#d1d5db',
            }}
            autoComplete="off"
            onFocus={e => Object.assign(e.target.style, inputFocusStyle)}
            onBlur={e => Object.assign(e.target.style, { borderColor: "#d1d5db", boxShadow: "none" })}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Contraseña</label>
          <input
            type="password"
            name="contrasena"
            value={form.contrasena}
            onChange={handleChange}
            placeholder="Ingresa tu contraseña"
            style={{
              ...inputStyle,
              borderColor: toast?.type === 'error' && form.contrasena.trim() === '' ? '#f87171' : '#d1d5db',
            }}
            autoComplete="new-password"
            onFocus={e => Object.assign(e.target.style, inputFocusStyle)}
            onBlur={e => Object.assign(e.target.style, { borderColor: "#d1d5db", boxShadow: "none" })}
          />
        </div>

        <div style={actionsStyle}>
          <button style={btnDangerStyle} onClick={handleEliminar}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
            Eliminar mi cuenta
          </button>
          <button style={btnCancelStyle} onClick={() => navigate('/dashboard/settings')}>
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
}

// ── Estilos ──────────────────────────────────────────────

const pageStyle = {
  fontFamily: "'Segoe UI','Inter',sans-serif",
  background: "#e8f4fd", minHeight: "100vh", padding: "36px 24px",
};

const innerStyle = {
  maxWidth: 680, margin: "0 auto", width: "100%",
};

const backBtnStyle = {
  background: "transparent", border: "none", color: "#64748b",
  fontSize: 14, cursor: "pointer", marginBottom: 20,
  display: "flex", alignItems: "center", gap: 8,
};

const badgeStyle = {
  display: "inline-flex", alignItems: "center", gap: 7,
  border: "1.5px solid #fca5a5", borderRadius: 999,
  padding: "5px 14px", background: "#fff1f2",
  fontSize: 12, fontWeight: 700, color: "#991b1b",
  letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 18,
};

const titleStyle = {
  fontSize: 34, fontWeight: 900, color: "#0f172a",
  fontFamily: "Georgia,'Times New Roman',serif",
  marginBottom: 10, lineHeight: 1.1,
};

const subtitleStyle = { fontSize: 14, color: "#475569", marginBottom: 28 };

const warningCardStyle = {
  background: "#fff1f2", border: "1px solid #fecaca",
  borderRadius: 14, padding: "18px 20px",
  display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 26,
};

const warnIconWrapStyle = {
  width: 38, height: 38, borderRadius: 10,
  background: "#fee2e2", border: "1px solid #fca5a5",
  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
};

const warningTitleStyle = { fontSize: 13, fontWeight: 800, color: "#ef4444", marginBottom: 10 };

const warningListStyle = {
  paddingLeft: 18, display: "flex", flexDirection: "column",
  gap: 5, listStyleType: "disc",
};

const dividerStyle = { height: 1, background: "#e2e8f0", marginBottom: 22 };

const fieldStyle = { display: "flex", flexDirection: "column", gap: 7, marginBottom: 16 };

const labelStyle = {
  fontSize: 11, fontWeight: 800, color: "#475569",
  letterSpacing: 2, textTransform: "uppercase",
};

const inputStyle = {
  width: "100%", padding: "13px 16px",
  border: "1.5px solid #d1d5db", borderRadius: 10,
  background: "#fff", fontSize: 14, color: "#1e293b", outline: "none",
};

const inputFocusStyle = {
  borderColor: "#f87171", boxShadow: "0 0 0 3px rgba(248,113,113,0.15)",
};

const actionsStyle = { display: "flex", alignItems: "center", gap: 12, marginTop: 6 };

const btnDangerStyle = {
  display: "inline-flex", alignItems: "center", gap: 8,
  background: "#ef4444", color: "#fff", border: "none", borderRadius: 10,
  padding: "12px 22px", fontSize: 14, fontWeight: 700,
  cursor: "pointer", boxShadow: "0 4px 14px rgba(239,68,68,0.3)",
};

const btnCancelStyle = {
  background: "transparent", color: "#374151",
  border: "1.5px solid #d1d5db", borderRadius: 10,
  padding: "12px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer",
};

// ── Toast ────────────────────────────────────────────────

const toastBase = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  borderRadius: 12, padding: "14px 18px", marginBottom: 24,
  gap: 12, animation: "fadeIn 0.3s ease",
};

const toastErrorStyle = {
  ...toastBase,
  background: "#fff1f2", border: "1.5px solid #fca5a5",
  boxShadow: "0 4px 14px rgba(239,68,68,0.12)",
};

const toastSuccessStyle = {
  ...toastBase,
  background: "#f0fdf4", border: "1.5px solid #86efac",
  boxShadow: "0 4px 14px rgba(22,163,74,0.12)",
};

const toastLeftStyle = {
  display: "flex", alignItems: "center", gap: 10, flex: 1,
};

const toastCloseBtnStyle = {
  background: "transparent", border: "none", color: "#94a3b8",
  fontSize: 14, cursor: "pointer", flexShrink: 0,
  padding: "2px 6px", borderRadius: 6,
};