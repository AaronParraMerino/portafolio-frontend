import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { Link } from "react-router-dom";
import Navbar from "../../../shared/components/layout/Navbar";
import { GoogleLogin } from "@react-oauth/google";



export default function LoginForm() {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const BASE_URL = process.env.REACT_APP_API_URL;
  const [showPassword, setShowPassword] = useState(false);
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleGoogleLogin = async (credentialResponse) => {
  const idToken = credentialResponse?.credential;

    if (!idToken) {
      setError("No se pudo obtener el token de Google");
    return;
    }

    try {
      const response = await fetch(`${BASE_URL}/auth/google`, {
          method: "POST",
          headers: {
          "Content-Type": "application/json",
      },
          body: JSON.stringify({
              id_token: idToken,
          }),
      });
  const result = await response.json();

  if (!response.ok) {
      setError(result.message || "No se pudo iniciar sesión con Google");
        return;
  }

    sessionStorage.setItem("tokenPORT", result.token);
    sessionStorage.setItem("usuario", JSON.stringify(result.data));
    window.location.href = "/";
  } catch (err) {
      setError("Error de conexión. Intente nuevamente.");
  }
};
  const handleLogin = async () => {
    if (!correo && !password) {
      return setError("Por favor llene todos los campos");
    }

    if (!correo) {
      return setError("Debe ingresar el correo electrónico");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return setError("Ingrese un correo válido");
    }

    if (!password) {
      return setError("Debe ingresar la contraseña");
    }

    setError("");

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: correo.trim(),
          password: password.trim(),
        }),
      });

      console.log("Status:", response.status);

      const result = await response.json();

      console.log("Respuesta del servidor:", result);

      if (!response.ok) {
        setError(result.message || "Correo o contraseña incorrectos");
        return;
      }

      //  Guardar token y datos del usuario en sessionStorage
      sessionStorage.setItem("tokenPORT", result.token);
      sessionStorage.setItem("usuario", JSON.stringify(result.data));

      // Redirigir al inicio (ajusta la ruta según tu app)
      window.location.href = "/";

    } catch (err) {
      console.error("Error real:", err.message);
      setError("Error de conexión. Intente nuevamente.");
    }
  };
  return (
    <>
      <Navbar />

      <div className="login-container">
        <div className="login-card">

          {/* IZQUIERDA */}
          <div className="login-left">
            <h2>¡Bienvenido!</h2>
            <img
              src="/img/logo sansimon.png"
              alt="Logo"
              className="logo-img"
            />
          </div>

          {/* DERECHA */}
          <div className="login-right">
            <h1 className="login-title">Inicio de sesión</h1>

            <div className="login-avatar">
              <FaUserCircle size={80} color="#0077b7" />
            </div>

            <form className="login-form">
              <label>Correo Electrónico:</label>
              <input
                type="email"
                placeholder="example@gmail.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />

              <label>Contraseña:</label>
              <div className="password-container">
                <input
                  className="password-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="***********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />

                <span
                  className="eye"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                </span>
              </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}> 
              <Link to="/auth/forgot-password" className="forgot">
                ¿Olvidaste Contraseña?
              </Link>

              <button
                className="btn-primary"
                type="button"
                onClick={handleLogin}
              >
                Iniciar Sesión
              </button>



              {googleClientId ? (
                <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => setError("La autenticación con Google fue cancelada o falló")}
                text="continue_with"
                shape="rectangular"
                width="100%"
                /> 
              ) : (
                <button
                className="btn-google"
                type="button"
                onClick={() => setError("Configura REACT_APP_GOOGLE_CLIENT_ID para usar Google")}
                >
                Continuar con Google
                </button> )
              }
              </div> 

              <p className="register">
                ¿No tienes una cuenta?{" "}
                <span
                  onClick={() =>
                    (window.location.href = "/auth/Register")
                  }
                >
                  Regístrate
                </span>
              </p>
            </form>
          </div>
        </div>

        {/* MODAL ERROR */}
        {error && (
          <div className="modal-overlay">
            <div className="modal-box">
              <button
                className="modal-close"
                onClick={() => setError("")}
              >
                ✖
              </button>
              <h3 className="modal-title">¡Error!</h3>
              <p>{error}</p>
              <button
                className="modal-btn"
                onClick={() => setError("")}
              >
                ACEPTAR
              </button>
            </div>
          </div>
        )}

        <style>{`
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          .login-container {
            min-height: calc(100vh - 60px);
            margin-top: 90px;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #f0f2f5;
            padding: 20px;
          }

          .login-card {
            display: flex;
            width: 780px;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0,0,0,0.15);
          }

          .login-left {
            width: 42%;
            background: linear-gradient(120deg, #004f7c, #0077b7, #38bdf8);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }

          .login-left h2 {
            color: white;
            font-size: 32px;
          }

          .logo-img {
            width: 150px;
            margin-top: 15px;
          }

          .login-right {
            flex: 1;
            background: white;
            padding: 36px;
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .login-title {
            font-size: 24px;
            color: #0077b7;
            margin-bottom: 10px;
          }

          .login-avatar {
            margin-bottom: 15px;
          }

          .login-form {
            width: 100%;
            display: flex;
            flex-direction: column;
          }

          label {
            margin-top: 10px;
            font-size: 13px;
          }

          input {
            padding: 12px 14px;
            margin-top: 5px;
            border: 1.5px solid #ddd;
            border-radius: 10px;
            font-size: 14px;
            outline: none;
            transition: 0.2s;
          }

          input:focus {
            border-color: #0077b7;
            box-shadow: 0 0 0 2px rgba(0,119,183,0.15);
          }

          /* PASSWORD */
          .password-container {
            position: relative;
            display: flex;
            align-items: center;
          }

          .password-input {
            width: 100%;
            padding-right: 40px;
            appearance: none;
          }

          .eye {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            cursor: pointer;
            color: #666;
            z-index: 2;
            background: white;
            padding-left: 5px;
          }

          .eye:hover {
            color: #0077b7;
          }

          /*  ELIMINAR ICONOS DEL NAVEGADOR */
          input::-ms-reveal,
          input::-ms-clear {
            display: none;
          }

          input::-webkit-credentials-auto-fill-button,
          input::-webkit-password-toggle-button {
            display: none !important;
          }

          .forgot {
            margin-top: 8px;
            font-size: 12px;
            color: #3b82f6;
            background: none;
            border: none;
            cursor: pointer;
            padding: 0;
            font: inherit;
          }

          .forgot:hover {
            text-decoration: underline;
          }

          .btn-primary {
            margin-top: 14px;
            padding: 11px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
          }

          .btn-google {
            margin-top: 10px;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 8px;
            display: flex;
            justify-content: center;
            gap: 8px;
            cursor: pointer;
          }

          .btn-google img {
            width: 18px;
          }

          .register {
            margin-top: 12px;
            font-size: 12px;
            text-align: center;
          }

          .register span {
            color: #3b82f6;
            cursor: pointer;
            font-weight: bold;
          }

          /* MODAL */
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
          }

          .modal-box {
            position: relative; 
            background: white;
            padding: 30px 25px 20px;
            border-radius: 10px;
            text-align: center;
          }

          .modal-title {
            color: red;
          }

          .modal-btn {
            margin-top: 10px;
            padding: 10px;
            background: green;
            color: white;
            border: none;
            border-radius: 6px;
          }
           .modal-close { 
           position: absolute;
           top: 10px;
           right: 14px;
           background: none;
           border: none;
           font-size: 18px;
           cursor: pointer;
           color: #333;
           line-height: 1;
           }

           .modal-close:hover {
            color: #000;
           }

          @media (max-width: 600px) {
            .login-card {
              flex-direction: column;
              width: 100%;
            }

            .login-left {
              width: 100%;
              padding: 25px;
            }

            .login-right {
              padding: 25px;
            }
          }
        `}</style>
      </div>
    </>
  );
}