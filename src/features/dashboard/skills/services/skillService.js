import BASE_URL from '../../../../services/http/const';

const getAuthData = () => {
  const token = localStorage.getItem('tokenPORT');
  const usuarioRaw = localStorage.getItem('usuario');

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

const mapCatalogToFront = (item) => ({
  id: item.id_habilidad,
  nombre: item.nombre,
  tipo: item.tipo,
  descripcion: item.descripcion ?? '',
});

const mapUserSkillToFront = (item) => ({
  id: item.id_habilidad_usuario,
  catalogo_habilidad_id: item.habilidad?.id_habilidad ?? item.habilidad_id,
  nombre: item.habilidad?.nombre ?? '',
  nombre_habilidad: item.habilidad?.nombre ?? '',
  tipo: item.habilidad?.tipo ?? '',
  descripcion: item.habilidad?.descripcion ?? '',
  nivel: item.nivel,
  es_publico: Boolean(item.es_visible),
});

export const getCatalogSkills = async () => {
  const { token } = getAuthData();

  const res = await fetch(`${BASE_URL}/habilidades/catalogo`, {
    method: 'GET',
    headers: buildHeaders(token),
  });

  const data = await parseJson(res);
  return Array.isArray(data) ? data.map(mapCatalogToFront) : [];
};

export const createCatalogSkill = async (nombre, tipo, descripcion = '') => {
  const { token } = getAuthData();

  const res = await fetch(`${BASE_URL}/habilidades/catalogo`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify({
      nombre,
      tipo,
      descripcion,
    }),
  });

  const data = await parseJson(res);
  return mapCatalogToFront(data.data);
};

export const getUserSkills = async () => {
  const { token, userId } = getAuthData();

  const res = await fetch(`${BASE_URL}/habilidades/usuario/${userId}`, {
    method: 'GET',
    headers: buildHeaders(token),
  });

  const data = await parseJson(res);
  return Array.isArray(data) ? data.map(mapUserSkillToFront) : [];
};

export const addUserSkill = async (catalogoId, nivel, esPublico) => {
  const { token, userId } = getAuthData();

  const res = await fetch(`${BASE_URL}/habilidades/usuario/${userId}`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify({
      habilidad_id: catalogoId,
      nivel,
      es_visible: esPublico,
    }),
  });

  const data = await parseJson(res);
  return mapUserSkillToFront(data.data);
};

export const updateUserSkill = async (id, nivel, esPublico) => {
  const { token, userId } = getAuthData();

  const res = await fetch(`${BASE_URL}/habilidades/usuario/${userId}/${id}`, {
    method: 'PUT',
    headers: buildHeaders(token),
    body: JSON.stringify({
      nivel,
      es_visible: esPublico,
    }),
  });

  const data = await parseJson(res);
  return mapUserSkillToFront(data.data);
};

export const deleteUserSkill = async (id) => {
  const { token, userId } = getAuthData();

  const res = await fetch(`${BASE_URL}/habilidades/usuario/${userId}/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(token),
  });

  return parseJson(res);
};