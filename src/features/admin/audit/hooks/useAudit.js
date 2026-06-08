import { useEffect, useMemo, useState } from 'react';
import {
  AUDIT_PAGE_SIZE,
  createAuditShell,
  fetchAuditLogs,
  matchesActionGroup,
} from '../services/auditService';

const DEFAULT_FILTERS = {
  q: '',
  module: 'todos',
  actionGroup: 'todos',
  from: '',
  to: '',
  page: 1,
  per_page: AUDIT_PAGE_SIZE,
};

export function useAuditLogs() {
  const [state, setState] = useState(createAuditShell);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadAuditLogs() {
      setLoading(true);
      setErrorMessage('');

      try {
        const payload = await fetchAuditLogs({
          q: filters.q,
          module: filters.module,
          from: filters.from,
          to: filters.to,
          page: filters.page,
          per_page: filters.per_page,
        });

        if (!ignore) {
          setState(payload);
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error.message || 'No se pudo cargar la bitacora administrativa.');
          setState(createAuditShell());
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadAuditLogs();

    return () => {
      ignore = true;
    };
  }, [filters.from, filters.module, filters.page, filters.per_page, filters.q, filters.to, reloadKey]);

  const visibleItems = useMemo(
    () => state.items.filter((item) => matchesActionGroup(item.action, filters.actionGroup)),
    [filters.actionGroup, state.items],
  );

  const updateFilter = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
      page: key === 'page' ? value : 1,
    }));
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const refresh = () => {
    setReloadKey((value) => value + 1);
  };

  return {
    ...state,
    filters,
    availableFilters: state.filters,
    loading,
    errorMessage,
    selectedLog,
    visibleItems,
    hasActiveFilters: Boolean(filters.q || filters.module !== 'todos' || filters.actionGroup !== 'todos' || filters.from || filters.to),
    setSelectedLog,
    updateFilter,
    clearFilters,
    refresh,
  };
}
