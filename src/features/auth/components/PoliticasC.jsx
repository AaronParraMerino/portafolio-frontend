import { useState } from "react";
import { aceptarCookiesYGuardarHardware } from "../services/sessionService";

const cookieTypes = [
  {
    tipo: "Cookies",
    descripcion: (
      <>
        Una cookie es un pequeño archivo que se almacena en tu dispositivo y
        permite el correcto funcionamiento del sistema de portafolios.
        Utilizamos dos tipos de cookies:
        <br /><br />
        <strong>· Cookies de sesión:</strong> se almacenan temporalmente mientras navegas en el sistema.
        <br />
        <strong>· Cookies persistentes:</strong> permanecen en tu dispositivo para recordarte en futuras visitas.
      </>
    ),
  },
  { tipo: "Almacenamiento local", descripcion: "Permite guardar preferencias y configuraciones del usuario directamente en el navegador para mejorar la experiencia." },
  { tipo: "Píxeles", descripcion: "Pequeños fragmentos de código que nos ayudan a medir el rendimiento y la interacción dentro de la plataforma." },
  { tipo: "Almacenamiento local", descripcion: "Este portafolio utiliza almacenamiento local para guardar información directamente en tu dispositivo. Esto permite mejorar tu experiencia al navegar." },
  { tipo: "Otras tecnologías similares", descripcion: "También se pueden emplear tecnologías similares, como identificadores o pequeñas herramientas de seguimiento, con el fin de analizar el uso del sitio." },
];

export default function PoliticaCookies({ onClose }) {
  const [visible, setVisible] = useState(true);

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
          <span style={styles.headerTitle}>Política de Cookies</span>
          <button onClick={handleClose} style={styles.closeBtn} aria-label="Cerrar">×</button>
        </div>

        <div style={styles.body}>
          <div style={styles.titleRow}>
            <span style={styles.cookieIcon}>🍪</span>
            <h1 style={styles.title}>POLITICA DE COOKIES</h1>
          </div>

          <p style={styles.date}>Fecha de entrada en vigor: 23 de marzo de 2026</p>

          <p style={styles.paragraph}>
            En nuestro sistema de portafolios de proyectos de software, creemos que es fundamental ser transparentes
            sobre cómo recopilamos y utilizamos tus datos.
          </p>
          <p style={styles.paragraph}>
            Utilizamos cookies y tecnologías similares para recopilar y utilizar información como parte del
            funcionamiento del sistema.
          </p>
          <p style={styles.paragraph}>
            Al continuar utilizando nuestros servicios, aceptas el uso de cookies conforme a lo descrito en esta Política.
          </p>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: "30%" }}>Tipos de Tecnología</th>
                <th style={styles.th}>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {cookieTypes.map((row, i) => (
                <tr key={i}>
                  <td style={{ ...styles.td, color: "#555" }}>{row.tipo}</td>
                  <td style={styles.td}>{row.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={styles.footer}>
          <button onClick={handleAccept} style={styles.btnPrimary}>Aceptar cookies</button>
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