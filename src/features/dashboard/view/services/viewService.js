import BASE_URL from '../../../../services/http/const';
import { DEFAULT_CONFIG, DEFAULT_VISIBILITY } from '../model/viewModel';
import { getSkillProgress, normalizeSkillLevel } from '../../skills/model/skillLevel';
import { normalizeProyectoFromApi } from '../../projects/services/projectsService';

const STORAGE_URL = process.env.REACT_APP_STORAGE_URL || 'http://localhost:8000/storage';
const CONFIG_STORAGE_PREFIX = 'portfolio-view-config';
const DATA_CACHE_PREFIX = 'portfolio-view-data:v2';
const PUBLIC_CACHE_PREFIX = 'public-portfolio-view:v3';

const CATEGORY_LABELS = {
  sin_especificar: 'Proyecto',
  portafolio: 'Portafolio',
  educativo: 'Educativo',
  financiero: 'Financiero',
  ecommerce: 'E-commerce',
  marketplace: 'Marketplace',
  videojuego: 'Videojuego',
  salud: 'Salud',
  administrativo: 'Administrativo',
  red_social: 'Red social',
  dashboard_bi: 'Dashboard BI',
  gestion_empresarial: 'Gestion empresarial',
  productividad: 'Productividad',
  seguridad: 'Seguridad',
  entretenimiento: 'Entretenimiento',
  herramienta_desarrollo: 'Herramienta dev',
  otro: 'Otro',
};

const DEVELOPMENT_LABELS = {
  sin_especificar: 'Sin especificar',
  en_desarrollo: 'En desarrollo',
  pausado: 'Pausado',
  terminado: 'Terminado',
  mantenimiento: 'Mantenimiento',
  versionado: 'Versionado',
  cancelado: 'Cancelado',
};

function parseJsonStorage(value, fallback) {
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function toBool(value, fallback = false) {
  if (value === true || value === 1 || value === '1') return true;
  if (value === false || value === 0 || value === '0') return false;

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
    if (normalized === 'publico') return true;
    if (normalized === 'privado') return false;
  }

  return fallback;
}

function getSession() {
  const rawUser = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
  const token = localStorage.getItem('tokenPORT') || sessionStorage.getItem('tokenPORT');

  if (!rawUser || !token) {
    throw new Error('No hay sesion activa.');
  }

  const user = JSON.parse(rawUser);
  const userId = user.id_usuario || user.id || user.idUsuario;

  if (!userId) {
    throw new Error('No se encontro el usuario autenticado.');
  }

  return { userId, token, user };
}

function configStorageKey(userId) {
  return `${CONFIG_STORAGE_PREFIX}:${userId}`;
}

function dataCacheKey(userId) {
  return `${DATA_CACHE_PREFIX}:${userId}`;
}

function readStoredConfig(userId) {
  const raw = localStorage.getItem(configStorageKey(userId));
  const parsed = parseJsonStorage(raw, {});

  return {
    hasStoredConfig: Boolean(raw),
    hasHeroSource: Object.prototype.hasOwnProperty.call(parsed, 'heroBgSource'),
    hasAvatarSource: Object.prototype.hasOwnProperty.call(parsed, 'avatarBgSource'),
    config: normalizeConfig(parsed),
  };
}

export function loadCachedPortfolioViewData(userId = getSession().userId) {
  const cached = parseJsonStorage(sessionStorage.getItem(dataCacheKey(userId)), null);
  return cached?.data ? cached.data : null;
}

function saveCachedPortfolioViewData(userId, data) {
  try {
    sessionStorage.setItem(dataCacheKey(userId), JSON.stringify({
      cachedAt: Date.now(),
      data,
    }));
  } catch {
    // Cache is an optimization; failing to write it should not block the view.
  }
}

function clearPortfolioCaches(userId) {
  if (!userId) return;

  try {
    sessionStorage.removeItem(dataCacheKey(userId));
    sessionStorage.removeItem(`${PUBLIC_CACHE_PREFIX}:${userId}`);
  } catch {
    // Cache cleanup should never block publishing changes.
  }
}

async function safeJson(res) {
  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();

  if (!text || text.trim() === '') return {};

  if (contentType.includes('text/html')) {
    throw new Error(`La ruta ${res.url} devolvio HTML (${res.status}).`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Respuesta invalida del servidor (${res.status}).`);
  }
}

async function apiFetch(endpoint, options = {}) {
  const { token } = getSession();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await safeJson(res);

  if (!res.ok) {
    throw new Error(getApiErrorMessage(res, data));
  }

  return data;
}

function getApiErrorMessage(res, data) {
  if (res.status === 401) {
    return 'Tu sesion expiro. Inicia sesion nuevamente.';
  }

  if (res.status === 403) {
    return 'No tienes permisos para realizar esta accion.';
  }

  if (res.status === 422) {
    return 'Revisa los datos e intenta guardar nuevamente.';
  }

  if (res.status >= 500) {
    return 'No se pudo completar la accion. Intenta nuevamente.';
  }

  return data?.message || `No se pudo completar la accion (${res.status}).`;
}

function unwrapList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.proyectos)) return response.proyectos;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.results)) return response.results;
  return [];
}

function ensureUrl(value = '') {
  const url = String(value || '').trim();

  if (!url) return '';
  if (/^(https?:\/\/|mailto:|tel:)/i.test(url)) return url;

  return `https://${url.replace(/^\/+/, '')}`;
}

function displayUrl(value = '') {
  return String(value || '')
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/$/, '');
}

function findFirstUrl(evidencias = [], tipos = []) {
  const item = evidencias.find((evidencia) => {
    const tipo = String(evidencia?.tipo || '').toLowerCase();
    return tipos.includes(tipo) && toBool(evidencia?.es_visible, true);
  });

  return item?.url || item?.archivo_url || '';
}

function inferSocialType(nombre = '', link = '') {
  const raw = `${nombre} ${link}`.toLowerCase();

  if (raw.includes('linkedin')) return 'linkedin';
  if (raw.includes('github')) return 'github';
  if (raw.includes('twitter') || raw.includes('x.com')) return 'twitter';
  if (raw.includes('youtube') || raw.includes('youtu.be')) return 'youtube';
  if (raw.includes('instagram')) return 'instagram';
  if (raw.includes('facebook') || raw.includes('fb.com')) return 'facebook';
  if (raw.includes('behance')) return 'behance';
  if (raw.includes('dribbble')) return 'dribbble';
  if (raw.includes('stackoverflow')) return 'stackoverflow';
  if (raw.includes('discord')) return 'discord';
  if (raw.includes('telegram') || raw.includes('t.me')) return 'telegram';
  if (raw.includes('whatsapp') || raw.includes('wa.me')) return 'whatsapp';
  if (raw.includes('tiktok')) return 'tiktok';
  if (raw.includes('medium')) return 'medium';
  if (raw.includes('dev.to') || raw.includes('devto')) return 'devto';
  if (raw.includes('reddit')) return 'reddit';
  if (raw.includes('pinterest')) return 'pinterest';
  if (raw.includes('twitch')) return 'twitch';
  if (raw.includes('spotify')) return 'spotify';

  return 'web';
}

function normalizeProfileVisibility(raw = {}) {
  raw = raw || {};
  const visibility = raw.visibilidad || {};
  const cityVisible = toBool(visibility.ciudad, true);
  const countryVisible = toBool(visibility.pais, true);

  return {
    nombre: toBool(visibility.nombre, true),
    profesion: toBool(visibility.profesion, Boolean(raw.profesion)),
    ubicacion: toBool(visibility.ubicacion, cityVisible || countryVisible),
    telefono: toBool(visibility.telefono, Boolean(raw.telefono)),
    correo: toBool(visibility.correo, Boolean(raw.correo)),
    redes: true,
    biografia: toBool(visibility.biografia, Boolean(raw.biografia)),
  };
}

function createVisibility(items = [], value = true) {
  const resolveValue = typeof value === 'function' ? value : () => value;

  return items.reduce((acc, item) => ({
    ...acc,
    [item.id]: Boolean(resolveValue(item)),
  }), {});
}

function mergeVisibility(...sources) {
  return sources.reduce((acc, current = {}) => ({
    perfil: {
      ...acc.perfil,
      ...(current.perfil || {}),
    },
    stats: {
      ...acc.stats,
      ...(current.stats || {}),
    },
    habilidades: {
      ...acc.habilidades,
      ...(current.habilidades || {}),
    },
    experiencias: {
      ...acc.experiencias,
      ...(current.experiencias || {}),
    },
    proyectos: {
      ...acc.proyectos,
      ...(current.proyectos || {}),
    },
    proyecto_detalles: {
      ...acc.proyecto_detalles,
      ...(current.proyecto_detalles || {}),
    },
  }), {
    perfil: { ...DEFAULT_VISIBILITY.perfil },
    stats: { ...DEFAULT_VISIBILITY.stats },
    habilidades: {},
    experiencias: {},
    proyectos: {},
    proyecto_detalles: { ...DEFAULT_VISIBILITY.proyecto_detalles },
  });
}

export function buildImageUrl(path) {
  if (!path) return null;

  const value = String(path).trim();
  if (!value) return null;
  if (/^(https?:\/\/|blob:|data:)/i.test(value)) return value;

  const storageBase = STORAGE_URL.replace(/\/+$/, '');
  const appBase = storageBase.replace(/\/storage$/i, '');

  if (value.startsWith('/storage/')) return `${appBase}${value}`;
  if (value.startsWith('storage/')) return `${appBase}/${value}`;

  return `${storageBase}/${value.replace(/^\/+/, '')}`;
}

export function mapConfigFromBackend(raw = {}) {
  const source = raw?.config && typeof raw.config === 'object' ? raw.config : raw;
  const rawVisibility = source.visibilidad;
  const parsedVisibility = typeof rawVisibility === 'string'
    ? parseJsonStorage(rawVisibility, undefined)
    : rawVisibility;

  const mapped = {
    heroColor: source.hero_color ?? source.heroColor,
    heroBgSource: source.hero_bg_source ?? source.heroBgSource,
    heroPattern: source.hero_pattern ?? source.heroPattern,
    avatarBgSource: source.avatar_bg_source ?? source.avatarBgSource,
    avatarColor: source.avatar_color ?? source.avatarColor,
    accentColor: source.accent_color ?? source.accentColor,
    cardBg: source.card_bg ?? source.cardBg,
    textColorAuto: source.text_color_auto ?? source.textColorAuto,
    textColor: source.text_color ?? source.textColor,
    fontId: source.font_id ?? source.fontId,
    frameId: source.frame_id ?? source.frameId,
    disponible: source.disponible,
    publicado: source.publicado ?? source.portfolio_publico,
    visibilidad: parsedVisibility,
  };

  return Object.fromEntries(
    Object.entries(mapped).filter(([, value]) => value !== undefined && value !== null)
  );
}

export function mapConfigToBackend(config = {}) {
  const mapped = {
    hero_color: config.heroColor,
    hero_bg_source: config.heroBgSource,
    hero_pattern: config.heroPattern,
    avatar_bg_source: config.avatarBgSource,
    avatar_color: config.avatarColor,
    accent_color: config.accentColor,
    card_bg: config.cardBg,
    text_color_auto: config.textColorAuto,
    text_color: config.textColor,
    font_id: config.fontId,
    frame_id: config.frameId,
    disponible: config.disponible,
    visibilidad: config.visibilidad,
  };

  return Object.fromEntries(
    Object.entries(mapped).filter(([, value]) => value !== undefined && value !== null)
  );
}

export function normalizeConfig(config = {}) {
  const normalized = {
    ...DEFAULT_CONFIG,
    ...config,
    visibilidad: mergeVisibility(config.visibilidad),
  };

  return {
    ...normalized,
    textColorAuto: toBool(normalized.textColorAuto, DEFAULT_CONFIG.textColorAuto),
    disponible: toBool(normalized.disponible, DEFAULT_CONFIG.disponible),
    ...(normalized.publicado !== undefined
      ? { publicado: toBool(normalized.publicado, false) }
      : {}),
  };
}

export function loadStoredConfig(userId = getSession().userId) {
  return readStoredConfig(userId).config;
}

export async function getConfig() {
  const { userId } = getSession();
  return apiFetch(`/portfolio/${userId}/config`);
}

export async function saveConfig(payload) {
  const { userId } = getSession();
  return apiFetch(`/portfolio/${userId}/config`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function clearStoredConfig() {
  const { userId } = getSession();
  localStorage.removeItem(configStorageKey(userId));
}

export function mapPerfilFromBackend(raw) {
  if (!raw) return null;

  const source = raw.data && typeof raw.data === 'object' ? raw.data : raw;
  const perfil = source.perfil && typeof source.perfil === 'object' ? source.perfil : {};
  const fotoPerfil = source.foto_perfil
    ?? source.fotoPerfil
    ?? source.avatarUrl
    ?? perfil.foto_perfil
    ?? perfil.fotoPerfil;
  const fotoFondo = source.foto_fondo
    ?? source.fotoFondo
    ?? source.bannerUrl
    ?? perfil.foto_fondo
    ?? perfil.fotoFondo;

  return {
    id: source.id ?? source.id_usuario,
    nombre: source.nombre || '',
    apellido: source.apellido || '',
    correo: source.correo || '',
    telefono: source.telefono || '',
    profesion: source.profesion ?? perfil.profesion ?? '',
    biografia: source.biografia ?? perfil.biografia ?? '',
    ciudad: source.ciudad ?? perfil.ciudad ?? '',
    pais: source.pais ?? perfil.pais ?? '',
    foto_perfil: fotoPerfil || null,
    foto_fondo: fotoFondo || null,
    avatarUrl: buildImageUrl(fotoPerfil),
    bannerUrl: buildImageUrl(fotoFondo),
    portfolioPublico: toBool(source.portfolio_publico ?? source.es_publico ?? perfil.es_publico, true),
    visibilidad: normalizeProfileVisibility({
      ...source,
      ...perfil,
      visibilidad: source.visibilidad || perfil.visibilidad,
    }),
  };
}

export function mapRedesFromBackend(lista = [], options = {}) {
  const { includeHidden = false } = options;

  return lista
    .filter((item) => includeHidden || toBool(item.es_visible ?? item.visible, true))
    .map((item) => {
      const href = ensureUrl(item.link ?? item.url);
      const tipo = inferSocialType(`${item.tipo || ''} ${item.plataformaKey || ''} ${item.nombre || ''}`, href);
      const visible = toBool(item.es_visible ?? item.visible, true);

      return {
        id: `enlace-${item.id_enlace ?? item.id}`,
        backendId: item.id_enlace ?? item.id,
        nombre: item.nombre || 'Enlace',
        url: displayUrl(item.link ?? item.url),
        href,
        tipo,
        descripcion: item.descripcion || '',
        visible,
      };
    });
}

export function mapHabilidadesFromBackend(lista = [], options = {}) {
  const { includeHidden = false } = options;

  const normalized = lista
    .filter((item) => includeHidden || toBool(item.es_visible ?? item.es_publico, true))
    .map((item) => {
      const catalog = item.habilidad || item.catalogo_habilidad || {};
      const level = normalizeSkillLevel(item.nivel);
      const tipo = catalog.tipo || item.tipo || 'tecnica';
      const visible = toBool(item.es_visible ?? item.es_publico, true);

      return {
        id: `habilidad-${item.id_habilidad_usuario ?? item.id}`,
        backendId: item.id_habilidad_usuario ?? item.id,
        catalogoId: catalog.id_habilidad ?? item.habilidad_id,
        nombre: catalog.nombre || item.nombre || item.nombre_habilidad || 'Habilidad',
        tipo,
        nivel: level,
        porcentaje: Number(item.porcentaje ?? getSkillProgress(level)),
        descripcion: catalog.descripcion || item.descripcion || '',
        visible,
      };
    });

  return separarHabilidades(normalized);
}

function formatDate(value) {
  if (!value) return '';

  const [year, month] = String(value).slice(0, 10).split('-');
  if (!year || !month) return String(value);

  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const monthLabel = months[Math.max(0, Math.min(Number(month) - 1, 11))] || month;

  return `${monthLabel} ${year}`;
}

function formatDateRange(start, end, current) {
  const from = formatDate(start);
  const to = current ? 'Presente' : formatDate(end);

  if (from && to) return `${from} - ${to}`;
  return from || to || '';
}

export function mapExperienciasFromBackend(lista = [], options = {}) {
  const { includeHidden = false } = options;

  return lista
    .filter((item) => includeHidden || toBool(item.es_publico, true))
    .map((item) => {
      const isCurrent = toBool(item.es_actual ?? item.actual, false);
      const tipo = item.tipo === 'academica' ? 'academico' : 'laboral';
      const visible = toBool(item.es_publico, true);

      return {
        id: `experiencia-${item.id_experiencia ?? item.id}`,
        backendId: item.id_experiencia ?? item.id,
        tipo,
        actual: isCurrent,
        cargo: item.cargo || '',
        organizacion: item.institucion || item.organizacion || '',
        fechas: item.fechas || formatDateRange(item.fecha_inicio, item.fecha_fin, isCurrent),
        fechaInicio: item.fecha_inicio || '',
        fechaFin: item.fecha_fin || '',
        descripcion: item.descripcion || '',
        visible,
      };
    });
}

function mapProjectIcon(project = {}) {
  const raw = [
    project.categoria_proyecto,
    project.plataforma_objetivo,
    project.tipo,
    project.tipoLabel,
  ].filter(Boolean).join(' ').toLowerCase();

  if (raw.includes('educativo')) return 'school';
  if (raw.includes('api') || raw.includes('herramienta')) return 'api';
  if (raw.includes('administrativo') || raw.includes('gestion') || raw.includes('ecommerce')) return 'box';

  return 'portfolio';
}

function getProjectYear(project = {}) {
  const date = project.fecha_fin || project.fecha_inicio || project.publicado_at || project.updated_at || project.created_at;
  const year = String(date || '').slice(0, 4);
  return /^\d{4}$/.test(year) ? year : '';
}

const PROJECT_STATUS_LABELS = {
  publicado: 'Publicado',
  desarrollo: 'En desarrollo',
  borrador: 'Borrador',
  archivado: 'Archivado',
};

function getProjectStatus(project = {}) {
  if (project.estado) return project.estado;
  if (project.estado_publicacion === 'archivado') return 'archivado';
  if (project.estado_publicacion === 'publicado') return 'publicado';

  if (['en_desarrollo', 'mantenimiento', 'versionado', 'pausado'].includes(project.estado_desarrollo)) {
    return 'desarrollo';
  }

  return 'borrador';
}

function getProjectStatusLabel(project = {}) {
  if (project.estadoLabel) return project.estadoLabel;

  const status = getProjectStatus(project);

  if (status === 'desarrollo' && project.estado_desarrollo) {
    return DEVELOPMENT_LABELS[project.estado_desarrollo] || PROJECT_STATUS_LABELS.desarrollo;
  }

  return PROJECT_STATUS_LABELS[status] || project.estado_publicacion || 'Proyecto';
}

function getProjectTypeLabel(project = {}) {
  return (
    project.tipoLabel ||
    project.tipo_label ||
    project.tipo_proyecto?.nombre ||
    project.tipoProyecto?.nombre ||
    CATEGORY_LABELS[project.categoria_proyecto] ||
    project.tipo ||
    'Proyecto'
  );
}

function uniqueNonEmpty(values = []) {
  return [...new Set(values.map(value => String(value || '').trim()).filter(Boolean))];
}

function getProjectImages(project = {}) {
  return uniqueNonEmpty([
    project.imagen_portada,
    project.imagenUrl,
    ...(Array.isArray(project.imagenes) ? project.imagenes : []),
  ])
    .map(buildImageUrl)
    .filter(Boolean);
}

function getProjectVideos(project = {}) {
  return uniqueNonEmpty([
    ...(Array.isArray(project.url_videos) ? project.url_videos : []),
    project.url_video,
    project.videoUrl,
  ]);
}

function getProjectRepos(project = {}) {
  return uniqueNonEmpty([
    ...(Array.isArray(project.url_repositorios) ? project.url_repositorios : []),
    ...(Array.isArray(project.repositorios_detalle)
      ? project.repositorios_detalle.map(repo => repo?.url_repositorio)
      : []),
    project.url_repositorio,
    project.githubUrl,
  ]);
}

function buildProjectFileUrl(value = '') {
  const raw = String(value || '').trim();

  if (!raw) return '';
  if (/^(https?:\/\/|mailto:|tel:|blob:|data:)/i.test(raw)) return raw;

  return buildImageUrl(raw);
}

function getProjectDocuments(project = {}) {
  const evidencias = Array.isArray(project.evidencias) ? project.evidencias : [];
  const documentos = Array.isArray(project.documentos) ? project.documentos : [];

  return [
    ...documentos,
    ...evidencias.filter((item) => {
      const tipo = String(item?.tipo || '').toLowerCase();
      return ['pdf', 'documento', 'documentacion', 'presentacion'].includes(tipo)
        && toBool(item?.es_visible, true);
    }),
  ]
    .map((item) => {
      if (typeof item === 'string') {
        const url = ensureUrl(item);
        return url ? { nombre: displayUrl(url), url } : null;
      }

      const url = buildProjectFileUrl(item?.url || item?.archivo_url || item?.archivo_path || '');

      if (!url) return null;

      return {
        ...item,
        nombre: item?.nombre || item?.titulo || displayUrl(url),
        url,
      };
    })
    .filter(Boolean);
}

function isPortfolioProjectVisible(project = {}) {
  const visibility = project.es_publico ?? project.participacion?.visibilidad ?? project.visibilidad;
  return toBool(visibility, true);
}

export function mapProyectosFromBackend(lista = [], options = {}) {
  const { includeHidden = false } = options;

  return lista
    .map((project) => normalizeProyectoFromApi(project))
    .filter((project) => includeHidden || isPortfolioProjectVisible(project))
    .map((project, index) => {
      const evidencias = Array.isArray(project.evidencias) ? project.evidencias : [];
      const imagenes = getProjectImages(project);
      const videos = getProjectVideos(project);
      const repositorios = getProjectRepos(project);
      const demoUrl = project.url_demo || findFirstUrl(evidencias, ['demo', 'sitio', 'sitio_web', 'web', 'link']);
      const documentos = getProjectDocuments(project);
      const estado = getProjectStatus(project);
      const backendId = project.id_proyecto ?? project.id ?? index;
      const tecnologias = Array.isArray(project.etiquetas) && project.etiquetas.length > 0
        ? project.etiquetas
        : (project.tecnologias || []);
      const visible = isPortfolioProjectVisible(project);

      return {
        ...project,
        id: `proyecto-${backendId}`,
        backendId,
        titulo: project.titulo || 'Proyecto',
        descripcion: project.descripcion || project.descripcion_aporte || '',
        estado,
        estadoLabel: getProjectStatusLabel({ ...project, estado }),
        tipo: getProjectTypeLabel(project),
        anio: getProjectYear(project),
        icono: mapProjectIcon(project),
        tecnologias,
        etiquetas: tecnologias,
        tecnologias_detalle: Array.isArray(project.tecnologias_detalle) ? project.tecnologias_detalle : [],
        githubUrl: repositorios[0] || '',
        repositoriosGithub: repositorios,
        url_repositorios: repositorios,
        url_repositorio: project.url_repositorio || repositorios[0] || '',
        repositorios_detalle: Array.isArray(project.repositorios_detalle) ? project.repositorios_detalle : [],
        demoUrl,
        url_demo: demoUrl,
        documentos,
        videoUrl: project.url_video || videos[0] || '',
        url_video: project.url_video || videos[0] || '',
        url_videos: videos,
        imagenes,
        imagenUrl: buildImageUrl(project.imagen_portada) || imagenes[0] || null,
        imagen_portada: buildImageUrl(project.imagen_portada) || imagenes[0] || null,
        participacion: project.participacion || null,
        visible,
      };
    });
}

export function separarHabilidades(lista = []) {
  return {
    tecnicas: lista.filter((item) => item.tipo === 'tecnica'),
    blandas: lista.filter((item) => item.tipo === 'blanda'),
  };
}

export function buildStats({ habilidades, experiencias, proyectos }) {
  const visible = (item) => item?.visible !== false;
  const tecnicas = (habilidades?.tecnicas || []).filter(visible);
  const visibleExperiencias = (experiencias || []).filter(visible);
  const visibleProyectos = (proyectos || []).filter(visible);
  const tecnologiasProyecto = visibleProyectos.flatMap((project) => project.tecnologias || []);
  const tecnologias = new Set(
    [...tecnicas.map((skill) => skill.nombre), ...tecnologiasProyecto]
      .map((value) => String(value || '').trim().toLowerCase())
      .filter(Boolean)
  );

  return [
    { id: 'proyectos', valor: String(visibleProyectos.length), label: 'Proyectos' },
    { id: 'tecnologias', valor: String(tecnologias.size), label: 'Tecnologias' },
    {
      id: 'academica',
      valor: String(visibleExperiencias.filter((item) => item.tipo === 'academico').length),
      label: 'Exp. Academica',
    },
    {
      id: 'laboral',
      valor: String(visibleExperiencias.filter((item) => item.tipo === 'laboral').length),
      label: 'Exp. Laboral',
    },
  ];
}

function buildRuntimeVisibility({ perfilRaw, redes, stats, habilidades, experiencias, proyectos, storedVisibility }) {
  const habilidadesLista = [
    ...(habilidades?.tecnicas || []),
    ...(habilidades?.blandas || []),
  ];
  const itemIsVisible = (item) => item?.visible !== false;
  const perfilVisibility = normalizeProfileVisibility(perfilRaw);

  if (Array.isArray(redes) && redes.length > 0) {
    perfilVisibility.redes = redes.some(itemIsVisible);
  }

  const tableVisibility = {
    perfil: perfilVisibility,
    stats: createVisibility(stats),
    habilidades: createVisibility(habilidadesLista, itemIsVisible),
    experiencias: createVisibility(experiencias, itemIsVisible),
    proyectos: createVisibility(proyectos, itemIsVisible),
  };

  return mergeVisibility(tableVisibility, {
    perfil: {
      nombre: storedVisibility?.perfil?.nombre ?? tableVisibility.perfil.nombre,
    },
    stats: {
      ...tableVisibility.stats,
      ...(storedVisibility?.stats || {}),
    },
    proyecto_detalles: {
      ...(storedVisibility?.proyecto_detalles || {}),
    },
  });
}

export async function getPerfil() {
  const { userId } = getSession();
  return apiFetch(`/profile/${userId}`);
}

export async function getRedes() {
  const { userId } = getSession();
  return apiFetch(`/enlaces/${userId}`);
}

export async function getExperiencias() {
  const { userId } = getSession();
  return apiFetch(`/experiencias/usuario/${userId}`);
}

export async function getHabilidades() {
  const { userId } = getSession();
  return apiFetch(`/habilidades/usuario/${userId}`);
}

export async function getProyectosPublicos() {
  const { userId } = getSession();
  return apiFetch(`/projects/usuario/${userId}`);
}

export async function getPortfolioViewData() {
  const { userId } = getSession();
  const stored = readStoredConfig(userId);
  const storedConfig = stored.config;
  const entries = await Promise.allSettled([
    getPerfil(),
    getRedes(),
    getExperiencias(),
    getHabilidades(),
    getProyectosPublicos(),
    getConfig(),
  ]);

  const [perfilResult, redesResult, experienciasResult, habilidadesResult, proyectosResult, configResult] = entries;
  const contentEntries = entries.slice(0, 5);
  const warnings = entries
    .filter((result) => result.status === 'rejected')
    .map((result) => result.reason?.message || 'No se pudo cargar una seccion.');

  if (contentEntries.every((result) => result.status === 'rejected')) {
    throw new Error(warnings[0] || 'No se pudo conectar con el backend.');
  }

  const backendConfig = configResult.status === 'fulfilled'
    ? mapConfigFromBackend(configResult.value)
    : {};
  const savedVisibility = backendConfig.visibilidad || storedConfig.visibilidad;
  const hasBackendHeroSource = Object.prototype.hasOwnProperty.call(backendConfig, 'heroBgSource');
  const hasBackendAvatarSource = Object.prototype.hasOwnProperty.call(backendConfig, 'avatarBgSource');
  const perfilRaw = perfilResult.status === 'fulfilled' ? perfilResult.value : null;
  const perfil = mapPerfilFromBackend(perfilRaw);
  const redes = redesResult.status === 'fulfilled'
    ? mapRedesFromBackend(unwrapList(redesResult.value), { includeHidden: true })
    : [];
  const experiencias = experienciasResult.status === 'fulfilled'
    ? mapExperienciasFromBackend(unwrapList(experienciasResult.value), { includeHidden: true })
    : [];
  const habilidades = habilidadesResult.status === 'fulfilled'
    ? mapHabilidadesFromBackend(unwrapList(habilidadesResult.value), { includeHidden: true })
    : separarHabilidades([]);
  const proyectos = proyectosResult.status === 'fulfilled'
    ? mapProyectosFromBackend(unwrapList(proyectosResult.value), { includeHidden: true })
    : [];
  const stats = buildStats({ habilidades, experiencias, proyectos });
  const visibilidad = buildRuntimeVisibility({
    perfilRaw,
    redes,
    stats,
    habilidades,
    experiencias,
    proyectos,
    storedVisibility: savedVisibility,
  });
  const imageSourceDefaults = {
    ...(!hasBackendHeroSource && !stored.hasHeroSource && perfil?.bannerUrl ? { heroBgSource: 'foto' } : {}),
    ...(!hasBackendAvatarSource && !stored.hasAvatarSource && perfil?.avatarUrl ? { avatarBgSource: 'foto' } : {}),
  };

  const data = {
    perfil,
    redes,
    stats,
    habilidades,
    experiencias,
    proyectos,
    config: normalizeConfig({
      ...storedConfig,
      ...backendConfig,
      ...imageSourceDefaults,
      publicado: perfil?.portfolioPublico ?? backendConfig.publicado ?? storedConfig.publicado,
      visibilidad,
    }),
  };

  saveCachedPortfolioViewData(userId, data);

  return {
    data: {
      ...data,
    },
    warnings,
  };
}

export async function publicarPortafolio(publicado = true) {
  const { userId } = getSession();
  const response = await apiFetch(`/profile/${userId}/portfolio-visibility`, {
    method: 'PATCH',
    body: JSON.stringify({ portfolio_publico: Boolean(publicado) }),
  });

  clearPortfolioCaches(userId);

  return response;
}
