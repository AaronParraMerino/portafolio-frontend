import ConfirmModal from "../../../shared/ui/ConfirmModal";
import { PROVIDER_LABELS } from "../services/loginAuthService";

const modalBackdropStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modalPanelStyle = {
  background: "#fff",
  borderRadius: "12px",
  padding: "32px 36px",
  maxWidth: "400px",
  width: "90%",
  boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
};

const modalTitleStyle = {
  margin: "0 0 8px",
  fontSize: "18px",
  color: "#111827",
};

const modalTextStyle = {
  margin: "0 0 20px",
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: 1.5,
};

const modalActionsStyle = {
  display: "flex",
  gap: "10px",
  marginTop: "20px",
};

const backButtonStyle = {
  flex: 1,
  padding: "10px",
  borderRadius: "8px",
  border: "1.5px solid #d1d5db",
  background: "#fff",
  color: "#374151",
  fontSize: "14px",
  cursor: "pointer",
};

const primaryButtonStyle = (disabled) => ({
  flex: 2,
  padding: "10px",
  borderRadius: "8px",
  border: "none",
  background: disabled ? "#93c5fd" : "#2563eb",
  color: "#fff",
  fontSize: "14px",
  fontWeight: 600,
  cursor: disabled ? "not-allowed" : "pointer",
});

const codeInputStyle = (hasError, fontSize = "16px") => ({
  width: "100%",
  padding: "10px 14px",
  fontSize,
  boxSizing: "border-box",
  border: `1.5px solid ${hasError ? "#ef4444" : "#d1d5db"}`,
  borderRadius: "8px",
  outline: "none",
  letterSpacing: "6px",
  textAlign: "center",
});

const passwordInputStyle = (hasError) => ({
  width: "100%",
  padding: "10px 14px",
  fontSize: "16px",
  boxSizing: "border-box",
  border: `1.5px solid ${hasError ? "#ef4444" : "#d1d5db"}`,
  borderRadius: "8px",
  outline: "none",
});

function InlineAuthModal({ children }) {
  return (
    <div style={modalBackdropStyle}>
      <div style={modalPanelStyle}>{children}</div>
    </div>
  );
}

export function LoginErrorModal({ message, onClose }) {
  return (
    <ConfirmModal
      open={!!message}
      title="Error"
      message={message}
      confirmLabel="Aceptar"
      cancelLabel="Cerrar"
      variant="red"
      icon="warning"
      onConfirm={onClose}
      onClose={onClose}
    />
  );
}

export function BlockedAccountModal({ blocked, onClose }) {
  if (!blocked) return null;

  return (
    <ConfirmModal
      open={true}
      title="Cuenta bloqueada"
      message={`Esta cuenta ha sido bloqueada. Motivo: ${blocked.razon}`}
      confirmLabel="Aceptar"
      cancelLabel="Cerrar"
      variant="red"
      icon="warning"
      onConfirm={onClose}
      onClose={onClose}
    />
  );
}

export function LoginSuccessModal({ message, onClose }) {
  return (
    <ConfirmModal
      open={!!message}
      title="Cuenta restablecida"
      message={message}
      confirmLabel="Aceptar"
      cancelLabel="Cerrar"
      variant="green"
      icon="check"
      onConfirm={onClose}
      onClose={onClose}
    />
  );
}

export function LinkInfoModal({ linkConfirm, onConfirm, onClose }) {
  if (!linkConfirm) return null;

  const provider = PROVIDER_LABELS[linkConfirm.provider] ?? linkConfirm.provider;

  return (
    <ConfirmModal
      open={true}
      title="Cuenta existente detectada"
      message={`Ya existe una cuenta con el correo ${linkConfirm.correo}. Deseas vincular tu cuenta de ${provider} a esa cuenta?`}
      confirmLabel="Si, vincular"
      cancelLabel="Cancelar"
      variant="yellow"
      icon="warning"
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}

export function LinkVerificationModal({
  linkConfirm,
  credential,
  credentialError,
  loading,
  onCredentialChange,
  onBack,
  onConfirm,
}) {
  if (!linkConfirm) return null;

  const isPassword = linkConfirm.verificationMethod === "password";
  const disabled = loading || !credential;

  return (
    <InlineAuthModal>
      <h3 style={modalTitleStyle}>Confirmar vinculacion</h3>
      <p style={modalTextStyle}>
        {isPassword
          ? `Ingresa la contrasena de la cuenta ${linkConfirm.correo} para confirmar.`
          : `Ingresa el codigo de 6 digitos que enviamos a ${linkConfirm.correo}.`}
      </p>
      <input
        type={isPassword ? "password" : "text"}
        value={credential}
        onChange={(e) => onCredentialChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !loading && onConfirm()}
        placeholder={isPassword ? "Tu contrasena" : "123456"}
        maxLength={isPassword ? undefined : 6}
        autoFocus
        style={isPassword ? passwordInputStyle(credentialError) : codeInputStyle(credentialError)}
      />
      {credentialError && <p style={{ color: "#ef4444", fontSize: "13px", margin: "6px 0 0" }}>{credentialError}</p>}
      <div style={modalActionsStyle}>
        <button onClick={onBack} disabled={loading} style={backButtonStyle}>
          Atras
        </button>
        <button onClick={onConfirm} disabled={disabled} style={primaryButtonStyle(disabled)}>
          {loading ? "Verificando..." : "Confirmar vinculacion"}
        </button>
      </div>
    </InlineAuthModal>
  );
}

export function ReactivationInfoModal({ reactivate, loading, onConfirm, onClose }) {
  if (!reactivate) return null;

  return (
    <ConfirmModal
      open={true}
      title="Cuenta inactiva"
      message={`Encontramos una cuenta anterior con el correo ${reactivate.correo}. Deseas restablecerla por codigo de correo?`}
      confirmLabel={loading ? "Enviando..." : "Enviar codigo"}
      cancelLabel="Cancelar"
      variant="yellow"
      icon="warning"
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}

export function ReactivationCodeModal({
  reactivate,
  code,
  error,
  loading,
  onCodeChange,
  onBack,
  onConfirm,
}) {
  if (!reactivate) return null;

  const disabled = loading || code.length !== 6;

  return (
    <InlineAuthModal>
      <h3 style={modalTitleStyle}>Restablecer cuenta</h3>
      <p style={modalTextStyle}>
        Ingresa el codigo de 6 caracteres que enviamos a {reactivate.correo}.
      </p>
      <input
        type="text"
        value={code}
        onChange={(e) => onCodeChange(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === "Enter" && !loading && onConfirm()}
        placeholder="A1B2C3"
        maxLength={6}
        autoFocus
        style={codeInputStyle(error, "20px")}
      />
      {error && <p style={{ color: "#ef4444", fontSize: "13px", margin: "6px 0 0" }}>{error}</p>}
      <div style={modalActionsStyle}>
        <button onClick={onBack} disabled={loading} style={backButtonStyle}>
          Atras
        </button>
        <button onClick={onConfirm} disabled={disabled} style={primaryButtonStyle(disabled)}>
          {loading ? "Verificando..." : "Restablecer cuenta"}
        </button>
      </div>
    </InlineAuthModal>
  );
}
