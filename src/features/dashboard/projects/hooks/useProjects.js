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
import {
  getProyectos,
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
import { MOCK_PROYECTOS } from '../model/projectsModel';

const BASE_STORAGE = (process.env.REACT_APP_STORAGE_URL || 'http://localhost:8000/storage') + '/';
const CACHE_KEY = 'projects_cache';

// ── MODO MOCK: cambiar a false cuando el backend esté listo ──
const USAR_MOCK = false;

// Guard anti-doble-fetch
let _cargaIniciada = false;

// ════════════════════════════════════════
// Caché helpers
// ════════════════════════════════════════
function leerCache() {
  try {
    const r = sessionStorage.getItem(CACHE_KEY);
    return r ? JSON.parse(r) : null;
  } catch {
    return null;
  }
}

function escribirCache(d) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(d));
  } catch {}
}

function limpiarCache() {
  sessionStorage.removeItem(CACHE_KEY);
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
// el estado interno del hook, cache y modo mock.
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
// Helper interno: genera badge desde datos del form
// ════════════════════════════════════════
function generarBadge(datos) {
  const map = {
    publicado: { label: 'Publicado', variant: 'green' },
    borrador: { label: 'Borrador', variant: 'gray' },
    archivado: { label: 'Archivado', variant: 'blue' },
    sin_especificar: { label: 'Sin especificar', variant: 'gray' },
    en_desarrollo: { label: 'En desarrollo', variant: 'amber' },
    pausado: { label: 'Pausado', variant: 'amber' },
    terminado: { label: 'Terminado', variant: 'gray' },
    mantenimiento: { label: 'Mantenimiento', variant: 'amber' },
    versionado: { label: 'Versionado', variant: 'amber' },
    cancelado: { label: 'Cancelado', variant: 'blue' },
  };

  return map[datos.estado] || { label: datos.estado, variant: 'gray' };
}

// ════════════════════════════════════════
// Hook principal
// ════════════════════════════════════════
export function useProjects() {
  const cache = leerCache();

  const [proyectos, setProyectos] = useState(() =>
    cache?.proyectos ?? (USAR_MOCK ? MOCK_PROYECTOS.map(mapearProyecto) : [])
  );

  const [loading, setLoading] = useState(!cache);
  const [guardando, setGuardando] = useState(false);
  const [toast, setToast] = useState(null);

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
    if (USAR_MOCK) {
      setLoading(false);
      return;
    }

    if (_cargaIniciada) return;
    _cargaIniciada = true;

    getProyectos()
      .then(data => {
        const mapeados = (data || []).map(mapearProyecto);
        setProyectos(mapeados);
        guardarEnCache(mapeados);
      })
      .catch(err => {
        console.error('[useProjects] Error cargando proyectos:', err.message);
        mostrarToast('Error al cargar proyectos', 'error');
      })
      .finally(() => setLoading(false));
  }, [guardarEnCache, mostrarToast]);

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
    setGuardando(true);

    try {
      if (USAR_MOCK) {
        await new Promise(r => setTimeout(r, 600));

        const previewUrls = imagenesNuevas.map(f => URL.createObjectURL(f));
        const docsPreview = documentosNuevos.map(f => ({
          url: URL.createObjectURL(f),
          nombre: f.name,
        }));

        const nuevo = mapearProyecto({
          ...datos,
          id: Date.now(),
          id_proyecto: Date.now(),
          imagenes: previewUrls,
          documentos: docsPreview,
          imagenUrl: previewUrls[0] || null,
          imagen_portada: previewUrls[0] || null,
          estadoLabel: null,
          badges: [generarBadge(datos)],
          fecha_modificacion: new Date().toISOString(),
        });

        const actualizados = [nuevo, ...proyectos];
        setProyectos(actualizados);
        guardarEnCache(actualizados);
        mostrarToast('Proyecto agregado correctamente');

        return nuevo;
      }

      // 1. Crear proyecto sin archivos.
      const creado = await crearProyecto(datos);
      const creadoMapeado = mapearProyecto(creado);
      const proyectoId = getProjectId(creadoMapeado);

      if (!proyectoId) {
        throw new Error('El backend no devolvió ID del proyecto creado');
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
      if (Array.isArray(datos?.detected_repo_ids) && datos.detected_repo_ids.length > 0) {
        await attachDetectedReposToProject(proyectoId, datos.detected_repo_ids, datos.detected_participacion ?? {}).catch(err =>
          console.warn('[useProjects] Error vinculando repos detectados:', err.message)
        );
      }

      const actualizados = [mapeado, ...proyectos];
      setProyectos(actualizados);
      guardarEnCache(actualizados);
      mostrarToast('Proyecto agregado correctamente');

      return mapeado;

    } catch (err) {
      console.error('[useProjects] Error creando proyecto:', err.message);
      mostrarToast(err.message || 'Error al crear el proyecto', 'error');
      throw err;
    } finally {
      setGuardando(false);
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
    setGuardando(true);

    try {
      const proyectoActual = proyectos.find(p => p.id === id || p.id_proyecto === id);
      const proyectoId = id || getProjectId(proyectoActual);

      if (!proyectoId) {
        throw new Error('ID de proyecto no encontrado');
      }

      const urlsImagenesAEliminar = resolverUrlsAEliminar(
        proyectoActual?.imagenes || [],
        imagenesAEliminar
      );

      const urlsDocumentosAEliminar = resolverDocumentosAEliminar(
        proyectoActual?.documentos || [],
        documentosAEliminar
      );

      if (USAR_MOCK) {
        await new Promise(r => setTimeout(r, 600));

        const imagenesBase = (proyectoActual?.imagenes || [])
          .filter(url => !urlsImagenesAEliminar.includes(url));

        const nuevasUrls = imagenesNuevas.map(f => URL.createObjectURL(f));
        const imagenes = [...imagenesBase, ...nuevasUrls].slice(0, 5);

        const documentosBase = (proyectoActual?.documentos || [])
          .filter(doc => !urlsDocumentosAEliminar.includes(getDocumentoUrl(doc)));

        const nuevosDocs = documentosNuevos.map(f => ({
          url: URL.createObjectURL(f),
          nombre: f.name,
        }));

        const documentos = [...documentosBase, ...nuevosDocs].slice(0, 2);

        const actualizados = proyectos.map(p =>
          p.id === id || p.id_proyecto === id
            ? mapearProyecto({
                ...p,
                ...datos,
                imagenes,
                imagenUrl: imagenes[0] || null,
                imagen_portada: imagenes[0] || null,
                documentos,
                badges: [generarBadge(datos)],
                fecha_modificacion: new Date().toISOString(),
              })
            : p
        );

        setProyectos(actualizados);
        guardarEnCache(actualizados);
        mostrarToast('Proyecto actualizado correctamente');

        return actualizados.find(p => p.id === id || p.id_proyecto === id);
      }

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

      if (Array.isArray(datos?.detected_repo_ids) && datos.detected_repo_ids.length > 0) {
        await attachDetectedReposToProject(proyectoId, datos.detected_repo_ids, datos.detected_participacion ?? {}).catch(err =>
          console.warn('[useProjects] Error vinculando repos detectados:', err.message)
        );
      }

      const actualizados = proyectos.map(p =>
        p.id === proyectoId || p.id_proyecto === proyectoId
          ? mapeado
          : p
      );

      setProyectos(actualizados);
      guardarEnCache(actualizados);
      mostrarToast('Proyecto actualizado correctamente');

      return mapeado;

    } catch (err) {
      console.error('[useProjects] Error editando proyecto:', err.message);
      mostrarToast(err.message || 'Error al actualizar el proyecto', 'error');
      throw err;
    } finally {
      setGuardando(false);
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
      if (!USAR_MOCK) {
        await eliminarProyecto(id);
      } else {
        await new Promise(r => setTimeout(r, 400));
      }

      mostrarToast('Proyecto eliminado');

    } catch (err) {
      setProyectos(previo);
      guardarEnCache(previo);

      console.error('[useProjects] Error eliminando proyecto:', err.message);
      mostrarToast('Error al eliminar el proyecto', 'error');
    }
  };

  const desvincularParticipacion = async (id) => {
    const previo = proyectos;
    const actualizados = proyectos.filter(p => p.id !== id && p.id_proyecto !== id);

    setProyectos(actualizados);
    guardarEnCache(actualizados);

    try {
      if (!USAR_MOCK) {
        await desvincularParticipacionProyecto(id);
      } else {
        await new Promise(r => setTimeout(r, 400));
      }

      mostrarToast('Participacion desvinculada');

    } catch (err) {
      setProyectos(previo);
      guardarEnCache(previo);

      console.error('[useProjects] Error desvinculando participacion:', err.message);
      mostrarToast(err.message || 'Error al desvincular la participacion', 'error');
    }
  };

  // ════════════════════════════════════════
  // REFRESCAR MANUALMENTE
  // ════════════════════════════════════════
  const actualizarConfiguracion = async (id, configuracion) => {
    setGuardando(true);

    try {
      const data = await actualizarProyectoConfiguracion(id, configuracion);
      const actualizados = proyectos.map(p => {
        if (p.id !== id && p.id_proyecto !== id) return p;

        return mapearProyecto({
          ...p,
          configuracion: data.configuracion || configuracion,
          permisos: data.permisos || p.permisos,
          puede_editar: data.permisos?.puede_editar ?? p.puede_editar,
          puede_eliminar: data.permisos?.puede_eliminar ?? p.puede_eliminar,
          puede_configurar: data.permisos?.puede_configurar ?? p.puede_configurar,
          puede_desvincular_participacion: data.permisos?.puede_desvincular_participacion ?? p.puede_desvincular_participacion,
        });
      });

      setProyectos(actualizados);
      guardarEnCache(actualizados);
      mostrarToast('Configuracion actualizada correctamente');

      return actualizados.find(p => p.id === id || p.id_proyecto === id);
    } catch (err) {
      console.error('[useProjects] Error actualizando configuracion:', err.message);
      mostrarToast(err.message || 'Error al actualizar la configuracion', 'error');
      throw err;
    } finally {
      setGuardando(false);
    }
  };

  const refrescar = async () => {
    if (USAR_MOCK) return proyectos;

    setLoading(true);

    try {
      const data = await getProyectos();
      const mapeados = (data || []).map(mapearProyecto);

      setProyectos(mapeados);
      guardarEnCache(mapeados);

      return mapeados;

    } catch (err) {
      console.error('[useProjects] Error refrescando proyectos:', err.message);
      mostrarToast('Error al refrescar proyectos', 'error');
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
