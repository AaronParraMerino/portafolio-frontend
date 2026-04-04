import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

/* ══════════════════════════════════════
   DashboardLayout.jsx
   Layout raíz del dashboard:
   · Sidebar colapsable (estado aquí)
   · En móvil (<768px) el sidebar está oculto
     → margin-left: 0 siempre
══════════════════════════════════════ */
export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <style>{`
        .dsh-layout {
          min-height: 100vh;
          background: var(--fondo, #f2f2f2);
        }

        /* Desktop: main empuja según ancho del sidebar */
        .dsh-main {
          margin-left: 240px;
          margin-top: var(--nav-height, 60px);
          min-height: calc(100vh - var(--nav-height, 60px));
          transition: margin-left .22s cubic-bezier(.4,0,.2,1);
        }
        .dsh-main.collapsed {
          margin-left: 64px;
        }

        /* Móvil: sin sidebar → sin margen izquierdo */
        @media (max-width: 767px) {
          .dsh-main,
          .dsh-main.collapsed {
            margin-left: 0 !important;
          }
        }
      `}</style>

      <div className="dsh-layout">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(v => !v)}
        />

        <main className={`dsh-main${collapsed ? ' collapsed' : ''}`}>
          <Outlet />
        </main>
      </div>
    </>
  );
}