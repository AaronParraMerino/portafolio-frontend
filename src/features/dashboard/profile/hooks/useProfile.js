// ═══════════════════════════════════════════
// useProfile
// ═══════════════════════════════════════════
import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../../../../core/i18n';
import { refreshStoredUser } from '../../../../shared/utils/authStorage';
import {
  getProfile,
  updateProfile,
  updateVisibility,
  uploadImage,
  deleteImage,
  setCachedProfile,
} from '../services/profileService';

const BASE_URL_STORAGE =
  (process.env.REACT_APP_STORAGE_URL || 'http://localhost:8000/storage') + '/';

// ── Clave de caché en sessionStorage ──
const CACHE_KEY = 'perfil_cache';

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
    bannerUrl: formatUrl(data.foto_fondo_medium_url || data.foto_fondo),
    bannerOriginalUrl: formatUrl(data.foto_fondo),
  };
}

// ── Leer / escribir caché ──
function leerCache() {
  try {
    const raw = sessionStorage.getItem(cacheKey());
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function escribirCache(perfil) {
  try {
    sessionStorage.setItem(cacheKey(), JSON.stringify(perfil));
    syncSharedProfileCache(perfil);
  } catch {
    // sessionStorage lleno o deshabilitado: no es crítico
  }
}

function syncSharedProfileCache(perfil) {
  try {
    setCachedProfile(perfil);
  } catch {
    // Shared cache is only an optimization.
  }
}

function limpiarCache() {
  sessionStorage.removeItem(cacheKey());
}

// ── Guard de carga global (sobrevive re-renders del componente) ──
// Se almacena fuera del hook para que React StrictMode
// no lo resetee al desmontar/remontar en desarrollo.
let _cargaIniciada = false;

export function useProfile() {
  const { t } = useLanguage();
  // Inicializar con caché si existe → pantalla instantánea
  const [perfil,    setPerfil]    = useState(() => leerCache());
  const [loading,   setLoading]   = useState(!leerCache()); // false si hay caché
  const [guardando, setGuardando] = useState(false);
  const [editando,  setEditando]  = useState(false);
  const [toast,     setToast]     = useState(null);

  // Ref para el debounce de visibilidad
  const visDebounce = useRef({});

  // ── Carga inicial ──
  useEffect(() => {
    // OPTIMIZACIÓN 2: guard a nivel módulo — ni StrictMode ni
    // re-renders pueden volver a lanzar la petición.
    if (_cargaIniciada) return;
    _cargaIniciada = true;

    // Si había caché, hacemos la fetch en background (stale-while-revalidate):
    // el usuario ya ve datos, y cuando llegue la respuesta simplemente
    // actualizamos el estado sin mostrar spinner.
    const tieneCachePrevio = Boolean(leerCache());

    getProfile({ force: true })
      .then(data => {
        const mapeado = mapearPerfil(data);
        setPerfil(mapeado);
        escribirCache(mapeado);            // actualizar caché
      })
      .catch(err => {
        console.error('[useProfile] Error cargando perfil:', err.message);
        // Si teníamos caché, el usuario sigue viendo datos aunque falle la red
      })
      .finally(() => {
        if (!tieneCachePrevio) setLoading(false);
        else setLoading(false); // siempre apagar el spinner
      });
  }, []);

  // ── Toast helper ──
  const mostrarToast = (msg, tipo = 'ok') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Guardar cambios del perfil ──
  const guardarPerfil = async (datos) => {
    setGuardando(true);
    try {
      const actualizado = await updateProfile(datos);
      const mapeado = {
        ...mapearPerfil(actualizado),
        avatarUrl: perfil?.avatarUrl,
        bannerUrl: perfil?.bannerUrl,
      };
      setPerfil(mapeado);
      escribirCache(mapeado);
      setEditando(false);
      mostrarToast(t('profile.toast.updated'));
    } catch (err) {
      console.error('[useProfile] Error guardando perfil:', err.message);
      mostrarToast(t('profile.toast.updateError'), 'error');
    } finally {
      setGuardando(false);
    }
  };

  // ── Toggle visibilidad con debounce ──
  // OPTIMIZACIÓN 4: si el usuario cambia el mismo campo dos veces
  // en menos de 400ms, cancela el primer PATCH y solo envía el último.
  const toggleVisibilidad = useCallback(async (campo) => {
    const actual = perfil?.visibilidad?.[campo];
    const nuevoValor = !actual;

    // Actualización optimista inmediata
    setPerfil(prev => {
      const nuevo = {
        ...prev,
        visibilidad: { ...prev.visibilidad, [campo]: nuevoValor },
      };
      escribirCache(nuevo);
      return nuevo;
    });

    // Cancelar timeout anterior para este campo si existe
    if (visDebounce.current[campo]) {
      clearTimeout(visDebounce.current[campo]);
    }

    visDebounce.current[campo] = setTimeout(async () => {
      try {
        await updateVisibility({ [campo]: nuevoValor });
      } catch (err) {
        console.error('[useProfile] Error visibilidad:', err.message);
        // Revertir
        setPerfil(prev => {
          const revertido = {
            ...prev,
            visibilidad: { ...prev.visibilidad, [campo]: actual },
          };
          escribirCache(revertido);
          return revertido;
        });
        mostrarToast(t('profile.toast.visibilityError'), 'error');
      }
    }, 400);
  }, [perfil,t]);

  // ── Subir imagen ──
  // OPTIMIZACIÓN 3: pasamos el método correcto según si ya existe imagen.
  // Así el backend recibe una sola request, no dos.
  const subirImagen = async (tipo, archivo) => {
    // Determinar si ya existe imagen del tipo solicitado
    const yaExiste = tipo === 'avatar'
      ? Boolean(perfil?.foto_perfil)
      : Boolean(perfil?.foto_fondo);

    const method = yaExiste ? 'update' : 'create';

    setGuardando(true);

    try {
      const resultado = await uploadImage(tipo, archivo, method);
      const payload   = resultado?.data || resultado || {};
      const urlCruda  = payload.url || payload.foto_perfil || payload.foto_fondo || null;

      if (urlCruda) {
        const urlFinal = urlCruda.startsWith('http')
          ? urlCruda
          : `${BASE_URL_STORAGE}${urlCruda}`;
        const bannerMedium = payload.foto_fondo_medium_url || urlCruda;
        const bannerFinal = bannerMedium.startsWith('http')
          ? bannerMedium
          : `${BASE_URL_STORAGE}${bannerMedium}`;

        setPerfil(prev => {
          const nuevo = {
            ...prev,
            ...(tipo === 'avatar'
              ? { avatarUrl: urlFinal, foto_perfil: urlCruda }
              : { bannerUrl: bannerFinal, bannerOriginalUrl: urlFinal, foto_fondo: urlCruda }
            ),
          };
          escribirCache(nuevo);
          return nuevo;
        });
      } else {
        // Fallback solo si el backend no devuelve URL (raro)
        console.warn('[useProfile] Backend no devolvió URL, haciendo re-fetch...');
        const data = await getProfile({ force: true });
        const mapeado = mapearPerfil(data);
        setPerfil(prev => {
          const nuevo = {
            ...mapeado,
            ...(tipo === 'avatar'
              ? { bannerUrl: prev.bannerUrl }
              : { avatarUrl: prev.avatarUrl }
            ),
          };
          escribirCache(nuevo);
          return nuevo;
        });
      }

      mostrarToast(tipo === 'avatar' ? t('profile.toast.avatarUpdated') : t('profile.toast.bannerUpdated'));
      if (tipo === 'avatar') {
        refreshStoredUser().catch(() => {});
      }
    } catch (error) {
      console.error('[useProfile] Error subiendo imagen:', error.message);
      mostrarToast(t('profile.toast.uploadError'), 'error');
      throw error;
    } finally {
      setGuardando(false);
    }
  };

  // ── Eliminar imagen ──
  const eliminarImagen = async (tipo) => {
    setGuardando(true);

    try {
      await deleteImage(tipo);
      setPerfil(prev => {
        const nuevo = {
          ...prev,
          ...(tipo === 'avatar'
            ? { avatarUrl: null, foto_perfil: null }
            : { bannerUrl: null, bannerOriginalUrl: null, foto_fondo: null }
          ),
        };
        escribirCache(nuevo);
        return nuevo;
      });
      mostrarToast(tipo === 'avatar' ? t('profile.toast.avatarDeleted') : t('profile.toast.bannerDeleted'));
      if (tipo === 'avatar') {
        refreshStoredUser().catch(() => {});
      }
    } catch (err) {
      console.error('[useProfile] Error eliminando imagen:', err.message);
      mostrarToast(t('profile.toast.deleteError'), 'error');
      throw new Error('delete-failed');
    } finally {
      setGuardando(false);
    }
  };

  // ── Recargar perfil manualmente (fuerza re-fetch y actualiza caché) ──
  const recargarPerfil = async () => {
    try {
      const data = await getProfile({ force: true });
      const mapeado = mapearPerfil(data);
      setPerfil(mapeado);
      escribirCache(mapeado);
    } catch (err) {
      console.error('[useProfile] Error recargando perfil:', err.message);
    }
  };

  // ── Limpiar caché al cerrar sesión ──
  // Exportar para que el logout lo llame
  const limpiarCachePerfil = () => {
    limpiarCache();
    _cargaIniciada = false; // permite recargar al hacer login de nuevo
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
    limpiarCachePerfil,
  };
}
