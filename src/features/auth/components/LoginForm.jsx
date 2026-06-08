import { useEffect, useRef, useState } from "react";
import { FaDiscord, FaGithub, FaGitlab, FaUserCircle } from "react-icons/fa";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { GoogleLogin } from "@react-oauth/google";
import { Link } from "react-router-dom";
import Navbar from "../../../shared/components/layout/Navbar";
import {
  BlockedAccountModal,
  LinkInfoModal,
  LinkVerificationModal,
  LoginErrorModal,
  LoginSuccessModal,
  ReactivationCodeModal,
  ReactivationInfoModal,
} from "./LoginModals";
import {
  buildOAuthRedirectUrl,
  cleanOAuthErrorFromUrl,
  confirmAccountReactivation,
  confirmOauthLink,
  loginWithGoogle,
  loginWithPassword,
  OAUTH_ERROR_MESSAGES,
  persistAuthSession,
  requestAccountReactivation,
  validateLoginFields,
} from "../services/loginAuthService";
import "./LoginForm.css";
import { useLanguage } from "../../../core/i18n";

const INITIAL_LINK_STEP = "info";
const INITIAL_REACTIVATION_STEP = "info";
const CONNECTION_ERROR_KEY = "auth.error.connection";

export default function LoginForm() {
  const { t } = useLanguage();
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const baseUrl = process.env.REACT_APP_API_URL;

  const googleButtonRef = useRef(null);

  const [googleButtonWidth, setGoogleButtonWidth] = useState(320);
  const [showPassword, setShowPassword] = useState(false);
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [blocked, setBlocked] = useState(null);

  const [linkConfirm, setLinkConfirm] = useState(null);
  const [linkStep, setLinkStep] = useState(INITIAL_LINK_STEP);
  const [linkCredential, setLinkCredential] = useState("");
  const [linkCredError, setLinkCredError] = useState("");
  const [linkLoading, setLinkLoading] = useState(false);

  const [reactivate, setReactivate] = useState(null);
  const [reactivationCode, setReactivationCode] = useState("");
  const [reactivationError, setReactivationError] = useState("");
  const [reactivationLoading, setReactivationLoading] = useState(false);

  useEffect(() => {
    const oauthState = cleanOAuthErrorFromUrl();
    if (!oauthState) return;

    if (oauthState.oauthError === "inactive") {
      setReactivate({
        correo: oauthState.correo,
        step: INITIAL_REACTIVATION_STEP,
      });
      return;
    }

    if (oauthState.oauthError === "blocked") {
      setBlocked({
        razon: oauthState.razon || t("auth.error.accountBlockedByAdmin"),
      });
      return;
    }

    setError(
      OAUTH_ERROR_MESSAGES[oauthState.oauthError] ||
        t("auth.error.oauthComplete")
    );
  }, [t]);

  useEffect(() => {
    const element = googleButtonRef.current;
    if (!element) return;

    const updateWidth = () => {
      const width = Math.floor(element.getBoundingClientRect().width);

      /*
        GoogleLogin no maneja bien width="100%" en algunos casos.
        Por eso calculamos un ancho real en pixeles.
      */
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

  const closeError = () => setError("");
  const closeSuccess = () => setSuccess("");
  const closeBlocked = () => setBlocked(null);

  const handleOAuthRedirect = (provider) => {
    window.location.href = buildOAuthRedirectUrl(baseUrl, provider);
  };

  const handleSuccessfulAuth = async (result) => {
    await persistAuthSession(result, baseUrl);
    const returnTo = sessionStorage.getItem("auth:return-to");
    sessionStorage.removeItem("auth:return-to");
    window.location.href = returnTo?.startsWith("/") ? returnTo : "/";
  };

  const handleInactiveAccount = (payload, fallbackEmail = "") => {
    setReactivate({
      correo: payload.correo || fallbackEmail,
      step: INITIAL_REACTIVATION_STEP,
    });
    setError("");
    setSuccess("");
  };

  const handleBlockedAccount = (payload) => {
    setBlocked({
      razon: payload.razon || t("auth.error.accountBlockedByAdmin"),
    });
    setReactivate(null);
    setError("");
    setSuccess("");
  };

  const handleLinkConfirmationRequired = (payload) => {
    setLinkConfirm({
      linkToken: payload.link_token,
      correo: payload.correo,
      provider: payload.provider,
      verificationMethod: payload.verification_method ?? "password",
    });
    setLinkStep(INITIAL_LINK_STEP);
  };

  const resetLinkConfirm = () => {
    setLinkConfirm(null);
    setLinkStep(INITIAL_LINK_STEP);
    setLinkCredential("");
    setLinkCredError("");
  };

  const resetReactivation = () => {
    setReactivate(null);
    setReactivationError("");
    setReactivationCode("");
  };

  const handleGoogleLogin = async (credentialResponse) => {
    const idToken = credentialResponse?.credential;

    if (!idToken) {
      setError(t("auth.error.googleToken"));
      return;
    }

    try {
      const result = await loginWithGoogle(baseUrl, idToken);

      if (result.status === "needs_link_confirmation") {
        handleLinkConfirmationRequired(result);
        return;
      }

      await handleSuccessfulAuth(result);
    } catch (err) {
      const payload = err.payload;

      if (payload?.status === "inactive_account") {
        handleInactiveAccount(payload);
        return;
      }

      if (payload?.status === "blocked_account") {
        handleBlockedAccount(payload);
        return;
      }

      setError(payload?.message || t("auth.error.googleLogin"));
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
      const result = await confirmOauthLink(
        baseUrl,
        linkConfirm,
        linkCredential
      );
      await handleSuccessfulAuth(result);
    } catch (err) {
      const payload = err.payload;

      if (payload?.status === "wrong_credentials") {
        setLinkCredError(
          linkConfirm.verificationMethod === "password"
            ? t("auth.error.wrongPassword")
            : t("auth.error.wrongCode")
        );
        return;
      }

      if (payload?.status === "blocked_account") {
        resetLinkConfirm();
        handleBlockedAccount(payload);
        return;
      }

      resetLinkConfirm();
      setError(payload?.message || t("auth.error.linkAccount"));
    } finally {
      setLinkLoading(false);
    }
  };

  const handleLogin = async () => {
    const validationError = validateLoginFields(correo, password);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setSuccess("");

    try {
      const result = await loginWithPassword(baseUrl, correo, password);
      await handleSuccessfulAuth(result);
    } catch (err) {
      const payload = err.payload;

      if (payload?.status === "inactive_account") {
        handleInactiveAccount(payload, correo.trim());
        return;
      }

      if (payload?.status === "blocked_account") {
        handleBlockedAccount(payload);
        return;
      }

      setError(payload?.message || t("auth.error.invalidCredentials"));
    }
  };

  const startReactivation = async (email = reactivate?.correo) => {
    if (!email) {
      setReactivationError(t("auth.error.noAccountEmail"));
      return;
    }

    setReactivationLoading(true);
    setReactivationError("");

    try {
      await requestAccountReactivation(baseUrl, email);
      setReactivate({ correo: email, step: "code" });
    } catch (err) {
      setReactivationError(
        err.payload?.message || err.message || t(CONNECTION_ERROR_KEY)
      );
    } finally {
      setReactivationLoading(false);
    }
  };

  const confirmReactivation = async () => {
    if (!reactivationCode.trim() || reactivationCode.trim().length !== 6) {
      setReactivationError(t("auth.error.enterSixCharCode"));
      return;
    }

    setReactivationLoading(true);
    setReactivationError("");

    try {
      const result = await confirmAccountReactivation(
        baseUrl,
        reactivate.correo,
        reactivationCode
      );

      setReactivate(null);
      setReactivationCode("");
      setError("");
      setSuccess(
        result.message || t("auth.success.accountRestored")
      );
    } catch (err) {
      setReactivationError(
        err.payload?.message || err.message || t(CONNECTION_ERROR_KEY)
      );
    } finally {
      setReactivationLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="login-container">
        <div className="login-card">
          <div className="login-left">
            <h2>{t("auth.login.welcome")}</h2>
            <img
              src="/img/logo sansimon.png"
              alt="Logo"
              className="logo-img"
            />
          </div>

          <div className="login-right">
            <h1 className="login-title">{t("auth.login.title")}</h1>

            <div className="login-avatar">
              <FaUserCircle size={80} color="#0077b7" />
            </div>

            <form
              className="login-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
            >
              <label htmlFor="correo">{t("auth.field.email")}:</label>
              <input
                id="correo"
                type="email"
                placeholder="example@gmail.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                autoComplete="email"
              />

              <label htmlFor="password">{t("auth.field.password")}:</label>
              <div className="password-container">
                <input
                  id="password"
                  className="password-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="***********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />

                <button
                  className="eye"
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

              <div className="login-actions">
                <Link to="/auth/forgot-password" className="forgot">
                  {t("auth.login.forgotPassword")}
                </Link>

                <button className="login-btn-primary" type="submit">
                  {t("auth.login.submit")}
                </button>

                {googleClientId ? (
                  <div className="google-login-wrapper" ref={googleButtonRef}>
                    <GoogleLogin
                      onSuccess={handleGoogleLogin}
                      onError={() =>
                        setError(
                          t("auth.error.googleCancelled")
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
              </div>

              <p className="register">
                {t("auth.login.noAccount")}{" "}
                <span onClick={() => (window.location.href = "/auth/Register")}>
                  {t("auth.login.registerLink")}
                </span>
              </p>
            </form>
          </div>
        </div>

        <LoginErrorModal message={error} onClose={closeError} />
        <BlockedAccountModal blocked={blocked} onClose={closeBlocked} />
        <LoginSuccessModal message={success} onClose={closeSuccess} />

        {linkConfirm && linkStep === "info" && (
          <LinkInfoModal
            linkConfirm={linkConfirm}
            onConfirm={() => setLinkStep("verify")}
            onClose={resetLinkConfirm}
          />
        )}

        {linkConfirm && linkStep === "verify" && (
          <LinkVerificationModal
            linkConfirm={linkConfirm}
            credential={linkCredential}
            credentialError={linkCredError}
            loading={linkLoading}
            onCredentialChange={setLinkCredential}
            onBack={() => {
              setLinkStep("info");
              setLinkCredential("");
              setLinkCredError("");
            }}
            onConfirm={handleConfirmLink}
          />
        )}

        {reactivate && reactivate.step === "info" && (
          <ReactivationInfoModal
            reactivate={reactivate}
            loading={reactivationLoading}
            onConfirm={() => !reactivationLoading && startReactivation()}
            onClose={resetReactivation}
          />
        )}

        {reactivate && reactivate.step === "code" && (
          <ReactivationCodeModal
            reactivate={reactivate}
            code={reactivationCode}
            error={reactivationError}
            loading={reactivationLoading}
            onCodeChange={setReactivationCode}
            onBack={() => setReactivate({ ...reactivate, step: "info" })}
            onConfirm={confirmReactivation}
          />
        )}
      </div>
    </>
  );
}
