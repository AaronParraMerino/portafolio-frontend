// src/features/dashboard/view/hooks/useView.js

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_CONFIG, DEFAULT_VISIBILITY, EMPTY_VIEW } from '../model/viewModel';
import {
  clearStoredConfig,
  getPortfolioViewData,
  loadCachedPortfolioViewData,
  mapConfigFromBackend,
  mapConfigToBackend,
  normalizeConfig as normalizeServiceConfig,
  publicarPortafolio,
  saveConfig,
} from '../services/viewService';

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

function mergeVisibility(current = {}) {
  return {
    perfil: {
      ...DEFAULT_VISIBILITY.perfil,
      ...(current.perfil || {}),
    },
    stats: {
      ...DEFAULT_VISIBILITY.stats,
      ...(current.stats || {}),
    },
    habilidades: {
      ...(current.habilidades || {}),
    },
    experiencias: {
      ...(current.experiencias || {}),
    },
    proyectos: {
      ...(current.proyectos || {}),
    },
    proyecto_detalles: {
      ...DEFAULT_VISIBILITY.proyecto_detalles,
      ...(current.proyecto_detalles || {}),
    },
  };
}

function normalizeConfig(config = {}) {
  return normalizeServiceConfig({
    ...DEFAULT_CONFIG,
    ...config,
    visibilidad: mergeVisibility(config.visibilidad),
  });
}

function normalizeViewData(patch = {}, previous = clone(EMPTY_VIEW)) {
  const has = (key) => Object.prototype.hasOwnProperty.call(patch, key);
  const next = {
    ...previous,
    perfil: has('perfil') ? patch.perfil : previous.perfil,
    redes: has('redes') ? patch.redes : (previous.redes ?? []),
    stats: has('stats') ? patch.stats : (previous.stats ?? []),
    habilidades: has('habilidades') ? patch.habilidades : (previous.habilidades ?? { tecnicas: [], blandas: [] }),
    experiencias: has('experiencias') ? patch.experiencias : (previous.experiencias ?? []),
    proyectos: has('proyectos') ? patch.proyectos : (previous.proyectos ?? []),
    config: normalizeConfig({
      ...(previous.config || DEFAULT_CONFIG),
      ...(patch.config || {}),
    }),
  };

  return next;
}

function getInitialViewState() {
  try {
    const cached = loadCachedPortfolioViewData();

    if (cached) {
      return {
        data: normalizeViewData(cached),
        dataSource: 'cache',
        hasCache: true,
      };
    }
  } catch {
    // Session may not exist yet; keep an empty state until auth/backend responds.
  }

  return {
    data: normalizeViewData(clone(EMPTY_VIEW)),
    dataSource: 'empty',
    hasCache: false,
  };
}

function getResponseData(response) {
  return response?.data ?? response;
}

export function useView() {
  const [initialState] = useState(getInitialViewState);
  const [data, setData] = useState(initialState.data);
  const [toast, setToast] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [loading, setLoading] = useState(!initialState.hasCache);
  const [dataSource, setDataSource] = useState(initialState.dataSource);
  const [error, setError] = useState(null);

  const showToast = useCallback((msg, tipo = 'ok') => {
    setToast({ msg, tipo });

    window.clearTimeout(window.__vw_toast_timer);
    window.__vw_toast_timer = window.setTimeout(() => {
      setToast(null);
    }, 2800);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(!initialState.hasCache);
    setError(null);

    try {
      const result = await getPortfolioViewData();

      setData((prev) => normalizeViewData(result.data, prev));
      setDataSource(result.warnings.length ? 'partial' : 'backend');

      if (result.warnings.length) {
        showToast('Algunas secciones no se pudieron cargar desde backend.', 'info');
      }
    } catch (err) {
      setDataSource(initialState.hasCache ? 'cache' : 'error');
      setError(err.message || 'No se pudo conectar con el backend.');
      showToast(
        initialState.hasCache
          ? 'Backend no disponible: mostrando datos en cache.'
          : 'Backend no disponible: no se pudieron cargar los datos del portafolio.',
        'info'
      );
    } finally {
      setLoading(false);
    }
  }, [initialState.hasCache, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateConfig = useCallback((patch) => {
    setData((prev) => {
      const currentConfig = normalizeConfig(prev.config);
      const nextConfig = normalizeConfig({
        ...currentConfig,
        ...patch,
        visibilidad: patch.visibilidad
          ? mergeVisibility(patch.visibilidad)
          : currentConfig.visibilidad,
      });

      return {
        ...prev,
        config: nextConfig,
      };
    });
  }, []);

  const updatePerfil = useCallback((patch) => {
    setData((prev) => ({
      ...prev,
      perfil: {
        ...prev.perfil,
        ...patch,
      },
    }));
  }, []);

  const updateData = useCallback((patch = {}) => {
    setData((prev) => {
      const next = normalizeViewData(patch, prev);

      return next;
    });
  }, []);

  const resetConfig = useCallback(() => {
    try {
      clearStoredConfig();
    } catch {
      // The session can be unavailable before auth finishes hydrating.
    }

    setData((prev) => {
      const reset = normalizeConfig({
        ...DEFAULT_CONFIG,
        visibilidad: prev.config?.visibilidad,
      });

      return {
        ...prev,
        config: reset,
      };
    });

    showToast('Configuracion visual restaurada', 'info');
  }, [showToast]);

  const saveCurrentConfig = useCallback(async (config) => {
    setGuardando(true);

    try {
      const payload = mapConfigToBackend(normalizeConfig(config));
      const response = await saveConfig(payload);
      const savedConfig = mapConfigFromBackend(getResponseData(response));

      setData((prev) => ({
        ...prev,
        config: normalizeConfig({
          ...prev.config,
          ...savedConfig,
        }),
      }));

      showToast('Personalizacion guardada correctamente', 'ok');
    } catch (err) {
      const message = err.message || 'No se pudieron aplicar los cambios. Intenta nuevamente.';
      showToast(message, 'error');
      throw new Error(message);
    } finally {
      setGuardando(false);
    }
  }, [showToast]);

  const publicar = useCallback(async (publicado = true) => {
    setGuardando(true);

    try {
      await publicarPortafolio(Boolean(publicado));

      setData((prev) => {
        const nextConfig = normalizeConfig({
          ...prev.config,
          publicado: Boolean(publicado),
        });

        return {
          ...prev,
          config: nextConfig,
        };
      });

      showToast(
        publicado
          ? 'Portafolio publicado correctamente'
          : 'Portafolio ocultado correctamente',
        'ok'
      );
    } catch (err) {
      showToast(
        err.message || (publicado
          ? 'No se pudo publicar el portafolio.'
          : 'No se pudo ocultar el portafolio.'),
        'error'
      );
    } finally {
      setGuardando(false);
    }
  }, [showToast]);

  return useMemo(() => ({
    perfil: data.perfil,
    redes: data.redes,
    stats: data.stats,
    habilidades: data.habilidades,
    experiencias: data.experiencias,
    proyectos: data.proyectos,
    config: normalizeConfig(data.config),
    toast,
    guardando,
    loading,
    dataSource,
    error,
    reload: loadData,
    updateConfig,
    updatePerfil,
    updateData,
    resetConfig,
    saveCurrentConfig,
    publicar,
  }), [
    data,
    toast,
    guardando,
    loading,
    dataSource,
    error,
    loadData,
    updateConfig,
    updatePerfil,
    updateData,
    resetConfig,
    saveCurrentConfig,
    publicar,
  ]);
}
