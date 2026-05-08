import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_SESSION_TOKEN_KEY } from "../services/sessionService";

const API = process.env.REACT_APP_API_URL;

export default function CambiarContrasena() {
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

  const handleSubmit = async () => {
    setError("");

    if (!hasLength || !hasUpper || !hasNumber) {
      return setError("La nueva contraseña no cumple los requisitos.");
    }
    if (!matches) {
      return setError("Las contraseñas no coinciden.");
    }

    const correo = sessionStorage.getItem("correo_recuperacion");
    const codigo = sessionStorage.getItem("codigo_recuperacion");

    if (!correo || !codigo) {
      return setError("Sesión de recuperación inválida. Vuelve a iniciar el proceso.");
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
      if (!res.ok) throw new Error(data.message || "No se pudo actualizar la contraseña");

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
    if (redirect) { sessionStorage.removeItem("redirect_after_recovery"); navigate(redirect); }
    else navigate("/auth/login");
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
            <h2 style={{ textAlign: "center", marginBottom: "16px" }}>Cambiar contraseña</h2>

            <input
              type="password"
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              placeholder="Nueva contraseña"
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1.5px solid var(--gris-borde)", marginBottom: "10px", fontFamily: "var(--font)", fontSize: "14px", outline: "none" }}
            />

            <input
              type="password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              placeholder="Confirmar contraseña"
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1.5px solid var(--gris-borde)", marginBottom: "10px", fontFamily: "var(--font)", fontSize: "14px", outline: "none" }}
            />

            <p style={{ fontSize: "12px", color: "var(--gris-texto)", fontFamily: "var(--font)" }}>
              Requisitos: mínimo 6 caracteres, una mayúscula y un número.
            </p>

            {error ? <p style={{ color: "var(--rojo-soft)", fontSize: "13px", fontFamily: "var(--font)" }}>{error}</p> : null}

            <button
              onClick={handleSubmit}
              disabled={cargando}
              style={{ width: "100%", padding: "12px", background: "var(--azul)", color: "var(--blanco)", border: "none", borderRadius: "8px", marginTop: "8px", cursor: "pointer", fontFamily: "var(--font)", fontWeight: "600" }}
            >
              {cargando ? "Actualizando..." : "Actualizar contraseña"}
            </button>
          </>
        ) : (
          <div style={{ textAlign: "center", fontFamily: "var(--font)" }}>
            <h2 style={{ color: "var(--azul)", marginBottom: "10px" }}>Contraseña actualizada</h2>
            <p style={{ color: "var(--gris-texto)", marginBottom: "20px" }}>Tu contraseña fue cambiada exitosamente.</p>
            <button
              onClick={handleLoginRedirect}
              style={{ padding: "11px 32px", background: "var(--azul)", color: "var(--blanco)", border: "none", borderRadius: "8px", cursor: "pointer", fontFamily: "var(--font)", fontWeight: "600" }}
            >
              Ir al login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}