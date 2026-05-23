import BASE_URL from '../../services/http/const';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from './translations';

export const LANGUAGE_STORAGE_KEY = 'creafolio_language';

const PREFERENCE_ENDPOINT = `${BASE_URL}/usuarios/preferencia-idioma`;

export const normalizeLanguage = (value) => (
  SUPPORTED_LANGUAGES.some((item) => item.code === value)
    ? value
    : DEFAULT_LANGUAGE
);

export const getStoredLanguage = () => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  return normalizeLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY));
};

export const saveStoredLanguage = (language) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LANGUAGE_STORAGE_KEY, normalizeLanguage(language));
};

const getToken = () => (
  localStorage.getItem('tokenPORT') || sessionStorage.getItem('tokenPORT') || ''
);

const buildHeaders = () => {
  const token = getToken();

  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const parseJson = async (res) => {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const details = data?.errors ? ` ${JSON.stringify(data.errors)}` : '';
    throw new Error(`${data?.message || 'Error al sincronizar el idioma.'}${details}`);
  }

  return data;
};

const mapPreferenceFromBack = (data = {}) => normalizeLanguage(
  data?.idioma_preferido ??
  data?.idioma ??
  data?.language ??
  data?.data?.idioma_preferido ??
  data?.data?.idioma ??
  data?.data?.language
);

/**
 * Obtiene la preferencia guardada en backend.
 * Si el backend aun no implementa el endpoint, el error se controla desde el Provider.
 */
export const getLanguagePreference = async () => {
  if (!getToken()) return getStoredLanguage();

  const res = await fetch(PREFERENCE_ENDPOINT, {
    method: 'GET',
    headers: buildHeaders(),
  });

  const data = await parseJson(res);
  return mapPreferenceFromBack(data);
};

/**
 * Guarda la preferencia en backend.
 * Body esperado por backend: { idioma: 'es' | 'en' | 'pt' }
 */
export const updateLanguagePreference = async (language) => {
  const idioma = normalizeLanguage(language);

  if (!getToken()) {
    saveStoredLanguage(idioma);
    return { idioma_preferido: idioma, synced: false };
  }

  const res = await fetch(PREFERENCE_ENDPOINT, {
    method: 'PATCH',
    headers: buildHeaders(),
    body: JSON.stringify({ idioma }),
  });

  const data = await parseJson(res);
  const syncedLanguage = mapPreferenceFromBack(data);
  saveStoredLanguage(syncedLanguage);

  return {
    ...(data?.data || data),
    idioma_preferido: syncedLanguage,
    synced: true,
  };
};
