import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  attachDetectedReposToProject,
  getGithubConnectUrl,
  getGithubDetectedRepos,
  isGithubLinked,
  syncGithubRepos,
} from '../services/projectsService';
import RepositoryProviderIcon from './RepositoryProviderIcon';
import '../styles/projects.css';

const MAX_SELECTED_REPOS = 3;
const PROVIDERS = ['github', 'gitlab'];
const PROVIDER_NAMES = {
  github: 'GitHub',
  gitlab: 'GitLab',
};

function normalizeUrl(url = '') {
  return String(url || '').trim().replace(/\/+$/, '').toLowerCase();
}

function providerOf(repo = {}) {
  return repo.proveedor || repo.provider || 'github';
}

function getRepoTitle(repo = {}) {
  return repo.nombre || repo.repo_github?.repo_name || 'Repositorio';
}

function getSelection(repo = {}) {
  return {
    id: Number(repo.id_proyecto_repositorio) || null,
    url: String(repo.url_repositorio || '').trim(),
    nombre: getRepoTitle(repo),
    isPrivate: Boolean(repo.repo_github?.is_private),
    provider: providerOf(repo),
  };
}

function ParticipationModal({ repo, loading, onClose, onConfirm }) {
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
            <span className="prj-detected-pill warn">en uso</span>
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
                maxLength={600}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className="prj-modal-foot">
          <button type="button" className="prj-btn-cancel" onClick={onClose} disabled={loading}>
            Cancelar
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

export default function ProjectsRepositoriesSyncBar({
  expandSignal = 0,
  onAgregarConRepos,
  onReposChanged,
}) {
  const panelRef = useRef(null);
  const [linked, setLinked] = useState({ github: false, gitlab: false });
  const [checkingLinked, setCheckingLinked] = useState(true);
  const [syncing, setSyncing] = useState({ github: false, gitlab: false });
  const [connecting, setConnecting] = useState({ github: false, gitlab: false });
  const [detectedRepos, setDetectedRepos] = useState([]);
  const [selectedRepos, setSelectedRepos] = useState([]);
  const [showRepos, setShowRepos] = useState(false);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [joiningRepo, setJoiningRepo] = useState(null);
  const [joinLoading, setJoinLoading] = useState(false);

  const loadDetectedRepos = useCallback(async (currentLinked = linked) => {
    const enabled = PROVIDERS.filter((provider) => currentLinked[provider]);

    if (enabled.length === 0) {
      setDetectedRepos([]);
      return [];
    }

    try {
      setLoadingRepos(true);
      setError('');
      const results = await Promise.allSettled(
        enabled.map((provider) => getGithubDetectedRepos({ provider }))
      );
      const combined = results
        .filter((result) => result.status === 'fulfilled')
        .flatMap((result) => result.value);
      const failedProviders = results
        .map((result, index) => result.status === 'rejected' ? PROVIDER_NAMES[enabled[index]] : null)
        .filter(Boolean);

      if (failedProviders.length > 0) {
        setError(`No se pudieron cargar repositorios de ${failedProviders.join(' y ')}.`);
      }

      setDetectedRepos(combined);
      return combined;
    } finally {
      setLoadingRepos(false);
    }
  }, [linked]);

  useEffect(() => {
    let mounted = true;

    Promise.all(PROVIDERS.map(async (provider) => [provider, await isGithubLinked({ provider })]))
      .then((entries) => {
        if (!mounted) return;
        setLinked(Object.fromEntries(entries));
      })
      .catch(() => {
        if (mounted) setLinked({ github: false, gitlab: false });
      })
      .finally(() => {
        if (mounted) setCheckingLinked(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (showRepos && !loadingRepos && detectedRepos.length === 0 && Object.values(linked).some(Boolean)) {
      loadDetectedRepos();
    }
  }, [detectedRepos.length, linked, loadDetectedRepos, loadingRepos, showRepos]);

  useEffect(() => {
    if (!expandSignal) return;
    setShowRepos(true);
    panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [expandSignal]);

  const handleProviderAction = useCallback(async (provider) => {
    const name = PROVIDER_NAMES[provider];

    if (!linked[provider]) {
      try {
        setConnecting((current) => ({ ...current, [provider]: true }));
        setError('');
        const url = await getGithubConnectUrl({ provider });
        if (!url) throw new Error(`No se pudo iniciar la vinculacion con ${name}.`);
        window.location.assign(url);
      } catch (e) {
        setError(e.message || `No se pudo vincular ${name}.`);
        setConnecting((current) => ({ ...current, [provider]: false }));
      }
      return;
    }

    try {
      setSyncing((current) => ({ ...current, [provider]: true }));
      setError('');
      setNotice('');
      await syncGithubRepos({ provider });
      await loadDetectedRepos();
      setShowRepos(true);
      setNotice(`Repositorios sincronizados con ${name}.`);
    } catch (e) {
      setError(e.message || `No se pudo sincronizar con ${name}.`);
    } finally {
      setSyncing((current) => ({ ...current, [provider]: false }));
    }
  }, [linked, loadDetectedRepos]);

  const toggleSelectedRepo = useCallback((repo) => {
    const item = getSelection(repo);
    if (!item.url) return;

    setSelectedRepos((current) => {
      const key = `${item.provider}:${normalizeUrl(item.url)}`;
      const selected = current.some((entry) => `${entry.provider}:${normalizeUrl(entry.url)}` === key);

      if (selected) {
        return current.filter((entry) => `${entry.provider}:${normalizeUrl(entry.url)}` !== key);
      }

      return current.length >= MAX_SELECTED_REPOS ? current : [...current, item];
    });
  }, []);

  const selectedKeys = useMemo(() => new Set(
    selectedRepos.map((repo) => `${repo.provider}:${normalizeUrl(repo.url)}`)
  ), [selectedRepos]);

  const visibleRepos = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return detectedRepos;

    return detectedRepos.filter((repo) => [
      getRepoTitle(repo),
      repo.url_repositorio,
      repo.proyecto?.titulo,
      providerOf(repo),
      repo.estado_vinculacion,
    ].some((value) => String(value || '').toLowerCase().includes(q)));
  }, [detectedRepos, search]);

  const handleCreate = () => {
    if (!selectedRepos.length || typeof onAgregarConRepos !== 'function') return;

    onAgregarConRepos({
      repositorios: selectedRepos.map((repo) => repo.url),
      detected_repo_ids: selectedRepos.map((repo) => repo.id).filter(Boolean),
      detected_repos: selectedRepos,
    });
  };

  const handleJoin = useCallback(async (participacionData) => {
    if (!joiningRepo) return;
    const provider = providerOf(joiningRepo);

    try {
      setJoinLoading(true);
      setError('');
      await attachDetectedReposToProject(
        joiningRepo.id_proyecto,
        [joiningRepo.id_proyecto_repositorio],
        participacionData,
        { provider },
      );
      setJoiningRepo(null);
      setNotice('Tu participacion fue vinculada al proyecto existente.');
      await loadDetectedRepos();
      if (typeof onReposChanged === 'function') await onReposChanged();
    } catch (e) {
      setError(e.message || 'No se pudo vincular tu participacion al proyecto.');
    } finally {
      setJoinLoading(false);
    }
  }, [joiningRepo, loadDetectedRepos, onReposChanged]);

  return (
    <div ref={panelRef} className="prj-repositories-panel">
      <div className="prj-detected-repos-box prj-repositories-sync-box">
        <div className="prj-repositories-toolbar">
          <div className="prj-provider-actions">
            {PROVIDERS.map((provider) => {
              const name = PROVIDER_NAMES[provider];
              const busy = syncing[provider] || connecting[provider];
              const label = linked[provider] ? `Sincronizar ${name}` : `Vincular ${name}`;

              return (
                <button
                  key={provider}
                  type="button"
                  className={`prj-provider-action ${provider}${linked[provider] ? ' linked' : ''}`}
                  onClick={() => handleProviderAction(provider)}
                  disabled={checkingLinked || busy}
                  aria-label={label}
                  title={label}
                >
                  <RepositoryProviderIcon provider={provider} />
                  {busy && <span className="prj-spinner" />}
                </button>
              );
            })}
          </div>

          <div className="prj-repositories-controls">
            <button
              type="button"
              className="prj-detected-sync-btn"
              onClick={() => setShowRepos((current) => !current)}
              disabled={checkingLinked || !Object.values(linked).some(Boolean)}
            >
              {showRepos ? 'Ocultar repositorios' : 'Mostrar repositorios'}
            </button>
            <button
              type="button"
              className="prj-btn-add prj-github-create-btn"
              onClick={handleCreate}
              disabled={selectedRepos.length === 0}
            >
              <svg viewBox="0 0 12 12">
                <path d="M6 1v10M1 6h10" />
              </svg>
              <span>Agregar proyecto con repos</span>
            </button>
          </div>
        </div>

        <div className="prj-repositories-caption">
          <span>Sincroniza con GitHub o GitLab desde sus iconos.</span>
          <span>Seleccionados {selectedRepos.length}/{MAX_SELECTED_REPOS}</span>
        </div>

        {selectedRepos.length > 0 && (
          <div className="prj-github-selected-list prj-repositories-selected">
            {selectedRepos.map((repo) => (
              <button
                key={`${repo.provider}:${repo.url}`}
                type="button"
                className="prj-github-selected-chip"
                onClick={() => toggleSelectedRepo(repo)}
                title="Quitar repositorio"
              >
                <RepositoryProviderIcon provider={repo.provider} />
                {repo.nombre}
                <span>x</span>
              </button>
            ))}
          </div>
        )}

        {error && <div className="prj-detected-error">{error}</div>}
        {notice && <div className="prj-detected-notice">{notice}</div>}

        {!checkingLinked && !Object.values(linked).some(Boolean) && (
          <div className="prj-detected-muted">
            Vincula GitHub o GitLab desde su icono para sincronizar repositorios privados.
          </div>
        )}

        {showRepos && (
          <>
            {detectedRepos.length > 0 && (
              <div className="prj-detected-search-wrap">
                <input
                  type="search"
                  className="prj-input prj-detected-search-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar repositorio de GitHub o GitLab..."
                  disabled={loadingRepos}
                />
                {search && (
                  <button
                    type="button"
                    className="prj-detected-search-clear"
                    onClick={() => setSearch('')}
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
              <div className="prj-detected-muted">No hay repositorios detectados. Usa uno de los iconos para sincronizar.</div>
            ) : visibleRepos.length === 0 ? (
              <div className="prj-detected-muted">No se encontraron repositorios con "{search}".</div>
            ) : (
              <div className="prj-detected-list">
                {visibleRepos.map((repo) => {
                  const provider = providerOf(repo);
                  const key = `${provider}:${normalizeUrl(repo.url_repositorio)}`;
                  const selected = selectedKeys.has(key);
                  const enUso = repo.estado_vinculacion === 'en_uso';
                  const limitReached = selectedRepos.length >= MAX_SELECTED_REPOS && !selected;

                  return (
                    <div
                      key={`${provider}:${repo.id_proyecto_repositorio || repo.url_repositorio}`}
                      className={`prj-detected-item${selected ? ' selected' : ''}`}
                    >
                      <div className="prj-detected-main">
                        <div className="prj-detected-title">
                          <RepositoryProviderIcon provider={provider} />
                          {getRepoTitle(repo)}
                        </div>
                        <div className="prj-detected-url">{repo.url_repositorio}</div>
                        {enUso && repo.proyecto?.titulo && (
                          <div className="prj-detected-url">Proyecto: {repo.proyecto.titulo}</div>
                        )}
                      </div>

                      <div className="prj-detected-side">
                        <span className="prj-detected-pill">
                          <RepositoryProviderIcon provider={provider} />
                          {PROVIDER_NAMES[provider]}
                        </span>
                        {repo.repo_github?.is_private && <span className="prj-detected-pill warn">privado</span>}
                        <span className={`prj-detected-pill ${enUso ? 'warn' : repo.validacion?.validado ? 'ok' : 'warn'}`}>
                          {enUso ? 'en uso' : repo.validacion?.validado ? 'validado' : 'sin validar'}
                        </span>
                        {enUso ? (
                          <button
                            type="button"
                            className="prj-detected-add-btn"
                            onClick={() => setJoiningRepo(repo)}
                            disabled={!repo.puede_unirse || joinLoading}
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
      </div>

      {joiningRepo && (
        <ParticipationModal
          repo={joiningRepo}
          loading={joinLoading}
          onClose={() => !joinLoading && setJoiningRepo(null)}
          onConfirm={handleJoin}
        />
      )}
    </div>
  );
}
