import BASE_URL from '../../../../services/http/const';

const getAuthData = () => {
  const token = localStorage.getItem('tokenPORT');
  const usuarioRaw = localStorage.getItem('usuario');
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

// --- TRADUCCIÓN: Lo que viene de Laravel hacia React ---
const toFrontModel = (exp) => ({
  id: exp.id_experiencia,
  tipo_experiencia: exp.tipo === 'academica' ? 'Académica' : 'Laboral',
  empresa: exp.institucion ?? '',
  puesto: exp.cargo ?? '',
  // Limpieza de fechas para que el input type="date" no de error
  fecha_inicio: exp.fecha_inicio ? String(exp.fecha_inicio).slice(0, 10) : '',
  fecha_fin: exp.fecha_fin ? String(exp.fecha_fin).slice(0, 10) : '',
  // IMPORTANTE: Tu back devuelve cadenas 'true'/'false', convertimos a booleano real
  actual: exp.es_actual === 'true' || exp.es_actual === true || exp.es_actual === 1,
  descripcion: exp.descripcion ?? '',
  es_publico: exp.es_publico === 'true' || exp.es_publico === true || exp.es_publico === 1,
});

// --- TRADUCCIÓN: De React hacia tu Laravel ---
const toBackModel = (formData) => ({
  tipo: formData.tipo_experiencia === 'Académica' ? 'academica' : 'laboral',
  institucion: formData.empresa.trim(),
  cargo: formData.puesto.trim(),
  // Si la descripción está vacía, mandamos null para que la DB no guarde ""
  descripcion: formData.descripcion?.trim() || null,
  fecha_inicio: formData.fecha_inicio || null,
  // Si es actual, mandamos null. Tu Back PHP también limpia esto, así que doble seguridad
  fecha_fin: formData.actual ? null : (formData.fecha_fin || null),
  es_actual: formData.actual, // Mandamos true/false (tu Back PHP usa filter_var)
  es_publico: true,
});

export const getExperiencias = async () => {
  const { token, userId } = getAuthData();
  const res = await fetch(`${BASE_URL}/experiencias/usuario/${userId}`, {
    method: 'GET',
    headers: buildHeaders(token),
  });
  const data = await parseJson(res);
  // Laravel suele devolver el array en data.data o directamente en data
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