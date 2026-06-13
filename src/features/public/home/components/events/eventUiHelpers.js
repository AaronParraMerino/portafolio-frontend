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
