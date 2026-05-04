import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../../../../services/http/const";
import { BASE_SESSION_TOKEN_KEY } from "../../../auth/services/sessionService";

const getToken = () => localStorage.getItem("tokenPORT");

export default function CambiarContraseña() {
  const navigate = useNavigate();

  // --- cambio de contraseña ---
  const [form, setForm] = useState({ actual: "", nueva: "", confirmar: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --- olvidé mi contraseña ---
  const [recovEmail, setRecovEmail] = useState("");
  const [recovLoading, setRecovLoading] = useState(false);
  const [recovError, setRecovError] = useState("");
  const [recovMsg, setRecovMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const validate = () => {
    if (!form.actual) return "Ingresa tu contraseña actual.";
    if (form.nueva.length < 6) return "La nueva contraseña debe tener al menos 6 caracteres.";
    if (!/[A-Z]/.test(form.nueva)) return "La nueva contraseña debe incluir al menos una mayúscula.";
    if (!/[0-9]/.test(form.nueva)) return "La nueva contraseña debe incluir al menos un número.";
    if (form.nueva !== form.confirmar) return "Las contraseñas no coinciden.";
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }

    try {
      setLoading(true);
      setError("");
      setSuccess("");
      const res = await fetch(`${BASE_URL}/usuarios/cambiar-password`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          password_actual: form.actual,
          password_nueva: form.nueva,
          password_nueva_confirmation: form.confirmar,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Error al actualizar la contraseña.");
      setSuccess(data.message || "Contraseña actualizada correctamente.");
      setForm({ actual: "", nueva: "", confirmar: "" });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = async () => {
    if (!recovEmail) return;
    try {
      setRecovLoading(true);
      setRecovError("");
      setRecovMsg("");
      const baseSessionToken = sessionStorage.getItem(BASE_SESSION_TOKEN_KEY);
      const res = await fetch(`${BASE_URL}/recuperacion/solicitar`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: recovEmail, session_token: baseSessionToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Error al solicitar recuperación.");
      sessionStorage.setItem("correo_recuperacion", recovEmail);
      sessionStorage.setItem("redirect_after_recovery", "/dashboard");
      setRecovMsg(data.message || "Código enviado. Redirigiendo…");
      setTimeout(() => navigate("/auth/Codigo"), 1200);
    } catch (e) {
      setRecovError(e.message);
    } finally {
      setRecovLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={innerStyle}>
        <button onClick={() => navigate("/dashboard/settings")} style={backBtnStyle}>
          ← Volver a Configuración
        </button>

        <div style={badgeStyle}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Seguridad
        </div>

        <h1 style={titleStyle}>Cambiar contraseña</h1>
        <p style={subtitleStyle}>Elige una contraseña segura y no la reutilices en otros sitios.</p>

        {/* ── Formulario cambio de contraseña ── */}
        <div style={cardStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Contraseña actual</label>
            <input type="password" name="actual" value={form.actual} onChange={handleChange}
              placeholder="••••••••••" style={inputStyle}
              onFocus={e => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={e => Object.assign(e.target.style, { borderColor: "#bae6fd", boxShadow: "none" })} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Nueva contraseña</label>
            <input type="password" name="nueva" value={form.nueva} onChange={handleChange}
              placeholder="••••••••••" style={inputStyle}
              onFocus={e => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={e => Object.assign(e.target.style, { borderColor: "#bae6fd", boxShadow: "none" })} />
            <span style={hintStyle}>Mínimo 6 caracteres, una mayúscula y un número.</span>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Confirmar nueva contraseña</label>
            <input type="password" name="confirmar" value={form.confirmar} onChange={handleChange}
              placeholder="••••••••••" style={inputStyle}
              onFocus={e => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={e => Object.assign(e.target.style, { borderColor: "#bae6fd", boxShadow: "none" })} />
          </div>

          {error  && <p style={errorMsgStyle}>{error}</p>}
          {success && <p style={successMsgStyle}>{success}</p>}

          <div style={actionsStyle}>
            <button style={{ ...btnPrimaryStyle, opacity: loading ? 0.7 : 1 }}
              onClick={handleSubmit} disabled={loading}>
              {loading ? "Actualizando…" : "Actualizar contraseña"}
            </button>
            <button style={btnCancelStyle} onClick={() => navigate("/dashboard/settings")}>Cancelar</button>
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={dividerStyle}>
          <span style={dividerLineStyle} />
          <span style={dividerTextStyle}>¿No recuerdas tu contraseña?</span>
          <span style={dividerLineStyle} />
        </div>

        {/* ── Sección recuperar contraseña ── */}
        <div style={recovCardStyle}>
          <div style={badgeStyle}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
            </svg>
            Recuperación
          </div>
          <p style={recovDescStyle}>
            Te enviaremos un código a tu correo para que puedas establecer una nueva contraseña.
          </p>
          <div style={fieldStyle}>
            <label style={labelStyle}>Correo electrónico</label>
            <input type="email" value={recovEmail} onChange={e => { setRecovEmail(e.target.value); setRecovError(""); setRecovMsg(""); }}
              placeholder="ejemplo@correo.com" style={inputStyle}
              onFocus={e => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={e => Object.assign(e.target.style, { borderColor: "#bae6fd", boxShadow: "none" })} />
          </div>

          {recovError && <p style={errorMsgStyle}>{recovError}</p>}
          {recovMsg   && <p style={successMsgStyle}>{recovMsg}</p>}

          <button
            style={{ ...btnPrimaryStyle, opacity: !recovEmail || recovLoading ? 0.7 : 1 }}
            onClick={handleRecovery}
            disabled={!recovEmail || recovLoading}>
            {recovLoading ? "Enviando…" : "Enviar código de recuperación"}
          </button>
        </div>
      </div>
    </div>
  );
}

const pageStyle = { fontFamily: "'Segoe UI','Inter',sans-serif", background: "#e8f4fd", minHeight: "100vh", padding: "36px 24px" };
const innerStyle = { maxWidth: 680, margin: "0 auto", width: "100%" };
const backBtnStyle = { background: "transparent", border: "none", color: "#64748b", fontSize: 14, cursor: "pointer", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 };
const badgeStyle = { display: "inline-flex", alignItems: "center", gap: 7, border: "1.5px solid #93c5fd", borderRadius: 999, padding: "5px 14px", background: "#eff8ff", fontSize: 12, fontWeight: 700, color: "#1e40af", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 18 };
const titleStyle = { fontSize: 34, fontWeight: 900, color: "#0f172a", fontFamily: "Georgia,'Times New Roman',serif", marginBottom: 10, lineHeight: 1.1 };
const subtitleStyle = { fontSize: 14, color: "#475569", marginBottom: 28 };
const cardStyle = { background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 18, padding: "28px 24px 24px", display: "flex", flexDirection: "column", gap: 20 };
const fieldStyle = { display: "flex", flexDirection: "column", gap: 7 };
const labelStyle = { fontSize: 11, fontWeight: 800, color: "#475569", letterSpacing: 2, textTransform: "uppercase" };
const inputStyle = { width: "100%", padding: "13px 16px", border: "1.5px solid #bae6fd", borderRadius: 10, background: "#ffffff", fontSize: 15, color: "#1e293b", outline: "none", boxSizing: "border-box" };
const inputFocusStyle = { borderColor: "#38bdf8", boxShadow: "0 0 0 3px rgba(56,189,248,0.15)" };
const hintStyle = { fontSize: 12, color: "#94a3b8" };
const actionsStyle = { display: "flex", alignItems: "center", gap: 12, marginTop: 4 };
const btnPrimaryStyle = { background: "#0ea5e9", color: "#fff", border: "none", borderRadius: 10, padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(14,165,233,0.3)" };
const btnCancelStyle = { background: "transparent", color: "#374151", border: "1.5px solid #d1d5db", borderRadius: 10, padding: "12px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer" };
const errorMsgStyle = { fontSize: 13, color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", margin: 0 };
const successMsgStyle = { fontSize: 13, color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", margin: 0 };
const dividerStyle = { display: "flex", alignItems: "center", gap: 14, margin: "32px 0 28px" };
const dividerLineStyle = { flex: 1, height: 1, background: "#bae6fd", display: "block" };
const dividerTextStyle = { fontSize: 12, fontWeight: 700, color: "#64748b", letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" };
const recovCardStyle = { background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 18, padding: "28px 24px 24px", display: "flex", flexDirection: "column", gap: 20 };
const recovDescStyle = { fontSize: 14, color: "#475569", margin: 0 };
