const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

/**
 * Obtiene el ID del usuario desde el sessionStorage.
 * Según tu captura, está dentro del objeto "usuario" -> "id_usuario".
 * Si no lo encuentra, usa el 31 por defecto (aunque esto puede dar 401).
 */
const getUserId = () => {
  const userJson = sessionStorage.getItem('usuario');
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      return user.id_usuario || 31; 
    } catch (e) {
      return 31;
    }
  }
  return 31;
};

/**
 * Configura las cabeceras con el token correcto de tu Session Storage.
 */
const getHeaders = () => {
  const token = sessionStorage.getItem('tokenPORT');
  
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  if (token) {
    // Importante: No pongas espacios extra ni caracteres raros aquí
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Función auxiliar para centralizar la configuración de fetch.
 */
const fetchConfig = (method, body = null) => {
  const config = {
    method,
    headers: getHeaders(),
  };
  if (body) config.body = JSON.stringify(body);
  return config;
};

/**
 * Maneja la respuesta del servidor y errores de autenticación.
 */
const parseJson = async (res) => {
  if (res.status === 401) {
    throw new Error("Sesión inválida o expirada. Por favor, reingresa al sistema.");
  }

  const text = await res.text();
  if (!text) return {};

  try {
    const data = JSON.parse(text);
    if (!res.ok) throw new Error(data?.message || data?.error || `Error (${res.status}).`);
    return data;
  } catch (e) {
    throw new Error("Error en el formato de respuesta del servidor.");
  }
};

/**
 * Normaliza los datos que vienen de la base de datos.
 */
export const normalize = (item) => ({
  id:            item.id_enlace   ?? item.id,
  nombre:        item.nombre      ?? '',
  url:           item.link        ?? item.url ?? '',
  descripcion:   item.descripcion ?? '',
  visible:       item.es_visible === 'true' || item.es_visible === true || item.es_visible === 1,
  conectado:     true,
  plataformaKey: item.plataformaKey ?? item.nombre?.toLowerCase().replace(/\s/g, '') ?? '',
});

// --- FUNCIONES EXPORTADAS ---

// GET api/enlaces/{userId}
export const fetchEnlaces = async () => {
  const userId = getUserId();
  const res = await fetch(`${API_URL}/enlaces/${userId}`, fetchConfig('GET'));
  const data = await parseJson(res);
  const lista = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
  return lista.map(normalize);
};

// POST api/enlaces/{userId}
export const postEnlace = async (datos) => {
  const userId = getUserId();
  const body = {
    nombre:        datos.nombre?.trim()          || null,
    link:          datos.url?.trim()             || null,
    descripcion:   datos.descripcion?.trim()     || null,
    plataformaKey: datos.plataformaKey ?? null,
  };
  const res = await fetch(`${API_URL}/enlaces/${userId}`, fetchConfig('POST', body));
  const data = await parseJson(res);
  return normalize(data.data ?? data);
};

// PUT api/enlaces/{userId}/{idEnlace}
export const putEnlace = async (idEnlace, datos) => {
  const userId = getUserId();
  const body = {
    nombre:      datos.nombre?.trim()      || null,
    descripcion: datos.descripcion?.trim() || null,
  };
  const res = await fetch(`${API_URL}/enlaces/${userId}/${idEnlace}`, fetchConfig('PUT', body));
  const data = await parseJson(res);
  return normalize(data.data ?? data);
};

// PATCH api/enlaces/{userId}/{idEnlace}/visibility
export const patchVisibility = async (idEnlace, es_visible) => {
  const userId = getUserId();
  const body = { es_visible: Boolean(es_visible) };
  const res = await fetch(`${API_URL}/enlaces/${userId}/${idEnlace}/visibility`, fetchConfig('PATCH', body));
  const data = await parseJson(res);
  return normalize(data.data ?? data);
};

// DELETE api/enlaces/{userId}/{idEnlace}
export const removeEnlace = async (idEnlace) => {
  const userId = getUserId();
  const res = await fetch(`${API_URL}/enlaces/${userId}/${idEnlace}`, fetchConfig('DELETE'));
  return parseJson(res);
};