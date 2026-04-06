// ═══════════════════════════════════════════
// PROFILE SERVICE
// CONEXIÓN BACKEND: cuando el backend esté
// listo, descomentar las llamadas axios/fetch
// y eliminar los returns mock.
//import { API_URL } from '../../../shared/config/api'
// ═══════════════════════════════════════════
//import { mockProfile } from '../model/profileModel';
const API_URL = "http://localhost:8000/api"


// ── Helper: obtener usuario y token ──
function getSessionUser() {
  const storedUser = sessionStorage.getItem('usuario');

  if (!storedUser) {
    throw new Error("No hay usuario en sesión");
  }

  const user = JSON.parse(storedUser);

  const userId =
    user.id ||
    user.id_usuario ||
    user.idUsuario;

  if (!userId) {
    throw new Error("No se encontró el ID del usuario en sesión");
  }

  const token =
    localStorage.getItem('tokenPORT') ||
    sessionStorage.getItem('tokenPORT');

  if (!token) {
    throw new Error("No se encontró el token");
  }

  return { userId, token };
}

// ── GET perfil del usuario autenticado ──
// BACKEND: GET /api/profile  (con token en headers)
  export async function getProfile() {
    const { userId, token } = getSessionUser();
      console.log("userId:", userId);
  console.log("token:", token);

    const res = await fetch(`${API_URL}/profile/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Error ${res.status}: ${error}`);
    }

    return await res.json();
  }

// ── PUT actualizar datos personales ──
// BACKEND: PUT /api/profile  (body: datos actualizados)
  export async function updateProfile(datos) {
    const { userId, token } = getSessionUser();

    const res = await fetch(`${API_URL}/profile/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(datos),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Error ${res.status}: ${error}`);
    }

    return await res.json();
  }


// ── PUT actualizar visibilidad de campos ──
// BACKEND: PUT /api/profile/visibility  (body: { campo, visible })
  export async function updateVisibility(data) {
    const { userId, token } = getSessionUser();

    const res = await fetch(`${API_URL}/profile/${userId}/visibility`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Error ${res.status}: ${error}`);
    }

    return await res.json();
  }