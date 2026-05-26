export const ADMIN_SECTIONS = {
  dashboard: {
    title: 'Dashboard',
    eyebrow: 'General',
  },
  profile: {
    title: 'Perfil',
    eyebrow: 'General',
  },
  users: {
    title: 'Usuarios',
    eyebrow: 'Gestion',
  },
  events: {
    title: 'Eventos',
    eyebrow: 'Gestion',
  },
  notices: {
    title: 'Avisos',
    eyebrow: 'Gestion',
  },
  reports: {
    title: 'Reportes',
    eyebrow: 'Gestion',
  },
  audit: {
    title: 'Bitacora',
    eyebrow: 'Gestion',
  },
  backups: {
    title: 'Respaldos',
    eyebrow: 'Gestion',
  },
  settings: {
    title: 'Configuracion',
    eyebrow: 'Cuenta',
  },
  linkAccount: {
    title: 'Vincular Cuenta',
    eyebrow: 'Cuenta / Configuracion',
  },
  password: {
    title: 'Cambiar Contrasena',
    eyebrow: 'Cuenta / Configuracion',
  },
  sessions: {
    title: 'Sesiones Activas',
    eyebrow: 'Cuenta / Configuracion',
  },
  deleteAccount: {
    title: 'Cuenta inactiva',
    eyebrow: 'Cuenta / Configuracion',
  },
};

export function getAdminSectionConfig(section) {
  return ADMIN_SECTIONS[section] || ADMIN_SECTIONS.dashboard;
}
