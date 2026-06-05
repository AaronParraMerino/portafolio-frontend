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

export function formatEventDate(value, options = {}) {
  if (!value) return 'Fecha por confirmar';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Fecha por confirmar';

  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: 'short',
    year: options.withYear === false ? undefined : 'numeric',
    hour: options.withTime === false ? undefined : '2-digit',
    minute: options.withTime === false ? undefined : '2-digit',
  }).format(date);
}

export function getEventActionState(event = {}, registering = false) {
  if (registering) {
    return {
      disabled: true,
      label: 'Inscribiendo...',
      tone: 'loading',
    };
  }

  if (event.isRegistered) {
    return {
      disabled: true,
      label: 'Ya inscrito',
      tone: 'registered',
    };
  }

  if (event.soldOut) {
    return {
      disabled: true,
      label: 'Agotado',
      tone: 'soldout',
    };
  }

  return {
    disabled: false,
    label: 'Inscribirme',
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

export function getCapacityLabel(event = {}) {
  if (!event.capacity) {
    return `${event.registered || 0} inscritos`;
  }

  if (event.soldOut) {
    return `${event.registered || 0}/${event.capacity} inscritos`;
  }

  return `${event.availableSlots || 0} cupos disponibles`;
}
