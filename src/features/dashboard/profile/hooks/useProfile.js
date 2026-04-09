// ═══════════════════════════════════════════
// HOOK: useProfile
// ═══════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react';
import {
  getProfile,
  updateProfile,
  updateVisibility,
  uploadImage,
  deleteImage,
} from '../services/profileService';

const BASE_URL_STORAGE = "http://localhost:8000/storage/";

// Normaliza la respuesta del backend en un objeto con avatarUrl y bannerUrl
function mapearPerfil(data) {
  if (!data) return null;

  const formatUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${BASE_URL_STORAGE}${path}`;
  };

  return {
    ...data,
    avatarUrl: formatUrl(data.foto_perfil),
    bannerUrl: formatUrl(data.foto_fondo),
  };
}

export function useProfile() {
  const [perfil, setPerfil]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando]   = useState(false);
  const [toast, setToast]         = useState(null);

  // ── Carga / recarga del perfil ──
  const cargarPerfil = useCallback(async () => {
    try {
      const data = await getProfile();
      setPerfil(mapearPerfil(data));
    } catch (err) {
      console.error('[useProfile] Error cargando perfil:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargarPerfil(); }, [cargarPerfil]);

  // ── Toast helper ──
  const mostrarToast = useCallback((msg, tipo = 'ok') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Guardar cambios del perfil ──
  const guardarPerfil = async (datos) => {
    setGuardando(true);
    try {
      await updateProfile(datos);
      await cargarPerfil();
      setEditando(false);
      mostrarToast('Perfil actualizado correctamente');
    } catch (err) {
      console.error('[useProfile] Error guardando perfil:', err.message);
      mostrarToast('Error al guardar los cambios', 'error');
    } finally {
      setGuardando(false);
    }
  };

  // ── Toggle visibilidad de campos ──
  const toggleVisibilidad = async (campo) => {
    const actual = perfil?.visibilidad?.[campo];
    setPerfil(prev => ({
      ...prev,
      visibilidad: { ...prev.visibilidad, [campo]: !actual },
    }));
    try {
      await updateVisibility({ [campo]: !actual });
    } catch (err) {
      console.error('[useProfile] Error visibilidad:', err.message);
      setPerfil(prev => ({
        ...prev,
        visibilidad: { ...prev.visibilidad, [campo]: actual },
      }));
      mostrarToast('Error al cambiar visibilidad', 'error');
    }
  };

  // ── Subir imagen (avatar o banner) ──
  const subirImagen = async (tipo, archivo) => {
    try {
      const resultado = await uploadImage(tipo, archivo);

      // El backend devuelve { status, message, url }
      // 'url' es la URL pública de Supabase Storage
      const payload = resultado?.data || resultado || {};
      const urlCruda = payload.url || payload.foto_perfil || payload.foto_fondo || null;

      if (urlCruda) {
        const urlFinal = urlCruda.startsWith('http')
          ? urlCruda
          : `${BASE_URL_STORAGE}${urlCruda}`;

        setPerfil(prev => ({
          ...prev,
          ...(tipo === 'avatar'
            ? { avatarUrl: urlFinal, foto_perfil: urlCruda }
            : { bannerUrl: urlFinal, foto_fondo: urlCruda }
          ),
        }));
      } else {
        // El backend no devolvió URL → re-fetch completo
        console.warn('[useProfile] Backend no devolvió URL. Haciendo re-fetch...');
        await cargarPerfil();
      }

      mostrarToast(tipo === 'avatar' ? 'Foto de perfil actualizada' : 'Banner actualizado');
    } catch (error) {
      console.error('[useProfile] Error subiendo imagen:', error.message);
      mostrarToast('Error al subir la imagen', 'error');
      throw error;
    }
  };

  // ── Eliminar imagen ──
  const eliminarImagen = async (tipo) => {
    try {
      await deleteImage(tipo);
      setPerfil(prev => ({
        ...prev,
        ...(tipo === 'avatar'
          ? { avatarUrl: null, foto_perfil: null }
          : { bannerUrl: null, foto_fondo: null }
        ),
      }));
      mostrarToast(tipo === 'avatar' ? 'Foto de perfil eliminada' : 'Banner eliminado');
    } catch (err) {
      console.error('[useProfile] Error eliminando imagen:', err.message);
      mostrarToast('Error al eliminar la imagen', 'error');
      throw new Error('delete-failed');
    }
  };

  return {
    perfil,
    loading,
    guardando,
    editando,
    setEditando,
    guardarPerfil,
    toggleVisibilidad,
    toast,
    subirImagen,
    eliminarImagen,
    recargarPerfil: cargarPerfil,
  };
}