import BASE_URL from '../../services/http/const';

const AUTH_EXPIRED_EVENT = 'auth:expired';
const AUTH_USER_UPDATED_EVENT = 'auth:user-updated';
let interceptorInstalled = false;
let accountRefreshPromise = null;

function hasBearerToken(init) {
  const h = init?.headers;
  if (!h) return false;

  if (h instanceof Headers) {
    return /^Bearer\s+/i.test(h.get('Authorization') || '');
  }

  if (Array.isArray(h)) {
    const entry = h.find(([key]) => String(key).toLowerCase() === 'authorization');
    return !!entry && /^Bearer\s+/i.test(String(entry[1] || ''));
  }

  const auth = h.Authorization || h.authorization;
  return /^Bearer\s+/i.test(String(auth || ''));
}

function requestUrl(input) {
  if (typeof input === 'string') return input;
  if (input && typeof input.url === 'string') return input.url;
  return '';
}

async function isApplicationSessionUnauthorized(response) {
  try {
    const data = await response.clone().json();
    const message = String(data?.message || '').trim().toLowerCase();

    return message.includes('unauthenticated')
      || message.includes('no hay sesion activa')
      || message.includes('no autenticado');
  } catch {
    return false;
  }
}

export function clearAuthStorage() {
  // Clear auth/user keys in both storages to avoid stale mixed state.
  localStorage.removeItem('tokenPORT');
  localStorage.removeItem('usuario');

  sessionStorage.removeItem('tokenPORT');
  sessionStorage.removeItem('usuario');
  sessionStorage.removeItem('perfil_cache');

  try {
    for (let index = sessionStorage.length - 1; index >= 0; index -= 1) {
      const key = sessionStorage.key(index);
      if (key?.startsWith('notifications-cache:v1:')) {
        sessionStorage.removeItem(key);
      }
    }
  } catch {
    // Cache is only an optimization.
  }
}

export function getStoredUser() {
  const raw = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function hasActiveStoredSession() {
  const token = localStorage.getItem('tokenPORT') || sessionStorage.getItem('tokenPORT');
  return Boolean(token && getStoredUser());
}

async function isPausedAccountResponse(response) {
  if (response.status !== 423) return false;

  try {
    const data = await response.clone().json();
    return data?.status === 'account_paused';
  } catch {
    return false;
  }
}

export function setStoredUser(user) {
  const useSessionStorage = !localStorage.getItem('tokenPORT') && !!sessionStorage.getItem('tokenPORT');
  const storage = useSessionStorage ? sessionStorage : localStorage;

  storage.setItem('usuario', JSON.stringify(user));

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AUTH_USER_UPDATED_EVENT, { detail: user }));
  }
}

async function requestStoredUserRefresh() {
  const token = localStorage.getItem('tokenPORT') || sessionStorage.getItem('tokenPORT');
  if (!token) return null;

  const response = await fetch(`${BASE_URL}/auth/me`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) return null;

  const payload = await response.json();
  if (!payload?.data) return null;

  setStoredUser(payload.data);
  return payload.data;
}

export function refreshStoredUser() {
  if (!accountRefreshPromise) {
    accountRefreshPromise = requestStoredUserRefresh()
      .finally(() => {
        accountRefreshPromise = null;
      });
  }

  return accountRefreshPromise;
}

export function onStoredUserUpdated(handler) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(AUTH_USER_UPDATED_EVENT, handler);
  return () => window.removeEventListener(AUTH_USER_UPDATED_EVENT, handler);
}

export function normalizeUserRole(user = getStoredUser()) {
  const roleSource = user?.rol ?? user?.role ?? user?.tipo_rol ?? user?.tipoRol ?? '';
  const value = typeof roleSource === 'object'
    ? roleSource.nombre || roleSource.name || roleSource.codigo || roleSource.code || ''
    : roleSource;
  const role = String(value || '').trim().toLowerCase();

  if (role === 'admin' || role === 'administrador') return 'admin';
  if (role === 'publicador' || role === 'publisher' || role === 'publicante') return 'publicador';
  return 'usuario';
}

export function isAdminUser(user = getStoredUser()) {
  return normalizeUserRole(user) === 'admin';
}

export function isPublisherUser(user = getStoredUser()) {
  return normalizeUserRole(user) === 'publicador';
}

export function getDashboardHomePath(user = getStoredUser()) {
  return isAdminUser(user) ? '/admin' : '/dashboard';
}

export function emitAuthExpired() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
}

export function onAuthExpired(handler) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(AUTH_EXPIRED_EVENT, handler);
  return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handler);
}

export function installAuth401Interceptor() {
  if (typeof window === 'undefined' || interceptorInstalled) {
    return () => {};
  }

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init) => {
    const res = await originalFetch(input, init);

    const isBackendCall = requestUrl(input).startsWith(BASE_URL);
    const isProtectedCall = hasBearerToken(init);

    if (
      res.status === 401
      && isBackendCall
      && isProtectedCall
      && await isApplicationSessionUnauthorized(res)
    ) {
      clearAuthStorage();
      emitAuthExpired();
    }

    if (
      isBackendCall
      && isProtectedCall
      && await isPausedAccountResponse(res)
    ) {
      refreshStoredUser().catch(() => {
        // The rejected write remains authoritative; a later refresh retries account sync.
      });
    }

    return res;
  };

  interceptorInstalled = true;

  return () => {
    window.fetch = originalFetch;
    interceptorInstalled = false;
  };
}
