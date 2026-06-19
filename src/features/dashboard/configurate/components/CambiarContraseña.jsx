import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../../../../services/http/const";
import { BASE_SESSION_TOKEN_KEY } from "../../../auth/services/sessionService";
import { useLanguage } from "../../../../core/i18n";
import DashboardFeedback from "../../layout/DashboardFeedback";
import BackgroundSaveIndicator from "../../../../shared/ui/BackgroundSaveIndicator";

const getToken = () => localStorage.getItem("tokenPORT");

export default function CambiarContraseña() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [form, setForm] = useState({
    actual: "",
    nueva: "",
    confirmar: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [recovEmail, setRecovEmail] = useState("");
  const [recovLoading, setRecovLoading] = useState(false);
  const [recovError, setRecovError] = useState("");
  const [recovMsg, setRecovMsg] = useState("");

  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/dashboard/settings");
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setError("");
    setSuccess("");
  };

  const validate = () => {
    if (!form.actual) {
      return t("configurate.password.validation.currentRequired");
    }

    if (form.nueva.length < 6) {
      return t("configurate.password.validation.minLength");
    }

    if (!/[A-Z]/.test(form.nueva)) {
      return t("configurate.password.validation.uppercase");
    }

    if (!/[0-9]/.test(form.nueva)) {
      return t("configurate.password.validation.number");
    }

    if (form.nueva !== form.confirmar) {
      return t("auth.error.passwordMismatch");
    }

    return null;
  };

  const handleSubmit = async () => {
    const err = validate();

    if (err) {
      setError(err);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await fetch(`${BASE_URL}/usuarios/cambiar-password`, {
        method: "POST",
        headers: {
          Accept: "application/json",
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

      if (!res.ok) {
        throw new Error(data.message || t("configurate.password.error.update"));
      }

      setSuccess(data.message || t("configurate.password.success.updated"));
      setForm({
        actual: "",
        nueva: "",
        confirmar: "",
      });
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: recovEmail,
          session_token: baseSessionToken,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || t("configurate.password.error.recovery"));
      }

      sessionStorage.setItem("correo_recuperacion", recovEmail);
      sessionStorage.setItem("redirect_after_recovery", "/dashboard/settings");

      setRecovMsg(data.message || t("configurate.password.success.codeSent"));

      setTimeout(() => navigate("/auth/Codigo"), 1200);
    } catch (e) {
      setRecovError(e.message);
    } finally {
      setRecovLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <main
        style={{
          ...innerStyle,
          padding: isMobile ? "24px 14px 42px" : "36px 24px 52px",
        }}
      >
        <button type="button" style={backButtonStyle} onClick={handleBack}>
          <span style={backIconStyle}>‹</span>
          {t("actions.back")}
        </button>

        <section style={headerStyle}>
          <div style={badgeStyle}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--azul)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            {t("configurate.password.badge")}
          </div>

          <h1 style={titleStyle}>{t("configurate.password.title")}</h1>

          <p style={subtitleStyle}>
            {t("configurate.password.subtitle")}
          </p>
        </section>

        <section style={cardStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>{t("configurate.password.currentLabel")}</label>

            <input
              type="password"
              name="actual"
              value={form.actual}
              onChange={handleChange}
              placeholder="••••••••••"
              style={inputStyle}
              autoComplete="current-password"
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={(e) =>
                Object.assign(e.target.style, {
                  borderColor: "var(--gris-borde)",
                  boxShadow: "none",
                })
              }
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>{t("configurate.password.newLabel")}</label>

            <input
              type="password"
              name="nueva"
              value={form.nueva}
              onChange={handleChange}
              placeholder="••••••••••"
              style={inputStyle}
              autoComplete="new-password"
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={(e) =>
                Object.assign(e.target.style, {
                  borderColor: "var(--gris-borde)",
                  boxShadow: "none",
                })
              }
            />

            <span style={hintStyle}>
              {t("configurate.password.requirements")}
            </span>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>{t("configurate.password.confirmLabel")}</label>

            <input
              type="password"
              name="confirmar"
              value={form.confirmar}
              onChange={handleChange}
              placeholder="••••••••••"
              style={inputStyle}
              autoComplete="new-password"
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={(e) =>
                Object.assign(e.target.style, {
                  borderColor: "var(--gris-borde)",
                  boxShadow: "none",
                })
              }
            />
          </div>


          <div
            style={{
              ...actionsStyle,
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "stretch" : "center",
            }}
          >
            <button
              type="button"
              style={{
                ...btnPrimaryStyle,
                width: isMobile ? "100%" : "auto",
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? t("auth.status.updating") : t("configurate.password.submit")}
            </button>

            <button
              type="button"
              style={{
                ...btnCancelStyle,
                width: isMobile ? "100%" : "auto",
              }}
              onClick={handleBack}
            >
              {t("actions.cancel")}
            </button>
          </div>
        </section>

        <div style={dividerStyle}>
          <span style={dividerLineStyle} />
          <span style={dividerTextStyle}>{t("configurate.password.forgotQuestion")}</span>
          <span style={dividerLineStyle} />
        </div>

        <section style={recovCardStyle}>
          <div style={badgeStyle}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--azul)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4m0 4h.01" />
            </svg>
            {t("configurate.password.recoveryBadge")}
          </div>

          <p style={recovDescStyle}>
            {t("configurate.password.recoveryDescription")}
          </p>

          <div style={fieldStyle}>
            <label style={labelStyle}>{t("auth.field.email")}</label>

            <input
              type="email"
              value={recovEmail}
              onChange={(e) => {
                setRecovEmail(e.target.value);
                setRecovError("");
                setRecovMsg("");
              }}
              placeholder={t("configurate.password.emailPlaceholder")}
              style={inputStyle}
              autoComplete="email"
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={(e) =>
                Object.assign(e.target.style, {
                  borderColor: "var(--gris-borde)",
                  boxShadow: "none",
                })
              }
            />
          </div>


          <button
            type="button"
            style={{
              ...btnPrimaryStyle,
              width: isMobile ? "100%" : "fit-content",
              opacity: !recovEmail || recovLoading ? 0.7 : 1,
              cursor: !recovEmail || recovLoading ? "not-allowed" : "pointer",
            }}
            onClick={handleRecovery}
            disabled={!recovEmail || recovLoading}
          >
            {recovLoading ? t("auth.status.sending") : t("configurate.password.sendRecoveryCode")}
          </button>
        </section>
        <DashboardFeedback feedback={error || recovError
          ? { msg: error || recovError, tipo: "error" }
          : success || recovMsg
            ? { msg: success || recovMsg, tipo: "ok" }
            : null}
        />
        <BackgroundSaveIndicator active={loading || recovLoading} label={t("actions.saving")} />
      </main>
    </div>
  );
}

const pageStyle = {
  minHeight: "100dvh",
  background: "var(--fondo)",
  color: "var(--negro-texto)",
  fontFamily: "var(--font)",
};

const innerStyle = {
  maxWidth: 800,
  margin: "0 auto",
  width: "100%",
};

const backButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  minHeight: 38,
  marginBottom: 22,
  padding: "8px 14px",
  border: "1.5px solid var(--gris-borde)",
  borderRadius: 12,
  background: "var(--blanco)",
  color: "var(--gris-oscuro)",
  fontFamily: "var(--font)",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 8px 18px rgba(17, 24, 39, 0.06)",
};

const backIconStyle = {
  width: 20,
  height: 20,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 8,
  background: "var(--azul-light)",
  color: "var(--azul)",
  fontSize: 22,
  lineHeight: 1,
};

const headerStyle = {
  marginBottom: 26,
};

const badgeStyle = {
  width: "fit-content",
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  border: "1.5px solid var(--azul-mid)",
  borderRadius: 999,
  padding: "6px 14px",
  background: "var(--azul-light)",
  fontSize: 12,
  fontWeight: 800,
  color: "var(--azul)",
  letterSpacing: 1.2,
  textTransform: "uppercase",
  marginBottom: 18,
  fontFamily: "var(--font)",
};

const titleStyle = {
  fontSize: "clamp(28px, 5vw, 36px)",
  fontWeight: 800,
  color: "var(--negro-texto)",
  fontFamily: "var(--font)",
  margin: "0 0 10px",
  lineHeight: 1.1,
  letterSpacing: "-0.04em",
};

const subtitleStyle = {
  fontSize: 14,
  color: "var(--gris-texto)",
  margin: 0,
  lineHeight: 1.55,
  maxWidth: 650,
};

const cardStyle = {
  background: "var(--blanco)",
  border: "1px solid var(--gris-borde)",
  borderLeft: "4px solid var(--azul)",
  borderRadius: 18,
  padding: "24px",
  display: "flex",
  flexDirection: "column",
  gap: 18,
  boxShadow: "0 10px 24px rgba(17, 24, 39, 0.08)",
};

const recovCardStyle = {
  ...cardStyle,
  gap: 18,
};

const fieldStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 7,
};

const labelStyle = {
  fontSize: 12,
  fontWeight: 800,
  color: "var(--gris-oscuro)",
  letterSpacing: 0.8,
  textTransform: "uppercase",
  lineHeight: 1.35,
};

const inputStyle = {
  width: "100%",
  minHeight: 46,
  padding: "12px 14px",
  border: "1.5px solid var(--gris-borde)",
  borderRadius: 12,
  background: "var(--blanco)",
  fontSize: 14,
  color: "var(--negro-texto)",
  outline: "none",
  fontFamily: "var(--font)",
  boxSizing: "border-box",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const inputFocusStyle = {
  borderColor: "var(--azul)",
  boxShadow: "0 0 0 4px var(--azul-glow)",
};

const hintStyle = {
  fontSize: 12,
  color: "var(--gris-texto)",
  lineHeight: 1.4,
};

const actionsStyle = {
  display: "flex",
  gap: 12,
  marginTop: 4,
};

const btnPrimaryStyle = {
  minHeight: 42,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--azul)",
  color: "var(--blanco)",
  border: "none",
  borderRadius: 12,
  padding: "11px 18px",
  fontSize: 14,
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 8px 18px rgba(0, 119, 183, 0.24)",
  fontFamily: "var(--font)",
};

const btnCancelStyle = {
  minHeight: 42,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--blanco)",
  color: "var(--gris-oscuro)",
  border: "1.5px solid var(--gris-borde)",
  borderRadius: 12,
  padding: "11px 18px",
  fontSize: 14,
  fontWeight: 800,
  cursor: "pointer",
  fontFamily: "var(--font)",
};

const dividerStyle = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  margin: "32px 0 28px",
};

const dividerLineStyle = {
  flex: 1,
  height: 1,
  background: "var(--azul-mid)",
  display: "block",
};

const dividerTextStyle = {
  fontSize: 12,
  fontWeight: 800,
  color: "var(--gris-texto)",
  letterSpacing: 1,
  textTransform: "uppercase",
  whiteSpace: "nowrap",
};

const recovDescStyle = {
  fontSize: 14,
  color: "var(--gris-texto)",
  margin: 0,
  lineHeight: 1.55,
};
