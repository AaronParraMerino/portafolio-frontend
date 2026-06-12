const DASHBOARD_CACHE_PREFIX = 'dashboard-cache:v1';
export const DASHBOARD_CACHE_INVALIDATED_EVENT = 'dashboard-cache:invalidated';

const memoryCache = new Map();
const pendingRequests = new Map();
const cacheVersions = new Map();

function getStorage(type = 'session') {
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

function clone(value) {
  if (value === undefined || value === null) return value;

  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
}

export function getCurrentDashboardSession({ requireToken = true } = {}) {
  const local = getStorage('local');
  const session = getStorage('session');
  const rawUser = local?.getItem('usuario') || session?.getItem('usuario');
  const token = local?.getItem('tokenPORT') || session?.getItem('tokenPORT');

  if (!rawUser || (requireToken && !token)) {
    throw new Error('No hay sesion activa.');
  }

  const user = parseJson(rawUser, null);
  const userId = user?.id_usuario || user?.id || user?.idUsuario;

  if (!userId) {
    throw new Error('No se encontro el usuario autenticado.');
  }

  return { user, userId, token };
}

function scopedKey(key, userId) {
  return `${DASHBOARD_CACHE_PREFIX}:${userId}:${key}`;
}

function getCacheVersion(fullKey) {
  return cacheVersions.get(fullKey) || 0;
}

function bumpCacheVersion(fullKey) {
  const nextVersion = getCacheVersion(fullKey) + 1;
  cacheVersions.set(fullKey, nextVersion);
  return nextVersion;
}

function resolveUserId(userId) {
  if (userId) return userId;
  return getCurrentDashboardSession({ requireToken: false }).userId;
}

export function getDashboardCacheStorageKey(key, options = {}) {
  return scopedKey(key, resolveUserId(options.userId));
}

export function readDashboardCache(key, options = {}) {
  const storage = getStorage(options.storage || 'session');
  const fullKey = getDashboardCacheStorageKey(key, options);
  const maxAgeMs = Number(options.maxAgeMs || 0);

  if (memoryCache.has(fullKey)) {
    const entry = memoryCache.get(fullKey);

    if (!maxAgeMs || Date.now() - entry.cachedAt <= maxAgeMs) {
      return clone(entry.value);
    }
  }

  const stored = parseJson(storage?.getItem(fullKey), null);

  if (!stored || !Object.prototype.hasOwnProperty.call(stored, 'value')) {
    return null;
  }

  if (maxAgeMs && Date.now() - Number(stored.cachedAt || 0) > maxAgeMs) {
    return null;
  }

  memoryCache.set(fullKey, {
    cachedAt: Number(stored.cachedAt || Date.now()),
    value: stored.value,
  });

  return clone(stored.value);
}

export function writeDashboardCache(key, value, options = {}) {
  const storage = getStorage(options.storage || 'session');
  const fullKey = getDashboardCacheStorageKey(key, options);
  bumpCacheVersion(fullKey);
  const entry = {
    cachedAt: Date.now(),
    value,
  };

  memoryCache.set(fullKey, entry);

  try {
    storage?.setItem(fullKey, JSON.stringify(entry));
  } catch {
    // Cache is only an optimization.
  }

  return clone(value);
}

export function updateDashboardCache(key, updater, options = {}) {
  const current = readDashboardCache(key, options);
  const next = updater(current);
  writeDashboardCache(key, next, options);
  return next;
}

export function removeDashboardCache(key, options = {}) {
  const storage = getStorage(options.storage || 'session');
  const fullKey = getDashboardCacheStorageKey(key, options);

  bumpCacheVersion(fullKey);
  memoryCache.delete(fullKey);
  pendingRequests.delete(fullKey);

  try {
    storage?.removeItem(fullKey);
  } catch {
    // no-op
  }
}

export function clearDashboardCacheByPrefix(prefix, options = {}) {
  const userId = resolveUserId(options.userId);
  const fullPrefix = scopedKey(prefix, userId);
  const storages = [getStorage('session'), getStorage('local')].filter(Boolean);

  for (const key of Array.from(memoryCache.keys())) {
    if (key.startsWith(fullPrefix)) {
      bumpCacheVersion(key);
      memoryCache.delete(key);
    }
  }

  for (const key of Array.from(pendingRequests.keys())) {
    if (key.startsWith(fullPrefix)) {
      bumpCacheVersion(key);
      pendingRequests.delete(key);
    }
  }

  storages.forEach((storage) => {
    try {
      for (let index = storage.length - 1; index >= 0; index -= 1) {
        const key = storage.key(index);

        if (key?.startsWith(fullPrefix)) {
          bumpCacheVersion(key);
          storage.removeItem(key);
        }
      }
    } catch {
      // no-op
    }
  });
}

export async function withDashboardCache(key, loader, options = {}) {
  const fullKey = getDashboardCacheStorageKey(key, options);

  if (!options.force) {
    const cached = readDashboardCache(key, options);
    if (cached !== null) return cached;
  }

  if (!options.force && pendingRequests.has(fullKey)) {
    return pendingRequests.get(fullKey);
  }

  if (options.force) {
    bumpCacheVersion(fullKey);
  }

  const requestVersion = getCacheVersion(fullKey);
  const request = Promise.resolve()
    .then(loader)
    .then((value) => {
      if (getCacheVersion(fullKey) !== requestVersion) {
        const current = readDashboardCache(key, options);
        return current !== null ? current : clone(value);
      }

      return writeDashboardCache(key, value, options);
    })
    .finally(() => {
      if (pendingRequests.get(fullKey) === request) {
        pendingRequests.delete(fullKey);
      }
    });

  pendingRequests.set(fullKey, request);
  return request;
}

function removeStoredKeyOrPrefix(storage, keyOrPrefix) {
  if (!storage || !keyOrPrefix) return;

  try {
    storage.removeItem(keyOrPrefix);

    const prefix = keyOrPrefix.endsWith(':') ? keyOrPrefix : `${keyOrPrefix}:`;
    for (let index = storage.length - 1; index >= 0; index -= 1) {
      const key = storage.key(index);

      if (key?.startsWith(prefix)) {
        storage.removeItem(key);
      }
    }
  } catch {
    // no-op
  }
}

function notifyDashboardCacheInvalidated(detail = {}) {
  try {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent(DASHBOARD_CACHE_INVALIDATED_EVENT, { detail }));
    }
  } catch {
    // no-op
  }
}

function endpointCacheKey(endpoint) {
  return `endpoint:${String(endpoint || '').trim()}`;
}

export function readCachedDashboardEndpoint(endpoint, options = {}) {
  return readDashboardCache(endpointCacheKey(endpoint), options);
}

export function writeCachedDashboardEndpoint(endpoint, value, options = {}) {
  return writeDashboardCache(endpointCacheKey(endpoint), value, options);
}

export function removeCachedDashboardEndpoint(endpoint, options = {}) {
  removeDashboardCache(endpointCacheKey(endpoint), options);
}

export function getCachedDashboardEndpoint(endpoint, loader, options = {}) {
  return withDashboardCache(endpointCacheKey(endpoint), loader, options);
}

export function invalidateDashboardDerivedCaches(userId) {
  let resolvedUserId = userId;

  try {
    resolvedUserId = resolvedUserId || getCurrentDashboardSession({ requireToken: false }).userId;
  } catch {
    return;
  }

  const session = getStorage('session');
  const keys = [
    `dashboard-summary:v1:${resolvedUserId}`,
    `portfolio-view-data:v2:${resolvedUserId}`,
    `public-portfolio-view:v3:${resolvedUserId}`,
  ];

  keys.forEach((key) => {
    removeStoredKeyOrPrefix(session, key);
  });

  notifyDashboardCacheInvalidated({
    userId: resolvedUserId,
    keys,
  });
}
