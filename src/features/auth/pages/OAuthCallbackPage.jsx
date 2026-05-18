import { useEffect, useState } from "react";
import ConfirmModal from "../../../shared/ui/ConfirmModal";
import { getDashboardHomePath } from "../../../shared/utils/authStorage";

const PROVIDER_NAMES = { github: "GitHub", gitlab: "GitLab", discord: "Discord", google: "Google" };

export default function OAuthCallbackPage() {
  const BASE_URL = process.env.REACT_APP_API_URL;
  // linkConfirm: { linkToken, correo, provider, verificationMethod }
  const [linkConfirm, setLinkConfirm] = useState(null);
  // step: 'info' | 'verify'
  const [step, setStep]               = useState("info");
  const [credential, setCredential]   = useState("");
  const [credError, setCredError]     = useState("");
  const [loading, setLoading]         = useState(false);

  useEffect(() => {
    const params      = new URLSearchParams(window.location.search);
    const oauthAction = params.get("oauth_action");

    if (oauthAction === "link_confirm") {
      setLinkConfirm({
        linkToken:          params.get("link_token"),
        correo:             params.get("correo"),
        provider:           params.get("provider"),
        verificationMethod: params.get("verification_method") ?? "password",
      });
      return;
    }

    const token      = params.get("token");
    const usuarioRaw = params.get("usuario");

    if (token && usuarioRaw) {
      try {
        const usuario = JSON.parse(decodeURIComponent(usuarioRaw));
        localStorage.setItem("tokenPORT", token);
        localStorage.setItem("usuario", JSON.stringify(usuario));
        window.location.replace(getDashboardHomePath(usuario));
      } catch {
        window.location.replace("/auth/login?oauth_error=parse");
      }
    } else {
      window.location.replace("/auth/login");
    }
  }, []);

  const handleVerify = async () => {
    if (!credential.trim()) {
      const isPassword = linkConfirm.verificationMethod === "password";
      setCredError(isPassword ? "Ingresa tu contraseña." : "Ingresa el código de 6 dígitos.");
      return;
    }
    setLoading(true);
    setCredError("");
    try {
      const body = { link_token: linkConfirm.linkToken };
      if (linkConfirm.verificationMethod === "password") body.password = credential;
      else body.code = credential;

      const response = await fetch(`${BASE_URL}/auth/confirm-link`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();

      if (!response.ok) {
        if (result.status === "wrong_credentials") {
          setCredError(
            linkConfirm.verificationMethod === "password"
              ? "Contraseña incorrecta. Inténtalo de nuevo."
              : "Código incorrecto o expirado. Inténtalo de nuevo."
          );
        } else {
          setCredError(result.message || "Error al confirmar la vinculación.");
        }
        return;
      }
      localStorage.setItem("tokenPORT", result.token);
      localStorage.setItem("usuario", JSON.stringify(result.data));
      window.location.replace(getDashboardHomePath(result.data));
    } catch {
      setCredError("Error de conexión. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!linkConfirm) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <p>Procesando autenticación…</p>
      </div>
    );
  }

  const providerName = PROVIDER_NAMES[linkConfirm.provider] ?? linkConfirm.provider;
  const isPassword   = linkConfirm.verificationMethod === "password";

  // Paso 1 — Modal informativo
  if (step === "info") {
    return (
      <ConfirmModal
        open={true}
        title="Cuenta existente detectada"
        message={`Ya existe una cuenta con el correo ${linkConfirm.correo}. ¿Deseas vincular tu cuenta de ${providerName} a esa cuenta?`}
        confirmLabel="Sí, vincular"
        cancelLabel="Cancelar"
        variant="yellow"
        icon="warning"
        onConfirm={() => setStep("verify")}
        onClose={() => window.location.replace("/auth/login")}
      />
    );
  }

  // Paso 2 — Formulario de verificación
  return (
    <div style={{
      display: "flex", justifyContent: "center", alignItems: "center",
      minHeight: "100vh", background: "#f3f4f6", padding: "24px"
    }}>
      <div style={{
        background: "#fff", borderRadius: "12px", padding: "36px 40px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.10)", maxWidth: "420px", width: "100%"
      }}>
        <h2 style={{ margin: "0 0 8px", fontSize: "20px", color: "#111827" }}>
          Confirmar vinculación
        </h2>
        <p style={{ margin: "0 0 24px", color: "#6b7280", fontSize: "14px", lineHeight: "1.5" }}>
          {isPassword
            ? `Ingresa la contraseña de la cuenta ${linkConfirm.correo} para confirmar.`
            : `Ingresa el código de 6 dígitos que enviamos a ${linkConfirm.correo}.`
          }
        </p>

        <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", color: "#374151", fontWeight: 600 }}>
          {isPassword ? "Contraseña" : "Código de verificación"}
        </label>
        <input
          type={isPassword ? "password" : "text"}
          value={credential}
          onChange={e => setCredential(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !loading && handleVerify()}
          placeholder={isPassword ? "Tu contraseña" : "123456"}
          maxLength={isPassword ? undefined : 6}
          autoFocus
          style={{
            width: "100%", padding: "10px 14px", fontSize: "16px",
            border: `1.5px solid ${credError ? "#ef4444" : "#d1d5db"}`,
            borderRadius: "8px", outline: "none", boxSizing: "border-box",
            letterSpacing: isPassword ? "normal" : "6px", textAlign: isPassword ? "left" : "center"
          }}
        />
        {credError && (
          <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "6px" }}>{credError}</p>
        )}

        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          <button
            onClick={() => { setStep("info"); setCredential(""); setCredError(""); }}
            disabled={loading}
            style={{
              flex: 1, padding: "10px", borderRadius: "8px", border: "1.5px solid #d1d5db",
              background: "#fff", color: "#374151", fontSize: "15px", cursor: "pointer"
            }}
          >
            Atrás
          </button>
          <button
            onClick={handleVerify}
            disabled={loading || !credential}
            style={{
              flex: 2, padding: "10px", borderRadius: "8px", border: "none",
              background: loading || !credential ? "#93c5fd" : "#2563eb",
              color: "#fff", fontSize: "15px", fontWeight: 600,
              cursor: loading || !credential ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Verificando…" : "Confirmar vinculación"}
          </button>
        </div>
      </div>
    </div>
  );
}

