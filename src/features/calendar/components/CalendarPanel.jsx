import { useRef, useState } from 'react';
import ConfirmModal from '../../../shared/ui/ConfirmModal';
import { useLanguage } from '../../../core/i18n';
import CalendarEventForm from './CalendarEventForm';
import CalendarEventList from './CalendarEventList';
import CalendarMonth from './CalendarMonth';
import CalendarToggle from './CalendarToggle';
import useCalendarEvents from '../hooks/useCalendarEvents';
import '../styles/calendar.css';

export default function CalendarPanel({ enabled = true }) {
  const { t } = useLanguage();
  const formRef = useRef(null);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [eventToUnsubscribe, setEventToUnsubscribe] = useState(null);
  const [deleteDayRequest, setDeleteDayRequest] = useState(null);

  const {
    open,
    setOpen,
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
    unsubscribeEvent,
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
    if (event.fecha < today || event.origen === 'inscrito') return;
    setEventToDelete(event);
  };

  const handleConfirmDelete = () => {
    if (!eventToDelete) return;
    deleteEvent(eventToDelete);
    setEventToDelete(null);
  };

  const handleAskUnsubscribe = (event) => {
    if (!event || event.origen !== 'inscrito') return;
    setEventToUnsubscribe(event);
  };

  const handleConfirmUnsubscribe = () => {
    if (!eventToUnsubscribe) return;
    unsubscribeEvent(eventToUnsubscribe);
    setEventToUnsubscribe(null);
  };

  const handleAskDeleteDay = () => {
    if (!selectedPersonalEvents.length || selectedDateIsPast) return;
    setDeleteDayRequest({ date: selectedDate, count: selectedPersonalEvents.length });
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
            <div className="cal-panel-title">{t('calendar.panel.title')}</div>
            <div className="cal-panel-subtitle">{t('calendar.panel.subtitle')}</div>
          </div>

          <button
            type="button"
            className="cal-panel-close"
            onClick={() => setOpen(false)}
            aria-label={t('calendar.panel.closeAria')}
          >
            ×
          </button>
        </header>

        <div className="cal-panel-scroll">
          <p className="cal-section-label">{t('calendar.panel.sectionLabel')}</p>

          <CalendarMonth
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            today={today}
            eventDates={eventDates}
            eventDateMeta={eventDateMeta}
            onPrevMonth={goPrevMonth}
            onNextMonth={goNextMonth}
            onSelectDate={handleSelectDate}
          />

          {feedback && <div className="cal-feedback">{feedback}</div>}

          <div className="cal-quick-actions">
            {selectedDateIsPast ? (
              <div className="cal-history-note">
                {t('calendar.history.note')}
              </div>
            ) : (
              <button type="button" className="cal-btn cal-btn-primary" onClick={handleNewEvent}>
                {t('calendar.actions.newEvent')}
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
            onUnsubscribe={handleAskUnsubscribe}
          />
        </div>
      </aside>

      <ConfirmModal
        open={!!eventToDelete}
        title={t('calendar.confirm.deleteTitle')}
        message={eventToDelete ? t('calendar.confirm.deleteMessage', { title: eventToDelete.titulo }) : ''}
        confirmLabel={t('calendar.confirm.deleteConfirm')}
        cancelLabel={t('calendar.actions.cancel')}
        variant="red"
        icon="warning"
        onConfirm={handleConfirmDelete}
        onClose={() => setEventToDelete(null)}
      />

      <ConfirmModal
        open={!!eventToUnsubscribe}
        title={t('calendar.confirm.unsubscribeTitle')}
        message={eventToUnsubscribe ? t('calendar.confirm.unsubscribeMessage', { title: eventToUnsubscribe.titulo }) : ''}
        confirmLabel={t('calendar.confirm.unsubscribeConfirm')}
        cancelLabel={t('calendar.actions.cancel')}
        variant="red"
        icon="warning"
        onConfirm={handleConfirmUnsubscribe}
        onClose={() => setEventToUnsubscribe(null)}
      />

      <ConfirmModal
        open={!!deleteDayRequest}
        title={t('calendar.confirm.deleteDayTitle')}
        message={deleteDayRequest ? t('calendar.confirm.deleteDayMessage', { count: deleteDayRequest.count }) : ''}
        confirmLabel={t('calendar.confirm.deleteAllConfirm')}
        cancelLabel={t('calendar.actions.cancel')}
        variant="red"
        icon="warning"
        onConfirm={handleConfirmDeleteDay}
        onClose={() => setDeleteDayRequest(null)}
      />
    </>
  );
}
