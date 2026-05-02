// ═══════════════════════════════════════════
// viewService.js
// src/features/dashboard/view/services/viewService.js
//
// Contrato completo de API para la vista portafolio.
// Agrupa en un solo lugar TODAS las llamadas necesarias
// para construir la vista pública del usuario:
//   - Perfil
//   - Redes sociales
//   - Experiencias
//   - Habilidades (técnicas + blandas)
//   - Proyectos publicados
//   - Configuración visual del portafolio
//
// Cada función documenta:
//   - Ruta exacta del backend (Laravel)
//   - Método HTTP
//   - Payload esperado / respuesta esperada
//   - TODO backend: qué debe implementar el desarrollador
// ═══════════════════════════════════════════
import { DEFAULT_CONFIG } from '../model/viewModel';
const API_URL      = process.env.REACT_APP_API_URL      || 'http://localhost:8000/api';
const STORAGE_URL  = process.env.REACT_APP_STORAGE_URL  || 'http://localhost:8000/storage';

// ── Helper: sesión ──
function getSession() {
  const raw = sessionStorage.getItem('usuario');
  if (!raw) throw new Error('No hay sesión activa');
  const user   = JSON.parse(raw);
  const userId = user.id || user.id_usuario || user.idUsuario;
  if (!userId) throw new Error('ID de usuario no encontrado');
  const token  = localStorage.getItem('tokenPORT') || sessionStorage.getItem('tokenPORT');
  if (!token) throw new Error('Token no encontrado');
  return { userId, token };
}

// ── Helper: fetch autenticado ──
async function apiFetch(url, options = {}) {
  const { token } = getSession();
  const res = await fetch(url, {
    ...options,
    headers: {
      Accept:        'application/json',
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

// ── Helper: construir URL completa de imagen ──
export function buildImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${STORAGE_URL}/${path}`;
}

// ═══════════════════════════════════════════
// 1. PORTAFOLIO COMPLETO (un solo fetch)
// ═══════════════════════════════════════════

/**
 * GET /api/portfolio/:userId
 *
 * Devuelve TODOS los datos necesarios para renderizar la vista
 * pública del portafolio en una sola llamada optimizada.
 *
 * Respuesta esperada:
 * {
 *   perfil:       Usuario + visibilidad,
 *   redes:        RedSocial[],
 *   experiencias: Experiencia[],
 *   habilidades:  { tecnicas: Habilidad[], blandas: Habilidad[] },
 *   proyectos:    Proyecto[],             ← solo es_publico = true
 *   config:       PortafolioConfig | null
 * }
 *
 * TODO backend: Controller PortfolioController@show
 *   - Eager load: redes, experiencias, habilidades.catalogo,
 *                 proyectos (where es_publico=true).etiquetas,
 *                 portafolioConfig
 *   - Ordenar proyectos por fecha_modificacion DESC
 *   - Ordenar experiencias por fecha_inicio DESC
 *   - Ordenar habilidades por porcentaje DESC
 *   - Separar habilidades en tecnicas/blandas según catalogo_habilidad.tipo
 *   - Incluir solo campos visibles según perfil.visibilidad (JSON)
 *   - Devolver config visual o null si nunca se guardó
 */
export async function getPortfolioCompleto() {
  const { userId } = getSession();
  return apiFetch(`${API_URL}/portfolio/${userId}`);
}

// ═══════════════════════════════════════════
// 2. DATOS INDIVIDUALES (fetches separados)
//    Útiles si el backend no implementa el endpoint unificado aún.
// ═══════════════════════════════════════════

/**
 * GET /api/profile/:userId
 * Devuelve datos del perfil + visibilidad.
 *
 * TODO backend: ya existe en ProfileController@show
 *   - Asegurarse de incluir campo 'visibilidad' (JSON)
 *   - Incluir foto_perfil y foto_fondo como paths relativos
 */
export async function getPerfil() {
  const { userId } = getSession();
  return apiFetch(`${API_URL}/profile/${userId}`);
}

/**
 * GET /api/redes/usuario/:userId
 * Devuelve las redes sociales del usuario.
 *
 * Respuesta esperada: RedSocial[]
 * {
 *   id, nombre, url, tipo   ← tipo: 'linkedin'|'github'|'twitter'|'web'|...
 * }
 *
 * TODO backend: Controller RedesController@index
 *   - Filtra por usuario_id = auth()->id()
 *   - Ordena por orden ASC (si existe campo de orden)
 */
export async function getRedes() {
  const { userId } = getSession();
  return apiFetch(`${API_URL}/redes/usuario/${userId}`);
}

/**
 * GET /api/experiencias/usuario/:userId
 * Devuelve las experiencias del usuario.
 *
 * Respuesta esperada: Experiencia[]
 * {
 *   id, tipo, cargo, organizacion,
 *   fecha_inicio, fecha_fin, actual, descripcion
 * }
 *
 * TODO backend: Controller ExperienciasController@index
 *   - Filtra por usuario_id = auth()->id()
 *   - Ordena por fecha_inicio DESC
 */
export async function getExperiencias() {
  const { userId } = getSession();
  return apiFetch(`${API_URL}/experiencias/usuario/${userId}`);
}

/**
 * GET /api/habilidades/usuario/:userId
 * Devuelve las habilidades del usuario.
 *
 * Respuesta esperada: Habilidad[]
 * {
 *   id_habilidad, nombre, nivel, porcentaje, descripcion,
 *   tipo   ← 'tecnica' | 'blanda'  (desde catalogo_habilidad.tipo)
 * }
 *
 * TODO backend: Controller HabilidadesController@index
 *   - Eager load catalogo_habilidad para obtener nombre y tipo
 *   - Filtra por usuario_id = auth()->id() y es_publico = true
 *   - Ordena por porcentaje DESC
 */
export async function getHabilidades() {
  const { userId } = getSession();
  return apiFetch(`${API_URL}/habilidades/usuario/${userId}`);
}

/**
 * GET /api/projects/usuario/:userId
 * Devuelve los proyectos públicos del usuario.
 *
 * Respuesta esperada: Proyecto[]
 * {
 *   id, titulo, descripcion, tipo,
 *   url_repositorio, url_demo, url_video,
 *   imagen_portada, estado, etiquetas: string[],
 *   fecha_inicio, fecha_fin, en_curso
 * }
 *
 * TODO backend: ya existe en ProjectController@index
 *   - Agregar filtro where es_publico = true para la vista pública
 *   - Eager load etiquetas
 */
export async function getProyectosPublicos() {
  const { userId } = getSession();
  return apiFetch(`${API_URL}/projects/usuario/${userId}?publicos=true`);
}

// ═══════════════════════════════════════════
// 3. CONFIGURACIÓN VISUAL DEL PORTAFOLIO
// ═══════════════════════════════════════════

/**
 * GET /api/portfolio/:userId/config
 * Obtiene la configuración visual guardada del portafolio.
 *
 * Respuesta esperada: PortafolioConfig | {}
 * {
 *   hero_color, hero_bg_source, hero_pattern,
 *   avatar_bg_source, avatar_color,
 *   accent_color, card_bg,
 *   text_color_auto, text_color,
 *   font_id, frame_id, disponible
 * }
 *
 * TODO backend: Controller PortfolioConfigController@show
 *   - Tabla: portafolio_config (id, usuario_id, config JSON o columnas individuales)
 *   - Si no existe → devolver {} (el frontend usa DEFAULT_CONFIG)
 */
export async function getConfig() {
  const { userId } = getSession();
  return apiFetch(`${API_URL}/portfolio/${userId}/config`);
}

/**
 * PUT /api/portfolio/:userId/config
 * Guarda/actualiza la configuración visual del portafolio.
 *
 * Payload (camelCase → snake_case en backend):
 * {
 *   hero_color, hero_bg_source, hero_pattern,
 *   avatar_bg_source, avatar_color,
 *   accent_color, card_bg,
 *   text_color_auto, text_color,
 *   font_id, frame_id, disponible
 * }
 *
 * Respuesta esperada: PortafolioConfig actualizado
 *
 * TODO backend: Controller PortfolioConfigController@upsert
 *   - updateOrCreate(['usuario_id' => $id], $validatedData)
 *   - Tabla portafolio_config:
 *     id, usuario_id (FK), hero_color, hero_bg_source, hero_pattern,
 *     avatar_bg_source, avatar_color, accent_color, card_bg,
 *     text_color_auto (boolean), text_color, font_id,
 *     frame_id, disponible (boolean), updated_at
 */
export async function saveConfig(config) {
  const { userId } = getSession();

  // Convertir camelCase → snake_case para el backend
  const payload = {
    hero_color:       config.heroColor,
    hero_bg_source:   config.heroBgSource,
    hero_pattern:     config.heroPattern,
    avatar_bg_source: config.avatarBgSource,
    avatar_color:     config.avatarColor,
    accent_color:     config.accentColor,
    card_bg:          config.cardBg,
    text_color_auto:  config.textColorAuto,
    text_color:       config.textColor,
    font_id:          config.fontId,
    frame_id:         config.frameId,
    disponible:       config.disponible,
  };

  return apiFetch(`${API_URL}/portfolio/${userId}/config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

// ═══════════════════════════════════════════
// 4. PUBLICACIÓN / VISIBILIDAD GLOBAL
// ═══════════════════════════════════════════

/**
 * PATCH /api/portfolio/:userId/publish
 * Activa o desactiva la publicación del portafolio completo.
 *
 * Payload: { publicado: boolean }
 *
 * Respuesta esperada: { publicado: boolean, url_publica: string }
 *
 * TODO backend:
 *   - Actualiza campo portfolio_publico en tabla usuarios
 *   - Devuelve la URL pública del portafolio
 *     Ej: { url_publica: "https://creafolio.app/u/aaronparra" }
 */
export async function publicarPortafolio(publicado) {
  const { userId } = getSession();
  return apiFetch(`${API_URL}/portfolio/${userId}/publish`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicado }),
  });
}

// ═══════════════════════════════════════════
// 5. HELPER: mapear respuesta del backend
//    al formato que espera el frontend
// ═══════════════════════════════════════════

/**
 * Convierte la config en snake_case del backend
 * al camelCase que usa DEFAULT_CONFIG en viewModel.js
 */
function limpiarUndefined(obj = {}) {
  return Object.fromEntries(
    Object.entries(obj || {}).filter(([, value]) => value !== undefined && value !== null)
  );
}

export function mapConfigFromBackend(raw) {
  if (!raw || Object.keys(raw).length === 0) {
    return { ...DEFAULT_CONFIG };
  }

  const mapped = {
    heroColor:      raw.hero_color,
    heroBgSource:   raw.hero_bg_source,
    heroPattern:    raw.hero_pattern,
    avatarBgSource: raw.avatar_bg_source,
    avatarColor:    raw.avatar_color,
    accentColor:    raw.accent_color,
    cardBg:         raw.card_bg,
    textColorAuto:  raw.text_color_auto,
    textColor:      raw.text_color,
    fontId:         raw.font_id,
    frameId:        raw.frame_id,
    disponible:     raw.disponible,
  };

  return {
    ...DEFAULT_CONFIG,
    ...limpiarUndefined(mapped),
  };
}

/**
 * Mapea los datos del perfil del backend al formato del frontend.
 * Construye las URLs completas de imágenes.
 */
export function mapPerfilFromBackend(raw) {
  if (!raw) return null;
  return {
    ...raw,
    avatarUrl: buildImageUrl(raw.foto_perfil),
    bannerUrl: buildImageUrl(raw.foto_fondo),
  };
}

/**
 * Mapea los proyectos del backend al formato del frontend.
 * Construye la URL de imagen de portada.
 */
export function mapProyectosFromBackend(lista = []) {
  return lista.map(p => ({
    ...p,
    imagenUrl: buildImageUrl(p.imagen_portada),
    etiquetas: Array.isArray(p.etiquetas) ? p.etiquetas : [],
  }));
}

/**
 * Separa el array plano de habilidades en técnicas y blandas.
 * Espera que cada habilidad tenga campo 'tipo': 'tecnica' | 'blanda'
 */
export function separarHabilidades(lista = []) {
  return {
    tecnicas: lista.filter(h => h.tipo === 'tecnica'),
    blandas:  lista.filter(h => h.tipo === 'blanda'),
  };
}