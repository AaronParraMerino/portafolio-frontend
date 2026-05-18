import BASE_URL from '../../../../services/http/const';
import { normalizeProyectoParticipantes } from '../../../dashboard/projects/services/projectsService';
import { DEFAULT_VISIBILITY } from '../../../dashboard/view/model/viewModel';
import {
  buildStats,
  mapConfigFromBackend,
  mapExperienciasFromBackend,
  mapHabilidadesFromBackend,
  mapPerfilFromBackend,
  mapProyectosFromBackend,
  mapRedesFromBackend,
  normalizeConfig,
  separarHabilidades,
} from '../../../dashboard/view/services/viewService';

const PUBLIC_CACHE_PREFIX = 'public-portfolio-view:v3';

function cleanString(value = '') {
  return String(value || '').trim();
}

function formatParticipationRole(value = '') {
  const clean = cleanString(value).replace(/_/g, ' ').replace(/\s+/g, ' ');

  if (!clean) return '';

  return clean === clean.toLowerCase()
    ? clean.replace(/\b\w/g, letter => letter.toUpperCase())
    : clean;
}

function getRawProjectId(project = {}) {
  return project.id_proyecto ?? project.idProyecto ?? project.backendId ?? project.id ?? null;
}

function getProjectParticipantsCount(project = {}, fallback = 0) {
  const raw =
    project.participantes_count ??
    project.participants_count ??
    project.colaboradores_count ??
    project.collaborators_count;
  const count = Number(raw);

  return Number.isFinite(count) && count > 0 ? count : fallback;
}

function getPublicParticipationSource(project = {}) {
  const direct =
    project.mi_participacion ||
    project.participacion_usuario ||
    project.participacionUsuario ||
    project.my_participation ||
    project.participacion;

  if (direct && typeof direct === 'object') return direct;

  if (Array.isArray(project.participaciones) && project.participaciones.length > 0) {
    return project.participaciones.find(item =>
      item?.es_propietario ||
      item?.tipo_rol === 'owner' ||
      item?.relacion_github === 'owner'
    ) || project.participaciones[0];
  }

  if (project.rol || project.descripcion_aporte || project.descripcionAporte) {
    return {
      rol: project.rol,
      descripcion_aporte: project.descripcion_aporte || project.descripcionAporte,
    };
  }

  return null;
}

function normalizePublicParticipation(project = {}) {
  const source = getPublicParticipationSource(project);

  if (!source) return null;

  const rawRol =
    source.rol ||
    source.role ||
    source.cargo ||
    source.titulo_rol ||
    source.tituloRol ||
    '';
  const rawRolLabel = source.es_propietario || source.tipo_rol === 'owner'
    ? source.rol_label || 'Owner'
    : source.rol_label === 'Colaborador'
      ? ''
      : source.rol_label || '';
  const rol = formatParticipationRole(rawRol || rawRolLabel);
  const descripcionAporte = cleanString(
    source.descripcion_aporte ||
    source.descripcionAporte ||
    source.aporte ||
    ''
  );

  if (!rol && !descripcionAporte) return null;

  return {
    ...source,
    rol,
    descripcion_aporte: descripcionAporte,
  };
}

function getRawProjectForNormalized(project = {}, rawById = new Map()) {
  const normalizedId = String(project.id || '').replace(/^proyecto-/, '');
  const possibleIds = [
    project.backendId,
    project.id_proyecto,
    project.idProyecto,
    normalizedId,
  ].filter(value => value !== undefined && value !== null && value !== '');

  for (const id of possibleIds) {
    const raw = rawById.get(String(id));
    if (raw) return raw;
  }

  return null;
}

function mapPublicProyectosFromBackend(response) {
  const rawProjects = unwrapList(response);
  const rawById = rawProjects.reduce((acc, project) => {
    const id = getRawProjectId(project);
    if (id !== null) acc.set(String(id), project);
    return acc;
  }, new Map());

  return mapProyectosFromBackend(rawProjects).map((project) => {
    const rawProject = getRawProjectForNormalized(project, rawById) || {};
    const participantes = normalizeProyectoParticipantes(rawProject, { includeCurrentUserFallback: false });
    const participacion = normalizePublicParticipation(rawProject);
    const participantesCount = getProjectParticipantsCount(
      rawProject,
      Math.max(getProjectParticipantsCount(project, 0), participantes.length)
    );

    return {
      ...project,
      participacion,
      mi_participacion: participacion,
      participacion_usuario: participacion,
      rol: participacion?.rol || '',
      descripcion_aporte: participacion?.descripcion_aporte || '',
      participantes,
      colaboradores: participantes.filter(participante => participante.tipo_rol !== 'owner'),
      owners: participantes.filter(participante => participante.tipo_rol === 'owner'),
      participantes_count: participantesCount,
    };
  });
}

function parseJsonStorage(value, fallback) {
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function cacheKey(userId) {
  return `${PUBLIC_CACHE_PREFIX}:${userId}`;
}

export function loadCachedPublicPortfolio(userId) {
  if (!userId) return null;

  const cached = parseJsonStorage(sessionStorage.getItem(cacheKey(userId)), null);
  return cached?.data || null;
}

function saveCachedPublicPortfolio(userId, data) {
  if (!userId) return;

  try {
    sessionStorage.setItem(cacheKey(userId), JSON.stringify({
      cachedAt: Date.now(),
      data,
    }));
  } catch {
    // La cache solo acelera la segunda entrada; no debe bloquear la vista.
  }
}

export function clearCachedPublicPortfolio(userId) {
  if (!userId) return;

  try {
    sessionStorage.removeItem(cacheKey(userId));
  } catch {
    // Cache cleanup should not block the public view.
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

async function publicFetch(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  const data = await safeJson(res);

  if (!res.ok) {
    const error = new Error(data?.message || `Error ${res.status}`);
    error.status = res.status;
    throw error;
  }

  return data;
}

function unwrapList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.proyectos)) return response.proyectos;
  return [];
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

function buildPublicVisibility({ perfil, stats, habilidades, experiencias, proyectos, savedVisibility }) {
  const habilidadesLista = [
    ...(habilidades?.tecnicas || []),
    ...(habilidades?.blandas || []),
  ];

  return mergeVisibility(
    {
      perfil: perfil?.visibilidad || DEFAULT_VISIBILITY.perfil,
      stats: createVisibility(stats),
      habilidades: createVisibility(habilidadesLista),
      experiencias: createVisibility(experiencias),
      proyectos: createVisibility(proyectos),
    },
    savedVisibility
  );
}

function normalizePublicPortfolio(raw = {}) {
  const source = raw?.data && typeof raw.data === 'object' ? raw.data : raw;
  const backendConfig = mapConfigFromBackend(source.config || source.personalizacion || {});
  const perfil = mapPerfilFromBackend(source.perfil || source.usuario || null);
  const redes = mapRedesFromBackend(unwrapList(source.redes || source.enlaces));
  const experiencias = mapExperienciasFromBackend(unwrapList(source.experiencias));
  const habilidades = source.habilidades?.tecnicas || source.habilidades?.blandas
    ? {
        tecnicas: source.habilidades?.tecnicas || [],
        blandas: source.habilidades?.blandas || [],
      }
    : mapHabilidadesFromBackend(unwrapList(source.habilidades));
  const proyectos = mapPublicProyectosFromBackend(source.proyectos);
  const stats = buildStats({ habilidades, experiencias, proyectos });
  const visibilidad = buildPublicVisibility({
    perfil,
    stats,
    habilidades,
    experiencias,
    proyectos,
    savedVisibility: backendConfig.visibilidad,
  });

  const imageSourceDefaults = {
    ...(!backendConfig.heroBgSource && perfil?.bannerUrl ? { heroBgSource: 'foto' } : {}),
    ...(!backendConfig.avatarBgSource && perfil?.avatarUrl ? { avatarBgSource: 'foto' } : {}),
  };

  return {
    perfil,
    redes,
    stats,
    habilidades: habilidades || separarHabilidades([]),
    experiencias,
    proyectos,
    config: normalizeConfig({
      ...backendConfig,
      ...imageSourceDefaults,
      publicado: perfil?.portfolioPublico ?? backendConfig.publicado,
      visibilidad,
    }),
  };
}

export async function getPublicPortfolio(userId) {
  if (!userId) {
    throw new Error('No se encontro el portafolio solicitado.');
  }

  const payload = await publicFetch(`/portfolio/${encodeURIComponent(userId)}/public`);
  const data = normalizePublicPortfolio(payload);

  saveCachedPublicPortfolio(userId, data);

  return data;
}
