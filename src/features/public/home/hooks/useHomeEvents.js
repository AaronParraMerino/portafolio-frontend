import { useEffect, useMemo, useState } from 'react';
import {
  HOME_EVENTS_PAGE_SIZE,
  getCachedHomeEvents,
  getCachedPublicHomeEvents,
  getCurrentEventsUser,
  getHomeEvents,
  getPublicHomeEvents,
  registerHomeEvent,
  splitHomeEvents,
} from '../services/homeEventsService';

const initialState = {
  events: [],
  pagination: {},
  message: '',
};

function getInitialEvents() {
  try {
    let cached;

    try {
      getCurrentEventsUser();
      cached = getCachedHomeEvents({
        allowStale: true,
        page: 1,
        perPage: HOME_EVENTS_PAGE_SIZE,
        scope: 'home',
      });
    } catch {
      cached = getCachedPublicHomeEvents({
        allowStale: true,
        page: 1,
        perPage: HOME_EVENTS_PAGE_SIZE,
        scope: 'home-public',
      });
    }

    return cached?.value || initialState;
  } catch {
    return initialState;
  }
}

export default function useHomeEvents() {
  const [data, setData] = useState(getInitialEvents);
  const [loading, setLoading] = useState(() => getInitialEvents().events.length === 0);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [registeringId, setRegisteringId] = useState(null);
  const [authAvailable, setAuthAvailable] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadEvents() {
      let cached = null;
      let authenticated = true;

      try {
        getCurrentEventsUser();
      } catch {
        authenticated = false;
      }

      try {
        cached = authenticated ? getCachedHomeEvents({
          allowStale: true,
          page: 1,
          perPage: HOME_EVENTS_PAGE_SIZE,
          scope: 'home',
        }) : getCachedPublicHomeEvents({
          allowStale: true,
          page: 1,
          perPage: HOME_EVENTS_PAGE_SIZE,
          scope: 'home-public',
        });

        if (cached?.value && mounted) {
          setData({ ...initialState, ...cached.value });
          setLoading(false);
        }

        const result = authenticated ? await getHomeEvents({
          force: false,
          page: 1,
          perPage: HOME_EVENTS_PAGE_SIZE,
          scope: 'home',
        }) : await getPublicHomeEvents({
          force: false,
          page: 1,
          perPage: HOME_EVENTS_PAGE_SIZE,
          scope: 'home-public',
        });

        if (mounted) {
          setData({ ...initialState, ...result });
          setError('');
          setAuthAvailable(authenticated);
        }
      } catch (err) {
        if (!mounted) return;

        const message = err?.message || 'No se pudieron cargar los eventos.';
        const isAuthError = message.toLowerCase().includes('sesion')
          || message.toLowerCase().includes('autentic')
          || message.toLowerCase().includes('no autorizado');

        setAuthAvailable(!isAuthError && authenticated);
        if (!cached?.value && !isAuthError) {
          setError(message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      mounted = false;
    };
  }, []);

  const groups = useMemo(() => splitHomeEvents(data.events), [data.events]);

  const register = async (event) => {
    if (!event?.id) return null;

    setRegisteringId(event.id);
    setNotice('');
    setError('');

    try {
      const payload = await registerHomeEvent(event.id, {
        page: 1,
        perPage: HOME_EVENTS_PAGE_SIZE,
        scope: 'home',
      });

      if (payload?.refreshed) {
        setData({ ...initialState, ...payload.refreshed });
      }

      setNotice(payload?.mensaje || payload?.message || 'Inscripcion realizada.');
      return payload;
    } catch (err) {
      setError(err?.message || 'No se pudo inscribir al evento.');
      return null;
    } finally {
      setRegisteringId(null);
    }
  };

  return {
    authAvailable,
    carousel: groups.carousel,
    error,
    events: groups.all,
    highlighted: groups.highlighted,
    loading,
    notice,
    pagination: data.pagination,
    register,
    registeringId,
    setNotice,
  };
}
