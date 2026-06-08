import BASE_URL from '../../services/http/const';
import { getStoredUser } from '../utils/authStorage';
import { scheduleRequest } from './requestScheduler';

const NOTIFICATIONS_CACHE_PREFIX = 'notifications-cache:v2';
const UNREAD_CACHE_TTL_MS = 30 * 1000;
const READ_CACHE_TTL_MS = 2 * 60 * 60 * 1000;
const DEFAULT_READ_PAGE_SIZE = 20;
const DEFAULT_LEGACY_LIMIT = 8;

const memoryCache = new Map();
let mutationRevision = 0;

function getRequestContext() {
  const token = localStorage.getItem('tokenPORT') || sessionStorage.getItem('tokenPORT');
  const user = getStoredUser();
  const userId = user?.id_usuario || user?.id || user?.idUsuario;

  if (!token || !userId) return null;

  return { token, userId };
}

function headers(token, withJson = false) {
  return {
    Accept: 'application/json',
    ...(withJson ? { 'Content-Type': 'application/json' } : {}),
    Authorization: `Bearer ${token}`,
  };
}

function parseJson(value) {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function encodePath(value) {
  return encodeURIComponent(String(value ?? ''));
}

function cacheKey(userId, name, params = {}) {
  const suffix = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}-${String(value)}`)
    .join(':');

  return `${NOTIFICATIONS_CACHE_PREFIX}:${userId}:${name}${suffix ? `:${suffix}` : ''}`;
}

function readCache(key, ttlMs) {
  const memoryEntry = memoryCache.get(key);
  const entry = memoryEntry || parseJson(sessionStorage.getItem(key));

  if (!entry?.value || Date.now() - Number(entry.cachedAt || 0) > ttlMs) {
    memoryCache.delete(key);
    try {
      sessionStorage.removeItem(key);
    } catch {
      // no-op
    }
    return null;
  }

  memoryCache.set(key, entry);
  return entry.value;
}

function writeCache(key, value) {
  const entry = {
    cachedAt: Date.now(),
    value,
  };

  memoryCache.set(key, entry);

  try {
    sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Cache is only an optimization.
  }

  return value;
}

function clearCacheByPrefix(prefix) {
  for (const key of Array.from(memoryCache.keys())) {
    if (key.startsWith(prefix)) memoryCache.delete(key);
  }

  try {
    for (let index = sessionStorage.length - 1; index >= 0; index -= 1) {
      const key = sessionStorage.key(index);
      if (key?.startsWith(prefix)) sessionStorage.removeItem(key);
    }
  } catch {
    // no-op
  }
}

function invalidateUserNotificationCache(userId, scopes = ['unread', 'read']) {
  mutationRevision += 1;

  const scopeNames = {
    unread: ['modules', 'module-detail', 'group-messages', 'legacy-list'],
    read: ['read-list', 'read-modules', 'read-module-detail', 'read-group-messages'],
  };

  scopes.forEach((scope) => {
    (scopeNames[scope] || []).forEach((name) => {
      clearCacheByPrefix(cacheKey(userId, name));
    });
  });
}

function normalizeNotification(notification) {
  if (!notification || typeof notification !== 'object') return notification;

  const readAt = notification.leido_en || notification.leida_en || null;
  const groupTitle = notification.grupo_titulo || notification.titulo || '';
  const message = notification.mensaje || notification.contenido || '';

  return {
    ...notification,
    leido_en: readAt,
    leida_en: readAt,
    titulo: groupTitle || moduleTitle(notification.modulo) || 'Notificacion',
    contenido: message,
  };
}

function moduleTitle(modulo) {
  return {
    proyectos: 'Proyectos',
    eventos: 'Eventos',
    administracion: 'Administracion',
  }[modulo] || modulo;
}

async function resolveResponse(response, fallbackMessage) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || fallbackMessage);
  }

  return payload;
}

async function requestJson(path, options = {}) {
  const context = getRequestContext();
  if (!context) throw new Error('No hay una sesion activa.');

  const {
    fallbackMessage,
    schedulerPriority,
    ...fetchOptions
  } = options;
  const method = String(fetchOptions.method || 'GET').toUpperCase();
  return scheduleRequest(async () => {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...fetchOptions,
      headers: {
        ...headers(context.token, Boolean(fetchOptions.body)),
        ...(fetchOptions.headers || {}),
      },
    });

    return resolveResponse(response, fallbackMessage || 'No se pudo completar la solicitud.');
  }, {
    key: method === 'GET' ? `notifications:${context.userId}:${path}` : '',
    priority: schedulerPriority || (method === 'GET' ? 'normal' : 'high'),
  });
}

async function withCache({
  name,
  params,
  ttlMs,
  force = false,
  loader,
}) {
  const context = getRequestContext();
  if (!context) return null;

  const key = cacheKey(context.userId, name, params);
  if (!force) {
    const cached = readCache(key, ttlMs);
    if (cached) return cached;
  }

  return writeCache(key, await loader(context));
}

export function clearNotificationsCache() {
  const context = getRequestContext();
  if (!context) return;

  mutationRevision += 1;
  clearCacheByPrefix(`${NOTIFICATIONS_CACHE_PREFIX}:${context.userId}:`);
}

export function getCachedNotificationModules() {
  const context = getRequestContext();
  if (!context) return null;

  return readCache(cacheKey(context.userId, 'modules'), UNREAD_CACHE_TTL_MS);
}

export function getCachedReadNotifications({
  page = 1,
  perPage = DEFAULT_READ_PAGE_SIZE,
  modulo = '',
} = {}) {
  const context = getRequestContext();
  if (!context) return null;

  return readCache(
    cacheKey(context.userId, 'read-list', { page, perPage, modulo }),
    READ_CACHE_TTL_MS
  );
}

export function getCachedReadNotificationModules() {
  const context = getRequestContext();
  if (!context) return null;

  return readCache(cacheKey(context.userId, 'read-modules'), READ_CACHE_TTL_MS);
}

export async function fetchNotificationModules({ force = false } = {}) {
  const context = getRequestContext();
  if (!context) return { status: 'success', data: [], total: 0 };

  return withCache({
    name: 'modules',
    ttlMs: UNREAD_CACHE_TTL_MS,
    force,
    loader: () => requestJson(
      `/notificaciones/${context.userId}/modulos`,
      {
        fallbackMessage: 'No se pudieron cargar los modulos de notificaciones.',
        schedulerPriority: 'background',
      }
    ),
  });
}

export async function fetchNotificationModuleDetail(modulo, { force = false } = {}) {
  const context = getRequestContext();
  if (!context) return { status: 'success', modulo, tipo_vista: 'grupos', data: [], total: 0 };

  return withCache({
    name: 'module-detail',
    params: { modulo },
    ttlMs: UNREAD_CACHE_TTL_MS,
    force,
    loader: () => requestJson(
      `/notificaciones/${context.userId}/modulos/${encodePath(modulo)}`,
      { fallbackMessage: 'No se pudo cargar el modulo de notificaciones.' }
    ).then((payload) => ({
      ...payload,
      data: Array.isArray(payload.data)
        ? payload.data.map((item) => (
            payload.tipo_vista === 'mensajes_directos'
              ? normalizeNotification(item)
              : item
          ))
        : [],
    })),
  });
}

export async function fetchNotificationGroupMessages(
  modulo,
  contextoReferencia,
  { force = false } = {}
) {
  const context = getRequestContext();
  if (!context) {
    return {
      status: 'success',
      modulo,
      contexto_referencia: contextoReferencia,
      data: [],
      total: 0,
    };
  }

  return withCache({
    name: 'group-messages',
    params: { modulo, contextoReferencia },
    ttlMs: UNREAD_CACHE_TTL_MS,
    force,
    loader: () => requestJson(
      `/notificaciones/${context.userId}/modulos/${encodePath(modulo)}/grupos/${encodePath(contextoReferencia)}`,
      { fallbackMessage: 'No se pudieron cargar los mensajes del grupo.' }
    ).then((payload) => ({
      ...payload,
      data: Array.isArray(payload.data)
        ? payload.data.map(normalizeNotification)
        : [],
    })),
  });
}

export async function fetchReadNotifications({
  page = 1,
  perPage = DEFAULT_READ_PAGE_SIZE,
  modulo = '',
  force = false,
} = {}) {
  const context = getRequestContext();
  if (!context) {
    return {
      status: 'success',
      data: [],
      meta: {
        total: 0,
        per_page: perPage,
        current_page: page,
        last_page: 1,
        has_more_pages: false,
      },
      resumen: { pendientes: 0 },
    };
  }

  return withCache({
    name: 'read-list',
    params: { page, perPage, modulo },
    ttlMs: READ_CACHE_TTL_MS,
    force,
    loader: () => {
      const query = new URLSearchParams({
        page: String(page),
        por_pagina: String(perPage),
      });

      if (modulo) query.set('modulo', modulo);

      return requestJson(
        `/notificaciones/${context.userId}/leidas?${query.toString()}`,
        { fallbackMessage: 'No se pudieron cargar las notificaciones leidas.' }
      ).then((payload) => ({
        ...payload,
        data: Array.isArray(payload.data)
          ? payload.data.map(normalizeNotification)
          : [],
      }));
    },
  });
}

export async function fetchReadNotificationModules({ force = false } = {}) {
  const context = getRequestContext();
  if (!context) return { status: 'success', data: [], total: 0 };

  return withCache({
    name: 'read-modules',
    ttlMs: READ_CACHE_TTL_MS,
    force,
    loader: () => requestJson(
      `/notificaciones/${context.userId}/leidas/modulos`,
      { fallbackMessage: 'No se pudieron cargar los modulos de notificaciones leidas.' }
    ),
  });
}

export async function fetchReadNotificationModuleDetail(
  modulo,
  { page = 1, perPage = DEFAULT_READ_PAGE_SIZE, force = false } = {}
) {
  const context = getRequestContext();
  if (!context) return { status: 'success', modulo, tipo_vista: 'grupos', data: [], total: 0 };

  return withCache({
    name: 'read-module-detail',
    params: { modulo, page, perPage },
    ttlMs: READ_CACHE_TTL_MS,
    force,
    loader: () => {
      const query = new URLSearchParams({
        page: String(page),
        por_pagina: String(perPage),
      });

      return requestJson(
        `/notificaciones/${context.userId}/leidas/modulos/${encodePath(modulo)}?${query.toString()}`,
        { fallbackMessage: 'No se pudo cargar el modulo de notificaciones leidas.' }
      ).then((payload) => ({
        ...payload,
        data: Array.isArray(payload.data)
          ? payload.data.map((item) => (
              payload.tipo_vista === 'mensajes_directos'
                ? normalizeNotification(item)
                : item
            ))
          : [],
      }));
    },
  });
}

export async function fetchReadNotificationGroupMessages(
  modulo,
  contextoReferencia,
  { page = 1, perPage = DEFAULT_READ_PAGE_SIZE, force = false } = {}
) {
  const context = getRequestContext();
  if (!context) {
    return {
      status: 'success',
      modulo,
      contexto_referencia: contextoReferencia,
      data: [],
      total: 0,
    };
  }

  return withCache({
    name: 'read-group-messages',
    params: { modulo, contextoReferencia, page, perPage },
    ttlMs: READ_CACHE_TTL_MS,
    force,
    loader: () => {
      const query = new URLSearchParams({
        page: String(page),
        por_pagina: String(perPage),
      });

      return requestJson(
        `/notificaciones/${context.userId}/leidas/modulos/${encodePath(modulo)}/grupos/${encodePath(contextoReferencia)}?${query.toString()}`,
        { fallbackMessage: 'No se pudieron cargar los mensajes leidos del grupo.' }
      ).then((payload) => ({
        ...payload,
        data: Array.isArray(payload.data)
          ? payload.data.map(normalizeNotification)
          : [],
      }));
    },
  });
}

export async function markNotificationAsRead(notificationId) {
  const context = getRequestContext();
  if (!context) throw new Error('No hay una sesion activa.');

  const payload = await requestJson(
    `/notificaciones/${context.userId}/${encodePath(notificationId)}/read`,
    {
      method: 'PATCH',
      fallbackMessage: 'No se pudo marcar la notificacion como leida.',
    }
  );

  invalidateUserNotificationCache(context.userId, ['unread', 'read']);

  return {
    ...payload,
    data: payload.data ? normalizeNotification(payload.data) : payload.data,
  };
}

export async function markNotificationAsUnread(notificationId) {
  const context = getRequestContext();
  if (!context) throw new Error('No hay una sesion activa.');

  const payload = await requestJson(
    `/notificaciones/${context.userId}/${encodePath(notificationId)}/unread`,
    {
      method: 'PATCH',
      fallbackMessage: 'No se pudo marcar la notificacion como no leida.',
    }
  );

  invalidateUserNotificationCache(context.userId, ['unread', 'read']);

  return {
    ...payload,
    data: payload.data ? normalizeNotification(payload.data) : payload.data,
  };
}

export async function markNotificationGroupAsRead(modulo, contextoReferencia) {
  const context = getRequestContext();
  if (!context) throw new Error('No hay una sesion activa.');

  const payload = await requestJson(
    `/notificaciones/${context.userId}/grupo/read`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        modulo,
        contexto_referencia: contextoReferencia,
      }),
      fallbackMessage: 'No se pudo marcar el grupo como leido.',
    }
  );

  invalidateUserNotificationCache(context.userId, ['unread', 'read']);

  return payload;
}

export async function markNotificationModuleAsRead(modulo) {
  const context = getRequestContext();
  if (!context) throw new Error('No hay una sesion activa.');

  const payload = await requestJson(
    `/notificaciones/${context.userId}/modulo/read`,
    {
      method: 'PATCH',
      body: JSON.stringify({ modulo }),
      fallbackMessage: 'No se pudo marcar el modulo como leido.',
    }
  );

  invalidateUserNotificationCache(context.userId, ['unread', 'read']);

  return payload;
}

export async function markAllNotificationsAsRead() {
  const context = getRequestContext();
  if (!context) throw new Error('No hay una sesion activa.');

  const payload = await requestJson(
    `/notificaciones/${context.userId}/read-all`,
    {
      method: 'PATCH',
      fallbackMessage: 'No se pudieron marcar las notificaciones como leidas.',
    }
  );

  invalidateUserNotificationCache(context.userId, ['unread', 'read']);

  return payload;
}

async function buildLegacyNotificationList(limit = DEFAULT_LEGACY_LIMIT, force = false) {
  const modulesPayload = await fetchNotificationModules({ force });
  const modules = Array.isArray(modulesPayload.data) ? modulesPayload.data : [];
  const messages = [];

  for (const moduleItem of modules) {
    if (messages.length >= limit) break;
    if (!Number(moduleItem.cantidad)) continue;

    const detail = await fetchNotificationModuleDetail(moduleItem.modulo, { force });

    if (detail.tipo_vista === 'mensajes_directos') {
      messages.push(...(Array.isArray(detail.data) ? detail.data : []));
      continue;
    }

    const groups = Array.isArray(detail.data) ? detail.data : [];

    for (const group of groups) {
      if (messages.length >= limit) break;

      const groupMessages = await fetchNotificationGroupMessages(
        moduleItem.modulo,
        group.contexto_referencia,
        { force }
      );

      messages.push(...(Array.isArray(groupMessages.data) ? groupMessages.data : []));
    }
  }

  return {
    notifications: messages
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit),
    unread: Number(modulesPayload.total) || modules.reduce(
      (total, moduleItem) => total + Number(moduleItem.cantidad || 0),
      0
    ),
    modules,
  };
}

export function getCachedNotifications(limit = DEFAULT_LEGACY_LIMIT) {
  const context = getRequestContext();
  if (!context) return null;

  return readCache(
    cacheKey(context.userId, 'legacy-list', { limit }),
    UNREAD_CACHE_TTL_MS
  );
}

export async function fetchNotifications(limit = DEFAULT_LEGACY_LIMIT, { force = false } = {}) {
  const context = getRequestContext();
  if (!context) return { notifications: [], unread: 0, modules: [] };

  const key = cacheKey(context.userId, 'legacy-list', { limit });
  if (!force) {
    const cached = readCache(key, UNREAD_CACHE_TTL_MS);
    if (cached) return cached;
  }

  const requestRevision = mutationRevision;
  const result = await buildLegacyNotificationList(limit, force);

  if (requestRevision !== mutationRevision) {
    return readCache(key, UNREAD_CACHE_TTL_MS) || result;
  }

  return writeCache(key, result);
}
