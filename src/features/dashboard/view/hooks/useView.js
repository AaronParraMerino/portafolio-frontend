// src/features/dashboard/view/hooks/useView.js

import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_CONFIG, DEFAULT_VISIBILITY, MOCK_VIEW } from '../model/viewModel';

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
      ...DEFAULT_VISIBILITY.habilidades,
      ...(current.habilidades || {}),
    },
    experiencias: {
      ...DEFAULT_VISIBILITY.experiencias,
      ...(current.experiencias || {}),
    },
    proyectos: {
      ...DEFAULT_VISIBILITY.proyectos,
      ...(current.proyectos || {}),
    },
  };
}

function normalizeConfig(config = {}) {
  return {
    ...DEFAULT_CONFIG,
    ...config,
    visibilidad: mergeVisibility(config.visibilidad),
  };
}

export function useView() {
  const [data, setData] = useState(() => clone(MOCK_VIEW));
  const [toast, setToast] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const showToast = useCallback((msg, tipo = 'ok') => {
    setToast({ msg, tipo });

    window.clearTimeout(window.__vw_toast_timer);
    window.__vw_toast_timer = window.setTimeout(() => {
      setToast(null);
    }, 2800);
  }, []);

  const updateConfig = useCallback((patch) => {
    setData(prev => {
      const currentConfig = normalizeConfig(prev.config);

      return {
        ...prev,
        config: normalizeConfig({
          ...currentConfig,
          ...patch,
          visibilidad: patch.visibilidad
            ? mergeVisibility(patch.visibilidad)
            : currentConfig.visibilidad,
        }),
      };
    });
  }, []);

  const updatePerfil = useCallback((patch) => {
    setData(prev => ({
      ...prev,
      perfil: {
        ...prev.perfil,
        ...patch,
      },
    }));
  }, []);

  const updateData = useCallback((patch = {}) => {
    setData(prev => ({
        ...prev,
        perfil: patch.perfil ?? prev.perfil,
        redes: patch.redes ?? prev.redes,
        stats: patch.stats ?? prev.stats,
        habilidades: patch.habilidades ?? prev.habilidades,
        experiencias: patch.experiencias ?? prev.experiencias,
        proyectos: patch.proyectos ?? prev.proyectos,
        config: patch.config
        ? normalizeConfig({
            ...prev.config,
            ...patch.config,
            })
        : prev.config,
    }));
    }, []);

  const resetConfig = useCallback(() => {
    setData(prev => ({
      ...prev,
      config: clone(DEFAULT_CONFIG),
    }));

    showToast('Configuración restaurada', 'info');
  }, [showToast]);

  const publicar = useCallback(async () => {
    setGuardando(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      showToast('Portafolio publicado correctamente', 'ok');
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
    updateConfig,
    updatePerfil,
    updateData,
    resetConfig,
    publicar,
  }), [
    data,
    toast,
    guardando,
    updateConfig,
    updatePerfil,
    updateData,
    resetConfig,
    publicar,
  ]);
}