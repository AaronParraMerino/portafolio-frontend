import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  EventDetailModal,
  EventHeroBanner,
  EventsCarousel,
} from './events';
import { hasActiveStoredSession } from '../../../../shared/utils/authStorage';

export default function HomeEventsSection({ eventsState }) {
  const {
    carousel,
    error,
    events,
    highlighted,
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
  if (!highlighted.length && !carousel.length && !notice && !error) return null;

  const redirectToLogin = () => {
    sessionStorage.setItem('auth:return-to', '/');
    navigate('/auth/login', { state: { from: '/' } });
  };

  const handleViewDetails = (event) => {
    if (!hasActiveStoredSession()) {
      redirectToLogin();
      return;
    }

    setSelectedEvent(event);
  };

  const handleRegister = async (event) => {
    if (!hasActiveStoredSession()) {
      redirectToLogin();
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

          <EventHeroBanner
            events={highlighted}
            onRegister={handleRegister}
            onViewDetails={handleViewDetails}
            registeringId={registeringId}
          />

          <EventsCarousel
            events={carousel}
            showAllPath="/eventos"
            onRegister={handleRegister}
            onViewDetails={handleViewDetails}
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
