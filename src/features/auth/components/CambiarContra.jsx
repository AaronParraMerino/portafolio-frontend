import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_SESSION_TOKEN_KEY } from "../services/sessionService";
import { useLanguage } from "../../../core/i18n";

const API = process.env.REACT_APP_API_URL;

export default function CambiarContrasena() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const hasLength = nueva.length >= 6;
  const hasUpper = /[A-Z]/.test(nueva);
  const hasNumber = /[0-9]/.test(nueva);
  const matches = nueva === confirmar && nueva.length > 0;

  const hasTokenPort = Boolean(localStorage.getItem("tokenPORT"));
  const defaultRedirect = hasTokenPort ? "/dashboard/settings" : "/auth/login";
  const returnButtonLabel = hasTokenPort ? t("auth.changePassword.backSettings") : t("auth.changePassword.goLogin");

  const handleSubmit = async () => {
    setError("");

    if (!hasLength || !hasUpper || !hasNumber) {
      return setError(t("auth.error.passwordRequirements"));
    }
    if (!matches) {
      return setError(t("auth.error.passwordMismatch"));
    }

    const correo = sessionStorage.getItem("correo_recuperacion");
    const codigo = sessionStorage.getItem("codigo_recuperacion");

    if (!correo || !codigo) {
      return setError(t("auth.error.invalidRecoverySession"));
    }

    try {
      setCargando(true);
      const baseSessionToken = sessionStorage.getItem(BASE_SESSION_TOKEN_KEY);
      const res = await fetch(`${API}/recuperacion/restablecer`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo,
          codigo,
          password: nueva,
          password_confirmation: confirmar,
          session_token: baseSessionToken,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t("auth.error.updatePassword"));

      sessionStorage.removeItem("codigo_recuperacion");
      sessionStorage.removeItem("correo_recuperacion");
      setSuccess(true);
      const redirect = sessionStorage.getItem("redirect_after_recovery");
      if (redirect) {
        sessionStorage.removeItem("redirect_after_recovery");
        setTimeout(() => navigate(redirect), 1500);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  const handleLoginRedirect = () => {
    const redirect = sessionStorage.getItem("redirect_after_recovery");
    if (redirect) {
      sessionStorage.removeItem("redirect_after_recovery");
      navigate(redirect);
      return;
    }
    navigate(defaultRedirect);
  };

  return (
    <div style={{ minHeight: "420px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--fondo)", borderRadius: "16px", padding: "24px" }}>
      <div style={{ background: "var(--blanco)", borderRadius: "16px", padding: "32px 28px", width: "100%", maxWidth: "400px", boxSizing: "border-box", position: "relative" }}>
        <button
          onClick={handleLoginRedirect}
          style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "var(--gris-texto)", fontSize: "20px" }}
        >
          ×
        </button>

        {!success ? (
          <>
            <h2 style={{ textAlign: "center", marginBottom: "16px" }}>{t("auth.changePassword.title")}</h2>

            <input
              type="password"
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              placeholder={t("auth.changePassword.newPassword")}
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1.5px solid var(--gris-borde)", marginBottom: "10px", fontFamily: "var(--font)", fontSize: "14px", outline: "none" }}
            />

            <input
              type="password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              placeholder={t("auth.changePassword.confirmNewPassword")}
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1.5px solid var(--gris-borde)", marginBottom: "10px", fontFamily: "var(--font)", fontSize: "14px", outline: "none" }}
            />

            <p style={{ fontSize: "12px", color: "var(--gris-texto)", fontFamily: "var(--font)" }}>
              {t("auth.changePassword.requirements")}
            </p>

            {error ? <p style={{ color: "var(--rojo-soft)", fontSize: "13px", fontFamily: "var(--font)" }}>{error}</p> : null}

            <button
              onClick={handleSubmit}
              disabled={cargando}
              style={{ width: "100%", padding: "12px", background: "var(--azul)", color: "var(--blanco)", border: "none", borderRadius: "8px", marginTop: "8px", cursor: "pointer", fontFamily: "var(--font)", fontWeight: "600" }}
            >
              {cargando ? t("auth.status.updating") : t("auth.changePassword.submit")}
            </button>
          </>
        ) : (
          <div style={{ textAlign: "center", fontFamily: "var(--font)" }}>
            <h2 style={{ color: "var(--azul)", marginBottom: "10px" }}>{t("auth.changePassword.successTitle")}</h2>
            <p style={{ color: "var(--gris-texto)", marginBottom: "20px" }}>{t("auth.changePassword.successText")}</p>
            <button
              onClick={handleLoginRedirect}
              style={{ padding: "11px 32px", background: "var(--azul)", color: "var(--blanco)", border: "none", borderRadius: "8px", cursor: "pointer", fontFamily: "var(--font)", fontWeight: "600" }}
            >
              {returnButtonLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
