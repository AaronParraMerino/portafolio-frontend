import BASE_URL from '../../services/http/const';

const AUTH_EXPIRED_EVENT = 'auth:expired';
let interceptorInstalled = false;

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

export function clearAuthStorage() {
  // Clear auth/user keys in both storages to avoid stale mixed state.
  localStorage.removeItem('tokenPORT');
  localStorage.removeItem('usuario');

  sessionStorage.removeItem('tokenPORT');
  sessionStorage.removeItem('usuario');
  sessionStorage.removeItem('perfil_cache');
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

    if (res.status === 401 && isBackendCall && isProtectedCall) {
      clearAuthStorage();
      emitAuthExpired();
    }

    return res;
  };

  interceptorInstalled = true;

  return () => {
    window.fetch = originalFetch;
    interceptorInstalled = false;
  };
}
