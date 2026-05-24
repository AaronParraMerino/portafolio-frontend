export const USER_PAGE_SIZE = 10;

export const USER_MANAGEMENT_VIEWS = [
  { id: 'users', label: 'Usuarios' },
  { id: 'communications', label: 'Avisos' },
  { id: 'templates', label: 'Plantillas' },
  { id: 'history', label: 'Historial' },
];

export const USER_STATUS_FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'activo', label: 'Activos' },
  { id: 'pausado', label: 'Pausados' },
  { id: 'suspendido', label: 'Suspendidos' },
  { id: 'inactivo', label: 'Inactivos' },
];

export const USER_STATUS_META = {
  activo: {
    label: 'Activo',
    tone: 'success',
    helper: 'Con acceso completo.',
  },
  pausado: {
    label: 'Pausado',
    tone: 'warning',
    helper: 'Acceso detenido temporalmente.',
  },
  suspendido: {
    label: 'Suspendido',
    tone: 'danger',
    helper: 'Sin acceso indefinido.',
  },
  inactivo: {
    label: 'Inactivo',
    tone: 'muted',
    helper: 'Sin actividad reciente.',
  },
};

export const USER_STATS = [
  {
    id: 'total',
    label: 'Total usuarios',
    helper: 'Registros en plataforma',
    tone: 'primary',
  },
  {
    id: 'activo',
    label: 'Activos',
    helper: 'Con acceso completo',
    tone: 'success',
  },
  {
    id: 'pausado',
    label: 'Pausados',
    helper: 'Revision temporal',
    tone: 'warning',
  },
  {
    id: 'suspendido',
    label: 'Suspendidos',
    helper: 'Acceso restringido',
    tone: 'danger',
  },
  {
    id: 'inactivo',
    label: 'Inactivos',
    helper: 'Sin actividad reciente',
    tone: 'muted',
  },
];

export const USER_TABLE_COLUMNS = [
  { id: 'selection', label: '' },
  { id: 'user', label: 'Usuario' },
  { id: 'status', label: 'Estado' },
  { id: 'sessions', label: 'Sesiones' },
  { id: 'lastAccess', label: 'Ultimo acceso' },
  { id: 'registeredAt', label: 'Registro' },
  { id: 'actions', label: '' },
];

export const USER_BULK_ACTIONS = [
  { id: 'activar', label: 'Activar', tone: 'success' },
  { id: 'pausar', label: 'Pausar', tone: 'warning' },
  { id: 'suspender', label: 'Suspender', tone: 'danger' },
  { id: 'eliminar', label: 'Eliminar', tone: 'danger' },
];

export const USER_DETAIL_ACTIONS = [
  {
    id: 'activar',
    label: 'Activar cuenta',
    description: 'Restablece el acceso y prepara una notificacion al usuario.',
    tone: 'success',
  },
  {
    id: 'pausar',
    label: 'Pausar cuenta',
    description: 'Bloquea el acceso temporalmente sin eliminar la cuenta.',
    tone: 'warning',
  },
  {
    id: 'suspender',
    label: 'Suspender cuenta',
    description: 'Mantiene el bloqueo hasta una revision manual del equipo.',
    tone: 'danger',
  },
  {
    id: 'eliminar',
    label: 'Eliminar usuario',
    description: 'Accion irreversible disponible cuando se integre el backend.',
    tone: 'danger',
  },
];

export const USER_COMMUNICATION_SEGMENTS = [
  { id: 'todos', label: 'Todos', status: null },
  { id: 'activos', label: 'Activos', status: 'activo' },
  { id: 'pausados', label: 'Pausados', status: 'pausado' },
  { id: 'suspendidos', label: 'Suspendidos', status: 'suspendido' },
  { id: 'inactivos', label: 'Inactivos', status: 'inactivo' },
  { id: 'seleccionados', label: 'Seleccionados', status: null },
];

export const USER_COMMUNICATION_CHANNELS = [
  { id: 'inapp', label: 'In-app' },
  { id: 'email', label: 'Correo' },
  { id: 'push', label: 'Push' },
];

export const USER_NOTICE_TYPES = [
  { id: 'bienvenida', label: 'Bienvenida', tone: 'success' },
  { id: 'cuenta', label: 'Cuenta', tone: 'primary' },
  { id: 'seguridad', label: 'Seguridad', tone: 'danger' },
  { id: 'actividad', label: 'Actividad', tone: 'warning' },
  { id: 'sistema', label: 'Sistema', tone: 'muted' },
  { id: 'capacitacion', label: 'Capacitacion', tone: 'info' },
];

export const USER_NOTICE_URGENCY = [
  { id: 'baja', label: 'Baja', helper: 'Informativa' },
  { id: 'media', label: 'Media', helper: 'Seguimiento' },
  { id: 'alta', label: 'Alta', helper: 'Prioritaria' },
];

export const USER_NOTICE_STATUSES = [
  { id: 'todos', label: 'Todos' },
  { id: 'borrador', label: 'Borrador', tone: 'muted' },
  { id: 'programado', label: 'Programado', tone: 'warning' },
  { id: 'enviado', label: 'Enviado', tone: 'success' },
  { id: 'archivado', label: 'Archivado', tone: 'muted' },
];

export function getUserNoticeTypeMeta(type) {
  return USER_NOTICE_TYPES.find((item) => item.id === type) || USER_NOTICE_TYPES[4];
}

export function getUserNoticeStatusMeta(status) {
  return USER_NOTICE_STATUSES.find((item) => item.id === status) || USER_NOTICE_STATUSES[1];
}

export function estimateUsersAudience({
  users = [],
  selectedIds = [],
  segments = [],
}) {
  if (!Array.isArray(segments) || !segments.length) return 0;
  if (segments.includes('todos')) return users.length;
  if (segments.includes('seleccionados')) return selectedIds.length;

  const selectedStatuses = USER_COMMUNICATION_SEGMENTS
    .filter((segment) => segment.status && segments.includes(segment.id))
    .map((segment) => segment.status);

  if (!selectedStatuses.length) return 0;

  return users.filter((user) => selectedStatuses.includes(user.estado)).length;
}

export function createUsersDirectoryShell() {
  return {
    items: [],
    communications: [],
    history: [],
    templates: [],
    sourceReady: false,
    supportsMutations: false,
    supportsSessions: false,
    pageSize: USER_PAGE_SIZE,
  };
}

export function normalizeUsersDirectory(payload = {}) {
  const base = createUsersDirectoryShell();

  return {
    ...base,
    ...payload,
    items: Array.isArray(payload.items) ? payload.items : base.items,
    communications: Array.isArray(payload.communications) ? payload.communications : base.communications,
    history: Array.isArray(payload.history) ? payload.history : base.history,
    templates: Array.isArray(payload.templates) ? payload.templates : base.templates,
    pageSize: Number.isInteger(payload.pageSize) && payload.pageSize > 0
      ? payload.pageSize
      : base.pageSize,
  };
}

export function buildUsersMetrics(users = []) {
  return {
    total: users.length,
    activo: users.filter((user) => user.estado === 'activo').length,
    pausado: users.filter((user) => user.estado === 'pausado').length,
    suspendido: users.filter((user) => user.estado === 'suspendido').length,
    inactivo: users.filter((user) => user.estado === 'inactivo').length,
  };
}

export function buildUsersWorkspaceCounts({
  sourceReady,
  users = [],
  communications = [],
  history = [],
  templates = [],
}) {
  if (!sourceReady) {
    return {
      users: '--',
      communications: '--',
      history: '--',
      templates: '--',
    };
  }

  return {
    users: users.length,
    communications: communications.length,
    history: history.length,
    templates: templates.length,
  };
}

export function getUserStatusMeta(status) {
  return USER_STATUS_META[status] || USER_STATUS_META.inactivo;
}

export function getUserInitials(name = '') {
  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase() || 'US';
}

export function getUserAvatarPalette(seedValue = '') {
  const palettes = [
    { background: 'rgba(15, 118, 110, .16)', color: '#0f766e' },
    { background: 'rgba(20, 184, 166, .16)', color: '#0d9488' },
    { background: 'rgba(245, 158, 11, .14)', color: '#b45309' },
    { background: 'rgba(201, 64, 64, .12)', color: '#c94040' },
    { background: 'rgba(99, 102, 241, .13)', color: '#4f46e5' },
  ];

  const key = String(seedValue);
  const code = key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return palettes[code % palettes.length];
}

export function getUserSessionCount(user = {}) {
  if (Array.isArray(user.sessions)) return user.sessions.length;

  const value = Number(user.sesionesActivas);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function getUsersPageSummary({
  sourceReady,
  filteredCount,
  currentPage,
  pageSize,
}) {
  if (!sourceReady) {
    return 'Sincronizacion pendiente';
  }

  if (!filteredCount) {
    return 'Sin resultados';
  }

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, filteredCount);

  return `${start}-${end} de ${filteredCount} usuarios`;
}

export function getUsersEmptyState({
  sourceReady,
  hasQuery,
  hasFilters,
}) {
  if (!sourceReady) {
    return {
      title: 'Gestion lista para conectar',
      description: 'La tabla, filtros, acciones y panel de sesiones quedaron preparados para recibir datos reales del backend.',
    };
  }

  if (hasQuery || hasFilters) {
    return {
      title: 'Sin resultados',
      description: 'Prueba con otra busqueda o ajusta los filtros para encontrar coincidencias.',
    };
  }

  return {
    title: 'Sin usuarios registrados',
    description: 'Aqui apareceran las cuentas cuando exista informacion disponible en la plataforma.',
  };
}
