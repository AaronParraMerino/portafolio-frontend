import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  EventDetailModal,
  EventsCarousel,
} from './events';

export default function HomeEventsSection({ eventsState }) {
  const {
    carousel,
    error,
    events,
    loading,
    notice,
    register,
    registeringId,
    setNotice,
  } = eventsState;
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();

  if (!events.length && loading) return null;
  if (!events.length && !loading) return null;
  if (!carousel.length && !notice && !error) return null;

  const handleRegister = async (event) => {
    if (event?.requiresLogin) {
      navigate('/auth/login', { state: { from: '/' } });
      return;
    }

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

          <EventsCarousel
            events={carousel}
            showAllPath="/eventos"
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
