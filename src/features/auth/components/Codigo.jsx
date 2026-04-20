import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_SESSION_TOKEN_KEY } from "../services/sessionService";

const API = process.env.REACT_APP_API_URL;

export default function ModalIngresarCodigo() {
  const [codigo, setCodigo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleEnviar = async () => {
    const correo = sessionStorage.getItem("correo_recuperacion");
    if (!correo) return setError("Primero ingresa tu correo.");
    if (codigo.trim().length !== 6) return setError("El código debe tener 6 caracteres.");

    try {
      setCargando(true);
      setError("");
      const baseSessionToken = sessionStorage.getItem(BASE_SESSION_TOKEN_KEY);

      const res = await fetch(`${API}/recuperacion/activar`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, codigo, session_token: baseSessionToken }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Código inválido");

      sessionStorage.setItem("codigo_recuperacion", codigo.toUpperCase());
      navigate("/auth/cambiar-contraseña");
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  const handleClose = () => navigate("/auth/login");
  const handleSalir = () => navigate(-1);

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button style={styles.closeBtn} onClick={handleClose}>&#x2715;</button>

        <h2 style={styles.titulo}>Código de Recuperación</h2>

        <p style={styles.descripcion}>
          Ingresa el código de 6 caracteres que recibiste en tu correo.
        </p>

        <label style={styles.label}>Ingresar código</label>
        <input
          type="text"
          placeholder="A1B2C3"
          maxLength={6}
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          style={styles.input}
        />

        {error ? <p style={{ color: "var(--rojo-soft)", fontSize: "13px", marginTop: "10px", fontFamily: "var(--font)" }}>{error}</p> : null}

        <button style={styles.btnEnviar} onClick={handleEnviar} disabled={cargando}>
          {cargando ? "Validando..." : "Enviar código"}
        </button>

        <button style={styles.btnSalir} onClick={handleSalir}>
          Volver al anterior
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "var(--fondo)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "var(--blanco)",
    borderRadius: "12px",
    padding: "2rem 1.75rem",
    width: "100%",
    maxWidth: "380px",
    position: "relative",
    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
    fontFamily: "var(--font)",
  },
  closeBtn: {
    position: "absolute",
    top: "12px",
    right: "14px",
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "var(--gris-texto)",
  },
  titulo: {
    fontSize: "20px",
    fontWeight: "600",
    color: "var(--azul)",
    margin: "0 0 8px",
    textAlign: "center",
  },
  descripcion: {
    fontSize: "14px",
    color: "var(--gris-texto)",
    margin: "0 0 1.5rem",
    lineHeight: "1.5",
  },
  label: {
    fontSize: "13px",
    color: "var(--gris-oscuro)",
    display: "block",
    marginBottom: "6px",
    fontWeight: "500",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    fontSize: "22px",
    letterSpacing: "6px",
    textAlign: "center",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1.5px solid var(--gris-borde)",
    outline: "none",
    color: "var(--negro-texto)",
    fontFamily: "var(--mono)",
  },
  btnEnviar: {
    marginTop: "1.25rem",
    width: "100%",
    padding: "11px",
    backgroundColor: "var(--azul)",
    color: "var(--blanco)",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "var(--font)",
  },
  btnSalir: {
    marginTop: "0.75rem",
    width: "100%",
    padding: "11px",
    backgroundColor: "var(--rojo-soft)",
    color: "var(--blanco)",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "var(--font)",
  },
};