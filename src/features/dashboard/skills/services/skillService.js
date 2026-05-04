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

const mapCatalogToFront = (item) => ({
  id: item.id_habilidad,
  nombre: item.nombre,
  tipo: item.tipo,
  descripcion: item.descripcion ?? '',
});

/**
 * FIX: Resolución robusta de id y es_visible
 * El modelo Eloquent serializa con el nombre exacto de la PK: id_habilidad_usuario.
 * Convertimos a Number() para evitar comparaciones string vs number fallidas.
 * Es_visible puede venir como boolean, 1/0 o "true"/"false" desde distintos drivers.
 */
const mapUserSkillToFront = (item) => {
  const id = Number(
    item.id_habilidad_usuario ??
    item.id_usuario_habilidad ??
    item.id ??
    0
  );

  const esVisible = item.es_visible === true ||
                    item.es_visible === 1 ||
                    item.es_visible === 'true';

  return {
    id,
    catalogo_habilidad_id: item.habilidad_id,
    nombre: item.nombre || (item.habilidad ? item.habilidad.nombre : ''),
    tipo: item.tipo || (item.habilidad ? item.habilidad.tipo : ''),
    descripcion: item.descripcion || (item.habilidad ? item.habilidad.descripcion : ''),
    nivel: item.nivel,
    es_visible: esVisible,
  };
};

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
    body: JSON.stringify({ nombre, tipo, descripcion }),
  });
  const data = await parseJson(res);
  return mapCatalogToFront(data.data || data);
};

export const getUserSkills = async () => {
  const { token, userId } = getAuthData();
  const res = await fetch(`${BASE_URL}/habilidades/usuario/${userId}`, {
    method: 'GET',
    headers: buildHeaders(token),
  });
  const data = await parseJson(res);
  const lista = Array.isArray(data) ? data : (data.data || []);
  return lista.map(mapUserSkillToFront);
};

export const addUserSkill = async (catalogoId, nivel) => {
  const { token, userId } = getAuthData();
  const res = await fetch(`${BASE_URL}/habilidades/usuario/${userId}`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify({
      habilidad_id: catalogoId,
      nivel,
    }),
  });
  const data = await parseJson(res);
  return mapUserSkillToFront(data.data || data);
};

export const updateUserSkill = async (id, nivel) => {
  const { token, userId } = getAuthData();
  const skillId = Number(id);

  const res = await fetch(`${BASE_URL}/habilidades/usuario/${userId}/${skillId}`, {
    method: 'PUT',
    headers: buildHeaders(token),
    body: JSON.stringify({
      nivel,
    }),
  });

  const data = await parseJson(res);
  return mapUserSkillToFront(data.data || data);
};

export const deleteUserSkill = async (id) => {
  const { token, userId } = getAuthData();
  const res = await fetch(`${BASE_URL}/habilidades/usuario/${userId}/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(token),
  });
  return parseJson(res);
};

