import { useEffect, useState } from "react";
import Navbar from "../../../shared/components/layout/Navbar"; 
import { FaUserCircle, FaLock, FaEnvelope, FaPhone, FaTimes, FaGithub, FaGitlab, FaDiscord } from "react-icons/fa";
import { HiEye, HiEyeOff } from "react-icons/hi";
import PoliticaPrivacidad from "./PoliticasP";
import PoliticaCookies from "./PoliticasC";
import { GoogleLogin } from "@react-oauth/google";
import { BASE_SESSION_TOKEN_KEY } from "../services/sessionService";
import ConfirmModal from "../../../shared/ui/ConfirmModal";

export default function RegisterForm() {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const BASE_URL = process.env.REACT_APP_API_URL;

  const handleOAuthRedirect = (provider) => {
    window.location.href = `${BASE_URL}/auth/${provider}/redirect`;
  };
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showModalPrivacidad, setShowModalPrivacidad] = useState(false);
  const [showModalCookies, setShowModalCookies] = useState(false);

  // Estados de inputs
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [telefono, setTelefono] = useState("");

  // Estado de error
  const [error, setError] = useState("");
  const [errorApellido, setErrorApellido] = useState("");
  const [errorNombre, setErrorNombre] = useState("");
  const [linkConfirm, setLinkConfirm] = useState(null); // { linkToken, correo, provider, verificationMethod }
  const [linkStep, setLinkStep]       = useState("info"); // 'info' | 'verify'
  const [linkCredential, setLinkCredential] = useState("");
  const [linkCredError, setLinkCredError]   = useState("");
  const [linkLoading, setLinkLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("oauth_error");

    if (!oauthError) {
      return;
    }

    const errorMap = {
      unsupported: "Proveedor OAuth no soportado.",
      cancelled: "Inicio de sesión cancelado.",
      invalid: "No se pudo validar la cuenta OAuth.",
      blocked: "Usuario bloqueado.",
      provider_conflict: "Ya existe otra cuenta de ese proveedor vinculada a este correo.",
      already_linked: "Esta cuenta OAuth ya está vinculada a otra cuenta.",
      parse: "No se pudo procesar la autenticación.",
    };

    setError(errorMap[oauthError] || "No se pudo completar la autenticación.");

    params.delete("oauth_error");
    const cleaned = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.replaceState({}, "", cleaned);
  }, []);

   const handleNombre = (e) => {
    const valor = e.target.value;
    const limpio = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, "");
    setNombre(limpio);
    if (valor !== limpio) {
      setErrorNombre("No se permiten números ni caracteres especiales.");
      setTimeout(() => setErrorNombre(""), 2500);
    }
  };
   const handleApellido = (e) => {
    const valor = e.target.value;
    const limpio = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, "");
    setApellido(limpio);
    if (valor !== limpio) {
      setErrorApellido("No se permiten números ni caracteres especiales.");
      setTimeout(() => setErrorApellido(""), 2500);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
  const idToken = credentialResponse?.credential;

    if (!idToken) {
      setError("No se pudo obtener el token de Google");
    return;
    }

    try {
      const baseSessionToken = sessionStorage.getItem(BASE_SESSION_TOKEN_KEY);

      const response = await fetch(`${BASE_URL}/auth/google`, {
          method: "POST",
        credentials: "include",
          headers: {
          "Content-Type": "application/json",
      },
          body: JSON.stringify({
              id_token: idToken,
          session_token: baseSessionToken,
          }),
      });
  const result = await response.json();

  if (!response.ok) {
      setError(result.message || "No se pudo iniciar sesión con Google");
        return;
  }

  if (result.status === "needs_link_confirmation") {
    setLinkConfirm({ linkToken: result.link_token, correo: result.correo, provider: result.provider, verificationMethod: result.verification_method ?? "password" });
    setLinkStep("info");
    return;
  }

    localStorage.setItem("tokenPORT", result.token);
    localStorage.setItem("usuario", JSON.stringify(result.data));
    window.location.href = "/";
  } catch (err) {
      setError("Error de conexión. Intente nuevamente.");
  }
};

  const handleConfirmLink = async () => {
    if (!linkConfirm) return;
    if (!linkCredential.trim()) {
      const isPassword = linkConfirm.verificationMethod === "password";
      setLinkCredError(isPassword ? "Ingresa tu contraseña." : "Ingresa el código de 6 dígitos.");
      return;
    }
    setLinkLoading(true);
    setLinkCredError("");
    try {
      const baseSessionToken = sessionStorage.getItem(BASE_SESSION_TOKEN_KEY);
      const body = { link_token: linkConfirm.linkToken, session_token: baseSessionToken };
      if (linkConfirm.verificationMethod === "password") body.password = linkCredential;
      else body.code = linkCredential;

      const response = await fetch(`${BASE_URL}/auth/confirm-link`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) {
        if (result.status === "wrong_credentials") {
          setLinkCredError(
            linkConfirm.verificationMethod === "password"
              ? "Contraseña incorrecta. Inténtalo de nuevo."
              : "Código incorrecto o expirado."
          );
        } else {
          setLinkConfirm(null);
          setError(result.message || "No se pudo vincular la cuenta.");
        }
        return;
      }
      localStorage.setItem("tokenPORT", result.token);
      localStorage.setItem("usuario", JSON.stringify(result.data));
      window.location.href = "/";
    } catch {
      setLinkConfirm(null);
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setLinkLoading(false);
    }
  };

  const clearLinkConfirm = () => {
    setLinkConfirm(null);
    setLinkStep("info");
    setLinkCredential("");
    setLinkCredError("");
  };

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
      localStorage.setItem("tokenPORT", result.token);
      localStorage.setItem("usuario", JSON.stringify(result.data));
 
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

            <ConfirmModal
              open={!!error}
              title="¡Error!"
              message={error}
              confirmLabel="Aceptar"
              variant="red"
              icon="warning"
              onConfirm={() => setError("")}
              onClose={() => setError("")}
            />

            {/* MODAL VINCULAR — Paso 1: info */}
            {linkConfirm && linkStep === "info" && (
              <ConfirmModal
                open={true}
                title="Cuenta existente detectada"
                message={`Ya existe una cuenta con el correo ${linkConfirm.correo}. ¿Deseas vincular tu cuenta de ${
                  { github: "GitHub", gitlab: "GitLab", discord: "Discord", google: "Google" }[linkConfirm.provider] ?? linkConfirm.provider
                } a esa cuenta?`}
                confirmLabel="Sí, vincular"
                cancelLabel="Cancelar"
                variant="yellow"
                icon="warning"
                onConfirm={() => setLinkStep("verify")}
                onClose={clearLinkConfirm}
              />
            )}

            {/* MODAL VINCULAR — Paso 2: verificar */}
            {linkConfirm && linkStep === "verify" && (() => {
              const isPassword = linkConfirm.verificationMethod === "password";
              return (
                <div style={{
                  position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
                  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
                }}>
                  <div style={{
                    background: "#fff", borderRadius: "12px", padding: "32px 36px",
                    maxWidth: "400px", width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
                  }}>
                    <h3 style={{ margin: "0 0 8px", fontSize: "18px", color: "#111827" }}>Confirmar vinculación</h3>
                    <p style={{ margin: "0 0 20px", color: "#6b7280", fontSize: "14px", lineHeight: 1.5 }}>
                      {isPassword
                        ? `Ingresa la contraseña de la cuenta ${linkConfirm.correo} para confirmar.`
                        : `Ingresa el código de 6 dígitos que enviamos a ${linkConfirm.correo}.`}
                    </p>
                    <input
                      type={isPassword ? "password" : "text"}
                      value={linkCredential}
                      onChange={e => setLinkCredential(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && !linkLoading && handleConfirmLink()}
                      placeholder={isPassword ? "Tu contraseña" : "123456"}
                      maxLength={isPassword ? undefined : 6}
                      autoFocus
                      style={{
                        width: "100%", padding: "10px 14px", fontSize: "16px", boxSizing: "border-box",
                        border: `1.5px solid ${linkCredError ? "#ef4444" : "#d1d5db"}`,
                        borderRadius: "8px", outline: "none",
                        letterSpacing: isPassword ? "normal" : "6px",
                        textAlign: isPassword ? "left" : "center"
                      }}
                    />
                    {linkCredError && <p style={{ color: "#ef4444", fontSize: "13px", margin: "6px 0 0" }}>{linkCredError}</p>}
                    <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                      <button
                        onClick={() => { setLinkStep("info"); setLinkCredential(""); setLinkCredError(""); }}
                        disabled={linkLoading}
                        style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1.5px solid #d1d5db", background: "#fff", color: "#374151", fontSize: "14px", cursor: "pointer" }}
                      >Atrás</button>
                      <button
                        onClick={handleConfirmLink}
                        disabled={linkLoading || !linkCredential}
                        style={{ flex: 2, padding: "10px", borderRadius: "8px", border: "none", background: linkLoading || !linkCredential ? "#93c5fd" : "#2563eb", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: linkLoading || !linkCredential ? "not-allowed" : "pointer" }}
                      >{linkLoading ? "Verificando…" : "Confirmar vinculación"}</button>
                    </div>
                  </div>
                </div>
              );
            })()}

            <form className="reg-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              {/* TODO TU FORM IGUAL (NO TOCADO) */}

            {/* Nombre */}
            <div className="reg-field-wrapper">
            <div className="reg-field">
              <label><FaUserCircle className="reg-icon" /> Nombre</label>
              <input type="text"
              value={nombre}
                onChange={handleNombre} 
                maxLength={30} 
                />
            </div>
            {errorNombre && <p className="reg-field-error">{errorNombre}</p>}
            </div>

            {/* Apellido */}
             <div className="reg-field-wrapper">
            <div className="reg-field">
              <label><FaUserCircle className="reg-icon" /> Apellido</label>
              <input type="text" 
              value={apellido}
                onChange={handleApellido}
                maxLength={30} 
              />
            </div>
             {errorApellido && <p className="reg-field-error">{errorApellido}</p>}
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
              <button type="button" className="reg-terms-link" onClick={() => setShowModalPrivacidad(true)}>
              Política de Privacidad
              </button>
              {" "}y la{" "}
              <button type="button" className="reg-terms-link" onClick={() => setShowModalCookies(true)}>
              Política de Cookies
              </button>
            </p>

            {/* Botón Aceptar */}
            <button 
            className="btn-accept" 
            type="submit">
              ACEPTAR
            </button>

            {/* Google */}
            {googleClientId ? (
              <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => setError("La autenticación con Google fue cancelada o falló")}
              text="continue_with"
              shape="rectangular"
              width="100%"
              auto_select={false}
              useOneTap={false}
            /> 
            ) : (
          <button
            className="btn-google"
            type="button"
            onClick={() => setError("Configura REACT_APP_GOOGLE_CLIENT_ID para usar Google")}
          >
            Continuar con Google
          </button> )}

            <div className="oauth-row">
              <button className="btn-oauth btn-oauth--github" type="button" onClick={() => handleOAuthRedirect("github")}>
                <FaGithub size={18} /><span>GitHub</span>
              </button>
              <button className="btn-oauth btn-oauth--gitlab" type="button" onClick={() => handleOAuthRedirect("gitlab")}>
                <FaGitlab size={18} /><span>GitLab</span>
              </button>
              <button className="btn-oauth btn-oauth--discord" type="button" onClick={() => handleOAuthRedirect("discord")}>
                <FaDiscord size={18} /><span>Discord</span>
              </button>
            </div>
                

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
         
         {/* ── Modales de políticas (el formulario nunca se desmonta) ── */}
        {showModalPrivacidad && (
          <PoliticaPrivacidad onClose={() => setShowModalPrivacidad(false)} />
        )}
        {showModalCookies && (
          <PoliticaCookies onClose={() => setShowModalCookies(false)} />
        )}


      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
 
          /* ── Tamaño base unificado: 13px en todo el formulario ── */
          .reg-container,
          .reg-form,
          .reg-field label,
          .reg-field input,
          .input-eye input,
          .reg-check,
          .reg-check label,
          .reg-terms,
          .reg-terms-link,
          .btn-accept,
          .btn-google,
          .modal-message,
          .modal-btn {
            font-size: 13px;
            font-family: var(--font);
          }
 
          .reg-container {
            min-height: calc(100vh - var(--nav-height));
            display: flex;
            margin-top: var(--nav-height);
            justify-content: center;
            align-items: center;
            background: var(--fondo);
            padding: 16px;
          }
 
          /* OVERLAY */
          .modal-overlay {
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.4);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 999;
          }
 
          /* CAJA */
          .modal-box {
            background: var(--blanco);
            width: 320px;
            border-radius: 10px;
            padding: 20px 20px 24px;
            text-align: center;
            position: relative;
            box-shadow: 0 10px 30px rgba(0,0,0,0.25);
            animation: fadeIn .2s ease;
          }
 
          .modal-close {
            position: absolute;
            top: 10px; right: 12px;
            border: none;
            background: transparent;
            cursor: pointer;
            font-size: 13px;
            color: var(--gris-texto);
          }
 
          .modal-title {
            color: var(--rojo-soft);
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 10px;
          }
 
          .modal-message {
            color: var(--gris-oscuro);
            margin-bottom: 20px;
          }
 
          .modal-btn {
            background: var(--azul);
            color: var(--blanco);
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            width: 100%;
            transition: background .2s;
          }
 
          .modal-btn:hover { background: var(--azul-hover); }
 
          @keyframes fadeIn {
            from { transform: scale(0.9); opacity: 0; }
            to   { transform: scale(1);   opacity: 1; }
          }
 
          .reg-card {
            display: flex;
            flex-direction: row;
            width: 100%;
            max-width: 860px;
            min-height: 560px;
            border: 1.5px solid var(--gris-borde);
            border-radius: 10px;
            overflow: hidden;
            background: var(--blanco);
            box-shadow: 0 8px 32px rgba(0,0,0,0.12);
            position: relative;
          }
 
          .btn-close {
            position: absolute;
            top: 14px; right: 14px;
            background: transparent;
            border: none;
            cursor: pointer;
            color: var(--gris-texto);
            z-index: 10;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color .2s;
          }
 
          .btn-close:hover { color: var(--rojo-soft); }
 
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
            color: var(--azul);
          }
 
          .reg-form {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
 
          .reg-field {
            display: flex;
            align-items: center;
            gap: 8px;
            width: 100%;
          }
            .reg-field-wrapper {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }
            .reg-field-error {
            font-size: 11px;
            color: var(--rojo-soft);
            padding-left: 108px;
            animation: fadeIn .15s ease;
          }
 
          .reg-field label {
            display: flex;
            align-items: center;
            gap: 5px;
            color: var(--gris-oscuro);
            width: 100px;
            min-width: 100px;
            font-weight: 500;
            flex-shrink: 0;
          }
 
          .reg-icon { color: var(--gris-texto); flex-shrink: 0; }
 
          .reg-field input {
            flex: 1;
            width: 100%;
            min-width: 0;
            padding: 7px 10px;
            border: 1.5px solid var(--gris-borde);
            border-radius: 4px;
            outline: none;
            transition: border .2s;
            font-family: var(--font);
          }
 
          .reg-field input:focus {
            border-color: var(--azul);
            box-shadow: 0 0 0 2px var(--azul-glow);
          }
 
          .input-eye {
            flex: 1;
            position: relative;
            min-width: 0;
          }
 
          .input-eye input {
            width: 100%;
            padding: 7px 34px 7px 10px;
            border: 1.5px solid var(--gris-borde);
            border-radius: 4px;
            outline: none;
            font-family: var(--font);
          }

          .input-eye input:focus {
            border-color: var(--azul);
            box-shadow: 0 0 0 2px var(--azul-glow);
          }
 
          .input-eye span {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            cursor: pointer;
            color: var(--gris-texto);
          }

          .input-eye span:hover { color: var(--azul); }
 
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
            margin-top: 2px;
            padding-left: 4px;
            color: var(--gris-oscuro);
          }
 
          .reg-check input[type="checkbox"] {
            width: 16px;
            height: 16px;
            cursor: pointer;
            flex: none;
            padding: 0;
            border: none;
            accent-color: var(--verde);
          }
 
          .reg-terms {
            color: var(--gris-texto);
            text-align: center;
            line-height: 1.6;
            margin-top: 4px;
          }
 
          .reg-terms a { color: var(--azul); text-decoration: none; }
 
          .reg-terms-link {
            color: var(--azul);
            background: none;
            border: none;
            cursor: pointer;
            padding: 0;
            font: inherit;
            text-decoration: none;
          }
 
          .reg-terms-link:hover { text-decoration: underline; color: var(--azul-hover); }
 
          .btn-accept {
            padding: 10px;
            background: var(--verde);
            color: var(--blanco);
            border: none;
            border-radius: 6px;
            font-weight: 700;
            cursor: pointer;
            letter-spacing: .05em;
            transition: background .2s;
            width: 100%;
            font-family: var(--font);
          }
 
          .btn-accept:hover { background: var(--verde-hover); }
 
          .btn-google {
            padding: 9px;
            background: var(--blanco);
            border: 1.5px solid var(--gris-borde);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            cursor: pointer;
            font-weight: 500;
            transition: background .2s;
            width: 100%;
            font-family: var(--font);
          }
 
          .btn-google:hover { background: var(--azul-light); }
          .btn-google img { width: 16px; }

          .oauth-row {
            display: flex;
            gap: 8px;
            margin-top: 4px;
          }

          .btn-oauth {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 9px 6px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-family: var(--font);
            font-size: 13px;
            font-weight: 600;
            color: #fff;
            transition: opacity 0.2s, transform 0.1s;
          }

          .btn-oauth:hover { opacity: 0.88; transform: translateY(-1px); }
          .btn-oauth:active { transform: translateY(0); }

          .btn-oauth--github  { background: #24292e; }
          .btn-oauth--gitlab  { background: #fc6d26; }
          .btn-oauth--discord { background: #5865f2; }

          /* ── Panel derecho azul ── */
          .reg-right {
            width: 220px;
            min-width: 220px;
            background: linear-gradient(120deg, var(--azul-deep) 0%, var(--azul) 60%, #38bdf8 100%);
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
            color: var(--blanco);
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
            color: var(--blanco);
            border: 2px solid var(--blanco);
            border-radius: 25px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all .2s;
            white-space: nowrap;
            font-family: var(--font);
          }
 
          .btn-login:hover {
            background: var(--blanco);
            color: var(--azul);
          }
 
          /* ── Responsive celular ── */
          @media (max-width: 540px) {
            /* Tamaño base móvil unificado: 11px */
            .reg-field label,
            .reg-field input,
            .input-eye input,
            .reg-check,
            .reg-check label,
            .reg-terms,
            .reg-terms-link,
            .btn-accept,
            .btn-google,
            .btn-login,
            .reg-right p {
              font-size: 11px;
            }
 
            .reg-container {
              padding: 10px;
              align-items: flex-start;
              padding-top: 16px;
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
 
            .reg-title { font-size: 16px; margin-bottom: 12px; }
            .reg-form  { gap: 7px; }
 
            .reg-field { flex-direction: row; align-items: center; }
 
            .reg-field label {
              width: 80px;
              min-width: 80px;
            }
 
            .reg-field input { padding: 6px 8px; }
            .input-eye input { padding: 6px 28px 6px 8px; }
 
            .reg-right {
              width: 90px;
              min-width: 90px;
              padding: 20px 8px;
              gap: 10px;
            }
 
            .reg-right h2 { font-size: 12px; }
 
            .btn-login  { padding: 7px 10px; border-radius: 20px; }
            .btn-accept { padding: 8px; }
            .btn-google { padding: 7px; }
            .btn-google img { width: 13px; }
            .reg-field-error { padding-left: 88px; }
          }
      `}</style>
    </div>
  </>

);
}