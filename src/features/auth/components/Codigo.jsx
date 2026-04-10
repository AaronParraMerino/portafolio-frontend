import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ModalIngresarCodigo() {
  const [codigo, setCodigo] = useState("");
  const navigate = useNavigate();

  const handleEnviar = () => {
    if (codigo.trim().length === 0) return;
    navigate("/auth/cambiar-contraseña");
  };

  const handleClose = () => {
    navigate("/auth/login");
  };

  const handleSalir = () => {
    navigate(-1);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>

        {/* Botón cerrar X — redirige a /auth/Login */}
        <button style={styles.closeBtn} onClick={handleClose}>&#x2715;</button>

        {/* Título centrado en azul */}
        <h2 style={styles.titulo}>Codigo de Recuperacion</h2>

        <p style={styles.descripcion}>
          Ingresa el código que recibiste para verificar tu identidad.
        </p>

        {/* Campo código */}
        <label style={styles.label}>Ingresar código</label>
        <input
          type="text"
          placeholder="••••"
          maxLength={4}
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          style={styles.input}
        />

        {/* Botón enviar */}
        <button style={styles.btnEnviar} onClick={handleEnviar}>
          Enviar código
        </button>

        {/* Botón Salir — regresa a página anterior */}
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
    backgroundColor: "#f0f4f8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "2rem 1.75rem",
    width: "100%",
    maxWidth: "380px",
    position: "relative",
    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
  },
  closeBtn: {
    position: "absolute",
    top: "12px",
    right: "14px",
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#6b7280",
    lineHeight: 1,
    padding: "2px 6px",
    borderRadius: "6px",
  },
  titulo: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1a56db",
    margin: "0 0 8px",
    textAlign: "center",   // Título centrado
  },
  descripcion: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "0 0 1.5rem",
    lineHeight: "1.5",
  },
  label: {
    fontSize: "13px",
    color: "#374151",
    display: "block",
    marginBottom: "6px",
    fontWeight: "500",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    fontSize: "22px",
    letterSpacing: "8px",
    textAlign: "center",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    outline: "none",
    color: "#111827",
  },
  btnEnviar: {
    marginTop: "1.25rem",
    width: "100%",
    padding: "11px",
    backgroundColor: "#1a56db",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
  },
  btnSalir: {
    marginTop: "0.75rem",
    width: "100%",
    padding: "11px",
    backgroundColor: "#ef4444",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
  },
};