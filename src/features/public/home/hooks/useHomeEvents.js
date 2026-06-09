import { useCallback, useEffect, useMemo, useState } from 'react';
import { HOME_EVENTS_INVALIDATED_EVENT } from '../services/homeEventsCache';
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

  const loadEvents = useCallback(async ({ force = false, showLoading = false } = {}) => {
    if (showLoading) {
      setLoading(true);
    }

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

      if (cached?.value) {
        setData({ ...initialState, ...cached.value });
        setLoading(false);
      }

      const result = authenticated ? await getHomeEvents({
        force,
        page: 1,
        perPage: HOME_EVENTS_PAGE_SIZE,
        scope: 'home',
      }) : await getPublicHomeEvents({
        force,
        page: 1,
        perPage: HOME_EVENTS_PAGE_SIZE,
        scope: 'home-public',
      });

      setData({ ...initialState, ...result });
      setError('');
      setAuthAvailable(authenticated);
    } catch (err) {
      const message = err?.message || 'No se pudieron cargar los eventos.';
      const isAuthError = message.toLowerCase().includes('sesion')
        || message.toLowerCase().includes('autentic')
        || message.toLowerCase().includes('no autorizado');

      setAuthAvailable(!isAuthError && authenticated);
      if (!cached?.value && !isAuthError) {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents({ force: true });

    const refreshEvents = () => {
      loadEvents({ force: true });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshEvents();
      }
    };

    window.addEventListener(HOME_EVENTS_INVALIDATED_EVENT, refreshEvents);
    window.addEventListener('focus', refreshEvents);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener(HOME_EVENTS_INVALIDATED_EVENT, refreshEvents);
      window.removeEventListener('focus', refreshEvents);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadEvents]);

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
