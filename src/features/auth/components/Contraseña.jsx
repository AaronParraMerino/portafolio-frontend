import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RecuperacionAcceso() {
  const [email, setEmail] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email) return;
    setCargando(true);
    await new Promise((r) => setTimeout(r, 1000));
    setCargando(false);
    // Redirige al modal de ingresar código
    navigate("/auth/Codigo");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f0f4f8",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "40px 36px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            fontSize: "22px",
            fontWeight: "600",
            color: "#3b82f6",
            marginBottom: "10px",
            textAlign: "center",
          }}
        >
          Recuperación de Contraseña
        </h1>

        <p
          style={{
            fontSize: "14px",
            color: "#555",
            marginBottom: "24px",
            lineHeight: "1.5",
          }}
        >
          Te enviaremos un correo electrónico con un enlace para ingresar a
          tu cuenta.
        </p>

        <label
          htmlFor="email"
          style={{
            fontSize: "13px",
            fontWeight: "500",
            color: "#333",
            display: "block",
            marginBottom: "6px",
          }}
        >
          Correo Electrónico
        </label>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ejemplo@gmail.com"
          style={{
            width: "100%",
            padding: "10px 12px",
            fontSize: "14px",
            border: "1.5px solid #cdd3da",
            borderRadius: "8px",
            outline: "none",
            boxSizing: "border-box",
            marginBottom: "20px",
            color: "#1a1a2e",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#4c6ef5")}
          onBlur={(e) => (e.target.style.borderColor = "#cdd3da")}
        />

        <button
          onClick={handleSubmit}
          disabled={!email || cargando}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: email && !cargando ? "#4c6ef5" : "#a5b4fc",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "500",
            cursor: email && !cargando ? "pointer" : "not-allowed",
            transition: "background-color 0.2s",
          }}
        >
          {cargando ? "Enviando..." : "Enviar correo electrónico"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/auth/Login")}
          style={{
            fontSize: "13px",
            color: "#4c6ef5",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            display: "block",
            margin: "16px auto 0",
          }}
        >
          Volver al inicio de sesión
        </button>
      </div>
    </div>
  );
}