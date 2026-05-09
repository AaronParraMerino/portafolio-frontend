import { useEffect, useState } from "react";
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
  const browser = [item.navegador_nombre, item.navegador_version]
    .filter(Boolean)
    .join(" ") || "Navegador desconocido";

  const location = [item.pais_codigo, item.ip_address]
    .filter(Boolean)
    .join(" · ") || "Ubicación no disponible";

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
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyIds, setBusyIds] = useState([]);
  const [closingAll, setClosingAll] = useState(false);

  const loadSessions = async () => {
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
  };

  useEffect(() => {
    loadSessions();
  }, []);

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
      <div style={innerStyle}>
        <div style={badgeStyle}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          Configuración
        </div>

        <h1 style={titleStyle}>Sesiones activas</h1>
        <p style={subtitleStyle}>Estas son las sesiones abiertas en tu cuenta actualmente.</p>

        {loading && <p style={subtitleStyle}>Cargando sesiones...</p>}
        {!loading && error && <p style={errorStyle}>{error}</p>}
        {!loading && !error && sessions.length === 0 && (
          <p style={subtitleStyle}>No se encontraron sesiones activas.</p>
        )}

        <div style={listStyle}>
          {sessions.map(session => (
            <div key={session.id} style={cardStyle}>
              <div style={cardLeftStyle}>
                <div style={iconWrapStyle}>
                  {session.icon === "mobile" ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                      <line x1="12" y1="18" x2="12.01" y2="18" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  )}
                </div>
                <div>
                  <div style={sessionNameStyle}>
                    {session.os} · {session.browser}
                    {session.current && <span style={currentBadgeStyle}>● Este dispositivo</span>}
                  </div>
                  <div style={sessionMetaStyle}>{session.location} · {session.time}</div>
                </div>
              </div>
              {!session.current && (
                <button
                  style={{
                    ...btnCloseStyle,
                    opacity: busyIds.includes(session.id) ? 0.65 : 1,
                    cursor: busyIds.includes(session.id) ? "not-allowed" : "pointer",
                  }}
                  disabled={busyIds.includes(session.id)}
                  onClick={() => handleClose(session.id)}
                >
                  {busyIds.includes(session.id) ? "Cerrando..." : "Cerrar sesión"}
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          style={{
            ...btnCloseAllStyle,
            opacity: closingAll ? 0.65 : 1,
            cursor: closingAll ? "not-allowed" : "pointer",
          }}
          disabled={closingAll}
          onClick={handleCloseAll}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {closingAll ? "Cerrando sesiones..." : "Cerrar todas las demás sesiones"}
        </button>
      </div>
    </div>
  );
}

const pageStyle = { fontFamily: "'Segoe UI','Inter',sans-serif", background: "#fcfcfc", minHeight: "100vh", padding: "36px 24px" };
const innerStyle = { maxWidth: 680, margin: '0 auto', width: '100%' };
const badgeStyle = { display: "inline-flex", alignItems: "center", gap: 7, border: "1.5px solid #93c5fd", borderRadius: 999, padding: "5px 14px", background: "#eff8ff", fontSize: 12, fontWeight: 700, color: "#1e40af", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 18 };
const titleStyle = { fontSize: 34, fontWeight: 900, color: "#0f172a", fontFamily: "Georgia,'Times New Roman',serif", marginBottom: 10, lineHeight: 1.1 };
const subtitleStyle = { fontSize: 14, color: "#475569", marginBottom: 28 };
const errorStyle = { fontSize: 14, color: "#dc2626", marginBottom: 18, fontWeight: 600 };
const listStyle = { display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 };
const cardStyle = { background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" };
const cardLeftStyle = { display: "flex", alignItems: "center", gap: 14 };
const iconWrapStyle = { width: 42, height: 42, borderRadius: 12, background: "#d8f1ff", border: "1px solid #a7ddff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
const sessionNameStyle = { fontSize: 15, fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" };
const currentBadgeStyle = { fontSize: 11, fontWeight: 700, color: "#16a34a", background: "#dcfce7", border: "1px solid #86efac", borderRadius: 999, padding: "2px 10px", letterSpacing: 0.3 };
const sessionMetaStyle = { fontSize: 13, color: "#64748b", marginTop: 3 };
const btnCloseStyle = { background: "transparent", color: "#374151", border: "1.5px solid #d1d5db", borderRadius: 9, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 };
const btnCloseAllStyle = { display: "inline-flex", alignItems: "center", gap: 8, background: "#fff1f2", color: "#ef4444", border: "1.5px solid #fecaca", borderRadius: 10, padding: "11px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" };