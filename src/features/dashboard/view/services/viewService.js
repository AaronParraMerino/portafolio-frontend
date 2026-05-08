import BASE_URL from '../../../../services/http/const';
import { DEFAULT_CONFIG, DEFAULT_VISIBILITY } from '../model/viewModel';

const STORAGE_URL = process.env.REACT_APP_STORAGE_URL || 'http://localhost:8000/storage';
const CONFIG_STORAGE_PREFIX = 'portfolio-view-config';
const DATA_CACHE_PREFIX = 'portfolio-view-data';

const LEVEL_PERCENTAGE = {
  basico: 35,
  intermedio: 60,
  avanzado: 82,
  experto: 96,
};

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

function normalizeLevel(value = 'intermedio') {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') || 'intermedio';
}

function getSession() {
  const rawUser = sessionStorage.getItem('usuario');
  const token = sessionStorage.getItem('tokenPORT') || localStorage.getItem('tokenPORT');

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
    const details = data?.errors ? ` ${JSON.stringify(data.errors)}` : '';
    throw new Error(`${data?.message || `Error ${res.status}`}${details}`);
  }

  return data;
}

function unwrapList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
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
  return items.reduce((acc, item) => ({
    ...acc,
    [item.id]: value,
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
  }), {
    perfil: { ...DEFAULT_VISIBILITY.perfil },
    stats: { ...DEFAULT_VISIBILITY.stats },
    habilidades: {},
    experiencias: {},
    proyectos: {},
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
    visibilidad: source.visibilidad,
  };

  return Object.fromEntries(
    Object.entries(mapped).filter(([, value]) => value !== undefined && value !== null)
  );
}

export function normalizeConfig(config = {}) {
  return {
    ...DEFAULT_CONFIG,
    ...config,
    visibilidad: mergeVisibility(config.visibilidad),
  };
}

export function loadStoredConfig(userId = getSession().userId) {
  return readStoredConfig(userId).config;
}

export async function saveConfig(config) {
  const { userId } = getSession();
  const normalized = normalizeConfig(config);
  localStorage.setItem(configStorageKey(userId), JSON.stringify(normalized));
  return normalized;
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

export function mapRedesFromBackend(lista = []) {
  return lista
    .filter((item) => toBool(item.es_visible ?? item.visible, true))
    .map((item) => {
      const href = ensureUrl(item.link ?? item.url);
      const tipo = item.tipo || item.plataformaKey || inferSocialType(item.nombre, href);

      return {
        id: `enlace-${item.id_enlace ?? item.id}`,
        backendId: item.id_enlace ?? item.id,
        nombre: item.nombre || 'Enlace',
        url: displayUrl(item.link ?? item.url),
        href,
        tipo,
        descripcion: item.descripcion || '',
      };
    });
}

export function mapHabilidadesFromBackend(lista = []) {
  const normalized = lista
    .filter((item) => toBool(item.es_visible ?? item.es_publico, true))
    .map((item) => {
      const catalog = item.habilidad || item.catalogo_habilidad || {};
      const level = normalizeLevel(item.nivel);
      const tipo = catalog.tipo || item.tipo || 'tecnica';

      return {
        id: `habilidad-${item.id_habilidad_usuario ?? item.id}`,
        backendId: item.id_habilidad_usuario ?? item.id,
        catalogoId: catalog.id_habilidad ?? item.habilidad_id,
        nombre: catalog.nombre || item.nombre || item.nombre_habilidad || 'Habilidad',
        tipo,
        nivel: level,
        porcentaje: Number(item.porcentaje ?? LEVEL_PERCENTAGE[level] ?? 60),
        descripcion: catalog.descripcion || item.descripcion || '',
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

export function mapExperienciasFromBackend(lista = []) {
  return lista
    .filter((item) => toBool(item.es_publico, true))
    .map((item) => {
      const isCurrent = toBool(item.es_actual ?? item.actual, false);
      const tipo = item.tipo === 'academica' ? 'academico' : 'laboral';

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
      };
    });
}

function mapProjectIcon(project = {}) {
  const raw = `${project.categoria_proyecto || ''} ${project.plataforma_objetivo || ''}`.toLowerCase();

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

export function mapProyectosFromBackend(lista = []) {
  return lista
    .filter((project) => {
      const isPublicParticipation = toBool(project.participacion?.visibilidad ?? project.visibilidad, true);
      const isPublished = (project.estado_publicacion || 'publicado') === 'publicado';
      return isPublicParticipation && isPublished;
    })
    .map((project) => {
      const evidencias = Array.isArray(project.evidencias) ? project.evidencias : [];
      const coverUrl = findFirstUrl(evidencias, ['imagen', 'captura']);
      const demoUrl = project.url_demo || findFirstUrl(evidencias, ['demo', 'link']);
      const videoUrl = project.url_video || findFirstUrl(evidencias, ['video']);
      const repoUrl = project.url_repositorio || project.url_repositorios?.[0] || '';
      const estadoDesarrollo = project.estado_desarrollo || 'sin_especificar';

      return {
        id: `proyecto-${project.id_proyecto ?? project.id}`,
        backendId: project.id_proyecto ?? project.id,
        titulo: project.titulo || 'Proyecto',
        descripcion: project.descripcion || project.descripcion_aporte || '',
        estado: project.estado_publicacion === 'publicado' ? 'publicado' : 'desarrollo',
        estadoLabel: project.estado_publicacion === 'publicado'
          ? 'Publicado'
          : (DEVELOPMENT_LABELS[estadoDesarrollo] || 'Desarrollo'),
        tipo: CATEGORY_LABELS[project.categoria_proyecto] || project.tipo || 'Proyecto',
        anio: getProjectYear(project),
        icono: mapProjectIcon(project),
        tecnologias: Array.isArray(project.tecnologias) ? project.tecnologias : (project.etiquetas || []),
        githubUrl: repoUrl,
        demoUrl,
        videoUrl,
        imagenUrl: buildImageUrl(coverUrl),
        participacion: project.participacion || null,
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
  const tecnicas = habilidades?.tecnicas || [];
  const tecnologiasProyecto = proyectos.flatMap((project) => project.tecnologias || []);
  const tecnologias = new Set(
    [...tecnicas.map((skill) => skill.nombre), ...tecnologiasProyecto]
      .map((value) => String(value || '').trim().toLowerCase())
      .filter(Boolean)
  );

  return [
    { id: 'proyectos', valor: String(proyectos.length), label: 'Proyectos' },
    { id: 'tecnologias', valor: String(tecnologias.size), label: 'Tecnologias' },
    {
      id: 'academica',
      valor: String(experiencias.filter((item) => item.tipo === 'academico').length),
      label: 'Exp. Academica',
    },
    {
      id: 'laboral',
      valor: String(experiencias.filter((item) => item.tipo === 'laboral').length),
      label: 'Exp. Laboral',
    },
  ];
}

function buildRuntimeVisibility({ perfilRaw, stats, habilidades, experiencias, proyectos, storedVisibility }) {
  const habilidadesLista = [
    ...(habilidades?.tecnicas || []),
    ...(habilidades?.blandas || []),
  ];

  return mergeVisibility(
    {
      perfil: normalizeProfileVisibility(perfilRaw),
      stats: createVisibility(stats),
      habilidades: createVisibility(habilidadesLista),
      experiencias: createVisibility(experiencias),
      proyectos: createVisibility(proyectos),
    },
    storedVisibility
  );
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
  ]);

  const [perfilResult, redesResult, experienciasResult, habilidadesResult, proyectosResult] = entries;
  const warnings = entries
    .filter((result) => result.status === 'rejected')
    .map((result) => result.reason?.message || 'No se pudo cargar una seccion.');

  if (entries.every((result) => result.status === 'rejected')) {
    throw new Error(warnings[0] || 'No se pudo conectar con el backend.');
  }

  const perfilRaw = perfilResult.status === 'fulfilled' ? perfilResult.value : null;
  const perfil = mapPerfilFromBackend(perfilRaw);
  const redes = redesResult.status === 'fulfilled'
    ? mapRedesFromBackend(unwrapList(redesResult.value))
    : [];
  const experiencias = experienciasResult.status === 'fulfilled'
    ? mapExperienciasFromBackend(unwrapList(experienciasResult.value))
    : [];
  const habilidades = habilidadesResult.status === 'fulfilled'
    ? mapHabilidadesFromBackend(unwrapList(habilidadesResult.value))
    : separarHabilidades([]);
  const proyectos = proyectosResult.status === 'fulfilled'
    ? mapProyectosFromBackend(unwrapList(proyectosResult.value))
    : [];
  const stats = buildStats({ habilidades, experiencias, proyectos });
  const visibilidad = buildRuntimeVisibility({
    perfilRaw,
    stats,
    habilidades,
    experiencias,
    proyectos,
    storedVisibility: storedConfig.visibilidad,
  });
  const imageSourceDefaults = {
    ...(!stored.hasHeroSource && perfil?.bannerUrl ? { heroBgSource: 'foto' } : {}),
    ...(!stored.hasAvatarSource && perfil?.avatarUrl ? { avatarBgSource: 'foto' } : {}),
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
      ...imageSourceDefaults,
      publicado: perfil?.portfolioPublico ?? storedConfig.publicado,
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
  return apiFetch(`/profile/${userId}/portfolio-visibility`, {
    method: 'PATCH',
    body: JSON.stringify({ portfolio_publico: Boolean(publicado) }),
  });
}
