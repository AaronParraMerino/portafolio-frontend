import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../../layout/Header";

export default function Configurate() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [activeCard, setActiveCard] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleClick = (route) => {
    navigate(`/dashboard/settings/${route}`);
  };

  const getCardStyle = (id) => ({
    ...cardStyle,
    borderLeft: "4px solid var(--azul)",
    transform:
      activeCard === id
        ? "scale(0.985)"
        : hoveredCard === id
          ? "translateY(-2px)"
          : "none",
    boxShadow:
      hoveredCard === id
        ? "0 14px 30px rgba(0, 119, 183, 0.16)"
        : "0 10px 24px rgba(17, 24, 39, 0.08)",
    background:
      hoveredCard === id ? "var(--azul-light)" : "var(--blanco)",
    borderColor:
      hoveredCard === id ? "var(--azul-mid)" : "var(--gris-borde)",
  });

  const getDangerCardStyle = (id) => ({
    ...cardStyle,
    border: "1px solid var(--rojo-borde)",
    borderLeft: "4px solid var(--rojo-soft)",
    background:
      activeCard === id || hoveredCard === id
        ? "var(--rojo-chip)"
        : "var(--rojo-bg)",
    boxShadow:
      hoveredCard === id
        ? "0 14px 30px rgba(232, 85, 85, 0.16)"
        : "0 10px 24px rgba(232, 85, 85, 0.08)",
    transform:
      activeCard === id
        ? "scale(0.985)"
        : hoveredCard === id
          ? "translateY(-2px)"
          : "none",
  });

  return (
    <div style={pageStyle}>
      <Header
        eyebrow="CUENTA"
        title="Configuración"
        subtitle="Gestiona ajustes de cuenta, seguridad y accesos."
      />

      <main
        style={{
          ...contentStyle,
          padding: isMobile ? "24px 14px 40px" : "36px 24px 48px",
        }}
      >
        <section style={settingsPanelStyle}>
          <div style={sectionLabelStyle}>
            <span style={labelTextStyle}>Gestión de cuenta</span>
            <div style={dividerStyle} />
          </div>

          <div style={cardsGroupStyle}>
            <button
              style={getCardStyle("vincular")}
              onClick={() => handleClick("vincular-cuenta")}
              onMouseEnter={() => setHoveredCard("vincular")}
              onMouseLeave={() => {
                setHoveredCard(null);
                setActiveCard(null);
              }}
              onMouseDown={() => setActiveCard("vincular")}
              onMouseUp={() => setActiveCard(null)}
              type="button"
            >
              <div style={cardLeftStyle}>
                <div style={iconWrapStyle}>
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--azul)"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                </div>

                <div style={cardContentStyle}>
                  <h3 style={cardTitleStyle}>Vincular cuenta</h3>
                  <p style={cardTextStyle}>
                    Conecta Google, Discord, GitHub y GitLab.
                  </p>
                </div>
              </div>

              <div style={arrowStyle}>›</div>
            </button>

            <button
              style={getCardStyle("password")}
              onClick={() => handleClick("cambiar-contraseña")}
              onMouseEnter={() => setHoveredCard("password")}
              onMouseLeave={() => {
                setHoveredCard(null);
                setActiveCard(null);
              }}
              onMouseDown={() => setActiveCard("password")}
              onMouseUp={() => setActiveCard(null)}
              type="button"
            >
              <div style={cardLeftStyle}>
                <div style={iconWrapStyle}>
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--azul)"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>

                <div style={cardContentStyle}>
                  <h3 style={cardTitleStyle}>Cambiar contraseña</h3>
                  <p style={cardTextStyle}>
                    Actualiza tu contraseña de acceso de forma segura.
                  </p>
                </div>
              </div>

              <div style={arrowStyle}>›</div>
            </button>

            <button
              style={getCardStyle("sesiones")}
              onClick={() => handleClick("sesiones-activas")}
              onMouseEnter={() => setHoveredCard("sesiones")}
              onMouseLeave={() => {
                setHoveredCard(null);
                setActiveCard(null);
              }}
              onMouseDown={() => setActiveCard("sesiones")}
              onMouseUp={() => setActiveCard(null)}
              type="button"
            >
              <div style={cardLeftStyle}>
                <div style={iconWrapStyle}>
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--azul)"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </div>

                <div style={cardContentStyle}>
                  <h3 style={cardTitleStyle}>
                    Cerrar sesión en dispositivos
                  </h3>
                  <p style={cardTextStyle}>
                    Administra sesiones activas en otros dispositivos.
                  </p>
                </div>
              </div>

              <div style={arrowStyle}>›</div>
            </button>
          </div>

          <div style={{ ...sectionLabelStyle, marginTop: 12 }}>
            <span style={{ ...labelTextStyle, color: "var(--rojo-soft)" }}>
              Zona de peligro
            </span>
            <div
              style={{
                ...dividerStyle,
                background: "var(--rojo-borde)",
              }}
            />
          </div>

          <button
            style={getDangerCardStyle("eliminar")}
            onClick={() => handleClick("eliminar-cuenta")}
            onMouseEnter={() => setHoveredCard("eliminar")}
            onMouseLeave={() => {
              setHoveredCard(null);
              setActiveCard(null);
            }}
            onMouseDown={() => setActiveCard("eliminar")}
            onMouseUp={() => setActiveCard(null)}
            type="button"
          >
            <div style={cardLeftStyle}>
              <div style={dangerIconWrapStyle}>
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--rojo-soft)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </div>

              <div style={cardContentStyle}>
                <h3 style={{ ...cardTitleStyle, color: "var(--rojo-soft)" }}>
                  Eliminar cuenta
                </h3>
                <p style={cardTextStyle}>
                  Esta acción es permanente e irreversible.
                </p>
              </div>
            </div>

            <div style={dangerArrowStyle}>›</div>
          </button>
        </section>
      </main>
    </div>
  );
}

const pageStyle = {
  minHeight: "100dvh",
  background: "var(--fondo)",
  color: "var(--negro-texto)",
  fontFamily: "var(--font)",
};

const contentStyle = {
  background: "var(--fondo)",
};

const settingsPanelStyle = {
  maxWidth: 760,
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  gap: 20,
};

const sectionLabelStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
};

const labelTextStyle = {
  fontSize: 15,
  fontWeight: 800,
  color: "var(--negro-texto)",
  letterSpacing: "-0.01em",
  textTransform: "none",
  whiteSpace: "nowrap",
  fontFamily: "var(--font)",
};

const dividerStyle = {
  height: 1,
  flex: 1,
  minWidth: 80,
  background: "var(--azul-mid)",
};

const cardsGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

const cardStyle = {
  width: "100%",
  border: "1px solid var(--gris-borde)",
  background: "var(--blanco)",
  borderRadius: 20,
  padding: "20px 22px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  boxShadow: "0 10px 24px rgba(17, 24, 39, 0.08)",
  cursor: "pointer",
  textAlign: "left",
  transition:
    "transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease, border-color 0.18s ease",
  fontFamily: "var(--font)",
};

const cardLeftStyle = {
  display: "flex",
  alignItems: "center",
  gap: 18,
  minWidth: 0,
};

const cardContentStyle = {
  minWidth: 0,
};

const iconWrapStyle = {
  width: 52,
  height: 52,
  borderRadius: 16,
  background: "var(--azul-light)",
  border: "1px solid var(--azul-mid)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const dangerIconWrapStyle = {
  ...iconWrapStyle,
  background: "var(--rojo-chip)",
  border: "1px solid var(--rojo-borde)",
};

const cardTitleStyle = {
  margin: 0,
  fontSize: 16,
  fontWeight: 800,
  color: "var(--negro-texto)",
  lineHeight: 1.25,
  letterSpacing: "-0.01em",
};

const cardTextStyle = {
  margin: "5px 0 0",
  fontSize: 13.5,
  color: "var(--gris-texto)",
  lineHeight: 1.45,
};

const arrowStyle = {
  width: 34,
  height: 34,
  borderRadius: 12,
  background: "var(--azul)",
  color: "var(--blanco)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 22,
  boxShadow: "0 8px 16px rgba(0, 119, 183, 0.26)",
  flexShrink: 0,
};

const dangerArrowStyle = {
  ...arrowStyle,
  background: "var(--rojo-chip)",
  color: "var(--rojo-soft)",
  boxShadow: "none",
  border: "1px solid var(--rojo-borde)",
};