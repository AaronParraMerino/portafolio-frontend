import { useEffect, useState } from 'react';
import { getFeaturedPortfolios } from '../services/homePortfolioService';

const initialState = {
  ultimas_actualizaciones: [],
  mas_proyectos: [],
  mas_experiencia: [],
  mas_habilidades: [],
  resultados_busqueda: [],
  meta: {},
};

export default function useFeaturedPortfolios(search = '') {
  const [sections, setSections] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadPortfolios() {
      try {
        setLoading(true);
        const data = await getFeaturedPortfolios(search);
        if (mounted) {
          setSections({ ...initialState, ...data });
          setError('');
        }
      } catch (err) {
        if (mounted) {
          setError(err?.message || 'No se pudieron cargar los portafolios.');
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
  }, [search]);

  return { sections, loading, error };
}
