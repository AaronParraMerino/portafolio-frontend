import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthStorage } from "../../../../shared/utils/authStorage";

export default function EliminarCuenta() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    confirmacion: "",
    contrasena: "",
  });

  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  const API = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/dashboard/settings");
  };

  const showToast = (type, message) => {
    setToast({ type, message });

    if (type !== "success") {
      setTimeout(() => setToast(null), 4000);
    }
  };

  const handleEliminar = async () => {
    const sinConfirmacion = form.confirmacion.trim() === "";
    const sinContrasena = form.contrasena.trim() === "";

    if (sinConfirmacion && sinContrasena) {
      showToast("error", "Debes completar todos los campos para continuar.");
      return;
    }

    if (sinConfirmacion) {
      showToast("error", 'Escribe "ELIMINAR" en el campo de confirmación.');
      return;
    }

    if (sinContrasena) {
      showToast("error", "Ingresa tu contraseña para confirmar la eliminación.");
      return;
    }

    if (form.confirmacion.toLowerCase() !== "eliminar") {
      showToast(
        "error",
        'El texto de confirmación no es correcto. Escribe exactamente "ELIMINAR".'
      );
      return;
    }

    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    const userId = usuario.id_usuario || usuario.id || usuario.idUsuario;
    const token = localStorage.getItem("tokenPORT");

    if (!userId || !token) {
      showToast("error", "No se pudo identificar la sesión actual.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API}/usuarios/${userId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          password: form.contrasena,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "No se pudo desactivar la cuenta.");
      }

      showToast(
        "success",
        "Tu cuenta fue desactivada. Todo tu portafolio público quedó oculto."
      );

      clearAuthStorage();

      setTimeout(() => navigate("/auth/login"), 2500);
    } catch (e) {
      showToast("error", e.message);
    } finally {
      setLoading(false);
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
          Volver
        </button>

        {toast && (
          <div
            style={
              toast.type === "success" ? toastSuccessStyle : toastErrorStyle
            }
          >
            <div style={toastLeftStyle}>
              {toast.type === "success" ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--verde-hover)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--rojo-soft)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}

              <span
                style={{
                  ...toastTextStyle,
                  color:
                    toast.type === "success"
                      ? "var(--verde-hover)"
                      : "var(--rojo-mid)",
                }}
              >
                {toast.message}
              </span>
            </div>

            {toast.type !== "success" && (
              <button
                type="button"
                onClick={() => setToast(null)}
                style={toastCloseBtnStyle}
                aria-label="Cerrar alerta"
              >
                ✕
              </button>
            )}
          </div>
        )}

        <section style={headerStyle}>
          <div style={badgeStyle}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--rojo-soft)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Zona de peligro
          </div>

          <h1 style={titleStyle}>Eliminar cuenta</h1>

          <p style={subtitleStyle}>
            Tu cuenta quedará inactiva y tu portafolio público se ocultará.
            Podrás restablecerla verificando tu correo.
          </p>
        </section>

        <section style={warningCardStyle}>
          <div style={warnIconWrapStyle}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--rojo-soft)"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <div>
            <p style={warningTitleStyle}>Al desactivar tu cuenta:</p>

            <ul style={warningListStyle}>
              {[
                "No podrás iniciar sesión hasta restablecerla",
                "Tu perfil público quedará oculto",
                "Tus proyectos, habilidades, enlaces y evidencias visibles pasarán a privado",
                "Tus datos se conservarán para una reactivación segura",
              ].map((item, index) => (
                <li key={index} style={warningItemStyle}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div style={dividerStyle} />

        <section style={formStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>
              Escribe{" "}
              <span style={{ color: "var(--rojo-soft)", fontWeight: 800 }}>
                ELIMINAR
              </span>{" "}
              para confirmar
            </label>

            <input
              type="text"
              name="confirmacion"
              value={form.confirmacion}
              onChange={handleChange}
              placeholder="ELIMINAR"
              style={{
                ...inputStyle,
                borderColor:
                  toast?.type === "error" && form.confirmacion.trim() === ""
                    ? "var(--rojo-soft)"
                    : "var(--gris-borde)",
              }}
              autoComplete="off"
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
            <label style={labelStyle}>Contraseña</label>

            <input
              type="password"
              name="contrasena"
              value={form.contrasena}
              onChange={handleChange}
              placeholder="Ingresa tu contraseña"
              style={{
                ...inputStyle,
                borderColor:
                  toast?.type === "error" && form.contrasena.trim() === ""
                    ? "var(--rojo-soft)"
                    : "var(--gris-borde)",
              }}
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
                ...btnDangerStyle,
                width: isMobile ? "100%" : "auto",
                opacity: loading ? 0.65 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onClick={handleEliminar}
              disabled={loading}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--blanco)"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>

              {loading ? "Desactivando..." : "Desactivar mi cuenta"}
            </button>

            <button
              type="button"
              style={{
                ...btnCancelStyle,
                width: isMobile ? "100%" : "auto",
              }}
              onClick={handleBack}
            >
              Cancelar
            </button>
          </div>
        </section>
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
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  border: "1.5px solid var(--rojo-borde)",
  borderRadius: 999,
  padding: "6px 14px",
  background: "var(--rojo-chip)",
  fontSize: 12,
  fontWeight: 800,
  color: "var(--rojo-mid)",
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

const warningCardStyle = {
  background: "var(--rojo-chip)",
  border: "1px solid var(--rojo-borde)",
  borderLeft: "4px solid var(--rojo-soft)",
  borderRadius: 18,
  padding: "18px 20px",
  display: "flex",
  gap: 14,
  alignItems: "flex-start",
  marginBottom: 26,
  boxShadow: "0 10px 24px rgba(232, 85, 85, 0.08)",
};

const warnIconWrapStyle = {
  width: 42,
  height: 42,
  borderRadius: 14,
  background: "var(--rojo-bg)",
  border: "1px solid var(--rojo-borde)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const warningTitleStyle = {
  fontSize: 14,
  fontWeight: 800,
  color: "var(--rojo-soft)",
  margin: "0 0 10px",
};

const warningListStyle = {
  paddingLeft: 18,
  display: "flex",
  flexDirection: "column",
  gap: 6,
  listStyleType: "disc",
  margin: 0,
};

const warningItemStyle = {
  fontSize: 13,
  color: "var(--gris-oscuro)",
  lineHeight: 1.45,
};

const dividerStyle = {
  height: 1,
  background: "var(--gris-borde)",
  marginBottom: 22,
};

const formStyle = {
  background: "var(--blanco)",
  border: "1px solid var(--gris-borde)",
  borderRadius: 18,
  padding: "22px",
  boxShadow: "0 10px 24px rgba(17, 24, 39, 0.08)",
};

const fieldStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 7,
  marginBottom: 16,
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
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const inputFocusStyle = {
  borderColor: "var(--rojo-soft)",
  boxShadow: "0 0 0 4px var(--rojo-bg)",
};

const actionsStyle = {
  display: "flex",
  gap: 12,
  marginTop: 6,
};

const btnDangerStyle = {
  minHeight: 42,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  background: "var(--rojo-soft)",
  color: "var(--blanco)",
  border: "none",
  borderRadius: 12,
  padding: "11px 18px",
  fontSize: 14,
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 8px 18px rgba(232, 85, 85, 0.24)",
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

const toastBase = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderRadius: 14,
  padding: "14px 18px",
  marginBottom: 24,
  gap: 12,
  animation: "fadeUp 0.25s ease both",
};

const toastErrorStyle = {
  ...toastBase,
  background: "var(--rojo-chip)",
  border: "1.5px solid var(--rojo-borde)",
  boxShadow: "0 10px 24px rgba(232, 85, 85, 0.1)",
};

const toastSuccessStyle = {
  ...toastBase,
  background: "var(--verde-chip)",
  border: "1.5px solid var(--verde-borde)",
  boxShadow: "0 10px 24px rgba(52, 211, 153, 0.1)",
};

const toastLeftStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flex: 1,
};

const toastTextStyle = {
  fontSize: 14,
  fontWeight: 700,
  lineHeight: 1.45,
};

const toastCloseBtnStyle = {
  width: 28,
  height: 28,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  border: "none",
  color: "var(--gris-texto)",
  fontSize: 14,
  cursor: "pointer",
  flexShrink: 0,
  padding: 0,
  borderRadius: 8,
};