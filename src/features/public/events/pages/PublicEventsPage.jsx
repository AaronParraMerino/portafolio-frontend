import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BsArrowClockwise, BsArrowLeft, BsCalendarEvent } from 'react-icons/bs';
import {
  EventCard,
  EventDetailModal,
} from '../../home/components/events';
import useEventsPage from '../hooks/useEventsPage';
import EventsPagination from '../components/EventsPagination';
import '../styles/publicEvents.css';

const skeletonItems = Array.from({ length: 6 }, (_, index) => index + 1);

export default function PublicEventsPage() {
  const {
    authRequired,
    error,
    events,
    goToPage,
    loading,
    notice,
    page,
    pagination,
    refresh,
    register,
    registeringId,
    setNotice,
  } = useEventsPage();
  const [selectedEvent, setSelectedEvent] = useState(null);

  const currentPage = pagination.pagina_actual || page;
  const lastPage = pagination.ultima_pagina || 1;
  const hasEvents = events.length > 0;
  const countLabel = loading
    ? 'Cargando eventos...'
    : pagination.total > 0
      ? `Mostrando ${pagination.desde || 1}-${pagination.hasta || events.length} de ${pagination.total}`
      : 'Sin eventos visibles';

  const handleRegister = async (event) => {
    const result = await register(event);

    if (result?.refreshed && selectedEvent) {
      const updated = result.refreshed.events.find((item) => String(item.id) === String(selectedEvent.id));
      if (updated) setSelectedEvent(updated);
    }
  };

  return (
    <main className="evtpub-page">
      <section className="evtpub-shell">
        <header className="evtpub-header">
          <div>
            <div className="evtpub-kicker">
              <BsCalendarEvent aria-hidden="true" />
              Eventos visibles
            </div>
            <h1>Todos los eventos</h1>
            <p>
              Revisa talleres, ferias y convocatorias disponibles para tu perfil.
            </p>
          </div>

          <div className="evtpub-header-actions">
            <button type="button" onClick={refresh} disabled={loading}>
              <BsArrowClockwise />
              Actualizar
            </button>
            <Link to="/">
              <BsArrowLeft />
              Volver al inicio
            </Link>
          </div>
        </header>

        <div className="evtpub-summary" aria-live="polite">
          <span>{countLabel}</span>
          <strong>Pagina {currentPage} de {lastPage}</strong>
        </div>

        {authRequired && (
          <div className="evtpub-state">
            <BsCalendarEvent aria-hidden="true" />
            <div>
              <strong>Inicia sesion para ver eventos</strong>
              <span>La lista usa tu perfil para mostrar eventos publicos y segmentados.</span>
            </div>
          </div>
        )}

        {(notice || error) && !authRequired && (
          <div className={`evtpub-message${error ? ' is-error' : ''}`} role={error ? 'alert' : 'status'}>
            <span>{error || notice}</span>
            {notice && (
              <button type="button" onClick={() => setNotice('')} aria-label="Cerrar mensaje">
                Cerrar
              </button>
            )}
          </div>
        )}

        <section className="evtpub-grid" aria-live="polite">
          {loading && skeletonItems.map((item) => (
            <div className="evtpub-skeleton" key={item}>
              <span />
              <span />
              <span />
            </div>
          ))}

          {!loading && !authRequired && !error && hasEvents && events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onRegister={handleRegister}
              onViewDetails={setSelectedEvent}
              registering={String(registeringId || '') === String(event.id)}
            />
          ))}
        </section>

        {!loading && !authRequired && !error && !hasEvents && (
          <div className="evtpub-state">
            <BsCalendarEvent aria-hidden="true" />
            <div>
              <strong>No hay eventos disponibles</strong>
              <span>Cuando existan eventos visibles para tu perfil apareceran aqui.</span>
            </div>
          </div>
        )}

        {!authRequired && !error && (
          <EventsPagination
            currentPage={currentPage}
            lastPage={lastPage}
            loading={loading}
            onPageChange={goToPage}
          />
        )}
      </section>

      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onRegister={handleRegister}
        registering={String(registeringId || '') === String(selectedEvent?.id || '')}
      />
    </main>
  );
}
