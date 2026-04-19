// ═══════════════════════════════════════════
// projectsService.js
// src/features/dashboard/projects/services/projectsService.js
//
// Contrato de API con el backend.
// Por ahora todas las funciones están marcadas con TODO.
// El backend debe implementar estas rutas en Laravel.
// ═══════════════════════════════════════════

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// ── Helper: token y userId ──
function getSession() {
  const raw = sessionStorage.getItem('usuario');
  if (!raw) throw new Error('No hay sesión activa');
  const user = JSON.parse(raw);
  const userId = user.id || user.id_usuario || user.idUsuario;
  if (!userId) throw new Error('ID de usuario no encontrado');
  const token = localStorage.getItem('tokenPORT') || sessionStorage.getItem('tokenPORT');
  if (!token) throw new Error('Token no encontrado');
  return { userId, token };
}

// ── Helper: fetch autenticado ──
async function apiFetch(url, options = {}) {
  const { token } = getSession();
  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    let msg = `Error ${res.status}`;
    try { const d = await res.json(); msg = d.message || msg; } catch {}
    throw new Error(msg);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

// ═══════════════════════════════════════════
// PROYECTOS
// ═══════════════════════════════════════════

/**
 * GET /api/projects/usuario/:userId
 * Devuelve todos los proyectos del usuario autenticado.
 * Respuesta esperada: Project[]
 *
 * TODO backend: Controller ProjectController@index
 *   - Filtra por usuario_id = auth()->id()
 *   - Eager load: etiquetas (via proyecto_etiqueta → etiqueta)
 *   - Ordena por fecha_modificacion DESC
 */
export async function getProyectos() {
  const { userId } = getSession();
  return apiFetch(`${API_URL}/projects/usuario/${userId}`);
}

/**
 * GET /api/projects/:id
 * Devuelve un proyecto específico con sus etiquetas.
 * Respuesta esperada: Project (con relación etiquetas[])
 *
 * TODO backend: Controller ProjectController@show
 *   - Verifica que proyecto.usuario_id === auth()->id()
 */
export async function getProyecto(id) {
  return apiFetch(`${API_URL}/projects/${id}`);
}

/**
 * POST /api/projects
 * Crea un nuevo proyecto.
 * Payload: { titulo, descripcion, url_repositorio, url_demo,
 *             estado, es_publico, fecha_inicio, fecha_fin,
 *             en_curso, tipo, etiquetas: string[] }
 * Respuesta esperada: Project creado
 *
 * TODO backend: Controller ProjectController@store
 *   - Asigna usuario_id = auth()->id()
 *   - Sync etiquetas: busca o crea en tabla etiqueta, luego inserta en proyecto_etiqueta
 *   - NO sube imagen aquí; la imagen se sube con uploadImagenPortada()
 */
export async function crearProyecto(datos) {
  return apiFetch(`${API_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
}

/**
 * PUT /api/projects/:id
 * Actualiza los datos de un proyecto existente.
 * Payload: mismo que crearProyecto (parcial)
 * Respuesta esperada: Project actualizado
 *
 * TODO backend: Controller ProjectController@update
 *   - Verifica que proyecto.usuario_id === auth()->id()
 *   - Re-sync etiquetas igual que en store
 */
export async function actualizarProyecto(id, datos) {
  return apiFetch(`${API_URL}/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
}

/**
 * DELETE /api/projects/:id
 * Elimina un proyecto y sus relaciones (proyecto_etiqueta).
 * Respuesta esperada: { message: 'Eliminado' }
 *
 * TODO backend: Controller ProjectController@destroy
 *   - Verifica que proyecto.usuario_id === auth()->id()
 *   - Elimina registros hijo en proyecto_etiqueta primero
 *   - Elimina imagen de storage si existe
 */
export async function eliminarProyecto(id) {
  return apiFetch(`${API_URL}/projects/${id}`, { method: 'DELETE' });
}

/**
 * PATCH /api/projects/:id/visibility
 * Cambia únicamente la visibilidad (es_publico) de un proyecto.
 * Payload: { es_publico: boolean }
 * Respuesta esperada: { id, es_publico }
 *
 * TODO backend: Controller ProjectController@updateVisibility
 *   - Solo actualiza el campo es_publico
 */
export async function actualizarVisibilidad(id, esPublico) {
  return apiFetch(`${API_URL}/projects/${id}/visibility`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ es_publico: esPublico }),
  });
}

// ═══════════════════════════════════════════
// IMAGEN DE PORTADA
// ═══════════════════════════════════════════

/**
 * POST /api/projects/:id/image
 *   — Sube imagen por primera vez (sin imagen previa)
 * POST /api/projects/:id/image/update
 *   — Reemplaza imagen existente
 *
 * Payload: FormData con campo 'file' (imagen)
 * Respuesta esperada: { url: string }
 *
 * TODO backend:
 *   - Valida que sea imagen (max 5MB, jpeg/png/webp)
 *   - Almacena en storage/app/public/projects/{userId}/
 *   - Actualiza campo imagen_portada en tabla proyectos
 *   - En /update: elimina la imagen anterior del disco
 *   - Devuelve la URL pública (storage_url + path relativo)
 *
 * @param {number}  id          ID del proyecto
 * @param {File}    archivo     Archivo de imagen
 * @param {boolean} tieneImagen Si ya tiene imagen → usa /update
 */
export async function uploadImagenPortada(id, archivo, tieneImagen = false) {
  const { token } = getSession();
  const formData = new FormData();
  formData.append('file', archivo);

  const endpoint = tieneImagen
    ? `${API_URL}/projects/${id}/image/update`
    : `${API_URL}/projects/${id}/image`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    let msg = `Error ${res.status}`;
    try { const d = await res.json(); msg = d.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

/**
 * DELETE /api/projects/:id/image
 * Elimina la imagen de portada del proyecto.
 * Respuesta esperada: { message: 'Imagen eliminada' }
 *
 * TODO backend:
 *   - Elimina el archivo físico del storage
 *   - Setea imagen_portada = null en la BD
 */
export async function eliminarImagenPortada(id) {
  return apiFetch(`${API_URL}/projects/${id}/image`, { method: 'DELETE' });
}

// ═══════════════════════════════════════════
// VISIBILIDAD GLOBAL DEL PORTAFOLIO
// ═══════════════════════════════════════════

/**
 * PATCH /api/profile/:userId/portfolio-visibility
 * Activa o desactiva la visibilidad global del portafolio completo.
 * Payload: { portfolio_publico: boolean }
 *
 * TODO backend:
 *   - Actualiza campo portfolio_publico (o similar) en tabla usuarios
 *   - Puede reutilizar el endpoint de visibilidad del perfil
 */
export async function actualizarVisibilidadGlobal(esPublico) {
  const { userId } = getSession();
  return apiFetch(`${API_URL}/profile/${userId}/portfolio-visibility`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ portfolio_publico: esPublico }),
  });
}