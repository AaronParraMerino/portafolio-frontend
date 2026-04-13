import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_SESSION_TOKEN_KEY } from "../services/sessionService";

const API = process.env.REACT_APP_API_URL;

export default function RecuperacionAcceso() {
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
      if (!res.ok) throw new Error(data.message || "Error al solicitar recuperación");

      sessionStorage.setItem("correo_recuperacion", email);
      setMsg(data.message || "Correo enviado");
      navigate("/auth/Codigo");
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f0f4f8", fontFamily: "sans-serif" }}>
      <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "40px 36px", width: "100%", maxWidth: "400px", boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "600", color: "#3b82f6", marginBottom: "10px", textAlign: "center" }}>
          Recuperación de Contraseña
        </h1>

        <p style={{ fontSize: "14px", color: "#555", marginBottom: "24px", lineHeight: "1.5" }}>
          Te enviaremos un código al correo para recuperar tu cuenta.
        </p>

        <label htmlFor="email" style={{ fontSize: "13px", fontWeight: "500", color: "#333", display: "block", marginBottom: "6px" }}>
          Correo Electrónico
        </label>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ejemplo@gmail.com"
          style={{ width: "100%", padding: "10px 12px", fontSize: "14px", border: "1.5px solid #cdd3da", borderRadius: "8px", outline: "none", boxSizing: "border-box", marginBottom: "20px" }}
        />

        {msg ? <p style={{ color: "#16a34a", fontSize: "13px" }}>{msg}</p> : null}
        {error ? <p style={{ color: "#dc2626", fontSize: "13px" }}>{error}</p> : null}

        <button
          onClick={handleSubmit}
          disabled={!email || cargando}
          style={{ width: "100%", padding: "12px", backgroundColor: email && !cargando ? "#4c6ef5" : "#a5b4fc", color: "#fff", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "500", cursor: email && !cargando ? "pointer" : "not-allowed" }}
        >
          {cargando ? "Enviando..." : "Enviar código"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/auth/Login")}
          style={{ fontSize: "13px", color: "#4c6ef5", background: "none", border: "none", cursor: "pointer", padding: 0, display: "block", margin: "16px auto 0" }}
        >
          Volver al inicio de sesión
        </button>
      </div>
    </div>
  );
}