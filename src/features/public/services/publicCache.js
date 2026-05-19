const PUBLIC_CACHE_PREFIX = 'public-cache:v1';

const DEFAULT_TTL_MS = 5 * 60 * 1000;
const memoryCache = new Map();
const pendingRequests = new Map();

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

export function publicCacheKey(scope, params = '') {
  const suffix = typeof params === 'string' ? params : stableStringify(params);
  return `${PUBLIC_CACHE_PREFIX}:${scope}:${suffix}`;
}

export function readPublicCache(key, options = {}) {
  const ttlMs = Number(options.ttlMs ?? DEFAULT_TTL_MS);
  const storage = getStorage(options.storage || 'session');

  if (memoryCache.has(key)) {
    const entry = memoryCache.get(key);

    if (!ttlMs || Date.now() - Number(entry.cachedAt || 0) <= ttlMs) {
      return clone(entry.value);
    }
  }

  const stored = parseJson(storage?.getItem(key), null);

  if (!stored || !Object.prototype.hasOwnProperty.call(stored, 'value')) {
    return null;
  }

  if (ttlMs && Date.now() - Number(stored.cachedAt || 0) > ttlMs) {
    return null;
  }

  memoryCache.set(key, stored);
  return clone(stored.value);
}

export function writePublicCache(key, value, options = {}) {
  const storage = getStorage(options.storage || 'session');
  const entry = {
    cachedAt: Date.now(),
    value,
  };

  memoryCache.set(key, entry);

  try {
    storage?.setItem(key, JSON.stringify(entry));
  } catch {
    // La cache acelera la vista publica, pero no debe bloquear la UI.
  }

  return clone(value);
}

export function removePublicCache(key, options = {}) {
  const storage = getStorage(options.storage || 'session');
  memoryCache.delete(key);
  pendingRequests.delete(key);

  try {
    storage?.removeItem(key);
  } catch {
    // no-op
  }
}

export async function withPublicCache(key, loader, options = {}) {
  if (!options.force) {
    const cached = readPublicCache(key, options);
    if (cached !== null) return cached;
  }

  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const request = Promise.resolve()
    .then(loader)
    .then((value) => writePublicCache(key, value, options))
    .finally(() => {
      pendingRequests.delete(key);
    });

  pendingRequests.set(key, request);
  return request;
}
