import { useState } from "react";
import { useNavigate } from "react-router-dom";

const EyeIcon = ({ visible }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {visible ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const PasswordInput = ({ label, value, onChange, placeholder, id }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{ marginBottom: "16px" }}>
      <label htmlFor={id} style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={6}
          style={{
            width: "100%",
            padding: "11px 44px 11px 14px",
            border: "1.5px solid #E5E7EB",
            borderRadius: "10px",
            fontSize: "15px",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.2s",
            background: "#FAFAFA",
            color: "#111827",
          }}
          onFocus={e => (e.target.style.borderColor = "#4F6FE8")}
          onBlur={e => (e.target.style.borderColor = "#E5E7EB")}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          style={{
            position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: "2px",
            display: "flex", alignItems: "center",
          }}
        >
          <EyeIcon visible={show} />
        </button>
      </div>
    </div>
  );
};

const Rule = ({ ok, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: ok ? "#16A34A" : "#6B7280" }}>
    <span style={{ color: ok ? "#16A34A" : "#D1D5DB" }}>{ok ? <CheckIcon /> : <XIcon />}</span>
    {label}
  </div>
);

const strengthLabel = (score) => {
  if (score === 0) return { text: "", color: "#E5E7EB", width: "0%" };
  if (score === 1) return { text: "Débil", color: "#EF4444", width: "25%" };
  if (score === 2) return { text: "Regular", color: "#F59E0B", width: "50%" };
  if (score === 3) return { text: "Buena", color: "#3B82F6", width: "75%" };
  return { text: "Fuerte", color: "#16A34A", width: "100%" };
};

export default function CambiarContrasena() {
  const navigate = useNavigate();
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const hasLength = nueva.length >= 6;
  const hasUpper = /[A-Z]/.test(nueva);
  const hasNumber = /[0-9]/.test(nueva);
  const hasSpecial = /[^A-Za-z0-9]/.test(nueva);
  const matches = nueva === confirmar && nueva.length > 0;

  const score = [hasLength, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  const strength = strengthLabel(score);

  const handleSubmit = () => {
    setError("");
    if (!hasLength || !hasUpper || !hasNumber) return setError("La nueva contraseña no cumple los requisitos.");
    if (!matches) return setError("Las contraseñas no coinciden.");
    setSuccess(true);
  };

  const handleClose = () => navigate(-1);
  const handleLoginRedirect = () => navigate("/auth/login");

  return (
    <div style={{
      minHeight: "420px", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#f0f4f8", borderRadius: "16px", padding: "24px",
    }}>
      <div style={{
        background: "#FFFFFF", borderRadius: "16px", padding: "32px 28px",
        width: "100%", maxWidth: "400px", boxSizing: "border-box", position: "relative",
      }}>
        <button
          onClick={handleLoginRedirect}
          style={{
            position: "absolute", top: "16px", right: "16px",
            background: "none", border: "none", cursor: "pointer", color: "#9CA3AF",
            fontSize: "20px", lineHeight: 1, padding: "2px 6px",
          }}
        >×</button>

        {!success ? (
          <>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "50%",
                background: "#EEF2FF", display: "flex", alignItems: "center",
                justifyContent: "center", margin: "0 auto 12px",
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4F6FE8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#111827", margin: "0 0 4px" }}>
                Cambiar contraseña
              </h2>
              <p style={{ fontSize: "14px", color: "#6B7280", margin: 0 }}>
                Elige una contraseña segura para tu cuenta.
              </p>
            </div>

            <PasswordInput label="Nueva contraseña" id="nueva" value={nueva} onChange={e => setNueva(e.target.value)} placeholder="••••••" />

            {nueva.length > 0 && (
              <div style={{ marginBottom: "16px", marginTop: "-8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontSize: "12px", color: "#6B7280" }}>Seguridad</span>
                  <span style={{ fontSize: "12px", fontWeight: "500", color: strength.color }}>{strength.text}</span>
                </div>
                <div style={{ height: "4px", background: "#F3F4F6", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: strength.width, background: strength.color, borderRadius: "4px", transition: "width 0.3s, background 0.3s" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px", marginTop: "10px" }}>
                  <Rule ok={hasLength} label="Mínimo 6 caracteres" />
                  <Rule ok={hasUpper} label="Una mayúscula" />
                  <Rule ok={hasNumber} label="Un número" />
                  <Rule ok={hasSpecial} label="Un carácter especial" />
                </div>
              </div>
            )}

            <PasswordInput label="Confirmar nueva contraseña" id="confirmar" value={confirmar} onChange={e => setConfirmar(e.target.value)} placeholder="••••••" />

            {confirmar.length > 0 && (
              <p style={{ fontSize: "13px", marginTop: "-10px", marginBottom: "14px", color: matches ? "#16A34A" : "#EF4444" }}>
                {matches ? "✓ Las contraseñas coinciden" : "✗ Las contraseñas no coinciden"}
              </p>
            )}

            {error && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px", fontSize: "13px", color: "#B91C1C" }}>
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              style={{
                width: "100%", padding: "13px", background: "#4F6FE8", color: "#fff",
                border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "600",
                cursor: "pointer", marginBottom: "10px", transition: "background 0.2s",
              }}
              onMouseEnter={e => (e.target.style.background = "#3B5BD6")}
              onMouseLeave={e => (e.target.style.background = "#4F6FE8")}
            >
              Actualizar contraseña
            </button>

            <button
              onClick={handleClose}
              style={{
                width: "100%", padding: "13px", background: "#EF4444", color: "#fff",
                border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "600",
                cursor: "pointer", transition: "background 0.2s",
              }}
              onMouseEnter={e => (e.target.style.background = "#DC2626")}
              onMouseLeave={e => (e.target.style.background = "#EF4444")}
            >
              Cancelar
            </button>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{
              width: "64px", height: "64px", borderRadius: "50%", background: "#DCFCE7",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#111827", margin: "0 0 8px" }}>
              ¡Contraseña actualizada!
            </h2>
            <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "24px" }}>
              Tu contraseña fue cambiada exitosamente.
            </p>
            <button
              onClick={handleLoginRedirect}
              style={{
                padding: "11px 32px", background: "#4F6FE8", color: "#fff",
                border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Aceptar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}