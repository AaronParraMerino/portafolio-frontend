import { useState } from "react";

export default function PoliticaPrivacidad({ onClose }) {
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
          <span style={styles.headerBarTitle}>Política de Privacidad</span>
          <button onClick={handleClose} style={styles.closeBtn} aria-label="Cerrar">×</button>
        </div>

        <div style={styles.body}>
          <div style={styles.titleRow}>
            <span style={styles.shieldIcon}>🛡️</span>
            <h1 style={styles.mainTitle}>POLÍTICA DE PRIVACIDAD</h1>
          </div>

          <p style={styles.date}>Fecha de entrada en vigor: 23 de marzo de 2026</p>

          <h2 style={styles.sectionTitle}>Tu privacidad es lo primero</h2>
          <p style={styles.p}>
            El objetivo del sistema es permitir a los usuarios crear y gestionar un portafolio digital de proyectos
            de software, con el fin de organizar y presentar su experiencia, habilidades, logros y evidencia
            profesional en un entorno web.
          </p>
          <p style={styles.p}>
            La base de esta misión es nuestro compromiso de transparencia acerca de los datos que recopilamos sobre
            ti, el modo en que se utilizan y con quién se comparten.
          </p>
          <p style={styles.p}>
            Esta Política de privacidad se aplica cuando utilizas nuestro sistema (descrito anteriormente).
            Ofrecemos a nuestros usuarios distintas opciones acerca de los datos que recopilamos, utilizamos y
            compartimos, según se describe en esta Política de privacidad, así como en los ajustes disponibles
            dentro del sistema.
          </p>

          <h2 style={styles.sectionTitle}>1. Introducción:</h2>
          <p style={styles.p}>
            Somos una plataforma en línea orientada a profesionales que permite crear y gestionar portafolios
            digitales de proyectos de software. Los usuarios utilizan nuestros servicios para organizar y mostrar
            su experiencia, habilidades, logros y trayectoria profesional, así como para acceder a información
            relevante y fortalecer su perfil profesional.
          </p>
          <p style={styles.p}>
            Nuestra Política de privacidad se aplica a cualquier usuario que acceda o utilice el sistema, ya sea
            como usuario registrado («Miembro») o como visitante («Visitante»).
          </p>
          <p style={styles.p}>
            Los usuarios registrados («Miembros») pueden crear su identidad profesional mediante la gestión de su
            portafolio, donde integran proyectos, habilidades técnicas y blandas, experiencia académica y laboral,
            así como enlaces a redes profesionales. Además, pueden publicar y compartir contenido relevante que
            refleje su desarrollo y capacidades.
          </p>
          <p style={styles.p}>
            Parte del contenido disponible en el sistema puede ser accesible para personas que no estén registradas
            («Visitantes»), dependiendo de la configuración de visibilidad definida por cada usuario.
          </p>

          <h2 style={styles.sectionTitle}>2. Datos que recopilamos:</h2>
          <p style={styles.p}>
            Nos proporcionas datos para crear y gestionar tu cuenta dentro del sistema generador de portafolios digitales.
          </p>

          <div style={styles.itemBlock}>
            <span style={styles.itemIcon}></span>
            <div>
              <strong>Registro:</strong> Para crear una cuenta, debes proporcionarnos información básica como tu
              nombre, correo electrónico y una contraseña. Estos datos permiten identificarte dentro del sistema y
              garantizar el acceso seguro a tu portafolio.
            </div>
          </div>

          <div style={styles.itemBlock}>
            <span style={styles.itemIcon}></span>
            <div>
              <strong>Perfil Profesional:</strong> Puedes crear y completar tu perfil profesional dentro del sistema. Este perfil puede incluir información como:
              <ul style={styles.ul}>
                <li>Profesión y biografía</li>
                <li>Experiencia académica y laboral</li>
                <li>Habilidades técnicas y blandas (incluyendo nivel de dominio)</li>
                <li>Logros y capacidades desarrolladas</li>
              </ul>
              No es obligatorio completar todos los campos; sin embargo, un perfil más completo permite una mejor
              organización y presentación de tu portafolio digital.
            </div>
          </div>

          <div style={styles.itemBlock}>
            <span style={styles.itemIcon}></span>
            <div>
              <strong>Gestión de Proyectos:</strong> Recopilamos la información que proporcionas al gestionar tu portafolio, como:
              <ul style={styles.ul}>
                <li>Proyectos de software en los que has participado</li>
                <li>Descripción de proyectos y evidencias digitales</li>
                <li>Enlaces relacionados (por ejemplo, repositorios o demostraciones)</li>
              </ul>
            </div>
          </div>

          <div style={styles.itemBlock}>
            <span style={styles.itemIcon}></span>
            <div>
              <strong>Integración con Redes Profesionales:</strong> Puedes agregar enlaces a perfiles externos,
              como redes profesionales o repositorios de código.
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
              <strong>Publicación de Información:</strong> El sistema te permite seleccionar qué información deseas
              publicar dentro de tu portafolio.
            </div>
          </div>

          <p style={styles.p}>
            No es obligatorio proporcionar toda la información; sin embargo, la ausencia de ciertos datos puede
            limitar la funcionalidad del sistema.
          </p>

          <h2 style={styles.sectionTitle}>3. Información de Contacto:</h2>
          <p style={styles.p}>
            Puedes contactarnos o utilizar las opciones disponibles dentro del sistema para resolver cualquier
            duda, consulta o inconveniente relacionado con esta Política de privacidad.
          </p>

          <div style={styles.contactBlock}>
            <div style={styles.contactItem}>
              <span></span>
              <a href="https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&to=sparkyhub.team@gmail.com" target="_blank" rel="noopener noreferrer" style={styles.contactLink}>
                Correo Electronico: sparkyhub.team@gmail.com
              </a>
            </div>
            <div style={styles.contactItem}>
              <span></span>
              <a href="https://wa.me/59160726822" target="_blank" rel="noopener noreferrer" style={styles.contactLink}>
                Número de teléfono: 60726822
              </a>
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <button onClick={handleAccept} style={styles.btnPrimary}>Aceptar</button>
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