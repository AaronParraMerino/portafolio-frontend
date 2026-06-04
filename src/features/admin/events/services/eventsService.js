import BASE_URL from '../../../../services/http/const';

export const EVENT_PAGE_SIZE = 9;
const STORAGE_URL = process.env.REACT_APP_STORAGE_URL || 'http://localhost:8000/storage';

export const EVENT_WORKSPACE_VIEWS = [
  { id: 'requests', label: 'Solicitudes' },
  { id: 'events', label: 'Eventos' },
  { id: 'history', label: 'Historial' },
];

export const EVENT_STATUS_FILTERS = [
  { id: 'todos', label: 'Todos', tone: 'primary' },
  { id: 'activo', label: 'Activos', tone: 'success' },
  { id: 'programado', label: 'Programados', tone: 'warning' },
  { id: 'borrador', label: 'Borradores', tone: 'muted' },
  { id: 'pausado', label: 'Pausados', tone: 'warning' },
  { id: 'suspendido', label: 'Suspendidos', tone: 'danger' },
  { id: 'cancelado', label: 'Cancelados', tone: 'danger' },
];

export const EVENT_TYPES = [
  { id: 'todos', label: 'Todos' },
  { id: 'taller', label: 'Taller' },
  { id: 'charla', label: 'Charla' },
  { id: 'webinar', label: 'Webinar' },
  { id: 'feria', label: 'Feria' },
  { id: 'capacitacion', label: 'Capacitacion' },
  { id: 'networking', label: 'Networking' },
  { id: 'curso', label: 'Curso' },
  { id: 'trabajo', label: 'Trabajo' },
  { id: 'convocatoria', label: 'Convocatoria' },
];

export const EVENT_COMMUNICATION_TYPES = [
  { id: 'todos', label: 'Todos' },
  { id: 'plataforma', label: 'Plataforma', tone: 'primary' },
  { id: 'oportunidad', label: 'Oportunidad', tone: 'success' },
  { id: 'seguridad', label: 'Seguridad', tone: 'warning' },
  { id: 'mantenimiento', label: 'Mantenimiento', tone: 'info' },
  { id: 'comunidad', label: 'Comunidad', tone: 'primary' },
  { id: 'urgente', label: 'Urgente', tone: 'danger' },
];

export const EVENT_COMMUNICATION_STATUS = [
  { id: 'todos', label: 'Todos' },
  { id: 'borrador', label: 'Borrador', tone: 'muted' },
  { id: 'programado', label: 'Programado', tone: 'warning' },
  { id: 'enviado', label: 'Enviado', tone: 'success' },
  { id: 'archivado', label: 'Archivado', tone: 'muted' },
];

export const EVENT_AUDIENCE_SEGMENTS = [
  { id: 'inscritos', label: 'Inscritos' },
  { id: 'interesados', label: 'Interesados' },
  { id: 'lista_espera', label: 'Lista de espera' },
  { id: 'base', label: 'Base general' },
  { id: 'asistieron', label: 'Asistieron' },
  { id: 'no_asistieron', label: 'No asistieron' },
];

export const EVENT_TARGET_MODES = [
  {
    id: 'all_users',
    label: 'Enviar a todos los usuarios',
    helper: 'Ideal para ferias, cursos generales o anuncios abiertos.',
  },
  {
    id: 'segmented',
    label: 'Segmentar por perfil',
    helper: 'Usa habilidades y experiencia para dirigir mejor la convocatoria.',
  },
];

export const EVENT_PROFILE_TARGET_GROUPS = [
  {
    id: 'technicalSkills',
    label: 'Habilidades tecnicas',
    helper: 'Selecciona tecnologias, herramientas o areas tecnicas del portafolio.',
    searchPlaceholder: 'Buscar habilidad tecnica...',
    options: [],
  },
  {
    id: 'softSkills',
    label: 'Habilidades blandas',
    helper: 'Filtra por capacidades personales y colaborativas.',
    searchPlaceholder: 'Buscar habilidad blanda...',
    options: [],
  },
  {
    id: 'academicExperience',
    label: 'Experiencia academica',
    helper: 'Dirige el evento segun formacion, cursos o avance academico.',
    searchPlaceholder: 'Buscar experiencia academica...',
    options: [],
  },
  {
    id: 'workExperience',
    label: 'Experiencia laboral',
    helper: 'Usa roles, areas o nivel profesional para la convocatoria.',
    searchPlaceholder: 'Buscar experiencia laboral...',
    options: [],
  },
];

export const EVENT_COMMUNICATION_AUDIENCES = [
  { id: 'all_users', label: 'Todos los usuarios', helper: 'Comunicados generales de la plataforma.' },
  { id: 'portfolio_users', label: 'Usuarios con portafolio', helper: 'Personas que ya publicaron o completan su perfil.' },
  { id: 'new_users', label: 'Usuarios nuevos', helper: 'Onboarding, bienvenida y pasos iniciales.' },
  { id: 'admins', label: 'Equipo administrador', helper: 'Mensajes internos de gestion.' },
];

export const EVENT_COMMUNICATION_CHANNELS = [
  { id: 'push', label: 'Push' },
  { id: 'email', label: 'Correo' },
  { id: 'inapp', label: 'In-app' },
];

export const EVENT_STATS = [
  {
    id: 'requests',
    label: 'Solicitudes',
    helper: 'Publicantes por revisar',
    tone: 'primary',
  },
  {
    id: 'activo',
    label: 'Eventos activos',
    helper: 'Publicados y visibles',
    tone: 'success',
  },
  {
    id: 'pausado',
    label: 'Pausados',
    helper: 'Requieren seguimiento',
    tone: 'warning',
  },
  {
    id: 'suspendido',
    label: 'Suspendidos',
    helper: 'Fuera de publicacion',
    tone: 'danger',
  },
];

export function createEventsWorkspaceShell() {
  return {
    events: [],
    publisherRequests: [],
    communications: [],
    templates: [],
    history: [],
    profileTargets: {
      technicalSkills: [],
      softSkills: [],
      academicExperience: [],
      workExperience: [],
    },
    sourceReady: false,
    supportsMutations: false,
    pageSize: EVENT_PAGE_SIZE,
  };
}

export function normalizeEventsWorkspace(payload = {}) {
  const base = createEventsWorkspaceShell();
  hydrateEventProfileTargetGroups(payload.profileTargets);

  return {
    ...base,
    ...payload,
    events: Array.isArray(payload.events) ? payload.events : base.events,
    publisherRequests: Array.isArray(payload.publisherRequests)
      ? payload.publisherRequests
      : (Array.isArray(payload.requests) ? payload.requests : base.publisherRequests),
    communications: Array.isArray(payload.communications) ? payload.communications : base.communications,
    templates: Array.isArray(payload.templates) ? payload.templates : base.templates,
    history: Array.isArray(payload.history) ? payload.history : base.history,
    profileTargets: payload.profileTargets || base.profileTargets,
    pageSize: Number.isInteger(payload.pageSize) && payload.pageSize > 0
      ? payload.pageSize
      : base.pageSize,
  };
}

export function hydrateEventProfileTargetGroups(profileTargets = {}) {
  EVENT_PROFILE_TARGET_GROUPS.forEach((group) => {
    group.options = Array.isArray(profileTargets[group.id]) ? profileTargets[group.id] : [];
  });
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

function buildEventFormData(payload = {}, method = null) {
  const formData = new FormData();

  if (method) {
    formData.append('_method', method);
  }

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || key === 'imagePreview') return;

    if (key === 'imageFile') {
      if (value instanceof File) {
        formData.append('imagen_portada', value);
      }
      return;
    }

    if (Array.isArray(value) || (typeof value === 'object' && !(value instanceof File))) {
      formData.append(key, JSON.stringify(value));
      return;
    }

    formData.append(key, value);
  });

  return formData;
}

function formatEventImageUrl(path) {
  if (!path) return '';

  const value = String(path).trim();

  if (!value) return '';
  if (value.startsWith('http://')) return value;
  if (value.startsWith('https://')) return value;
  if (value.startsWith('blob:')) return value;
  if (value.startsWith('data:')) return value;

  return `${STORAGE_URL}/${value.replace(/^\/+/, '')}`;
}

export async function fetchEventsWorkspace() {
  const response = await fetch(`${BASE_URL}/administrador/eventos/workspace`, {
    headers: getAdminRequestHeaders(),
  });
  const payload = await parseAdminResponse(response, 'No se pudo cargar el workspace de eventos.');

  return normalizeEventsWorkspace(payload);
}

export async function createAdminEvent(payload) {
  const response = await fetch(`${BASE_URL}/administrador/eventos`, {
    method: 'POST',
    headers: {
      ...getAdminRequestHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseAdminResponse(response, 'No se pudo crear el evento.');
}

export async function updateAdminEvent(eventId, payload) {
  const response = await fetch(`${BASE_URL}/administrador/eventos/${eventId}`, {
    method: 'PUT',
    headers: {
      ...getAdminRequestHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseAdminResponse(response, 'No se pudo actualizar el evento.');
}

export async function createAdminEventCommunication(payload) {
  const response = await fetch(`${BASE_URL}/administrador/eventos/comunicaciones`, {
    method: 'POST',
    headers: {
      ...getAdminRequestHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseAdminResponse(response, 'No se pudo crear la comunicacion.');
}

export async function updateAdminEventCommunication(communicationId, payload) {
  const response = await fetch(`${BASE_URL}/administrador/eventos/comunicaciones/${communicationId}`, {
    method: 'PUT',
    headers: {
      ...getAdminRequestHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseAdminResponse(response, 'No se pudo actualizar la comunicacion.');
}

export async function createAdminEventTemplate(payload) {
  const response = await fetch(`${BASE_URL}/administrador/eventos/plantillas`, {
    method: 'POST',
    headers: {
      ...getAdminRequestHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseAdminResponse(response, 'No se pudo crear la plantilla.');
}

export async function updateAdminEventTemplate(templateId, payload) {
  const response = await fetch(`${BASE_URL}/administrador/eventos/plantillas/${templateId}`, {
    method: 'PUT',
    headers: {
      ...getAdminRequestHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseAdminResponse(response, 'No se pudo actualizar la plantilla.');
}

export async function approvePublisherRequest(requestId, reason) {
  const response = await fetch(`${BASE_URL}/administrador/publicantes/solicitudes/${requestId}/aprobar`, {
    method: 'PATCH',
    headers: {
      ...getAdminRequestHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ motivo: reason }),
  });

  return parseAdminResponse(response, 'No se pudo aprobar la solicitud.');
}

export async function rejectPublisherRequest(requestId, reason) {
  const response = await fetch(`${BASE_URL}/administrador/publicantes/solicitudes/${requestId}/rechazar`, {
    method: 'PATCH',
    headers: {
      ...getAdminRequestHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ motivo: reason }),
  });

  return parseAdminResponse(response, 'No se pudo rechazar la solicitud.');
}

export async function applyAdminEventAction(eventId, action, reason) {
  const endpoint = action === 'eliminar'
    ? `${BASE_URL}/administrador/eventos/${eventId}`
    : `${BASE_URL}/administrador/eventos/${eventId}/${action}`;
  const response = await fetch(endpoint, {
    method: action === 'eliminar' ? 'DELETE' : 'PATCH',
    headers: {
      ...getAdminRequestHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ motivo: reason }),
  });

  return parseAdminResponse(response, 'No se pudo aplicar la accion administrativa.');
}

export async function createPublisherRequest(payload) {
  const response = await fetch(`${BASE_URL}/publicante/solicitudes`, {
    method: 'POST',
    headers: {
      ...getAdminRequestHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseAdminResponse(response, 'No se pudo enviar la solicitud.');
}

export async function fetchPublisherEvents() {
  const response = await fetch(`${BASE_URL}/publicante/eventos`, {
    headers: getAdminRequestHeaders(),
  });
  const payload = await parseAdminResponse(response, 'No se pudieron cargar tus eventos.');

  return Array.isArray(payload?.data) ? payload.data : [];
}

async function fetchEventCatalog(path) {
  const response = await fetch(`${BASE_URL}/buscar/catalogos/${path}`, {
    headers: getAdminRequestHeaders(),
  });
  const payload = await parseAdminResponse(response, 'No se pudo cargar la segmentacion.');
  const list = Array.isArray(payload) ? payload : (payload?.data || payload?.items || []);

  return [...new Set(list
    .map((item) => (typeof item === 'string'
      ? item
      : (item?.nombre || item?.name || item?.titulo || item?.valor || item?.cargo || '')))
    .map((item) => String(item || '').trim())
    .filter(Boolean))];
}

export async function fetchEventProfileTargets() {
  const [
    technicalSkills,
    softSkills,
    experiencePositions,
  ] = await Promise.all([
    fetchEventCatalog('habilidades-tecnicas'),
    fetchEventCatalog('habilidades-blandas'),
    fetchEventCatalog('cargos-experiencia'),
  ]);

  return {
    technicalSkills,
    softSkills,
    academicExperience: experiencePositions,
    workExperience: experiencePositions,
  };
}

export async function createPublisherEvent(payload) {
  const response = await fetch(`${BASE_URL}/publicante/eventos`, {
    method: 'POST',
    headers: getAdminRequestHeaders(),
    body: buildEventFormData(payload),
  });

  return parseAdminResponse(response, 'No se pudo crear el evento.');
}

export async function updatePublisherEvent(eventId, payload) {
  const response = await fetch(`${BASE_URL}/publicante/eventos/${eventId}`, {
    method: 'POST',
    headers: getAdminRequestHeaders(),
    body: buildEventFormData(payload, 'PUT'),
  });

  return parseAdminResponse(response, 'No se pudo actualizar el evento.');
}

export function normalizeEvent(item = {}) {
  const segments = item.segments || item.segmentos || item.segs || [];
  const channels = item.channels || item.canales || [];
  const targetSelections = item.targetSelections || item.target_selections || {};
  const segmentChips = Array.isArray(segments)
    ? segments
    : Object.values(targetSelections).flat().filter(Boolean);
  const imageUrl = formatEventImageUrl(
    item.imageUrl
    || item.image_url
    || item.imagen_url
    || item.imagen_portada_url
    || item.imagen_portada_path
    || item.banner_url
    || item.imagen
  );

  return {
    id: item.id || item.id_evento || item.eventId,
    title: item.title || item.titulo || item.nombre || 'Evento sin titulo',
    description: item.description || item.desc || item.descripcion || 'Sin descripcion disponible.',
    type: item.type || item.tipo || 'taller',
    status: item.status || item.estado || 'borrador',
    startsAt: item.startsAt || item.fecha_inicio || item.startDate || '',
    endsAt: item.endsAt || item.fecha_fin || item.endDate || '',
    date: item.date || item.fecha || item.fecha_inicio || item.fechaEvento || '--',
    time: item.time || item.hora || item.hora_inicio || '',
    location: item.location || item.lugar || item.ubicacion || 'Sin lugar',
    imageUrl,
    imagePreview: item.imagePreview || item.preview || '',
    imageFile: item.imageFile || null,
    publisherId: item.publisherId || item.publicante_id || item.usuario_creador_id || item.usuario_id,
    publisherName: item.publisherName || item.publicante || item.nombre_publicante || item.creador?.nombre || item.usuario?.nombre || 'Publicante sin nombre',
    publisherEmail: item.publisherEmail || item.correo_publicante || item.creador?.correo || item.usuario?.correo || 'Sin correo',
    targetMode: item.targetMode || item.target_mode || 'all_users',
    targetSelections,
    capacity: Number(item.capacity ?? item.cupo ?? item.cupos ?? 0),
    registered: Number(item.registered ?? item.inscritos ?? item.asistentes ?? 0),
    interested: Number(item.interested ?? item.interesados ?? 0),
    waitlist: Number(item.waitlist ?? item.espera ?? 0),
    communicationsCount: Number(item.communicationsCount ?? item.comunicaciones ?? item.avisos ?? 0),
    segments: segmentChips,
    channels: Array.isArray(channels) ? channels : [],
    raw: item,
  };
}

export function normalizeEventCommunication(item = {}) {
  const channels = item.channels || item.canales || [];
  const segments = item.segments || item.segmentos || [];

  return {
    id: item.id || item.id_comunicacion,
    eventId: item.eventId || item.id_evento,
    eventTitle: item.eventTitle || item.evento || item.titulo_evento || 'Evento sin vincular',
    title: item.title || item.titulo || 'Comunicacion sin titulo',
    body: item.body || item.cuerpo || item.preview || 'Sin contenido disponible.',
    type: item.type || item.tipo || 'plataforma',
    status: item.status || item.estado || 'borrador',
    urgency: item.urgency || item.urgencia || 'baja',
    audience: Number(item.audience ?? item.dest ?? item.destinatarios ?? 0),
    date: item.date || item.fecha || item.scheduledAt || item.createdAt || '--',
    channels: Array.isArray(channels) ? channels : [],
    segments: Array.isArray(segments) ? segments : [],
    pinned: !!item.pinned,
    raw: item,
  };
}

export function normalizePublisherRequest(item = {}) {
  const sourceUser = item.user || item.usuario || {};
  const name = item.name || item.nombre || item.legalName || item.nombre_legal || sourceUser.nombre || 'Usuario sin nombre';
  const email = item.email || item.correo || sourceUser.email || sourceUser.correo || item.backupEmail || item.correo_respaldo || 'Sin correo';
  const avatarUrl = item.fotoPerfilThumbUrl
    || item.foto_perfil_thumb_url
    || item.avatarUrl
    || item.avatar_url
    || sourceUser.fotoPerfilThumbUrl
    || sourceUser.foto_perfil_thumb_url
    || sourceUser.avatarUrl
    || sourceUser.avatar_url
    || '';

  return {
    id: item.id || item.id_solicitud || item.requestId,
    userId: item.userId || item.usuario_id || item.id_usuario || sourceUser.id || sourceUser.id_usuario,
    name,
    email,
    phone: item.phone || item.telefono || 'Sin telefono',
    fotoPerfilThumbUrl: avatarUrl,
    avatarUrl,
    user: {
      id: item.userId || item.usuario_id || item.id_usuario || sourceUser.id || sourceUser.id_usuario,
      nombre: name,
      email,
      correo: email,
      fotoPerfilThumbUrl: avatarUrl,
    },
    documentId: item.documentId || item.documento || item.ci || 'Sin documento',
    organization: item.organization || item.organizacion || 'Independiente',
    role: item.role || item.cargo || 'No especificado',
    reason: item.reason || item.motivo || 'Sin motivo registrado.',
    experience: item.experience || item.experiencia || '',
    links: item.links || item.enlaces || '',
    status: item.status || item.estado || 'pendiente',
    date: item.date || item.fecha || item.createdAt || item.creado || '--',
    raw: item,
  };
}

export function normalizeEventTemplate(item = {}) {
  const channels = item.channels || item.canales || [];

  return {
    id: item.id || item.id_plantilla,
    title: item.title || item.titulo || item.name || 'Plantilla sin nombre',
    body: item.body || item.cuerpo || item.descripcion || 'Sin contenido disponible.',
    type: item.type || item.tipo || 'plataforma',
    channels: Array.isArray(channels) ? channels : [],
    used: Number(item.used ?? item.usadas ?? 0),
    raw: item,
  };
}

export function normalizeEventHistoryItem(item = {}) {
  const channels = item.channels || item.canales || [];

  return {
    id: item.id || item.id_historial,
    title: item.title || item.titulo || item.action || 'Registro sin titulo',
    description: item.description || item.descripcion || item.body || '',
    type: item.type || item.tipo || 'plataforma',
    status: item.status || item.estado || 'enviado',
    target: item.target || item.destino || item.eventTitle || item.evento || 'Sin destino',
    date: item.date || item.fecha || item.createdAt || item.creado || '--',
    actor: item.actor || item.usuario || item.admin || item.adminName || item.nombre_admin || 'Sistema',
    module: item.module || item.modulo || 'Eventos',
    action: item.action || item.accion || item.title || item.titulo || 'Accion registrada',
    reason: item.reason || item.motivo || item.observacion || '',
    entity: item.entity || item.entidad || item.eventTitle || item.evento || item.target || item.destino || 'Registro',
    ip: item.ip || item.ip_address || '',
    channels: Array.isArray(channels) ? channels : [],
    raw: item,
  };
}

export function getEventStatusMeta(status) {
  return EVENT_STATUS_FILTERS.find((item) => item.id === status) || EVENT_STATUS_FILTERS[3];
}

export function getEventTypeMeta(type) {
  return EVENT_TYPES.find((item) => item.id === type) || EVENT_TYPES[1];
}

export function getEventCommunicationTypeMeta(type) {
  return EVENT_COMMUNICATION_TYPES.find((item) => item.id === type) || EVENT_COMMUNICATION_TYPES[1];
}

export function getEventCommunicationStatusMeta(status) {
  return EVENT_COMMUNICATION_STATUS.find((item) => item.id === status) || EVENT_COMMUNICATION_STATUS[1];
}

export function buildEventMetrics(events = [], communications = [], requests = []) {
  const normalizedEvents = events.map(normalizeEvent);

  return {
    total: normalizedEvents.length,
    requests: requests.length,
    activo: normalizedEvents.filter((event) => event.status === 'activo').length,
    programado: normalizedEvents.filter((event) => event.status === 'programado').length,
    pausado: normalizedEvents.filter((event) => event.status === 'pausado').length,
    suspendido: normalizedEvents.filter((event) => ['suspendido', 'cancelado'].includes(event.status)).length,
    cancelado: normalizedEvents.filter((event) => event.status === 'cancelado').length,
  };
}

export function buildEventWorkspaceCounts({
  sourceReady,
  events = [],
  communications = [],
  templates = [],
  history = [],
  requests = [],
}) {
  if (!sourceReady) {
    return {
      requests: '--',
      events: '--',
      history: '--',
      templates: '--',
    };
  }

  return {
    requests: requests.length,
    events: events.length,
    history: history.length,
    templates: templates.length,
  };
}

export function getEventsPageSummary({
  sourceReady,
  filteredCount,
  currentPage,
  pageSize,
}) {
  if (!sourceReady) return 'Sin registros cargados';
  if (!filteredCount) return 'Sin resultados';

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, filteredCount);

  return `${start}-${end} de ${filteredCount} eventos`;
}

export function getEventsEmptyState({
  sourceReady,
  hasQuery,
  hasFilters,
}) {
  if (!sourceReady) {
    return {
      title: 'Sin eventos registrados',
      description: 'Aqui apareceran los eventos creados para cursos, trabajos, ferias o convocatorias.',
    };
  }

  if (hasQuery || hasFilters) {
    return {
      title: 'Sin eventos encontrados',
      description: 'Ajusta la busqueda o los filtros para revisar otros eventos.',
    };
  }

  return {
    title: 'Sin eventos registrados',
    description: 'Aqui apareceran los eventos cuando exista informacion disponible.',
  };
}

export function estimateEventAudience(event = {}, segments = []) {
  const normalizedEvent = normalizeEvent(event);

  if (!segments.length) return 0;

  return segments.reduce((total, segment) => {
    if (segment === 'inscritos') return total + normalizedEvent.registered;
    if (segment === 'interesados') return total + normalizedEvent.interested;
    if (segment === 'lista_espera') return total + normalizedEvent.waitlist;
    if (segment === 'base') return total + Math.max(normalizedEvent.registered, normalizedEvent.interested);
    if (segment === 'asistieron') return total + Number(event.attended ?? event.asistieron ?? 0);
    if (segment === 'no_asistieron') return total + Number(event.missed ?? event.no_asistieron ?? 0);
    return total;
  }, 0);
}
