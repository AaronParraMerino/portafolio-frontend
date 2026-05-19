import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { preloadDashboardData } from '../services/dashboardPrefetchService';
import '../styles/dashboard.css';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    preloadDashboardData();
  }, []);

  return (
    <div className="dsh-layout">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(v => !v)}
      />

      <main className={`dsh-main${collapsed ? ' collapsed' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}
