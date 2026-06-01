import { useState } from "react";
import { aceptarCookiesYGuardarHardware } from "../services/sessionService";
import { useLanguage } from "../../../core/i18n";


export default function PoliticaCookies({ onClose }) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(true);

  const translatedCookieTypes = [
    { tipo: t("auth.cookies.type.cookies"), descripcion: t("auth.cookies.desc.cookies") },
    { tipo: t("auth.cookies.type.localStorage"), descripcion: t("auth.cookies.desc.localStorage") },
    { tipo: t("auth.cookies.type.pixels"), descripcion: t("auth.cookies.desc.pixels") },
    { tipo: t("auth.cookies.type.deviceStorage"), descripcion: t("auth.cookies.desc.deviceStorage") },
    { tipo: t("auth.cookies.type.similar"), descripcion: t("auth.cookies.desc.similar") },
  ];

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  // ✅ CAMBIO: ya no redirige, solo cierra el modal
  const handleAccept = async () => {
  try {
    await aceptarCookiesYGuardarHardware();
  } catch (error) {
    console.error("No se pudo guardar hardware/consentimiento:", error);
  } finally {
    setVisible(false);
    if (onClose) onClose();
  }
};

  if (!visible) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <span style={styles.headerTitle}>{t("auth.cookies.title")}</span>
          <button onClick={handleClose} style={styles.closeBtn} aria-label={t("actions.close")}>×</button>
        </div>

        <div style={styles.body}>
          <div style={styles.titleRow}>
            <span style={styles.cookieIcon}>🍪</span>
            <h1 style={styles.title}>{t("auth.cookies.heading")}</h1>
          </div>

          <p style={styles.date}>{t("auth.policy.effectiveDate")}</p>

          <p style={styles.paragraph}>{t("auth.cookies.paragraph1")}</p>
          <p style={styles.paragraph}>{t("auth.cookies.paragraph2")}</p>
          <p style={styles.paragraph}>{t("auth.cookies.paragraph3")}</p>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: "30%" }}>{t("auth.cookies.technologyTypes")}</th>
                <th style={styles.th}>{t("auth.cookies.description")}</th>
              </tr>
            </thead>
            <tbody>
              {translatedCookieTypes.map((row, i) => (
                <tr key={i}>
                  <td style={{ ...styles.td, color: "#555" }}>{row.tipo}</td>
                  <td style={styles.td}>{row.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={styles.footer}>
          <button onClick={handleAccept} style={styles.btnPrimary}>{t("auth.cookies.accept")}</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem" },
  modal: { background: "var(--blanco)", borderRadius: "12px", border: "0.5px solid var(--gris-borde)", width: "100%", maxWidth: "640px", maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "var(--font)" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "0.5px solid var(--gris-borde)" },
  headerTitle: { fontSize: "14px", color: "var(--gris-texto)" },
  closeBtn: { background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--gris-texto)", padding: "0 4px", lineHeight: 1 },
  body: { overflowY: "auto", padding: "20px 24px", flex: 1 },
  titleRow: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", justifyContent: "center" },
  cookieIcon: { fontSize: "28px" },
  title: { fontSize: "22px", fontWeight: 500, margin: 0, letterSpacing: "1px", color: "var(--negro-texto)" },
  date: { fontSize: "13px", color: "var(--gris-texto)", margin: "0 0 12px" },
  paragraph: { fontSize: "13px", color: "var(--gris-oscuro)", lineHeight: 1.6, margin: "0 0 10px" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "13px", marginTop: "16px" },
  th: { padding: "10px 14px", textAlign: "center", fontWeight: 500, background: "var(--azul-mid)", color: "var(--azul-deep)", border: "0.5px solid var(--azul-mid)" },
  td: { padding: "12px 14px", border: "0.5px solid var(--gris-borde)", verticalAlign: "middle", textAlign: "center", color: "var(--gris-oscuro)", lineHeight: 1.6 },
  footer: { padding: "12px 24px", borderTop: "0.5px solid var(--gris-borde)", display: "flex", justifyContent: "flex-end", gap: "8px" },
  btnPrimary: { padding: "8px 20px", fontSize: "13px", borderRadius: "8px", border: "0.5px solid var(--azul)", background: "var(--azul)", color: "var(--blanco)", cursor: "pointer", fontFamily: "var(--font)", fontWeight: "600" },
};
