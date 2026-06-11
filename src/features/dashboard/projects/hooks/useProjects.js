// ═══════════════════════════════════════════
// useProjects.js
// src/features/dashboard/projects/hooks/useProjects.js
//
// Hook central para el módulo de proyectos.
// Soporta:
// - múltiples imágenes por proyecto
// - múltiples videos de YouTube
// - múltiples repositorios GitHub
// - múltiples documentos
// - desarrollado_para
// - adaptación a backend existente mediante projectsService.js
// ═══════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../../../core/i18n';
import {
  getProyectos,
  getCachedProyectos,
  setCachedProyectos,
  crearProyecto,
  actualizarProyecto,
  actualizarProyectoConfiguracion,
  eliminarProyecto,
  desvincularParticipacionProyecto,
  uploadImagenes,
  eliminarImagenes,
  uploadDocumentos,
  eliminarDocumentos,
  attachDetectedReposToProject,
  normalizeProyectoFromApi,
} from '../services/projectsService';
const BASE_STORAGE = (process.env.REACT_APP_STORAGE_URL || 'http://localhost:8000/storage') + '/';
const CACHE_KEY = 'projects_cache';

// Guard anti-doble-fetch
let _cargaIniciada = false;

function leerCacheServicio() {
  try {
    return getCachedProyectos();
  } catch {
    return [];
  }
}

// ════════════════════════════════════════
// Caché helpers
// ════════════════════════════════════════
function leerCache() {
  try {
    const r = sessionStorage.getItem(cacheKey());
    return r ? JSON.parse(r) : null;
  } catch {
    return null;
  }
}

function escribirCache(d) {
  try {
    sessionStorage.setItem(cacheKey(), JSON.stringify(d));
  } catch {}

  try {
    setCachedProyectos(d?.proyectos || []);
  } catch {}
}

function limpiarCache() {
  sessionStorage.removeItem(cacheKey());
}

function cacheKey() {
  try {
    const raw = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
    const user = raw ? JSON.parse(raw) : {};
    const userId = user.id_usuario || user.id || user.idUsuario || 'anon';
    return `${CACHE_KEY}:${userId}`;
  } catch {
    return `${CACHE_KEY}:anon`;
  }
}

async function attachDetectedReposByProvider(proyectoId, datos = {}) {
  if (Array.isArray(datos?.detected_repos) && datos.detected_repos.length > 0) {
    const reposByProvider = datos.detected_repos.reduce((acc, repo) => {
      const provider = repo?.provider || 'github';
      const id = Number(repo?.id || repo?.id_proyecto_repositorio);
      if (!Number.isInteger(id) || id <= 0) return acc;
      acc[provider] = [...(acc[provider] || []), id];
      return acc;
    }, {});

    for (const [provider, ids] of Object.entries(reposByProvider)) {
      await attachDetectedReposToProject(proyectoId, ids, datos.detected_participacion ?? {}, { provider }).catch(err =>
        console.warn(`[useProjects] Error vinculando repos detectados ${provider}:`, err.message)
      );
    }
    return;
  }

  if (Array.isArray(datos?.detected_repo_ids) && datos.detected_repo_ids.length > 0) {
    await attachDetectedReposToProject(proyectoId, datos.detected_repo_ids, datos.detected_participacion ?? {}).catch(err =>
      console.warn('[useProjects] Error vinculando repos detectados:', err.message)
    );
  }
}

// ════════════════════════════════════════
// URL helpers
// ════════════════════════════════════════
function formatUrl(path) {
  if (!path) return null;

  const value = String(path).trim();

  if (!value) return null;
  if (value.startsWith('blob:')) return value;
  if (value.startsWith('data:')) return value;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;

  return `${BASE_STORAGE}${value.replace(/^\/+/, '')}`;
}

function getProjectId(project = {}) {
  return project.id || project.id_proyecto || project.idProyecto || null;
}

function getDocumentoUrl(doc) {
  if (!doc) return '';

  if (typeof doc === 'string') return doc;

  return doc.url || doc.ruta || doc.path || doc.archivo_url || doc.archivoPath || '';
}

function getDocumentoNombre(doc) {
  if (!doc) return 'Documento';

  if (typeof doc === 'string') {
    const clean = doc.split('?')[0];
    return clean.split('/').pop() || 'Documento';
  }

  return (
    doc.nombre ||
    doc.name ||
    doc.filename ||
    doc.nombre_original ||
    doc.titulo ||
    getDocumentoNombre(getDocumentoUrl(doc))
  );
}

function formatDocumento(doc) {
  const rawUrl = getDocumentoUrl(doc);
  const url = formatUrl(rawUrl);

  if (!url) return null;

  return {
    ...(typeof doc === 'object' ? doc : {}),
    url,
    nombre: getDocumentoNombre(doc),
  };
}

// ════════════════════════════════════════
// Normalización local
// Nota: el service ya normaliza, pero este helper deja seguro
// el estado interno del hook y cache.
// ════════════════════════════════════════
function mapearProyecto(p = {}) {
  const normalizado = normalizeProyectoFromApi
    ? normalizeProyectoFromApi(p)
    : p;

  const imagenes = Array.isArray(normalizado.imagenes)
    ? normalizado.imagenes.map(formatUrl).filter(Boolean)
    : [];

  const documentos = Array.isArray(normalizado.documentos)
    ? normalizado.documentos.map(formatDocumento).filter(Boolean)
    : [];

  const id = getProjectId(normalizado);

  return {
    ...normalizado,

    id,
    id_proyecto: normalizado.id_proyecto || id,

    imagenes,
    imagenUrl: imagenes[0] || null,
    imagen_portada: normalizado.imagen_portada || imagenes[0] || null,

    url_repositorios: Array.isArray(normalizado.url_repositorios)
      ? normalizado.url_repositorios.filter(Boolean)
      : normalizado.url_repositorio
        ? [normalizado.url_repositorio]
        : [],
    url_repositorio:
      normalizado.url_repositorio ||
      normalizado.url_repositorios?.[0] ||
      '',

    url_videos: Array.isArray(normalizado.url_videos)
      ? normalizado.url_videos.filter(Boolean)
      : normalizado.url_video
        ? [normalizado.url_video]
        : [],
    url_video:
      normalizado.url_video ||
      normalizado.url_videos?.[0] ||
      '',

    documentos,

    desarrollado_para: normalizado.desarrollado_para || '',
    tipo: normalizado.tipo || '',
  };
}

// ════════════════════════════════════════
// Normalización de eliminaciones
// Acepta:
// - índices: [0, 1]
// - URLs: ["https://..."]
// ════════════════════════════════════════
function resolverUrlsAEliminar(existentes = [], eliminaciones = []) {
  if (!Array.isArray(eliminaciones) || eliminaciones.length === 0) return [];

  return eliminaciones
    .map(item => {
      if (typeof item === 'number') return existentes[item] || null;
      if (typeof item === 'string') return item;
      return null;
    })
    .filter(Boolean);
}

function resolverDocumentosAEliminar(existentes = [], eliminaciones = []) {
  if (!Array.isArray(eliminaciones) || eliminaciones.length === 0) return [];

  return eliminaciones
    .map(item => {
      if (typeof item === 'number') return getDocumentoUrl(existentes[item]) || null;
      if (typeof item === 'string') return item;
      if (typeof item === 'object') return getDocumentoUrl(item);
      return null;
    })
    .filter(Boolean);
}

// ════════════════════════════════════════
// Helpers de respuestas de upload
// ════════════════════════════════════════
function normalizarResultadoImagenes(resultado) {
  if (!resultado) return [];

  if (Array.isArray(resultado.urls)) {
    return resultado.urls.map(formatUrl).filter(Boolean);
  }

  if (Array.isArray(resultado.imagenes)) {
    return resultado.imagenes
      .map(item => {
        if (typeof item === 'string') return formatUrl(item);
        return formatUrl(item.url || item.archivo_url || item.archivo_path || item.path);
      })
      .filter(Boolean);
  }

  if (Array.isArray(resultado.data)) {
    return resultado.data
      .map(item => {
        if (typeof item === 'string') return formatUrl(item);
        return formatUrl(item.url || item.archivo_url || item.archivo_path || item.path);
      })
      .filter(Boolean);
  }

  return [];
}

function normalizarResultadoDocumentos(resultado) {
  if (!resultado) return [];

  if (Array.isArray(resultado.documents)) {
    return resultado.documents.map(formatDocumento).filter(Boolean);
  }

  if (Array.isArray(resultado.documentos)) {
    return resultado.documentos.map(formatDocumento).filter(Boolean);
  }

  if (Array.isArray(resultado.urls)) {
    return resultado.urls.map(formatDocumento).filter(Boolean);
  }

  if (Array.isArray(resultado.data)) {
    return resultado.data.map(formatDocumento).filter(Boolean);
  }

  return [];
}

// ════════════════════════════════════════
// Hook principal
// ════════════════════════════════════════
export function useProjects() {
  const { t } = useLanguage();
  const cache = leerCache();
  const serviceCache = leerCacheServicio();

  const [proyectos, setProyectos] = useState(() =>
    cache?.proyectos ?? (serviceCache.length > 0 ? serviceCache.map(mapearProyecto) : [])
  );

  const [loading, setLoading] = useState(!cache && serviceCache.length === 0);
  const [savingCount, setSavingCount] = useState(0);
  const [savingProjectIds, setSavingProjectIds] = useState([]);
  const [toast, setToast] = useState(null);
  const guardando = savingCount > 0;

  const beginSaving = useCallback((id = null) => {
    setSavingCount((count) => count + 1);
    if (!id) return;

    setSavingProjectIds((current) => (
      current.includes(String(id)) ? current : [...current, String(id)]
    ));
  }, []);

  const endSaving = useCallback((id = null) => {
    setSavingCount((count) => Math.max(0, count - 1));
    if (!id) return;

    setSavingProjectIds((current) => current.filter((item) => item !== String(id)));
  }, []);

  const mostrarToast = useCallback((msg, tipo = 'ok') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const guardarEnCache = useCallback((proys) => {
    escribirCache({ proyectos: proys });
  }, []);

  // ════════════════════════════════════════
  // Carga inicial
  // ════════════════════════════════════════
  useEffect(() => {
    if (_cargaIniciada) return;
    _cargaIniciada = true;

    getProyectos({ force: true })
      .then(data => {
        const mapeados = (data || []).map(mapearProyecto);
        setProyectos(mapeados);
        guardarEnCache(mapeados);
      })
      .catch(err => {
        console.error('[useProjects] Error cargando proyectos:', err.message);
        mostrarToast(t('projects.toast.loadError'), 'error');
      })
      .finally(() => setLoading(false));
  }, [guardarEnCache, mostrarToast, t]);

  // ════════════════════════════════════════
  // CREAR PROYECTO
  //
  // Firma esperada desde ProjectsEdit:
  // onGuardar(datos, imagenesNuevas, imagenesAEliminar, documentosNuevos, documentosAEliminar)
  // ════════════════════════════════════════
  const crearNuevo = async (
    datos,
    imagenesNuevas = [],
    _imagenesAEliminar = [],
    documentosNuevos = [],
    _documentosAEliminar = []
  ) => {
    beginSaving();

    try {
      // 1. Crear proyecto sin archivos.
      const creado = await crearProyecto(datos);
      const creadoMapeado = mapearProyecto(creado);
      const proyectoId = getProjectId(creadoMapeado);

      if (!proyectoId) {
        throw new Error(t('projects.service.createdIdMissing'));
      }

      let mapeado = creadoMapeado;

      // 2. Subir imágenes nuevas.
      if (imagenesNuevas.length > 0) {
        const resultado = await uploadImagenes(proyectoId, imagenesNuevas);
        const urls = normalizarResultadoImagenes(resultado);

        mapeado = {
          ...mapeado,
          imagenes: urls,
          imagenUrl: urls[0] || null,
          imagen_portada: urls[0] || null,
        };
      }

      // 3. Subir documentos nuevos.
      if (documentosNuevos.length > 0) {
        const resultadoDocs = await uploadDocumentos(proyectoId, documentosNuevos);
        const docs = normalizarResultadoDocumentos(resultadoDocs);

        mapeado = {
          ...mapeado,
          documentos: docs,
        };
      }

      // 4. Vincular repos detectados (cuenta GitHub vinculada) a proyecto/participación.
      await attachDetectedReposByProvider(proyectoId, datos);

      setProyectos((current) => {
        const actualizados = [mapeado, ...current];
        guardarEnCache(actualizados);
        return actualizados;
      });
      mostrarToast(t('projects.toast.created'));

      return mapeado;

    } catch (err) {
      console.error('[useProjects] Error creando proyecto:', err.message);
      mostrarToast(err.message || t('projects.toast.createError'), 'error');
      throw err;
    } finally {
      endSaving();
    }
  };

  // ════════════════════════════════════════
  // EDITAR PROYECTO
  //
  // Firma:
  // editarExistente(id, datos, imagenesNuevas, imagenesAEliminar, documentosNuevos, documentosAEliminar)
  // ════════════════════════════════════════
  const editarExistente = async (
    id,
    datos,
    imagenesNuevas = [],
    imagenesAEliminar = [],
    documentosNuevos = [],
    documentosAEliminar = []
  ) => {
    beginSaving(id);

    try {
      const proyectoActual = proyectos.find(p => p.id === id || p.id_proyecto === id);
      const proyectoId = id || getProjectId(proyectoActual);

      if (!proyectoId) {
        throw new Error(t('projects.service.projectIdMissing'));
      }

      const urlsImagenesAEliminar = resolverUrlsAEliminar(
        proyectoActual?.imagenes || [],
        imagenesAEliminar
      );

      const urlsDocumentosAEliminar = resolverDocumentosAEliminar(
        proyectoActual?.documentos || [],
        documentosAEliminar
      );

      // 1. Actualizar datos principales del proyecto.
      const actualizado = await actualizarProyecto(proyectoId, datos);
      let mapeado = mapearProyecto(actualizado);

      // 2. Eliminar imágenes quitadas.
      if (urlsImagenesAEliminar.length > 0) {
        await eliminarImagenes(proyectoId, urlsImagenesAEliminar).catch(err =>
          console.warn('[useProjects] Error eliminando imágenes:', err.message)
        );
      }

      // 3. Eliminar documentos quitados.
      if (urlsDocumentosAEliminar.length > 0) {
        await eliminarDocumentos(proyectoId, urlsDocumentosAEliminar).catch(err =>
          console.warn('[useProjects] Error eliminando documentos:', err.message)
        );
      }

      // 4. Calcular imágenes finales.
      let imagenesFinales = (mapeado.imagenes || [])
        .filter(url => !urlsImagenesAEliminar.includes(url));

      if (imagenesNuevas.length > 0) {
        const resultado = await uploadImagenes(proyectoId, imagenesNuevas);
        const nuevasUrls = normalizarResultadoImagenes(resultado);
        imagenesFinales = [...imagenesFinales, ...nuevasUrls].slice(0, 5);
      }

      // 5. Calcular documentos finales.
      let documentosFinales = (mapeado.documentos || [])
        .filter(doc => !urlsDocumentosAEliminar.includes(getDocumentoUrl(doc)));

      if (documentosNuevos.length > 0) {
        const resultadoDocs = await uploadDocumentos(proyectoId, documentosNuevos);
        const nuevosDocs = normalizarResultadoDocumentos(resultadoDocs);
        documentosFinales = [...documentosFinales, ...nuevosDocs].slice(0, 2);
      }

      mapeado = {
        ...mapeado,
        imagenes: imagenesFinales,
        imagenUrl: imagenesFinales[0] || null,
        imagen_portada: imagenesFinales[0] || null,
        documentos: documentosFinales,
      };

      await attachDetectedReposByProvider(proyectoId, datos);

      setProyectos((current) => {
        const actualizados = current.map(p =>
          p.id === proyectoId || p.id_proyecto === proyectoId
            ? mapeado
            : p
        );
        guardarEnCache(actualizados);
        return actualizados;
      });
      mostrarToast(t('projects.toast.updated'));

      return mapeado;

    } catch (err) {
      console.error('[useProjects] Error editando proyecto:', err.message);
      mostrarToast(err.message || t('projects.toast.updateError'), 'error');
      throw err;
    } finally {
      endSaving(id);
    }
  };

  // ════════════════════════════════════════
  // ELIMINAR PROYECTO
  // ════════════════════════════════════════
  const eliminar = async (id) => {
    const previo = proyectos;
    const actualizados = proyectos.filter(p => p.id !== id && p.id_proyecto !== id);

    setProyectos(actualizados);
    guardarEnCache(actualizados);

    try {
      await eliminarProyecto(id);

      mostrarToast(t('projects.toast.deleted'));

    } catch (err) {
      setProyectos(previo);
      guardarEnCache(previo);

      console.error('[useProjects] Error eliminando proyecto:', err.message);
      mostrarToast(t('projects.toast.deleteError'), 'error');
    }
  };

  const desvincularParticipacion = async (id) => {
    const previo = proyectos;
    const actualizados = proyectos.filter(p => p.id !== id && p.id_proyecto !== id);

    setProyectos(actualizados);
    guardarEnCache(actualizados);

    try {
      await desvincularParticipacionProyecto(id);

      mostrarToast(t('projects.toast.unlinked'));

    } catch (err) {
      setProyectos(previo);
      guardarEnCache(previo);

      console.error('[useProjects] Error desvinculando participacion:', err.message);
      mostrarToast(err.message || t('projects.toast.unlinkError'), 'error');
    }
  };

  // ════════════════════════════════════════
  // REFRESCAR MANUALMENTE
  // ════════════════════════════════════════
  const actualizarConfiguracion = async (id, configuracion) => {
    beginSaving(id);

    try {
      const data = await actualizarProyectoConfiguracion(id, configuracion);
      setProyectos((current) => {
        const actualizados = current.map(p => {
          if (p.id !== id && p.id_proyecto !== id) return p;

          return mapearProyecto({
            ...p,
            configuracion: data.configuracion || configuracion,
            permisos: data.permisos || p.permisos,
            puede_editar: data.permisos?.puede_editar ?? p.puede_editar,
            puede_eliminar: data.permisos?.puede_eliminar ?? p.puede_eliminar,
            puede_configurar: data.permisos?.puede_configurar ?? p.puede_configurar,
            puede_desvincular_participacion: data.permisos?.puede_desvincular_participacion ?? p.puede_desvincular_participacion,
            puede_remover_participantes_sin_validacion: data.permisos?.puede_remover_participantes_sin_validacion ?? p.puede_remover_participantes_sin_validacion,
          });
        });
        guardarEnCache(actualizados);
        return actualizados;
      });
      mostrarToast(t('projects.toast.configUpdated'));

      return data;
    } catch (err) {
      console.error('[useProjects] Error actualizando configuracion:', err.message);
      mostrarToast(err.message || t('projects.toast.configUpdateError'), 'error');
      throw err;
    } finally {
      endSaving(id);
    }
  };

  const refrescar = async () => {
    setLoading(true);

    try {
      const data = await getProyectos({ force: true });
      const mapeados = (data || []).map(mapearProyecto);

      setProyectos(mapeados);
      guardarEnCache(mapeados);

      return mapeados;

    } catch (err) {
      console.error('[useProjects] Error refrescando proyectos:', err.message);
      mostrarToast(t('projects.toast.refreshError'), 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ════════════════════════════════════════
  // LIMPIAR CACHÉ
  // ════════════════════════════════════════
  const limpiarCacheProjects = () => {
    limpiarCache();
    _cargaIniciada = false;
  };

  return {
    proyectos,
    loading,
    guardando,
    savingProjectIds,
    toast,

    crearNuevo,
    editarExistente,
    eliminar,
    desvincularParticipacion,
    actualizarConfiguracion,
    refrescar,

    limpiarCacheProjects,
  };
}
