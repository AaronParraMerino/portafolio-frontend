import { useEffect, useState } from 'react';
import { EMPTY_VIEW } from '../../../dashboard/view/model/viewModel';
import {
  clearCachedPublicPortfolio,
  getPublicPortfolio,
  loadCachedPublicPortfolio,
} from '../services/portfolioService';

export function usePublicPortfolio(userId) {
  const [state, setState] = useState({
    data: EMPTY_VIEW,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    const cached = loadCachedPublicPortfolio(userId);

    setState({
      data: cached || EMPTY_VIEW,
      loading: !cached,
      error: null,
    });

    getPublicPortfolio(userId)
      .then((data) => {
        if (!active) return;

        setState({
          data,
          loading: false,
          error: null,
        });
      })
      .catch((error) => {
        if (!active) return;

        if (error?.status === 403 || error?.status === 404) {
          clearCachedPublicPortfolio(userId);
        }

        setState((prev) => ({
          data: (error?.status === 403 || error?.status === 404) ? EMPTY_VIEW : prev.data,
          loading: false,
          error: error?.message || 'No se pudo cargar el portafolio.',
        }));
      });

    return () => {
      active = false;
    };
  }, [userId]);

  return state;
}
