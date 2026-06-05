import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  EventDetailModal,
  EventHeroBanner,
  EventsCarousel,
} from './events';
import useHomeEvents from '../hooks/useHomeEvents';

export default function HomeEventsSection() {
  const {
    authAvailable,
    carousel,
    error,
    events,
    highlighted,
    loading,
    notice,
    register,
    registeringId,
    setNotice,
  } = useHomeEvents();
  const [selectedEvent, setSelectedEvent] = useState(null);

  if (!authAvailable) return null;
  if (!events.length && loading) return null;
  if (!events.length && !loading) return null;

  const handleRegister = async (event) => {
    const result = await register(event);

    if (result?.refreshed && selectedEvent) {
      const updated = result.refreshed.events.find((item) => String(item.id) === String(selectedEvent.id));
      if (updated) setSelectedEvent(updated);
    }
  };

  return (
    <>
      <section className="evh-section" id="eventos-home">
        <div className="evh-section-inner">
          <div className="evh-section-header">
            <div>
              <div className="evh-section-kicker">Eventos</div>
              <h2>Eventos proximos</h2>
              <p>
                Talleres, ferias y convocatorias visibles para tu perfil.
              </p>
            </div>

            <Link className="evh-section-link" to="/eventos">
              Ver todos
            </Link>
          </div>

          {(notice || error) && (
            <div className={`evh-section-message${error ? ' is-error' : ''}`} role="status">
              <span>{error || notice}</span>
              {notice && (
                <button type="button" onClick={() => setNotice('')} aria-label="Cerrar mensaje">
                  Cerrar
                </button>
              )}
            </div>
          )}

          <EventHeroBanner
            events={highlighted}
            onRegister={handleRegister}
            onViewDetails={setSelectedEvent}
            registeringId={registeringId}
          />

          <EventsCarousel
            events={carousel}
            onRegister={handleRegister}
            onViewDetails={setSelectedEvent}
            registeringId={registeringId}
          />
        </div>
      </section>

      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onRegister={handleRegister}
        registering={String(registeringId || '') === String(selectedEvent?.id || '')}
      />
    </>
  );
}
