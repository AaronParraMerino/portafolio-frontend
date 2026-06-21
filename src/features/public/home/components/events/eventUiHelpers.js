import {
  BsBook,
  BsBriefcase,
  BsCalendarEvent,
  BsCameraVideo,
  BsMegaphone,
  BsMic,
  BsMortarboard,
  BsPeople,
  BsStars,
} from 'react-icons/bs';
import { getEventTypeMeta } from '../../services/homeEventsService';

export const eventTypeIcons = {
  book: BsBook,
  briefcase: BsBriefcase,
  calendar: BsCalendarEvent,
  graduation: BsMortarboard,
  megaphone: BsMegaphone,
  mic: BsMic,
  monitor: BsCameraVideo,
  sparkles: BsStars,
  users: BsPeople,
};

export function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function getEventVisualMeta(event = {}) {
  const typeMeta = getEventTypeMeta(event.type);
  const Icon = eventTypeIcons[typeMeta.icon] || BsStars;

  return {
    ...typeMeta,
    Icon,
    toneClass: `evh-tone-${typeMeta.tone || 'gray'}`,
  };
}

const EVENT_STATUS_KEYS = new Set(['programado', 'publicado', 'en_curso', 'finalizado', 'cancelado']);
const EVENT_TYPE_KEYS = new Set([
  'taller',
  'charla',
  'webinar',
  'feria',
  'capacitacion',
  'networking',
  'curso',
  'trabajo',
  'convocatoria',
  'otro',
]);

function localeForLanguage(language) {
  if (language === 'en') return 'en-US';
  if (language === 'pt') return 'pt-BR';
  return 'es-BO';
}

const WEEKDAY_LABELS = {
  es: {
    lunes: 'lunes',
    martes: 'martes',
    miercoles: 'miercoles',
    jueves: 'jueves',
    viernes: 'viernes',
    sabado: 'sabado',
    domingo: 'domingo',
  },
  en: {
    lunes: 'Monday',
    martes: 'Tuesday',
    miercoles: 'Wednesday',
    jueves: 'Thursday',
    viernes: 'Friday',
    sabado: 'Saturday',
    domingo: 'Sunday',
  },
  pt: {
    lunes: 'segunda',
    martes: 'terca',
    miercoles: 'quarta',
    jueves: 'quinta',
    viernes: 'sexta',
    sabado: 'sabado',
    domingo: 'domingo',
  },
};

const ALL_WEEK_DAYS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

export function getEventTypeLabel(event = {}, t = (key) => key) {
  const type = String(event.type || 'otro').toLowerCase();
  return EVENT_TYPE_KEYS.has(type) ? t(`home.events.type.${type}`) : event.typeLabel || t('home.events.type.otro');
}

export function getEventStatusLabel(event = {}, t = (key) => key) {
  if (event.soldOut) return t('home.events.soldOut');
  const status = String(event.status || 'programado').toLowerCase();
  return EVENT_STATUS_KEYS.has(status) ? t(`home.events.status.${status}`) : event.status;
}

export function formatEventDate(value, language = 'es', options = {}, t = (key) => key) {
  if (!value) return t('home.events.datePending');

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return t('home.events.datePending');

  return new Intl.DateTimeFormat(localeForLanguage(language), {
    day: '2-digit',
    month: 'short',
    year: options.withYear === false ? undefined : 'numeric',
    hour: options.withTime === false ? undefined : '2-digit',
    minute: options.withTime === false ? undefined : '2-digit',
  }).format(date);
}

export function formatEventDateRange(startsAt, endsAt, language = 'es', t = (key) => key) {
  const startDate = startsAt ? new Date(startsAt) : null;
  const endDate = endsAt ? new Date(endsAt) : null;

  if (startDate && Number.isNaN(startDate.getTime())) return t('home.events.datePending');
  if (endDate && Number.isNaN(endDate.getTime())) return t('home.events.datePending');
  if (!startDate && !endDate) return t('home.events.datePending');

  const formatter = new Intl.DateTimeFormat(localeForLanguage(language), {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  if (!startDate) return formatter.format(endDate);
  if (!endDate) return formatter.format(startDate);

  const startLabel = formatter.format(startDate);
  const endLabel = formatter.format(endDate);

  return startLabel === endLabel ? startLabel : `${startLabel} - ${endLabel}`;
}

export function formatEventTimeRange(startsAt, endsAt, language = 'es') {
  const startDate = startsAt ? new Date(startsAt) : null;
  const endDate = endsAt ? new Date(endsAt) : null;

  if (startDate && Number.isNaN(startDate.getTime())) return '';
  if (endDate && Number.isNaN(endDate.getTime())) return '';
  if (!startDate && !endDate) return '';

  const formatter = new Intl.DateTimeFormat(localeForLanguage(language), {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (!startDate) return formatter.format(endDate);
  if (!endDate) return formatter.format(startDate);

  return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
}

export function formatActiveDays(days = [], language = 'es') {
  if (!Array.isArray(days) || !days.length) return '';
  if (ALL_WEEK_DAYS.every((day) => days.includes(day))) return '';

  const labels = WEEKDAY_LABELS[language] || WEEKDAY_LABELS.es;
  return days.map((day) => labels[day] || day).join(', ');
}

export function getEventActionState(event = {}, registering = false, t = (key) => key) {
  if (registering) {
    return {
      disabled: true,
      label: t('home.events.registering'),
      tone: 'loading',
    };
  }

  if (event.isRegistered) {
    return {
      disabled: true,
      label: t('home.events.registered'),
      tone: 'registered',
    };
  }

  if (event.soldOut) {
    return {
      disabled: true,
      label: t('home.events.soldOut'),
      tone: 'soldout',
    };
  }

  if (event.requiresLogin) {
    return {
      disabled: false,
      label: t('home.events.register'),
      tone: 'primary',
    };
  }

  return {
    disabled: false,
    label: t('home.events.register'),
    tone: 'primary',
  };
}

export function getShortDescription(value = '', maxLength = 130) {
  const text = String(value || '').trim();

  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

export function hasEventDetails(event = {}) {
  return Boolean(
    event.description ||
    event.location ||
    event.imageUrl ||
    event.authorName ||
    event.channels?.length ||
    event.activeDays?.length ||
    event.startsAt ||
    event.endsAt,
  );
}

export function getCapacityLabel(event = {}, t = (key) => key) {
  if (!event.capacity) {
    return t('home.events.registeredCount', { count: event.registered || 0 });
  }

  if (event.soldOut) {
    return t('home.events.registeredCount', { count: `${event.registered || 0}/${event.capacity}` });
  }

  return t('home.events.availableSlots', { count: event.availableSlots || 0 });
}
