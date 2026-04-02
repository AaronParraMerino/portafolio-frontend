import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { HiEye, HiEyeOff } from "react-icons/hi";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-container">
      <div className="login-card">

        {/* Panel izquierdo azul */}
        <div className="login-left">
          <h2>¡Bienvenido!</h2>
        </div>

        {/* Panel derecho */}
        <div className="login-right">

          <h1 className="login-title">Inicio de Sesion</h1>
          

          {/* Icono usuario */}
          <div className="login-avatar">
            <FaUserCircle size={80} color="#333" />
          </div>

          {/* Formulario */}
          <form className="login-form">

            {/* Email */}
            <label>Correo Electronico :</label>
            <input type="email" placeholder="example@gmail.com" />

            {/* Password */}
            <label>Contraseña:</label>
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="***********"
              />
              <span className="eye" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <HiEye size={18} /> : <HiEyeOff size={18} />}
              </span>
            </div>

            {/* Olvidaste */}
            <a href="#" className="forgot">Olvidaste Contraseña?</a>

            {/* Botón login */}
            <button className="btn-primary" type="button">
              Iniciar Sesion
            </button>

            {/* Google */}
            <button className="btn-google" type="button">
              <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" alt="google" />
              Continuar con Google
            </button>

            {/* Registro */}
            <p className="register">
              No tienes una cuenta ? <span>Registrate</span>
            </p>
          </form>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #f0f2f5;
        }

        /* ── Ventana centrada ── */
        .login-card {
          display: flex;
          width: 780px;
          min-height: 480px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15);
        }

        /* ── Panel izquierdo ── */
        .login-left {
          width: 42%;
          background: #7b8fe0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 20px 0 0 20px;
        }

        .login-left h2 {
          color: white;
          font-size: 32px;
          font-weight: 800;
        }

        /* ── Panel derecho ── */
        .login-right {
          flex: 1;
          background: white;
          padding: 36px 36px 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .login-title {
          font-size: 24px;
          font-weight: 800;
          color: #111;
          margin-bottom: 8px;
          text-align: center;
        }

        .login-title-line {
          width: 100%;
          height: 3px;
          background: #3b82f6;
          border-radius: 2px;
          margin-bottom: 16px;
        }

        .login-avatar {
          margin-bottom: 16px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          text-align: left;
          width: 100%;
        }

        label {
          margin-top: 10px;
          font-size: 13px;
          font-weight: 500;
          color: #333;
        }

        input {
          padding: 10px 12px;
          margin-top: 5px;
          border: 1.5px solid #ccc;
          border-radius: 8px;
          width: 100%;
          font-size: 14px;
          outline: none;
          transition: border .2s;
        }

        input:focus {
          border-color: #3b82f6;
        }

        .password-container {
          position: relative;
        }

        .password-container input {
          padding-right: 38px;
        }

        .eye {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-20%);
          cursor: pointer;
          color: #999;
          display: flex;
          align-items: center;
        }

        .forgot {
          margin-top: 8px;
          font-size: 12px;
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
        }

        .btn-primary {
          margin-top: 14px;
          padding: 11px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
          width: 100%;
          transition: background .2s;
        }

        .btn-primary:hover { background: #2563eb; }

        .btn-google {
          margin-top: 10px;
          padding: 10px;
          background: white;
          border: 1.5px solid #ccc;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          width: 100%;
          transition: background .2s;
        }

        .btn-google:hover { background: #f5f5f5; }

        .btn-google img { width: 18px; }

        .register {
          margin-top: 12px;
          font-size: 12px;
          text-align: center;
          color: #555;
          font-family: var(--font-mono)
        }

        .register span {
          color: #3b82f6;
          cursor: pointer;
          font-weight: 600;
        }

        @media (max-width: 600px) {
          .login-card { flex-direction: column; width: 95%; }
          .login-left { width: 100%; padding: 30px; border-radius: 20px 20px 0 0; }
        }
      `}</style>
    </div>
  );
}