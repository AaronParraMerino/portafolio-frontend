import BASE_URL from '../../../../services/http/const';

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

export const SEARCH_AUTH_REQUIRED_MESSAGE = 'Debes iniciar sesión para buscar portafolios.';

const readStorageItem = (storage, key) => {
  try {
    return storage?.getItem(key) || '';
  } catch (_) {
    return '';
  }
};

const getStoredToken = () => {
  if (typeof window === 'undefined') return '';

  return (
    readStorageItem(window.localStorage, 'tokenPORT') ||
    readStorageItem(window.sessionStorage, 'tokenPORT')
  );
};

const getAuthHeaders = () => {
  const token = getStoredToken();

  if (!token) {
    throw new Error(SEARCH_AUTH_REQUIRED_MESSAGE);
  }

  return { Authorization: `Bearer ${token}` };
};

const getFirstValidationError = (errors) => {
  if (!errors || typeof errors !== 'object') return '';
  const first = Object.values(errors).flat()?.[0];
  return typeof first === 'string' ? first : '';
};

const normalizeApiError = (message = '', errors = null, status = 0) => {
  if (status === 401 || status === 419) {
    return SEARCH_AUTH_REQUIRED_MESSAGE;
  }

  const validationError = getFirstValidationError(errors);
  const raw = validationError || message || 'Error en la solicitud.';
  const lower = String(raw).toLowerCase();

  if (lower.includes('solo se puede activar una opción')) {
    return 'Solo puedes priorizar un criterio a la vez.';
  }

  if (lower.includes('validation') || lower.includes('validación')) {
    return 'Revisa los filtros aplicados. Hay datos que el servidor no pudo validar.';
  }

  return raw;
};

const parseJson = async (res) => {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(normalizeApiError(data?.message, data?.errors, res.status));
  }

  return data;
};

const buildUrl = (path, params = {}) => {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
};

const cleanText = (value) => String(value || '').trim();

const cleanArray = (value) => {
  if (!Array.isArray(value)) return [];

  const seen = new Set();
  const result = [];

  value.forEach((item) => {
    const text = cleanText(item);
    const key = text.toLowerCase();
    if (text && !seen.has(key)) {
      seen.add(key);
      result.push(text);
    }
  });

  return result;
};

const uniqueValues = (values = []) => cleanArray(values);

const buildSkillBlock = (skills = []) => {
  const safeSkills = Array.isArray(skills) ? skills : [];

  return {
    items: uniqueValues(safeSkills.map((skill) => skill?.item || skill?.nombre || skill?.habilidad)),
    niveles: uniqueValues(safeSkills.map((skill) => skill?.nivel)),
  };
};

const buildExperienceBlock = (experiences = []) => {
  if (!Array.isArray(experiences)) return [];

  return experiences
    .map((experience) => ({
      cargo: cleanText(experience?.cargo),
      tipos: uniqueValues(experience?.tipos),
    }))
    .filter((experience) => experience.cargo && experience.tipos.length > 0);
};

export const buildSearchPayload = (filters = {}) => ({
  query: cleanText(filters.query),

  usuario: {
    nombre: cleanText(filters.usuario?.nombre),
    ciudad: cleanArray(filters.usuario?.ciudad),
    pais: cleanArray(filters.usuario?.pais),
    profesion: cleanArray(filters.usuario?.profesion),
  },

  habilidades: {
    tecnicas: buildSkillBlock(filters.habilidades?.tecnicas),
    blandas: buildSkillBlock(filters.habilidades?.blandas),
  },

  experiencia: buildExperienceBlock(filters.experiencia),

  proyectos: {
    tecnologias: cleanArray(filters.proyectos?.tecnologias),
    tipo: cleanArray(filters.proyectos?.tipo),
    estado: cleanArray(filters.proyectos?.estado),
  },

  orden: {
    direccion: filters.orden?.direccion || 'desc',
    fecha_desde: cleanText(filters.orden?.fecha_desde),
    priorizar_proyectos: filters.orden?.prioridad === 'proyectos',
    priorizar_experiencia: filters.orden?.prioridad === 'experiencia',
    priorizar_habilidades: filters.orden?.prioridad === 'habilidades',
  },

  per_page: Number(filters.per_page || 12),
});

export const normalizeSearchResponse = (response) => {
  const list = Array.isArray(response)
    ? response
    : response?.data || response?.portafolios || response?.results || response?.items || [];

  const rawMeta = response?.meta || {};

  const meta = {
    total: Number(rawMeta.total ?? response?.total ?? list.length),
    per_page: Number(rawMeta.por_pagina ?? rawMeta.per_page ?? response?.per_page ?? 12),
    current_page: Number(rawMeta.pagina_actual ?? rawMeta.current_page ?? response?.current_page ?? 1),
    last_page: Number(rawMeta.ultima_pagina ?? rawMeta.last_page ?? response?.last_page ?? 1),
  };

  return {
    items: Array.isArray(list) ? list : [],
    meta,
    message: response?.message || '',
  };
};

export const searchPortfolios = async (filters, page = 1) => {
  const payload = buildSearchPayload(filters);

  const res = await fetch(buildUrl('/buscar', { page }), {
    method: 'POST',
    headers: {
      ...JSON_HEADERS,
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  const data = await parseJson(res);
  return normalizeSearchResponse(data);
};

export const getSearchCatalog = async (catalogPath) => {
  const res = await fetch(buildUrl(`/buscar/catalogos/${catalogPath}`), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...getAuthHeaders(),
    },
  });

  const data = await parseJson(res);
  const list = Array.isArray(data) ? data : data?.data || data?.items || [];

  return list
    .map((item) => {
      if (typeof item === 'string') return item;
      return item?.nombre || item?.name || item?.titulo || item?.valor || '';
    })
    .map(cleanText)
    .filter(Boolean);
};

export const getSearchCatalogs = async () => {
  const [profesiones, habilidadesBlandas, habilidadesTecnicas, cargos, tecnologias, tiposProyecto] = await Promise.allSettled([
    getSearchCatalog('profesiones'),
    getSearchCatalog('habilidades-blandas'),
    getSearchCatalog('habilidades-tecnicas'),
    getSearchCatalog('cargos-experiencia'),
    getSearchCatalog('tecnologias-proyecto'),
    getSearchCatalog('tipos-proyecto'),
  ]);

  const valueOf = (result) => (result.status === 'fulfilled' ? result.value : []);

  const rejected = [profesiones, habilidadesBlandas, habilidadesTecnicas, cargos, tecnologias, tiposProyecto]
    .find((result) => result.status === 'rejected');

  if (rejected?.reason?.message === SEARCH_AUTH_REQUIRED_MESSAGE) {
    throw rejected.reason;
  }

  return {
    profesiones: valueOf(profesiones),
    habilidadesBlandas: valueOf(habilidadesBlandas),
    habilidadesTecnicas: valueOf(habilidadesTecnicas),
    cargos: valueOf(cargos),
    tecnologias: valueOf(tecnologias),
    tiposProyecto: valueOf(tiposProyecto),
  };
};
