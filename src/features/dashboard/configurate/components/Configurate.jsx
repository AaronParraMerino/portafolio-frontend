import { useNavigate } from "react-router-dom";
import Header from "../../layout/Header";
import { useLanguage } from "../../../../core/i18n";
import "../styles/configurate.css";

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function ConfigCard({ icon, title, description, danger = false, onClick }) {
  return (
    <button
      type="button"
      className={`cfg-card${danger ? " is-danger" : ""}`}
      onClick={onClick}
    >
      <div className="cfg-card-left">
        <div className="cfg-card-icon">{icon}</div>
        <div className="cfg-card-content">
          <h3 className="cfg-card-title">{title}</h3>
          <p className="cfg-card-text">{description}</p>
        </div>
      </div>
      <span className="cfg-card-arrow">›</span>
    </button>
  );
}

export default function Configurate() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleClick = (route) => {
    navigate(`/dashboard/settings/${route}`);
  };

  return (
    <div className="dash-page">
      <Header
        eyebrow={t("configurate.header.eyebrow")}
        title={t("configurate.header.title")}
        subtitle={t("configurate.header.subtitle")}
      />

      <main className="dash-content dash-content--narrow cfg-settings-content">
        <section className="cfg-settings-panel">
          <div className="cfg-section-label">
            <span>{t("configurate.section.accountManagement")}</span>
          </div>

          <div className="cfg-cards">
            <ConfigCard
              icon={<LinkIcon />}
              title={t("configurate.card.linkAccount.title")}
              description={t("configurate.card.linkAccount.description")}
              onClick={() => handleClick("vincular-cuenta")}
            />
            <ConfigCard
              icon={<LockIcon />}
              title={t("configurate.card.changePassword.title")}
              description={t("configurate.card.changePassword.description")}
              onClick={() => handleClick("cambiar-contraseña")}
            />
            <ConfigCard
              icon={<MonitorIcon />}
              title={t("configurate.card.activeSessions.title")}
              description={t("configurate.card.activeSessions.description")}
              onClick={() => handleClick("sesiones-activas")}
            />
          </div>

          <div className="cfg-section-label is-danger">
            <span>{t("configurate.section.dangerZone")}</span>
          </div>

          <ConfigCard
            danger
            icon={<TrashIcon />}
            title={t("configurate.card.inactiveAccount.title")}
            description={t("configurate.card.inactiveAccount.description")}
            onClick={() => handleClick("eliminar-cuenta")}
          />
        </section>
      </main>
    </div>
  );
}
