import BASE_URL from '../../../services/http/const';
import { getCachedDashboardEndpoint } from './dashboardCache';

const SUMMARY_CACHE_PREFIX = 'dashboard-summary:v1';

const EMPTY_SUMMARY = {
  counts: {
    projects: 0,
    skills: 0,
    technicalSkills: 0,
    softSkills: 0,
    experiences: 0,
    laboralExperiences: 0,
    academicExperiences: 0,
    links: 0,
  },
  progress: 0,
  completedRequirements: 0,
  totalRequirements: 7,
  missingRequirements: [],
  profileComplete: false,
  profileName: '',
};

function parseStoredJson(value, fallback = null) {
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function getSession() {
  const rawUser = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
  const token = localStorage.getItem('tokenPORT') || sessionStorage.getItem('tokenPORT');

  if (!rawUser || !token) {
    throw new Error('No hay sesion activa.');
  }

  const user = JSON.parse(rawUser);
  const userId = user.id_usuario || user.id || user.idUsuario;

  if (!userId) {
    throw new Error('No se encontro el usuario autenticado.');
  }

  return { user, userId, token };
}

function summaryCacheKey(userId) {
  return `${SUMMARY_CACHE_PREFIX}:${userId}`;
}

export function getEmptyDashboardSummary() {
  return {
    ...EMPTY_SUMMARY,
    counts: { ...EMPTY_SUMMARY.counts },
    missingRequirements: [...EMPTY_SUMMARY.missingRequirements],
  };
}

export function getCachedDashboardSummary() {
  try {
    const { userId } = getSession();
    const cached = parseStoredJson(sessionStorage.getItem(summaryCacheKey(userId)), null);
    return cached?.summary || null;
  } catch {
    return null;
  }
}

function saveCachedDashboardSummary(userId, summary) {
  try {
    sessionStorage.setItem(summaryCacheKey(userId), JSON.stringify({
      cachedAt: Date.now(),
      summary,
    }));
  } catch {
    // Cache is only an optimization.
  }
}

async function apiFetch(endpoint, token, { userId, force = false } = {}) {
  return getCachedDashboardEndpoint(
    endpoint,
    async () => {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await res.text();
      const data = text ? parseStoredJson(text, {}) : {};

      if (!res.ok) {
        throw new Error(data?.message || `Error ${res.status}`);
      }

      return data;
    },
    { force, userId },
  );
}

function unwrapList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.proyectos)) return response.proyectos;
  return [];
}

function unwrapProfile(response) {
  return response?.data && typeof response.data === 'object'
    ? response.data
    : response;
}

function text(value) {
  return String(value ?? '').trim();
}

function normalizeText(value) {
  return text(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function getProfileField(profile = {}, field) {
  const nested = profile.perfil && typeof profile.perfil === 'object'
    ? profile.perfil
    : {};

  return text(profile[field] ?? nested[field]);
}

function isProfileComplete(profile) {
  if (!profile) return false;

  const requiredFields = [
    'nombre',
    'apellido',
    'correo',
    'telefono',
    'profesion',
    'biografia',
    'ciudad',
    'pais',
  ];

  return requiredFields.every((field) => Boolean(getProfileField(profile, field)));
}

function getProfileName(profile, fallbackUser = {}) {
  const nombre = getProfileField(profile, 'nombre') || text(fallbackUser.nombre || fallbackUser.name);
  const apellido = getProfileField(profile, 'apellido') || text(fallbackUser.apellido || fallbackUser.last_name);
  return [nombre, apellido].filter(Boolean).join(' ').trim() || nombre || 'Desarrollador';
}

function getSkillType(skill = {}) {
  return normalizeText(skill.tipo || skill.habilidad?.tipo || skill.catalogo_habilidad?.tipo);
}

function getExperienceType(experience = {}) {
  return normalizeText(experience.tipo_experiencia || experience.tipo);
}

function buildRequirements({ profileComplete, counts }) {
  return [
    { id: 'profile', label: 'Completar datos del perfil', complete: profileComplete },
    { id: 'laboral', label: 'Agregar una experiencia laboral', complete: counts.laboralExperiences > 0 },
    { id: 'academic', label: 'Agregar una experiencia academica', complete: counts.academicExperiences > 0 },
    { id: 'project', label: 'Agregar un proyecto', complete: counts.projects > 0 },
    { id: 'technicalSkill', label: 'Agregar una habilidad tecnica', complete: counts.technicalSkills > 0 },
    { id: 'softSkill', label: 'Agregar una habilidad blanda', complete: counts.softSkills > 0 },
    { id: 'link', label: 'Agregar una red profesional', complete: counts.links > 0 },
  ];
}

export async function fetchDashboardSummary({ force = false } = {}) {
  const { user, userId, token } = getSession();

  const [
    profileResult,
    skillsResult,
    experiencesResult,
    projectsResult,
    linksResult,
  ] = await Promise.allSettled([
    apiFetch(`/profile/${userId}`, token, { userId, force }),
    apiFetch(`/habilidades/usuario/${userId}`, token, { userId, force }),
    apiFetch(`/experiencias/usuario/${userId}`, token, { userId, force }),
    apiFetch(`/projects/usuario/${userId}`, token, { userId, force }),
    apiFetch(`/enlaces/${userId}`, token, { userId, force }),
  ]);

  const profile = profileResult.status === 'fulfilled'
    ? unwrapProfile(profileResult.value)
    : null;
  const skills = skillsResult.status === 'fulfilled' ? unwrapList(skillsResult.value) : [];
  const experiences = experiencesResult.status === 'fulfilled' ? unwrapList(experiencesResult.value) : [];
  const projects = projectsResult.status === 'fulfilled' ? unwrapList(projectsResult.value) : [];
  const links = linksResult.status === 'fulfilled' ? unwrapList(linksResult.value) : [];

  const technicalSkills = skills.filter((skill) => getSkillType(skill).startsWith('tecnic'));
  const softSkills = skills.filter((skill) => getSkillType(skill).startsWith('bland'));
  const laboralExperiences = experiences.filter((experience) => getExperienceType(experience).includes('laboral'));
  const academicExperiences = experiences.filter((experience) => getExperienceType(experience).includes('academic'));

  const counts = {
    projects: projects.length,
    skills: skills.length,
    technicalSkills: technicalSkills.length,
    softSkills: softSkills.length,
    experiences: experiences.length,
    laboralExperiences: laboralExperiences.length,
    academicExperiences: academicExperiences.length,
    links: links.length,
  };

  const profileComplete = isProfileComplete(profile);
  const requirements = buildRequirements({ profileComplete, counts });
  const completedRequirements = requirements.filter((item) => item.complete).length;
  const progress = Math.round((completedRequirements / requirements.length) * 100);
  const missingRequirements = requirements
    .filter((item) => !item.complete)
    .map((item) => item.label);

  const summary = {
    counts,
    progress,
    completedRequirements,
    totalRequirements: requirements.length,
    missingRequirements,
    profileComplete,
    profileName: getProfileName(profile, user),
  };

  saveCachedDashboardSummary(userId, summary);
  return summary;
}
