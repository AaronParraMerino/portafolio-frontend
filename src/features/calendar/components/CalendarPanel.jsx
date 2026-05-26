import { useRef, useState } from 'react';
import ConfirmModal from '../../../shared/ui/ConfirmModal';
import CalendarEventForm from './CalendarEventForm';
import CalendarEventList from './CalendarEventList';
import CalendarMonth from './CalendarMonth';
import CalendarToggle from './CalendarToggle';
import useCalendarEvents from '../hooks/useCalendarEvents';
import '../styles/calendar.css';

export default function CalendarPanel({ enabled = true }) {
  const formRef = useRef(null);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleteDayRequest, setDeleteDayRequest] = useState(null);

  const {
    open,
    setOpen,
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
  } = useCalendarEvents();

  if (!enabled) return null;

  const selectedDateIsPast = selectedDate < today;

  const scrollToForm = () => {
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleToggle = () => setOpen((value) => !value);

  const handleNewEvent = () => {
    if (openCreate(selectedDate)) scrollToForm();
  };

  const handleSelectDate = (date) => {
    selectDate(date);
  };

  const handleEdit = (event) => {
    if (openEdit(event)) scrollToForm();
  };

  const handleAskDelete = (event) => {
    if (event.fecha < today) return;
    setEventToDelete(event);
  };

  const handleConfirmDelete = () => {
    if (!eventToDelete) return;
    deleteEvent(eventToDelete);
    setEventToDelete(null);
  };

  const handleAskDeleteDay = () => {
    if (!selectedEvents.length || selectedDateIsPast) return;
    setDeleteDayRequest({ date: selectedDate, count: selectedEvents.length });
  };

  const handleConfirmDeleteDay = () => {
    if (!deleteDayRequest) return;
    deleteEventsByDate(deleteDayRequest.date);
    setDeleteDayRequest(null);
  };

  return (
    <>
      <CalendarToggle open={open} onClick={handleToggle} />

      <aside className={`cal-panel${open ? ' is-open' : ''}`} aria-hidden={!open}>
        <header className="cal-panel-header">
          <div>
            <div className="cal-panel-title">Calendario personal</div>
            <div className="cal-panel-subtitle">Crea y gestiona eventos propios</div>
          </div>

          <button
            type="button"
            className="cal-panel-close"
            onClick={() => setOpen(false)}
            aria-label="Cerrar calendario"
          >
            ×
          </button>
        </header>

        <div className="cal-panel-scroll">
          <p className="cal-section-label">Calendario</p>

          <CalendarMonth
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            today={today}
            eventDates={eventDates}
            onPrevMonth={goPrevMonth}
            onNextMonth={goNextMonth}
            onSelectDate={handleSelectDate}
          />

          {feedback && <div className="cal-feedback">{feedback}</div>}

          <div className="cal-quick-actions">
            {selectedDateIsPast ? (
              <div className="cal-history-note">
                Fecha pasada: puedes consultar los eventos registrados, pero no crear, editar ni eliminar.
              </div>
            ) : (
              <button type="button" className="cal-btn cal-btn-primary" onClick={handleNewEvent}>
                Nuevo evento
              </button>
            )}
          </div>

          <div ref={formRef}>
            <CalendarEventForm
              open={formOpen}
              mode={formMode}
              selectedDate={selectedDate}
              today={today}
              editingEvent={editingEvent}
              onCancel={closeForm}
              onSubmit={saveEvent}
            />
          </div>

          <CalendarEventList
            selectedDate={selectedDate}
            today={today}
            events={selectedEvents}
            onCreate={handleNewEvent}
            onEdit={handleEdit}
            onDelete={handleAskDelete}
            onDeleteAll={handleAskDeleteDay}
          />
        </div>
      </aside>

      <ConfirmModal
        open={!!eventToDelete}
        title="¿Eliminar evento?"
        message={eventToDelete ? `Se eliminará el evento "${eventToDelete.titulo}". Esta acción no se puede deshacer.` : ''}
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        variant="red"
        icon="warning"
        onConfirm={handleConfirmDelete}
        onClose={() => setEventToDelete(null)}
      />

      <ConfirmModal
        open={!!deleteDayRequest}
        title="¿Eliminar eventos del día?"
        message={deleteDayRequest ? `Se eliminarán ${deleteDayRequest.count} eventos registrados para esta fecha. Esta acción no se puede deshacer.` : ''}
        confirmLabel="Sí, eliminar todos"
        cancelLabel="Cancelar"
        variant="red"
        icon="warning"
        onConfirm={handleConfirmDeleteDay}
        onClose={() => setDeleteDayRequest(null)}
      />
    </>
  );
}
