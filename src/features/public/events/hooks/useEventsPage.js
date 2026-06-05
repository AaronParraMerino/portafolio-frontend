import { useEffect, useMemo, useState } from 'react';
import {
  EVENTS_LIST_PAGE_SIZE,
  getCachedHomeEvents,
  getCurrentEventsUser,
  getHomeEvents,
  registerHomeEvent,
  sortEventsForHighlights,
} from '../../home/services/homeEventsService';

const initialState = {
  events: [],
  pagination: {
    pagina_actual: 1,
    por_pagina: EVENTS_LIST_PAGE_SIZE,
    total: 0,
    ultima_pagina: 1,
    desde: null,
    hasta: null,
  },
};

function normalizePagination(pagination = {}, page = 1) {
  return {
    ...initialState.pagination,
    ...pagination,
    pagina_actual: Number(pagination.pagina_actual || pagination.current_page || page),
    por_pagina: Number(pagination.por_pagina || pagination.per_page || EVENTS_LIST_PAGE_SIZE),
    total: Number(pagination.total || 0),
    ultima_pagina: Number(pagination.ultima_pagina || pagination.last_page || 1),
  };
}

function getInitialPage(page) {
  try {
    const cached = getCachedHomeEvents({
      allowStale: true,
      page,
      perPage: EVENTS_LIST_PAGE_SIZE,
      scope: 'events-page',
    });

    if (!cached?.value) return initialState;

    return {
      ...initialState,
      ...cached.value,
      pagination: normalizePagination(cached.value.pagination, page),
    };
  } catch {
    return initialState;
  }
}

export default function useEventsPage() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState(() => getInitialPage(1));
  const [loading, setLoading] = useState(() => getInitialPage(1).events.length === 0);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [registeringId, setRegisteringId] = useState(null);
  const [authRequired, setAuthRequired] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadPage() {
      let cached = null;

      try {
        getCurrentEventsUser();
        cached = getCachedHomeEvents({
          allowStale: true,
          page,
          perPage: EVENTS_LIST_PAGE_SIZE,
          scope: 'events-page',
        });

        if (cached?.value && mounted) {
          setData({
            ...initialState,
            ...cached.value,
            pagination: normalizePagination(cached.value.pagination, page),
          });
          setLoading(false);
        }

        const result = await getHomeEvents({
          page,
          perPage: EVENTS_LIST_PAGE_SIZE,
          scope: 'events-page',
        });

        if (mounted) {
          setData({
            ...initialState,
            ...result,
            pagination: normalizePagination(result.pagination, page),
          });
          setAuthRequired(false);
          setError('');
        }
      } catch (err) {
        if (!mounted) return;

        const message = err?.message || 'No se pudieron cargar los eventos.';
        const isAuthError = message.toLowerCase().includes('sesion')
          || message.toLowerCase().includes('autentic')
          || message.toLowerCase().includes('no autorizado');

        setAuthRequired(isAuthError);
        if (!cached?.value) {
          setError(isAuthError ? '' : message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    setLoading(true);
    loadPage();

    return () => {
      mounted = false;
    };
  }, [page]);

  const events = useMemo(() => sortEventsForHighlights(data.events), [data.events]);
  const pagination = useMemo(
    () => normalizePagination(data.pagination, page),
    [data.pagination, page],
  );

  const register = async (event) => {
    if (!event?.id) return null;

    setRegisteringId(event.id);
    setNotice('');
    setError('');

    try {
      const payload = await registerHomeEvent(event.id, {
        page,
        perPage: EVENTS_LIST_PAGE_SIZE,
        scope: 'events-page',
      });

      if (payload?.refreshed) {
        setData({
          ...initialState,
          ...payload.refreshed,
          pagination: normalizePagination(payload.refreshed.pagination, page),
        });
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

  const refresh = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await getHomeEvents({
        force: true,
        page,
        perPage: EVENTS_LIST_PAGE_SIZE,
        scope: 'events-page',
      });

      setData({
        ...initialState,
        ...result,
        pagination: normalizePagination(result.pagination, page),
      });
      setNotice('Eventos actualizados.');
    } catch (err) {
      setError(err?.message || 'No se pudieron actualizar los eventos.');
    } finally {
      setLoading(false);
    }
  };

  return {
    authRequired,
    error,
    events,
    goToPage: setPage,
    loading,
    notice,
    page,
    pagination,
    refresh,
    register,
    registeringId,
    setNotice,
  };
}
