import { getStoredUser } from '../../../shared/utils/authStorage';

const CALENDAR_CACHE_PREFIX = 'calendar-events-cache:v1';
export const CALENDAR_EVENTS_INVALIDATED_EVENT = 'creafolio:calendar-events-invalidated';
export const CALENDAR_EVENTS_TTL_MS = 5 * 60 * 1000;

const memoryCache = new Map();

function getCurrentUserId() {
  const user = getStoredUser();
  return user?.id_usuario ?? user?.id ?? user?.usuario_id ?? user?.userId ?? null;
}

function getKey(userId = getCurrentUserId()) {
  return userId ? `${CALENDAR_CACHE_PREFIX}:${String(userId)}` : '';
}

function getStorage() {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage : sessionStorage;
  } catch {
    return null;
  }
}

export function readCalendarEventsCache({ allowStale = true, userId } = {}) {
  const key = getKey(userId);
  if (!key) return null;

  let entry = memoryCache.get(key);

  if (!entry) {
    try {
      entry = JSON.parse(getStorage()?.getItem(key) || 'null');
    } catch {
      entry = null;
    }
  }

  if (!entry || !Array.isArray(entry.events)) return null;

  memoryCache.set(key, entry);
  const fresh = Date.now() - Number(entry.cachedAt || 0) <= CALENDAR_EVENTS_TTL_MS;
  if (!allowStale && !fresh) return null;

  return { ...entry, fresh };
}

export function writeCalendarEventsCache(events, userId) {
  const key = getKey(userId);
  if (!key) return events;

  const entry = { cachedAt: Date.now(), events };
  memoryCache.set(key, entry);

  try {
    getStorage()?.setItem(key, JSON.stringify(entry));
  } catch {
    // Cache is only an optimization.
  }

  return events;
}

export function invalidateCalendarEventsForUser(userId = getCurrentUserId()) {
  const key = getKey(userId);
  if (!key) return;

  memoryCache.delete(key);

  try {
    getStorage()?.removeItem(key);
  } catch {
    // no-op
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CALENDAR_EVENTS_INVALIDATED_EVENT, {
      detail: { userId: String(userId || '') },
    }));
  }
}
