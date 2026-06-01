import { BASE_SESSION_TOKEN_KEY } from "./sessionService";

export const OAUTH_ERROR_MESSAGES = {
  unsupported: "Proveedor OAuth no soportado.",
  cancelled: "Inicio de sesion cancelado.",
  invalid: "No se pudo validar la cuenta OAuth.",
  blocked: "Usuario bloqueado.",
  paused: "Usuario pausado.",
  provider_conflict: "Ya existe otra cuenta de ese proveedor vinculada a este correo.",
  already_linked: "Esta cuenta OAuth ya esta vinculada a otra cuenta.",
  parse: "No se pudo procesar la autenticacion.",
};

export const PROVIDER_LABELS = {
  github: "GitHub",
  gitlab: "GitLab",
  discord: "Discord",
  google: "Google",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LANGUAGE_STORAGE_KEY = 'creafolio_language';
const SUPPORTED_LANGUAGE_CODES = ['es', 'en', 'pt'];

function normalizeLanguagePreference(value) {
  return SUPPORTED_LANGUAGE_CODES.includes(value) ? value : 'es';
}

function extractLanguagePreference(payload = {}) {
  const value =
    payload?.idioma_preferido ??
    payload?.idioma ??
    payload?.language ??
    payload?.data?.idioma_preferido ??
    payload?.data?.idioma ??
    payload?.data?.language ??
    payload?.usuario?.idioma_preferido ??
    payload?.user?.idioma_preferido;

  return SUPPORTED_LANGUAGE_CODES.includes(value) ? value : null;
}

function saveLanguagePreference(language) {
  localStorage.setItem(
    LANGUAGE_STORAGE_KEY,
    normalizeLanguagePreference(language)
  );
}

async function loadLanguagePreferenceFromBackend(baseUrl, token) {
  if (!baseUrl || !token) return null;

  try {
    const response = await fetch(`${baseUrl}/usuarios/preferencia-idioma`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return null;

    const data = await response.json().catch(() => ({}));
    return extractLanguagePreference(data);
  } catch {
    return null;
  }
}


function getBaseSessionToken() {
  return sessionStorage.getItem(BASE_SESSION_TOKEN_KEY);
}

async function parseJsonResponse(response) {
  const result = await response.json();

  if (!response.ok) {
    const error = new Error(result.message || "No se pudo completar la solicitud.");
    error.payload = result;
    throw error;
  }

  return result;
}

export function validateLoginFields(correo, password) {
  if (!correo && !password) return "Por favor llene todos los campos";
  if (!correo) return "Debe ingresar el correo electronico";
  if (!EMAIL_REGEX.test(correo)) return "Ingrese un correo valido";
  if (!password) return "Debe ingresar la contrasena";
  return "";
}

export async function persistAuthSession(result, baseUrl = '') {
  const token = result?.token || '';

  if (token) {
    localStorage.setItem("tokenPORT", token);
  }

  localStorage.setItem("usuario", JSON.stringify(result.data));

  const payloadLanguage = extractLanguagePreference(result);

  if (payloadLanguage) {
    saveLanguagePreference(payloadLanguage);
  }

  const backendLanguage = await loadLanguagePreferenceFromBackend(baseUrl, token);

  if (backendLanguage) {
    saveLanguagePreference(backendLanguage);
  } else if (!payloadLanguage) {
    saveLanguagePreference('es');
  }
}

export function cleanOAuthErrorFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const oauthError = params.get("oauth_error");

  if (!oauthError) return null;

  const correo = params.get("correo") || "";
  const razon = params.get("razon") || "";
  params.delete("oauth_error");
  params.delete("razon");

  const cleaned = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
  window.history.replaceState({}, "", cleaned);

  return { oauthError, correo, razon };
}

export function buildOAuthRedirectUrl(baseUrl, provider) {
  return `${baseUrl}/auth/${provider}/redirect`;
}

export async function loginWithPassword(baseUrl, correo, password) {
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      correo: correo.trim(),
      password: password.trim(),
      session_token: getBaseSessionToken(),
    }),
  });

  return parseJsonResponse(response);
}

export async function loginWithGoogle(baseUrl, idToken) {
  const response = await fetch(`${baseUrl}/auth/google`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id_token: idToken,
      session_token: getBaseSessionToken(),
    }),
  });

  return parseJsonResponse(response);
}

export async function confirmOauthLink(baseUrl, linkConfirm, credential) {
  const body = {
    link_token: linkConfirm.linkToken,
    session_token: getBaseSessionToken(),
  };

  if (linkConfirm.verificationMethod === "password") {
    body.password = credential;
  } else {
    body.code = credential;
  }

  const response = await fetch(`${baseUrl}/auth/confirm-link`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return parseJsonResponse(response);
}

export async function requestAccountReactivation(baseUrl, correo) {
  const response = await fetch(`${baseUrl}/reactivacion-cuenta/solicitar`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      correo,
      session_token: getBaseSessionToken(),
    }),
  });

  return parseJsonResponse(response);
}

export async function confirmAccountReactivation(baseUrl, correo, codigo) {
  const response = await fetch(`${baseUrl}/reactivacion-cuenta/confirmar`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      correo,
      codigo: codigo.toUpperCase(),
    }),
  });

  return parseJsonResponse(response);
}
