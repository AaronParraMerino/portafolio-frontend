import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FiMaximize, FiMaximize2, FiMinimize, FiMinimize2 } from 'react-icons/fi';
import { useLanguage } from '../../core/i18n';
import useFloatingLayer from '../hooks/useFloatingLayer';
import PoliticaCookies from '../../features/auth/components/PoliticasC';
import MessagingPanel from '../../features/messaging/components/MessagingPanel';
import {
  aceptarCookiesYGuardarHardware,
  markCookieDismissed,
  wasCookieAccepted,
  wasCookieDismissed,
} from '../../features/auth/services/sessionService';
import {
  getStoredUser,
  isAdminUser,
  onStoredUserUpdated,
} from '../utils/authStorage';
import BASE_URL from '../../services/http/const';

const ORDER_KEY = 'banner_center_order_v1';
const DISMISSED_NOTICES_KEY = 'banner_center_dismissed_notices_v1';
const EXIT_ANIMATION_MS = 550;
const PROMOTE_ANIMATION_MS = 1000;
const EMPTY_NOTICES = [];
const MAX_VISIBLE_ITEMS = 4;

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

const haveSameBannerItems = (current, next) => (
  current.length === next.length
  && current.every((item, index) => {
    const nextItem = next[index];

    return item.id === nextItem?.id
      && item.updatedAt === nextItem?.updatedAt
      && item.title === nextItem?.title
      && item.description === nextItem?.description;
  })
);

const readDismissedNotices = () => {
  try {
    const raw = localStorage.getItem(DISMISSED_NOTICES_KEY);
    const parsed = raw ? JSON.parse(raw) : {};

    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (_) {
    return {};
  }
};

const persistDismissedNotice = (item) => {
  if (item?.source !== 'global_notice') return;

  try {
    const dismissed = readDismissedNotices();
    dismissed[item.id] = {
      dismissedAt: new Date().toISOString(),
      updatedAt: item.updatedAt || null,
    };

    localStorage.setItem(DISMISSED_NOTICES_KEY, JSON.stringify(dismissed));
  } catch (_) {
    // no-op
  }
};

const isNoticeDismissed = (item) => {
  if (item?.source !== 'global_notice') return false;

  const dismissed = readDismissedNotices();
  const stored = dismissed[item.id];

  if (!stored) return false;

  return String(stored.updatedAt || '') === String(item.updatedAt || '');
};

function normalizeGlobalNotice(item = {}) {
  const id = item.id_aviso ?? item.id ?? item.aviso_id;

  if (!id) return null;

  return {
    id: `aviso-${id}`,
    source: 'global_notice',
    noticeId: id,
    title: item.titulo || item.title || 'Aviso del sistema',
    description: item.mensaje || item.description || '',
    type: item.tipo || 'comunicacion_marketing_global',
    priority: item.prioridad || 'normal',
    updatedAt: item.updated_at || item.fecha_actualizacion || null,
    autoHideMs: 35000,
  };
}

function getNoticeToneStyles(item = {}) {
  const priority = String(item.priority || '').toLowerCase();
  const type = String(item.type || '').toLowerCase();
  const isCritical = priority === 'critica';
  const isHigh = priority === 'alta';

  if (isCritical) {
    return {
      ...styles.noticeShell,
      ...styles.noticeLegal,
      ...styles.noticeCritical,
    };
  }

  if (type === 'legal_cumplimiento') {
    return {
      ...styles.noticeShell,
      ...styles.noticeLegal,
      ...(isHigh ? styles.noticeHigh : null),
    };
  }

  if (type === 'operacional_tecnico') {
    return {
      ...styles.noticeShell,
      ...styles.noticeOperational,
      ...(isHigh ? styles.noticeHigh : null),
    };
  }

  if (type === 'comunicacion_marketing_global') {
    return {
      ...styles.noticeShell,
      ...styles.noticeMarketing,
      ...(isHigh ? styles.noticeHigh : null),
    };
  }

  return {
    ...styles.noticeShell,
    ...styles.noticeBusiness,
    ...(isHigh ? styles.noticeHigh : null),
  };
}

export default function BannerCenter({ notices = EMPTY_NOTICES }) {
  const { t } = useLanguage();
  const [user, setUser] = useState(() => getStoredUser());
  const [globalNotices, setGlobalNotices] = useState([]);
  const adminUser = isAdminUser(user);

  useEffect(() => onStoredUserUpdated((event) => {
    setUser(event?.detail || getStoredUser());
  }), []);

  useEffect(() => {
    let cancelled = false;

    fetch(`${BASE_URL}/avisos`, {
      headers: {
        Accept: 'application/json',
      },
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (cancelled) return;

        const data = Array.isArray(payload?.data) ? payload.data : [];
        setGlobalNotices(data.map(normalizeGlobalNotice).filter(Boolean));
      })
      .catch(() => {
        if (!cancelled) {
          setGlobalNotices([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const queue = useMemo(() => {
    const base = [];

    if (!wasCookieAccepted() && !wasCookieDismissed()) {
      base.push({
        id: 'cookie-banner',
        title: t('cookie.title'),
        description: t('cookie.description'),
        linkLabel: t('cookie.policyLink'),
        linkAction: 'open-policy',
        primaryLabel: t('cookie.acceptShort'),
        secondaryLabel: t('cookie.close'),
        autoHideMs: 35000,
      });
    }

    const translatedGlobalNotices = globalNotices
      .filter((item) => !isNoticeDismissed(item))
      .map((item) => ({
        ...item,
        primaryLabel: t('banner.action.ok'),
        secondaryLabel: t('banner.action.close'),
      }));

    return [...base, ...translatedGlobalNotices, ...notices];
  }, [globalNotices, notices, t]);

  const [items, setItems] = useState(queue);
  const [collapsed, setCollapsed] = useState(true);
  const [messagingSize, setMessagingSize] = useState('medium');
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [closing, setClosing] = useState({});
  const [promotingPhase, setPromotingPhase] = useState({});
  const floatingLayer = useFloatingLayer('inbox', !collapsed);
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
        const selected = prev.find((x) => x.id === id);
        persistDismissedNotice(selected);

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
    setItems((current) => (haveSameBannerItems(current, ordered) ? current : ordered));
    persistOrder(ordered);
  }, [queue]);

  useEffect(() => {
    return () => {
      animationTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      animationTimeoutsRef.current = [];
    };
  }, []);

  useEffect(() => {
    const handleOpenMessagingCenter = () => {
      window.dispatchEvent(new CustomEvent('folio:close-calendar'));
      setCollapsed(false);
      setMessagingSize('medium');
    };

    window.addEventListener('folio:open-messaging-center', handleOpenMessagingCenter);

    return () => {
      window.removeEventListener('folio:open-messaging-center', handleOpenMessagingCenter);
    };
  }, []);

  useEffect(() => {
    const closeInbox = () => setCollapsed(true);
    window.addEventListener('folio:close-inbox', closeInbox);
    return () => window.removeEventListener('folio:close-inbox', closeInbox);
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('folio:inbox-visibility', {
      detail: { visible: !collapsed },
    }));

    return () => {
      if (!collapsed) {
        window.dispatchEvent(new CustomEvent('folio:inbox-visibility', {
          detail: { visible: false },
        }));
      }
    };
  }, [collapsed]);

  useEffect(() => {
    clearActiveTimer();

    // Sin sesion mantiene el autocierre historico. Con sesion, los avisos quedan manuales.
    const hasSession = Boolean(
      localStorage.getItem('tokenPORT') || sessionStorage.getItem('tokenPORT')
    );

    if (hasSession || collapsed || showPolicyModal || items.length === 0) {
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

    if (item.source === 'global_notice') {
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
  const inboxLabel = t('banner.center.tab');
  const activeItem = items[0] ?? null;
  const messagingEnabled = !adminUser && Boolean(
    localStorage.getItem('tokenPORT') || sessionStorage.getItem('tokenPORT')
  );
  const titleItems = messagingEnabled
    ? items.slice(1)
    : items.slice(1, MAX_VISIBLE_ITEMS);
  const railVisible = (hasItems || messagingEnabled) && !collapsed;

  // El primer banner se muestra expandido directamente, sin animación de entrada.

  useEffect(() => {
    const currentVisibleIds = items.slice(0, MAX_VISIBLE_ITEMS).map((item) => item.id);
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
      {!adminUser && (hasItems || messagingEnabled) && (
        <div
          ref={panelRef}
          style={{
            ...styles.rail,
            zIndex: !collapsed ? floatingLayer.zIndex : styles.rail.zIndex,
            ...(!messagingEnabled ? styles.railPublic : null),
            ...(!railVisible ? styles.railCollapsed : null),
          }}
        >
          <div
            style={{
              ...styles.glassViewport,
              ...(!messagingEnabled ? styles.glassViewportPublic : null),
            }}
          >
            <div
              style={{
                ...styles.sectionBody,
                ...(messagingEnabled ? styles.sectionBodyAuthenticated : null),
              }}
            >
              {hasItems && (
                <div
                  style={{
                    ...styles.noticeSlot,
                    ...(messagingEnabled ? styles.noticeSlotAuthenticated : null),
                  }}
                >
                  {(messagingEnabled ? items : [activeItem].filter(Boolean)).map((item) => (
                    <div
                      key={item.id}
                      style={{
                        ...styles.banner,
                        ...getNoticeToneStyles(item),
                        ...(messagingEnabled ? styles.bannerAuthenticated : null),
                        ...(promotingPhase[item.id] === 'from-title' ? styles.bannerPromotingFromTitle : null),
                        ...(promotingPhase[item.id] === 'to-main' ? styles.bannerPromotingToMain : null),
                        ...(closing[item.id] ? styles.bannerClosing : null),
                      }}
                      role="status"
                      aria-live="polite"
                    >
                      <h4 style={styles.title}>{item.title}</h4>

                      <div
                        style={{
                          ...styles.mainContent,
                          ...(promotingPhase[item.id] === 'from-title' ? styles.mainContentHidden : null),
                          ...(promotingPhase[item.id] === 'to-main' ? styles.mainContentReveal : null),
                        }}
                      >
                        <p style={styles.text}>{item.description}</p>

                        {item.linkLabel && (
                          <button type="button" style={styles.linkBtn} onClick={() => handleLink(item)}>
                            {item.linkLabel}
                          </button>
                        )}

                        <div style={styles.actions}>
                          {item.secondaryLabel && (
                            <button type="button" style={styles.secondaryBtn} onClick={() => handleSecondary(item)}>
                              {item.secondaryLabel}
                            </button>
                          )}
                          {item.primaryLabel && (
                            <button type="button" style={styles.primaryBtn} onClick={() => handlePrimary(item)}>
                              {item.primaryLabel}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {!messagingEnabled && titleItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        ...styles.banner,
                        ...getNoticeToneStyles(item),
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
              )}

              {messagingEnabled && (
                <div
                  style={{
                    ...styles.messagingSlot,
                    ...(hasItems ? styles.messagingSlotWithNotices : styles.messagingSlotFull),
                    ...(messagingSize === 'compact' ? styles.messagingSlotCompact : null),
                    ...(messagingSize === 'full' ? styles.messagingSlotFullHeight : null),
                  }}
                >
                  <div style={styles.messagingResizeBar}>
                    <button
                      type="button"
                      style={{
                        ...styles.messagingResizeButton,
                        ...(messagingSize === 'full' ? styles.messagingResizeButtonActive : null),
                      }}
                      onClick={() => setMessagingSize((current) => (
                        current === 'full' ? 'medium' : 'full'
                      ))}
                      aria-pressed={messagingSize === 'full'}
                      aria-label={t(messagingSize === 'full' ? 'messaging.medium' : 'messaging.full')}
                      title={t(messagingSize === 'full' ? 'messaging.medium' : 'messaging.full')}
                    >
                      {messagingSize === 'full' ? <FiMinimize /> : <FiMaximize />}
                    </button>
                    <button
                      type="button"
                      style={styles.messagingResizeButton}
                      onClick={() => setMessagingSize((current) => (
                        current === 'medium' ? 'compact' : 'medium'
                      ))}
                      aria-label={t(messagingSize === 'medium' ? 'messaging.compact' : 'messaging.medium')}
                      title={t(messagingSize === 'medium' ? 'messaging.compact' : 'messaging.medium')}
                    >
                      {messagingSize === 'compact' ? <FiMaximize2 /> : <FiMinimize2 />}
                    </button>
                  </div>
                  <MessagingPanel
                    controlledOpen={!collapsed}
                    embedded
                    enabled={messagingEnabled}
                    hideToggle
                    onOpenChange={(value) => {
                      if (!value) setCollapsed(true);
                    }}
                  />
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {!adminUser && (hasItems || messagingEnabled) && (
        <button
          type="button"
          style={{
            ...styles.tab,
            zIndex: !collapsed ? floatingLayer.zIndex + 1 : styles.tab.zIndex,
          }}
          onClick={() => {
            setCollapsed((value) => {
              if (value) {
                window.dispatchEvent(new CustomEvent('folio:close-calendar'));
              }
              return !value;
            });
          }}
          aria-label={collapsed ? t('banner.center.openInbox') : t('banner.center.closeInbox')}
          title={collapsed ? t('banner.center.showInbox') : t('banner.center.collapseInbox')}
        >
          <span style={styles.tabLabel}>{inboxLabel}</span>
          {pendingCount > 0 && <span style={styles.tabBadge}>{pendingCount}</span>}
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
    top: 'var(--nav-height, 60px)',
    right: 0,
    bottom: 0,
    zIndex: 9990,
    overflowX: 'hidden',
    transform: 'translateX(0)',
    transition: 'transform .22s cubic-bezier(.4,0,.2,1), box-shadow .22s cubic-bezier(.4,0,.2,1)',
    width: '340px',
    maxWidth: 'min(100vw, 340px)',
    height: 'calc(100dvh - var(--nav-height, 60px))',
    background: 'transparent',
    borderLeft: 0,
  },
  railPublic: {
    top: 'auto',
    right: '10px',
    bottom: '74px',
    width: 'min(420px, calc(100vw - 34px))',
    maxWidth: 'min(420px, calc(100vw - 34px))',
    height: 'auto',
  },
  glassViewport: {
    width: '100%',
    height: '100%',
    maxHeight: 'none',
    overflowY: 'auto',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    padding: 0,
    borderRadius: 0,
    border: 0,
    background: 'transparent',
    boxShadow: 'none',
  },
  glassViewportPublic: {
    height: 'auto',
    maxHeight: '52vh',
    padding: '10px',
  },
  glassViewportWithMessaging: {
    width: '100%',
    maxHeight: 'none',
  },
  railCollapsed: {
    transform: 'translateX(100%)',
    pointerEvents: 'none',
  },
  sectionBody: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    gap: '8px',
    minHeight: 0,
    overflowY: 'auto',
    padding: '8px 8px 22px',
    scrollbarWidth: 'thin',
    scrollbarColor: 'var(--gris-borde, #d1d5db) transparent',
  },
  sectionBodyAuthenticated: {
    height: '100%',
    overflowY: 'hidden',
  },
  noticeSlot: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minHeight: 0,
  },
  noticeSlotAuthenticated: {
    flex: '1 1 0',
    maxHeight: 'none',
    minHeight: 0,
    overflowY: 'auto',
    paddingRight: '4px',
    scrollbarWidth: 'thin',
    scrollbarColor: 'var(--gris-borde, #d1d5db) transparent',
  },
  messagingSlot: {
    background: 'var(--blanco, #ffffff)',
    border: '1px solid var(--gris-borde, #d1d5db)',
    borderRadius: '8px',
    boxShadow: '0 10px 24px rgba(15,23,42,.08)',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    overflow: 'hidden',
    padding: '10px',
    transition: 'flex-basis .22s cubic-bezier(.4,0,.2,1), min-height .22s cubic-bezier(.4,0,.2,1)',
  },
  messagingSlotWithNotices: {
    flex: '2 1 0',
  },
  messagingSlotFull: {
    flex: '1 1 100%',
  },
  messagingSlotCompact: {
    flex: '0 1 clamp(190px, 32dvh, 270px)',
    minHeight: '190px',
  },
  messagingSlotFullHeight: {
    flex: '999 1 100%',
  },
  messagingResizeBar: {
    alignItems: 'center',
    display: 'flex',
    flex: '0 0 auto',
    justifyContent: 'flex-end',
    gap: '6px',
    marginBottom: '7px',
    minHeight: '26px',
  },
  messagingResizeButton: {
    alignItems: 'center',
    background: 'var(--azul-light, #e8f4fb)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--gris-borde, #d1d5db)',
    borderRadius: '6px',
    color: 'var(--azul-hover, #005f95)',
    cursor: 'pointer',
    display: 'inline-flex',
    flex: '0 0 auto',
    height: '26px',
    justifyContent: 'center',
    padding: 0,
    width: '28px',
  },
  messagingResizeButtonActive: {
    background: 'var(--azul, #0077b7)',
    borderColor: 'var(--azul, #0077b7)',
    color: 'var(--blanco, #ffffff)',
    cursor: 'default',
  },
  banner: {
    width: '100%',
    background: 'var(--azul-deep)',
    color: 'var(--blanco)',
    border: '1px solid rgba(184, 221, 240, 0.38)',
    borderRadius: '12px',
    boxShadow: '0 14px 40px rgba(0, 79, 124, 0.34)',
    padding: '14px',
    maxHeight: '240px',
    overflow: 'hidden',
    transform: 'translateX(0)',
    opacity: 1,
    transition: `transform ${EXIT_ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${EXIT_ANIMATION_MS}ms ease, margin-top ${PROMOTE_ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), padding ${PROMOTE_ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), max-height ${PROMOTE_ANIMATION_MS}ms ease, box-shadow ${PROMOTE_ANIMATION_MS}ms ease`,
  },
  bannerAuthenticated: {
    maxHeight: 'none',
    overflow: 'visible',
  },
  noticeShell: {
    backgroundColor: 'var(--azul-deep)',
    backgroundImage: `
      linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02)),
      linear-gradient(rgba(184, 221, 240, 0.12) 1px, transparent 1px),
      linear-gradient(90deg, rgba(184, 221, 240, 0.12) 1px, transparent 1px)
    `,
    backgroundSize: 'auto, 38px 38px, 38px 38px',
    borderLeft: '5px solid var(--azul)',
    color: 'var(--blanco)',
  },
  noticeBusiness: {
    borderColor: 'rgba(184, 221, 240, 0.48)',
    borderLeftColor: 'var(--azul)',
    boxShadow: '0 14px 40px rgba(0, 79, 124, 0.34), inset 0 1px 0 rgba(255,255,255,0.12)',
  },
  noticeOperational: {
    borderColor: 'var(--amarillo-borde)',
    borderLeftColor: 'var(--amarillo)',
    boxShadow: '0 14px 40px rgba(0, 79, 124, 0.34), inset 0 1px 0 rgba(251, 191, 36, 0.18)',
  },
  noticeMarketing: {
    borderColor: 'var(--verde-borde)',
    borderLeftColor: 'var(--verde)',
    boxShadow: '0 14px 40px rgba(0, 79, 124, 0.34), inset 0 1px 0 rgba(52, 211, 153, 0.18)',
  },
  noticeLegal: {
    borderColor: 'var(--rojo-borde)',
    borderLeftColor: 'var(--rojo-soft)',
    boxShadow: '0 14px 40px rgba(0, 79, 124, 0.34), inset 0 1px 0 rgba(232, 85, 85, 0.20)',
  },
  noticeHigh: {
    borderWidth: '1px 1px 1px 6px',
    boxShadow: '0 16px 46px rgba(0, 79, 124, 0.42), inset 0 1px 0 rgba(255,255,255,0.16)',
  },
  noticeCritical: {
    borderWidth: '1px 1px 1px 7px',
    boxShadow: '0 18px 52px rgba(201, 64, 64, 0.30), inset 0 1px 0 rgba(232, 85, 85, 0.24)',
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
    color: 'rgba(255, 255, 255, 0.86)',
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
    marginTop: '14px',
    display: 'flex',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: '10px',
  },
  primaryBtn: {
    border: 'none',
    background: 'var(--blanco)',
    color: 'var(--azul-deep)',
    borderRadius: '8px',
    padding: '9px 12px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  secondaryBtn: {
    border: '1px solid rgba(255,255,255,0.28)',
    background: 'rgba(255,255,255,0.08)',
    color: 'var(--blanco)',
    borderRadius: '8px',
    padding: '9px 12px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  tab: {
    position: 'fixed',
    right: 0,
    bottom: '86px',
    zIndex: 10002,
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
    fontSize: '7px',
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
