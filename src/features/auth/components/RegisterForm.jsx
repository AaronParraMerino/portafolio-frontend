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
import PoliticaPrivacidad from "./PoliticasP";
import PoliticaCookies from "./PoliticasC";
import GoogleCredentialButton from "./GoogleCredentialButton";
import { BASE_SESSION_TOKEN_KEY } from "../services/sessionService";
import ConfirmModal from "../../../shared/ui/ConfirmModal";
import "./RegisterForm.css";
import { useLanguage } from "../../../core/i18n";

export default function RegisterForm() {
  const { t } = useLanguage();
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
      unsupported: t("auth.error.oauthUnsupported"),
      cancelled: t("auth.error.oauthCancelled"),
      invalid: t("auth.error.oauthInvalid"),
      blocked: t("auth.error.userBlocked"),
      provider_conflict:
        t("auth.error.providerConflict"),
      already_linked: t("auth.error.alreadyLinked"),
      parse: t("auth.error.oauthParse"),
    };

    setError(errorMap[oauthError] || t("auth.error.oauthComplete"));

    params.delete("oauth_error");

    const cleaned = `${window.location.pathname}${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    window.history.replaceState({}, "", cleaned);
  }, [t]);

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
      setErrorNombre(t("auth.error.onlyLetters"));
      setTimeout(() => setErrorNombre(""), 2500);
    }
  };

  const handleApellido = (e) => {
    const valor = e.target.value;
    const limpio = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, "");

    setApellido(limpio);

    if (valor !== limpio) {
      setErrorApellido(t("auth.error.onlyLetters"));
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
      setError(t("auth.error.googleToken"));
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
        setError(result.message || t("auth.error.googleLogin"));
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
      setError(t("auth.error.connection"));
    }
  };

  const handleConfirmLink = async () => {
    if (!linkConfirm) return;

    if (!linkCredential.trim()) {
      const isPassword = linkConfirm.verificationMethod === "password";
      setLinkCredError(
        isPassword
          ? t("auth.error.enterPassword")
          : t("auth.error.enterSixDigitCode")
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
              ? t("auth.error.wrongPassword")
              : t("auth.error.wrongCode")
          );
        } else {
          setLinkConfirm(null);
          setError(result.message || t("auth.error.linkAccount"));
        }

        return;
      }

      localStorage.setItem("tokenPORT", result.token);
      localStorage.setItem("usuario", JSON.stringify(result.data));
      window.location.href = "/";
    } catch (err) {
      setLinkConfirm(null);
      setError(t("auth.error.connection"));
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
      setError(t("auth.error.requiredFields"));
      return;
    }

    if (!trimmedCorreo.includes("@") || !trimmedCorreo.includes(".")) {
      setError(t("auth.error.invalidEmail"));
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      setError(t("auth.error.passwordMismatch"));
      return;
    }

    if (trimmedPassword.length < 6) {
      setError(t("auth.error.passwordMin"));
      return;
    }

    if (!acceptedTerms) {
      setError(t("auth.error.acceptTerms"));
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
        setError(result.message || t("auth.error.register"));
        return;
      }

      localStorage.setItem("tokenPORT", result.token);
      localStorage.setItem("usuario", JSON.stringify(result.data));

      window.location.href = "/";
    } catch (err) {
      setError(t("auth.error.connection"));
    }
  };

  return (
    <>
      <Navbar />

      <div className="reg-container">
        <div className="reg-card">
          <div className="reg-left">
            <h2 className="reg-title">{t("auth.register.title")}</h2>

            <ConfirmModal
              open={!!error}
              title={t("auth.modal.errorTitle")}
              message={error}
              confirmLabel={t("actions.accept")}
              variant="red"
              icon="warning"
              onConfirm={() => setError("")}
              onClose={() => setError("")}
            />

            {linkConfirm && linkStep === "info" && (
              <ConfirmModal
                open={true}
                title={t("auth.modal.existingTitle")}
                message={t("auth.modal.existingMessage", {
                  email: linkConfirm.correo,
                  provider: getProviderName(linkConfirm.provider),
                })}
                confirmLabel={t("auth.action.linkAccount")}
                cancelLabel={t("actions.cancel")}
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
                        {t("auth.modal.confirmLinkTitle")}
                      </h3>

                      <p className="reg-link-modal-message">
                        {isPassword
                          ? t("auth.modal.confirmPasswordText", { email: linkConfirm.correo })
                          : t("auth.modal.confirmCodeText", { email: linkConfirm.correo })}
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
                        placeholder={isPassword ? t("auth.placeholder.password") : "123456"}
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
                          {t("actions.back")}
                        </button>

                        <button
                          className="reg-link-modal-primary"
                          type="button"
                          onClick={handleConfirmLink}
                          disabled={linkLoading || !linkCredential}
                        >
                          {linkLoading
                            ? t("auth.status.verifying")
                            : t("auth.action.confirmLink")}
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
                    {t("auth.field.firstName")}
                  </label>

                  <input
                    id="nombre"
                    type="text"
                    value={nombre}
                    onChange={handleNombre}
                    maxLength={30}
                    autoComplete="given-name"
                    placeholder={t("auth.placeholder.firstName")}
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
                    {t("auth.field.lastName")}
                  </label>

                  <input
                    id="apellido"
                    type="text"
                    value={apellido}
                    onChange={handleApellido}
                    maxLength={30}
                    autoComplete="family-name"
                    placeholder={t("auth.placeholder.lastName")}
                  />
                </div>

                {errorApellido && (
                  <p className="reg-field-error">{errorApellido}</p>
                )}
              </div>

              <div className="reg-field">
                <label htmlFor="correo">
                  <FaEnvelope className="reg-icon" />
                  {t("auth.field.email")}
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
                  {t("auth.field.password")}
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
                      showPassword ? t("auth.action.hidePassword") : t("auth.action.showPassword")
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
                  {t("auth.field.confirmPassword")}
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
                  {t("auth.field.phone")}
                </label>

                <input
                  id="telefono"
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  autoComplete="tel"
                  placeholder={t("auth.placeholder.phone")}
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
                  {t("auth.register.acceptTerms")}
                </label>
              </div>

              <p className="reg-terms">
                {t("auth.register.acceptPrefix")}{" "}
                <button
                  type="button"
                  className="reg-terms-link"
                  onClick={() => setShowModalPrivacidad(true)}
                >
                  {t("auth.privacy.title")}
                </button>{" "}
                {t("auth.register.andCookie")}{" "}
                <button
                  type="button"
                  className="reg-terms-link"
                  onClick={() => setShowModalCookies(true)}
                >
                  {t("auth.cookies.title")}
                </button>
              </p>

              <button className="btn-accept" type="submit">
                {t("actions.accept")}
              </button>

              {googleClientId ? (
                <div className="reg-google-wrapper" ref={googleButtonRef}>
                  <GoogleCredentialButton
                    onSuccess={handleGoogleLogin}
                    onError={() =>
                      setError(
                        t("auth.error.googleCancelled")
                      )
                    }
                    text="continue_with"
                    shape="rectangular"
                    width={`${googleButtonWidth}`}
                  />
                </div>
              ) : (
                <button
                  className="btn-google"
                  type="button"
                  onClick={() =>
                    setError(
                      t("auth.error.googleConfig")
                    )
                  }
                >
                  {t("auth.action.continueGoogle")}
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
                {t("auth.register.haveAccount")}{" "}
                <button type="button" onClick={handleGoToLogin}>
                  {t("auth.login.submit")}
                </button>
              </p>
            </form>
          </div>

          <div className="reg-right">
            <h2>{t("auth.login.welcome")}</h2>

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
