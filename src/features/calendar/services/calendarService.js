import BASE_URL from '../../../services/http/const';
import { getStoredUser } from '../../../shared/utils/authStorage';
import { invalidateHomeEventsForUser } from '../../public/home/services/homeEventsCache';
import { invalidateCalendarEventsForUser } from './calendarCache';

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
    const error = new Error(data?.message || data?.mensaje || 'Error en la solicitud.');
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
  taller: 'Inscrito',
  charla: 'Inscrito',
  webinar: 'Inscrito',
  feria: 'Inscrito',
  capacitacion: 'Inscrito',
  networking: 'Inscrito',
  curso: 'Inscrito',
  convocatoria: 'Inscrito',
  otro: 'Personal',
};

const TYPE_TO_BACK = {
  Personal: 'personal',
  Académico: 'academico',
  Academico: 'academico',
  Trabajo: 'trabajo',
  Reunión: 'reunion',
  Reunion: 'reunion',
  Entrega: 'entrega',
};

const normalizeText = (value) => (
  String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
);

const normalizeTypeToFront = (value, fallback = 'Personal') => {
  const raw = String(value || '').trim();
  const normalized = normalizeText(raw);

  return TYPE_TO_FRONT[raw]
    || TYPE_TO_FRONT[normalized]
    || TYPE_TO_FRONT[normalized.replace(/\s+/g, '_')]
    || fallback;
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

const getCurrentUserId = () => {
  const user = getStoredUser();
  return user?.id_usuario ?? user?.id ?? user?.usuario_id ?? user?.userId ?? null;
};

const splitDateTime = (value = '') => {
  const text = String(value || '').trim();

  if (!text) {
    return { fecha: '', hora: '' };
  }

  const [datePart, timePart = ''] = text.replace('T', ' ').split(' ');
  const hora = timePart ? timePart.slice(0, 5) : '';

  return {
    fecha: datePart,
    hora,
  };
};

const WEEK_DAY_BY_INDEX = [
  'domingo',
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
];

const ALL_EVENT_DAYS = [
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
  'domingo',
];

const SUBSCRIBED_COLOR_CLASSES = [
  'mint',
  'amber',
  'sky',
  'lavender',
  'rose',
  'lime',
  'cyan',
];

const parseDateOnly = (value = '') => {
  const text = String(value || '').slice(0, 10);
  if (!text) return null;

  const [year, month, day] = text.split('-').map(Number);
  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
};

const toISODate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const normalizeActiveDays = (value) => {
  const source = Array.isArray(value) ? value : [];
  const normalized = source
    .map((day) => normalizeText(day))
    .filter((day) => ALL_EVENT_DAYS.includes(day));

  return Array.from(new Set(normalized));
};

const subscribedColorClassForEvent = (eventId) => {
  const text = String(eventId || '');
  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash + text.charCodeAt(index) * (index + 1)) % SUBSCRIBED_COLOR_CLASSES.length;
  }

  return `subscribed-${SUBSCRIBED_COLOR_CLASSES[hash]}`;
};

const mapEventToFront = (item = {}) => ({
  id: item.id_evento ?? item.id ?? item.uuid,
  titulo: item.titulo ?? item.title ?? '',
  descripcion: item.descripcion ?? item.description ?? '',
  fecha: item.fecha ?? item.date ?? '',
  hora: item.hora ?? item.time ?? item.hora_inicio ?? '',
  tipo: normalizeTypeToFront(item.tipo ?? item.tipo_label ?? item.type),
  origen: 'personal',
  editable: true,
  desinscribible: false,
});

const mapSubscribedEventToFront = (item = {}) => {
  const start = splitDateTime(item.fecha_inicio ?? item.startsAt ?? item.startDate ?? item.fecha ?? item.date);
  const end = splitDateTime(item.fecha_fin ?? item.endsAt ?? item.endDate);
  const eventoId = item.id_evento ?? item.evento_id ?? item.id ?? item.eventId;
  const idInscripcion = item.id_inscripcion ?? item.inscripcion_id ?? item.subscriptionId;

  return {
    id: `inscrito-${eventoId}`,
    eventoId,
    idInscripcion,
    titulo: item.titulo ?? item.title ?? item.nombre ?? '',
    descripcion: item.descripcion ?? item.description ?? '',
    fecha: start.fecha,
    hora: start.hora || item.hora || item.time || '',
    fechaFin: end.fecha,
    horaFin: end.hora,
    tipo: 'Inscrito',
    tipoOriginal: item.tipo ?? item.type ?? '',
    ubicacion: item.ubicacion ?? item.location ?? item.lugar ?? '',
    cupo: Number(item.cupo ?? item.capacity ?? 0),
    inscritos: Number(item.inscritos ?? item.registered ?? 0),
    cupoDisponible: item.cupo_disponible ?? item.availableSlots ?? null,
    autorNombre: item.autor_nombre ?? item.creador?.nombre ?? '',
    origen: 'inscrito',
    colorClass: subscribedColorClassForEvent(eventoId),
    editable: false,
    desinscribible: true,
    raw: item,
  };
};

const expandSubscribedEventToCalendar = (item = {}) => {
  const base = mapSubscribedEventToFront(item);
  if (!base.eventoId || !base.fecha) return [];

  const startDate = parseDateOnly(base.fecha);
  const endDate = parseDateOnly(base.fechaFin || base.fecha);
  if (!startDate || !endDate || endDate < startDate) return [base];

  const activeDays = normalizeActiveDays(item.dias_activos || item.activeDays);
  const allowedDays = activeDays.length ? activeDays : ALL_EVENT_DAYS;
  const events = [];
  const cursor = new Date(startDate);
  let iterations = 0;

  while (cursor <= endDate && iterations < 370) {
    const iso = toISODate(cursor);
    const dayName = WEEK_DAY_BY_INDEX[cursor.getDay()];

    if (allowedDays.includes(dayName)) {
      events.push({
        ...base,
        id: `inscrito-${base.eventoId}-${iso}`,
        fecha: iso,
      });
    }

    cursor.setDate(cursor.getDate() + 1);
    iterations += 1;
  }

  return events.length ? events : [base];
};

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

export const getSubscribedCalendarEvents = async () => {
  const userId = getCurrentUserId();

  if (!userId) {
    return [];
  }

  const res = await fetch(`${BASE_URL}/eventos/${userId}?por_pagina=100`, {
    method: 'GET',
    headers: buildHeaders(),
  });

  const data = await parseJson(res);

  return extractList(data)
    .filter((item) => item.esta_inscrito === true || item.esta_inscrito === 1 || item.esta_inscrito === '1')
    .flatMap(expandSubscribedEventToCalendar)
    .filter((event) => event.eventoId && event.fecha);
};

export const createCalendarEvent = async (event) => {
  const res = await fetch(`${BASE_URL}/eventos-personales`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(mapEventToBack(event)),
  });

  const data = await parseJson(res);
  invalidateCalendarEventsForUser();
  return mapEventToFront(data.data || data.evento || data);
};

export const updateCalendarEvent = async (id, event) => {
  const res = await fetch(`${BASE_URL}/eventos-personales/${id}`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify(mapEventToBack(event)),
  });

  const data = await parseJson(res);
  invalidateCalendarEventsForUser();
  return mapEventToFront(data.data || data.evento || data);
};

export const deleteCalendarEvent = async (id) => {
  const res = await fetch(`${BASE_URL}/eventos-personales/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  });

  const data = await parseJson(res);
  invalidateCalendarEventsForUser();
  return data;
};

export const deleteCalendarEventsByDate = async (date) => {
  const res = await fetch(`${BASE_URL}/eventos-personales/dia/${date}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  });

  const data = await parseJson(res);
  invalidateCalendarEventsForUser();
  return data;
};

export const unsubscribeCalendarEvent = async (eventoId) => {
  const userId = getCurrentUserId();

  if (!userId || !eventoId) {
    throw new Error('No se pudo identificar la inscripción del evento.');
  }

  const res = await fetch(`${BASE_URL}/eventos/${userId}/${eventoId}/desinscribirse`, {
    method: 'POST',
    headers: buildHeaders(),
  });

  const data = await parseJson(res);
  invalidateHomeEventsForUser(userId);
  invalidateCalendarEventsForUser(userId);
  return data;
};
