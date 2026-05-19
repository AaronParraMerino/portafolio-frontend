import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../../../../services/http/const";

export default function VincularCuenta() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProvider, setLoadingProvider] = useState("");
  const [unlinkingProvider, setUnlinkingProvider] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [githubSyncing, setGithubSyncing] = useState(false);
  const [githubDetectedCount, setGithubDetectedCount] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  const meta = useMemo(
    () => ({
      google: {
        name: "Google",
        description: "Escoge qué cuenta Google quieres vincular",
      },
      discord: {
        name: "Discord",
        description: "Conecta tu cuenta de Discord",
      },
      github: {
        name: "GitHub",
        description: "Conecta o cambia la cuenta de GitHub",
      },
      gitlab: {
        name: "GitLab",
        description: "Conecta tus proyectos de GitLab",
      },
    }),
    []
  );

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

  const loadLinkedProviders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("tokenPORT");
      if (!token) {
        throw new Error("No hay sesión activa. Inicia sesión nuevamente.");
      }

      const res = await fetch(`${BASE_URL}/auth/oauth/linked-providers`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          payload.message || "No se pudo cargar el estado de vinculación."
        );
      }

      const rows = Array.isArray(payload?.data) ? payload.data : [];

      const merged = ["google", "discord", "github", "gitlab"].map((id) => {
        const row = rows.find((x) => x.provider === id) || {
          connected: false,
          detail: "No vinculado",
        };

        return {
          id,
          name: meta[id].name,
          description: meta[id].description,
          connected: !!row.connected,
          detail: row.detail || "No vinculado",
        };
      });

      setAccounts(merged);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [meta]);

  const loadGithubDetectedCount = useCallback(async (refresh = false) => {
    try {
      const token = localStorage.getItem("tokenPORT");
      if (!token) return;

      const qs = refresh ? "?refresh=true" : "";

      const res = await fetch(`${BASE_URL}/auth/github/repos/detected/count${qs}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 404) {
          setGithubDetectedCount(0);
          return;
        }

        throw new Error(
          payload.message || "No se pudieron obtener los repositorios detectados."
        );
      }

      const count = Number(payload?.count ?? payload?.data?.count ?? 0);
      setGithubDetectedCount(Number.isFinite(count) ? count : 0);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    loadLinkedProviders();
  }, [loadLinkedProviders]);

  useEffect(() => {
    const github = accounts.find((item) => item.id === "github");

    if (github?.connected) {
      loadGithubDetectedCount(false);
      return;
    }

    setGithubDetectedCount(0);
  }, [accounts, loadGithubDetectedCount]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connectStatus = params.get("oauth_connect");
    const provider = params.get("provider");
    const connectError = params.get("oauth_connect_error");

    if (!connectStatus || !provider) return;

    if (connectStatus === "success") {
      setNotice(`Cuenta de ${provider} vinculada correctamente.`);
      setError("");
    } else {
      setNotice("");
      setError(getConnectErrorMessage(connectError, provider));
    }

    params.delete("oauth_connect");
    params.delete("provider");
    params.delete("oauth_connect_error");

    const next = params.toString();

    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}${next ? `?${next}` : ""}`
    );
  }, []);

  const handleVincular = async (id) => {
    try {
      setLoadingProvider(id);
      setError("");
      setNotice("");

      const token = localStorage.getItem("tokenPORT");
      if (!token) {
        throw new Error("No hay sesión activa. Inicia sesión nuevamente.");
      }

      const res = await fetch(`${BASE_URL}/auth/${id}/connect-url`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok || !payload?.url) {
        throw new Error(payload.message || "No se pudo iniciar la vinculación.");
      }

      window.location.assign(payload.url);
    } catch (e) {
      setError(e.message);
      setLoadingProvider("");
    }
  };

  const handleDesvincular = async (id) => {
    const account = accounts.find((a) => a.id === id);
    const providerName = account?.name || id;

    const ok = window.confirm(`¿Seguro que quieres desvincular ${providerName}?`);
    if (!ok) return;

    try {
      setUnlinkingProvider(id);
      setError("");
      setNotice("");

      const token = localStorage.getItem("tokenPORT");
      if (!token) {
        throw new Error("No hay sesión activa. Inicia sesión nuevamente.");
      }

      const res = await fetch(`${BASE_URL}/auth/${id}/unlink`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload.message || "No se pudo desvincular la cuenta.");
      }

      setNotice(payload.message || `Cuenta de ${providerName} desvinculada.`);
      await loadLinkedProviders();
    } catch (e) {
      setError(e.message);
    } finally {
      setUnlinkingProvider("");
    }
  };

  const handleSyncGithub = async () => {
    try {
      setGithubSyncing(true);
      setError("");
      setNotice("");

      const token = localStorage.getItem("tokenPORT");
      if (!token) {
        throw new Error("No hay sesión activa. Inicia sesión nuevamente.");
      }

      const syncRes = await fetch(`${BASE_URL}/auth/github/repos/sync`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const syncPayload = await syncRes.json().catch(() => ({}));

      if (!syncRes.ok) {
        throw new Error(
          syncPayload.message || "No se pudo sincronizar con GitHub."
        );
      }

      await loadGithubDetectedCount(false);

      setNotice(formatGithubSyncNotice(syncPayload?.stats));
    } catch (e) {
      setError(e.message);
    } finally {
      setGithubSyncing(false);
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
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            Cuentas externas
          </div>

          <h1 style={titleStyle}>Vincular cuenta</h1>

          <p style={subtitleStyle}>
            Conecta tu perfil con plataformas externas para enriquecer tu
            portafolio.
          </p>
        </section>

        {error ? <div style={errorStyle}>{error}</div> : null}
        {notice ? <div style={noticeStyle}>{notice}</div> : null}

        {loading ? (
          <div
            className="dash-loading dash-loading--inline"
            role="status"
            aria-live="polite"
            style={loadingBoxStyle}
          >
            <span className="dash-loading-spinner" />
            <span>Cargando cuentas...</span>
          </div>
        ) : null}

        <section style={listStyle}>
          {accounts.map((account) => (
            <article
              key={account.id}
              style={{
                ...cardStyle,
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "stretch" : "center",
              }}
            >
              <div style={accountInfoStyle}>
                <div style={iconWrapStyle(account.id)}>
                  <PlatformIcon id={account.id} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={platformNameStyle}>{account.name}</div>

                  <div
                    style={
                      account.connected ? detailConnectedStyle : detailStyle
                    }
                  >
                    {account.detail}
                  </div>

                  <div style={descriptionStyle}>{account.description}</div>
                </div>
              </div>

              <div
                style={{
                  ...actionColStyle,
                  alignItems: isMobile ? "stretch" : "flex-end",
                  width: isMobile ? "100%" : "auto",
                }}
              >
                {account.connected ? (
                  <>
                    <span style={connectedBadgeStyle}>● Conectado</span>

                    {account.id === "github" ? (
                      <>
                        <span style={miniInfoStyle}>
                          Repos detectados: {githubDetectedCount}
                        </span>

                        <button
                          style={btnSyncStyle}
                          onClick={handleSyncGithub}
                          disabled={
                            githubSyncing ||
                            loadingProvider === account.id ||
                            unlinkingProvider === account.id
                          }
                          type="button"
                        >
                          {githubSyncing
                            ? "Sincronizando..."
                            : "Sincronizar repos"}
                        </button>
                      </>
                    ) : null}

                    <button
                      style={btnSecondaryStyle}
                      onClick={() => handleVincular(account.id)}
                      disabled={
                        loadingProvider === account.id ||
                        unlinkingProvider === account.id
                      }
                      type="button"
                    >
                      {loadingProvider === account.id
                        ? "Abriendo..."
                        : "Cambiar cuenta"}
                    </button>

                    <button
                      style={btnUnlinkStyle}
                      onClick={() => handleDesvincular(account.id)}
                      disabled={
                        unlinkingProvider === account.id ||
                        loadingProvider === account.id
                      }
                      type="button"
                    >
                      {unlinkingProvider === account.id
                        ? "Desvinculando..."
                        : "Desvincular"}
                    </button>
                  </>
                ) : (
                  <button
                    style={btnPrimaryStyle}
                    onClick={() => handleVincular(account.id)}
                    disabled={
                      loadingProvider === account.id ||
                      unlinkingProvider === account.id
                    }
                    type="button"
                  >
                    {loadingProvider === account.id ? "Abriendo..." : "Vincular"}
                  </button>
                )}
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

function PlatformIcon({ id }) {
  if (id === "google") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
    );
  }

  if (id === "discord") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="#ffffff">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.034.055a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    );
  }

  if (id === "github") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="#ffffff">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    );
  }

  if (id === "gitlab") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="#ffffff">
        <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51 1.22 3.78a.84.84 0 0 1-.3.92z" />
      </svg>
    );
  }

  return null;
}

function iconWrapStyle(id) {
  const styles = {
    google: {
      background: "#ffffff",
      border: "1px solid var(--gris-borde)",
    },
    discord: {
      background: "#5865F2",
      border: "1px solid #5865F2",
    },
    github: {
      background: "#24292e",
      border: "1px solid #24292e",
    },
    gitlab: {
      background: "#FC6D26",
      border: "1px solid #FC6D26",
    },
  };

  return {
    width: 50,
    height: 50,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 8px 18px rgba(17, 24, 39, 0.08)",
    ...styles[id],
  };
}

function getConnectErrorMessage(code, provider) {
  if (code === "already_linked") {
    return `La cuenta de ${provider} ya está vinculada a otro usuario.`;
  }

  if (code === "provider_conflict") {
    return `Ya tienes una cuenta distinta de ${provider} vinculada.`;
  }

  if (code === "blocked") {
    return "Tu usuario está bloqueado. No se pudo vincular la cuenta.";
  }

  return `No se pudo vincular la cuenta de ${provider}. Inténtalo nuevamente.`;
}

function formatGithubSyncNotice(stats = {}) {
  const creados = Number(stats?.creados ?? 0);
  const actualizados = Number(stats?.actualizados ?? 0);
  const detalles = Number(stats?.detalles_actualizados ?? 0);
  const pendientes = Number(stats?.detalles_omitidos_por_limite ?? 0);

  const parts = [
    "Sincronización lista.",
    `Repos nuevos: ${Number.isFinite(creados) ? creados : 0}.`,
    `Repos actualizados: ${Number.isFinite(actualizados) ? actualizados : 0}.`,
  ];

  if (Number.isFinite(detalles) && detalles > 0) {
    parts.push(`Detalles completados: ${detalles}.`);
  }

  if (Number.isFinite(pendientes) && pendientes > 0) {
    parts.push(`Detalles pendientes por límite: ${pendientes}.`);
  }

  return parts.join(" ");
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

const listStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const cardStyle = {
  background: "var(--blanco)",
  border: "1px solid var(--gris-borde)",
  borderLeft: "4px solid var(--azul)",
  borderRadius: 18,
  padding: "18px 20px",
  display: "flex",
  gap: 18,
  boxShadow: "0 10px 24px rgba(17, 24, 39, 0.08)",
};

const accountInfoStyle = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  flex: 1,
  minWidth: 0,
};

const platformNameStyle = {
  fontSize: 16,
  fontWeight: 800,
  color: "var(--negro-texto)",
  marginBottom: 2,
  lineHeight: 1.25,
};

const detailConnectedStyle = {
  fontSize: 13,
  color: "var(--azul)",
  fontWeight: 700,
  marginBottom: 2,
};

const detailStyle = {
  fontSize: 13,
  color: "var(--gris-texto)",
  marginBottom: 2,
};

const descriptionStyle = {
  fontSize: 12.5,
  color: "var(--gris-texto)",
  lineHeight: 1.4,
};

const actionColStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 7,
  flexShrink: 0,
};

const connectedBadgeStyle = {
  fontSize: 11,
  fontWeight: 800,
  color: "var(--verde-hover)",
  background: "var(--verde-chip)",
  border: "1px solid var(--verde-borde)",
  borderRadius: 999,
  padding: "3px 10px",
  whiteSpace: "nowrap",
  textAlign: "center",
};

const miniInfoStyle = {
  fontSize: 11,
  fontWeight: 700,
  color: "var(--azul-deep)",
  background: "var(--azul-light)",
  border: "1px solid var(--azul-mid)",
  borderRadius: 999,
  padding: "3px 10px",
  whiteSpace: "nowrap",
  textAlign: "center",
};

const baseButtonStyle = {
  minHeight: 36,
  borderRadius: 10,
  padding: "8px 14px",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
  whiteSpace: "nowrap",
  fontFamily: "var(--font)",
  transition: "background 0.2s ease, transform 0.12s ease, opacity 0.2s ease",
};

const btnPrimaryStyle = {
  ...baseButtonStyle,
  background: "var(--azul)",
  color: "var(--blanco)",
  border: "none",
  boxShadow: "0 8px 18px rgba(0, 119, 183, 0.24)",
};

const btnSecondaryStyle = {
  ...baseButtonStyle,
  background: "var(--blanco)",
  color: "var(--gris-oscuro)",
  border: "1.5px solid var(--gris-borde)",
};

const btnSyncStyle = {
  ...baseButtonStyle,
  background: "var(--azul-light)",
  color: "var(--azul-deep)",
  border: "1.5px solid var(--azul-mid)",
};

const btnUnlinkStyle = {
  ...baseButtonStyle,
  background: "var(--rojo-chip)",
  color: "var(--rojo-mid)",
  border: "1.5px solid var(--rojo-borde)",
};

const errorStyle = {
  background: "var(--rojo-chip)",
  border: "1px solid var(--rojo-borde)",
  color: "var(--rojo-mid)",
  borderRadius: 14,
  padding: "12px 14px",
  marginBottom: 12,
  fontSize: 14,
  fontWeight: 600,
};

const noticeStyle = {
  background: "var(--verde-chip)",
  border: "1px solid var(--verde-borde)",
  color: "var(--verde-hover)",
  borderRadius: 14,
  padding: "12px 14px",
  marginBottom: 12,
  fontSize: 14,
  fontWeight: 600,
};
