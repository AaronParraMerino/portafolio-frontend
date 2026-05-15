import BASE_URL from '../../../../services/http/const';
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

const PUBLIC_CACHE_PREFIX = 'public-portfolio-view:v1';

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
  }), {
    perfil: { ...DEFAULT_VISIBILITY.perfil },
    stats: { ...DEFAULT_VISIBILITY.stats },
    habilidades: {},
    experiencias: {},
    proyectos: {},
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
  const proyectos = mapProyectosFromBackend(unwrapList(source.proyectos));
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
