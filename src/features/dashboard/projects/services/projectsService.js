// ═══════════════════════════════════════════
// projectsService.js
// src/features/dashboard/projects/services/projectsService.js
//
// Capa de adaptación Frontend <-> Backend Laravel.
//
// El frontend trabaja con:
// id, titulo, descripcion, estado, tipo, desarrollado_para,
// url_repositorios, url_demo, url_videos, imagenes, documentos,
// fecha_inicio, fecha_fin, en_curso, es_publico, etiquetas.
//
// El backend puede trabajar con:
// id_proyecto, id_tipo_proyecto, estado_publicacion, estado_desarrollo,
// participaciones, proyecto_evidencias/evidencias, tipos_proyecto, etc.
// ═══════════════════════════════════════════

import {
  getCachedDashboardEndpoint,
  invalidateDashboardDerivedCaches,
  readCachedDashboardEndpoint,
  removeCachedDashboardEndpoint,
  writeCachedDashboardEndpoint,
} from '../../services/dashboardCache';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const STORAGE_URL = process.env.REACT_APP_STORAGE_URL || 'http://localhost:8000/storage';
const TECNOLOGIAS_CACHE_KEY = 'projects_tecnologias_catalogo_cache_v1';
const PARTICIPANTES_CACHE_PREFIX = 'projects_participantes_cache_v1';

// ═══════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════

export const PROJECT_LIMITS = {
  images: 5,
  videosYoutube: 2,
  repositoriosGithub: 3,
  documentos: 2,
  imageMaxMb: 2,
  documentMaxMb: 2,
};

export const DOCUMENT_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'md', 'odt'];

// ═══════════════════════════════════════════
// SESIÓN / FETCH
// ═══════════════════════════════════════════

function getSession() {
  const raw = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');

  if (!raw) throw new Error('No hay sesión activa');

  let user;

  try {
    user = JSON.parse(raw);
  } catch {
    throw new Error('Sesion invalida. Inicia sesion nuevamente');
  }

  const userId = user.id || user.id_usuario || user.idUsuario;

  if (!userId) throw new Error('ID de usuario no encontrado');

  const token = localStorage.getItem('tokenPORT') || sessionStorage.getItem('tokenPORT');

  if (!token) throw new Error('Token no encontrado');

  return { userId, token };
}

function getStoredUserId() {
  try {
    const raw = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
    if (!raw) return 'anon';
    const user = JSON.parse(raw);
    return user.id || user.id_usuario || user.idUsuario || 'anon';
  } catch {
    return 'anon';
  }
}

function userProjectsEndpoint(userId) {
  return `/projects/usuario/${userId}`;
}

function projectEndpoint(id) {
  return `/projects/${id}`;
}

function unwrapProjectsPayload(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.proyectos)) return data.proyectos;
  return [];
}

function getCachedProjectId(project = {}) {
  return project.id_proyecto || project.id || project.idProyecto || null;
}

function readUserProjectsCache(userId) {
  return unwrapProjectsPayload(readCachedDashboardEndpoint(userProjectsEndpoint(userId), { userId }));
}

function writeUserProjectsCache(userId, projects = [], { invalidate = true } = {}) {
  writeCachedDashboardEndpoint(userProjectsEndpoint(userId), { data: projects }, { userId });
  if (invalidate) {
    invalidateDashboardDerivedCaches(userId);
  }
}

function updateUserProjectsCache(updater) {
  try {
    const { userId } = getSession();
    const current = readUserProjectsCache(userId);
    writeUserProjectsCache(userId, updater(current));
  } catch {
    // Cache updates should never block the CRUD flow.
  }
}

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

    try {
      const d = await res.json();
      msg = d.message || d.error || msg;
    } catch {}

    throw new Error(msg);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

async function apiFetchFormData(url, formData, options = {}) {
  const { token } = getSession();

  const res = await fetch(url, {
    ...options,
    method: options.method || 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    body: formData,
  });

  if (!res.ok) {
    let msg = `Error ${res.status}`;

    try {
      const d = await res.json();
      msg = d.message || d.error || msg;
    } catch {}

    throw new Error(msg);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

// ═══════════════════════════════════════════
// GITHUB VINCULADO / REPOS DETECTADOS
// ═══════════════════════════════════════════

export async function isGithubLinked({ force = false, provider = 'github' } = {}) {
  const { userId } = getSession();
  const endpoint = '/auth/oauth/linked-providers';
  const data = await getCachedDashboardEndpoint(
    endpoint,
    () => apiFetch(`${API_URL}${endpoint}`),
    { force, userId },
  );

  const providers = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : [];

  const account = providers.find((item) => item.provider === provider);
  return Boolean(account?.connected);
}

export async function getGithubDetectedRepos({ refresh = false, provider = 'github' } = {}) {
  const { userId } = getSession();
  const qs = refresh ? '?refresh=true' : '';
  const endpoint = `/auth/${provider}/repos/detected${qs}`;
  const data = await getCachedDashboardEndpoint(
    endpoint,
    () => apiFetch(`${API_URL}${endpoint}`),
    { force: refresh, userId },
  );

  if (refresh) {
    writeCachedDashboardEndpoint(`/auth/${provider}/repos/detected`, data, { userId });
  }

  return Array.isArray(data?.data) ? data.data : [];
}

export async function syncGithubRepos({ provider = 'github' } = {}) {
  const result = await apiFetch(`${API_URL}/auth/${provider}/repos/sync`, {
    method: 'POST',
  });

  try {
    const { userId } = getSession();
    removeCachedDashboardEndpoint(`/auth/${provider}/repos/detected`, { userId });
    removeCachedDashboardEndpoint(`/auth/${provider}/repos/detected?refresh=true`, { userId });
    removeCachedDashboardEndpoint(`/auth/${provider}/repos/detected/count`, { userId });
    removeCachedDashboardEndpoint(`/auth/${provider}/repos/detected/count?refresh=true`, { userId });
  } catch {
    // no-op
  }

  return result;
}

export async function getGithubConnectUrl({ provider = 'github' } = {}) {
  const data = await apiFetch(`${API_URL}/auth/${provider}/connect-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  return data?.url || '';
}

function mapTecnologiaTipoToCategoria(tipo = '') {
  switch (tipo) {
    case 'lenguaje':
      return 'Lenguaje';
    case 'framework':
      return 'Framework';
    case 'libreria':
      return 'Libreria';
    case 'base_datos':
      return 'Base de datos';
    case 'herramienta':
      return 'Herramienta';
    case 'servicio':
      return 'Servicio';
    case 'plataforma':
      return 'Plataforma';
    default:
      return 'Otro';
  }
}

function normalizeTecnologiaFromApi(tech = {}) {
  return {
    id: tech.id_tecnologia || tech.id || tech.nombre,
    nombre: tech.nombre,
    tipo: tech.tipo || 'otro',
    categoria: mapTecnologiaTipoToCategoria(tech.tipo || 'otro'),
    icono_url: tech.icono_url || null,
    color: tech.color || null,
  };
}

function normalizeTecnologiasCatalogo(items = []) {
  return items
    .map(normalizeTecnologiaFromApi)
    .filter((tech) => tech.nombre);
}

function readTecnologiasCatalogoCache() {
  try {
    const raw = localStorage.getItem(TECNOLOGIAS_CACHE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed?.items) ? parsed.items : [];
    return normalizeTecnologiasCatalogo(items);
  } catch {
    return [];
  }
}

function writeTecnologiasCatalogoCache(items = []) {
  try {
    localStorage.setItem(TECNOLOGIAS_CACHE_KEY, JSON.stringify({
      updatedAt: new Date().toISOString(),
      items: normalizeTecnologiasCatalogo(items),
    }));
  } catch {}
}

function sameTecnologiasCatalogo(a = [], b = []) {
  return JSON.stringify(normalizeTecnologiasCatalogo(a)) === JSON.stringify(normalizeTecnologiasCatalogo(b));
}

export function getTecnologiasCatalogoCache() {
  return readTecnologiasCatalogoCache();
}

export async function refreshTecnologiasCatalogoCache() {
  const res = await fetch(`${API_URL}/tecno`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    return readTecnologiasCatalogoCache();
  }

  const data = await res.json();
  const items = Array.isArray(data?.data) ? data.data : [];
  const tecnologias = normalizeTecnologiasCatalogo(items);
  const cached = readTecnologiasCatalogoCache();

  if (!sameTecnologiasCatalogo(cached, tecnologias)) {
    writeTecnologiasCatalogoCache(tecnologias);
  }

  return tecnologias;
}

export async function getTecnologiasCatalogo() {
  const cached = readTecnologiasCatalogoCache();

  if (cached.length > 0) {
    return cached;
  }

  return refreshTecnologiasCatalogoCache();
}

export async function ensureTecnologia(nombre, tipo = null) {
  const cleanNombre = typeof nombre === 'string' ? nombre.trim() : '';

  if (!cleanNombre) {
    throw new Error('Nombre de tecnologia invalido');
  }

  const body = tipo ? { tipo } : {};
  const data = await apiFetch(`${API_URL}/tecno/${encodeURIComponent(cleanNombre)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const tecnologia = normalizeTecnologiaFromApi(data?.data || {});

  if (tecnologia?.nombre) {
    const cached = readTecnologiasCatalogoCache();
    writeTecnologiasCatalogoCache([...cached, tecnologia]);
  }

  return tecnologia;
}

export async function getGithubRepoLanguages(repoUrl, { provider = 'github' } = {}) {
  const cleanUrl = typeof repoUrl === 'string' ? repoUrl.trim() : '';

  if (!cleanUrl) {
    return [];
  }

  const data = await apiFetch(`${API_URL}/auth/${provider}/repos/languages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repo_url: cleanUrl }),
  });

  return Array.isArray(data?.languages) ? data.languages : [];
}

export async function attachDetectedReposToProject(idProyecto, repositoriosIds = [], participacionData = {}, { provider = 'github' } = {}) {
  const ids = Array.isArray(repositoriosIds)
    ? repositoriosIds.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0)
    : [];

  if (!idProyecto || ids.length === 0) {
    return { status: 'skipped' };
  }

  const body = {
    id_proyecto: Number(idProyecto),
    repositorios_ids: ids,
  };

  if (participacionData && typeof participacionData === 'object') {
    const rol = typeof participacionData.rol === 'string' ? participacionData.rol.trim() : '';
    const descripcion = typeof participacionData.descripcion_aporte === 'string' ? participacionData.descripcion_aporte.trim() : '';

    if (rol || descripcion) {
      body.participacion_data = {};
      if (rol) body.participacion_data.rol = rol;
      if (descripcion) body.participacion_data.descripcion_aporte = descripcion;
    }
  }

  return apiFetch(`${API_URL}/auth/${provider}/repos/attach-to-project`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ═══════════════════════════════════════════
// HELPERS GENERALES
// ═══════════════════════════════════════════

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function cleanArray(values) {
  return Array.isArray(values)
    ? values.map(v => cleanString(v)).filter(Boolean)
    : [];
}

function normalizeBoolean(value) {
  return Boolean(value);
}

function normalizeNullableDate(value) {
  const clean = cleanString(value);
  return clean || null;
}

function normalizeEtiquetas(etiquetas) {
  if (!Array.isArray(etiquetas)) return [];

  return etiquetas
    .map(item => {
      if (typeof item === 'string') return item.trim();
      return item.nombre || item.name || item.label || '';
    })
    .filter(Boolean);
}

function formatUrl(path) {
  if (!path) return '';

  const value = String(path).trim();

  if (!value) return '';
  if (value.startsWith('http://')) return value;
  if (value.startsWith('https://')) return value;
  if (value.startsWith('blob:')) return value;
  if (value.startsWith('data:')) return value;

  return `${STORAGE_URL}/${value.replace(/^\/+/, '')}`;
}

function getFileExtension(filename = '') {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function isDocumentoPermitido(file) {
  if (!file?.name) return false;

  const ext = getFileExtension(file.name);
  return DOCUMENT_EXTENSIONS.includes(ext);
}

function getDocumentoUrl(doc) {
  if (!doc) return '';

  if (typeof doc === 'string') return doc;

  return doc.url || doc.ruta || doc.path || doc.archivo_url || doc.archivoPath || '';
}

function getDocumentoNombre(doc) {
  if (!doc) return 'Documento';

  if (typeof doc === 'string') {
    const clean = doc.split('?')[0];
    return clean.split('/').pop() || 'Documento';
  }

  return (
    doc.nombre ||
    doc.name ||
    doc.filename ||
    doc.nombre_original ||
    doc.titulo ||
    getDocumentoNombre(getDocumentoUrl(doc))
  );
}

function normalizeRepositorios(datos) {
  const nuevos = cleanArray(datos?.url_repositorios);

  if (nuevos.length > 0) return nuevos;

  const legacy = cleanString(datos?.url_repositorio);
  return legacy ? [legacy] : [];
}

function normalizeVideos(datos) {
  const nuevos = cleanArray(datos?.url_videos);

  if (nuevos.length > 0) return nuevos;

  const legacy = cleanString(datos?.url_video);
  return legacy ? [legacy] : [];
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function normalizeRoleText(value = '') {
  return cleanString(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function getFullName(...parts) {
  return parts
    .map(cleanString)
    .filter(Boolean)
    .join(' ')
    .trim();
}

function getParticipantSources(project = {}) {
  const sources = [
    project.participantes,
    project.participants,
    project.participaciones,
    project.colaboradores,
    project.collaborators,
    project.github_colaboradores,
    project.githubCollaborators,
    project.github_collaborators,
    project.miembros,
    project.members,
  ];

  const items = sources.flatMap(source => Array.isArray(source) ? source : []);

  if (project.owner && typeof project.owner === 'object') {
    items.push({
      ...project.owner,
      es_propietario: true,
      relacion_github: 'owner',
    });
  }

  if (Array.isArray(project.owners)) {
    project.owners.forEach(owner => {
      if (owner && typeof owner === 'object') {
        items.push({
          ...owner,
          es_propietario: true,
          relacion_github: owner.relacion_github || 'owner',
        });
      }
    });
  }

  return items;
}

function getParticipantAvatar(item = {}, usuario = {}, perfil = {}, githubAccount = {}) {
  if (item.id_usuario || item.idUsuario || usuario.id_usuario || usuario.id) {
    return formatUrl(
      item.foto_perfil ||
      item.fotoPerfil ||
      perfil.foto_perfil ||
      perfil.fotoPerfil ||
      usuario.foto_perfil ||
      usuario.fotoPerfil ||
      item.avatar_url ||
      item.avatarUrl ||
      usuario.avatar_url ||
      usuario.avatarUrl ||
      githubAccount.foto_url ||
      githubAccount.fotoUrl ||
      githubAccount.avatar_url ||
      githubAccount.avatarUrl ||
      item.github_avatar_url ||
      item.githubAvatarUrl
    );
  }

  return formatUrl(
    item.avatar_url ||
    item.avatarUrl ||
    item.foto_url ||
    item.fotoUrl ||
    item.foto_perfil ||
    item.fotoPerfil ||
    item.github_avatar_url ||
    item.githubAvatarUrl ||
    perfil.foto_perfil ||
    perfil.fotoPerfil ||
    githubAccount.foto_url ||
    githubAccount.fotoUrl ||
    githubAccount.avatar_url ||
    githubAccount.avatarUrl ||
    usuario.foto_url ||
    usuario.fotoUrl ||
    usuario.foto_perfil ||
    usuario.fotoPerfil ||
    usuario.avatar_url ||
    usuario.avatarUrl
  );
}

function normalizeParticipant(item = {}, index = 0) {
  const usuario = item.usuario || item.user || {};
  const perfil = item.perfil || usuario.perfil || {};
  const githubAccount =
    item.github ||
    item.cuenta_github ||
    item.cuentaGithub ||
    item.oauth_github ||
    item.oauthGithub ||
    item.cuenta_oauth ||
    item.cuentaOauth ||
    {};
  const validacion =
    item.validacion ||
    item.validacion_github ||
    item.github_validacion ||
    item.usuario_repositorio_validacion ||
    {};

  const githubRole = normalizeRoleText(
    item.relacion_github ||
    item.github_role ||
    item.githubRole ||
    validacion.relacion_github ||
    validacion.github_role ||
    ''
  );

  const projectRole = normalizeRoleText(
    item.rol_tipo ||
    item.tipo_rol ||
    item.role_type ||
    item.tipo ||
    item.rol ||
    item.role ||
    ''
  );

  const isOwner =
    isTruthyDb(item.es_propietario) ||
    isTruthyDb(item.is_owner) ||
    isTruthyDb(item.owner) ||
    isTruthyDb(validacion.es_propietario) ||
    githubRole === 'owner' ||
    projectRole === 'owner' ||
    projectRole === 'propietario';

  const githubUsername = cleanString(
    item.github_username ||
    item.githubUsername ||
    item.github_login ||
    item.githubLogin ||
    item.login ||
    githubAccount.login ||
    githubAccount.username ||
    githubAccount.provider_username ||
    githubAccount.providerUsername
  );

  const nombre = getFullName(
    item.nombre_completo || item.nombreCompleto,
    item.nombre,
    item.apellido
  ) || getFullName(
    usuario.nombre_completo || usuario.nombreCompleto,
    usuario.nombre,
    usuario.apellido
  ) || cleanString(
    githubAccount.nombre ||
    githubAccount.name ||
    githubUsername ||
    item.email ||
    usuario.correo ||
    'Participante'
  );

  const rol = cleanString(item.rol || item.role || item.cargo || item.titulo_rol || item.tituloRol);

  return {
    ...item,
    id: item.id || item.id_participacion || item.idParticipacion || item.id_usuario || usuario.id || usuario.id_usuario || `participant-${index}`,
    id_usuario: item.id_usuario || item.idUsuario || usuario.id_usuario || usuario.id || null,
    nombre,
    rol,
    tipo_rol: isOwner ? 'owner' : 'colaborador',
    rol_label: isOwner ? 'Owner' : 'Colaborador',
    avatar_url: getParticipantAvatar(item, usuario, perfil, githubAccount),
    github_username: githubUsername,
    github_role: githubRole || (isOwner ? 'owner' : ''),
    descripcion_aporte: item.descripcion_aporte || item.descripcionAporte || '',
    es_propietario: isOwner,
  };
}

function uniqueParticipants(items = []) {
  const seen = new Set();

  return items.filter((item) => {
    const key = item.id_usuario
      ? `usuario:${item.id_usuario}`
      : item.github_username
        ? `github:${item.github_username.toLowerCase()}`
        : item.id
          ? `id:${item.id}`
          : `nombre:${normalizeRoleText(item.nombre)}`;

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getProjectParticipantsCount(project = {}) {
  const raw = project.participantes_count ?? project.participants_count ?? project.colaboradores_count;
  const count = Number(raw);

  return Number.isFinite(count) && count > 0 ? count : 0;
}

function getCurrentUserParticipant(project = {}) {
  const user = getStoredUser();

  if (!user) return null;

  const participacion = getParticipacionUsuario(project) || {};
  const fallbackOwner = getProjectParticipantsCount(project) <= 1;

  return normalizeParticipant({
    ...participacion,
    usuario: user,
    perfil: user.perfil || {},
    id_usuario: user.id || user.id_usuario || user.idUsuario,
    es_propietario: participacion.es_propietario ?? project.es_propietario ?? fallbackOwner,
  }, 0);
}

function getCurrentUserParticipation(project = {}, participantes = []) {
  const currentUserId = getStoredUserId();
  const currentParticipant = currentUserId && currentUserId !== 'anon'
    ? participantes.find(participante => String(participante.id_usuario || participante.idUsuario || '') === String(currentUserId))
    : null;
  const directParticipation =
    project.mi_participacion ||
    project.participacion_usuario ||
    project.participacionUsuario ||
    project.my_participation ||
    project.participacion ||
    null;
  const rawParticipation = directParticipation || (currentParticipant ? null : getParticipacionUsuario(project));
  const topLevelParticipation = (project.rol || project.descripcion_aporte)
    ? {
        rol: project.rol,
        descripcion_aporte: project.descripcion_aporte,
      }
    : null;
  const source = directParticipation || currentParticipant || rawParticipation || topLevelParticipation;

  if (!source) return null;

  const normalized = normalizeParticipant({
    ...source,
    id_usuario: source.id_usuario || source.idUsuario || currentParticipant?.id_usuario || currentParticipant?.idUsuario || (currentUserId !== 'anon' ? currentUserId : null),
    es_propietario: source.es_propietario ?? currentParticipant?.es_propietario ?? project.es_propietario,
  }, 0);
  const rol = cleanString(source.rol || source.role || source.cargo || source.titulo_rol || source.tituloRol || currentParticipant?.rol || normalized.rol);
  const descripcionAporte = cleanString(
    source.descripcion_aporte ||
    source.descripcionAporte ||
    currentParticipant?.descripcion_aporte ||
    topLevelParticipation?.descripcion_aporte ||
    normalized.descripcion_aporte
  );

  if (!rol && !descripcionAporte && !normalized.es_propietario) {
    return null;
  }

  return {
    ...normalized,
    ...source,
    id_usuario: normalized.id_usuario,
    rol,
    descripcion_aporte: descripcionAporte,
    tipo_rol: normalized.tipo_rol,
    rol_label: normalized.rol_label,
    es_propietario: normalized.es_propietario,
  };
}

export function normalizeProyectoParticipantes(project = {}, options = {}) {
  const { includeCurrentUserFallback = true } = options;
  const sources = getParticipantSources(project);
  let participantes = uniqueParticipants(
    sources
      .map(normalizeParticipant)
      .filter(participante => participante.nombre)
  );

  if (participantes.length === 0 && includeCurrentUserFallback) {
    const current = getCurrentUserParticipant(project);
    if (current) {
      participantes = [current];
    }
  }

  return participantes.sort((a, b) => {
    if (a.tipo_rol === b.tipo_rol) {
      return a.nombre.localeCompare(b.nombre);
    }

    return a.tipo_rol === 'owner' ? -1 : 1;
  });
}

function extractParticipantsPayload(data = {}) {
  const payload = data?.data ?? data;
  const project = payload?.proyecto || payload?.project || payload;
  const directSources = [
    payload?.participantes,
    payload?.participants,
    payload?.colaboradores,
    payload?.collaborators,
    payload?.data?.participantes,
    payload?.data?.participants,
  ];
  const direct = directSources.find(Array.isArray);

  if (direct) {
    return {
      hasPayload: true,
      items: normalizeProyectoParticipantes({ participantes: direct }, { includeCurrentUserFallback: false }),
    };
  }

  const items = normalizeProyectoParticipantes(project, { includeCurrentUserFallback: false });

  return {
    hasPayload: items.length > 0,
    items,
  };
}

function participantesCacheKey(id) {
  return `${PARTICIPANTES_CACHE_PREFIX}:${getStoredUserId()}:${id}`;
}

function sameParticipantes(a = [], b = []) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function getProyectoParticipantesCache(id) {
  if (!id) return [];

  try {
    const raw = localStorage.getItem(participantesCacheKey(id));
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed?.items) ? parsed.items : [];
    return normalizeProyectoParticipantes({ participantes: items }, { includeCurrentUserFallback: false });
  } catch {
    return [];
  }
}

function writeProyectoParticipantesCache(id, items = []) {
  if (!id) return;

  try {
    localStorage.setItem(participantesCacheKey(id), JSON.stringify({
      updatedAt: new Date().toISOString(),
      items: normalizeProyectoParticipantes({ participantes: items }, { includeCurrentUserFallback: false }),
    }));
  } catch {}
}

function clearProyectoParticipantesCache(id) {
  if (!id) return;

  try {
    localStorage.removeItem(participantesCacheKey(id));
  } catch {}
}

export async function getProyectoParticipantes(id) {
  if (!id) return [];

  const endpoints = [
    `${API_URL}/projects/${id}/participants`,
    `${API_URL}/projects/${id}/participantes`,
  ];

  for (const endpoint of endpoints) {
    try {
      const data = await apiFetch(endpoint);
      const payload = extractParticipantsPayload(data);

      if (payload.hasPayload) {
        const cached = getProyectoParticipantesCache(id);
        if (!sameParticipantes(cached, payload.items)) {
          writeProyectoParticipantesCache(id, payload.items);
        }

        return payload.items;
      }
    } catch (err) {
      if (!String(err?.message || '').includes('404')) {
        throw err;
      }
    }
  }

  const project = await getProyecto(id);
  const items = normalizeProyectoParticipantes(project, { includeCurrentUserFallback: false });
  writeProyectoParticipantesCache(id, items);
  return items;
}

// ═══════════════════════════════════════════
// HELPERS PARA BACKEND EXISTENTE
// ═══════════════════════════════════════════

function getProjectId(project = {}) {
  return project.id || project.id_proyecto || project.idProyecto || null;
}

function getTipoValue(project = {}) {
  if (project.tipo) return project.tipo;
  if (project.categoria_proyecto) return project.categoria_proyecto;

  if (typeof project.tipo_proyecto === 'string') return project.tipo_proyecto;

  if (project.tipo_proyecto?.slug) return project.tipo_proyecto.slug;
  if (project.tipoProyecto?.slug) return project.tipoProyecto.slug;

  if (project.tipo_proyecto?.value) return project.tipo_proyecto.value;
  if (project.tipoProyecto?.value) return project.tipoProyecto.value;

  if (project.tipo_proyecto?.nombre) return project.tipo_proyecto.nombre;
  if (project.tipoProyecto?.nombre) return project.tipoProyecto.nombre;

  return '';
}

function getTipoLabel(project = {}) {
  if (project.tipoLabel) return project.tipoLabel;
  if (project.tipo_label) return project.tipo_label;

  if (project.tipo_proyecto?.nombre) return project.tipo_proyecto.nombre;
  if (project.tipoProyecto?.nombre) return project.tipoProyecto.nombre;

  return '';
}

function getParticipacionUsuario(project = {}) {
  if (project.mi_participacion) return project.mi_participacion;
  if (project.participacion_usuario) return project.participacion_usuario;
  if (project.participacionUsuario) return project.participacionUsuario;
  if (project.my_participation) return project.my_participation;
  if (project.participacion) return project.participacion;

  if (Array.isArray(project.participaciones) && project.participaciones.length > 0) {
    return project.participaciones[0];
  }

  return null;
}

function mapEstadoToFront(project = {}) {
  if (project.estado) return project.estado === 'desarrollo' ? 'en_desarrollo' : project.estado;

  const publicacion = project.estado_publicacion;
  const desarrollo = project.estado_desarrollo;

  if (publicacion === 'archivado') return 'archivado';
  if (publicacion === 'publicado') return 'publicado';

  if ([
    'sin_especificar',
    'en_desarrollo',
    'pausado',
    'terminado',
    'mantenimiento',
    'versionado',
    'cancelado',
  ].includes(desarrollo)) {
    return desarrollo;
  }

  return 'borrador';
}

function mapEstadoToBackend(estado) {
  switch (estado) {
    case 'publicado':
      return {
        estado_publicacion: 'publicado',
        estado_desarrollo: 'terminado',
      };

    case 'desarrollo':
    case 'en_desarrollo':
      return {
        estado_publicacion: 'borrador',
        estado_desarrollo: 'en_desarrollo',
      };

    case 'pausado':
    case 'terminado':
    case 'mantenimiento':
    case 'versionado':
    case 'cancelado':
    case 'sin_especificar':
      return {
        estado_publicacion: 'borrador',
        estado_desarrollo: estado,
      };

    case 'archivado':
      return {
        estado_publicacion: 'archivado',
        estado_desarrollo: 'sin_especificar',
      };

    case 'borrador':
    default:
      return {
        estado_publicacion: 'borrador',
        estado_desarrollo: 'sin_especificar',
      };
  }
}

function getEvidencias(project = {}) {
  if (Array.isArray(project.evidencias)) return project.evidencias;
  if (Array.isArray(project.proyecto_evidencias)) return project.proyecto_evidencias;
  if (Array.isArray(project.proyectoEvidencias)) return project.proyectoEvidencias;

  return [];
}

function evidenciaUrl(ev = {}) {
  return ev.url || ev.archivo_url || ev.archivoUrl || ev.archivo_path || ev.archivoPath || '';
}

function evidenciaTipo(ev = {}) {
  return cleanString(ev.tipo).toLowerCase();
}

function isVisible(ev = {}) {
  if (ev.es_visible === undefined || ev.es_visible === null) return true;

  const value = String(ev.es_visible).trim().toLowerCase();
  return ev.es_visible === true || ev.es_visible === 1 || ['true', '1', 't', 'si', 'yes'].includes(value);
}

function isTruthyDb(value) {
  if (value === true || value === 1) return true;

  return ['true', '1', 't', 'si', 'yes'].includes(String(value ?? '').trim().toLowerCase());
}

function sortByOrden(a, b) {
  return (a.orden ?? 0) - (b.orden ?? 0);
}

function getImagenesFromEvidencias(evidencias = []) {
  return evidencias
    .filter(isVisible)
    .filter(ev => ['imagen', 'captura'].includes(evidenciaTipo(ev)))
    .sort(sortByOrden)
    .map(ev => formatUrl(evidenciaUrl(ev)))
    .filter(Boolean);
}

function getPortadaFromEvidencias(evidencias = [], imagenes = []) {
  const portada = evidencias
    .filter(isVisible)
    .find(ev => ['imagen', 'captura'].includes(evidenciaTipo(ev)) && isTruthyDb(ev.es_portada));

  return formatUrl(evidenciaUrl(portada)) || imagenes[0] || '';
}

function getRepositoriosFromEvidencias(evidencias = []) {
  return evidencias
    .filter(isVisible)
    .filter(ev => evidenciaTipo(ev) === 'repositorio')
    .sort(sortByOrden)
    .map(ev => cleanString(ev.url))
    .filter(Boolean);
}

function getVideosFromEvidencias(evidencias = []) {
  return evidencias
    .filter(isVisible)
    .filter(ev => evidenciaTipo(ev) === 'video')
    .sort(sortByOrden)
    .map(ev => cleanString(ev.url))
    .filter(Boolean);
}

function getSitioFromEvidencias(evidencias = []) {
  const sitio = evidencias
    .filter(isVisible)
    .find(ev => ['demo', 'sitio', 'sitio_web', 'web'].includes(evidenciaTipo(ev)));

  return cleanString(sitio?.url);
}

function getDocumentosFromEvidencias(evidencias = []) {
  return evidencias
    .filter(isVisible)
    .filter(ev => ['documento', 'pdf', 'documentacion', 'presentacion'].includes(evidenciaTipo(ev)))
    .sort(sortByOrden)
    .map(ev => {
      const url = formatUrl(evidenciaUrl(ev));

      if (!url) return null;

      return {
        id: ev.id || ev.id_evidencia || ev.id_proyecto_evidencia || null,
        url,
        nombre: ev.nombre || ev.nombre_original || ev.titulo || getDocumentoNombre(url),
        mime: ev.mime || ev.mime_type || null,
        size: ev.size || ev.tamanio_bytes || null,
        tipo: evidenciaTipo(ev) || 'documento',
      };
    })
    .filter(Boolean);
}

function getEtiquetasFromProject(project = {}) {
  if (Array.isArray(project.etiquetas)) {
    return normalizeEtiquetas(project.etiquetas);
  }

  if (Array.isArray(project.tecnologias)) {
    return normalizeEtiquetas(project.tecnologias);
  }

  if (Array.isArray(project.tags)) {
    return normalizeEtiquetas(project.tags);
  }

  return [];
}

// ═══════════════════════════════════════════
// NORMALIZACIÓN FRONT <-> API
// ═══════════════════════════════════════════

export function normalizeProyectoFromApi(project = {}) {
  const evidencias = getEvidencias(project);

  const imagenesDirectas = Array.isArray(project.imagenes)
    ? project.imagenes.map(formatUrl).filter(Boolean)
    : [];

  const imagenesDesdeEvidencias = getImagenesFromEvidencias(evidencias);

  const imagenes = imagenesDirectas.length > 0
    ? imagenesDirectas
    : imagenesDesdeEvidencias.length > 0
      ? imagenesDesdeEvidencias
      : project.imagen_portada
        ? [formatUrl(project.imagen_portada)]
        : project.imagenUrl
          ? [formatUrl(project.imagenUrl)]
          : [];

  const portada = project.imagen_portada
    ? formatUrl(project.imagen_portada)
    : getPortadaFromEvidencias(evidencias, imagenes);

  const reposFromEvidencias = getRepositoriosFromEvidencias(evidencias);
  const repositorios = Array.isArray(project.url_repositorios) && project.url_repositorios.length > 0
    ? cleanArray(project.url_repositorios)
    : reposFromEvidencias.length > 0
      ? reposFromEvidencias
      : project.url_repositorio
        ? [project.url_repositorio]
        : [];

  const videosFromEvidencias = getVideosFromEvidencias(evidencias);
  const videos = Array.isArray(project.url_videos) && project.url_videos.length > 0
    ? cleanArray(project.url_videos)
    : videosFromEvidencias.length > 0
      ? videosFromEvidencias
      : project.url_video
        ? [project.url_video]
        : [];

  const sitioWeb = project.url_demo || project.url_sitio_web || project.url_sitioweb || getSitioFromEvidencias(evidencias) || '';

  const documentosDirectos = Array.isArray(project.documentos)
    ? project.documentos
        .map(doc => {
          const url = formatUrl(getDocumentoUrl(doc));

          if (!url) return null;

          return {
            ...(typeof doc === 'object' ? doc : {}),
            url,
            nombre: getDocumentoNombre(doc),
          };
        })
        .filter(Boolean)
    : [];

  const documentos = documentosDirectos.length > 0
    ? documentosDirectos
    : getDocumentosFromEvidencias(evidencias);

  const participacion = getParticipacionUsuario(project);
  const participantes = normalizeProyectoParticipantes(project);
  const miParticipacion = getCurrentUserParticipation(project, participantes);
  const participantesCountRaw = project.participantes_count ?? project.participants_count ?? project.colaboradores_count;
  const participantesCount = Number.isFinite(Number(participantesCountRaw))
    ? Number(participantesCountRaw)
    : participantes.length;

  const esPublico = project.es_publico !== undefined
    ? Boolean(project.es_publico)
    : (miParticipacion?.visibilidad || participacion?.visibilidad)
      ? (miParticipacion?.visibilidad || participacion?.visibilidad) === 'publico'
      : project.estado_publicacion
        ? project.estado_publicacion === 'publicado'
        : true;

  const id = getProjectId(project);
  const permisos = project.permisos || {};

  return {
    ...project,

    id,
    id_proyecto: project.id_proyecto || id,

    titulo: project.titulo || '',
    descripcion: project.descripcion || '',

    estado: mapEstadoToFront(project),
    estado_publicacion: project.estado_publicacion,
    estado_desarrollo: project.estado_desarrollo,

    tipo: getTipoValue(project),
    tipoLabel: getTipoLabel(project),

    id_tipo_proyecto: project.id_tipo_proyecto || project.tipo_proyecto?.id_tipo_proyecto || project.tipoProyecto?.id_tipo_proyecto || null,

    desarrollado_para: project.desarrollado_para || project.plataforma_objetivo || '',

    url_repositorios: repositorios,
    url_repositorio: project.url_repositorio || repositorios[0] || '',

    url_demo: sitioWeb,

    url_videos: videos,
    url_video: project.url_video || videos[0] || '',

    imagenes,
    imagenUrl: imagenes[0] || null,
    imagen_portada: portada || imagenes[0] || null,

    documentos,

    fecha_inicio: project.fecha_inicio || miParticipacion?.fecha_inicio || participacion?.fecha_inicio || '',
    fecha_fin: project.fecha_fin || miParticipacion?.fecha_fin || participacion?.fecha_fin || null,
    en_curso: project.en_curso !== undefined
      ? Boolean(project.en_curso)
      : !(project.fecha_fin || miParticipacion?.fecha_fin || participacion?.fecha_fin),

    es_publico: esPublico,

    participacion: miParticipacion || participacion || null,
    mi_participacion: miParticipacion,
    participacion_usuario: miParticipacion,
    rol: miParticipacion?.rol || cleanString(project.rol || participacion?.rol),
    descripcion_aporte: miParticipacion?.descripcion_aporte || cleanString(project.descripcion_aporte || participacion?.descripcion_aporte || participacion?.descripcionAporte),

    etiquetas: getEtiquetasFromProject(project),
    tecnologias_detalle: Array.isArray(project.tecnologias_detalle) ? project.tecnologias_detalle : [],

    participantes,
    colaboradores: participantes.filter(participante => participante.tipo_rol !== 'owner'),
    owners: participantes.filter(participante => participante.tipo_rol === 'owner'),
    participantes_count: participantesCount,

    configuracion: project.configuracion || null,
    permisos,
    puede_editar: permisos.puede_editar ?? project.puede_editar ?? true,
    puede_eliminar: permisos.puede_eliminar ?? project.puede_eliminar ?? true,
    puede_configurar: permisos.puede_configurar ?? project.puede_configurar ?? false,
    puede_desvincular_participacion: permisos.puede_desvincular_participacion ?? project.puede_desvincular_participacion ?? false,
    puede_remover_participantes_sin_validacion: permisos.puede_remover_participantes_sin_validacion ?? project.puede_remover_participantes_sin_validacion ?? false,
  };
}

/**
 * Payload que el front envía al backend.
 *
 * Incluye:
 * - nombres cómodos del front
 * - nombres probables del backend existente
 * - evidencias para que el backend pueda sincronizar enlaces si decide hacerlo así
 */
export function normalizeProyectoPayload(datos = {}) {
  const repositorios = normalizeRepositorios(datos).slice(0, PROJECT_LIMITS.repositoriosGithub);
  const videos = normalizeVideos(datos).slice(0, PROJECT_LIMITS.videosYoutube);
  const estadoBackend = mapEstadoToBackend(datos.estado || 'borrador');

  const sitioWeb = cleanString(datos.url_demo);

  const evidencias = [
    ...repositorios.map((url, index) => ({
      tipo: 'repositorio',
      url,
      orden: index,
      es_visible: true,
    })),

    ...(sitioWeb
      ? [{
        tipo: 'demo',
        url: sitioWeb,
        orden: 0,
        es_visible: true,
      }]
      : []),

    ...videos.map((url, index) => ({
      tipo: 'video',
      url,
      orden: index,
      es_visible: true,
    })),
  ];

  return {
    titulo: cleanString(datos.titulo),
    descripcion: cleanString(datos.descripcion),

    estado: datos.estado || 'borrador',
    ...estadoBackend,

    tipo: cleanString(datos.tipo),
    tipo_slug: cleanString(datos.tipo),
    id_tipo_proyecto: datos.id_tipo_proyecto || datos.idTipoProyecto || null,

    desarrollado_para: cleanString(datos.desarrollado_para),

    url_repositorios: repositorios,
    url_repositorio: repositorios[0] || '',

    url_demo: sitioWeb,
    url_sitio_web: sitioWeb,

    url_videos: videos,
    url_video: videos[0] || '',

    fecha_inicio: normalizeNullableDate(datos.fecha_inicio),
    fecha_fin: datos.en_curso ? null : normalizeNullableDate(datos.fecha_fin),
    en_curso: normalizeBoolean(datos.en_curso),

    es_publico: datos.es_publico ?? true,
    visibilidad: datos.es_publico === false ? 'privado' : 'publico',

    etiquetas: normalizeEtiquetas(datos.etiquetas),
    tecnologias: normalizeEtiquetas(datos.etiquetas),

    rol: cleanString(datos.rol),
    descripcion_aporte: cleanString(datos.descripcion_aporte),

    evidencias,
    proyecto_evidencias: evidencias,
  };
}

// ═══════════════════════════════════════════
// PROYECTOS
// ═══════════════════════════════════════════

export function getCachedProyectos() {
  const { userId } = getSession();
  return readUserProjectsCache(userId).map(normalizeProyectoFromApi);
}

export function setCachedProyectos(proyectos = []) {
  const { userId } = getSession();
  writeUserProjectsCache(userId, proyectos, { invalidate: false });
}

export async function getProyectos({ force = false } = {}) {
  const { userId } = getSession();
  const endpoint = userProjectsEndpoint(userId);

  const data = await getCachedDashboardEndpoint(
    endpoint,
    () => apiFetch(`${API_URL}${endpoint}`),
    { force, userId },
  );

  const lista = unwrapProjectsPayload(data);

  return lista.map(normalizeProyectoFromApi);
}

export async function getProyecto(id, { force = false } = {}) {
  const { userId } = getSession();
  const endpoint = projectEndpoint(id);
  const data = await getCachedDashboardEndpoint(
    endpoint,
    () => apiFetch(`${API_URL}${endpoint}`),
    { force, userId },
  );

  const project = data?.data || data?.proyecto || data;

  return normalizeProyectoFromApi(project);
}

export async function crearProyecto(datos) {
  const payload = normalizeProyectoPayload(datos);

  const data = await apiFetch(`${API_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const project = data?.data || data?.proyecto || data;
  updateUserProjectsCache((items) => [project, ...items]);

  return normalizeProyectoFromApi(project);
}

export async function actualizarProyecto(id, datos) {
  const payload = normalizeProyectoPayload(datos);

  const data = await apiFetch(`${API_URL}/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const project = data?.data || data?.proyecto || data;
  updateUserProjectsCache((items) => {
    const projectId = id || getCachedProjectId(project);
    const updatedId = getCachedProjectId(project);

    return items.map((item) => {
      const itemId = getCachedProjectId(item);
      return String(itemId) === String(projectId) || String(itemId) === String(updatedId)
        ? project
        : item;
    });
  });
  removeCachedDashboardEndpoint(projectEndpoint(id));

  return normalizeProyectoFromApi(project);
}

export async function getProyectoConfiguracion(id) {
  const data = await apiFetch(`${API_URL}/projects/${id}/configuration`);
  return data?.data || data;
}

export async function actualizarProyectoConfiguracion(id, configuracion) {
  const data = await apiFetch(`${API_URL}/projects/${id}/configuration`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(configuracion),
  });

  const result = data?.data || data;
  updateUserProjectsCache((items) => items.map((item) => (
    String(getCachedProjectId(item)) === String(id)
      ? {
        ...item,
        configuracion: result.configuracion || configuracion,
        permisos: result.permisos || item.permisos,
      }
      : item
  )));

  return result;
}

export async function eliminarProyecto(id) {
  const result = await apiFetch(`${API_URL}/projects/${id}`, {
    method: 'DELETE',
  });

  updateUserProjectsCache((items) => items.filter((item) => String(getCachedProjectId(item)) !== String(id)));
  removeCachedDashboardEndpoint(projectEndpoint(id));
  return result;
}

export async function desvincularParticipacionProyecto(id) {
  const result = await apiFetch(`${API_URL}/projects/${id}/participation`, {
    method: 'DELETE',
  });

  updateUserProjectsCache((items) => items.filter((item) => String(getCachedProjectId(item)) !== String(id)));
  removeCachedDashboardEndpoint(projectEndpoint(id));
  return result;
}

export async function removerParticipanteSinValidacion(idProyecto, idParticipacion) {
  const result = await apiFetch(`${API_URL}/projects/${idProyecto}/participants/${idParticipacion}`, {
    method: 'DELETE',
  });

  clearProyectoParticipantesCache(idProyecto);
  return result;
}

// ═══════════════════════════════════════════
// IMÁGENES
// ═══════════════════════════════════════════

export async function uploadImagenes(id, archivos = []) {
  if (!archivos.length) return { urls: [] };

  const formData = new FormData();

  archivos.forEach(file => {
    formData.append('images[]', file);
  });

  return apiFetchFormData(`${API_URL}/projects/${id}/images`, formData, {
    method: 'POST',
  });
}

export async function eliminarImagenes(id, urls = []) {
  return apiFetch(`${API_URL}/projects/${id}/images`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      urls,
      imagenes: urls,
    }),
  });
}

export async function reordenarImagenes(id, urls = []) {
  return apiFetch(`${API_URL}/projects/${id}/images/reorder`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      urls,
      imagenes: urls,
    }),
  });
}

// ═══════════════════════════════════════════
// DOCUMENTOS
// ═══════════════════════════════════════════

export async function uploadDocumentos(id, archivos = []) {
  if (!archivos.length) return { documents: [], documentos: [], urls: [] };

  const invalidos = archivos.filter(file => !isDocumentoPermitido(file));

  if (invalidos.length > 0) {
    throw new Error('Solo se aceptan documentos PDF, DOC, DOCX, TXT, RTF, MD u ODT.');
  }

  const formData = new FormData();

  archivos.forEach(file => {
    formData.append('documents[]', file);
  });

  return apiFetchFormData(`${API_URL}/projects/${id}/documents`, formData, {
    method: 'POST',
  });
}

export async function eliminarDocumentos(id, urls = []) {
  return apiFetch(`${API_URL}/projects/${id}/documents`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      urls,
      documentos: urls,
    }),
  });
}

export async function reordenarDocumentos(id, urls = []) {
  return apiFetch(`${API_URL}/projects/${id}/documents/reorder`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      urls,
      documentos: urls,
    }),
  });
}

// ═══════════════════════════════════════════
// ENLACES
// ═══════════════════════════════════════════

export async function actualizarEnlacesProyecto(id, datos = {}) {
  const payload = normalizeProyectoPayload(datos);

  const data = await apiFetch(`${API_URL}/projects/${id}/links`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url_repositorios: payload.url_repositorios,
      url_repositorio: payload.url_repositorio,

      url_demo: payload.url_demo,
      url_sitio_web: payload.url_sitio_web,

      url_videos: payload.url_videos,
      url_video: payload.url_video,

      evidencias: payload.evidencias,
      proyecto_evidencias: payload.proyecto_evidencias,
    }),
  });

  const project = data?.data || data?.proyecto || data;

  return normalizeProyectoFromApi(project);
}

// ═══════════════════════════════════════════
// LEGACY
// ═══════════════════════════════════════════

export async function uploadImagenPortada(id, archivo, _tieneImagen = false) {
  const resultado = await uploadImagenes(id, [archivo]);
  const url = resultado?.urls?.[0] || resultado?.imagenes?.[0] || null;

  return { url };
}

export async function eliminarImagenPortada(id) {
  return apiFetch(`${API_URL}/projects/${id}/images`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      urls: [],
      imagenes: [],
    }),
  });
}

export async function uploadDocumentoProyecto(id, archivo) {
  const resultado = await uploadDocumentos(id, [archivo]);

  const doc = resultado?.documents?.[0] || resultado?.documentos?.[0] || null;
  const url = doc?.url || resultado?.urls?.[0] || null;

  return { url, documento: doc };
}

export async function eliminarDocumentoProyecto(id) {
  return apiFetch(`${API_URL}/projects/${id}/documents`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      urls: [],
      documentos: [],
    }),
  });
}
