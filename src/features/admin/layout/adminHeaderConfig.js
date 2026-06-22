export const ADMIN_SECTIONS = {
  dashboard: {
    title: 'Dashboard',
    eyebrow: 'General',
    titleKey: 'admin.layout.section.dashboard.title',
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
  denuncias: {
    title: 'Denuncias',
    eyebrow: 'Gestion',
  },
  backups: {
    title: 'Respaldos',
    eyebrow: 'Gestion',
    titleKey: 'admin.layout.section.backups.title',
    eyebrowKey: 'admin.layout.eyebrow.management',
  },
};

export function getAdminSectionConfig(section) {
  return ADMIN_SECTIONS[section] || ADMIN_SECTIONS.dashboard;
}
