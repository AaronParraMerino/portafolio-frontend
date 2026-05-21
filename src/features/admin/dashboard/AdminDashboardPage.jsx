import { Link } from 'react-router-dom';
import { getStoredUser } from '../../../shared/utils/authStorage';
import AdminHeader from '../layout/AdminHeader';
import { getAdminSectionConfig } from '../layout/adminHeaderConfig';

const QUICK_MODULES = [
  {
    id: 'users',
    label: 'Usuarios',
    desc: 'Administrar cuentas, roles y estados.',
    to: '/admin/users',
    icon: (<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9" /></>),
  },
  {
    id: 'events',
    label: 'Eventos',
    desc: 'Publicar y organizar actividades.',
    to: '/admin/events',
    icon: (<><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M8 2v4" /><path d="M16 2v4" /><path d="M3 10h18" /></>),
  },
  {
    id: 'notices',
    label: 'Avisos',
    desc: 'Gestionar comunicados visibles.',
    to: '/admin/notices',
    icon: (<><path d="M4 11v2a2 2 0 0 0 2 2h2l4 4v-4h4l4-4V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6Z" /><path d="M8 7h8" /></>),
  },
  {
    id: 'reports',
    label: 'Reportes',
    desc: 'Revisar actividad y crecimiento.',
    to: '/admin/reports',
    icon: (<><path d="M4 19V5a2 2 0 0 1 2-2h8l6 6v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" /><path d="M14 3v6h6" /><path d="M8 16v-4" /><path d="M12 16V9" /></>),
  },
  {
    id: 'audit',
    label: 'Bitacora',
    desc: 'Seguimiento de acciones sensibles.',
    to: '/admin/audit',
    icon: (<><path d="M8 6h13" /><path d="M8 12h13" /><path d="M8 18h13" /><path d="M3 6h.01" /><path d="M3 12h.01" /><path d="M3 18h.01" /></>),
  },
  {
    id: 'backups',
    label: 'Respaldos',
    desc: 'Preparado para copias y restauracion.',
    to: '/admin/backups',
    icon: (<><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></>),
  },
];

function getUserName() {
  const user = getStoredUser();
  return [user?.nombre || user?.name, user?.apellido || user?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim() || 'Administrador';
}

export default function AdminDashboardPage({ section = 'dashboard' }) {
  const config = getAdminSectionConfig(section);
  const userName = getUserName();

  return (
    <>
      <AdminHeader
        eyebrow={config.eyebrow}
        title={config.title}
      />

      <div className="adm-page">
        <section className="adm-hero">
          <div>
            <span className="adm-hero-label">CreaFolio Admin</span>
            <h2>Hola, {userName}</h2>
            <p>
              Este dashboard queda listo como base visual y de navegacion para la gestion del sistema.
            </p>
          </div>

          <div className="adm-hero-panel">
            <span>Rol activo</span>
            <strong>Administrador</strong>
          </div>
        </section>

        <div className="adm-stats-grid">
          <div className="adm-stat-card">
            <span>Usuarios</span>
            <strong>--</strong>
            <small>Gestion pendiente</small>
          </div>
          <div className="adm-stat-card">
            <span>Eventos</span>
            <strong>--</strong>
            <small>Modulo preparado</small>
          </div>
          <div className="adm-stat-card">
            <span>Avisos</span>
            <strong>--</strong>
            <small>Modulo preparado</small>
          </div>
          <div className="adm-stat-card">
            <span>Sistema</span>
            <strong>OK</strong>
            <small>Navegacion activa</small>
          </div>
        </div>

        <div className="adm-section-head">
          <h3>Gestion rapida</h3>
          <span />
        </div>

        <div className="adm-module-grid">
          {QUICK_MODULES.map((item) => (
            <Link key={item.id} to={item.to} className="adm-module-card">
              <div className="adm-module-card-top">
                <span className="adm-module-icon">
                  <svg viewBox="0 0 24 24">
                    {item.icon}
                  </svg>
                </span>
              </div>
              <strong>{item.label}</strong>
              <p>{item.desc}</p>
            </Link>
          ))}
        </div>

        {section !== 'dashboard' && (
          <div className="adm-placeholder">
            <strong>{config.title}</strong>
            <p>
              Esta ruta ya esta conectada al sidebar. Queda lista para implementar la pantalla real cuando toque desarrollar este modulo.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
