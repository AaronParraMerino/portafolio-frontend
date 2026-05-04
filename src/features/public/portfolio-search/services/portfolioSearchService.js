import BASE_URL from '../../../../services/http/const';

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

const getOptionalAuthHeaders = () => {
  const token = sessionStorage.getItem('tokenPORT');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const parseJson = async (res) => {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const details = data?.errors ? ` ${JSON.stringify(data.errors)}` : '';
    throw new Error(`${data?.message || 'Error en la solicitud.'}${details}`);
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

const cleanArray = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item || '').trim())
    .filter(Boolean);
};

const cleanText = (value) => String(value || '').trim();

export const buildSearchPayload = (filters = {}) => ({
  query: cleanText(filters.query),

  usuario: {
    nombre: cleanText(filters.usuario?.nombre),
    ciudad: cleanArray(filters.usuario?.ciudad),
    pais: cleanArray(filters.usuario?.pais),
    profesion: cleanArray(filters.usuario?.profesion),
  },

  habilidades: {
    tecnicas: cleanArray(filters.habilidades?.tecnicas),
    blandas: cleanArray(filters.habilidades?.blandas),
    niveles: cleanArray(filters.habilidades?.niveles),
  },

  experiencia: {
    tipo: cleanArray(filters.experiencia?.tipo),
    cargo: cleanArray(filters.experiencia?.cargo),
  },

  proyectos: {
    tecnologias: cleanArray(filters.proyectos?.tecnologias),
    tipo: cleanArray(filters.proyectos?.tipo),
    estado: cleanArray(filters.proyectos?.estado),
  },

  orden: {
    campo: filters.orden?.campo || 'relevancia',
    direccion: filters.orden?.direccion || 'desc',
    fecha_desde: cleanText(filters.orden?.fecha_desde),
    priorizar_proyectos: Boolean(filters.orden?.priorizar_proyectos),
    priorizar_experiencia: Boolean(filters.orden?.priorizar_experiencia),
    priorizar_habilidades: Boolean(filters.orden?.priorizar_habilidades),
  },

  per_page: Number(filters.per_page || 12),
});

export const normalizeSearchResponse = (response) => {
  const list = Array.isArray(response)
    ? response
    : response?.data || response?.portafolios || response?.results || response?.items || [];

  const meta = response?.meta || {
    current_page: response?.current_page || 1,
    last_page: response?.last_page || 1,
    per_page: response?.per_page || 12,
    total: response?.total ?? list.length,
  };

  return {
    items: Array.isArray(list) ? list : [],
    meta,
    links: response?.links || {},
  };
};

export const searchPortfolios = async (filters, page = 1) => {
  const payload = buildSearchPayload(filters);

  const res = await fetch(buildUrl('/buscar', { page }), {
    method: 'POST',
    headers: {
      ...JSON_HEADERS,
      ...getOptionalAuthHeaders(),
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
      ...getOptionalAuthHeaders(),
    },
  });

  const data = await parseJson(res);
  const list = Array.isArray(data) ? data : data?.data || data?.items || [];

  return list
    .map((item) => {
      if (typeof item === 'string') return item;
      return item?.nombre || item?.name || item?.titulo || item?.valor || '';
    })
    .filter(Boolean);
};

export const getSearchCatalogs = async () => {
  const [profesiones, habilidadesBlandas, habilidadesTecnicas, cargos, tecnologias] = await Promise.allSettled([
    getSearchCatalog('profesiones'),
    getSearchCatalog('habilidades-blandas'),
    getSearchCatalog('habilidades-tecnicas'),
    getSearchCatalog('cargos-experiencia'),
    getSearchCatalog('tecnologias-proyecto'),
  ]);

  const valueOf = (result) => (result.status === 'fulfilled' ? result.value : []);

  return {
    profesiones: valueOf(profesiones),
    habilidadesBlandas: valueOf(habilidadesBlandas),
    habilidadesTecnicas: valueOf(habilidadesTecnicas),
    cargos: valueOf(cargos),
    tecnologias: valueOf(tecnologias),
  };
};
