const HOME_EVENTS_CACHE_PREFIX = 'home-events-cache:v1';
export const HOME_EVENTS_INVALIDATED_EVENT = 'creafolio:home-events-invalidated';

export const HOME_EVENTS_TTL_MS = 10 * 60 * 1000;
export const EVENTS_PAGE_TTL_MS = 5 * 60 * 1000;

const memoryCache = new Map();
const pendingRequests = new Map();

function getStorage() {
  try {
    if (typeof window !== 'undefined') {
      return window.sessionStorage;
    }

    return sessionStorage;
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

function clone(value) {
  if (value === undefined || value === null) return value;

  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
}

function stableStringify(value) {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  return `{${Object.keys(value).sort().map((key) => (
    `${JSON.stringify(key)}:${stableStringify(value[key])}`
  )).join(',')}}`;
}

export function homeEventsCacheKey(scope, params = {}) {
  const suffix = typeof params === 'string' ? params : stableStringify(params);
  return `${HOME_EVENTS_CACHE_PREFIX}:${scope}:${suffix}`;
}

function isFresh(entry, ttlMs) {
  if (!entry) return false;
  if (!ttlMs) return true;
  return Date.now() - Number(entry.cachedAt || 0) <= ttlMs;
}

function readEntry(key) {
  if (memoryCache.has(key)) {
    return memoryCache.get(key);
  }

  const storage = getStorage();
  const stored = parseJson(storage?.getItem(key), null);

  if (!stored || !Object.prototype.hasOwnProperty.call(stored, 'value')) {
    return null;
  }

  memoryCache.set(key, stored);
  return stored;
}

export function readHomeEventsCache(key, options = {}) {
  const ttlMs = Number(options.ttlMs ?? HOME_EVENTS_TTL_MS);
  const allowStale = Boolean(options.allowStale);
  const entry = readEntry(key);

  if (!entry) return null;
  if (!allowStale && !isFresh(entry, ttlMs)) return null;

  return {
    cachedAt: Number(entry.cachedAt || 0),
    fresh: isFresh(entry, ttlMs),
    value: clone(entry.value),
  };
}

export function writeHomeEventsCache(key, value) {
  const storage = getStorage();
  const entry = {
    cachedAt: Date.now(),
    value,
  };

  memoryCache.set(key, entry);

  try {
    storage?.setItem(key, JSON.stringify(entry));
  } catch {
    // Cache is only an optimization for long browsing sessions.
  }

  return clone(value);
}

export function removeHomeEventsCache(key) {
  const storage = getStorage();

  memoryCache.delete(key);
  pendingRequests.delete(key);

  try {
    storage?.removeItem(key);
  } catch {
    // no-op
  }
}

export function clearHomeEventsCacheForUser(userId) {
  const storage = getStorage();
  const userPrefix = `${HOME_EVENTS_CACHE_PREFIX}:`;
  const userMarker = `"userId":${JSON.stringify(String(userId))}`;

  for (const key of Array.from(memoryCache.keys())) {
    if (key.startsWith(userPrefix) && key.includes(userMarker)) {
      memoryCache.delete(key);
    }
  }

  for (const key of Array.from(pendingRequests.keys())) {
    if (key.startsWith(userPrefix) && key.includes(userMarker)) {
      pendingRequests.delete(key);
    }
  }

  try {
    for (let index = storage.length - 1; index >= 0; index -= 1) {
      const key = storage.key(index);

      if (key?.startsWith(userPrefix) && key.includes(userMarker)) {
        storage.removeItem(key);
      }
    }
  } catch {
    // no-op
  }
}

export function invalidateHomeEventsForUser(userId) {
  clearHomeEventsCacheForUser(userId);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(HOME_EVENTS_INVALIDATED_EVENT, {
      detail: { userId: String(userId || '') },
    }));
  }
}

export async function withHomeEventsCache(key, loader, options = {}) {
  const ttlMs = Number(options.ttlMs ?? HOME_EVENTS_TTL_MS);

  if (!options.force) {
    const cached = readHomeEventsCache(key, { ttlMs, allowStale: false });
    if (cached) return cached.value;
  }

  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const request = Promise.resolve()
    .then(loader)
    .then((value) => writeHomeEventsCache(key, value))
    .finally(() => {
      pendingRequests.delete(key);
    });

  pendingRequests.set(key, request);
  return request;
}
