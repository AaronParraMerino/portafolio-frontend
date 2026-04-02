// ═══════════════════════════════════════════
// HOOK: useProfile
// Maneja el estado y lógica del perfil.
// Cuando el backend esté listo, solo cambiar
// profileService.js — este hook no cambia.
// ═══════════════════════════════════════════

import { useState, useEffect } from 'react';
import { getProfile, updateProfile, updateVisibility } from '../services/profileService';

export function useProfile() {
  const [perfil, setPerfil]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando]   = useState(false);
  const [toast, setToast]         = useState(null);

  useEffect(() => {
    getProfile()
      .then(data => setPerfil(data))
      .finally(() => setLoading(false));
  }, []);

  const mostrarToast = (msg, tipo = 'ok') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const guardarPerfil = async (datos) => {
    setGuardando(true);
    try {
      const actualizado = await updateProfile(datos);
      setPerfil(actualizado);
      setEditando(false);
      mostrarToast('Perfil actualizado correctamente');
    } catch {
      mostrarToast('Error al guardar los cambios', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const toggleVisibilidad = async (campo) => {
    const actual = perfil.visibilidad[campo];
    // Optimistic update
    setPerfil(prev => ({
      ...prev,
      visibilidad: { ...prev.visibilidad, [campo]: !actual },
    }));
    try {
      await updateVisibility(campo, !actual);
    } catch {
      // Revertir si falla
      setPerfil(prev => ({
        ...prev,
        visibilidad: { ...prev.visibilidad, [campo]: actual },
      }));
      mostrarToast('Error al cambiar visibilidad', 'error');
    }
  };

  return {
    perfil, loading, guardando, editando,
    setEditando, guardarPerfil, toggleVisibilidad, toast,
  };
}