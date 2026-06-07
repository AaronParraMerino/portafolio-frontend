export const ADMIN_SECTIONS = {
  dashboard: {
    title: 'Dashboard',
    eyebrow: 'General',
    titleKey: 'admin.layout.section.dashboard.title',
    eyebrowKey: 'admin.layout.eyebrow.general',
  },
  profile: {
    title: 'Perfil',
    eyebrow: 'General',
    titleKey: 'admin.layout.section.profile.title',
    eyebrowKey: 'admin.layout.eyebrow.general',
  },
  users: {
    title: 'Usuarios',
    eyebrow: 'Gestion',
    titleKey: 'admin.layout.section.users.title',
    eyebrowKey: 'admin.layout.eyebrow.management',
  },
  events: {
    title: 'Eventos',
    eyebrow: 'Gestion',
    titleKey: 'admin.layout.section.events.title',
    eyebrowKey: 'admin.layout.eyebrow.management',
  },
  reports: {
    title: 'Reportes',
    eyebrow: 'Gestion',
    titleKey: 'admin.layout.section.reports.title',
    eyebrowKey: 'admin.layout.eyebrow.management',
  },
  audit: {
    title: 'Bitacora',
    eyebrow: 'Gestion',
    titleKey: 'admin.layout.section.audit.title',
    eyebrowKey: 'admin.layout.eyebrow.management',
  },
  backups: {
    title: 'Respaldos',
    eyebrow: 'Gestion',
    titleKey: 'admin.layout.section.backups.title',
    eyebrowKey: 'admin.layout.eyebrow.management',
  },
  settings: {
    title: 'Configuracion',
    eyebrow: 'Cuenta',
    titleKey: 'admin.layout.section.settings.title',
    eyebrowKey: 'admin.layout.eyebrow.account',
  },
  linkAccount: {
    title: 'Vincular Cuenta',
    eyebrow: 'Cuenta / Configuracion',
    titleKey: 'admin.layout.section.linkAccount.title',
    eyebrowKey: 'admin.layout.eyebrow.accountSettings',
  },
  password: {
    title: 'Cambiar Contrasena',
    eyebrow: 'Cuenta / Configuracion',
    titleKey: 'admin.layout.section.password.title',
    eyebrowKey: 'admin.layout.eyebrow.accountSettings',
  },
  sessions: {
    title: 'Sesiones Activas',
    eyebrow: 'Cuenta / Configuracion',
    titleKey: 'admin.layout.section.sessions.title',
    eyebrowKey: 'admin.layout.eyebrow.accountSettings',
  },
  deleteAccount: {
    title: 'Cuenta inactiva',
    eyebrow: 'Cuenta / Configuracion',
    titleKey: 'admin.layout.section.deleteAccount.title',
    eyebrowKey: 'admin.layout.eyebrow.accountSettings',
  },
};

export function getAdminSectionConfig(section) {
  return ADMIN_SECTIONS[section] || ADMIN_SECTIONS.dashboard;
}
