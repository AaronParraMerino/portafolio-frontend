import { useState } from "react";
import { useLanguage } from "../../../core/i18n";

export default function PoliticaPrivacidad({ onClose }) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  // ✅ CAMBIO: ya no redirige, solo cierra el modal
  const handleAccept = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  if (!visible) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.headerBar}>
          <span style={styles.headerBarTitle}>{t("auth.privacy.title")}</span>
          <button onClick={handleClose} style={styles.closeBtn} aria-label={t("actions.close")}>×</button>
        </div>

        <div style={styles.body}>
          <div style={styles.titleRow}>
            <span style={styles.shieldIcon}>🛡️</span>
            <h1 style={styles.mainTitle}>{t("auth.privacy.heading")}</h1>
          </div>

          <p style={styles.date}>{t("auth.policy.effectiveDate")}</p>

          <h2 style={styles.sectionTitle}>{t("auth.privacy.firstTitle")}</h2>
          <p style={styles.p}>{t("auth.privacy.purpose1")}</p>
          <p style={styles.p}>{t("auth.privacy.purpose2")}</p>
          <p style={styles.p}>{t("auth.privacy.purpose3")}</p>

          <h2 style={styles.sectionTitle}>{t("auth.privacy.introductionTitle")}</h2>
          <p style={styles.p}>{t("auth.privacy.introduction1")}</p>
          <p style={styles.p}>{t("auth.privacy.introduction2")}</p>
          <p style={styles.p}>{t("auth.privacy.introduction3")}</p>
          <p style={styles.p}>{t("auth.privacy.introduction4")}</p>

          <h2 style={styles.sectionTitle}>{t("auth.privacy.dataTitle")}</h2>
          <p style={styles.p}>{t("auth.privacy.dataIntro")}</p>

          <div style={styles.itemBlock}>
            <span style={styles.itemIcon}></span>
            <div>
              <strong>{t("auth.privacy.registrationTitle")}</strong> {t("auth.privacy.registrationText")}
            </div>
          </div>

          <div style={styles.itemBlock}>
            <span style={styles.itemIcon}></span>
            <div>
              <strong>{t("auth.privacy.profileTitle")}</strong> {t("auth.privacy.profileText")}
              <ul style={styles.ul}>
                <li>{t("auth.privacy.profileItem1")}</li>
                <li>{t("auth.privacy.profileItem2")}</li>
                <li>{t("auth.privacy.profileItem3")}</li>
                <li>{t("auth.privacy.profileItem4")}</li>
              </ul>
              {t("auth.privacy.profileOptional")}
            </div>
          </div>

          <div style={styles.itemBlock}>
            <span style={styles.itemIcon}></span>
            <div>
              <strong>{t("auth.privacy.projectsTitle")}</strong> {t("auth.privacy.projectsText")}
              <ul style={styles.ul}>
                <li>{t("auth.privacy.projectsItem1")}</li>
                <li>{t("auth.privacy.projectsItem2")}</li>
                <li>{t("auth.privacy.projectsItem3")}</li>
              </ul>
            </div>
          </div>

          <div style={styles.itemBlock}>
            <span style={styles.itemIcon}></span>
            <div>
              <strong>{t("auth.privacy.networksTitle")}</strong> {t("auth.privacy.networksText")}
            </div>
          </div>

          <div style={styles.socialRow}>
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" style={styles.socialLink} title="Facebook">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="#1877F2"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.12 8.44 9.88v-6.99H7.9v-2.89h2.54V9.84c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99C18.34 21.12 22 17 22 12z"/></svg>
            </a>
            <a href="https://www.github.com" target="_blank" rel="noopener noreferrer" style={styles.socialLink} title="GitHub">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="#333"><path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.54 2.87 8.39 6.84 9.75.5.09.68-.22.68-.49v-1.71c-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.85.09-.66.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.38 9.38 0 0 1 12 7.4c.85 0 1.71.12 2.51.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9v2.82c0 .27.18.59.69.49C19.14 20.65 22 16.8 22 12.26 22 6.58 17.52 2 12 2z"/></svg>
            </a>
            <a href="https://wa.me/59160726822" target="_blank" rel="noopener noreferrer" style={styles.socialLink} title="WhatsApp">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="#25D366"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.07L2 22l5.11-1.35A9.96 9.96 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm4.93 13.57c-.2.57-1.17 1.09-1.62 1.15-.43.06-.97.08-1.56-.1-.36-.11-.82-.26-1.4-.51-2.46-1.09-4.06-3.6-4.19-3.77-.13-.17-1.04-1.41-1.04-2.69 0-1.28.66-1.91.9-2.17.23-.26.5-.32.67-.32l.48.01c.15 0 .36-.06.56.44l.77 1.97c.06.16.1.34.02.53-.08.19-.12.31-.24.47l-.36.43c-.12.14-.25.29-.11.57.14.28.63 1.07 1.35 1.73.93.85 1.71 1.11 1.95 1.24.24.12.38.1.52-.06l.5-.6c.14-.17.27-.13.46-.08l1.92.93c.18.09.3.13.34.2.04.1.04.55-.16 1.12z"/></svg>
            </a>
          </div>

          <div style={styles.itemBlock}>
            <span style={styles.itemIcon}></span>
            <div>
              <strong>{t("auth.privacy.publicationTitle")}</strong> {t("auth.privacy.publicationText")}
            </div>
          </div>

          <p style={styles.p}>{t("auth.privacy.optionalData")}</p>

          <h2 style={styles.sectionTitle}>{t("auth.privacy.contactTitle")}</h2>
          <p style={styles.p}>{t("auth.privacy.contactText")}</p>

          <div style={styles.contactBlock}>
            <div style={styles.contactItem}>
              <span></span>
              <a href="https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&to=sparkyhub.team@gmail.com" target="_blank" rel="noopener noreferrer" style={styles.contactLink}>
                {t("auth.privacy.emailLabel")}: sparkyhub.team@gmail.com
              </a>
            </div>
            <div style={styles.contactItem}>
              <span></span>
              <a href="https://wa.me/59160726822" target="_blank" rel="noopener noreferrer" style={styles.contactLink}>
                {t("auth.privacy.phoneLabel")}: 60726822
              </a>
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <button onClick={handleAccept} style={styles.btnPrimary}>{t("actions.accept")}</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem" },
  modal: { background: "var(--blanco)", borderRadius: "12px", border: "0.5px solid var(--gris-borde)", width: "100%", maxWidth: "680px", maxHeight: "88vh", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "var(--font)" },
  headerBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "0.5px solid var(--gris-borde)", background: "var(--fondo)" },
  headerBarTitle: { fontSize: "13px", color: "var(--gris-texto)" },
  closeBtn: { background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--gris-texto)", padding: "0 4px", lineHeight: 1 },
  body: { overflowY: "auto", padding: "24px 28px", flex: 1 },
  titleRow: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", justifyContent: "center" },
  shieldIcon: { fontSize: "30px" },
  mainTitle: { fontSize: "22px", fontWeight: "bold", margin: 0, letterSpacing: "1px", color: "var(--negro-texto)" },
  date: { fontSize: "12px", color: "var(--gris-texto)", margin: "0 0 16px" },
  sectionTitle: { fontSize: "14px", fontWeight: "bold", color: "var(--negro-texto)", margin: "18px 0 6px" },
  p: { fontSize: "13px", color: "var(--gris-oscuro)", lineHeight: 1.7, margin: "0 0 8px" },
  itemBlock: { display: "flex", gap: "10px", margin: "10px 0", fontSize: "13px", color: "var(--gris-oscuro)", lineHeight: 1.7, alignItems: "flex-start" },
  itemIcon: { fontSize: "16px", marginTop: "2px", flexShrink: 0 },
  ul: { margin: "6px 0 6px 18px", padding: 0, fontSize: "13px", color: "var(--gris-oscuro)", lineHeight: 1.7 },
  socialRow: { display: "flex", justifyContent: "center", gap: "28px", margin: "16px 0" },
  socialLink: { display: "flex", alignItems: "center", cursor: "pointer", transition: "opacity 0.2s", opacity: 1 },
  contactBlock: { margin: "8px 0 12px 8px", display: "flex", flexDirection: "column", gap: "6px" },
  contactItem: { display: "flex", gap: "8px", fontSize: "13px", color: "var(--gris-oscuro)", alignItems: "center" },
  contactLink: { color: "var(--azul)", textDecoration: "none", fontSize: "13px" },
  footer: { padding: "12px 24px", borderTop: "0.5px solid var(--gris-borde)", display: "flex", justifyContent: "flex-end", gap: "8px", background: "var(--fondo)" },
  btnPrimary: { padding: "8px 20px", fontSize: "13px", borderRadius: "8px", border: "0.5px solid var(--azul)", background: "var(--azul)", color: "var(--blanco)", cursor: "pointer", fontWeight: "600" },
};
