import { useEffect, useState } from 'react';
import { EMPTY_VIEW } from '../../../dashboard/view/model/viewModel';
import {
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

        setState((prev) => ({
          ...prev,
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
