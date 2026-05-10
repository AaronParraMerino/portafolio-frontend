import BASE_URL from '../../../../services/http/const';

export const DEVELOPERS_PER_PAGE = 20;
const PROJECT_COUNT_CACHE_PREFIX = 'developers:project-count:v1';
const PROJECT_COUNT_CACHE_TTL = 15 * 60 * 1000;
const PROJECT_COUNT_CONCURRENCY = 4;

const DEVELOPER_ENDPOINTS = [
  '/home/desarrolladores',
  '/home/portafolios',
];

const cleanText = (value) => String(value || '').trim();

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const pick = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

const buildUrl = (endpoint, params = {}) => {
  const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
  const url = new URL(`${BASE_URL}${endpoint}`, base);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
};

const parseJson = async (response) => {
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const error = new Error(data?.message || `Error ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return data;
};

const requestJson = async (endpoint, params, signal) => {
  const response = await fetch(buildUrl(endpoint, params), {
    headers: { Accept: 'application/json' },
    credentials: 'include',
    signal,
  });

  return parseJson(response);
};

const listFromPayload = (payload = {}) => {
  const source = payload?.data ?? payload;

  if (Array.isArray(source)) return source;
  if (Array.isArray(source?.data)) return source.data;
  if (Array.isArray(source?.items)) return source.items;
  if (Array.isArray(source?.results)) return source.results;
  if (Array.isArray(source?.desarrolladores)) return source.desarrolladores;
  if (Array.isArray(source?.portafolios)) return source.portafolios;
  if (Array.isArray(source?.ultimas_actualizaciones)) return source.ultimas_actualizaciones;

  return [];
};

const metaFromPayload = (payload = {}, items = [], fallback = {}) => {
  const source = payload?.data ?? payload;
  const rawMeta = source?.meta || payload?.meta || {};
  const currentPage = toNumber(
    pick(rawMeta.pagina_actual, rawMeta.current_page, source?.current_page, payload?.current_page),
    fallback.page || 1
  );
  const perPage = toNumber(
    pick(rawMeta.por_pagina, rawMeta.per_page, source?.per_page, payload?.per_page),
    fallback.perPage || DEVELOPERS_PER_PAGE
  );
  const total = toNumber(
    pick(rawMeta.total, source?.total, payload?.total),
    items.length
  );
  const lastPage = toNumber(
    pick(rawMeta.ultima_pagina, rawMeta.last_page, source?.last_page, payload?.last_page),
    Math.max(1, Math.ceil(total / Math.max(1, perPage)))
  );

  return {
    current_page: Math.max(1, currentPage),
    last_page: Math.max(1, lastPage),
    per_page: Math.max(1, perPage),
    total: Math.max(0, total),
  };
};

const developerId = (developer) => pick(
  developer?.id_usuario,
  developer?.usuario_id,
  developer?.user_id,
  developer?.id
);

export const getDeveloperKey = (developer) => {
  const id = developerId(developer);
  return id ? String(id) : '';
};

const developerName = (developer = {}) => {
  const fullName = [developer.nombre, developer.apellido].filter(Boolean).join(' ').trim();
  return cleanText(pick(developer.nombre_completo, fullName, developer.nombre));
};

const cacheKeyFor = (id) => `${PROJECT_COUNT_CACHE_PREFIX}:${id}`;

const readCachedProjectCount = (id) => {
  if (!id || typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(cacheKeyFor(id));
    if (!raw) return null;

    const cached = JSON.parse(raw);
    if (!cached || Date.now() - Number(cached.cachedAt || 0) > PROJECT_COUNT_CACHE_TTL) {
      window.sessionStorage.removeItem(cacheKeyFor(id));
      return null;
    }

    return toNumber(cached.total, 0);
  } catch {
    return null;
  }
};

const writeCachedProjectCount = (id, total) => {
  if (!id || typeof window === 'undefined') return;

  try {
    window.sessionStorage.setItem(cacheKeyFor(id), JSON.stringify({
      cachedAt: Date.now(),
      total: toNumber(total, 0),
    }));
  } catch {
    // La cache acelera la lista, pero no debe romper la vista.
  }
};

const countFrom = (...values) => values.reduce((max, value) => {
  const number = toNumber(value, 0);
  return number > max ? number : max;
}, 0);

const normalizeDeveloper = (developer = {}) => {
  const id = getDeveloperKey(developer);
  const proyectos = Array.isArray(developer.proyectos) ? developer.proyectos : null;
  const habilidades = Array.isArray(developer.habilidades) ? developer.habilidades : null;
  const experiencias = Array.isArray(developer.experiencias) ? developer.experiencias : null;
  const cachedProjectCount = readCachedProjectCount(id);
  const totalProyectos = countFrom(
    developer.total_proyectos,
    developer.proyectos_relacionados,
    developer.proyectos_publicos,
    developer.total_proyectos_publicos,
    developer.proyectos_count,
    developer.projects_count,
    developer.total_projects,
    developer.cantidad_proyectos,
    developer.numero_proyectos,
    developer.metricas?.proyectos,
    developer.stats?.proyectos,
    proyectos?.length,
    cachedProjectCount
  );

  if (id && totalProyectos > 0) {
    writeCachedProjectCount(id, totalProyectos);
  }

  return {
    ...developer,
    total_proyectos: totalProyectos,
    total_experiencias: countFrom(
      developer.total_experiencias,
      developer.experiencias_relacionadas,
      developer.experiencias_count,
      developer.cantidad_experiencias,
      developer.metricas?.experiencias,
      developer.stats?.experiencias,
      experiencias?.length
    ),
    total_habilidades: countFrom(
      developer.total_habilidades,
      developer.habilidades_relacionadas,
      developer.habilidades_count,
      developer.cantidad_habilidades,
      developer.metricas?.habilidades,
      developer.stats?.habilidades,
      habilidades?.length
    ),
  };
};

const filterByName = (items, search) => {
  const term = cleanText(search).toLowerCase();
  if (!term) return items;

  return items.filter((developer) => developerName(developer).toLowerCase().includes(term));
};

const uniqueDevelopers = (items = []) => {
  const seen = new Set();

  return items.filter((developer, index) => {
    const key = developerId(developer) || `${developerName(developer)}-${index}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const featuredListFromPayload = (payload = {}) => {
  const source = payload?.data ?? payload;
  const buckets = [
    source?.ultimas_actualizaciones,
    source?.mas_proyectos,
    source?.mas_experiencia,
    source?.mas_habilidades,
  ];

  return uniqueDevelopers(buckets.flatMap((bucket) => (Array.isArray(bucket) ? bucket : [])));
};

const normalizeDevelopersResponse = (payload, fallback) => {
  const items = listFromPayload(payload).map(normalizeDeveloper);

  return {
    items,
    meta: metaFromPayload(payload, items, fallback),
  };
};

const publicPortfolioProjectCount = async (developer, signal) => {
  const id = getDeveloperKey(developer);
  if (!id) return 0;

  const cached = readCachedProjectCount(id);
  if (cached !== null) return cached;

  const payload = await requestJson(`/portfolio/${encodeURIComponent(id)}/public`, {}, signal);
  const source = payload?.data ?? payload;
  const proyectos = Array.isArray(source?.proyectos)
    ? source.proyectos
    : Array.isArray(source?.proyectos?.data)
      ? source.proyectos.data
      : Array.isArray(source?.projects)
        ? source.projects
        : [];

  const total = proyectos.length;
  writeCachedProjectCount(id, total);

  return total;
};

export const hydrateDeveloperProjectCounts = async (items, { signal, onUpdate } = {}) => {
  if (!items.length) return items;

  const hydrated = [...items];
  let cursor = 0;

  const hydrateOne = async (index) => {
    const developer = hydrated[index];
    const id = getDeveloperKey(developer);
    if (!id) return;

    try {
      const total = await publicPortfolioProjectCount(developer, signal);

      hydrated[index] = {
        ...developer,
        total_proyectos: Math.max(developer.total_proyectos || 0, total),
      };

      if (typeof onUpdate === 'function') {
        onUpdate(id, hydrated[index].total_proyectos);
      }
    } catch (error) {
      if (error?.name === 'AbortError') throw error;
    }
  };

  const worker = async () => {
    while (cursor < hydrated.length) {
      const index = cursor;
      cursor += 1;
      await hydrateOne(index);
    }
  };

  const workers = Array.from(
    { length: Math.min(PROJECT_COUNT_CONCURRENCY, hydrated.length) },
    () => worker()
  );

  await Promise.all(workers);

  return hydrated;
};

const loadFeaturedFallback = async ({ page, perPage, search, signal }) => {
  const payload = await requestJson('/home/portafolios-destacados', { limit: perPage }, signal);
  const filteredItems = filterByName(featuredListFromPayload(payload).map(normalizeDeveloper), search);
  const total = filteredItems.length;
  const start = (page - 1) * perPage;
  const items = filteredItems.slice(start, start + perPage);

  return {
    items,
    meta: {
      current_page: page,
      last_page: Math.max(1, Math.ceil(total / Math.max(1, perPage))),
      per_page: perPage,
      total,
    },
  };
};

export const getActiveDevelopers = async ({
  page = 1,
  perPage = DEVELOPERS_PER_PAGE,
  search = '',
  signal,
} = {}) => {
  const term = cleanText(search);
  const params = {
    page,
    per_page: perPage,
    limit: perPage,
    nombre: term,
    q: term,
    search: term,
  };

  let lastError = null;

  for (const endpoint of DEVELOPER_ENDPOINTS) {
    try {
      const payload = await requestJson(endpoint, params, signal);
      const response = normalizeDevelopersResponse(payload, { page, perPage });

      return response;
    } catch (error) {
      if (error?.name === 'AbortError') throw error;
      lastError = error;
    }
  }

  try {
    return await loadFeaturedFallback({ page, perPage, search, signal });
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw lastError || error;
  }
};
