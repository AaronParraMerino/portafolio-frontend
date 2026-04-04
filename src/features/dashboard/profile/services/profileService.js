// ═══════════════════════════════════════════
// PROFILE SERVICE
// CONEXIÓN BACKEND: cuando el backend esté
// listo, descomentar las llamadas axios/fetch
// y eliminar los returns mock.
// Base URL: import { API_URL } from '../../../shared/config/api'
// ═══════════════════════════════════════════

import { mockProfile } from '../model/profileModel';

// ── GET perfil del usuario autenticado ──
// BACKEND: GET /api/profile  (con token en headers)
export async function getProfile() {
  // const res = await fetch(`${API_URL}/profile`, {
  //   headers: { Authorization: `Bearer ${token}` }
  // });
  // return res.json();
  return new Promise(resolve => setTimeout(() => resolve(mockProfile), 400));
}

// ── PUT actualizar datos personales ──
// BACKEND: PUT /api/profile  (body: datos actualizados)
export async function updateProfile(datos) {
  // const res = await fetch(`${API_URL}/profile`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  //   body: JSON.stringify(datos),
  // });
  // return res.json();
  return new Promise(resolve => setTimeout(() => resolve({ ...mockProfile, ...datos }), 500));
}

// ── PUT actualizar visibilidad de campos ──
// BACKEND: PUT /api/profile/visibility  (body: { campo, visible })
export async function updateVisibility(campo, visible) {
  // const res = await fetch(`${API_URL}/profile/visibility`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  //   body: JSON.stringify({ campo, visible }),
  // });
  // return res.json();
  return new Promise(resolve => setTimeout(() => resolve({ campo, visible }), 300));
}