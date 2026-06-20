import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  DEVELOPERS_PER_PAGE,
  getActiveDevelopers,
  getCachedActiveDevelopers,
  getDeveloperKey,
  hydrateDeveloperProjectCounts,
} from '../services/developersService';

const emptyMeta = {
  current_page: 1,
  last_page: 1,
  per_page: DEVELOPERS_PER_PAGE,
  total: 0,
};

const cleanText = (value) => String(value || '').trim();

const pageFromParams = (value) => {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
};

export default function useDevelopers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = cleanText(searchParams.get('q'));
  const initialPage = pageFromParams(searchParams.get('page'));
  const initialCached = getCachedActiveDevelopers({
    page: initialPage,
    perPage: DEVELOPERS_PER_PAGE,
    search: initialQuery,
  });

  const [query, setQuery] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);
  const [page, setPage] = useState(initialPage);
  const [developers, setDevelopers] = useState(() => initialCached?.items || []);
  const [meta, setMeta] = useState(() => initialCached?.meta || { ...emptyMeta, current_page: initialPage });
  const [loading, setLoading] = useState(() => !initialCached);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const syncUrl = (nextQuery, nextPage) => {
    const params = {};
    if (nextQuery) params.q = nextQuery;
    if (nextPage > 1) params.page = String(nextPage);
    setSearchParams(params);
  };

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const cached = getCachedActiveDevelopers({
      page,
      perPage: DEVELOPERS_PER_PAGE,
      search: submittedQuery,
    });

    if (cached && refreshKey === 0) {
      setDevelopers(cached.items || []);
      setMeta(cached.meta || { ...emptyMeta, current_page: page });
      setLoading(false);
    } else {
      setLoading(true);
    }
    setError('');

    getActiveDevelopers({
      page,
      perPage: DEVELOPERS_PER_PAGE,
      search: submittedQuery,
      signal: controller.signal,
      force: refreshKey > 0,
    })
      .then((response) => {
        if (!active) return;
        setDevelopers(response.items || []);
        setMeta(response.meta || { ...emptyMeta, current_page: page });
        setLoading(false);

        hydrateDeveloperProjectCounts(response.items || [], {
          signal: controller.signal,
          onUpdate: (id, total) => {
            if (!active) return;

            setDevelopers((current) => current.map((developer) => (
              getDeveloperKey(developer) === id
                ? {
                    ...developer,
                    total_proyectos: Math.max(Number(developer.total_proyectos || 0), Number(total || 0)),
                  }
                : developer
            )));
          },
        }).catch((err) => {
          if (err?.name !== 'AbortError') {
            console.warn('No se pudo hidratar el conteo de proyectos.', err);
          }
        });
      })
      .catch((err) => {
        if (!active || err?.name === 'AbortError') return;
        if (!cached) {
          setDevelopers([]);
          setMeta({ ...emptyMeta, current_page: page });
        }
        setError(err?.message || 'No se pudieron cargar los desarrolladores.');
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, submittedQuery, refreshKey]);

  const search = () => {
    const nextQuery = cleanText(query);
    setSubmittedQuery(nextQuery);
    setPage(1);
    syncUrl(nextQuery, 1);
  };

  const clearSearch = () => {
    setQuery('');
    setSubmittedQuery('');
    setPage(1);
    syncUrl('', 1);
  };

  const goToPage = (nextPage) => {
    const lastPage = Number(meta?.last_page || 1);
    const safePage = Math.min(Math.max(1, Number(nextPage) || 1), Math.max(1, lastPage));
    setPage(safePage);
    syncUrl(submittedQuery, safePage);
  };

  const refresh = () => setRefreshKey((value) => value + 1);

  const summary = useMemo(() => {
    const currentPage = Number(meta?.current_page || page || 1);
    const perPage = Number(meta?.per_page || DEVELOPERS_PER_PAGE);
    const total = Number(meta?.total || developers.length);
    const from = total === 0 ? 0 : ((currentPage - 1) * perPage) + 1;
    const to = Math.min(total, from + developers.length - 1);

    return { currentPage, perPage, total, from, to };
  }, [developers.length, meta, page]);

  return {
    developers,
    meta,
    summary,
    loading,
    error,
    query,
    submittedQuery,
    setQuery,
    search,
    clearSearch,
    goToPage,
    refresh,
  };
}
