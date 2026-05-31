import { useEffect, useState } from 'react';
import { EMPTY_VIEW } from '../../../dashboard/view/model/viewModel';
import { useLanguage } from '../../../../core/i18n';
import {
  clearCachedPublicPortfolio,
  getPublicPortfolio,
  loadCachedPublicPortfolio,
} from '../services/portfolioService';

export function usePublicPortfolio(userId) {
  const { t } = useLanguage();
  const [state, setState] = useState({
    data: EMPTY_VIEW,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;

    if (!userId) {
      setState({
        data: EMPTY_VIEW,
        loading: false,
        error: t('publicPortfolio.error.notFound'),
      });

      return () => {
        active = false;
      };
    }

    const cached = loadCachedPublicPortfolio(userId);

    setState({
      data: cached || EMPTY_VIEW,
      loading: !cached,
      error: null,
    });

    getPublicPortfolio(userId, { force: false })
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

        const unavailable = error?.status === 403 || error?.status === 404;

        setState((prev) => ({
          data: unavailable ? EMPTY_VIEW : prev.data,
          loading: false,
          error: unavailable
            ? t('publicPortfolio.error.unavailable')
            : (error?.message || t('publicPortfolio.error.load')),
        }));
      });

    return () => {
      active = false;
    };
  }, [userId, t]);

  return state;
}
