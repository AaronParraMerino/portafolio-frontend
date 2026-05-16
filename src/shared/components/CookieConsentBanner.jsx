import { useEffect, useRef, useState } from 'react';
import PoliticaCookies from '../../features/auth/components/PoliticasC';
import {
  aceptarCookiesYGuardarHardware,
  wasCookieAccepted,
  wasCookieDismissed,
  markCookieDismissed,
} from '../../features/auth/services/sessionService';

export default function CookieConsentBanner({ onVisibilityChange }) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [entering, setEntering] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const autoHideRef = useRef(null);

  const clearAutoHide = () => {
    if (autoHideRef.current) {
      clearTimeout(autoHideRef.current);
      autoHideRef.current = null;
    }
  };

  const startAutoHide = () => {
    clearAutoHide();
    autoHideRef.current = setTimeout(() => {
      closeBanner();
    }, 20000);
  };

  const showBannerWithDrop = () => {
    setVisible(true);
    setClosing(false);
    setEntering(true);
    setCollapsed(true);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntering(false));
    });
  };

  useEffect(() => {
    if (wasCookieAccepted() || wasCookieDismissed()) {
      return;
    }

    showBannerWithDrop();

    return () => clearAutoHide();
  }, []);

  useEffect(() => {
    if (onVisibilityChange) {
      onVisibilityChange(visible && !closing && !collapsed);
    }
  }, [visible, closing, collapsed, onVisibilityChange]);

  const openBanner = () => {
    clearAutoHide();
    setClosing(false);
    setEntering(false);
    setCollapsed(false);
    startAutoHide();
  };

  const closeBanner = (persistNo = false) => {
    clearAutoHide();

    if (persistNo) {
      markCookieDismissed();
    }

    setClosing(true);
    setTimeout(() => setVisible(false), 420);
  };

  const openPolicyModal = () => {
    clearAutoHide();
    setClosing(true);
    setCollapsed(true);
    setShowPolicyModal(true);
  };

  const onPolicyModalClose = () => {
    setShowPolicyModal(false);

    if (wasCookieAccepted()) {
      closeBanner();
      return;
    }

    // Reaparece escondido en el borde.
    showBannerWithDrop();
  };

  const handleAccept = async () => {
    try {
      await aceptarCookiesYGuardarHardware();
    } catch (error) {
      console.error('No se pudo guardar consentimiento/hardware:', error);
    } finally {
      closeBanner();
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <>
      {!showPolicyModal && collapsed && (
        <button
          type="button"
          style={styles.tab}
          onClick={openBanner}
          aria-label="Abrir aviso de cookies"
          title="Abrir cookies"
        >
          <span style={styles.tabLabel}>Cookies</span>
        </button>
      )}

      {!collapsed && (
      <div style={styles.rail}>
      <div
        style={{
          ...styles.banner,
          ...(entering ? styles.bannerEntering : null),
          ...(closing ? styles.bannerClosing : null),
        }}
        role="dialog"
        aria-live="polite"
      >
        <h4 style={styles.title}>Cookies del sitio</h4>
        <p style={styles.text}>
          Usamos cookies para mejorar tu experiencia. Si aceptas, guardamos consentimiento y huella técnica.
        </p>
        <button
          type="button"
          style={styles.linkBtn}
          onClick={openPolicyModal}
        >
          Ver política de cookies
        </button>
        <div style={styles.actions}>
          <button type="button" style={styles.secondaryBtn} onClick={() => closeBanner(true)}>
            Cerrar
          </button>
          <button type="button" style={styles.primaryBtn} onClick={handleAccept}>
            Aceptar cookies
          </button>
        </div>
      </div>
      </div>
      )}

      {showPolicyModal && <PoliticaCookies onClose={onPolicyModalClose} />}
    </>
  );
}

const styles = {
  rail: {
    position: 'fixed',
    right: '10px',
    bottom: '74px',
    transform: 'translateX(0)',
    display: 'flex',
    flexDirection: 'column-reverse',
    gap: '10px',
    zIndex: 10000,
    pointerEvents: 'none',
    width: 'min(360px, calc(100vw - 34px))',
  },
  banner: {
    pointerEvents: 'auto',
    width: '100%',
    background: '#0d1b2a',
    color: '#e0e7ff',
    border: '1px solid #1b263b',
    borderRadius: '12px',
    boxShadow: '0 14px 40px rgba(0,0,0,0.35)',
    padding: '14px',
    transform: 'translateY(0)',
    opacity: 1,
    transition: 'transform 200ms ease, opacity 200ms ease',
  },
  bannerEntering: {
    transform: 'translateY(18px)',
    opacity: 0,
  },
  bannerClosing: {
    transform: 'translateX(110%)',
    opacity: 0,
  },
  tab: {
    position: 'fixed',
    right: 0,
    bottom: '86px',
    zIndex: 10000,
    border: '1px solid rgba(255,255,255,0.22)',
    borderRight: 0,
    background: '#0077b7',
    color: '#ffffff',
    borderRadius: '10px 0 0 10px',
    width: '20px',
    minHeight: '70px',
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
  title: {
    margin: '0 0 8px',
    fontSize: '16px',
    fontWeight: 700,
  },
  text: {
    margin: 0,
    fontSize: '13px',
    lineHeight: 1.4,
    color: '#c8d5f4',
  },
  linkBtn: {
    display: 'inline-block',
    marginTop: '10px',
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
    marginTop: '12px',
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
    padding: '8px 12px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  secondaryBtn: {
    border: '1px solid #334155',
    background: '#111827',
    color: '#cbd5e1',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '12px',
    cursor: 'pointer',
  },
};
