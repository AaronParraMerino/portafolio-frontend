import { useCallback, useEffect, useState } from 'react';
import {
  fetchDashboardSummary,
  getCachedDashboardSummary,
  getEmptyDashboardSummary,
} from '../services/dashboardSummaryService';

let summaryCache = getCachedDashboardSummary();
let summaryRequest = null;

function getInitialSummary() {
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
        summaryRequest = fetchDashboardSummary()
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

  return {
    ...summary,
    loading,
    error,
    reload,
  };
}
