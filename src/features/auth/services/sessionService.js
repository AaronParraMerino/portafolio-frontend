import { post } from '../../../services/http/Service';

const COOKIE_ACCEPTED_KEY = 'folio_cookie_accepted';
const COOKIE_DISMISSED_KEY = 'folio_cookie_dismissed';
const UUID_COOKIE_NAME = 'uuid_persistente';
export const BASE_SESSION_TOKEN_KEY = 'folio_session_token';

const cut = (value, max) => (value ? String(value).slice(0, max) : null);

function getClientSessionData() {
  const brand = navigator.userAgentData?.brands?.[0]?.brand || null;
  const appVersion = navigator.appVersion || null;
  const platform = navigator.platform || null;
  const lang = navigator.language || null;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || null;

  return {
    navegador_nombre: cut(brand, 50),
    navegador_version: cut(appVersion, 20),
    sistema_operativo: cut(platform, 50),
    es_movil: /Mobi|Android/i.test(navigator.userAgent),
    resolucion_pantalla: cut(`${window.screen.width}x${window.screen.height}`, 15),
    idioma_preferido: cut(lang, 10),
    zona_horaria: cut(tz, 50),
    fuente_url: document.referrer || null,
    pagina_entrada: window.location.pathname || '/',
  };
}

async function getBatteryLevelSafe() {
  try {
    if (navigator.getBattery) {
      const battery = await navigator.getBattery();
      return `${Math.round((battery.level ?? 0) * 100)}%`;
    }
  } catch (_) {
    // no-op
  }
  return null;
}

function getCpuCoresSafe() {
  return Number.isInteger(navigator.hardwareConcurrency)
    ? navigator.hardwareConcurrency
    : null;
}

function getRamSafe() {
  const memory = navigator.deviceMemory;
  return typeof memory === 'number' ? Number(memory.toFixed(2)) : null;
}

export async function initSesionBase() {
  const payload = getClientSessionData();
  try {
    const data = await post('/seccion/basic', payload);

    if (!data || data.errors) {
      console.error('Error initSesionBase:', data);
      return null;
    }

    if (data.session_token) {
      sessionStorage.setItem(BASE_SESSION_TOKEN_KEY, data.session_token);
    }

    return data;
  } catch (error) {
    console.error('Error initSesionBase:', error);
    return null;
  }
}

function readCookie(name) {
  const cookieString = `; ${document.cookie}`;
  const parts = cookieString.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
}

function writeCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function getOrCreatePersistentUuidCookie() {
  const existing = readCookie(UUID_COOKIE_NAME);
  if (existing) {
    return existing;
  }

  const uuid = crypto.randomUUID();
  writeCookie(UUID_COOKIE_NAME, uuid, 730); // 2 anos
  return uuid;
}

export function wasCookieAccepted() {
  return localStorage.getItem(COOKIE_ACCEPTED_KEY) === '1';
}

export function wasCookieDismissed() {
  return sessionStorage.getItem(COOKIE_DISMISSED_KEY) === '1';
}

export function markCookieAccepted() {
  localStorage.setItem(COOKIE_ACCEPTED_KEY, '1');
  sessionStorage.removeItem(COOKIE_DISMISSED_KEY);
}

export function markCookieDismissed() {
  sessionStorage.setItem(COOKIE_DISMISSED_KEY, '1');
}

export async function aceptarCookiesYGuardarHardware() {
  const payload = {
    aceptado: true,
    version_politica: 'v1.0',
    gpu_renderer: null,
    cpu_nucleos: getCpuCoresSafe(),
    ram_estimada: getRamSafe(),
    hdr_soporte: null,
    bateria_nivel: await getBatteryLevelSafe(),
    uuid_persistente: getOrCreatePersistentUuidCookie(),
  };

  const data = await post('/seccion/advanced', payload);

  if (!data || data.errors) {
    console.error('Error guardar hardware:', data);
    return data;
  }

  markCookieAccepted();

  return data;
}