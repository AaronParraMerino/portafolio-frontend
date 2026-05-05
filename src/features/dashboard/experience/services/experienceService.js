import BASE_URL from '../../../../services/http/const';

const getAuthData = () => {
  const token = sessionStorage.getItem('tokenPORT');
  const usuarioRaw = sessionStorage.getItem('usuario');
  if (!token || !usuarioRaw) throw new Error('No hay sesión activa.');
  const usuario = JSON.parse(usuarioRaw);
  if (!usuario?.id_usuario) throw new Error('No se encontró el usuario autenticado.');
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
    const details = data?.errors ? ` ${JSON.stringify(data.errors)}` : '';
    throw new Error(`${data?.message || 'Error en la solicitud.'}${details}`);
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

// Traducción: Lo que viene de Laravel hacia React
const toFrontModel = (exp) => ({
  id: exp.id_experiencia ?? exp.id,
  tipo_experiencia: exp.tipo === 'academica' ? 'Académica' : 'Laboral',
  empresa: exp.institucion ?? '',
  puesto: exp.cargo ?? '',
  fecha_inicio: normalizeDate(exp.fecha_inicio),
  fecha_fin: normalizeDate(exp.fecha_fin),
  actual: toBoolean(exp.es_actual),
  descripcion: exp.descripcion ?? '',
  es_publico: toBoolean(exp.es_publico),
});

// Traducción: De React hacia Laravel
const toBackModel = (formData) => {
  const isActual = toBoolean(formData.actual);

  return {
    tipo: formData.tipo_experiencia === 'Académica' ? 'academica' : 'laboral',
    institucion: formData.empresa.trim(),
    cargo: formData.puesto.trim(),
    descripcion: formData.descripcion?.trim() || null,
    fecha_inicio: formData.fecha_inicio || null,
    fecha_fin: isActual ? null : (formData.fecha_fin || null),
    es_actual: isActual,
    // NO enviamos es_publico - el backend lo gestiona
  };
};

export const getExperiencias = async () => {
  const { token, userId } = getAuthData();
  const res = await fetch(`${BASE_URL}/experiencias/usuario/${userId}`, {
    method: 'GET',
    headers: buildHeaders(token),
  });
  const data = await parseJson(res);
  const lista = Array.isArray(data) ? data : (data.data || []);
  return lista.map(toFrontModel);
};

export const createExperiencia = async (formData) => {
  const { token, userId } = getAuthData();
  const res = await fetch(`${BASE_URL}/experiencias/usuario/${userId}`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(toBackModel(formData)),
  });
  const data = await parseJson(res);
  return toFrontModel(data.data || data);
};

export const updateExperiencia = async (id, formData) => {
  const { token, userId } = getAuthData();
  const res = await fetch(`${BASE_URL}/experiencias/usuario/${userId}/${id}`, {
    method: 'PUT',
    headers: buildHeaders(token),
    body: JSON.stringify(toBackModel(formData)),
  });
  const data = await parseJson(res);
  return toFrontModel(data.data || data);
};

export const deleteExperiencia = async (id) => {
  const { token, userId } = getAuthData();
  const res = await fetch(`${BASE_URL}/experiencias/usuario/${userId}/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(token),
  });
  return parseJson(res);
};

