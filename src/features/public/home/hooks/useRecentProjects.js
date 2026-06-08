import { useEffect, useState } from 'react';
import {
  getCachedRecentProjects,
  getRecentProjects,
} from '../services/homePortfolioService';

const EMPTY_STATE = {
  hero: [],
  recientes: [],
  meta: {},
};

export default function useRecentProjects() {
  const cached = getCachedRecentProjects();
  const [data, setData] = useState(cached || EMPTY_STATE);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getRecentProjects()
      .then((nextData) => {
        if (!active) return;
        setData({ ...EMPTY_STATE, ...nextData });
        setError('');
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError?.message || 'No se pudieron cargar los proyectos recientes.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return {
    ...data,
    loading,
    error,
  };
}
