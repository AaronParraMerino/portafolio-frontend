import { useCallback, useEffect, useState } from 'react';
import {
  fetchDashboardSummary,
  getCachedDashboardSummary,
  getEmptyDashboardSummary,
} from '../services/dashboardSummaryService';
import { DASHBOARD_CACHE_INVALIDATED_EVENT } from '../services/dashboardCache';

let summaryCache = getCachedDashboardSummary();
let summaryRequest = null;

function getInitialSummary() {
  summaryCache = getCachedDashboardSummary();
  return summaryCache || getEmptyDashboardSummary();
}

export function useDashboardSummary(reloadKey = '') {
  const [summary, setSummary] = useState(getInitialSummary);
  const [loading, setLoading] = useState(!summaryCache);
  const [error, setError] = useState(null);

  const reload = useCallback(async ({ force = false } = {}) => {
    setError(null);

    if (!summaryCache) {
      setLoading(true);
    }

    try {
      if (!summaryRequest || force) {
        summaryRequest = fetchDashboardSummary({ force })
          .then((data) => {
            summaryCache = data;
            return data;
          })
          .finally(() => {
            summaryRequest = null;
          });
      }

      const data = await summaryRequest;
      setSummary(data);
      return data;
    } catch (err) {
      setError(err.message || 'No se pudo cargar el resumen del dashboard.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload({ force: Boolean(summaryCache) });
  }, [reload, reloadKey]);

  useEffect(() => {
    const handleCacheInvalidated = () => {
      summaryCache = null;
      summaryRequest = null;
      reload({ force: true });
    };

    window.addEventListener(DASHBOARD_CACHE_INVALIDATED_EVENT, handleCacheInvalidated);
    return () => window.removeEventListener(DASHBOARD_CACHE_INVALIDATED_EVENT, handleCacheInvalidated);
  }, [reload]);

  return {
    ...summary,
    loading,
    error,
    reload,
  };
}
