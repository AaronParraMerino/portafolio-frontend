import { useEffect, useRef, useState } from "react";
import Navbar from "../../../shared/components/layout/Navbar";
import {
  FaDiscord,
  FaEnvelope,
  FaGithub,
  FaGitlab,
  FaLock,
  FaPhone,
  FaUserCircle,
} from "react-icons/fa";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { GoogleLogin } from "@react-oauth/google";
import PoliticaPrivacidad from "./PoliticasP";
import PoliticaCookies from "./PoliticasC";
import { BASE_SESSION_TOKEN_KEY } from "../services/sessionService";
import ConfirmModal from "../../../shared/ui/ConfirmModal";
import "./RegisterForm.css";

export default function RegisterForm() {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const BASE_URL = process.env.REACT_APP_API_URL;

  const googleButtonRef = useRef(null);

  const [googleButtonWidth, setGoogleButtonWidth] = useState(320);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showModalPrivacidad, setShowModalPrivacidad] = useState(false);
  const [showModalCookies, setShowModalCookies] = useState(false);

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [telefono, setTelefono] = useState("");

  const [error, setError] = useState("");
  const [errorApellido, setErrorApellido] = useState("");
  const [errorNombre, setErrorNombre] = useState("");

  const [linkConfirm, setLinkConfirm] = useState(null);
  const [linkStep, setLinkStep] = useState("info");
  const [linkCredential, setLinkCredential] = useState("");
  const [linkCredError, setLinkCredError] = useState("");
  const [linkLoading, setLinkLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("oauth_error");

    if (!oauthError) return;

    const errorMap = {
      unsupported: "Proveedor OAuth no soportado.",
      cancelled: "Inicio de sesión cancelado.",
      invalid: "No se pudo validar la cuenta OAuth.",
      blocked: "Usuario bloqueado.",
      provider_conflict:
        "Ya existe otra cuenta de ese proveedor vinculada a este correo.",
      already_linked: "Esta cuenta OAuth ya está vinculada a otra cuenta.",
      parse: "No se pudo procesar la autenticación.",
    };

    setError(errorMap[oauthError] || "No se pudo completar la autenticación.");

    params.delete("oauth_error");

    const cleaned = `${window.location.pathname}${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    window.history.replaceState({}, "", cleaned);
  }, []);

  useEffect(() => {
    const element = googleButtonRef.current;
    if (!element) return;

    const updateWidth = () => {
      const width = Math.floor(element.getBoundingClientRect().width);
      setGoogleButtonWidth(Math.max(240, Math.min(width, 360)));
    };

    updateWidth();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateWidth);
      return () => window.removeEventListener("resize", updateWidth);
    }

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, []);

  const handleOAuthRedirect = (provider) => {
    window.location.href = `${BASE_URL}/auth/${provider}/redirect`;
  };

  const handleGoToLogin = () => {
    window.location.href = "/auth/login";
  };

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

  const clearLinkConfirm = () => {
    setLinkConfirm(null);
    setLinkStep("info");
    setLinkCredential("");
    setLinkCredError("");
  };

  const getProviderName = (provider) => {
    const providers = {
      github: "GitHub",
      gitlab: "GitLab",
      discord: "Discord",
      google: "Google",
    };

    return providers[provider] ?? provider;
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
        setLinkConfirm({
          linkToken: result.link_token,
          correo: result.correo,
          provider: result.provider,
          verificationMethod: result.verification_method ?? "password",
        });
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
      setLinkCredError(
        isPassword
          ? "Ingresa tu contraseña."
          : "Ingresa el código de 6 dígitos."
      );
      return;
    }

    setLinkLoading(true);
    setLinkCredError("");

    try {
      const baseSessionToken = sessionStorage.getItem(BASE_SESSION_TOKEN_KEY);

      const body = {
        link_token: linkConfirm.linkToken,
        session_token: baseSessionToken,
      };

      if (linkConfirm.verificationMethod === "password") {
        body.password = linkCredential;
      } else {
        body.code = linkCredential;
      }

      const response = await fetch(`${BASE_URL}/auth/confirm-link`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
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
    } catch (err) {
      setLinkConfirm(null);
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setLinkLoading(false);
    }
  };

  const handleSubmit = async () => {
    const trimmedNombre = nombre.trim();
    const trimmedApellido = apellido.trim();
    const trimmedCorreo = correo.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();
    const trimmedTelefono = telefono.trim();

    if (
      !trimmedNombre ||
      !trimmedApellido ||
      !trimmedCorreo ||
      !trimmedPassword ||
      !trimmedConfirmPassword ||
      !trimmedTelefono
    ) {
      setError("Por favor llene todos los campos");
      return;
    }

    if (!trimmedCorreo.includes("@") || !trimmedCorreo.includes(".")) {
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

      localStorage.setItem("tokenPORT", result.token);
      localStorage.setItem("usuario", JSON.stringify(result.data));

      window.location.href = "/";
    } catch (err) {
      setError("Error de conexión. Intente nuevamente.");
    }
  };

  return (
    <>
      <Navbar />

      <div className="reg-container">
        <div className="reg-card">
          <div className="reg-left">
            <h2 className="reg-title">Crear cuenta</h2>

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

            {linkConfirm && linkStep === "info" && (
              <ConfirmModal
                open={true}
                title="Cuenta existente detectada"
                message={`Ya existe una cuenta con el correo ${
                  linkConfirm.correo
                }. ¿Deseas vincular tu cuenta de ${getProviderName(
                  linkConfirm.provider
                )} a esa cuenta?`}
                confirmLabel="Sí, vincular"
                cancelLabel="Cancelar"
                variant="yellow"
                icon="warning"
                onConfirm={() => setLinkStep("verify")}
                onClose={clearLinkConfirm}
              />
            )}

            {linkConfirm &&
              linkStep === "verify" &&
              (() => {
                const isPassword =
                  linkConfirm.verificationMethod === "password";

                return (
                  <div className="reg-link-modal-overlay">
                    <div className="reg-link-modal-card">
                      <h3 className="reg-link-modal-title">
                        Confirmar vinculación
                      </h3>

                      <p className="reg-link-modal-message">
                        {isPassword
                          ? `Ingresa la contraseña de la cuenta ${linkConfirm.correo} para confirmar.`
                          : `Ingresa el código de 6 dígitos que enviamos a ${linkConfirm.correo}.`}
                      </p>

                      <input
                        className={`reg-link-modal-input ${
                          linkCredError ? "is-error" : ""
                        }`}
                        type={isPassword ? "password" : "text"}
                        value={linkCredential}
                        onChange={(e) => setLinkCredential(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          !linkLoading &&
                          handleConfirmLink()
                        }
                        placeholder={isPassword ? "Tu contraseña" : "123456"}
                        maxLength={isPassword ? undefined : 6}
                        autoFocus
                      />

                      {linkCredError && (
                        <p className="reg-link-modal-error">
                          {linkCredError}
                        </p>
                      )}

                      <div className="reg-link-modal-actions">
                        <button
                          className="reg-link-modal-secondary"
                          type="button"
                          onClick={() => {
                            setLinkStep("info");
                            setLinkCredential("");
                            setLinkCredError("");
                          }}
                          disabled={linkLoading}
                        >
                          Atrás
                        </button>

                        <button
                          className="reg-link-modal-primary"
                          type="button"
                          onClick={handleConfirmLink}
                          disabled={linkLoading || !linkCredential}
                        >
                          {linkLoading
                            ? "Verificando..."
                            : "Confirmar vinculación"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

            <form
              className="reg-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <div className="reg-field-wrapper">
                <div className="reg-field">
                  <label htmlFor="nombre">
                    <FaUserCircle className="reg-icon" />
                    Nombre
                  </label>

                  <input
                    id="nombre"
                    type="text"
                    value={nombre}
                    onChange={handleNombre}
                    maxLength={30}
                    autoComplete="given-name"
                    placeholder="Tu nombre"
                  />
                </div>

                {errorNombre && (
                  <p className="reg-field-error">{errorNombre}</p>
                )}
              </div>

              <div className="reg-field-wrapper">
                <div className="reg-field">
                  <label htmlFor="apellido">
                    <FaUserCircle className="reg-icon" />
                    Apellido
                  </label>

                  <input
                    id="apellido"
                    type="text"
                    value={apellido}
                    onChange={handleApellido}
                    maxLength={30}
                    autoComplete="family-name"
                    placeholder="Tu apellido"
                  />
                </div>

                {errorApellido && (
                  <p className="reg-field-error">{errorApellido}</p>
                )}
              </div>

              <div className="reg-field">
                <label htmlFor="correo">
                  <FaEnvelope className="reg-icon" />
                  Correo
                </label>

                <input
                  id="correo"
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  autoComplete="email"
                  placeholder="example@gmail.com"
                />
              </div>

              <div className="reg-field">
                <label htmlFor="password">
                  <FaLock className="reg-icon" />
                  Contraseña
                </label>

                <div className="input-eye">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="********"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? (
                      <HiEyeOff size={20} />
                    ) : (
                      <HiEye size={20} />
                    )}
                  </button>
                </div>
              </div>

              <div className="reg-field">
                <label htmlFor="confirmPassword">
                  <FaLock className="reg-icon" />
                  Confirmar contraseña
                </label>

                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="********"
                />
              </div>

              <div className="reg-field">
                <label htmlFor="telefono">
                  <FaPhone className="reg-icon" />
                  Número de contacto
                </label>

                <input
                  id="telefono"
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  autoComplete="tel"
                  placeholder="Tu número de contacto"
                />
              </div>

              <div className="reg-check">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={() => setAcceptedTerms((current) => !current)}
                />

                <label htmlFor="terms">
                  Acepto los términos y condiciones
                </label>
              </div>

              <p className="reg-terms">
                Al hacer clic en «Aceptar» aceptas{" "}
                <button
                  type="button"
                  className="reg-terms-link"
                  onClick={() => setShowModalPrivacidad(true)}
                >
                  Política de Privacidad
                </button>{" "}
                y la{" "}
                <button
                  type="button"
                  className="reg-terms-link"
                  onClick={() => setShowModalCookies(true)}
                >
                  Política de Cookies
                </button>
              </p>

              <button className="btn-accept" type="submit">
                Aceptar
              </button>

              {googleClientId ? (
                <div className="reg-google-wrapper" ref={googleButtonRef}>
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() =>
                      setError(
                        "La autenticación con Google fue cancelada o falló"
                      )
                    }
                    text="continue_with"
                    shape="rectangular"
                    width={`${googleButtonWidth}`}
                    auto_select={false}
                    useOneTap={false}
                  />
                </div>
              ) : (
                <button
                  className="btn-google"
                  type="button"
                  onClick={() =>
                    setError(
                      "Configura REACT_APP_GOOGLE_CLIENT_ID para usar Google"
                    )
                  }
                >
                  Continuar con Google
                </button>
              )}

              <div className="oauth-row">
                <button
                  className="btn-oauth btn-oauth--github"
                  type="button"
                  onClick={() => handleOAuthRedirect("github")}
                >
                  <FaGithub size={18} />
                  <span>GitHub</span>
                </button>

                <button
                  className="btn-oauth btn-oauth--gitlab"
                  type="button"
                  onClick={() => handleOAuthRedirect("gitlab")}
                >
                  <FaGitlab size={18} />
                  <span>GitLab</span>
                </button>

                <button
                  className="btn-oauth btn-oauth--discord"
                  type="button"
                  onClick={() => handleOAuthRedirect("discord")}
                >
                  <FaDiscord size={18} />
                  <span>Discord</span>
                </button>
              </div>

              <p className="reg-login-link">
                ¿Ya tienes una cuenta?{" "}
                <button type="button" onClick={handleGoToLogin}>
                  Iniciar sesión
                </button>
              </p>
            </form>
          </div>

          <div className="reg-right">
            <h2>¡Bienvenido!</h2>

            <img
              src="/img/logo sansimon.png"
              alt="Logo San Simón"
              className="logo-img"
            />
          </div>
        </div>

        {showModalPrivacidad && (
          <PoliticaPrivacidad
            onClose={() => setShowModalPrivacidad(false)}
          />
        )}

        {showModalCookies && (
          <PoliticaCookies onClose={() => setShowModalCookies(false)} />
        )}
      </div>
    </>
  );
}