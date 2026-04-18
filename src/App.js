import { useEffect, useState } from 'react';

// 1. Primero los estilos propios (variables CSS)
import './shared/styles/global.css';

// 2. Luego Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';

import AppRouter from './core/router/AppRouter';
import BannerCenter from './shared/components/BannerCenter';
import { initSesionBase } from './features/auth/services/sessionService';
import { subscribeToApiActivity } from './services/http/Service';

export default function App() {
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);

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
      <AppRouter isBackendAvailable={isBackendAvailable} />
      <BannerCenter />
    </>
  );
}