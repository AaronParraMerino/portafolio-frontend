// ═══════════════════════════════════════════
// PROFILE SERVICE
// ═══════════════════════════════════════════
const API_URL = "http://localhost:8000/api";

// ── Helper: obtener usuario y token ──
function getSessionUser() {
  const storedUser = sessionStorage.getItem('usuario');
  if (!storedUser) throw new Error("No hay usuario en sesión");

  const user = JSON.parse(storedUser);
  const userId = user.id || user.id_usuario || user.idUsuario;
  if (!userId) throw new Error("No se encontró el ID del usuario en sesión");

  const token =
    localStorage.getItem('tokenPORT') ||
    sessionStorage.getItem('tokenPORT');
  if (!token) throw new Error("No se encontró el token");

  return { userId, token };
}

// ── Helper: parsear respuesta de forma segura ──
// Si el backend devuelve HTML (página de error o index.html de React),
// lo detectamos por el Content-Type antes de intentar parsear.
async function safeJson(res) {
  const contentType = res.headers.get('content-type') || '';

  // Si el servidor devuelve HTML, no intentar parsear como JSON
  if (contentType.includes('text/html')) {
    const preview = await res.text();
    console.error('[profileService] El backend devolvió HTML en vez de JSON.');
    console.error('[profileService] Primeros 200 chars:', preview.slice(0, 200));
    console.error('[profileService] URL:', res.url, '| Status:', res.status);
    throw new Error(
      `El servidor devolvió HTML en lugar de JSON (status ${res.status}). ` +
      `Verificar que la ruta existe en Laravel y que el controlador devuelve response()->json().`
    );
  }

  const text = await res.text();

  if (!text || text.trim() === '') {
    // Respuesta vacía — se trata como éxito silencioso
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    console.error('[profileService] JSON inválido recibido:', text.slice(0, 200));
    throw new Error(`Respuesta no parseable del servidor (status ${res.status}).`);
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

// ── GET perfil del usuario autenticado ──
// El backend YA devuelve foto_perfil y foto_fondo desde getProfile()
// luego del fix en ProfileService.php
export async function getProfile() {
  const { userId } = getSessionUser();
  return apiFetch(`${API_URL}/profile/${userId}`, {
    headers: { 'Content-Type': 'application/json' },
  });
}

// ── PUT actualizar datos personales ──
export async function updateProfile(datos) {
  const { userId } = getSessionUser();
  return apiFetch(`${API_URL}/profile/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
}

// ── PATCH actualizar visibilidad de campos ──
export async function updateVisibility(data) {
  const { userId } = getSessionUser();
  return apiFetch(`${API_URL}/profile/${userId}/visibility`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

// ── POST subir imagen (avatar o banner) ──
// Lógica:
//   1. Intentar POST /image/update (actualizar imagen existente)
//   2. Si el backend responde 404 → el perfil no tiene imagen aún → POST /image (crear)
//   3. Si el backend responde HTML con status 200 → la ruta no existe en Laravel
//      → Solución: verificar que ProfileController@updateImage devuelve response()->json()
export async function uploadImage(tipoOriginal, archivo) {
  const { userId, token } = getSessionUser();
  const tipoBackend = tipoOriginal === 'avatar' ? 'profile' : tipoOriginal;

  const formData = new FormData();
  formData.append('imagen', archivo);
  formData.append('tipo', tipoBackend);

  const tryUpload = (url) =>
    fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

  // Intentar UPDATE primero
  let res = await tryUpload(`${API_URL}/profile/${userId}/image/update`);

  // Si no existe registro de imagen → intentar CREATE
  if (res.status === 404 || res.status === 422) {
    console.log('[uploadImage] No existe imagen previa, intentando crear...');
    res = await tryUpload(`${API_URL}/profile/${userId}/image`);
    if (!res.ok) {
      const err = await safeJson(res).catch(() => ({}));
      throw new Error(err.message || `Fallo al crear imagen (${res.status})`);
    }
  } else if (!res.ok) {
    const err = await safeJson(res).catch(() => ({}));
    throw new Error(err.message || `Fallo al actualizar imagen (${res.status})`);
  }

  const resultado = await safeJson(res);
  console.log('[uploadImage] Respuesta backend:', resultado);
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

  return safeJson(res);
}