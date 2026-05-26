import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'creafolio_calendar_events_v1';

function todayISO() {
  return toISODate(new Date());
}

function initialMockEvents(today) {
  const tomorrow = addDays(today, 1);
  const nextWeek = addDays(today, 7);

  return [
    {
      id: 'demo-1',
      titulo: 'Reunión de Sprint',
      descripcion: 'Revisión de avances con el equipo y pendientes para QA.',
      fecha: today,
      hora: '10:00',
      tipo: 'Trabajo',
    },
    {
      id: 'demo-2',
      titulo: 'Entrega de informe individual',
      descripcion: 'Subir evidencias, pruebas unitarias y descripción de actividades.',
      fecha: today,
      hora: '18:00',
      tipo: 'Académico',
    },
    {
      id: 'demo-3',
      titulo: 'Revisión de portafolio',
      descripcion: 'Verificar diseño, cards y datos visibles del portafolio público.',
      fecha: tomorrow,
      hora: '16:30',
      tipo: 'Reunión',
    },
    {
      id: 'demo-4',
      titulo: 'Demo con QA',
      descripcion: 'Presentar flujo de calendario y validaciones principales.',
      fecha: nextWeek,
      hora: '09:30',
      tipo: 'Entrega',
    },
  ];
}

function readStoredEvents(today) {
  if (typeof window === 'undefined') return initialMockEvents(today);

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return initialMockEvents(today);

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : initialMockEvents(today);
  } catch {
    return initialMockEvents(today);
  }
}

export default function useCalendarEvents() {
  const today = useMemo(() => todayISO(), []);
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState(() => readStoredEvents(today));
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const [year, month] = today.split('-').map(Number);
    return new Date(year, month - 1, 1);
  });
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [editingEvent, setEditingEvent] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    if (!feedback) return undefined;
    const timer = setTimeout(() => setFeedback(''), 3200);
    return () => clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    if (!open) return;

    const [year, month] = today.split('-').map(Number);
    setSelectedDate(today);
    setCurrentMonth(new Date(year, month - 1, 1));
    setFormOpen(false);
    setEditingEvent(null);
    setFormMode('create');
    setFeedback('');
  }, [open, today]);

  const eventDates = useMemo(() => new Set(events.map((event) => event.fecha)), [events]);

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
      setFeedback('Fecha pasada seleccionada. Los eventos quedan solo como historial.');
    }

    return true;
  };

  const openCreate = (date = selectedDate) => {
    if (date < today) {
      setFeedback('No se pueden crear eventos en fechas pasadas.');
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
      setFeedback('No se pueden editar eventos de fechas pasadas. Este evento queda como historial.');
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
      event.id !== editingEvent?.id
    ))
  );

  const saveEvent = (payload) => {
    if (editingEvent?.fecha < today) {
      const message = 'No se puede modificar un evento de una fecha pasada.';
      setFeedback(message);
      return { ok: false, message };
    }

    if (payload.fecha < today) {
      const message = 'La fecha del evento no puede ser anterior a la fecha actual.';
      setFeedback(message);
      return { ok: false, message };
    }

    if (hasTimeConflict(payload)) {
      const message = 'Ya existe un evento registrado para esta fecha y hora. Cambia la hora o selecciona otra fecha.';
      setFeedback(message);
      return { ok: false, message };
    }

    if (editingEvent) {
      setEvents((prev) => prev.map((event) => (
        event.id === editingEvent.id
          ? { ...event, ...payload }
          : event
      )));
      setSelectedDate(payload.fecha);
      setFeedback('Evento actualizado correctamente.');
    } else {
      const newEvent = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        ...payload,
      };
      setEvents((prev) => [newEvent, ...prev]);
      setSelectedDate(payload.fecha);
      setFeedback('Evento creado correctamente.');
    }

    closeForm();
    return true;
  };

  const deleteEvent = (eventToDelete) => {
    if (!eventToDelete) return false;

    if (eventToDelete.fecha < today) {
      setFeedback('No se pueden eliminar eventos de fechas pasadas. Este evento queda como historial.');
      return false;
    }

    setEvents((prev) => prev.filter((event) => event.id !== eventToDelete.id));
    setFeedback('Evento eliminado correctamente.');
    return true;
  };

  const deleteEventsByDate = (date) => {
    if (date < today) {
      setFeedback('No se pueden eliminar eventos de fechas pasadas. Estos eventos quedan como historial.');
      return false;
    }

    const amount = events.filter((event) => event.fecha === date).length;
    setEvents((prev) => prev.filter((event) => event.fecha !== date));
    setFeedback(`${amount} ${amount === 1 ? 'evento eliminado' : 'eventos eliminados'} correctamente.`);
    closeForm();
    return true;
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
    goPrevMonth,
    goNextMonth,
    selectDate,
    openCreate,
    openEdit,
    closeForm,
    saveEvent,
    deleteEvent,
    deleteEventsByDate,
  };
}

function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(isoDate, amount) {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + amount);
  return toISODate(date);
}
