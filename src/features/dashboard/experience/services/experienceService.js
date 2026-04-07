import BASE_URL from '../../../../services/http/const';

const getAuthData = () => {
  const token = sessionStorage.getItem('tokenPORT');
  const usuarioRaw = sessionStorage.getItem('usuario');

  if (!token || !usuarioRaw) {
    throw new Error('No hay sesión activa.');
  }

  const usuario = JSON.parse(usuarioRaw);

  if (!usuario?.id_usuario) {
    throw new Error('No se encontró el usuario autenticado.');
  }

  return {
    token,
    userId: usuario.id_usuario,
  };
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

const toFrontModel = (exp) => ({
  id: exp.id_experiencia,
  tipo_experiencia: exp.tipo === 'academica' ? 'Académica' : 'Laboral',
  empresa: exp.institucion ?? '',
  puesto: exp.cargo ?? '',
  fecha_inicio: exp.fecha_inicio ? String(exp.fecha_inicio).slice(0, 10) : '',
  fecha_fin: exp.fecha_fin ? String(exp.fecha_fin).slice(0, 10) : '',
  actual: Boolean(exp.es_actual),
  descripcion: exp.descripcion ?? '',
  es_publico: Boolean(exp.es_publico),
});

const toBackModel = (formData) => ({
  tipo: formData.tipo_experiencia === 'Académica' ? 'academica' : 'laboral',
  institucion: formData.empresa,
  cargo: formData.puesto,
  descripcion: formData.descripcion || null,
  fecha_inicio: formData.fecha_inicio || null,
  fecha_fin: formData.actual ? null : (formData.fecha_fin || null),
  es_actual: Boolean(formData.actual),
  es_publico: true,
});

export const getExperiencias = async () => {
  const { token, userId } = getAuthData();

  const res = await fetch(`${BASE_URL}/experiencias/usuario/${userId}`, {
    method: 'GET',
    headers: buildHeaders(token),
  });

  const data = await parseJson(res);
  return Array.isArray(data) ? data.map(toFrontModel) : [];
};

export const createExperiencia = async (formData) => {
  const { token, userId } = getAuthData();

  const res = await fetch(`${BASE_URL}/experiencias/usuario/${userId}`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(toBackModel(formData)),
  });

  const data = await parseJson(res);
  return toFrontModel(data.data);
};

export const updateExperiencia = async (id, formData) => {
  const { token, userId } = getAuthData();

  const res = await fetch(`${BASE_URL}/experiencias/usuario/${userId}/${id}`, {
    method: 'PUT',
    headers: buildHeaders(token),
    body: JSON.stringify(toBackModel(formData)),
  });

  const data = await parseJson(res);
  return toFrontModel(data.data);
};

export const deleteExperiencia = async (id) => {
  const { token, userId } = getAuthData();

  const res = await fetch(`${BASE_URL}/experiencias/usuario/${userId}/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(token),
  });

  return parseJson(res);
};