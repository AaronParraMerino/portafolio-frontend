import ConfirmModal from "../../../shared/ui/ConfirmModal";
import { PROVIDER_LABELS } from "../services/loginAuthService";
import { useLanguage } from "../../../core/i18n";

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
  const { t } = useLanguage();
  return (
    <ConfirmModal
      open={!!message}
      title={t("auth.modal.errorTitle")}
      message={message}
      confirmLabel={t("actions.accept")}
      cancelLabel={t("actions.close")}
      variant="red"
      icon="warning"
      onConfirm={onClose}
      onClose={onClose}
    />
  );
}

export function BlockedAccountModal({ blocked, onClose }) {
  const { t } = useLanguage();
  if (!blocked) return null;

  return (
    <ConfirmModal
      open={true}
      title={t("auth.modal.blockedTitle")}
      message={t("auth.modal.blockedMessage", { reason: blocked.razon })}
      confirmLabel={t("actions.accept")}
      cancelLabel={t("actions.close")}
      variant="red"
      icon="warning"
      onConfirm={onClose}
      onClose={onClose}
    />
  );
}

export function LoginSuccessModal({ message, onClose }) {
  const { t } = useLanguage();
  return (
    <ConfirmModal
      open={!!message}
      title={t("auth.modal.restoredTitle")}
      message={message}
      confirmLabel={t("actions.accept")}
      cancelLabel={t("actions.close")}
      variant="green"
      icon="check"
      onConfirm={onClose}
      onClose={onClose}
    />
  );
}

export function LinkInfoModal({ linkConfirm, onConfirm, onClose }) {
  const { t } = useLanguage();
  if (!linkConfirm) return null;

  const provider = PROVIDER_LABELS[linkConfirm.provider] ?? linkConfirm.provider;

  return (
    <ConfirmModal
      open={true}
      title={t("auth.modal.existingTitle")}
      message={t("auth.modal.existingMessage", { email: linkConfirm.correo, provider })}
      confirmLabel={t("auth.action.linkAccount")}
      cancelLabel={t("actions.cancel")}
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
  const { t } = useLanguage();
  if (!linkConfirm) return null;

  const isPassword = linkConfirm.verificationMethod === "password";
  const disabled = loading || !credential;

  return (
    <InlineAuthModal>
      <h3 style={modalTitleStyle}>{t("auth.modal.confirmLinkTitle")}</h3>
      <p style={modalTextStyle}>
        {isPassword
          ? t("auth.modal.confirmPasswordText", { email: linkConfirm.correo })
          : t("auth.modal.confirmCodeText", { email: linkConfirm.correo })}
      </p>
      <input
        type={isPassword ? "password" : "text"}
        value={credential}
        onChange={(e) => onCredentialChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !loading && onConfirm()}
        placeholder={isPassword ? t("auth.placeholder.password") : "123456"}
        maxLength={isPassword ? undefined : 6}
        autoFocus
        style={isPassword ? passwordInputStyle(credentialError) : codeInputStyle(credentialError)}
      />
      {credentialError && <p style={{ color: "#ef4444", fontSize: "13px", margin: "6px 0 0" }}>{credentialError}</p>}
      <div style={modalActionsStyle}>
        <button onClick={onBack} disabled={loading} style={backButtonStyle}>
          {t("actions.back")}
        </button>
        <button onClick={onConfirm} disabled={disabled} style={primaryButtonStyle(disabled)}>
          {loading ? t("auth.status.verifying") : t("auth.action.confirmLink")}
        </button>
      </div>
    </InlineAuthModal>
  );
}

export function ReactivationInfoModal({ reactivate, loading, onConfirm, onClose }) {
  const { t } = useLanguage();
  if (!reactivate) return null;

  return (
    <ConfirmModal
      open={true}
      title={t("auth.modal.inactiveTitle")}
      message={t("auth.modal.inactiveMessage", { email: reactivate.correo })}
      confirmLabel={loading ? t("auth.status.sending") : t("auth.action.sendCode")}
      cancelLabel={t("actions.cancel")}
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
  const { t } = useLanguage();
  if (!reactivate) return null;

  const disabled = loading || code.length !== 6;

  return (
    <InlineAuthModal>
      <h3 style={modalTitleStyle}>{t("auth.modal.restoreAccountTitle")}</h3>
      <p style={modalTextStyle}>
        {t("auth.modal.restoreAccountText", { email: reactivate.correo })}
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
          {t("actions.back")}
        </button>
        <button onClick={onConfirm} disabled={disabled} style={primaryButtonStyle(disabled)}>
          {loading ? t("auth.status.verifying") : t("auth.action.restoreAccount")}
        </button>
      </div>
    </InlineAuthModal>
  );
}
