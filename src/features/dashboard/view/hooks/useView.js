// src/features/dashboard/view/hooks/useView.js

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_CONFIG, DEFAULT_VISIBILITY, MOCK_VIEW } from '../model/viewModel';
import {
  clearStoredConfig,
  getPortfolioViewData,
  loadCachedPortfolioViewData,
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
  };
}

function normalizeConfig(config = {}) {
  return normalizeServiceConfig({
    ...DEFAULT_CONFIG,
    ...config,
    visibilidad: mergeVisibility(config.visibilidad),
  });
}

function normalizeViewData(patch = {}, previous = clone(MOCK_VIEW)) {
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
    // Session may not exist yet; fall back to mock until auth/backend responds.
  }

  return {
    data: normalizeViewData(clone(MOCK_VIEW)),
    dataSource: 'mock',
    hasCache: false,
  };
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

  const persistConfig = useCallback((config) => {
    saveConfig(config).catch((err) => {
      showToast(err.message || 'No se pudo guardar la configuracion local.', 'error');
    });
  }, [showToast]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getPortfolioViewData();

      setData((prev) => normalizeViewData(result.data, prev));
      setDataSource(result.warnings.length ? 'partial' : 'backend');

      if (result.warnings.length) {
        showToast('Algunas secciones no se pudieron cargar desde backend.', 'info');
      }
    } catch (err) {
      setData((prev) => initialState.hasCache ? prev : normalizeViewData(clone(MOCK_VIEW)));
      setDataSource(initialState.hasCache ? 'cache' : 'mock');
      setError(err.message || 'No se pudo conectar con el backend.');
      showToast(
        initialState.hasCache
          ? 'Backend no disponible: mostrando datos en cache.'
          : 'Backend no disponible: mostrando datos mock.',
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

      persistConfig(nextConfig);

      return {
        ...prev,
        config: nextConfig,
      };
    });
  }, [persistConfig]);

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

      persistConfig(next.config);

      return next;
    });
  }, [persistConfig]);

  const resetConfig = useCallback(() => {
    try {
      clearStoredConfig();
    } catch {
      // Mock mode can run without a persisted session.
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

  const publicar = useCallback(async () => {
    setGuardando(true);

    try {
      await publicarPortafolio(true);

      setData((prev) => {
        const nextConfig = normalizeConfig({
          ...prev.config,
          publicado: true,
        });

        persistConfig(nextConfig);

        return {
          ...prev,
          config: nextConfig,
        };
      });

      showToast('Portafolio publicado correctamente', 'ok');
    } catch (err) {
      showToast(err.message || 'No se pudo publicar el portafolio.', 'error');
    } finally {
      setGuardando(false);
    }
  }, [persistConfig, showToast]);

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
    publicar,
  ]);
}
