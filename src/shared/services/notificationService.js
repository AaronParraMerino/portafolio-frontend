import BASE_URL from '../../services/http/const';
import { getStoredUser } from '../utils/authStorage';

const NOTIFICATIONS_CACHE_PREFIX = 'notifications-cache:v1';
const NOTIFICATIONS_CACHE_TTL_MS = 5 * 60 * 1000;

function getRequestContext() {
  const token = localStorage.getItem('tokenPORT') || sessionStorage.getItem('tokenPORT');
  const user = getStoredUser();
  const userId = user?.id_usuario || user?.id || user?.idUsuario;

  if (!token || !userId) return null;

  return { token, userId };
}

function cacheKey(userId, limit) {
  return `${NOTIFICATIONS_CACHE_PREFIX}:${userId}:limit-${limit}`;
}

function parseJson(value) {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

const memoryCache = new Map();
let mutationRevision = 0;

function writeNotificationsCache(value, userId, limit) {
  const key = cacheKey(userId, limit);
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

function updateNotificationsCache(updater, limit = 8) {
  const context = getRequestContext();
  if (!context) return;

  const current = getCachedNotifications(limit);
  if (!current) return;

  writeNotificationsCache(updater(current), context.userId, limit);
}

function headers(token) {
  return {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function resolveResponse(response, fallbackMessage) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || fallbackMessage);
  }

  return payload;
}

export function getCachedNotifications(limit = 8) {
  const context = getRequestContext();
  if (!context) return null;

  const key = cacheKey(context.userId, limit);
  const memoryEntry = memoryCache.get(key);
  const entry = memoryEntry || parseJson(sessionStorage.getItem(key));

  if (!entry?.value || Date.now() - Number(entry.cachedAt || 0) > NOTIFICATIONS_CACHE_TTL_MS) {
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

export function clearNotificationsCache() {
  const context = getRequestContext();
  if (!context) return;

  mutationRevision += 1;
  const prefix = `${NOTIFICATIONS_CACHE_PREFIX}:${context.userId}:`;

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

export async function fetchNotifications(limit = 8) {
  const context = getRequestContext();
  if (!context) return { notifications: [], unread: 0 };
  const requestRevision = mutationRevision;

  const response = await fetch(
    `${BASE_URL}/notificaciones/${context.userId}?por_pagina=${limit}`,
    { headers: headers(context.token) }
  );
  const payload = await resolveResponse(response, 'No se pudieron cargar las notificaciones.');

  const result = {
    notifications: Array.isArray(payload.data) ? payload.data : [],
    unread: Number(payload?.resumen?.pendientes) || 0,
  };

  if (requestRevision !== mutationRevision) {
    return getCachedNotifications(limit) || result;
  }

  return writeNotificationsCache(result, context.userId, limit);
}

export async function markNotificationAsRead(notificationId) {
  const context = getRequestContext();
  if (!context) throw new Error('No hay una sesion activa.');

  const response = await fetch(
    `${BASE_URL}/notificaciones/${context.userId}/${notificationId}/read`,
    {
      method: 'PATCH',
      headers: headers(context.token),
    }
  );

  const payload = await resolveResponse(response, 'No se pudo marcar la notificacion como leida.');

  mutationRevision += 1;
  updateNotificationsCache((cached) => ({
    notifications: cached.notifications.map((notification) => (
      notification.id_notificacion === notificationId
        ? { ...notification, leida_en: payload.data?.leida_en || new Date().toISOString() }
        : notification
    )),
    unread: Number(payload?.resumen?.pendientes) || 0,
  }));

  return payload;
}

export async function markAllNotificationsAsRead() {
  const context = getRequestContext();
  if (!context) throw new Error('No hay una sesion activa.');

  const response = await fetch(
    `${BASE_URL}/notificaciones/${context.userId}/read-all`,
    {
      method: 'PATCH',
      headers: headers(context.token),
    }
  );

  const payload = await resolveResponse(response, 'No se pudieron marcar las notificaciones como leidas.');
  const readAt = new Date().toISOString();

  mutationRevision += 1;
  updateNotificationsCache((cached) => ({
    notifications: cached.notifications.map((notification) => ({
      ...notification,
      leida_en: notification.leida_en || readAt,
    })),
    unread: 0,
  }));

  return payload;
}
