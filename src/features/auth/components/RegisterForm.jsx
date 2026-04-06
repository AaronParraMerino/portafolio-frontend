import { useState } from "react";
import Navbar from "../../../shared/components/layout/Navbar"; 
import { FaUserCircle, FaLock, FaEnvelope, FaPhone, FaTimes } from "react-icons/fa";
import { HiEye, HiEyeOff } from "react-icons/hi";

export default function RegisterForm() {
  const BASE_URL = process.env.REACT_APP_API_URL;
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Estados de inputs
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [telefono, setTelefono] = useState("");

  // Estado de error
  const [error, setError] = useState("");

  const handleClose = () => {
    window.location.href = '/auth/login';
  };

  const handleSubmit = async () => {
    // Trim inputs
    const trimmedNombre = nombre.trim();
    const trimmedApellido = apellido.trim();
    const trimmedCorreo = correo.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();
    const trimmedTelefono = telefono.trim();

    if (!trimmedNombre || !trimmedApellido || !trimmedCorreo || !trimmedPassword || !trimmedConfirmPassword || !trimmedTelefono) {
      setError("Por favor llene todos los campos");
      return;
    }

    if (!trimmedCorreo.includes('@') || !trimmedCorreo.includes('.')) {
      setError("Correo inválido");
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (trimmedPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (!acceptedTerms) {
      setError("Debe aceptar los términos y condiciones");
      return;
    }

    setError("");
 // Api para registro del usuario
    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: trimmedNombre,
          apellido: trimmedApellido,
          correo: trimmedCorreo,
          password: trimmedPassword,
          telefono: trimmedTelefono,
        }),
      });
 
      const result = await response.json();
 
      if (!response.ok) {
        setError(result.message || "Error al registrar usuario");
        return;
      }
 
      // Guardar token y datos del usuario desde la respuesta de la API
      sessionStorage.setItem("tokenPORT", result.token);
      sessionStorage.setItem("usuario", JSON.stringify(result.data));
 
      // Redirigir al login
      window.location.href = "/";
    } catch (err) {
      setError("Error de conexión. Intente nuevamente.");
    } 
  };


  return (
    <>
      <Navbar /> {/*  agregado */}

      <div className="reg-container">
        <div className="reg-card">

          {/* ── Panel izquierdo ── */}
          <div className="reg-left">

            <button className="btn-close" type="button" onClick={handleClose}>
              <FaTimes size={18} />
            </button>

            <h2 className="reg-title">REGISTRARSE</h2>

            {error && (
              <div className="modal-overlay">
                <div className="modal-box">
                  <button className="modal-close" onClick={() => setError("")}>
                    <FaTimes />
                  </button>
                  <h3 className="modal-title">¡Error!</h3>
                  <p className="modal-message">{error}</p>
                  <button className="modal-btn" onClick={() => setError("")}>
                    ACEPTAR
                  </button>
                </div>
              </div>
            )}

            <form className="reg-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              {/* TODO TU FORM IGUAL (NO TOCADO) */}

            {/* Nombre */}
            <div className="reg-field">
              <label><FaUserCircle className="reg-icon" /> Nombre</label>
              <input type="text"
              value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={30} 
                />
            </div>

            {/* Apellido */}
            <div className="reg-field">
              <label><FaUserCircle className="reg-icon" /> Apellido</label>
              <input type="text" 
              value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                maxLength={30} 
              />
            </div>

            {/* Correo */}
            <div className="reg-field">
              <label><FaEnvelope className="reg-icon" /> Correo</label>
              <input type="email"
              value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
            </div>

            {/* Contraseña */}
            <div className="reg-field">
              <label><FaLock className="reg-icon" /> Contraseña</label>
              <div className="input-eye">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                  autoComplete="new-password"
                />
                <span onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <HiEye size={16} /> : <HiEyeOff size={16} />}
                </span>
              </div>
            </div>

            {/* Confirmar Contraseña */}
            <div className="reg-field">
              <label><FaLock className="reg-icon" /> Confirmar<br />Contraseña</label>
              <input type="password" placeholder="" autoComplete="new-password" 
              value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {/* Número de Contacto */}
            <div className="reg-field">
              <label><FaPhone className="reg-icon" /> Numero de<br />Contacto</label>
              <input type="tel" 
              value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>

            {/* Checkbox Aceptar Términos */}
            <div className="reg-check">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={() => setAcceptedTerms(!acceptedTerms)}
              />
              <label htmlFor="terms">Acepto los términos y condiciones</label>
            </div>

            {/* Términos */}
            <p className="reg-terms">
              Al hacer clic en «Aceptar» Aceptas{" "}
              <button type="button" className="reg-terms-link" onClick={(e) => e.preventDefault()}>las Condiciones de Uso</button>, la{" "}
              <button type="button" className="reg-terms-link" onClick={(e) => e.preventDefault()}>Política de Privacidad</button> y la{" "}
              <button type="button" className="reg-terms-link" onClick={(e) => e.preventDefault()}>Política de Cookies</button>
            </p>

            {/* Botón Aceptar */}
            <button className="btn-accept" type="submit">ACEPTAR</button>

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
          <img src="/img/logo sansimon.png" alt="Logo San Simón" className="logo-img" />
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
          margin-top: 80px;
          justify-content: center;
          align-items: center;
          background: #f0f2f5;
          padding: 16px;
        }
          /* 🔴 OVERLAY */
        .modal-overlay {
         position: fixed;
         top: 0;
         left: 0;
         width: 100%;
         height: 100%;
         background: rgba(0,0,0,0.4);
         display: flex;
         justify-content: center;
         align-items: center;
         z-index: 999;
        }

         /* 🔴 CAJA */
        .modal-box {
        background: white;
        width: 320px;
        border-radius: 10px;
        padding: 20px 20px 24px;
        text-align: center;
        position: relative;
        box-shadow: 0 10px 30px rgba(0,0,0,0.25);
        animation: fadeIn .2s ease;
        }

        /* ❌ BOTÓN CERRAR */
        .modal-close {
         position: absolute;
         top: 10px;
         right: 12px;
         border: none;
         background: transparent;
         cursor: pointer;
         font-size: 14px;
         color: #777;
         }

           /*  TÍTULO */
           .modal-title {
           color: #e53935;
           font-size: 22px;
           font-weight: bold;
           margin-bottom: 10px;
           }

           /*  MENSAJE de error de modal */
          .modal-message {
           font-size: 14px;
           color: #333;
           margin-bottom: 20px;
           }

           /*  BOTÓN de cierre de modal */
          .modal-btn {
           background: #4caf50;
           color: white;
           border: none;
           padding: 10px 20px;
           border-radius: 6px;
           cursor: pointer;
           font-weight: bold;
           width: 100%;
          }

          .modal-btn:hover {
           background: #43a047;
          }

          /* ✨ ANIMACIÓN */
          @keyframes fadeIn {
           from {
           transform: scale(0.9);
           opacity: 0;
             }
           to {
           transform: scale(1);
           opacity: 1;
          }
        }

        .reg-card {
          display: flex;
          flex-direction: row;
          width: 100%;
          max-width: 860px;
          min-height: 560px;
          border: 1.5px solid #ccc;
          border-radius: 10px;
          overflow: hidden;
          background: white;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          position: relative;
        }

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
          padding: 32px 24px 24px;
          display: flex;
          flex-direction: column;
          position: relative;
          min-width: 0;
        }

        .reg-title {
          font-size: 20px;
          font-weight: 800;
          text-align: center;
          margin-bottom: 16px;
          color: #0077b7;
        }

        .reg-form {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        /* ── Fila label + input ── */
        .reg-field {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
        }

        .reg-field label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: #333;
          width: 100px;
          min-width: 100px;
          font-weight: 500;
          flex-shrink: 0;
        }

        .reg-icon { color: #555; flex-shrink: 0; }

        .reg-field input {
          flex: 1;
          width: 100%;
          min-width: 0;
          padding: 7px 10px;
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
          min-width: 0;
        }

        .input-eye input {
          width: 100%;
          padding: 7px 34px 7px 10px;
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

        /* ── Ocultar ojo nativo del navegador ── */
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear,
        input[type="password"]::-webkit-contacts-auto-fill-button,
        input[type="password"]::-webkit-credentials-auto-fill-button {
          display: none;
        }

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

        .reg-terms {
          font-size: 11px;
          color: #555;
          text-align: center;
          line-height: 1.6;
          margin-top: 4px;
        }

        .reg-terms a { color: #3b82f6; text-decoration: none; }

        .reg-terms-link {
          color: #3b82f6;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font: inherit;
          text-decoration: none;
        }

        .reg-terms-link:hover {
          text-decoration: underline;
        }

        .btn-accept {
          padding: 10px;
          background: #4caf50;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: .05em;
          transition: background .2s;
          width: 100%;
        }

        .btn-accept:hover { background: #43a047; }

        .btn-google {
          padding: 9px;
          background: white;
          border: 1.5px solid #ccc;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: background .2s;
          width: 100%;
        }

        .btn-google:hover { background: #f5f5f5; }
        .btn-google img { width: 16px; }

        /* ── Panel derecho azul ── */
        .reg-right {
          width: 220px;
          min-width: 220px;
          background: linear-gradient(120deg, #004f7c 0%, #0077b7 60%, #38bdf8 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 30px 20px;
          text-align: center;
          flex-shrink: 0;
        }

        .reg-right h2 {
          color: white;
          font-size: 20px;
          font-weight: 800;
          line-height: 1.3;
        }

        .reg-right p {
          color: rgba(255,255,255,0.85);
          font-size: 13px;
        }

        .btn-login {
          padding: 10px 24px;
          background: transparent;
          color: white;
          border: 2px solid white;
          border-radius: 25px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all .2s;
          white-space: nowrap;
        }

        .btn-login:hover {
          background: white;
          color: #7b8fe0;
        }

        /* ── Responsive celular ── */
        @media (max-width: 540px) {
          .reg-container {
            padding: 10px;
            align-items: flex-start;
            padding-top: 20px;
          }

          .reg-card {
            flex-direction: row;
            width: 100%;
            min-height: unset;
            align-items: stretch;
          }

          .reg-left {
            padding: 40px 12px 16px;
            flex: 1;
            min-width: 0;
          }

          .reg-title {
            font-size: 16px;
            margin-bottom: 12px;
          }

          .reg-form {
            gap: 7px;
          }

          .reg-field {
            flex-direction: row;
            align-items: center;
          }

          .reg-field label {
            width: 80px;
            min-width: 80px;
            font-size: 10px;
          }

          .reg-field input {
            font-size: 11px;
            padding: 6px 8px;
          }

          .input-eye input {
            font-size: 11px;
            padding: 6px 28px 6px 8px;
          }

          .reg-right {
            width: 90px;
            min-width: 90px;
            padding: 20px 8px;
            gap: 10px;
          }

          .reg-right h2 {
            font-size: 12px;
          }

          .reg-right p {
            font-size: 10px;
          }

          .btn-login {
            padding: 7px 10px;
            font-size: 10px;
            border-radius: 20px;
          }

          .btn-accept {
            font-size: 11px;
            padding: 8px;
          }

          .btn-google {
            font-size: 10px;
            padding: 7px;
          }

          .btn-google img { width: 13px; }

          .reg-terms {
            font-size: 9px;
          }

          .reg-check {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  </>

);
}