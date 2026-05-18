import { useEffect, useMemo, useState } from 'react';
import {
  getProyectoParticipantesCache,
  getProyectoParticipantes,
  normalizeProyectoParticipantes,
} from '../services/projectsService';
import ProjectParticipantAvatar from './ProjectParticipantAvatar';

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

function normalizeText(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function participantKey(participante = {}) {
  const userId = participante.id_usuario || participante.idUsuario;
  if (userId) return `usuario:${userId}`;

  const githubId = participante.github_id || participante.githubId;
  if (githubId) return `github-id:${githubId}`;

  const github = participante.github_username || participante.login;
  if (github) return `github:${normalizeText(github)}`;

  const email = participante.email || participante.correo;
  if (email) return `email:${normalizeText(email)}`;

  const avatar = participante.avatar_url || participante.avatarUrl;
  if (avatar) return `avatar:${String(avatar).split('?')[0].toLowerCase()}`;

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
      ...current,
      ...participante,
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

const PARTICIPANT_GROUPS = [
  {
    key: 'usuario_github_validado',
    label: 'Validados',
    match: (participante) => participante.tipo_participante === 'usuario_github_validado'
      || (participante.tiene_cuenta && participante.validacion_github),
  },
  {
    key: 'usuario_sin_validacion_github',
    label: 'Sin validacion',
    match: (participante) => participante.tipo_participante === 'usuario_sin_validacion_github'
      || (participante.id_usuario && !participante.validacion_github),
  },
];

function groupParticipants(participantes = []) {
  const assigned = new Set();

  const groups = PARTICIPANT_GROUPS.map((group) => {
    const items = participantes.filter((participante, index) => {
      if (assigned.has(index) || !group.match(participante)) return false;
      assigned.add(index);
      return true;
    });

    return { ...group, items };
  }).filter(group => group.items.length > 0);

  const unassigned = participantes.filter((_, index) => !assigned.has(index));

  if (unassigned.length > 0) {
    const sinValidacion = groups.find(group => group.key === 'usuario_sin_validacion_github');

    if (sinValidacion) {
      sinValidacion.items = [...sinValidacion.items, ...unassigned];
    } else {
      groups.push({
        key: 'usuario_sin_validacion_github',
        label: 'Sin validacion',
        items: unassigned,
      });
    }
  }

  return groups;
}

function ParticipantsList({ participantes = [] }) {
  if (participantes.length === 0) return null;

  return (
    <div className="prj-collab-avatar-stack">
      {participantes.map((participante, index) => (
        <ProjectParticipantAvatar
          key={`${participante.id || participante.id_usuario || participante.github_username || index}`}
          participante={participante}
        />
      ))}
    </div>
  );
}

function ParticipantGroup({ label, participantes = [] }) {
  if (participantes.length === 0) return null;

  return (
    <div className="prj-collab-row">
      <div className="prj-collab-label">
        <span>{label}</span>
        <span>{participantes.length}</span>
      </div>
      <ParticipantsList participantes={participantes} />
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

  useEffect(() => {
    const projectId = getProjectId(proyecto);
    const shouldFetchBackend = Boolean(projectId);

    setParticipantes(initialParticipants);

    if (!shouldFetchBackend) {
      setLoading(false);
      return undefined;
    }

    let isActive = true;
    const cachedParticipants = getProyectoParticipantesCache(projectId);

    if (cachedParticipants.length > 0) {
      setParticipantes(cachedParticipants);
      setLoading(false);
    } else {
      setLoading(true);
    }

    const requests = [
      getProyectoParticipantes(projectId).catch(() => []),
    ];

    Promise.all(requests)
      .then(([platformItems]) => {
        if (!isActive) return;
        const baseParticipants = (directParticipants.length === 0 || cachedParticipants.length > 0) && platformItems.length > 0
          ? []
          : (cachedParticipants.length > 0 ? cachedParticipants : initialParticipants);
        const merged = mergeParticipants(baseParticipants, platformItems);
        setParticipantes(merged.length > 0 ? merged : baseParticipants);
      })
      .finally(() => {
        if (!isActive) return;
        setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [proyecto, initialParticipants, directParticipants.length]);

  const visibles = participantes.length > 0 ? participantes : initialParticipants;
  const groupedParticipants = useMemo(() => groupParticipants(visibles), [visibles]);

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
        {groupedParticipants.map((group) => (
          <ParticipantGroup
            key={group.key}
            label={group.label}
            participantes={group.items}
          />
        ))}

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
