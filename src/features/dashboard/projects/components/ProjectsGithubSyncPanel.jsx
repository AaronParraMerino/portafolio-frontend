import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  attachDetectedReposToProject,
  getGithubConnectUrl,
  getGithubDetectedRepos,
  isGithubLinked,
  syncGithubRepos,
} from '../services/projectsService';
import '../styles/projects.css';

const MAX_REPOSITORIOS_GITHUB = 3;
const EMPTY_SELECTED_REPOS = [];
const PROVIDER_META = {
  github: {
    name: 'GitHub',
    reposLabel: 'repositorios GitHub',
    privateHint: 'Repos privados: vincula GitHub para sincronizarlos. Repos publicos: tambien puedes pegarlos directo al crear o editar.',
    connectLabel: 'Vincular GitHub',
  },
  gitlab: {
    name: 'GitLab',
    reposLabel: 'repositorios GitLab',
    privateHint: 'Repos privados: vincula GitLab para sincronizarlos. Repos publicos: tambien puedes pegarlos directo al crear o editar.',
    connectLabel: 'Vincular GitLab',
  },
};

function normalizarGithubUrl(url = '') {
  return String(url || '').trim().replace(/\/+$/, '').toLowerCase();
}

function normalizeInitialSelectedRepos(initialSelectedRepos = []) {
  if (!Array.isArray(initialSelectedRepos)) return [];

  const byUrl = new Map();

  initialSelectedRepos.forEach((item) => {
    const repo = typeof item === 'string'
      ? { url: item, nombre: item }
      : {
        id: Number(item?.id || item?.id_proyecto_repositorio) || null,
        url: String(item?.url || item?.url_repositorio || '').trim(),
        nombre: item?.nombre || item?.repo_github?.repo_name || item?.url || item?.url_repositorio || 'Repositorio GitHub',
        isPrivate: Boolean(item?.isPrivate || item?.repo_github?.is_private),
      };

    if (!repo.url) return;
    byUrl.set(normalizarGithubUrl(repo.url), repo);
  });

  return Array.from(byUrl.values()).slice(0, MAX_REPOSITORIOS_GITHUB);
}

function getRepoTitle(repo = {}) {
  return repo.nombre || repo.repo_github?.repo_name || 'Repositorio GitHub';
}

function getRepoSelection(repo = {}) {
  const url = String(repo?.url_repositorio || '').trim();

  return {
    id: Number(repo?.id_proyecto_repositorio) || null,
    url,
    nombre: getRepoTitle(repo),
    isPrivate: Boolean(repo?.repo_github?.is_private),
  };
}

function GithubParticipationModal({ repo, loading, onClose, onConfirm }) {
  const [rol, setRol] = useState('');
  const [descripcion, setDescripcion] = useState('');

  return (
    <div className="prj-modal-overlay" style={{ zIndex: 760 }}>
      <div className="prj-modal prj-modal-sm" role="dialog" aria-modal="true">
        <div className="prj-modal-head">
          <div>
            <div className="prj-modal-title">Tu participacion en el proyecto</div>
            <div className="prj-modal-sub">Este repositorio ya pertenece a otro proyecto</div>
          </div>
        </div>

        <div className="prj-modal-body">
          <div className="prj-detected-item" style={{ marginBottom: 14 }}>
            <div className="prj-detected-main">
              <div className="prj-detected-title">{repo?.proyecto?.titulo || 'Proyecto existente'}</div>
              {repo?.url_repositorio && <div className="prj-detected-url">{repo.url_repositorio}</div>}
            </div>
            <div className="prj-detected-side">
              <span className="prj-detected-pill warn">en uso</span>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12">
              <label className="prj-label">Rol</label>
              <input
                className="prj-input"
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                placeholder="Ej: Desarrollador backend, Lider tecnico..."
                maxLength={100}
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="col-12">
              <label className="prj-label">
                Descripcion del aporte
                <span className="prj-char-count">{descripcion.length}/600</span>
              </label>
              <textarea
                className="prj-input"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                placeholder="Describe brevemente tus contribuciones..."
                maxLength={601}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className="prj-modal-foot">
          <button type="button" className="prj-btn-cancel" onClick={onClose} disabled={loading}>
            <span>Cancelar</span>
          </button>
          <button
            type="button"
            className="prj-btn-save"
            onClick={() => onConfirm({ rol: rol.trim(), descripcion_aporte: descripcion.trim() })}
            disabled={loading}
          >
            {loading && <span className="prj-spinner" />}
            <span>{loading ? 'Vinculando...' : 'Ser parte'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsGithubSyncPanel({
  expandSignal = 0,
  provider = 'github',
  initialSelectedRepos = EMPTY_SELECTED_REPOS,
  actionLabel = 'Agregar proyecto con repos',
  connectInNewTab = false,
  onAgregarConRepos,
  onSelectRepos,
  onReposChanged,
}) {
  const providerMeta = PROVIDER_META[provider] || PROVIDER_META.github;
  const panelRef = useRef(null);
  const normalizedInitialSelectedRepos = useMemo(
    () => normalizeInitialSelectedRepos(initialSelectedRepos),
    [initialSelectedRepos],
  );
  const [githubLinked, setGithubLinked] = useState(false);
  const [checkingLinked, setCheckingLinked] = useState(true);
  const [detectedRepos, setDetectedRepos] = useState([]);
  const [selectedRepos, setSelectedRepos] = useState(() => normalizedInitialSelectedRepos);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarRepos, setMostrarRepos] = useState(false);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [syncingRepos, setSyncingRepos] = useState(false);
  const [connectingGithub, setConnectingGithub] = useState(false);
  const [joiningRepo, setJoiningRepo] = useState(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadDetectedRepos = useCallback(async (refresh = false) => {
    try {
      setLoadingRepos(true);
      setError('');
      const repos = await getGithubDetectedRepos({ refresh, provider });
      const normalized = Array.isArray(repos) ? repos : [];
      setDetectedRepos(normalized);
      return normalized;
    } catch (e) {
      setError(e.message || `No se pudieron cargar los repositorios detectados de ${providerMeta.name}.`);
      return [];
    } finally {
      setLoadingRepos(false);
    }
  }, [provider, providerMeta.name]);

  useEffect(() => {
    let mounted = true;

    const boot = async () => {
      try {
        setCheckingLinked(true);
        const linked = await isGithubLinked({ provider });
        if (!mounted) return;

        setGithubLinked(linked);
      } catch {
        if (mounted) setGithubLinked(false);
      } finally {
        if (mounted) setCheckingLinked(false);
      }
    };

    boot();

    return () => {
      mounted = false;
    };
  }, [provider, providerMeta.name]);

  useEffect(() => {
    if (!githubLinked || !mostrarRepos || loadingRepos || detectedRepos.length > 0) {
      return;
    }

    loadDetectedRepos(false);
  }, [detectedRepos.length, githubLinked, loadDetectedRepos, loadingRepos, mostrarRepos]);

  useEffect(() => {
    if (!expandSignal) return;
    setMostrarRepos(true);
    panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [expandSignal]);

  useEffect(() => {
    setSelectedRepos(normalizedInitialSelectedRepos);
  }, [normalizedInitialSelectedRepos]);

  const selectedByUrl = useMemo(() => new Set(
    selectedRepos.map((repo) => normalizarGithubUrl(repo.url))
  ), [selectedRepos]);

  const reposFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return detectedRepos;

    return detectedRepos.filter((repo) => {
      const nombre = String(repo?.nombre || repo?.repo_github?.repo_name || '').toLowerCase();
      const url = String(repo?.url_repositorio || '').toLowerCase();
      const proyectoTitulo = String(repo?.proyecto?.titulo || '').toLowerCase();
      const estado = String(repo?.estado_vinculacion || '').toLowerCase();
      const validacion = String(repo?.validacion?.relacion_github || '').toLowerCase();

      return (
        nombre.includes(q) ||
        url.includes(q) ||
        proyectoTitulo.includes(q) ||
        estado.includes(q) ||
        validacion.includes(q)
      );
    });
  }, [busqueda, detectedRepos]);

  const handleSync = useCallback(async () => {
    try {
      setSyncingRepos(true);
      setError('');
      setNotice('');
      const result = await syncGithubRepos({ provider });
      await loadDetectedRepos(false);
      setMostrarRepos(true);
      setNotice(formatGithubSyncNotice(result?.stats, providerMeta.name));
    } catch (e) {
      setError(e.message || `No se pudo sincronizar con ${providerMeta.name}.`);
    } finally {
      setSyncingRepos(false);
    }
  }, [loadDetectedRepos, provider, providerMeta.name]);

  const handleConnectGithub = useCallback(async () => {
    try {
      setConnectingGithub(true);
      setError('');
      const url = await getGithubConnectUrl({ provider });
      if (!url) throw new Error(`No se pudo iniciar la vinculacion con ${providerMeta.name}.`);

      if (connectInNewTab) {
        window.open(url, '_blank', 'noopener,noreferrer');
        setNotice(`Completa la vinculacion de ${providerMeta.name} en la nueva pestana y luego vuelve para sincronizar.`);
        setConnectingGithub(false);
        return;
      }

      window.location.assign(url);
    } catch (e) {
      setError(e.message || `No se pudo iniciar la vinculacion con ${providerMeta.name}.`);
      setConnectingGithub(false);
    }
  }, [connectInNewTab, provider, providerMeta.name]);

  const toggleSelectedRepo = useCallback((repo) => {
    const item = getRepoSelection(repo);
    if (!item.url) return;

    setSelectedRepos((prev) => {
      const key = normalizarGithubUrl(item.url);
      const exists = prev.some((current) => normalizarGithubUrl(current.url) === key);

      if (exists) {
        return prev.filter((current) => normalizarGithubUrl(current.url) !== key);
      }

      if (prev.length >= MAX_REPOSITORIOS_GITHUB) return prev;
      return [...prev, item];
    });
  }, []);

  const removeSelectedRepo = useCallback((url) => {
    const key = normalizarGithubUrl(url);
    setSelectedRepos((prev) => prev.filter((repo) => normalizarGithubUrl(repo.url) !== key));
  }, []);

  const handleAgregarProyecto = useCallback(() => {
    const selection = {
      repositorios: selectedRepos.map((repo) => repo.url),
      detected_repo_ids: selectedRepos
        .map((repo) => Number(repo.id))
        .filter((id) => Number.isInteger(id) && id > 0),
      detected_repos: selectedRepos,
    };

    if (typeof onSelectRepos === 'function') {
      onSelectRepos(selection);
      return;
    }

    if (typeof onAgregarConRepos === 'function') {
      onAgregarConRepos(selection);
    }
  }, [onAgregarConRepos, onSelectRepos, selectedRepos]);

  const handleJoinRepo = useCallback(async (participacionData) => {
    if (!joiningRepo) return;

    try {
      setJoinLoading(true);
      setError('');
      setNotice('');
      await attachDetectedReposToProject(
        joiningRepo.id_proyecto,
        [joiningRepo.id_proyecto_repositorio],
        participacionData,
        { provider },
      );

      setJoiningRepo(null);
      setNotice('Tu participacion fue vinculada al proyecto existente.');
      await loadDetectedRepos(false);
      if (typeof onReposChanged === 'function') {
        await onReposChanged();
      }
    } catch (e) {
      setError(e.message || 'No se pudo vincular tu participacion al proyecto.');
    } finally {
      setJoinLoading(false);
    }
  }, [joiningRepo, loadDetectedRepos, onReposChanged, provider]);

  return (
    <div ref={panelRef} className="prj-github-panel">
      <div className="prj-detected-repos-box prj-github-sync-box">
        <div className="prj-detected-repos-head">
          <div>
            <span>Sincronizacion de {providerMeta.reposLabel}</span>
            <div className="prj-field-hint prj-github-private-hint">
              {providerMeta.privateHint}
            </div>
          </div>

          <div className="prj-detected-actions">
            {githubLinked ? (
              <>
                <button
                  type="button"
                  className="prj-detected-sync-btn"
                  disabled={checkingLinked || loadingRepos || syncingRepos}
                  onClick={handleSync}
                >
                  {syncingRepos ? 'Sincronizando...' : 'Sincronizar'}
                </button>

                <button
                  type="button"
                  className="prj-detected-sync-btn"
                  onClick={() => setMostrarRepos((prev) => !prev)}
                  disabled={checkingLinked}
                >
                  {mostrarRepos ? 'Ocultar repos' : 'Mostrar repos'}
                </button>
              </>
            ) : (
              <button
                type="button"
                className="prj-detected-sync-btn"
                onClick={handleConnectGithub}
                disabled={checkingLinked || connectingGithub}
              >
                {connectingGithub ? 'Conectando...' : providerMeta.connectLabel}
              </button>
            )}
          </div>
        </div>

        {error && <div className="prj-detected-error">{error}</div>}
        {notice && <div className="prj-detected-notice">{notice}</div>}

        {!githubLinked && !checkingLinked && (
          <div className="prj-detected-muted">
            Sin una cuenta vinculada no se pueden listar repos privados. Para repos publicos, usa Agregar nuevo y pega la URL del repositorio.
          </div>
        )}

        {githubLinked && (
          <>
            <div className="prj-github-selected-strip">
              <div className="prj-detected-muted">
                Seleccionados {selectedRepos.length}/{MAX_REPOSITORIOS_GITHUB}
              </div>

              {selectedRepos.length > 0 && (
                <div className="prj-github-selected-list">
                  {selectedRepos.map((repo) => (
                    <button
                      key={repo.url}
                      type="button"
                      className="prj-github-selected-chip"
                      onClick={() => removeSelectedRepo(repo.url)}
                      title="Quitar repositorio"
                    >
                      {repo.nombre}
                      <span>x</span>
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                className="prj-btn-add prj-github-create-btn"
                onClick={handleAgregarProyecto}
                disabled={selectedRepos.length === 0}
              >
                <svg viewBox="0 0 12 12">
                  <path d="M6 1v10M1 6h10" />
                </svg>
                <span>{actionLabel}</span>
              </button>
            </div>

            {mostrarRepos && (
              <>
                {detectedRepos.length > 0 && (
                  <div className="prj-detected-search-wrap">
                    <input
                      type="search"
                      className="prj-input prj-detected-search-input"
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      placeholder="Buscar repositorio por nombre, URL, proyecto o estado..."
                      disabled={loadingRepos}
                    />

                    {busqueda && (
                      <button
                        type="button"
                        className="prj-detected-search-clear"
                        onClick={() => setBusqueda('')}
                        disabled={loadingRepos}
                        title="Limpiar busqueda"
                      >
                        x
                      </button>
                    )}
                  </div>
                )}

                {loadingRepos ? (
                  <div className="prj-detected-muted">Cargando repositorios detectados...</div>
                ) : detectedRepos.length === 0 ? (
                  <div className="prj-detected-muted">No hay repositorios detectados. Ejecuta la sincronizacion para actualizar la lista.</div>
                ) : reposFiltrados.length === 0 ? (
                  <div className="prj-detected-muted">No se encontraron repositorios con "{busqueda}".</div>
                ) : (
                  <div className="prj-detected-list">
                    {reposFiltrados.map((repo) => {
                      const url = repo?.url_repositorio || '';
                      const enUso = repo?.estado_vinculacion === 'en_uso';
                      const selected = selectedByUrl.has(normalizarGithubUrl(url));
                      const limitReached = selectedRepos.length >= MAX_REPOSITORIOS_GITHUB && !selected;

                      return (
                        <div
                          key={repo.id_proyecto_repositorio || url}
                          className={`prj-detected-item${selected ? ' selected' : ''}`}
                        >
                          <div className="prj-detected-main">
                            <div className="prj-detected-title">
                              {getRepoTitle(repo)}
                            </div>
                            <div className="prj-detected-url">{url}</div>
                            {enUso && repo?.proyecto?.titulo && (
                              <div className="prj-detected-url">Proyecto: {repo.proyecto.titulo}</div>
                            )}
                          </div>

                          <div className="prj-detected-side">
                            {repo?.repo_github?.is_private && (
                              <span className="prj-detected-pill warn">privado</span>
                            )}
                            <span className={`prj-detected-pill ${enUso ? 'warn' : repo?.validacion?.validado ? 'ok' : 'warn'}`}>
                              {enUso
                                ? 'en uso'
                                : repo?.validacion?.validado
                                  ? (repo?.validacion?.relacion_github || 'validado')
                                  : 'sin validar'}
                            </span>

                            {enUso ? (
                              <button
                                type="button"
                                className="prj-detected-add-btn"
                                onClick={() => setJoiningRepo(repo)}
                                disabled={!repo?.puede_unirse || joinLoading}
                              >
                                Ser parte
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="prj-detected-add-btn"
                                onClick={() => toggleSelectedRepo(repo)}
                                disabled={limitReached}
                              >
                                {selected ? 'Quitar' : 'Seleccionar'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {joiningRepo && (
        <GithubParticipationModal
          repo={joiningRepo}
          loading={joinLoading}
          onClose={() => !joinLoading && setJoiningRepo(null)}
          onConfirm={handleJoinRepo}
        />
      )}
    </div>
  );
}

function formatGithubSyncNotice(stats = {}, providerName = 'GitHub') {
  const creados = Number(stats?.creados ?? 0);
  const actualizados = Number(stats?.actualizados ?? 0);
  const detalles = Number(stats?.detalles_actualizados ?? 0);
  const pendientes = Number(stats?.detalles_omitidos_por_limite ?? 0);

  const parts = [
    `Repositorios sincronizados con ${providerName}.`,
    `Nuevos: ${Number.isFinite(creados) ? creados : 0}.`,
    `Actualizados: ${Number.isFinite(actualizados) ? actualizados : 0}.`,
  ];

  if (Number.isFinite(detalles) && detalles > 0) {
    parts.push(`Detalles completados: ${detalles}.`);
  }

  if (Number.isFinite(pendientes) && pendientes > 0) {
    parts.push(`Detalles pendientes por limite: ${pendientes}.`);
  }

  return parts.join(' ');
}
