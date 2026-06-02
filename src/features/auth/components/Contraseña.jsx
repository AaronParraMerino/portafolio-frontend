import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_SESSION_TOKEN_KEY } from "../services/sessionService";
import { useLanguage } from "../../../core/i18n";

const API = process.env.REACT_APP_API_URL;

export default function RecuperacionAcceso() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [cargando, setCargando] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError("");
    setMsg("");
    if (!email) return;

    try {
      setCargando(true);
      const baseSessionToken = sessionStorage.getItem(BASE_SESSION_TOKEN_KEY);
      const res = await fetch(`${API}/recuperacion/solicitar`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: email, session_token: baseSessionToken }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t("auth.error.recoveryRequest"));

      sessionStorage.setItem("correo_recuperacion", email);
      setMsg(data.message || t("auth.recovery.emailSent"));
      navigate("/auth/Codigo");
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--fondo)", fontFamily: "var(--font)" }}>
      <div style={{ backgroundColor: "var(--blanco)", borderRadius: "12px", padding: "40px 36px", width: "100%", maxWidth: "400px", boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "600", color: "var(--azul)", marginBottom: "10px", textAlign: "center" }}>
          {t("auth.recovery.title")}
        </h1>

        <p style={{ fontSize: "14px", color: "var(--gris-texto)", marginBottom: "24px", lineHeight: "1.5" }}>
          {t("auth.recovery.description")}
        </p>

        <label htmlFor="email" style={{ fontSize: "13px", fontWeight: "500", color: "var(--gris-oscuro)", display: "block", marginBottom: "6px" }}>
          {t("auth.field.email")}
        </label>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ejemplo@gmail.com"
          style={{ width: "100%", padding: "10px 12px", fontSize: "14px", border: "1.5px solid var(--gris-borde)", borderRadius: "8px", outline: "none", boxSizing: "border-box", marginBottom: "20px", fontFamily: "var(--font)" }}
        />

        {msg ? <p style={{ color: "var(--verde)", fontSize: "13px" }}>{msg}</p> : null}
        {error ? <p style={{ color: "var(--rojo-soft)", fontSize: "13px" }}>{error}</p> : null}

        <button
          onClick={handleSubmit}
          disabled={!email || cargando}
          style={{ width: "100%", padding: "12px", backgroundColor: email && !cargando ? "var(--azul)" : "var(--azul-mid)", color: "var(--blanco)", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "500", cursor: email && !cargando ? "pointer" : "not-allowed", fontFamily: "var(--font)" }}
        >
          {cargando ? t("auth.status.sending") : t("auth.action.sendCode")}
        </button>

        <button
          type="button"
          onClick={() => navigate("/auth/Login")}
          style={{ fontSize: "13px", color: "var(--azul)", background: "none", border: "none", cursor: "pointer", padding: 0, display: "block", margin: "16px auto 0", fontFamily: "var(--font)" }}
        >
          {t("auth.recovery.backLogin")}
        </button>
      </div>
    </div>
  );
}
