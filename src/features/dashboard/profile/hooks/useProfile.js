// ═══════════════════════════════════════════
// useProfile
// ═══════════════════════════════════════════
import { useState, useEffect, useRef } from 'react';
import {
  getProfile,
  updateProfile,
  updateVisibility,
  uploadImage,
  deleteImage,
} from '../services/profileService';

const BASE_URL_STORAGE = (process.env.REACT_APP_STORAGE_URL || 'http://localhost:8000/storage') + '/';

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

  // Ref para evitar doble llamada en React StrictMode (desarrollo)
  const cargado = useRef(false);

  // ── Carga inicial — solo una vez ──
  useEffect(() => {
    if (cargado.current) return;
    cargado.current = true;

    getProfile()
      .then(data => setPerfil(mapearPerfil(data)))
      .catch(err => console.error('[useProfile] Error cargando perfil:', err.message))
      .finally(() => setLoading(false));
  }, []);

  // ── Toast helper ──
  const mostrarToast = (msg, tipo = 'ok') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Guardar cambios del perfil ──
  // El PUT devuelve el perfil actualizado → lo usamos directamente, sin re-fetch
  const guardarPerfil = async (datos) => {
    setGuardando(true);
    try {
      const actualizado = await updateProfile(datos);
      // Preservamos avatarUrl y bannerUrl que ya tenemos en estado
      // (el PUT no toca imágenes, así que no cambian)
      setPerfil(prev => ({
        ...mapearPerfil(actualizado),
        avatarUrl: prev.avatarUrl,
        bannerUrl: prev.bannerUrl,
      }));
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
    // Optimistic update — sin esperar al backend
    setPerfil(prev => ({
      ...prev,
      visibilidad: { ...prev.visibilidad, [campo]: !actual },
    }));
    try {
      await updateVisibility({ [campo]: !actual });
    } catch (err) {
      console.error('[useProfile] Error visibilidad:', err.message);
      // Revertir si falla
      setPerfil(prev => ({
        ...prev,
        visibilidad: { ...prev.visibilidad, [campo]: actual },
      }));
      mostrarToast('Error al cambiar visibilidad', 'error');
    }
  };

  // ── Subir imagen (avatar o banner) ──
  // El backend devuelve { status, message, url } → usamos url directamente, sin re-fetch
  const subirImagen = async (tipo, archivo) => {
    try {
      const resultado = await uploadImage(tipo, archivo);
      const payload   = resultado?.data || resultado || {};
      const urlCruda  = payload.url || payload.foto_perfil || payload.foto_fondo || null;

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
        // Fallback: solo si el backend no devolvió URL hacemos re-fetch
        console.warn('[useProfile] Backend no devolvió URL, haciendo re-fetch...');
        const data = await getProfile();
        setPerfil(prev => ({
          ...mapearPerfil(data),
          // Preservar lo que ya tenemos del tipo que NO cambió
          ...(tipo === 'avatar'
            ? { bannerUrl: prev.bannerUrl }
            : { avatarUrl: prev.avatarUrl }
          ),
        }));
      }

      mostrarToast(tipo === 'avatar' ? 'Foto de perfil actualizada' : 'Banner actualizado');
    } catch (error) {
      console.error('[useProfile] Error subiendo imagen:', error.message);
      mostrarToast('Error al subir la imagen', 'error');
      throw error;
    }
  };

  // ── Eliminar imagen ──
  // Solo actualiza estado local — sin re-fetch
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

  // recargarPerfil: para uso manual si se necesita forzar sincronización
  const recargarPerfil = async () => {
    try {
      const data = await getProfile();
      setPerfil(mapearPerfil(data));
    } catch (err) {
      console.error('[useProfile] Error recargando perfil:', err.message);
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
    recargarPerfil,
  };
}