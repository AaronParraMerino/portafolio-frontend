import BASE_URL from '../../../../services/http/const';

const VALID_SKILL_TYPES = ['tecnica', 'blanda'];
const VALID_LEVELS = ['basico', 'intermedio', 'avanzado', 'experto'];

const SKILL_DISPLAY_NAMES = {
  javascript: 'JavaScript',
  js: 'JavaScript',
  typescript: 'TypeScript',
  ts: 'TypeScript',
  react: 'React',
  reactjs: 'React',
  'react.js': 'React',
  reactnative: 'React Native',
  'react native': 'React Native',
  angular: 'Angular',
  vue: 'Vue.js',
  vuejs: 'Vue.js',
  'vue.js': 'Vue.js',
  node: 'Node.js',
  nodejs: 'Node.js',
  'node.js': 'Node.js',
  express: 'Express.js',
  expressjs: 'Express.js',
  'express.js': 'Express.js',
  html: 'HTML',
  html5: 'HTML5',
  css: 'CSS',
  css3: 'CSS3',
  sass: 'Sass',
  bootstrap: 'Bootstrap',
  tailwind: 'Tailwind CSS',
  tailwindcss: 'Tailwind CSS',
  php: 'PHP',
  laravel: 'Laravel',
  java: 'Java',
  springboot: 'Spring Boot',
  'spring boot': 'Spring Boot',
  python: 'Python',
  django: 'Django',
  flask: 'Flask',
  c: 'C',
  cpp: 'C++',
  'c++': 'C++',
  csharp: 'C#',
  'c#': 'C#',
  dotnet: '.NET',
  '.net': '.NET',
  dart: 'Dart',
  flutter: 'Flutter',
  kotlin: 'Kotlin',
  swift: 'Swift',
  sql: 'SQL',
  mysql: 'MySQL',
  postgresql: 'PostgreSQL',
  postgres: 'PostgreSQL',
  mongodb: 'MongoDB',
  mongo: 'MongoDB',
  docker: 'Docker',
  kubernetes: 'Kubernetes',
  k8s: 'Kubernetes',
  git: 'Git',
  github: 'GitHub',
  gitlab: 'GitLab',
  aws: 'AWS',
  azure: 'Azure',
  gcp: 'Google Cloud',
  figma: 'Figma',
  ux: 'UX',
  ui: 'UI',
  'ux/ui': 'UX/UI',
  ingles: 'Inglés',
  comunicacion: 'Comunicación',
  'comunicacion efectiva': 'Comunicación efectiva',
  liderazgo: 'Liderazgo',
  'trabajo en equipo': 'Trabajo en equipo',
};

export const normalizeSkillText = (value = '') => (
  String(value)
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
);

export const formatSkillDisplayName = (value = '') => {
  const cleanValue = String(value || '').trim().replace(/\s+/g, ' ');
  const normalized = normalizeSkillText(cleanValue);

  if (!cleanValue) return '';

  if (SKILL_DISPLAY_NAMES[normalized]) {
    return SKILL_DISPLAY_NAMES[normalized];
  }

  return cleanValue
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (!word) return word;

      const lowerWords = ['de', 'del', 'la', 'las', 'el', 'los', 'en', 'y', 'con', 'para'];
      if (index > 0 && lowerWords.includes(word)) {
        return word;
      }

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

const getAuthData = () => {
  const token = localStorage.getItem('tokenPORT');
  const usuarioRaw = localStorage.getItem('usuario');

  if (!token || !usuarioRaw) {
    throw new Error('No hay sesión activa.');
  }

  const usuario = JSON.parse(usuarioRaw);

  if (!usuario?.id_usuario) {
    throw new Error('No se encontró el usuario autenticado.');
  }

  return { token, userId: usuario.id_usuario };
};

const buildHeaders = (token) => ({
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: `Bearer ${token}`,
});

const getFirstValidationError = (errors) => {
  if (!errors || typeof errors !== 'object') return '';

  const firstValue = Object.values(errors).flat()?.[0];
  return typeof firstValue === 'string' ? firstValue : '';
};

const normalizeApiErrorMessage = (message = '', errors = null) => {
  const validationError = getFirstValidationError(errors);
  const rawMessage = validationError || message || 'Error en la solicitud.';
  const msg = normalizeSkillText(rawMessage);

  if (
    msg.includes('registrada para este usuario') ||
    msg.includes('ya esta registrada para este usuario') ||
    msg.includes('ya tienes') ||
    msg.includes('usuario ya tiene')
  ) {
    return 'Ya tienes esta habilidad registrada en tu perfil.';
  }

  if (
    msg.includes('habilidad ya existe') ||
    msg.includes('ya existe') ||
    msg.includes('duplic') ||
    msg.includes('unique')
  ) {
    if (msg.includes('tecnica') || msg.includes('tecnico')) {
      return 'Esta habilidad ya existe registrada como habilidad técnica.';
    }

    if (msg.includes('blanda') || msg.includes('blando')) {
      return 'Esta habilidad ya existe registrada como habilidad blanda.';
    }

    return 'Esta habilidad ya existe en el catálogo. Revisa si está registrada como técnica o blanda.';
  }

  if (msg.includes('nivel')) {
    return 'Selecciona un nivel válido para la habilidad.';
  }

  if (msg.includes('tipo')) {
    return 'Selecciona un tipo válido: técnica o blanda.';
  }

  if (msg.includes('nombre')) {
    return rawMessage;
  }

  return rawMessage;
};

const parseJson = async (res) => {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(normalizeApiErrorMessage(data?.message, data?.errors));
  }

  return data;
};

const normalizeSkillType = (tipo) => {
  const normalized = normalizeSkillText(tipo);

  if (normalized === 'tecnica' || normalized === 'tecnico') {
    return 'tecnica';
  }

  if (normalized === 'blanda' || normalized === 'blando') {
    return 'blanda';
  }

  return normalized;
};

const normalizeLevel = (nivel) => {
  const normalized = normalizeSkillText(nivel);

  if (normalized === 'basico' || normalized === 'basic') return 'basico';
  if (normalized === 'intermedio' || normalized === 'intermediate') return 'intermedio';
  if (normalized === 'avanzado' || normalized === 'advanced') return 'avanzado';
  if (normalized === 'experto' || normalized === 'expert') return 'experto';

  return normalized;
};

const validateCatalogSkillPayload = (nombre, tipo, descripcion = '') => {
  const cleanName = String(nombre || '').trim().replace(/\s+/g, ' ');
  const cleanDescription = String(descripcion || '').trim();
  const cleanType = normalizeSkillType(tipo);

  if (!cleanName) {
    throw new Error('Ingresa el nombre de la habilidad.');
  }

  if (cleanName.length < 2) {
    throw new Error('El nombre de la habilidad debe tener al menos 2 caracteres.');
  }

  if (cleanName.length > 40) {
    throw new Error('El nombre de la habilidad no debe superar los 40 caracteres.');
  }

  if (!/[a-zA-ZÁÉÍÓÚÜÑáéíóúüñ0-9+#.]/.test(cleanName)) {
    throw new Error('El nombre de la habilidad debe contener letras, números o símbolos válidos.');
  }

  if (!VALID_SKILL_TYPES.includes(cleanType)) {
    throw new Error('Selecciona un tipo válido: técnica o blanda.');
  }

  if (cleanDescription.length > 255) {
    throw new Error('La descripción no debe superar los 255 caracteres.');
  }

  return {
    nombre: formatSkillDisplayName(cleanName),
    tipo: cleanType,
    descripcion: cleanDescription,
  };
};

const validateUserSkillPayload = (catalogoId, nivel) => {
  const skillId = Number(catalogoId);
  const cleanLevel = normalizeLevel(nivel);

  if (!skillId || Number.isNaN(skillId)) {
    throw new Error('Selecciona una habilidad válida del catálogo.');
  }

  if (!VALID_LEVELS.includes(cleanLevel)) {
    throw new Error('Selecciona un nivel válido para la habilidad.');
  }

  return {
    habilidad_id: skillId,
    nivel: cleanLevel,
  };
};

const mapCatalogToFront = (item) => ({
  id: Number(item.id_habilidad ?? item.id ?? 0),
  nombre: formatSkillDisplayName(item.nombre ?? ''),
  tipo: normalizeSkillType(item.tipo ?? ''),
  descripcion: item.descripcion ?? '',
});

const mapUserSkillToFront = (item) => {
  const id = Number(
    item.id_habilidad_usuario ??
    item.id_usuario_habilidad ??
    item.id ??
    0
  );

  const esVisible =
    item.es_visible === true ||
    item.es_visible === 1 ||
    item.es_visible === 'true';

  const habilidad = item.habilidad || {};

  return {
    id,
    catalogo_habilidad_id: Number(item.habilidad_id ?? habilidad.id_habilidad ?? 0),
    nombre: formatSkillDisplayName(item.nombre || habilidad.nombre || ''),
    tipo: normalizeSkillType(item.tipo || habilidad.tipo || ''),
    descripcion: item.descripcion || habilidad.descripcion || '',
    nivel: normalizeLevel(item.nivel),
    es_visible: esVisible,
  };
};

export const getCatalogSkills = async () => {
  const { token } = getAuthData();

  const res = await fetch(`${BASE_URL}/habilidades/catalogo`, {
    method: 'GET',
    headers: buildHeaders(token),
  });

  const data = await parseJson(res);
  const lista = Array.isArray(data) ? data : (data.data || []);

  return lista.map(mapCatalogToFront);
};

export const createCatalogSkill = async (nombre, tipo, descripcion = '') => {
  const { token } = getAuthData();
  const payload = validateCatalogSkillPayload(nombre, tipo, descripcion);

  const res = await fetch(`${BASE_URL}/habilidades/catalogo`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = await parseJson(res);
  return mapCatalogToFront(data.data || data);
};

export const getUserSkills = async () => {
  const { token, userId } = getAuthData();

  const res = await fetch(`${BASE_URL}/habilidades/usuario/${userId}`, {
    method: 'GET',
    headers: buildHeaders(token),
  });

  const data = await parseJson(res);
  const lista = Array.isArray(data) ? data : (data.data || []);

  return lista.map(mapUserSkillToFront);
};

export const addUserSkill = async (catalogoId, nivel) => {
  const { token, userId } = getAuthData();
  const payload = validateUserSkillPayload(catalogoId, nivel);

  const res = await fetch(`${BASE_URL}/habilidades/usuario/${userId}`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = await parseJson(res);
  return mapUserSkillToFront(data.data || data);
};

export const updateUserSkill = async (id, nivel) => {
  const { token, userId } = getAuthData();
  const skillId = Number(id);
  const cleanLevel = normalizeLevel(nivel);

  if (!skillId || Number.isNaN(skillId)) {
    throw new Error('No se encontró la habilidad que deseas actualizar.');
  }

  if (!VALID_LEVELS.includes(cleanLevel)) {
    throw new Error('Selecciona un nivel válido para la habilidad.');
  }

  const res = await fetch(`${BASE_URL}/habilidades/usuario/${userId}/${skillId}`, {
    method: 'PUT',
    headers: buildHeaders(token),
    body: JSON.stringify({
      nivel: cleanLevel,
    }),
  });

  const data = await parseJson(res);
  return mapUserSkillToFront(data.data || data);
};

export const deleteUserSkill = async (id) => {
  const { token, userId } = getAuthData();
  const skillId = Number(id);

  if (!skillId || Number.isNaN(skillId)) {
    throw new Error('No se encontró la habilidad que deseas eliminar.');
  }

  const res = await fetch(`${BASE_URL}/habilidades/usuario/${userId}/${skillId}`, {
    method: 'DELETE',
    headers: buildHeaders(token),
  });

  return parseJson(res);
};
