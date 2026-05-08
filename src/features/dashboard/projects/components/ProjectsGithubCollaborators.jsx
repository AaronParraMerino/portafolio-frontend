import { useEffect, useMemo, useState } from 'react';
import {
  getProyectoParticipantes,
  normalizeProyectoParticipantes,
} from '../services/projectsService';

const githubParticipantsCache = new Map();

function getProjectId(project = {}) {
  return project.id || project.id_proyecto || project.idProyecto || null;
}

function getExpectedCount(project = {}, fallback = 0) {
  const raw =
    project.participantes_count ??
    project.participants_count ??
    project.colaboradores_count ??
    project.collaborators_count;
  const count = Number(raw);

  return Number.isFinite(count) && count > 0 ? count : fallback;
}

function getInitials(name = '') {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return '?';

  return parts
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
}

function normalizeText(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function normalizeRepoUrl(url = '') {
  return String(url || '').trim().replace(/\/+$/, '');
}

function getProjectRepoUrls(project = {}) {
  if (Array.isArray(project.url_repositorios)) {
    return project.url_repositorios
      .map(normalizeRepoUrl)
      .filter(Boolean);
  }

  return normalizeRepoUrl(project.url_repositorio)
    ? [normalizeRepoUrl(project.url_repositorio)]
    : [];
}

function parseGithubRepoUrl(repoUrl = '') {
  try {
    const parsed = new URL(repoUrl);
    const host = parsed.hostname.toLowerCase();

    if (!['github.com', 'www.github.com'].includes(host)) {
      return null;
    }

    const [owner, repo] = parsed.pathname
      .split('/')
      .map(part => part.trim())
      .filter(Boolean);

    if (!owner || !repo) return null;

    return {
      owner,
      repo: repo.replace(/\.git$/i, ''),
      url: `https://github.com/${owner}/${repo.replace(/\.git$/i, '')}`,
    };
  } catch {
    return null;
  }
}

function githubAvatarUrl(login = '') {
  return login ? `https://github.com/${encodeURIComponent(login)}.png?size=96` : '';
}

function participantKey(participante = {}) {
  const github = participante.github_username || participante.login;
  if (github) return `github:${normalizeText(github)}`;

  const email = participante.email || participante.correo;
  if (email) return `email:${normalizeText(email)}`;

  const avatar = participante.avatar_url || participante.avatarUrl;
  if (avatar) return `avatar:${String(avatar).split('?')[0].toLowerCase()}`;

  const userId = participante.id_usuario || participante.idUsuario;
  if (userId) return `usuario:${userId}`;

  const id = participante.id || participante.id_participacion;
  if (id) return `id:${id}`;

  return `nombre:${normalizeText(participante.nombre)}`;
}

function mergeParticipants(...groups) {
  const map = new Map();

  groups.flat().forEach((participante) => {
    if (!participante) return;

    const key = participantKey(participante);
    const current = map.get(key);

    map.set(key, {
      ...participante,
      ...current,
      nombre: current?.nombre || participante.nombre || participante.github_username || 'Participante',
      avatar_url: current?.avatar_url || participante.avatar_url || '',
      github_username: current?.github_username || participante.github_username || '',
      email: current?.email || participante.email || participante.correo || '',
      repositorios: [
        ...(current?.repositorios || []),
        ...(participante.repositorios || []),
      ].filter(Boolean),
    });
  });

  return Array.from(map.values()).sort((a, b) => {
    if (a.tipo_rol === b.tipo_rol) {
      return (a.nombre || '').localeCompare(b.nombre || '');
    }

    if (a.tipo_rol === 'owner') return -1;
    if (b.tipo_rol === 'owner') return 1;
    return 0;
  });
}

async function fetchGithubRepoParticipants(repoInfo) {
  if (!repoInfo?.owner || !repoInfo?.repo) return [];

  const ownerParticipant = {
    id: `github-owner-${repoInfo.owner}`,
    nombre: repoInfo.owner,
    avatar_url: githubAvatarUrl(repoInfo.owner),
    github_username: repoInfo.owner,
    tipo_rol: 'owner',
    rol_label: 'Owner',
    source: 'github',
    repositorios: [repoInfo.url],
  };

  try {
    const endpoint = `https://api.github.com/repos/${encodeURIComponent(repoInfo.owner)}/${encodeURIComponent(repoInfo.repo)}/contributors?per_page=100`;
    const res = await fetch(endpoint, {
      headers: {
        Accept: 'application/vnd.github+json',
      },
    });

    if (!res.ok) {
      return [ownerParticipant];
    }

    const payload = await res.json();
    const contributors = Array.isArray(payload) ? payload : [];

    return mergeParticipants(
      [ownerParticipant],
      contributors.map((item, index) => ({
        id: item.id || `github-contributor-${repoInfo.owner}-${repoInfo.repo}-${index}`,
        nombre: item.login || `Participante ${index + 1}`,
        avatar_url: item.avatar_url || githubAvatarUrl(item.login),
        github_username: item.login || '',
        tipo_rol: item.login === repoInfo.owner ? 'owner' : 'colaborador',
        rol_label: item.login === repoInfo.owner ? 'Owner' : 'Colaborador',
        source: 'github',
        contributions: item.contributions || 0,
        repositorios: [repoInfo.url],
      }))
    );
  } catch {
    return [ownerParticipant];
  }
}

async function getGithubParticipantsForRepos(repoUrls = []) {
  const repos = repoUrls
    .map(parseGithubRepoUrl)
    .filter(Boolean);

  if (repos.length === 0) return [];

  const cacheKey = repos.map(repo => repo.url.toLowerCase()).sort().join('|');

  if (githubParticipantsCache.has(cacheKey)) {
    return githubParticipantsCache.get(cacheKey);
  }

  const request = Promise.all(repos.map(fetchGithubRepoParticipants))
    .then((groups) => mergeParticipants(...groups));

  githubParticipantsCache.set(cacheKey, request);

  return request;
}

function ParticipantAvatar({ participante }) {
  const [imageFailed, setImageFailed] = useState(false);
  const nombre = participante.nombre || participante.github_username || 'Participante';
  const roleDetail = participante.rol ? ` - ${participante.rol}` : '';
  const githubDetail = participante.github_username ? ` (@${participante.github_username})` : '';
  const label = `${nombre}${githubDetail}${roleDetail}`;

  return (
    <button
      type="button"
      className="prj-collab-avatar-btn"
      title={label}
      aria-label={label}
    >
      {participante.avatar_url && !imageFailed ? (
        <img
          src={participante.avatar_url}
          alt=""
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="prj-collab-initials">{getInitials(nombre)}</span>
      )}
    </button>
  );
}

function ParticipantsList({ participantes = [] }) {
  if (participantes.length === 0) return null;

  return (
    <div className="prj-collab-avatar-stack">
      {participantes.map((participante, index) => (
        <ParticipantAvatar
          key={`${participante.id || participante.id_usuario || participante.github_username || index}`}
          participante={participante}
        />
      ))}
    </div>
  );
}

export default function ProjectsGithubCollaborators({ proyecto = {}, detail = false }) {
  const directParticipants = useMemo(
    () => normalizeProyectoParticipantes(proyecto, { includeCurrentUserFallback: false }),
    [proyecto]
  );
  const initialParticipants = useMemo(
    () => directParticipants.length > 0
      ? directParticipants
      : normalizeProyectoParticipantes(proyecto),
    [directParticipants, proyecto]
  );
  const [participantes, setParticipantes] = useState(initialParticipants);
  const [loading, setLoading] = useState(false);
  const repoUrls = useMemo(() => getProjectRepoUrls(proyecto), [proyecto]);

  useEffect(() => {
    const projectId = getProjectId(proyecto);
    const expectedCount = getExpectedCount(proyecto, initialParticipants.length);
    const shouldFetchBackend = Boolean(projectId && expectedCount > initialParticipants.length);
    const shouldFetchGithub = repoUrls.length > 0;

    setParticipantes(initialParticipants);

    if (!shouldFetchBackend && !shouldFetchGithub) {
      setLoading(false);
      return undefined;
    }

    let isActive = true;
    setLoading(true);

    const requests = [
      shouldFetchBackend
        ? getProyectoParticipantes(projectId).catch(() => [])
        : Promise.resolve([]),
      shouldFetchGithub
        ? getGithubParticipantsForRepos(repoUrls).catch(() => [])
        : Promise.resolve([]),
    ];

    Promise.all(requests)
      .then(([platformItems, githubItems]) => {
        if (!isActive) return;
        const baseParticipants = directParticipants.length === 0 && githubItems.length > 0
          ? []
          : initialParticipants;
        const merged = mergeParticipants(baseParticipants, platformItems, githubItems);
        setParticipantes(merged.length > 0 ? merged : initialParticipants);
      })
      .finally(() => {
        if (!isActive) return;
        setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [proyecto, initialParticipants, repoUrls, directParticipants.length]);

  const visibles = participantes.length > 0 ? participantes : initialParticipants;

  if (visibles.length === 0 && !loading) {
    return null;
  }

  return (
    <div className={`prj-collaborators${detail ? ' detail' : ''}`} aria-busy={loading}>
      <div className="prj-collab-head">
        <span>Participantes</span>
        <span>{Math.max(getExpectedCount(proyecto, visibles.length), visibles.length)}</span>
      </div>

      <div className="prj-collab-groups">
        <ParticipantsList participantes={visibles} />

        {loading && visibles.length === 0 && (
          <div className="prj-collab-loading">
            <span />
            <span />
            <span />
          </div>
        )}
      </div>
    </div>
  );
}
