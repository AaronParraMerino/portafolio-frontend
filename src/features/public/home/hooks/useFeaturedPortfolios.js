import { useEffect, useState } from 'react';
import {
  getCachedFeaturedPortfolios,
  getFeaturedPortfolios,
} from '../services/homePortfolioService';

const initialState = {
  ultimas_actualizaciones: [],
  mas_proyectos: [],
  mas_experiencia: [],
  mas_habilidades: [],
  resultados_busqueda: [],
  meta: {},
};

export default function useFeaturedPortfolios(search = '', options = {}) {
  const defaultErrorMessage = options.defaultErrorMessage || 'No se pudieron cargar los portafolios.';
  const getInitialSections = () => ({
    ...initialState,
    ...(getCachedFeaturedPortfolios(search) || {}),
  });

  const [sections, setSections] = useState(getInitialSections);
  const [loading, setLoading] = useState(() => !getCachedFeaturedPortfolios(search));
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const cached = getCachedFeaturedPortfolios(search);

    if (cached) {
      setSections({ ...initialState, ...cached });
      setLoading(false);
    }

    async function loadPortfolios() {
      try {
        setLoading(!cached);
        const data = await getFeaturedPortfolios(search, { force: false });
        if (mounted) {
          setSections({ ...initialState, ...data });
          setError('');
        }
      } catch (err) {
        if (mounted) {
          setError(err?.message || defaultErrorMessage);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadPortfolios();

    return () => {
      mounted = false;
    };
  }, [search, defaultErrorMessage]);

  return { sections, loading, error };
}
