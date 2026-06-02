// src/features/calendar/hooks/useCalendarEvents.js

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../../core/i18n';
import {
  createCalendarEvent,
  deleteCalendarEvent,
  deleteCalendarEventsByDate,
  getCalendarEvents,
  updateCalendarEvent,
} from '../services/calendarService';

const OLD_STORAGE_KEY = 'creafolio_calendar_events_v1';

function todayISO() {
  return toISODate(new Date());
}

function getMonthDateFromISO(isoDate) {
  const [year, month] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, 1);
}

function getEventId(event) {
  return event?.id_evento ?? event?.id ?? event?.uuid;
}

function getCalendarErrorMessage(error, t) {
  const payload = error?.payload || {};
  const errors = payload?.errors || {};
  const rawMessage = [
    payload?.message,
    error?.message,
    ...Object.values(errors).flat(),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (
    errors.fecha ||
    rawMessage.includes('fecha field must be a date after') ||
    rawMessage.includes('date after or equal to today') ||
    rawMessage.includes('fecha no puede ser anterior')
  ) {
    return t('calendar.validation.noPastDate');
  }

  if (errors.hora || rawMessage.includes('hora')) {
    return t('calendar.validation.timeRequired');
  }

  if (errors.titulo || rawMessage.includes('titulo') || rawMessage.includes('title')) {
    return t('calendar.validation.titleRequired');
  }

  if (
    rawMessage.includes('ya existe') ||
    rawMessage.includes('already exists') ||
    rawMessage.includes('misma fecha y hora')
  ) {
    return t('calendar.feedback.timeConflict');
  }

  return t('calendar.validation.saveGeneric');
}

export default function useCalendarEvents() {
  const { t } = useLanguage();

  const today = useMemo(() => todayISO(), []);
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(() => getMonthDateFromISO(today));
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [editingEvent, setEditingEvent] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const loadEvents = useCallback(async ({ silent = false } = {}) => {
    if (!open) return;

    if (!silent) {
      setLoading(true);
    }

    try {
      const backendEvents = await getCalendarEvents();
      setEvents(backendEvents);
    } catch (error) {
      setFeedback(error.message || t('calendar.validation.saveShort'));

      // Importante:
      // No limpiamos events aquí para evitar que los eventos cargados desaparezcan
      // si el backend tarda, falla o devuelve un error temporal.
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [open, t]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(OLD_STORAGE_KEY);
  }, []);

  useEffect(() => {
    if (!feedback) return undefined;

    const timer = setTimeout(() => {
      setFeedback('');
    }, 3200);

    return () => clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    if (!open) return;

    setSelectedDate(today);
    setCurrentMonth(getMonthDateFromISO(today));
    setFormOpen(false);
    setEditingEvent(null);
    setFormMode('create');
    setFeedback('');
  }, [open, today]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const eventDates = useMemo(() => (
    new Set(events.map((event) => event.fecha))
  ), [events]);

  const selectedEvents = useMemo(() => (
    events
      .filter((event) => event.fecha === selectedDate)
      .sort((a, b) => String(a.hora).localeCompare(String(b.hora)))
  ), [events, selectedDate]);

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
      setFeedback(t('calendar.feedback.pastSelected'));
    }

    return true;
  };

  const openCreate = (date = selectedDate) => {
    if (date < today) {
      setFeedback(t('calendar.feedback.noCreatePast'));
      setFormOpen(false);
      return false;
    }

    setSelectedDate(date);
    setEditingEvent(null);
    setFormMode('create');
    setFormOpen(true);
    setFeedback('');

    return true;
  };

  const openEdit = (event) => {
    if (!event) return false;

    if (event.fecha < today) {
      setFeedback(t('calendar.feedback.noEditPast'));
      setFormOpen(false);
      setEditingEvent(null);
      setFormMode('create');
      return false;
    }

    setSelectedDate(event.fecha);
    setEditingEvent(event);
    setFormMode('edit');
    setFormOpen(true);
    setFeedback('');

    return true;
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingEvent(null);
    setFormMode('create');
  };

  const hasTimeConflict = (payload) => (
    events.some((event) => (
      event.fecha === payload.fecha &&
      event.hora === payload.hora &&
      getEventId(event) !== getEventId(editingEvent)
    ))
  );

  const saveEvent = async (payload) => {
    if (editingEvent?.fecha < today) {
      const message = t('calendar.feedback.noModifyPast');
      setFeedback(message);
      return { ok: false, message };
    }

    if (payload.fecha < today) {
      const message = t('calendar.feedback.eventDatePast');
      setFeedback(message);
      return { ok: false, message };
    }

    if (hasTimeConflict(payload)) {
      const message = t('calendar.feedback.timeConflict');
      setFeedback(message);
      return { ok: false, message };
    }

    try {
      if (editingEvent) {
        const eventId = getEventId(editingEvent);
        const updatedEvent = await updateCalendarEvent(eventId, payload);

        setEvents((prev) => prev.map((event) => (
          getEventId(event) === eventId ? updatedEvent : event
        )));

        setSelectedDate(updatedEvent.fecha || payload.fecha);
        setCurrentMonth(getMonthDateFromISO(updatedEvent.fecha || payload.fecha));
        setFeedback(t('calendar.feedback.updated'));
      } else {
        const newEvent = await createCalendarEvent(payload);

        setEvents((prev) => {
          const newId = getEventId(newEvent);
          const withoutDuplicate = prev.filter((event) => getEventId(event) !== newId);
          return [newEvent, ...withoutDuplicate];
        });

        setSelectedDate(newEvent.fecha || payload.fecha);
        setCurrentMonth(getMonthDateFromISO(newEvent.fecha || payload.fecha));
        setFeedback(t('calendar.feedback.created'));
      }

      closeForm();

      // Recargamos en segundo plano para sincronizar con backend,
      // pero sin borrar eventos si falla.
      loadEvents({ silent: true });

      return { ok: true };
    } catch (error) {
      const message = getCalendarErrorMessage(error, t);
      setFeedback(message);
      return { ok: false, message };
    }
  };

  const deleteEvent = async (eventToDelete) => {
    if (!eventToDelete) return false;

    if (eventToDelete.fecha < today) {
      setFeedback(t('calendar.feedback.noDeletePast'));
      return false;
    }

    try {
      await deleteCalendarEvent(getEventId(eventToDelete));

      setEvents((prev) => (
        prev.filter((event) => getEventId(event) !== getEventId(eventToDelete))
      ));

      setFeedback(t('calendar.feedback.deleted'));

      return true;
    } catch (error) {
      setFeedback(getCalendarErrorMessage(error, t));
      return false;
    }
  };

  const deleteEventsByDate = async (date) => {
    if (date < today) {
      setFeedback(t('calendar.feedback.noDeletePastMany'));
      return false;
    }

    const amount = events.filter((event) => event.fecha === date).length;

    try {
      await deleteCalendarEventsByDate(date);

      setEvents((prev) => prev.filter((event) => event.fecha !== date));

      setFeedback(
        amount === 1
          ? t('calendar.feedback.deletedOne')
          : t('calendar.feedback.deletedMany', { count: amount })
      );

      closeForm();

      return true;
    } catch (error) {
      setFeedback(error.message || t('calendar.validation.saveShort'));
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
    selectedEvents,
    formOpen,
    formMode,
    editingEvent,
    feedback,
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
    reloadEvents: loadEvents,
  };
}

function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}