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
    const error = new Error(data?.message || 'Error en la solicitud.');
    error.payload = data;
    error.status = res.status;
    throw error;
  }

  return data;
};

const TYPE_TO_FRONT = {
  personal: 'Personal',
  academico: 'Académico',
  académico: 'Académico',
  trabajo: 'Trabajo',
  reunion: 'Reunión',
  reunión: 'Reunión',
  entrega: 'Entrega',
  otro: 'Otro',
};

const TYPE_TO_BACK = {
  Personal: 'personal',
  Académico: 'academico',
  Academico: 'academico',
  Trabajo: 'trabajo',
  Reunión: 'reunion',
  Reunion: 'reunion',
  Entrega: 'entrega',
  Otro: 'otro',
};

const normalizeText = (value) => (
  String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
);

const normalizeTypeToFront = (value) => {
  const raw = String(value || '').trim();
  const normalized = normalizeText(raw);

  return TYPE_TO_FRONT[raw]
    || TYPE_TO_FRONT[normalized]
    || TYPE_TO_FRONT[normalized.replace(/\s+/g, '_')]
    || 'Personal';
};

const normalizeTypeToBack = (value) => {
  const raw = String(value || '').trim();
  const normalized = normalizeText(raw);

  return TYPE_TO_BACK[raw]
    || TYPE_TO_BACK[normalized]
    || normalized
    || 'personal';
};

const extractList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.eventos)) return data.eventos;
  if (Array.isArray(data?.data?.eventos)) return data.data.eventos;
  if (Array.isArray(data?.data?.items)) return data.data.items;
  return [];
};

const mapEventToFront = (item = {}) => ({
  id: item.id_evento ?? item.id ?? item.uuid,
  titulo: item.titulo ?? item.title ?? '',
  descripcion: item.descripcion ?? item.description ?? '',
  fecha: item.fecha ?? item.date ?? '',
  hora: item.hora ?? item.time ?? item.hora_inicio ?? '',
  tipo: normalizeTypeToFront(item.tipo ?? item.tipo_label ?? item.type),
});

const mapEventToBack = (event = {}) => ({
  titulo: event.titulo,
  descripcion: event.descripcion,
  fecha: event.fecha,
  hora: event.hora,
  tipo: normalizeTypeToBack(event.tipo),
});

export const getCalendarEvents = async ({ month } = {}) => {
  const params = new URLSearchParams();

  if (month) {
    params.set('mes', month);
  }

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${BASE_URL}/eventos-personales${query}`, {
    method: 'GET',
    headers: buildHeaders(),
  });

  const data = await parseJson(res);
  return extractList(data).map(mapEventToFront).filter((event) => event.id);
};

export const createCalendarEvent = async (event) => {
  const res = await fetch(`${BASE_URL}/eventos-personales`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(mapEventToBack(event)),
  });

  const data = await parseJson(res);
  return mapEventToFront(data.data || data.evento || data);
};

export const updateCalendarEvent = async (id, event) => {
  const res = await fetch(`${BASE_URL}/eventos-personales/${id}`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify(mapEventToBack(event)),
  });

  const data = await parseJson(res);
  return mapEventToFront(data.data || data.evento || data);
};

export const deleteCalendarEvent = async (id) => {
  const res = await fetch(`${BASE_URL}/eventos-personales/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  });

  return parseJson(res);
};

export const deleteCalendarEventsByDate = async (date) => {
  const res = await fetch(`${BASE_URL}/eventos-personales/dia/${date}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  });

  return parseJson(res);
};
