import { useEffect, useState } from 'react';

// 1. Primero los estilos propios (variables CSS)
import './shared/styles/global.css';

// 2. Luego Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';

import AppRouter from './core/router/AppRouter';
import BannerCenter from './shared/components/BannerCenter';
import { initSesionBase } from './features/auth/services/sessionService';
import { subscribeToApiActivity } from './services/http/Service';
import {
  installAuth401Interceptor,
  onAuthExpired,
  refreshStoredUser,
} from './shared/utils/authStorage';

const ACCOUNT_REFRESH_MS = 8 * 60 * 1000;

export default function App() {
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const restoreFetch = installAuth401Interceptor();
    const unsubscribe = onAuthExpired(() => {
      setSessionExpired(true);
    });

    return () => {
      unsubscribe();
      restoreFetch();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const refreshAccount = () => {
      refreshStoredUser().catch(() => {
        // Network errors are temporary; the next interval, focus, or refresh retries.
      });
    };

    const refreshWhenVisible = () => {
      if (!cancelled && document.visibilityState === 'visible') {
        refreshAccount();
      }
    };

    refreshAccount();
    const intervalId = window.setInterval(refreshAccount, ACCOUNT_REFRESH_MS);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function checkBackendStatus() {
      // Primera carga: crea cookie si no existe.
      // Cargas siguientes: backend usa foliToken y refresca.
      const session = await initSesionBase();

      if (isMounted) {
        setIsBackendAvailable(Boolean(session));
      }
    }

    checkBackendStatus();

    const unsubscribeApiActivity = subscribeToApiActivity(({ reachable }) => {
      if (isMounted) {
        setIsBackendAvailable(Boolean(reachable));
      }
    });

    const handleWindowFocus = () => {
      checkBackendStatus();
    };
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      isMounted = false;
      unsubscribeApiActivity();
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  return (
    <>
      {sessionExpired && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
            background: '#fff3cd', borderBottom: '1px solid #ffc107',
            padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontFamily: 'sans-serif', fontSize: '14px', color: '#856404',
          }}
        >
          <span>⚠️ Tu sesión ha expirado. Por favor vuelve a iniciar sesión.</span>
          <button
            onClick={() => setSessionExpired(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#856404' }}
          >
            ×
          </button>
        </div>
      )}
      <AppRouter isBackendAvailable={isBackendAvailable} />
      <BannerCenter />
    </>
  );
}
