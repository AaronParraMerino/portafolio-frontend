import BASE_URL from '../../../../services/http/const';

export const AUDIT_PAGE_SIZE = 15;

export const AUDIT_METRICS = [
  { id: 'total', labelKey: 'adminAudit.stats.total', helperKey: 'adminAudit.stats.totalHelper', tone: 'primary' },
  { id: 'today', labelKey: 'adminAudit.stats.today', helperKey: 'adminAudit.stats.todayHelper', tone: 'success' },
  { id: 'users', labelKey: 'adminAudit.stats.users', helperKey: 'adminAudit.stats.usersHelper', tone: 'warning' },
  { id: 'security', labelKey: 'adminAudit.stats.security', helperKey: 'adminAudit.stats.securityHelper', tone: 'danger' },
];

export const AUDIT_PRESET_MODULES = [
  { id: 'todos', labelKey: 'adminAudit.filters.allModules' },
  { id: 'usuarios', labelKey: 'adminAudit.modules.users' },
  { id: 'perfiles', labelKey: 'adminAudit.modules.profiles' },
  { id: 'visibilidad_campos', labelKey: 'adminAudit.modules.visibility' },
  { id: 'personal_access_tokens', labelKey: 'adminAudit.modules.sessions' },
  { id: 'token_recuperaciones', labelKey: 'adminAudit.modules.recovery' },
  { id: 'admin_eventos', labelKey: 'adminAudit.modules.events' },
  { id: 'publicante_solicitudes', labelKey: 'adminAudit.modules.publisherRequests' },
];

export const AUDIT_ACTION_GROUPS = [
  { id: 'todos', labelKey: 'adminAudit.filters.allActions' },
  { id: 'create', labelKey: 'adminAudit.actionGroups.create' },
  { id: 'update', labelKey: 'adminAudit.actionGroups.update' },
  { id: 'delete', labelKey: 'adminAudit.actionGroups.delete' },
  { id: 'sesion', labelKey: 'adminAudit.actionGroups.sessions' },
  { id: 'recuperacion', labelKey: 'adminAudit.actionGroups.recovery' },
];

export function createAuditShell() {
  return {
    items: [],
    metrics: {
      total: 0,
      today: 0,
      users: 0,
      sessions: 0,
      security: 0,
    },
    filters: {
      actions: [],
      modules: [],
    },
    meta: {
      currentPage: 1,
      lastPage: 1,
      perPage: AUDIT_PAGE_SIZE,
      total: 0,
      from: 0,
      to: 0,
    },
  };
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

export async function fetchAuditLogs(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === 'todos') return;
    query.set(key, value);
  });

  const url = `${BASE_URL}/administrador/bitacoras${query.toString() ? `?${query}` : ''}`;
  const response = await fetch(url, {
    headers: getAdminRequestHeaders(),
  });
  const payload = await parseAdminResponse(response, 'No se pudo cargar la bitacora administrativa.');

  return normalizeAuditPayload(payload);
}

export function normalizeAuditPayload(payload = {}) {
  const base = createAuditShell();

  return {
    ...base,
    ...payload,
    items: Array.isArray(payload.items) ? payload.items.map(normalizeAuditItem) : base.items,
    filters: {
      ...base.filters,
      ...(payload.filters || {}),
      actions: Array.isArray(payload.filters?.actions) ? payload.filters.actions : base.filters.actions,
      modules: Array.isArray(payload.filters?.modules) ? payload.filters.modules : base.filters.modules,
    },
    meta: {
      ...base.meta,
      ...(payload.meta || {}),
    },
    metrics: {
      ...base.metrics,
      ...(payload.metrics || {}),
    },
  };
}

export function normalizeAuditItem(item = {}) {
  const actor = item.actor || {};
  const affectedUser = item.usuarioAfectado || item.usuario_afectado || {};

  return {
    id: item.id || item.id_bitacora,
    action: item.accion || item.action || '',
    actionLabel: item.accionLabel || item.actionLabel || humanize(item.accion || item.action),
    description: item.descripcion || item.description || '',
    date: item.fecha || item.date || '',
    dateHuman: item.fechaHumana || item.dateHuman || item.fecha || '--',
    ipAddress: item.ipAddress || item.ip_address || '',
    userAgent: item.userAgent || item.user_agent || '',
    module: item.tablaAfectada || item.tabla_afectada || item.module || '',
    moduleLabel: item.moduloLabel || item.moduleLabel || humanize(item.tablaAfectada || item.module),
    recordId: item.registroAfectadoId || item.registro_afectado_id || '',
    actor,
    affectedUser,
    actorName: actor.nombre || actor.name || 'Sistema',
    actorEmail: actor.correo || actor.email || '',
    affectedUserName: affectedUser.nombre || affectedUser.name || '',
    affectedUserEmail: affectedUser.correo || affectedUser.email || '',
  };
}

export function getAuditActionTone(action = '') {
  const value = String(action).toLowerCase();

  if (value.includes('delete') || value.includes('bloque') || value.includes('eliminar')) return 'danger';
  if (value.includes('recuperacion') || value.includes('token')) return 'warning';
  if (value.includes('create') || value.includes('inicio') || value.includes('activar')) return 'success';
  if (value.includes('update') || value.includes('cambio') || value.includes('editar')) return 'primary';

  return 'muted';
}

export function matchesActionGroup(action = '', group = 'todos') {
  if (group === 'todos') return true;

  return String(action).toLowerCase().includes(group);
}

function humanize(value = '') {
  const text = String(value || '').trim();

  if (!text) return 'Sistema';

  return text.replace(/_/g, ' ').replace(/^\w/, (letter) => letter.toUpperCase());
}
