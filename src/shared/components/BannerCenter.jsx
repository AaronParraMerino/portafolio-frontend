import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PoliticaCookies from '../../features/auth/components/PoliticasC';
import {
  aceptarCookiesYGuardarHardware,
  markCookieDismissed,
  wasCookieAccepted,
  wasCookieDismissed,
} from '../../features/auth/services/sessionService';

const ORDER_KEY = 'banner_center_order_v1';
const EXIT_ANIMATION_MS = 550;
const PROMOTE_ANIMATION_MS = 1000;

const sortByStoredOrder = (list) => {
  try {
    const raw = sessionStorage.getItem(ORDER_KEY);
    if (!raw) {
      return list;
    }

    const ids = JSON.parse(raw);
    if (!Array.isArray(ids)) {
      return list;
    }

    const rank = new Map(ids.map((id, index) => [id, index]));
    return [...list].sort((a, b) => {
      const ra = rank.has(a.id) ? rank.get(a.id) : Number.MAX_SAFE_INTEGER;
      const rb = rank.has(b.id) ? rank.get(b.id) : Number.MAX_SAFE_INTEGER;
      return ra - rb;
    });
  } catch (_) {
    return list;
  }
};

const persistOrder = (list) => {
  try {
    sessionStorage.setItem(ORDER_KEY, JSON.stringify(list.map((x) => x.id)));
  } catch (_) {
    // no-op
  }
};

const MOCK_NOTICES = [
  {
    id: 'notice-ddddd',
    title: 'Bienvddenido',
    description: 'Estas son nuevas funcionalidades que pueden gustarte.',
    linkLabel: 'Ver recomendaciones',
    linkHref: '/dashboard/experience',
    primaryLabel: 'Abrir',
    secondaryLabel: 'limpiar',
    autoHideMs: 35000,
  },
  {
    id: 'notice-welcome',
    title: 'Bienvenido',
    description: 'Estas son nuevas funcionalidades que pueden gustarte.',
    linkLabel: 'Ver recomendaciones',
    linkHref: '/dashboard/experience',
    primaryLabel: 'Abrir',
    secondaryLabel: 'Cerrar',
    autoHideMs: 35000,
  },
  {
    id: 'notice-profile',
    title: 'Tip de perfil',
    description: 'Completa tu perfil para mejorar visibilidad en el portafolio.',
    linkLabel: 'Ir a perfil',
    linkHref: '/dashboard/profile',
    primaryLabel: 'Entendido',
    secondaryLabel: 'Descartar',
    autoHideMs: 35000,
  },
];

export default function BannerCenter({ notices = MOCK_NOTICES }) {
  const queue = useMemo(() => {
    const base = [];

    if (!wasCookieAccepted() && !wasCookieDismissed()) {
      base.push({
        id: 'cookie-banner',
        title: 'Cookies del sitio',
        description: 'Usamos cookies para mejorar tu experiencia. Si aceptas, guardamos consentimiento y huella tecnica.',
        linkLabel: 'Ver politica de cookies',
        linkAction: 'open-policy',
        primaryLabel: 'Aceptar',
        secondaryLabel: 'Cerrar',
        autoHideMs: 35000,
      });
    }

    return [...base, ...notices];
  }, [notices]);

  const [items, setItems] = useState(queue);
  const [collapsed, setCollapsed] = useState(true);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [closing, setClosing] = useState({});
  const [promotingPhase, setPromotingPhase] = useState({});
  const activeTimerRef = useRef(null);
  const panelRef = useRef(null);
  const previousVisibleIdsRef = useRef([]);
  const animationTimeoutsRef = useRef([]);

  const scheduleAnimationTimeout = useCallback((cb, ms) => {
    const timeoutId = setTimeout(cb, ms);
    animationTimeoutsRef.current.push(timeoutId);
  }, []);

  const clearActiveTimer = useCallback(() => {
    if (activeTimerRef.current) {
      clearTimeout(activeTimerRef.current);
      activeTimerRef.current = null;
    }
  }, []);

  const dismissItem = useCallback((id) => {
    clearActiveTimer();

    setClosing((prev) => ({ ...prev, [id]: true }));
    scheduleAnimationTimeout(() => {
      setItems((prev) => {
        const nextItems = prev.filter((x) => x.id !== id);
        persistOrder(nextItems);
        return nextItems;
      });
      setClosing((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, EXIT_ANIMATION_MS);
  }, [clearActiveTimer, scheduleAnimationTimeout]);

  useEffect(() => {
    const ordered = sortByStoredOrder(queue);
    setItems(ordered);
    persistOrder(ordered);
  }, [queue]);

  useEffect(() => {
    return () => {
      animationTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      animationTimeoutsRef.current = [];
    };
  }, []);

  useEffect(() => {
    clearActiveTimer();

    // Solo cuenta el tiempo del banner activo (el de abajo/del frente)
    // y solo cuando la pila esta visible.
    if (collapsed || showPolicyModal || items.length === 0) {
      return () => clearActiveTimer();
    }

    const active = items[0];
    activeTimerRef.current = setTimeout(() => {
      dismissItem(active.id);
    }, active.autoHideMs ?? 35000);

    return () => clearActiveTimer();
  }, [items, collapsed, showPolicyModal, clearActiveTimer, dismissItem]);

  const moveToBack = (id) => {
    clearActiveTimer();

    setClosing((prev) => ({ ...prev, [id]: true }));
    scheduleAnimationTimeout(() => {
      setItems((prev) => {
        const index = prev.findIndex((x) => x.id === id);
        if (index < 0) {
          return prev;
        }

        const selected = prev[index];
        const nextItems = [...prev.slice(0, index), ...prev.slice(index + 1), selected];
        persistOrder(nextItems);
        return nextItems;
      });

      setClosing((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, EXIT_ANIMATION_MS);
  };

  const handlePrimary = async (item) => {
    if (item.id === 'cookie-banner') {
      try {
        await aceptarCookiesYGuardarHardware();
      } catch (error) {
        console.error('No se pudo guardar consentimiento/hardware:', error);
      }
    }

    dismissItem(item.id);
  };

  const handleSecondary = (item) => {
    if (item.id === 'cookie-banner') {
      markCookieDismissed();
      dismissItem(item.id);
      return;
    }

    moveToBack(item.id);
  };

  const handleLink = (item) => {
    if (item.linkAction === 'open-policy') {
      setShowPolicyModal(true);
      setCollapsed(true);
      return;
    }

    if (item.linkHref) {
      window.location.href = item.linkHref;
    }
  };

  const hasItems = items.length > 0;
  const pendingCount = items.length;
  const activeItem = items[0] ?? null;
  const titleItems = items.slice(1);

  // El primer banner se muestra expandido directamente, sin animación de entrada.

  useEffect(() => {
    const currentVisibleIds = items.slice(0, 3).map((item) => item.id);
    const previousVisibleIds = previousVisibleIdsRef.current;

    if (previousVisibleIds.length > 0) {
      const previousIndexById = new Map(previousVisibleIds.map((id, index) => [id, index]));

      // El banner que estaba como titulo y pasa al frente se expande a tarjeta completa.
      const promotedToFrontIds = currentVisibleIds.filter((id, index) => {
        const previousIndex = previousIndexById.get(id);
        return index === 0 && typeof previousIndex === 'number' && previousIndex > 0;
      });

      if (promotedToFrontIds.length > 0) {
        setPromotingPhase((prev) => {
          const next = { ...prev };
          promotedToFrontIds.forEach((id) => {
            next[id] = 'from-title';
          });
          return next;
        });

        scheduleAnimationTimeout(() => {
          setPromotingPhase((prev) => {
            const next = { ...prev };
            promotedToFrontIds.forEach((id) => {
              if (next[id] === 'from-title') {
                next[id] = 'to-main';
              }
            });
            return next;
          });
        }, 40);

        scheduleAnimationTimeout(() => {
          setPromotingPhase((prev) => {
            const next = { ...prev };
            promotedToFrontIds.forEach((id) => {
              delete next[id];
            });
            return next;
          });
        }, PROMOTE_ANIMATION_MS);
      }

    }

    previousVisibleIdsRef.current = currentVisibleIds;
  }, [items, scheduleAnimationTimeout]);

  return (
    <>
      {hasItems && (
        <div
          ref={panelRef}
          style={{ ...styles.rail, ...(collapsed ? styles.railCollapsed : null) }}
        >
          <div style={styles.glassViewport}>
            {activeItem && (
              <div
                key={activeItem.id}
                style={{
                  ...styles.banner,
                  ...(promotingPhase[activeItem.id] === 'from-title' ? styles.bannerPromotingFromTitle : null),
                  ...(promotingPhase[activeItem.id] === 'to-main' ? styles.bannerPromotingToMain : null),
                  ...(closing[activeItem.id] ? styles.bannerClosing : null),
                }}
                role="status"
                aria-live="polite"
              >
                <h4 style={styles.title}>{activeItem.title}</h4>

                <div
                  style={{
                    ...styles.mainContent,
                    ...(promotingPhase[activeItem.id] === 'from-title' ? styles.mainContentHidden : null),
                    ...(promotingPhase[activeItem.id] === 'to-main' ? styles.mainContentReveal : null),
                  }}
                >
                  <p style={styles.text}>{activeItem.description}</p>

                  {activeItem.linkLabel && (
                    <button type="button" style={styles.linkBtn} onClick={() => handleLink(activeItem)}>
                      {activeItem.linkLabel}
                    </button>
                  )}

                  <div style={styles.actions}>
                    {activeItem.secondaryLabel && (
                      <button type="button" style={styles.secondaryBtn} onClick={() => handleSecondary(activeItem)}>
                        {activeItem.secondaryLabel}
                      </button>
                    )}
                    {activeItem.primaryLabel && (
                      <button type="button" style={styles.primaryBtn} onClick={() => handlePrimary(activeItem)}>
                        {activeItem.primaryLabel}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {titleItems.map((item) => (
              <div
                key={item.id}
                style={{
                  ...styles.banner,
                  ...styles.bannerStacked,
                  ...(closing[item.id] ? styles.bannerClosing : null),
                }}
                role="status"
                aria-live="polite"
              >
                <h4 style={styles.title}>{item.title}</h4>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasItems && (
        <button
          type="button"
          style={styles.tab}
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? 'Abrir banners' : 'Cerrar banners'}
          title={collapsed ? 'Mostrar banners' : 'Colapsar banners'}
        >
          <span style={styles.tabLabel}>Avisos</span>
          <span style={styles.tabBadge}>{pendingCount}</span>
        </button>
      )}

      {showPolicyModal && (
        <PoliticaCookies
          onClose={() => {
            setShowPolicyModal(false);
            setCollapsed(false);
          }}
        />
      )}
    </>
  );
}

const styles = {
  rail: {
    position: 'fixed',
    right: '10px',
    bottom: '74px',
    zIndex: 10000,
    overflowX: 'hidden',
    transform: 'translateX(0)',
    transition: 'transform 260ms ease, opacity 200ms ease',
  },
  glassViewport: {
    width: 'min(350px, calc(100vw - 34px))',
    maxHeight: '44vh',
    overflowY: 'auto',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '8px',
    borderRadius: '13px',
    border: '1px solid rgba(148, 163, 184, 0.28)',
    background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.34), rgba(15, 23, 42, 0.18))',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    boxShadow: '0 16px 40px rgba(0,0,0,0.24)',
  },
  railCollapsed: {
    transform: 'translateX(calc(100% + 24px))',
    opacity: 0,
    pointerEvents: 'none',
  },
  banner: {
    width: '100%',
    background: '#0d1b2a',
    color: '#e0e7ff',
    border: '1px solid #1b263b',
    borderRadius: '12px',
    boxShadow: '0 14px 40px rgba(0,0,0,0.35)',
    padding: '12px',
    maxHeight: '240px',
    overflow: 'hidden',
    transform: 'translateX(0)',
    opacity: 1,
    transition: `transform ${EXIT_ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${EXIT_ANIMATION_MS}ms ease, margin-top ${PROMOTE_ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), padding ${PROMOTE_ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), max-height ${PROMOTE_ANIMATION_MS}ms ease, box-shadow ${PROMOTE_ANIMATION_MS}ms ease`,
  },
  bannerStacked: {
    marginTop: '0',
    padding: '7px 10px',
    maxHeight: '34px',
    opacity: 0.96,
    transition: `margin-top ${PROMOTE_ANIMATION_MS}ms linear, padding ${PROMOTE_ANIMATION_MS}ms linear, max-height ${PROMOTE_ANIMATION_MS}ms linear`,
  },
  bannerPromotingFromTitle: {
    marginTop: '0',
    padding: '7px 10px',
    maxHeight: '34px',
    opacity: 0.94,
    transition: `margin-top ${PROMOTE_ANIMATION_MS}ms linear, padding ${PROMOTE_ANIMATION_MS}ms linear, max-height ${PROMOTE_ANIMATION_MS}ms linear`,
  },
  bannerPromotingToMain: {
    marginTop: 0,
    padding: '12px',
    maxHeight: '240px',
    opacity: 1,
    boxShadow: '0 16px 42px rgba(0,0,0,0.38)',
  },
  bannerClosing: {
    transform: 'translateX(110%)',
    opacity: 0,
  },
  title: {
    margin: '0 0 6px',
    fontSize: '14px',
    fontWeight: 700,
  },
  text: {
    margin: 0,
    fontSize: '12px',
    lineHeight: 1.45,
    color: '#c8d5f4',
  },
  mainContent: {
    opacity: 1,
    maxHeight: '260px',
    overflow: 'hidden',
    transition: `opacity ${PROMOTE_ANIMATION_MS}ms ease, max-height ${PROMOTE_ANIMATION_MS}ms ease, transform ${PROMOTE_ANIMATION_MS}ms ease`,
  },
  mainContentHidden: {
    opacity: 0,
    maxHeight: '0px',
    transform: 'translateY(8px)',
    pointerEvents: 'none',
  },
  mainContentReveal: {
    opacity: 1,
    maxHeight: '260px',
    transform: 'translateY(0)',
  },
  linkBtn: {
    display: 'inline-block',
    marginTop: '7px',
    color: '#93c5fd',
    fontSize: '12px',
    textDecoration: 'underline',
    background: 'transparent',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    textAlign: 'left',
  },
  actions: {
    marginTop: '9px',
    display: 'flex',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: '8px',
  },
  primaryBtn: {
    border: 'none',
    background: '#1d4ed8',
    color: '#fff',
    borderRadius: '8px',
    padding: '7px 10px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  secondaryBtn: {
    border: '1px solid #334155',
    background: '#111827',
    color: '#cbd5e1',
    borderRadius: '8px',
    padding: '7px 10px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  tab: {
    position: 'fixed',
    right: 0,
    bottom: '86px',
    zIndex: 10001,
    border: '1px solid rgba(255,255,255,0.22)',
    borderRight: 0,
    background: '#0077b7',
    color: '#ffffff',
    borderRadius: '10px 0 0 10px',
    width: '20px',
    minHeight: '64px',
    padding: '6px 2px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '-8px 10px 22px rgba(0,0,0,0.2)',
  },
  tabLabel: {
    writingMode: 'vertical-rl',
    fontSize: '8px',
    fontWeight: 800,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  tabBadge: {
    position: 'absolute',
    top: '-6px',
    left: '-7px',
    minWidth: '15px',
    height: '15px',
    borderRadius: '999px',
    background: '#ffffff',
    color: '#004f7c',
    fontSize: '9px',
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 5px',
  },
};
