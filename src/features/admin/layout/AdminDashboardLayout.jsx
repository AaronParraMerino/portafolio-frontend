import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import '../../dashboard/styles/dashboard.css';
import '../styles/admin.css';

export default function AdminDashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="dsh-layout adm-layout">
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(value => !value)}
      />

      <main className={`dsh-main${collapsed ? ' collapsed' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}
