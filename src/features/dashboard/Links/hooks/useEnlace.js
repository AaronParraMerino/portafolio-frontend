import { useState, useEffect, useCallback } from 'react';
import {
  fetchEnlaces,
  getCachedEnlaces,
  postEnlace,
  putEnlace,
  patchVisibility,
  removeEnlace,
} from '../services/EnlaceService';
import { useLanguage } from '../../../../core/i18n';

function getInitialEnlaces() {
  try {
    return getCachedEnlaces();
  } catch {
    return [];
  }
}

export function useEnlace() {
  const { t } = useLanguage();
  const [redes,   setRedes]   = useState(getInitialEnlaces);
  const [loading, setLoading] = useState(() => getInitialEnlaces().length === 0);
  const [error,   setError]   = useState(null);

  // ── Cargar todos ────────────────────────────────
  const cargar = useCallback(async () => {
    const hasCache = getInitialEnlaces().length > 0;
    setLoading(!hasCache);
    setError(null);
    try {
      const data = await fetchEnlaces({ force: true });
      setRedes(data);
    } catch (err) {
      setError(err.message ?? t('links.error.load'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { cargar(); }, [cargar]);

  // ── Agregar ─────────────────────────────────────
  const agregar = async (nueva) => {
    try {
      const creada = await postEnlace(nueva);
      setRedes(prev => [...prev, creada]);
    } catch (err) {
      setError(err.message ?? t('links.error.create'));
    }
  };

  // ── Editar ──────────────────────────────────────
  const editar = async (actualizada) => {
    try {
      const result = await putEnlace(actualizada.id, actualizada);
      setRedes(prev => prev.map(r => r.id === actualizada.id ? { ...r, ...result } : r));
    } catch (err) {
      setError(err.message ?? t('links.error.edit'));
    }
  };

  // ── Toggle visibilidad (optimistic update) ──────
  const toggleVisible = async (id) => {
    const red = redes.find(r => r.id === id);
    if (!red) return;
    const nuevoVisible = !red.visible;
    setRedes(prev => prev.map(r => r.id === id ? { ...r, visible: nuevoVisible } : r));
    try {
      await patchVisibility(id, nuevoVisible);
    } catch (err) {
      // Revertir si falla
      setRedes(prev => prev.map(r => r.id === id ? { ...r, visible: red.visible } : r));
      setError(err.message ?? t('links.error.visibility'));
    }
  };

  // ── Eliminar ────────────────────────────────────
  const eliminar = async (id) => {
    try {
      await removeEnlace(id);
      setRedes(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setError(err.message ?? t('links.error.delete'));
    }
  };

  return {
    redes,
    loading,
    error,
    setError,
    cargar,
    agregar,
    editar,
    toggleVisible,
    eliminar,
  };
}
