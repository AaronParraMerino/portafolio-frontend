import BASE_URL from '../../../../services/http/const';

// --- LÓGICA DE SIMULACIÓN PARA QA (Temporal) ---
const getMockCatalog = () => {
  const saved = sessionStorage.getItem('mock_catalog');
  return saved ? JSON.parse(saved) : [
    { id: 1, nombre: "MySQL", tipo: "tecnica", descripcion: "Base de datos relacional robusta" },
    { id: 2, nombre: "React", tipo: "tecnica", descripcion: "Librería para interfaces de usuario" },
    { id: 3, nombre: "Liderazgo", tipo: "blanda", descripcion: "Gestión y motivación de equipos" },
    { id: 4, nombre: "JavaScript", tipo: "tecnica", descripcion: "Lenguaje de programación web" }
  ];
};

const saveMockCatalog = (catalog) => {
  sessionStorage.setItem('mock_catalog', JSON.stringify(catalog));
};

// --- AUTH HELPERS ---
const getAuthData = () => {
  const token = sessionStorage.getItem('tokenPORT');
  const usuarioRaw = sessionStorage.getItem('usuario');
  if (!token || !usuarioRaw) throw new Error('No hay sesión activa.');
  const usuario = JSON.parse(usuarioRaw);
  return { token, userId: usuario.id_usuario };
};

const buildHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': `Bearer ${token}`,
});

const parseJson = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || 'Error en la comunicación con el servidor.');
  return data;
};

// --- MÉTODOS DEL CATÁLOGO ---

export const getCatalogSkills = async () => {
  try {
    const { token } = getAuthData();
    const res = await fetch(`${BASE_URL}/catalogo-habilidades`, {
      method: 'GET',
      headers: buildHeaders(token),
    });
    return await parseJson(res);
  } catch (error) {
    console.warn("Usando catálogo simulado...");
    return getMockCatalog();
  }
};

export const createCatalogSkill = async (nombre, tipo, descripcion = "") => {
  try {
    const { token } = getAuthData();
    const res = await fetch(`${BASE_URL}/catalogo-habilidades`, {
      method: 'POST',
      headers: buildHeaders(token),
      body: JSON.stringify({ nombre: nombre.trim(), tipo, descripcion }),
    });
    return await parseJson(res);
  } catch (error) {
    // SIMULACIÓN
    const currentCatalog = getMockCatalog();
    const nueva = { id: Date.now(), nombre, tipo, descripcion };
    saveMockCatalog([...currentCatalog, nueva]);
    return nueva;
  }
};

// --- MÉTODOS DEL USUARIO ---

export const getUserSkills = async () => {
  try {
    const { token, userId } = getAuthData();
    const res = await fetch(`${BASE_URL}/habilidades/usuario/${userId}`, {
      method: 'GET',
      headers: buildHeaders(token),
    });
    const data = await parseJson(res);
    return Array.isArray(data) ? data : (data.data || []);
  } catch (error) {
    const saved = sessionStorage.getItem('user_skills_temp');
    return saved ? JSON.parse(saved) : [];
  }
};

export const addUserSkill = async (catalogoId, nivel, esPublico) => {
  try {
    const { token, userId } = getAuthData();
    const res = await fetch(`${BASE_URL}/habilidades`, {
      method: 'POST',
      headers: buildHeaders(token),
      body: JSON.stringify({
        usuario_id: userId,
        catalogo_habilidad_id: catalogoId,
        nivel: nivel.toLowerCase(),
        es_publico: esPublico
      }),
    });
    return await parseJson(res);
  } catch (error) {
    // SIMULACIÓN: Buscamos en el catálogo local para traer la descripción también
    const catalog = getMockCatalog();
    const skillBase = catalog.find(s => s.id === catalogoId);
    
    const nuevaUserSkill = {
      id: Date.now(),
      catalogo_habilidad_id: catalogoId,
      nombre: skillBase ? skillBase.nombre : "Habilidad Nueva",
      tipo: skillBase ? skillBase.tipo : "tecnica",
      descripcion: skillBase ? skillBase.descripcion : "", // <--- IMPORTANTE: Agregado
      nivel,
      es_publico: esPublico
    };

    const currentSkills = JSON.parse(sessionStorage.getItem('user_skills_temp') || "[]");
    sessionStorage.setItem('user_skills_temp', JSON.stringify([...currentSkills, nuevaUserSkill]));
    
    return nuevaUserSkill;
  }
};

export const updateUserSkill = async (id, nivel, esPublico) => {
  try {
    const { token } = getAuthData();
    const res = await fetch(`${BASE_URL}/habilidades/${id}`, {
      method: 'PUT',
      headers: buildHeaders(token),
      body: JSON.stringify({ nivel: nivel.toLowerCase(), es_publico: esPublico }),
    });
    return await parseJson(res);
  } catch (error) {
    // Simulación Update local
    const currentSkills = JSON.parse(sessionStorage.getItem('user_skills_temp') || "[]");
    const updated = currentSkills.map(s => 
      s.id === id ? { ...s, nivel, es_publico: esPublico } : s
    );
    sessionStorage.setItem('user_skills_temp', JSON.stringify(updated));
    return { success: true };
  }
};

export const deleteUserSkill = async (id) => {
  try {
    const { token } = getAuthData();
    const res = await fetch(`${BASE_URL}/habilidades/${id}`, {
      method: 'DELETE',
      headers: buildHeaders(token),
    });
    return res.ok;
  } catch (error) {
    const currentSkills = JSON.parse(sessionStorage.getItem('user_skills_temp') || "[]");
    const filtered = currentSkills.filter(s => s.id !== id);
    sessionStorage.setItem('user_skills_temp', JSON.stringify(filtered));
    return true;
  }
};