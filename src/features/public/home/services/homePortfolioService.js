import { get } from '../../../../services/http/Service';
import {
  publicCacheKey,
  readPublicCache,
  withPublicCache,
} from '../../services/publicCache';
import { getStoredUser } from '../../../../shared/utils/authStorage';

const FEATURED_TTL_MS = 2 * 60 * 1000;
const RECENT_PROJECTS_TTL_MS = 2 * 60 * 1000;
const ALL_PROJECTS_TTL_MS = 3 * 60 * 1000;
const PROJECT_DETAIL_TTL_MS = 2 * 60 * 1000;
const STATS_TTL_MS = 2 * 60 * 1000;

function featuredCacheKey(search = '') {
  return publicCacheKey('home:featured', {
    limit: 6,
    q: String(search || '').trim(),
  });
}

function statsCacheKey() {
  return publicCacheKey('home:stats', 'summary');
}

function recentProjectsCacheKey() {
  return publicCacheKey('home:recent-projects', { limit: 12 });
}

function allProjectsCacheKey() {
  return publicCacheKey('projects:list', { limit: 24 });
}

function projectDetailCacheKey(projectId) {
  const user = getStoredUser();
  const userId = user?.id_usuario || user?.id || user?.idUsuario || 'anonymous';
  return publicCacheKey('projects:detail', { projectId, userId });
}

function normalizeRecentProject(project = {}) {
  const cover = project.imagen_portada || {};

  return {
    ...project,
    id: project.id ?? project.id_proyecto,
    title: project.titulo || project.title || 'Proyecto sin titulo',
    description: project.descripcion || project.description || '',
    type: project.tipo || project.categoria_proyecto || 'sin_especificar',
    platform: project.desarrollado_para || project.plataforma_objetivo || 'sin_especificar',
    publishedAt: project.publicado_at || project.updated_at || '',
    imageUrl: cover.imagen_detail_url || cover.imagen_card_url || cover.url || '',
    technologies: Array.isArray(project.tecnologias_detalle)
      ? project.tecnologias_detalle
      : (project.tecnologias || []).map((name) => ({ nombre: name })),
  };
}

export const getCachedFeaturedPortfolios = (search = '') => (
  readPublicCache(featuredCacheKey(search), { ttlMs: FEATURED_TTL_MS }) || null
);

export const getFeaturedPortfolios = async (search = '', { force = false } = {}) => {
  const params = new URLSearchParams({ limit: '6' });
  const term = String(search || '').trim();

  if (term) {
    params.set('q', term);
  }

  return withPublicCache(
    featuredCacheKey(search),
    async () => {
      const response = await get(`/home/portafolios-destacados?${params.toString()}`);
      return response?.data ?? {};
    },
    { force, ttlMs: FEATURED_TTL_MS },
  );
};

export const getCachedRecentProjects = () => (
  readPublicCache(recentProjectsCacheKey(), { ttlMs: RECENT_PROJECTS_TTL_MS }) || null
);

export const getCachedAllPublicProjects = () => (
  readPublicCache(allProjectsCacheKey(), { ttlMs: ALL_PROJECTS_TTL_MS }) || null
);

export const getRecentProjects = async ({ force = false } = {}) => (
  withPublicCache(
    recentProjectsCacheKey(),
    async () => {
      const response = await get('/home/proyectos-recientes?limit=12');
      const payload = response?.data ?? {};

      return {
        ...payload,
        hero: Array.isArray(payload.hero) ? payload.hero.map(normalizeRecentProject) : [],
        recientes: Array.isArray(payload.recientes) ? payload.recientes.map(normalizeRecentProject) : [],
      };
    },
    { force, ttlMs: RECENT_PROJECTS_TTL_MS },
  )
);

export const getPublicProjectDetail = async (projectId, { force = false } = {}) => {
  if (!projectId) throw new Error('No se encontro el proyecto seleccionado.');

  return withPublicCache(
    projectDetailCacheKey(projectId),
    async () => {
      const response = await get(`/projects/public/${encodeURIComponent(projectId)}`);
      return response?.data ?? {};
    },
    { force, ttlMs: PROJECT_DETAIL_TTL_MS },
  );
};

export const getAllPublicProjects = async ({ force = false } = {}) => (
  withPublicCache(
    allProjectsCacheKey(),
    async () => {
      const response = await get('/home/proyectos-recientes?limit=24');
      const payload = response?.data ?? {};

      return Array.isArray(payload.recientes) ? payload.recientes.map(normalizeRecentProject) : [];
    },
    { force, ttlMs: ALL_PROJECTS_TTL_MS },
  )
);

export const getHomeStats = async ({ force = false } = {}) => (
  withPublicCache(
    statsCacheKey(),
    async () => {
      const response = await get('/home/stats');
      return response?.data ?? {};
    },
    { force, ttlMs: STATS_TTL_MS },
  )
);
