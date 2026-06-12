import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { preloadDashboardData } from '../services/dashboardPrefetchService';
import { getStoredUser, onStoredUserUpdated } from '../../../shared/utils/authStorage';
import { useLanguage } from '../../../core/i18n';
import '../styles/dashboard.css';

function isPausedAllowedTarget(target) {
  return target instanceof Element
    && !!target.closest('a[href], [data-paused-allow="true"]');
}

function blockPausedInteraction(event) {
  if (isPausedAllowedTarget(event.target)) return;

  event.preventDefault();
  event.stopPropagation();
}

function blockPausedKeyboardInteraction(event) {
  if (!['Enter', ' '].includes(event.key) || isPausedAllowedTarget(event.target)) return;

  event.preventDefault();
  event.stopPropagation();
}

export default function DashboardLayout() {
  const { t } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [account, setAccount] = useState(() => getStoredUser());
  const paused = account?.estado === 'pausado';

  useEffect(() => {
    preloadDashboardData();
  }, []);

  useEffect(() => {
    return onStoredUserUpdated((event) => {
      if (event?.detail) setAccount(event.detail);
    });
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
            <strong>{t('dashboard.paused.badge')}</strong>
            <span>
              {t('dashboard.paused.message', {
                reason: account.razon_pausa || t('dashboard.paused.defaultReason'),
              })}
            </span>
          </aside>
        ) : null}
        <div
          className="dsh-paused-content"
          aria-disabled={paused || undefined}
          onClickCapture={paused ? blockPausedInteraction : undefined}
          onSubmitCapture={paused ? blockPausedInteraction : undefined}
          onKeyDownCapture={paused ? blockPausedKeyboardInteraction : undefined}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}
