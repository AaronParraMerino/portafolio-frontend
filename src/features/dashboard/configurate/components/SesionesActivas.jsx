import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  closeOtherSessions,
  closeSessionById,
  fetchMySessions,
} from "../services/ConfigurateServices";

const relativeTime = (dateInput) => {
  if (!dateInput) return "Sin actividad reciente";

  const now = Date.now();
  const date = new Date(dateInput).getTime();

  if (Number.isNaN(date)) return "Sin actividad reciente";

  const diffSeconds = Math.floor((date - now) / 1000);
  const absSeconds = Math.abs(diffSeconds);
  const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

  if (absSeconds < 60) return rtf.format(diffSeconds, "second");
  if (absSeconds < 3600) return rtf.format(Math.round(diffSeconds / 60), "minute");
  if (absSeconds < 86400) return rtf.format(Math.round(diffSeconds / 3600), "hour");

  return rtf.format(Math.round(diffSeconds / 86400), "day");
};

const toUiSession = (item) => {
  const browser =
    [item.navegador_nombre, item.navegador_version].filter(Boolean).join(" ") ||
    "Navegador desconocido";

  const location =
    [item.pais_codigo, item.ip_address].filter(Boolean).join(" · ") ||
    "Ubicación no disponible";

  return {
    id: item.id_rastreo_interno,
    os: item.sistema_operativo || "Sistema desconocido",
    browser,
    location,
    time: relativeTime(item.ultima_actividad),
    current: Boolean(item.is_current),
    icon: item.es_movil ? "mobile" : "desktop",
  };
};

export default function SesionesActivas() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyIds, setBusyIds] = useState([]);
  const [closingAll, setClosingAll] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/dashboard/settings");
  };

  const loadSessions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchMySessions();
      setSessions(data.map(toUiSession));
    } catch (err) {
      setError(err.message || "No se pudieron cargar las sesiones");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleClose = async (id) => {
    setBusyIds((prev) => [...prev, id]);
    setError("");

    try {
      await closeSessionById(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err.message || "No se pudo cerrar la sesión");
    } finally {
      setBusyIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleCloseAll = async () => {
    setClosingAll(true);
    setError("");

    try {
      await closeOtherSessions();
      await loadSessions();
    } catch (err) {
      setError(err.message || "No se pudieron cerrar las demás sesiones");
    } finally {
      setClosingAll(false);
    }
  };

  return (
    <div style={pageStyle}>
      <main
        style={{
          ...innerStyle,
          padding: isMobile ? "24px 14px 42px" : "36px 24px 52px",
        }}
      >
        <button type="button" style={backButtonStyle} onClick={handleBack}>
          <span style={backIconStyle}>‹</span>
          Volver
        </button>

        <section style={headerStyle}>
          <div style={badgeStyle}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--azul)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Configuración
          </div>

          <h1 style={titleStyle}>Sesiones activas</h1>

          <p style={subtitleStyle}>
            Estas son las sesiones abiertas en tu cuenta actualmente.
          </p>
        </section>

        {loading && (
          <div
            className="dash-loading dash-loading--inline"
            role="status"
            aria-live="polite"
            style={loadingBoxStyle}
          >
            <span className="dash-loading-spinner" />
            <span>Cargando sesiones...</span>
          </div>
        )}

        {!loading && error && <div style={errorStyle}>{error}</div>}

        {!loading && !error && sessions.length === 0 && (
          <div style={emptyStateStyle}>
            No se encontraron sesiones activas.
          </div>
        )}

        <section style={listStyle}>
          {sessions.map((session) => {
            const isBusy = busyIds.includes(session.id);

            return (
              <article
                key={session.id}
                style={{
                  ...cardStyle,
                  flexDirection: isMobile ? "column" : "row",
                  alignItems: isMobile ? "stretch" : "center",
                }}
              >
                <div style={cardLeftStyle}>
                  <div style={iconWrapStyle}>
                    {session.icon === "mobile" ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--azul)"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                        <line x1="12" y1="18" x2="12.01" y2="18" />
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
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
                    )}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={sessionNameStyle}>
                      {session.os} · {session.browser}

                      {session.current && (
                        <span style={currentBadgeStyle}>
                          ● Este dispositivo
                        </span>
                      )}
                    </div>

                    <div style={sessionMetaStyle}>
                      {session.location} · {session.time}
                    </div>
                  </div>
                </div>

                {!session.current && (
                  <button
                    style={{
                      ...btnCloseStyle,
                      width: isMobile ? "100%" : "auto",
                      opacity: isBusy ? 0.65 : 1,
                      cursor: isBusy ? "not-allowed" : "pointer",
                    }}
                    disabled={isBusy}
                    onClick={() => handleClose(session.id)}
                    type="button"
                  >
                    {isBusy ? "Cerrando..." : "Cerrar sesión"}
                  </button>
                )}
              </article>
            );
          })}
        </section>

        {!loading && sessions.length > 1 && (
          <button
            style={{
              ...btnCloseAllStyle,
              width: isMobile ? "100%" : "auto",
              opacity: closingAll ? 0.65 : 1,
              cursor: closingAll ? "not-allowed" : "pointer",
            }}
            disabled={closingAll}
            onClick={handleCloseAll}
            type="button"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--rojo-soft)"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>

            {closingAll
              ? "Cerrando sesiones..."
              : "Cerrar todas las demás sesiones"}
          </button>
        )}
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

const innerStyle = {
  maxWidth: 800,
  margin: "0 auto",
  width: "100%",
};

const backButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  minHeight: 38,
  marginBottom: 22,
  padding: "8px 14px",
  border: "1.5px solid var(--gris-borde)",
  borderRadius: 12,
  background: "var(--blanco)",
  color: "var(--gris-oscuro)",
  fontFamily: "var(--font)",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 8px 18px rgba(17, 24, 39, 0.06)",
};

const backIconStyle = {
  width: 20,
  height: 20,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 8,
  background: "var(--azul-light)",
  color: "var(--azul)",
  fontSize: 22,
  lineHeight: 1,
};

const headerStyle = {
  marginBottom: 26,
};

const badgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  border: "1.5px solid var(--azul-mid)",
  borderRadius: 999,
  padding: "6px 14px",
  background: "var(--azul-light)",
  fontSize: 12,
  fontWeight: 800,
  color: "var(--azul)",
  letterSpacing: 1.2,
  textTransform: "uppercase",
  marginBottom: 18,
  fontFamily: "var(--font)",
};

const titleStyle = {
  fontSize: "clamp(28px, 5vw, 36px)",
  fontWeight: 800,
  color: "var(--negro-texto)",
  fontFamily: "var(--font)",
  margin: "0 0 10px",
  lineHeight: 1.1,
  letterSpacing: "-0.04em",
};

const subtitleStyle = {
  fontSize: 14,
  color: "var(--gris-texto)",
  margin: 0,
  lineHeight: 1.55,
  maxWidth: 620,
};

const loadingBoxStyle = {
  marginBottom: 14,
};

const errorStyle = {
  background: "var(--rojo-chip)",
  border: "1px solid var(--rojo-borde)",
  color: "var(--rojo-mid)",
  borderRadius: 14,
  padding: "12px 14px",
  marginBottom: 14,
  fontSize: 14,
  fontWeight: 600,
};

const emptyStateStyle = {
  background: "var(--blanco)",
  border: "1px solid var(--gris-borde)",
  borderRadius: 16,
  padding: "18px 20px",
  marginBottom: 18,
  color: "var(--gris-texto)",
  fontSize: 14,
  boxShadow: "0 10px 24px rgba(17, 24, 39, 0.06)",
};

const listStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  marginBottom: 20,
};

const cardStyle = {
  background: "var(--blanco)",
  border: "1px solid var(--gris-borde)",
  borderLeft: "4px solid var(--azul)",
  borderRadius: 18,
  padding: "18px 20px",
  display: "flex",
  justifyContent: "space-between",
  gap: 18,
  boxShadow: "0 10px 24px rgba(17, 24, 39, 0.08)",
};

const cardLeftStyle = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  minWidth: 0,
};

const iconWrapStyle = {
  width: 46,
  height: 46,
  borderRadius: 14,
  background: "var(--azul-light)",
  border: "1px solid var(--azul-mid)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const sessionNameStyle = {
  fontSize: 15,
  fontWeight: 800,
  color: "var(--negro-texto)",
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
  lineHeight: 1.35,
};

const currentBadgeStyle = {
  fontSize: 11,
  fontWeight: 800,
  color: "var(--verde-hover)",
  background: "var(--verde-chip)",
  border: "1px solid var(--verde-borde)",
  borderRadius: 999,
  padding: "3px 10px",
  letterSpacing: 0.2,
  whiteSpace: "nowrap",
};

const sessionMetaStyle = {
  fontSize: 13,
  color: "var(--gris-texto)",
  marginTop: 4,
  lineHeight: 1.4,
};

const btnCloseStyle = {
  minHeight: 38,
  background: "var(--blanco)",
  color: "var(--gris-oscuro)",
  border: "1.5px solid var(--gris-borde)",
  borderRadius: 10,
  padding: "8px 16px",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
  whiteSpace: "nowrap",
  flexShrink: 0,
  fontFamily: "var(--font)",
};

const btnCloseAllStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  minHeight: 42,
  background: "var(--rojo-chip)",
  color: "var(--rojo-mid)",
  border: "1.5px solid var(--rojo-borde)",
  borderRadius: 12,
  padding: "11px 18px",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
  fontFamily: "var(--font)",
};