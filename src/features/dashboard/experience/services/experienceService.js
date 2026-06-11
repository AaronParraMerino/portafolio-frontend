import BASE_URL from '../../../../services/http/const';
import { DEFAULT_LANGUAGE, translations } from '../../../../core/i18n/translations';
import {
  getCachedDashboardEndpoint,
  invalidateDashboardDerivedCaches,
  readCachedDashboardEndpoint,
  writeCachedDashboardEndpoint,
} from '../../services/dashboardCache';


const LANGUAGE_STORAGE_KEY = 'creafolio_language';

const getStoredLanguage = () => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  const language = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return translations[language] ? language : DEFAULT_LANGUAGE;
};

const translate = (key, params = {}) => {
  const language = getStoredLanguage();
  const text = translations[language]?.[key] ?? translations[DEFAULT_LANGUAGE]?.[key] ?? key;

  return Object.entries(params).reduce(
    (result, [paramKey, value]) => result.replaceAll(`{${paramKey}}`, String(value)),
    text,
  );
};

const EXPERIENCE_TYPE_WORK = 'Laboral';
const COMPANY_MAX_LENGTH = 60;
const POSITION_MAX_LENGTH = 80;
const DESCRIPTION_MAX_LENGTH = 200;
const TEXT_PATTERN = /^[\p{L}0-9][\p{L}0-9\s.,&/#+()-]*$/u;

const cleanText = (value = '') => String(value || '').trim().replace(/\s+/g, ' ');

export const normalizeExperienceText = (value = '') => (
  cleanText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
);

export const formatExperienceText = (value = '') => {
  const cleaned = cleanText(value);
  if (!cleaned) return '';

  const lowerWords = ['de', 'del', 'la', 'las', 'el', 'los', 'en', 'y', 'con', 'para', 'por', 'a'];

  return cleaned
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (!word) return word;
      if (index > 0 && lowerWords.includes(word)) return word;
      if (/^(qa|ui|ux|rrhh|ti|it|ceo|cto|cfo|coo|umss|uagrm|emi|aws|api)$/i.test(word)) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};
const EXPERIENCE_TYPE_ACADEMIC = 'Académica';

const isAcademicType = (value = '') => (
  String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') === 'academica'
);

const isAcademicTypeSafe = (value = '') => normalizeExperienceText(value) === 'academica' || isAcademicType(value);

const getAuthData = () => {
  const token = localStorage.getItem('tokenPORT');
  const usuarioRaw = localStorage.getItem('usuario');
  if (!token || !usuarioRaw) throw new Error(translate('experience.service.error.noSession'));
  const usuario = JSON.parse(usuarioRaw);
  if (!usuario?.id_usuario) throw new Error(translate('experience.service.error.noUser'));
  return { token, userId: usuario.id_usuario };
};

const buildHeaders = (token) => ({
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: `Bearer ${token}`,
});

const parseJson = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const validationError = data?.errors && Object.values(data.errors).flat()?.[0];
    const rawMessage = validationError || data?.message || translate('experience.service.error.request');
    const normalizedMessage = normalizeExperienceText(rawMessage);

    if (
      normalizedMessage.includes('misma empresa') ||
      normalizedMessage.includes('same company')
    ) {
      throw new Error(translate('experience.service.error.duplicate'));
    }

    throw new Error(rawMessage);
  }
  return data;
};

const toBoolean = (value) => {
  if (value === true || value === 1) return true;
  if (value === false || value === 0 || value === null || value === undefined) return false;

  const normalized = String(value).trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 't' || normalized === 'yes' || normalized === 'si';
};

const normalizeDate = (value) => (value ? String(value).slice(0, 10) : '');

const experienciasEndpoint = (userId) => `/experiencias/usuario/${userId}`;
const catalogEndpoint = '/experiencias/catalogo';

const unwrapList = (data) => (Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []));

const getExperienceId = (item = {}) => item.id_experiencia ?? item.id;

const readExperienciasCache = (userId) => {
  const data = readCachedDashboardEndpoint(experienciasEndpoint(userId), { userId });
  return unwrapList(data);
};

const writeExperienciasCache = (userId, items = []) => {
  writeCachedDashboardEndpoint(experienciasEndpoint(userId), { data: items }, { userId });
  invalidateDashboardDerivedCaches(userId);
};

const normalizeCatalog = (data = {}) => ({
  empresas: {
    laboral: Array.isArray(data.empresas?.laboral)
      ? data.empresas.laboral.map(formatExperienceText).filter(Boolean)
      : (Array.isArray(data.empresas) ? data.empresas.map(formatExperienceText).filter(Boolean) : []),
    academica: Array.isArray(data.empresas?.academica)
      ? data.empresas.academica.map(formatExperienceText).filter(Boolean)
      : [],
  },
  puestos: {
    laboral: Array.isArray(data.puestos?.laboral) ? data.puestos.laboral.map(formatExperienceText).filter(Boolean) : [],
    academica: Array.isArray(data.puestos?.academica) ? data.puestos.academica.map(formatExperienceText).filter(Boolean) : [],
  },
});

// Traducción: Lo que viene de Laravel hacia React
const toFrontModel = (exp) => ({
  id: exp.id_experiencia ?? exp.id,
  tipo_experiencia: exp.tipo === 'academica' ? EXPERIENCE_TYPE_ACADEMIC : EXPERIENCE_TYPE_WORK,
  empresa: exp.institucion ?? '',
  puesto: exp.cargo ?? '',
  fecha_inicio: normalizeDate(exp.fecha_inicio),
  fecha_fin: normalizeDate(exp.fecha_fin),
  actual: toBoolean(exp.es_actual),
  descripcion: exp.descripcion ?? '',
  es_publico: toBoolean(exp.es_publico),
});

// Traducción: De React hacia Laravel
const validateText = (value, maxLength) => {
  const cleaned = cleanText(value);

  if (!cleaned) throw new Error(translate('experience.validation.required'));
  if (cleaned.length < 2) throw new Error(translate('experience.validation.minLength'));
  if (cleaned.length > maxLength) {
    throw new Error(translate('experience.validation.maxLength', { max: maxLength }));
  }
  if (!TEXT_PATTERN.test(cleaned)) {
    throw new Error(translate('experience.validation.textPattern'));
  }

  return formatExperienceText(cleaned);
};

const validateExperiencePayload = (formData) => {
  const institucion = validateText(formData.empresa, COMPANY_MAX_LENGTH);
  const cargo = validateText(formData.puesto, POSITION_MAX_LENGTH);
  const descripcion = cleanText(formData.descripcion);

  if (descripcion.length > DESCRIPTION_MAX_LENGTH) {
    throw new Error(translate('experience.validation.descriptionMax', { max: DESCRIPTION_MAX_LENGTH }));
  }

  if (!formData.fecha_inicio) throw new Error(translate('experience.validation.startRequired'));

  if (!toBoolean(formData.actual)) {
    if (!formData.fecha_fin) throw new Error(translate('experience.validation.endRequired'));
    if (formData.fecha_inicio > formData.fecha_fin) {
      throw new Error(translate('experience.validation.startAfterEnd'));
    }
    if (formData.fecha_inicio === formData.fecha_fin) {
      throw new Error(translate('experience.validation.sameDates'));
    }
  }

  return { institucion, cargo, descripcion };
};

const toBackModel = (formData) => {
  const isActual = toBoolean(formData.actual);
  const validated = validateExperiencePayload(formData);

  return {
    tipo: isAcademicTypeSafe(formData.tipo_experiencia) ? 'academica' : 'laboral',
    institucion: validated.institucion,
    cargo: validated.cargo,
    descripcion: validated.descripcion || null,
    fecha_inicio: formData.fecha_inicio || null,
    fecha_fin: isActual ? null : (formData.fecha_fin || null),
    es_actual: isActual,
    // NO enviamos es_publico - el backend lo gestiona
  };
};

export const getCachedExperiencias = () => {
  const { userId } = getAuthData();
  return readExperienciasCache(userId).map(toFrontModel);
};

export const getExperiencias = async ({ force = false } = {}) => {
  const { token, userId } = getAuthData();
  const endpoint = experienciasEndpoint(userId);
  const data = await getCachedDashboardEndpoint(
    endpoint,
    async () => {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: buildHeaders(token),
      });

      return parseJson(res);
    },
    { force, userId },
  );
  const lista = unwrapList(data);
  return lista.map(toFrontModel);
};

export const getExperienceCatalog = async ({ force = false } = {}) => {
  const { token, userId } = getAuthData();

  const data = await getCachedDashboardEndpoint(
    catalogEndpoint,
    async () => {
      const res = await fetch(`${BASE_URL}${catalogEndpoint}`, {
        method: 'GET',
        headers: buildHeaders(token),
      });

      return parseJson(res);
    },
    { force, userId },
  );

  return normalizeCatalog(data);
};

export const createExperiencia = async (formData) => {
  const { token, userId } = getAuthData();
  const res = await fetch(`${BASE_URL}/experiencias/usuario/${userId}`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(toBackModel(formData)),
  });
  const data = await parseJson(res);
  const created = data.data || data;
  writeExperienciasCache(userId, [created, ...readExperienciasCache(userId)]);
  return toFrontModel(created);
};

export const updateExperiencia = async (id, formData) => {
  const { token, userId } = getAuthData();
  const res = await fetch(`${BASE_URL}/experiencias/usuario/${userId}/${id}`, {
    method: 'PUT',
    headers: buildHeaders(token),
    body: JSON.stringify(toBackModel(formData)),
  });
  const data = await parseJson(res);
  const updated = data.data || data;
  writeExperienciasCache(
    userId,
    readExperienciasCache(userId).map((item) => (
      String(getExperienceId(item)) === String(id) ? updated : item
    )),
  );
  return toFrontModel(updated);
};

export const deleteExperiencia = async (id) => {
  const { token, userId } = getAuthData();
  const res = await fetch(`${BASE_URL}/experiencias/usuario/${userId}/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(token),
  });
  const data = await parseJson(res);
  writeExperienciasCache(
    userId,
    readExperienciasCache(userId).filter((item) => String(getExperienceId(item)) !== String(id)),
  );
  return data;
};

