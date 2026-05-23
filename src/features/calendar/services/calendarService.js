import BASE_URL from '../../../services/http/const';

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
    throw new Error(`${data?.message || 'Error en la solicitud.'}${details}`);
  }

  return data;
};

const mapEventToFront = (item = {}) => ({
  id: item.id_evento ?? item.id ?? item.uuid,
  titulo: item.titulo ?? item.title ?? '',
  descripcion: item.descripcion ?? item.description ?? '',
  fecha: item.fecha ?? item.date ?? '',
  hora: item.hora ?? item.time ?? item.hora_inicio ?? '',
  tipo: item.tipo ?? item.type ?? 'Personal',
});

const mapEventToBack = (event = {}) => ({
  titulo: event.titulo,
  descripcion: event.descripcion,
  fecha: event.fecha,
  hora: event.hora,
  tipo: event.tipo,
});

export const getCalendarEvents = async ({ month } = {}) => {
  const params = new URLSearchParams();
  if (month) params.set('mes', month);

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${BASE_URL}/eventos-personales${query}`, {
    method: 'GET',
    headers: buildHeaders(),
  });

  const data = await parseJson(res);
  const list = Array.isArray(data) ? data : (data.data || []);
  return list.map(mapEventToFront);
};

export const createCalendarEvent = async (event) => {
  const res = await fetch(`${BASE_URL}/eventos-personales`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(mapEventToBack(event)),
  });

  const data = await parseJson(res);
  return mapEventToFront(data.data || data);
};

export const updateCalendarEvent = async (id, event) => {
  const res = await fetch(`${BASE_URL}/eventos-personales/${id}`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify(mapEventToBack(event)),
  });

  const data = await parseJson(res);
  return mapEventToFront(data.data || data);
};

export const deleteCalendarEvent = async (id) => {
  const res = await fetch(`${BASE_URL}/eventos-personales/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  });

  return parseJson(res);
};
