// ═══════════════════════════════════════════
// PROFILE SERVICE — optimizado
// ═══════════════════════════════════════════
import {
  getCachedDashboardEndpoint,
  invalidateDashboardDerivedCaches,
  readCachedDashboardEndpoint,
  writeCachedDashboardEndpoint,
} from '../../services/dashboardCache';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// ── Helper: obtener usuario y token ──
function getSessionUser() {
  const storedUser = localStorage.getItem('usuario');
  if (!storedUser) throw new Error("No hay usuario en sesión");

  const user   = JSON.parse(storedUser);
  const userId = user.id || user.id_usuario || user.idUsuario;
  if (!userId) throw new Error("No se encontró el ID del usuario en sesión");

  const token = localStorage.getItem('tokenPORT');
  if (!token) throw new Error("No se encontró el token");

  return { userId, token };
}

function profileEndpoint(userId) {
  return `/profile/${userId}`;
}

function updateProfileEndpointCache(userId, patch, { invalidate = true } = {}) {
  const endpoint = profileEndpoint(userId);
  const current = readCachedDashboardEndpoint(endpoint, { userId }) || {};
  const payload = patch?.data && typeof patch.data === 'object' ? patch.data : patch;

  writeCachedDashboardEndpoint(endpoint, {
    ...current,
    ...(payload || {}),
  }, { userId });

  if (invalidate) {
    invalidateDashboardDerivedCaches(userId);
  }
}

export function setCachedProfile(perfil) {
  const { userId } = getSessionUser();
  updateProfileEndpointCache(userId, perfil, { invalidate: false });
}

// ── Helper: parsear respuesta de forma segura ──
async function safeJson(res) {
  const contentType = res.headers.get('content-type') || '';

  if (contentType.includes('text/html')) {
    const preview = await res.text();
    console.error('[profileService] Backend devolvió HTML. URL:', res.url, '| Status:', res.status);
    console.error('[profileService] Preview:', preview.slice(0, 150));
    throw new Error(
      `El servidor devolvió HTML en lugar de JSON (${res.status}). ` +
      `Verificar que la ruta existe en Laravel y que el controlador devuelve response()->json().`
    );
  }

  const text = await res.text();
  if (!text || text.trim() === '') return {};

  try {
    return JSON.parse(text);
  } catch {
    console.error('[profileService] JSON inválido:', text.slice(0, 150));
    throw new Error(`Respuesta no parseable del servidor (${res.status}).`);
  }
}

// ── Helper base para fetch autenticado ──
async function apiFetch(url, options = {}) {
  const { token } = getSessionUser();
  const res = await fetch(url, {
    ...options,
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const errorData = await safeJson(res).catch(() => ({ message: `Error ${res.status}` }));
    throw new Error(errorData.message || `Error ${res.status}`);
  }

  return safeJson(res);
}

// ── GET perfil ──
export async function getProfile({ force = false } = {}) {
  const { userId } = getSessionUser();
  const endpoint = profileEndpoint(userId);

  return getCachedDashboardEndpoint(
    endpoint,
    () => apiFetch(`${API_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
    }),
    { force, userId },
  );
}

// ── PUT actualizar datos personales ──
export async function updateProfile(datos) {
  const { userId } = getSessionUser();
  const data = await apiFetch(`${API_URL}/profile/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });

  updateProfileEndpointCache(userId, data);
  return data;
}

// ── PATCH actualizar visibilidad ──
export async function updateVisibility(data) {
  const { userId } = getSessionUser();
  const result = await apiFetch(`${API_URL}/profile/${userId}/visibility`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  updateProfileEndpointCache(userId, {
    ...(result?.data && typeof result.data === 'object' ? result.data : result),
    visibilidad: {
      ...(readCachedDashboardEndpoint(profileEndpoint(userId), { userId })?.visibilidad || {}),
      ...data,
    },
  });

  return result;
}

// ── POST subir imagen ──
// OPTIMIZACIÓN: recibe el método correcto desde useProfile (no más doble fetch).
// useProfile sabe si ya existe imagen → pasa method = 'update' | 'create'.
export async function uploadImage(tipoOriginal, archivo, method = 'update') {
  const { userId, token } = getSessionUser();
  const tipoBackend = tipoOriginal === 'avatar' ? 'profile' : tipoOriginal;

  const formData = new FormData();
  formData.append('file', archivo);
  formData.append('tipo', tipoBackend);

  const url = method === 'update'
    ? `${API_URL}/profile/${userId}/image/update`
    : `${API_URL}/profile/${userId}/image`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await safeJson(res).catch(() => ({}));
    throw new Error(err.message || `Fallo al subir imagen (${res.status})`);
  }

  const resultado = await safeJson(res);
  console.log('[uploadImage] Respuesta:', resultado);
  updateProfileEndpointCache(userId, resultado);
  return resultado;
}

// ── DELETE eliminar imagen ──
export async function deleteImage(tipoOriginal) {
  const { userId, token } = getSessionUser();
  const tipoBackend = tipoOriginal === 'avatar' ? 'profile' : tipoOriginal;

  const res = await fetch(
    `${API_URL}/profile/${userId}/image/delete?tipo=${tipoBackend}`,
    {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    const err = await safeJson(res).catch(() => ({}));
    throw new Error(err.message || `Error al eliminar imagen (${res.status})`);
  }

  const data = await safeJson(res);

  updateProfileEndpointCache(userId, {
    ...(tipoOriginal === 'avatar'
      ? { foto_perfil: null }
      : { foto_fondo: null }
    ),
  });

  return data;
}
