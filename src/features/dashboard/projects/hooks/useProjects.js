// ═══════════════════════════════════════════
// useProjects.js
// src/features/dashboard/projects/hooks/useProjects.js
//
// Hook central para el módulo de proyectos.
// Misma arquitectura que useProfile:
//   - caché sessionStorage (stale-while-revalidate)
//   - optimistic updates
//   - guard anti-doble-fetch
// ═══════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react';
import {
  getProyectos,
  crearProyecto,
  actualizarProyecto,
  eliminarProyecto,
  actualizarVisibilidad,
  uploadImagenPortada,
  eliminarImagenPortada,
  actualizarVisibilidadGlobal,
} from '../services/projectsService';
import { MOCK_PROYECTOS, MOCK_VISIBILIDAD_GLOBAL } from '../model/projectsModel';

const BASE_STORAGE = (process.env.REACT_APP_STORAGE_URL || 'http://localhost:8000/storage') + '/';
const CACHE_KEY    = 'projects_cache';

// ── Caché helpers (igual que useProfile) ──
function leerCache() {
  try { const r = sessionStorage.getItem(CACHE_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}
function escribirCache(data) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
}
function limpiarCache() { sessionStorage.removeItem(CACHE_KEY); }

function formatUrl(path) {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${BASE_STORAGE}${path}`;
}

function mapearProyecto(p) {
  return { ...p, imagenUrl: formatUrl(p.imagen_portada) };
}

// Guard anti-doble-fetch (igual que useProfile)
let _cargaIniciada = false;

// ── MODO MOCK: mientras no haya backend ──
// Cambia a false cuando el backend esté listo
const USAR_MOCK = true;

export function useProjects() {
  const cache = leerCache();
  const [proyectos,   setProyectos]   = useState(() => cache?.proyectos   ?? (USAR_MOCK ? MOCK_PROYECTOS.map(mapearProyecto) : []));
  const [visGlobal,   setVisGlobal]   = useState(() => cache?.visGlobal   ?? MOCK_VISIBILIDAD_GLOBAL);
  const [loading,     setLoading]     = useState(!cache);
  const [guardando,   setGuardando]   = useState(false);
  const [toast,       setToast]       = useState(null);

  const mostrarToast = (msg, tipo = 'ok') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const guardarEnCache = useCallback((proys, vis) => {
    escribirCache({ proyectos: proys, visGlobal: vis });
  }, []);

  // ── Carga inicial (stale-while-revalidate) ──
  useEffect(() => {
    if (USAR_MOCK) { setLoading(false); return; }
    if (_cargaIniciada) return;
    _cargaIniciada = true;

    getProyectos()
      .then(data => {
        const mapeados = (data || []).map(mapearProyecto);
        setProyectos(mapeados);
        guardarEnCache(mapeados, visGlobal);
      })
      .catch(err => console.error('[useProjects] Error cargando proyectos:', err.message))
      .finally(() => setLoading(false));
  }, []);                        // eslint-disable-line react-hooks/exhaustive-deps

  // ════════════════════════════════════════
  // CREAR PROYECTO
  // ════════════════════════════════════════
  const crearNuevo = async (datos, archivo) => {
    setGuardando(true);
    try {
      if (USAR_MOCK) {
        // Mock local: simula delay y asigna id
        await new Promise(r => setTimeout(r, 600));
        const nuevo = {
          ...datos,
          id: Date.now(),
          imagenUrl: archivo ? URL.createObjectURL(archivo) : null,
          imagen_portada: null,
          estadoLabel: null,
          badges: [generarBadge(datos)],
          fecha_modificacion: new Date().toISOString(),
        };
        const actualizados = [nuevo, ...proyectos];
        setProyectos(actualizados);
        guardarEnCache(actualizados, visGlobal);
        mostrarToast('Proyecto agregado correctamente');
        return nuevo;
      }

      // Backend real:
      // 1. Crear proyecto sin imagen → obtener id
      const creado = await crearProyecto(datos);
      let mapeado  = mapearProyecto(creado);

      // 2. Si hay imagen, subirla y actualizar estado con la URL
      if (archivo) {
        const resultado = await uploadImagenPortada(creado.id, archivo, false);
        const url = resultado?.data?.url || resultado?.url || null;
        if (url) mapeado = { ...mapeado, imagenUrl: formatUrl(url), imagen_portada: url };
      }

      const actualizados = [mapeado, ...proyectos];
      setProyectos(actualizados);
      guardarEnCache(actualizados, visGlobal);
      mostrarToast('Proyecto agregado correctamente');
      return mapeado;
    } catch (err) {
      console.error('[useProjects] Error creando proyecto:', err.message);
      mostrarToast('Error al crear el proyecto', 'error');
      throw err;
    } finally {
      setGuardando(false);
    }
  };

  // ════════════════════════════════════════
  // EDITAR PROYECTO
  // ════════════════════════════════════════
  const editarExistente = async (id, datos, archivo) => {
    setGuardando(true);
    try {
      if (USAR_MOCK) {
        await new Promise(r => setTimeout(r, 600));
        const actualizados = proyectos.map(p =>
          p.id === id
            ? {
                ...p,
                ...datos,
                imagenUrl: archivo ? URL.createObjectURL(archivo) : p.imagenUrl,
                badges: [generarBadge(datos)],
                fecha_modificacion: new Date().toISOString(),
              }
            : p
        );
        setProyectos(actualizados);
        guardarEnCache(actualizados, visGlobal);
        mostrarToast('Proyecto actualizado correctamente');
        return;
      }

      // Backend real:
      const actualizado = await actualizarProyecto(id, datos);
      let mapeado = mapearProyecto(actualizado);

      if (archivo) {
        const tieneImagen = Boolean(proyectos.find(p => p.id === id)?.imagen_portada);
        const resultado   = await uploadImagenPortada(id, archivo, tieneImagen);
        const url = resultado?.data?.url || resultado?.url || null;
        if (url) mapeado = { ...mapeado, imagenUrl: formatUrl(url), imagen_portada: url };
      }

      const actualizados = proyectos.map(p => p.id === id ? mapeado : p);
      setProyectos(actualizados);
      guardarEnCache(actualizados, visGlobal);
      mostrarToast('Proyecto actualizado correctamente');
    } catch (err) {
      console.error('[useProjects] Error editando proyecto:', err.message);
      mostrarToast('Error al actualizar el proyecto', 'error');
      throw err;
    } finally {
      setGuardando(false);
    }
  };

  // ════════════════════════════════════════
  // ELIMINAR PROYECTO
  // ════════════════════════════════════════
  const eliminar = async (id) => {
    // Optimistic: quitar de la lista inmediatamente
    const previo = proyectos;
    const actualizados = proyectos.filter(p => p.id !== id);
    setProyectos(actualizados);
    guardarEnCache(actualizados, visGlobal);

    try {
      if (!USAR_MOCK) await eliminarProyecto(id);
      else await new Promise(r => setTimeout(r, 400));
      mostrarToast('Proyecto eliminado');
    } catch (err) {
      // Revertir si falla
      setProyectos(previo);
      guardarEnCache(previo, visGlobal);
      console.error('[useProjects] Error eliminando proyecto:', err.message);
      mostrarToast('Error al eliminar el proyecto', 'error');
    }
  };

  // ════════════════════════════════════════
  // TOGGLE VISIBILIDAD INDIVIDUAL (optimistic)
  // ════════════════════════════════════════
  const toggleVisibilidad = async (id) => {
    const proyecto = proyectos.find(p => p.id === id);
    if (!proyecto) return;
    const nuevoValor = !proyecto.es_publico;

    // Optimistic update
    const actualizados = proyectos.map(p => p.id === id ? { ...p, es_publico: nuevoValor } : p);
    setProyectos(actualizados);
    guardarEnCache(actualizados, visGlobal);

    try {
      if (!USAR_MOCK) await actualizarVisibilidad(id, nuevoValor);
      mostrarToast(nuevoValor ? 'Proyecto publicado' : 'Proyecto ocultado');
    } catch (err) {
      // Revertir
      const revertidos = proyectos.map(p => p.id === id ? { ...p, es_publico: !nuevoValor } : p);
      setProyectos(revertidos);
      guardarEnCache(revertidos, visGlobal);
      console.error('[useProjects] Error visibilidad:', err.message);
      mostrarToast('Error al cambiar visibilidad', 'error');
    }
  };

  // ════════════════════════════════════════
  // TOGGLE VISIBILIDAD GLOBAL DEL PORTAFOLIO
  // ════════════════════════════════════════
  const toggleVisibilidadGlobal = async () => {
    const nuevoValor = !visGlobal;
    setVisGlobal(nuevoValor);
    guardarEnCache(proyectos, nuevoValor);

    try {
      if (!USAR_MOCK) await actualizarVisibilidadGlobal(nuevoValor);
      mostrarToast(nuevoValor ? 'Portafolio publicado' : 'Portafolio ocultado');
    } catch (err) {
      setVisGlobal(!nuevoValor);
      guardarEnCache(proyectos, !nuevoValor);
      console.error('[useProjects] Error visibilidad global:', err.message);
      mostrarToast('Error al cambiar la visibilidad', 'error');
    }
  };

  // ── Limpiar caché al cerrar sesión ──
  const limpiarCacheProjects = () => {
    limpiarCache();
    _cargaIniciada = false;
  };

  return {
    proyectos,
    visGlobal,
    loading,
    guardando,
    toast,
    crearNuevo,
    editarExistente,
    eliminar,
    toggleVisibilidad,
    toggleVisibilidadGlobal,
    limpiarCacheProjects,
  };
}

// ── Helper interno: genera badge desde los datos del form ──
function generarBadge(datos) {
  const estadoMap = {
    publicado:   { label: 'Publicado',      variant: 'green' },
    desarrollo:  { label: 'En desarrollo',  variant: 'amber' },
    borrador:    { label: 'Borrador',       variant: 'gray'  },
    archivado:   { label: 'Archivado',      variant: 'blue'  },
  };
  return estadoMap[datos.estado] || { label: datos.estado, variant: 'gray' };
}