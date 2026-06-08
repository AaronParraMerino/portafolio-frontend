import BASE_URL from '../../../../services/http/const';
import {
  EVENTS_PAGE_TTL_MS,
  HOME_EVENTS_TTL_MS,
  clearHomeEventsCacheForUser,
  homeEventsCacheKey,
  readHomeEventsCache,
  withHomeEventsCache,
  writeHomeEventsCache,
} from './homeEventsCache';

export const HOME_EVENTS_PAGE_SIZE = 20;
export const EVENTS_LIST_PAGE_SIZE = 12;
export const HOME_HIGHLIGHT_LIMIT = 5;
export const HOME_CAROUSEL_LIMIT = 10;

export const EVENT_TYPES_META = {
  taller: { label: 'Taller', tone: 'blue', icon: 'book' },
  charla: { label: 'Charla', tone: 'violet', icon: 'mic' },
  webinar: { label: 'Webinar', tone: 'cyan', icon: 'monitor' },
  feria: { label: 'Feria', tone: 'green', icon: 'calendar' },
  capacitacion: { label: 'Capacitacion', tone: 'amber', icon: 'graduation' },
  networking: { label: 'Networking', tone: 'pink', icon: 'users' },
  curso: { label: 'Curso', tone: 'indigo', icon: 'book' },
  trabajo: { label: 'Trabajo', tone: 'slate', icon: 'briefcase' },
  convocatoria: { label: 'Convocatoria', tone: 'orange', icon: 'megaphone' },
  otro: { label: 'Evento', tone: 'gray', icon: 'sparkles' },
};

function getStorage(type = 'local') {
  try {
    if (typeof window !== 'undefined') {
      return type === 'local' ? window.localStorage : window.sessionStorage;
    }

    return type === 'local' ? localStorage : sessionStorage;
  } catch {
    return null;
  }
}

function parseJson(value, fallback = null) {
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function getAuthToken() {
  return (
    getStorage('local')?.getItem('tokenPORT') ||
    getStorage('session')?.getItem('tokenPORT') ||
    ''
  );
}

export function getCurrentEventsUser({ requireToken = true } = {}) {
  const rawUser = (
    getStorage('local')?.getItem('usuario') ||
    getStorage('session')?.getItem('usuario')
  );
  const token = getAuthToken();

  if (!rawUser || (requireToken && !token)) {
    throw new Error('No hay sesion activa.');
  }

  const user = parseJson(rawUser, null);
  const userId = user?.id_usuario || user?.id || user?.idUsuario;

  if (!userId) {
    throw new Error('No se encontro el usuario autenticado.');
  }

  return { user, userId: String(userId), token };
}

function buildHeaders() {
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay sesion activa.');
  }

  return {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function parseEventResponse(response, fallbackMessage) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload?.accion === false) {
    throw new Error(payload?.mensaje || payload?.message || fallbackMessage);
  }

  return payload;
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeDate(value) {
  if (!value) return '';
  return String(value).replace(' ', 'T');
}

export function getEventTypeMeta(type) {
  return EVENT_TYPES_META[type] || EVENT_TYPES_META.otro;
}

export function normalizeHomeEvent(item = {}) {
  const id = item.id_evento ?? item.id ?? item.eventId;
  const capacity = toNumber(item.cupo ?? item.capacity ?? item.cupos, 0);
  const registered = toNumber(item.inscritos ?? item.registered ?? item.asistentes, 0);
  const availableSlots = toNumber(
    item.cupo_disponible ?? item.availableSlots ?? item.cupos_disponibles,
    Math.max(capacity - registered, 0),
  );
  const type = item.tipo || item.type || 'otro';
  const authorName = (
    item.autor_nombre ||
    item.usuario_creador_nombre ||
    item.publisherName ||
    item.creador?.nombre ||
    item.usuario_creador?.nombre ||
    item.usuario?.nombre ||
    ''
  );

  return {
    id,
    title: item.titulo || item.title || item.nombre || 'Evento sin titulo',
    description: item.descripcion || item.description || '',
    type,
    typeLabel: getEventTypeMeta(type).label,
    status: item.estado || item.status || 'programado',
    startsAt: normalizeDate(item.fecha_inicio || item.startsAt || item.startDate),
    endsAt: normalizeDate(item.fecha_fin || item.endsAt || item.endDate),
    scheduledFor: normalizeDate(item.programado_para || item.scheduledFor),
    location: item.ubicacion || item.location || item.lugar || '',
    capacity,
    registered,
    availableSlots,
    soldOut: capacity > 0 && availableSlots <= 0,
    isRegistered: Boolean(item.esta_inscrito || item.isRegistered),
    requiresLogin: Boolean(item.requiresLogin || item.requiere_login),
    inscriptionId: item.id_inscripcion ?? item.inscriptionId ?? null,
    inscriptionDate: item.fecha_inscripcion || item.inscriptionDate || null,
    channels: Array.isArray(item.canales || item.channels) ? (item.canales || item.channels) : [],
    imagePath: item.imagen_portada_path || item.imagePath || '',
    imageUrl: item.imagen_portada_url || item.imageUrl || item.imagen_url || '',
    authorId: item.usuario_creador_id || item.authorId || item.publisherId || null,
    authorName,
    updatedAt: item.updated_at || item.updatedAt || item.fecha_actualizacion || '',
    raw: item,
  };
}

function markEventsAsLoginRequired(payload = {}) {
  return {
    ...payload,
    events: (payload.events || []).map((event) => ({
      ...event,
      requiresLogin: true,
    })),
  };
}

export function normalizeHomeEventsPayload(payload = {}) {
  const events = Array.isArray(payload.eventos)
    ? payload.eventos
    : (Array.isArray(payload.data) ? payload.data : []);

  return {
    action: payload.accion !== false,
    message: payload.mensaje || payload.message || '',
    events: events.map(normalizeHomeEvent).filter((event) => event.id),
    pagination: payload.paginacion || payload.pagination || {
      pagina_actual: 1,
      por_pagina: events.length,
      total: events.length,
      ultima_pagina: 1,
      desde: events.length ? 1 : null,
      hasta: events.length || null,
    },
    raw: payload,
  };
}

function endpointForEvents({ userId, page = 1, perPage = HOME_EVENTS_PAGE_SIZE } = {}) {
  const params = new URLSearchParams();
  params.set('por_pagina', String(perPage));
  if (page) params.set('page', String(page));

  return `/eventos/${userId}?${params.toString()}`;
}

function eventsListCacheKey({ userId, page = 1, perPage = HOME_EVENTS_PAGE_SIZE, scope = 'home' } = {}) {
  return homeEventsCacheKey('list', {
    page: String(page || 1),
    perPage: String(perPage || HOME_EVENTS_PAGE_SIZE),
    scope,
    userId: String(userId || ''),
  });
}

async function requestEvents({ userId, page = 1, perPage = HOME_EVENTS_PAGE_SIZE } = {}) {
  const response = await fetch(`${BASE_URL}${endpointForEvents({ userId, page, perPage })}`, {
    method: 'GET',
    headers: buildHeaders(),
  });

  const payload = await parseEventResponse(response, 'No se pudieron cargar los eventos.');
  return normalizeHomeEventsPayload(payload);
}

async function requestPublicEvents({ page = 1, perPage = HOME_EVENTS_PAGE_SIZE } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    por_pagina: String(perPage),
  });
  const response = await fetch(`${BASE_URL}/eventos/publicos?${params.toString()}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  const payload = await parseEventResponse(response, 'No se pudieron cargar los eventos publicos.');
  return markEventsAsLoginRequired(normalizeHomeEventsPayload(payload));
}

export function getCachedPublicHomeEvents(options = {}) {
  const page = options.page || 1;
  const perPage = options.perPage || HOME_EVENTS_PAGE_SIZE;
  const scope = options.scope || 'home-public';
  const ttlMs = Number(options.ttlMs ?? HOME_EVENTS_TTL_MS);
  const key = eventsListCacheKey({ userId: 'public', page, perPage, scope });

  return readHomeEventsCache(key, {
    allowStale: Boolean(options.allowStale),
    ttlMs,
  });
}

export async function getPublicHomeEvents(options = {}) {
  const page = options.page || 1;
  const perPage = options.perPage || HOME_EVENTS_PAGE_SIZE;
  const scope = options.scope || 'home-public';
  const ttlMs = Number(options.ttlMs ?? HOME_EVENTS_TTL_MS);
  const key = eventsListCacheKey({ userId: 'public', page, perPage, scope });

  return withHomeEventsCache(
    key,
    () => requestPublicEvents({ page, perPage }),
    { force: Boolean(options.force), ttlMs },
  );
}

export function getCachedHomeEvents(options = {}) {
  const { userId } = options.userId ? options : getCurrentEventsUser({ requireToken: false });
  const page = options.page || 1;
  const perPage = options.perPage || HOME_EVENTS_PAGE_SIZE;
  const scope = options.scope || 'home';
  const ttlMs = Number(options.ttlMs ?? (scope === 'events-page' ? EVENTS_PAGE_TTL_MS : HOME_EVENTS_TTL_MS));
  const key = eventsListCacheKey({ userId, page, perPage, scope });

  return readHomeEventsCache(key, {
    allowStale: Boolean(options.allowStale),
    ttlMs,
  });
}

export async function getHomeEvents(options = {}) {
  const { userId } = options.userId ? options : getCurrentEventsUser();
  const page = options.page || 1;
  const perPage = options.perPage || HOME_EVENTS_PAGE_SIZE;
  const scope = options.scope || 'home';
  const ttlMs = Number(options.ttlMs ?? (scope === 'events-page' ? EVENTS_PAGE_TTL_MS : HOME_EVENTS_TTL_MS));
  const key = eventsListCacheKey({ userId, page, perPage, scope });

  return withHomeEventsCache(
    key,
    () => requestEvents({ userId, page, perPage }),
    {
      force: Boolean(options.force),
      ttlMs,
    },
  );
}

export async function refreshHomeEvents(options = {}) {
  return getHomeEvents({ ...options, force: true });
}

export async function registerHomeEvent(eventId, options = {}) {
  const { userId } = options.userId ? options : getCurrentEventsUser();

  if (!eventId) {
    throw new Error('No se encontro el evento seleccionado.');
  }

  const response = await fetch(`${BASE_URL}/eventos/${userId}/${eventId}/inscribirse`, {
    method: 'POST',
    headers: buildHeaders(),
  });

  const payload = await parseEventResponse(response, 'No se pudo inscribir al evento.');
  clearHomeEventsCacheForUser(userId);

  if (options.refresh !== false) {
    const refreshed = await refreshHomeEvents({
      page: options.page || 1,
      perPage: options.perPage || HOME_EVENTS_PAGE_SIZE,
      scope: options.scope || 'home',
      userId,
    });

    return { ...payload, refreshed };
  }

  return payload;
}

function statusWeight(status) {
  if (status === 'activo') return 0;
  if (status === 'programado') return 1;
  return 2;
}

function dateValue(value) {
  const time = new Date(value || 0).getTime();
  return Number.isFinite(time) ? time : Number.MAX_SAFE_INTEGER;
}

export function sortEventsForHighlights(events = []) {
  return [...events].sort((a, b) => (
    toNumber(b.registered) - toNumber(a.registered) ||
    statusWeight(a.status) - statusWeight(b.status) ||
    dateValue(a.startsAt || a.scheduledFor) - dateValue(b.startsAt || b.scheduledFor) ||
    String(a.title || '').localeCompare(String(b.title || ''))
  ));
}

export function splitHomeEvents(events = {}, options = {}) {
  const list = Array.isArray(events) ? events : (events.events || []);
  const highlightLimit = Number(options.highlightLimit || HOME_HIGHLIGHT_LIMIT);
  const carouselLimit = Number(options.carouselLimit || HOME_CAROUSEL_LIMIT);
  const sorted = sortEventsForHighlights(list);

  return {
    highlighted: sorted.slice(0, highlightLimit),
    carousel: sorted.slice(highlightLimit, highlightLimit + carouselLimit),
    all: sorted,
  };
}

export function getEventsSignature(events = []) {
  return events.map((event) => ([
    event.id,
    event.updatedAt,
    event.registered,
    event.availableSlots,
    event.isRegistered,
    event.status,
    event.startsAt,
    event.endsAt,
    event.title,
    event.description,
    event.imageUrl,
  ].join('|'))).join('::');
}

export function writeHomeEventsResultToCache(result, options = {}) {
  const { userId } = options.userId ? options : getCurrentEventsUser({ requireToken: false });
  const page = options.page || 1;
  const perPage = options.perPage || HOME_EVENTS_PAGE_SIZE;
  const scope = options.scope || 'home';
  const key = eventsListCacheKey({ userId, page, perPage, scope });

  return writeHomeEventsCache(key, result);
}
