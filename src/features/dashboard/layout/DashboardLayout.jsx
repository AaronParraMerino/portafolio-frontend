import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { preloadDashboardData } from '../services/dashboardPrefetchService';
import BASE_URL from '../../../services/http/const';
import { getStoredUser } from '../../../shared/utils/authStorage';
import '../styles/dashboard.css';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [account, setAccount] = useState(() => getStoredUser());
  const paused = account?.estado === 'pausado';

  useEffect(() => {
    preloadDashboardData();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem('tokenPORT') || sessionStorage.getItem('tokenPORT');

    if (!token) return undefined;

    const refreshAccount = () => {
      fetch(`${BASE_URL}/auth/me`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.ok ? response.json() : null)
        .then((payload) => {
          if (cancelled || !payload?.data) return;
          localStorage.setItem('usuario', JSON.stringify(payload.data));
          setAccount(payload.data);
        })
        .catch(() => {});
    };

    refreshAccount();
    const timerId = window.setInterval(refreshAccount, 30000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshAccount();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      window.clearInterval(timerId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className={`dsh-layout${paused ? ' dsh-layout--paused' : ''}`}>
      <Sidebar
        collapsed={collapsed}
        paused={paused}
        onToggle={() => setCollapsed(v => !v)}
      />

      <main className={`dsh-main${collapsed ? ' collapsed' : ''}`}>
        {paused ? (
          <aside className="dsh-paused-banner" role="status">
            <strong>Cuenta en pausa</strong>
            <span>
              Solo puedes consultar tu informacion. Motivo: {account.razon_pausa
                || 'Tu cuenta fue puesta en pausa por administracion.'}
            </span>
          </aside>
        ) : null}
        <Outlet />
      </main>
    </div>
  );
}
