// src/features/calendar/hooks/useCalendarEvents.js

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../../core/i18n';
import {
  createCalendarEvent,
  deleteCalendarEvent,
  deleteCalendarEventsByDate,
  getCalendarEvents,
  getSubscribedCalendarEvents,
  unsubscribeCalendarEvent,
  updateCalendarEvent,
} from '../services/calendarService';
import {
  CALENDAR_EVENTS_INVALIDATED_EVENT,
  readCalendarEventsCache,
  writeCalendarEventsCache,
} from '../services/calendarCache';

const OLD_STORAGE_KEY = 'creafolio_calendar_events_v1';
const FORM_DRAFT_STORAGE_KEY = 'creafolio_calendar_event_form_draft_v2';
const ORIGIN_PERSONAL = 'personal';
const ORIGIN_SUBSCRIBED = 'inscrito';

function todayISO() {
  return toISODate(new Date());
}


function getInitialFormDraft(today) {
  if (typeof window === 'undefined') return null;

  try {
    const rawDraft = window.localStorage.getItem(FORM_DRAFT_STORAGE_KEY);
    if (!rawDraft) return null;

    const draft = JSON.parse(rawDraft);
    const fecha = draft?.values?.fecha || '';

    if (today && fecha && fecha < today) {
      window.localStorage.removeItem(FORM_DRAFT_STORAGE_KEY);
      return null;
    }

    return draft;
  } catch (error) {
    window.localStorage.removeItem(FORM_DRAFT_STORAGE_KEY);
    return null;
  }
}

function getMonthDateFromISO(isoDate) {
  const [year, month] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, 1);
}

function getEventId(event) {
  return event?.id_evento ?? event?.id ?? event?.uuid;
}

function isSubscribedEvent(event) {
  return event?.origen === ORIGIN_SUBSCRIBED;
}

function getCalendarErrorKey(error) {
  const payload = error?.payload || {};
  const errors = payload?.errors || {};
  const rawMessage = [
    payload?.message,
    payload?.mensaje,
    error?.message,
    ...Object.values(errors).flat(),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (
    errors.fecha
    || rawMessage.includes('fecha field must be a date after')
    || rawMessage.includes('date after or equal to today')
    || rawMessage.includes('fecha no puede ser anterior')
  ) {
    return 'calendar.validation.noPastDate';
  }

  if (errors.hora || rawMessage.includes('hora')) {
    return 'calendar.validation.timeRequired';
  }

  if (errors.titulo || rawMessage.includes('titulo') || rawMessage.includes('title')) {
    return 'calendar.validation.titleRequired';
  }

  if (
    rawMessage.includes('ya existe')
    || rawMessage.includes('already exists')
    || rawMessage.includes('misma fecha y hora')
  ) {
    return 'calendar.feedback.timeConflict';
  }

  if (
    rawMessage.includes('desinscrito')
    || rawMessage.includes('inscripción activa')
    || rawMessage.includes('inscripcion activa')
  ) {
    return 'calendar.feedback.unsubscribeError';
  }

  return 'calendar.validation.saveGeneric';
}

export default function useCalendarEvents() {
  const { t } = useLanguage();

  const today = useMemo(() => todayISO(), []);
  const [initialFormDraft] = useState(() => getInitialFormDraft(today));
  const initialDraftDate = initialFormDraft?.values?.fecha || today;
  const [draftRestorePending, setDraftRestorePending] = useState(() => !!initialFormDraft);
  const [open, setOpen] = useState(() => !!initialFormDraft);
  const [events, setEvents] = useState(() => readCalendarEventsCache()?.events || []);
  const [selectedDate, setSelectedDate] = useState(initialDraftDate);
  const [currentMonth, setCurrentMonth] = useState(() => getMonthDateFromISO(initialDraftDate));
  const [formOpen, setFormOpen] = useState(() => !!initialFormDraft);
  const [formMode, setFormMode] = useState('create');
  const [editingEvent, setEditingEvent] = useState(null);
  const [feedbackKey, setFeedbackKey] = useState('');
  const [feedbackParams, setFeedbackParams] = useState({});
  const [loading, setLoading] = useState(false);

  const showFeedback = useCallback((key, params = {}) => {
    setFeedbackKey(key);
    setFeedbackParams(params);
  }, []);

  const clearFeedback = useCallback(() => {
    setFeedbackKey('');
    setFeedbackParams({});
  }, []);

  const loadEvents = useCallback(async ({ silent = false } = {}) => {
    if (!open) return;

    const cached = readCalendarEventsCache();
    if (cached?.events) {
      setEvents(cached.events);
    }

    if (!silent) {
      setLoading(true);
    }

    try {
      const [personalEvents, subscribedEvents] = await Promise.all([
        getCalendarEvents(),
        getSubscribedCalendarEvents(),
      ]);

      const nextEvents = [
        ...personalEvents.map((event) => ({ ...event, origen: event.origen || ORIGIN_PERSONAL })),
        ...subscribedEvents,
      ];

      setEvents(nextEvents);
      writeCalendarEventsCache(nextEvents);
    } catch (error) {
      showFeedback(getCalendarErrorKey(error));
      // No limpiamos events para evitar que la lista desaparezca si el backend falla un momento.
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [open, showFeedback]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(OLD_STORAGE_KEY);
  }, []);

  useEffect(() => {
    if (!feedbackKey) return undefined;

    const timer = setTimeout(() => {
      clearFeedback();
    }, 3200);

    return () => clearTimeout(timer);
  }, [clearFeedback, feedbackKey]);

  useEffect(() => {
    if (!open) return;

    if (draftRestorePending) {
      setFormOpen(true);
      setEditingEvent(null);
      setFormMode('create');
      showFeedback('calendar.feedback.draftRestored');
      setDraftRestorePending(false);
      return;
    }

    setSelectedDate(today);
    setCurrentMonth(getMonthDateFromISO(today));
    setFormOpen(false);
    setEditingEvent(null);
    setFormMode('create');
    clearFeedback();
  }, [clearFeedback, draftRestorePending, open, showFeedback, today]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    const refreshEvents = () => {
      if (open) loadEvents({ silent: true });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshEvents();
      }
    };

    window.addEventListener(CALENDAR_EVENTS_INVALIDATED_EVENT, refreshEvents);
    window.addEventListener('focus', refreshEvents);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener(CALENDAR_EVENTS_INVALIDATED_EVENT, refreshEvents);
      window.removeEventListener('focus', refreshEvents);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadEvents, open]);

  const eventDateMeta = useMemo(() => {
    const map = new Map();

    events.forEach((event) => {
      if (!event.fecha) return;

      const current = map.get(event.fecha) || {
        total: 0,
        personal: false,
        subscribed: false,
        subscribedColors: [],
      };

      current.total += 1;

      if (isSubscribedEvent(event)) {
        current.subscribed = true;
        if (event.colorClass && !current.subscribedColors.includes(event.colorClass)) {
          current.subscribedColors.push(event.colorClass);
        }
      } else {
        current.personal = true;
      }

      map.set(event.fecha, current);
    });

    return map;
  }, [events]);

  const eventDates = useMemo(() => new Set(eventDateMeta.keys()), [eventDateMeta]);

  const selectedEvents = useMemo(() => (
    events
      .filter((event) => event.fecha === selectedDate)
      .sort((a, b) => String(a.hora).localeCompare(String(b.hora)))
  ), [events, selectedDate]);

  const selectedPersonalEvents = useMemo(() => (
    selectedEvents.filter((event) => !isSubscribedEvent(event))
  ), [selectedEvents]);

  const goPrevMonth = () => {
    setCurrentMonth((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1));
  };

  const goNextMonth = () => {
    setCurrentMonth((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1));
  };

  const selectDate = (date) => {
    setSelectedDate(date);

    const [year, month] = date.split('-').map(Number);
    setCurrentMonth(new Date(year, month - 1, 1));
    setFormOpen(false);
    setEditingEvent(null);
    setFormMode('create');

    if (date < today) {
      showFeedback('calendar.feedback.pastSelected');
    }

    return true;
  };

  const openCreate = (date = selectedDate) => {
    if (date < today) {
      showFeedback('calendar.feedback.noCreatePast');
      setFormOpen(false);
      return false;
    }

    setSelectedDate(date);
    setEditingEvent(null);
    setFormMode('create');
    setFormOpen(true);
    clearFeedback();

    return true;
  };

  const openEdit = (event) => {
    if (!event || isSubscribedEvent(event)) return false;

    if (event.fecha < today) {
      showFeedback('calendar.feedback.noEditPast');
      setFormOpen(false);
      setEditingEvent(null);
      setFormMode('create');
      return false;
    }

    setSelectedDate(event.fecha);
    setEditingEvent(event);
    setFormMode('edit');
    setFormOpen(true);
    clearFeedback();

    return true;
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingEvent(null);
    setFormMode('create');
  };

  const hasTimeConflict = (payload) => (
    events.some((event) => (
      event.fecha === payload.fecha
      && event.hora === payload.hora
      && getEventId(event) !== getEventId(editingEvent)
    ))
  );

  const saveEvent = async (payload) => {
    if (editingEvent?.fecha < today) {
      const key = 'calendar.feedback.noModifyPast';
      showFeedback(key);
      return { ok: false, message: t(key) };
    }

    if (payload.fecha < today) {
      const key = 'calendar.feedback.eventDatePast';
      showFeedback(key);
      return { ok: false, message: t(key) };
    }

    if (hasTimeConflict(payload)) {
      const key = 'calendar.feedback.timeConflict';
      showFeedback(key);
      return { ok: false, message: t(key) };
    }

    try {
      if (editingEvent) {
        const eventId = getEventId(editingEvent);
        const updatedEvent = await updateCalendarEvent(eventId, payload);

        setEvents((prev) => prev.map((event) => (
          getEventId(event) === eventId
            ? { ...updatedEvent, origen: ORIGIN_PERSONAL }
            : event
        )));

        setSelectedDate(updatedEvent.fecha || payload.fecha);
        setCurrentMonth(getMonthDateFromISO(updatedEvent.fecha || payload.fecha));
        showFeedback('calendar.feedback.updated');
      } else {
        const newEvent = await createCalendarEvent(payload);

        setEvents((prev) => {
          const newId = getEventId(newEvent);
          const withoutDuplicate = prev.filter((event) => getEventId(event) !== newId);
          return [{ ...newEvent, origen: ORIGIN_PERSONAL }, ...withoutDuplicate];
        });

        setSelectedDate(newEvent.fecha || payload.fecha);
        setCurrentMonth(getMonthDateFromISO(newEvent.fecha || payload.fecha));
        showFeedback('calendar.feedback.created');
      }

      closeForm();
      loadEvents({ silent: true });

      return { ok: true };
    } catch (error) {
      const key = getCalendarErrorKey(error);
      showFeedback(key);
      return { ok: false, message: t(key) };
    }
  };

  const deleteEvent = async (eventToDelete) => {
    if (!eventToDelete || isSubscribedEvent(eventToDelete)) return false;

    if (eventToDelete.fecha < today) {
      showFeedback('calendar.feedback.noDeletePast');
      return false;
    }

    try {
      await deleteCalendarEvent(getEventId(eventToDelete));

      setEvents((prev) => (
        prev.filter((event) => getEventId(event) !== getEventId(eventToDelete))
      ));

      showFeedback('calendar.feedback.deleted');

      return true;
    } catch (error) {
      showFeedback(getCalendarErrorKey(error));
      return false;
    }
  };

  const deleteEventsByDate = async (date) => {
    if (date < today) {
      showFeedback('calendar.feedback.noDeletePastMany');
      return false;
    }

    const amount = selectedPersonalEvents.filter((event) => event.fecha === date).length;

    if (!amount) {
      return false;
    }

    try {
      await deleteCalendarEventsByDate(date);

      setEvents((prev) => prev.filter((event) => (
        isSubscribedEvent(event) || event.fecha !== date
      )));

      showFeedback(
        amount === 1
          ? 'calendar.feedback.deletedOne'
          : 'calendar.feedback.deletedMany',
        amount === 1 ? {} : { count: amount }
      );

      closeForm();

      return true;
    } catch (error) {
      showFeedback(getCalendarErrorKey(error));
      return false;
    }
  };

  const unsubscribeEvent = async (eventToUnsubscribe) => {
    if (!eventToUnsubscribe || !isSubscribedEvent(eventToUnsubscribe)) return false;

    try {
      await unsubscribeCalendarEvent(eventToUnsubscribe.eventoId);

      setEvents((prev) => prev.filter((event) => (
        getEventId(event) !== getEventId(eventToUnsubscribe)
      )));

      showFeedback('calendar.feedback.unsubscribed');
      loadEvents({ silent: true });

      return true;
    } catch (error) {
      showFeedback(getCalendarErrorKey(error));
      return false;
    }
  };

  return {
    open,
    setOpen,
    events,
    currentMonth,
    selectedDate,
    today,
    eventDates,
    eventDateMeta,
    selectedEvents,
    selectedPersonalEvents,
    formOpen,
    formMode,
    editingEvent,
    feedback: feedbackKey ? t(feedbackKey, feedbackParams) : '',
    loading,
    goPrevMonth,
    goNextMonth,
    selectDate,
    openCreate,
    openEdit,
    closeForm,
    saveEvent,
    deleteEvent,
    deleteEventsByDate,
    unsubscribeEvent,
    reloadEvents: loadEvents,
  };
}

function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
