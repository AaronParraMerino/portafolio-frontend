import { useState } from "react";
import { FaUserCircle, FaLock, FaEnvelope, FaWhatsapp, FaCheckSquare, FaArrowLeft, FaTimes } from "react-icons/fa";
import { HiEye, HiEyeOff } from "react-icons/hi";

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const handleClose = () => {
    window.location.href = '/auth/login';
  };

  return (
    <div className="reg-container">
      <div className="reg-card">

        {/* ── Panel izquierdo ── */}
        <div className="reg-left">

          {/* X cerrar */}
          <button className="btn-close" type="button" onClick={handleClose}>
            <FaTimes size={18} />
          </button>

          <h2 className="reg-title">REGISTRARSE</h2>

          <form className="reg-form">

            {/* Nombre */}
            <div className="reg-field">
              <label><FaUserCircle className="reg-icon" /> Nombre</label>
              <input type="text" />
            </div>

            {/* Apellido */}
            <div className="reg-field">
              <label><FaUserCircle className="reg-icon" /> Apellido</label>
              <input type="text" />
            </div>

            {/* Correo */}
            <div className="reg-field">
              <label><FaEnvelope className="reg-icon" /> Correo</label>
              <input type="email" />
            </div>

            {/* Contraseña */}
            <div className="reg-field">
              <label><FaLock className="reg-icon" /> Contraseña</label>
              <div className="input-eye">
                <input type={showPassword ? "text" : "password"} placeholder="" />
                <span onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <HiEye size={16} /> : <HiEyeOff size={16} />}
                </span>
              </div>
            </div>

            {/* Confirmar Contraseña */}
            <div className="reg-field">
              <label><FaLock className="reg-icon" /> Confirmar<br />Contraseña</label>
              <input type="password" placeholder="" />
            </div>

            {/* Recordarme con icono WhatsApp */}
            <div className="reg-field">
              <label><FaWhatsapp className="reg-icon reg-icon-wa" /> Numero de <br />Contacto</label>
              <input type="text" />
            </div>

            {/* Checkbox Recordarme */}
            <div className="reg-check">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={() => setRemember(!remember)}
              />
              <label htmlFor="remember">Recordarme</label>
            </div>

            {/* Términos */}
            <p className="reg-terms">
              Al hacer clic en «Aceptar» Aceptas{" "}
              <a href="#">las Condiciones de Uso</a>, la{" "}
              <a href="#">Política de Privacidad</a> y la{" "}
              <a href="#">Política de Cookies</a>
            </p>

            {/* Botón Aceptar */}
            <button className="btn-accept" type="button">ACEPTAR</button>

            {/* Google */}
            <button className="btn-google" type="button">
              <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" alt="google" />
              Continuar con Google
            </button>

          </form>

        </div>

        {/* ── Panel derecho azul ── */}
        <div className="reg-right">
          <h2>¡Bienvenido de vuelta!</h2>
          <p>¿Ya tienes una cuenta?</p>
          <button className="btn-login" type="button" onClick={handleClose}>
            Iniciar sesión
          </button>
        </div>

      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .reg-container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #f0f2f5;
        }

        /* ── Ventana centrada ── */
        .reg-card {
          display: flex;
          width: 860px;
          min-height: 560px;
          border: 1.5px solid #ccc;
          border-radius: 10px;
          overflow: hidden;
          background: white;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          position: relative;
        }

        /* ── Botón X cerrar ── */
        .btn-close {
          position: absolute;
          top: 14px;
          right: 14px;
          background: transparent;
          border: none;
          cursor: pointer;
          color: #555;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color .2s;
        }

        .btn-close:hover { color: #e53935; }

        /* ── Panel izquierdo ── */
        .reg-left {
          flex: 1;
          padding: 32px 40px 24px;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .reg-title {
          font-size: 22px;
          font-weight: 800;
          text-align: center;
          margin-bottom: 20px;
          color: #111;
        }

        .reg-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* ── Fila label + input ── */
        .reg-field {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .reg-field label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #333;
          min-width: 110px;
          font-weight: 500;
        }

        .reg-icon { color: #555; flex-shrink: 0; }
        .reg-icon-wa { color: #25D366; }

        .reg-field input {
          flex: 1;
          padding: 8px 10px;
          border: 1.5px solid #aaa;
          border-radius: 4px;
          font-size: 13px;
          outline: none;
          transition: border .2s;
        }

        .reg-field input:focus { border-color: #3b82f6; }

        /* ── Input con ojo ── */
        .input-eye {
          flex: 1;
          position: relative;
        }

        .input-eye input {
          width: 100%;
          padding: 8px 34px 8px 10px;
          border: 1.5px solid #aaa;
          border-radius: 4px;
          font-size: 13px;
          outline: none;
        }

        .input-eye span {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          color: #888;
        }

        /* ── Checkbox ── */
        .reg-check {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          margin-top: 2px;
          padding-left: 4px;
        }

        .reg-check input[type="checkbox"] {
          width: 16px;
          height: 16px;
          cursor: pointer;
          flex: none;
          padding: 0;
          border: none;
        }

        /* ── Términos ── */
        .reg-terms {
          font-size: 11.5px;
          color: #555;
          text-align: center;
          line-height: 1.6;
          margin-top: 4px;
        }

        .reg-terms a { color: #3b82f6; text-decoration: none; }

        /* ── Botones ── */
        .btn-accept {
          padding: 11px;
          background: #4caf50;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: .05em;
          transition: background .2s;
        }

        .btn-accept:hover { background: #43a047; }

        .btn-google {
          padding: 10px;
          background: white;
          border: 1.5px solid #ccc;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: background .2s;
        }

        .btn-google:hover { background: #f5f5f5; }
        .btn-google img { width: 18px; }


        /* ── Panel derecho azul ── */
        .reg-right {
          width: 340px;
          background: #7b8fe0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 40px 30px;
          text-align: center;
        }

        .reg-right h2 {
          color: white;
          font-size: 26px;
          font-weight: 800;
          line-height: 1.3;
        }

        .reg-right p {
          color: rgba(255,255,255,0.85);
          font-size: 15px;
        }

        .btn-login {
          padding: 12px 32px;
          background: transparent;
          color: white;
          border: 2px solid white;
          border-radius: 25px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all .2s;
        }

        .btn-login:hover {
          background: white;
          color: #7b8fe0;
        }

        @media (max-width: 640px) {
          .reg-card { flex-direction: column; width: 95%; }
          .reg-right { width: 100%; padding: 30px; }
        }
      `}</style>
    </div>
  );
}