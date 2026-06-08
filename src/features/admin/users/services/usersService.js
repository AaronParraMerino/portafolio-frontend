import BASE_URL from '../../../../services/http/const';

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
  { id: 'bloqueado', label: 'Bloqueados' },
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
    helper: 'Solo lectura temporal.',
  },
  bloqueado: {
    label: 'Bloqueado',
    tone: 'danger',
    helper: 'Sin acceso indefinido.',
  },
  inactivo: {
    label: 'Inactivo',
    tone: 'muted',
    helper: 'Cuenta desactivada por el usuario.',
  },
};

export const USER_ROLE_META = {
  administrador: {
    label: 'Administrador',
    tone: 'primary',
    helper: 'Gestion completa del sistema.',
  },
  admin: {
    label: 'Administrador',
    tone: 'primary',
    helper: 'Gestion completa del sistema.',
  },
  usuario: {
    label: 'Usuario',
    tone: 'muted',
    helper: 'Acceso regular al portafolio.',
  },
  publicante: {
    label: 'Publicante',
    tone: 'info',
    helper: 'Puede crear eventos con limite mensual.',
  },
  publicador: {
    label: 'Publicante',
    tone: 'info',
    helper: 'Puede crear eventos con limite mensual.',
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
    id: 'bloqueado',
    label: 'Bloqueados',
    helper: 'Acceso restringido',
    tone: 'danger',
  },
  {
    id: 'inactivo',
    label: 'Inactivos',
    helper: 'Cuentas desactivadas',
    tone: 'muted',
  },
];

export const USER_TABLE_COLUMNS = [
  { id: 'user', label: 'Usuario' },
  { id: 'role', label: 'Rol' },
  { id: 'status', label: 'Estado' },
  { id: 'sessions', label: 'Sesiones' },
  { id: 'lastAccess', label: 'Ultimo acceso' },
  { id: 'registeredAt', label: 'Registro' },
  { id: 'actions', label: '' },
];

export const USER_ROLE_ACTIONS = [
  {
    id: 'asignar_publicante',
    label: 'Asignar rol publicante',
    description: 'Habilita la creacion de eventos con limite de 3 publicaciones mensuales.',
    tone: 'success',
    targetRole: 'publicante',
  },
  {
    id: 'quitar_publicante',
    label: 'Quitar rol publicante',
    description: 'Retira el permiso para crear eventos y registra un motivo administrativo.',
    tone: 'danger',
    targetRole: 'usuario',
  },
];

export const USER_BULK_ACTIONS = [
  { id: 'activar', label: 'Activar', tone: 'success' },
  { id: 'pausar', label: 'Pausar', tone: 'warning' },
  { id: 'bloquear', label: 'Bloquear', tone: 'danger' },
  { id: 'inactivar', label: 'Inactivar', tone: 'danger' },
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
    description: 'Mantiene el contenido visible y limita la cuenta a consultas.',
    tone: 'warning',
  },
  {
    id: 'bloquear',
    label: 'Bloquear cuenta',
    description: 'Mantiene el bloqueo hasta una revision manual del equipo.',
    tone: 'danger',
  },
  {
    id: 'inactivar',
    label: 'Inactivar cuenta',
    description: 'Desactiva la cuenta, oculta su contenido y cierra sus sesiones.',
    tone: 'danger',
  },
];

export const USER_COMMUNICATION_SEGMENTS = [
  { id: 'todos', label: 'Todos', status: null },
  { id: 'activos', label: 'Activos', status: 'activo' },
  { id: 'pausados', label: 'Pausados', status: 'pausado' },
  { id: 'bloqueados', label: 'Bloqueados', status: 'bloqueado' },
  { id: 'inactivos', label: 'Inactivos', status: 'inactivo' },
];

export const USER_COMMUNICATION_CHANNELS = [
  { id: 'inapp', label: 'In-app' },
  { id: 'email', label: 'Correo' },
];

export const USER_GLOBAL_NOTICE_TYPES = [
  { id: 'operacional_tecnico', label: 'Operacional y tecnico', tone: 'warning', priority: 'alta' },
  { id: 'negocio_logistica_eventos', label: 'Negocio, logistica y eventos', tone: 'primary', priority: 'normal' },
  { id: 'comunicacion_marketing_global', label: 'Comunicacion y marketing global', tone: 'success', priority: 'baja' },
  { id: 'legal_cumplimiento', label: 'Legal y cumplimiento', tone: 'danger', priority: 'alta' },
];

export const USER_NOTICE_TYPES = [
  { id: 'bienvenida', label: 'Bienvenida', tone: 'success' },
  { id: 'cuenta', label: 'Cuenta', tone: 'primary' },
  { id: 'seguridad', label: 'Seguridad', tone: 'danger' },
  { id: 'actividad', label: 'Actividad', tone: 'warning' },
  { id: 'sistema', label: 'Sistema', tone: 'muted' },
  { id: 'capacitacion', label: 'Capacitacion', tone: 'info' },
];

export const USER_ALL_NOTICE_TYPES = [
  ...USER_GLOBAL_NOTICE_TYPES,
  ...USER_NOTICE_TYPES,
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
  return USER_ALL_NOTICE_TYPES.find((item) => item.id === type) || USER_NOTICE_TYPES[4];
}

export function getUserNoticeStatusMeta(status) {
  return USER_NOTICE_STATUSES.find((item) => item.id === status) || USER_NOTICE_STATUSES[1];
}

export function estimateUsersAudience({
  users = [],
  segments = [],
}) {
  if (!Array.isArray(segments) || !segments.length) return 0;
  if (segments.includes('todos')) return users.length;

  const selectedStatuses = USER_COMMUNICATION_SEGMENTS
    .filter((segment) => segment.status && segments.includes(segment.id))
    .map((segment) => segment.status);
  const selectedRoles = USER_COMMUNICATION_SEGMENTS
    .filter((segment) => segment.role && segments.includes(segment.id))
    .map((segment) => segment.role);

  if (!selectedStatuses.length && !selectedRoles.length) return 0;

  return users.filter((user) => (
    selectedStatuses.includes(user.estado)
    || selectedRoles.includes(getUserRoleValue(user))
  )).length;
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
    supportsActivation: false,
    supportsPausing: false,
    supportsBlocking: false,
    supportsCommunications: false,
    supportsRoleManagement: false,
    pageSize: USER_PAGE_SIZE,
  };
}

export async function fetchUsersDirectory() {
  const token = localStorage.getItem('tokenPORT') || sessionStorage.getItem('tokenPORT');

  if (!token) {
    throw new Error('No hay sesion administrativa activa.');
  }

  const response = await fetch(`${BASE_URL}/administrador/usuarios`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message || 'No se pudo cargar la lista de usuarios.');
  }

  return normalizeUsersDirectory(payload);
}

function getAdminRequestHeaders() {
  const token = localStorage.getItem('tokenPORT') || sessionStorage.getItem('tokenPORT');

  if (!token) {
    throw new Error('No hay sesion administrativa activa.');
  }

  return {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function parseAdminResponse(response, fallbackMessage) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message || fallbackMessage);
  }

  return payload;
}

export async function fetchUserSessions(userId) {
  const response = await fetch(`${BASE_URL}/administrador/usuarios/${userId}/sesiones`, {
    headers: getAdminRequestHeaders(),
  });
  const payload = await parseAdminResponse(response, 'No se pudieron cargar las sesiones.');

  return Array.isArray(payload?.data) ? payload.data : [];
}

export async function closeUserSession(userId, sessionId) {
  const response = await fetch(`${BASE_URL}/administrador/usuarios/${userId}/sesiones/${sessionId}`, {
    method: 'DELETE',
    headers: getAdminRequestHeaders(),
  });

  return parseAdminResponse(response, 'No se pudo cerrar la sesion.');
}

export async function closeAllUserSessions(userId) {
  const response = await fetch(`${BASE_URL}/administrador/usuarios/${userId}/sesiones`, {
    method: 'DELETE',
    headers: getAdminRequestHeaders(),
  });

  return parseAdminResponse(response, 'No se pudieron cerrar las sesiones.');
}

export async function inactivateUserAccount(userId, payload = {}) {
  const response = await fetch(`${BASE_URL}/administrador/usuarios/${userId}`, {
    method: 'DELETE',
    headers: {
      ...getAdminRequestHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseAdminResponse(response, 'No se pudo inactivar la cuenta.');
}

export async function activateUserAccount(userId, payload = {}) {
  const response = await fetch(`${BASE_URL}/administrador/usuarios/${userId}/activar`, {
    method: 'PATCH',
    headers: {
      ...getAdminRequestHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseAdminResponse(response, 'No se pudo activar la cuenta.');
}

export async function blockUserAccount(userId, payload = {}) {
  const response = await fetch(`${BASE_URL}/administrador/usuarios/${userId}/bloquear`, {
    method: 'PATCH',
    headers: {
      ...getAdminRequestHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseAdminResponse(response, 'No se pudo bloquear la cuenta.');
}

export async function pauseUserAccount(userId, payload = {}) {
  const response = await fetch(`${BASE_URL}/administrador/usuarios/${userId}/pausar`, {
    method: 'PATCH',
    headers: {
      ...getAdminRequestHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseAdminResponse(response, 'No se pudo pausar la cuenta.');
}

export async function updateUserRole(userId, payload = {}) {
  const response = await fetch(`${BASE_URL}/administrador/usuarios/${userId}/rol`, {
    method: 'PATCH',
    headers: {
      ...getAdminRequestHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseAdminResponse(response, 'No se pudo actualizar el rol del usuario.');
}

export async function sendAdminNotice(payload) {
  const response = await fetch(`${BASE_URL}/administrador/notificaciones`, {
    method: 'POST',
    headers: {
      ...getAdminRequestHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseAdminResponse(response, 'No se pudo enviar el aviso.');
}

export async function createGlobalAdminNotice(payload) {
  const response = await fetch(`${BASE_URL}/admin/avisos`, {
    method: 'POST',
    headers: {
      ...getAdminRequestHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseAdminResponse(response, 'No se pudo crear el aviso global.');
}

export async function createAdminNoticeTemplate(payload) {
  const response = await fetch(`${BASE_URL}/administrador/usuarios/plantillas`, {
    method: 'POST',
    headers: {
      ...getAdminRequestHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseAdminResponse(response, 'No se pudo guardar la plantilla.');
}

export async function updateAdminNoticeTemplate(templateId, payload) {
  const response = await fetch(`${BASE_URL}/administrador/usuarios/plantillas/${templateId}`, {
    method: 'PUT',
    headers: {
      ...getAdminRequestHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseAdminResponse(response, 'No se pudo actualizar la plantilla.');
}

export async function deleteAdminNoticeTemplate(templateId) {
  const response = await fetch(`${BASE_URL}/administrador/usuarios/plantillas/${templateId}`, {
    method: 'DELETE',
    headers: getAdminRequestHeaders(),
  });

  return parseAdminResponse(response, 'No se pudo eliminar la plantilla.');
}

export async function registerAdminNoticeTemplateUse(templateId) {
  const response = await fetch(`${BASE_URL}/administrador/usuarios/plantillas/${templateId}/usar`, {
    method: 'POST',
    headers: getAdminRequestHeaders(),
  });

  return parseAdminResponse(response, 'No se pudo usar la plantilla.');
}

export function normalizeUsersDirectory(payload = {}) {
  const base = createUsersDirectoryShell();
  const items = Array.isArray(payload.items) ? payload.items : base.items;

  return {
    ...base,
    ...payload,
    items: getUniqueUsersById(items),
    communications: Array.isArray(payload.communications) ? payload.communications : base.communications,
    history: Array.isArray(payload.history) ? payload.history : base.history,
    templates: Array.isArray(payload.templates) ? payload.templates : base.templates,
    pageSize: Number.isInteger(payload.pageSize) && payload.pageSize > 0
      ? payload.pageSize
      : base.pageSize,
  };
}

function getUniqueUsersById(users = []) {
  const uniqueUsers = new Map();

  users.forEach((user) => {
    const id = user?.id ?? user?.id_usuario ?? user?.usuario_id;

    if (id === undefined || id === null) return;
    if (!uniqueUsers.has(String(id))) {
      uniqueUsers.set(String(id), user);
    }
  });

  return Array.from(uniqueUsers.values());
}

export function buildUsersMetrics(users = []) {
  return {
    total: users.length,
    activo: users.filter((user) => user.estado === 'activo').length,
    pausado: users.filter((user) => user.estado === 'pausado').length,
    bloqueado: users.filter((user) => user.estado === 'bloqueado').length,
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

export function getUserRoleValue(user = {}) {
  const rawRole = String(user.rol || user.role || user.tipo || 'usuario').trim().toLowerCase();

  if (rawRole === 'publicador' || rawRole === 'publisher') return 'publicante';
  if (rawRole === 'admin') return 'administrador';

  return rawRole || 'usuario';
}

export function getUserRoleMeta(user = {}) {
  const role = getUserRoleValue(user);

  return USER_ROLE_META[role] || USER_ROLE_META.usuario;
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
