import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../../../../core/i18n';
import {
  attachDetectedReposToProject,
  ensureTecnologiasDetectadas,
  getGithubConnectUrl,
  getGithubDetectedRepos,
  getGithubRepoLanguages,
  isGithubLinked,
  syncGithubRepos,
} from '../services/projectsService';
import RepositoryProviderIcon from './RepositoryProviderIcon';
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
    provider: repo?.proveedor || 'github',
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
            <div className="prj-modal-title">{t('projects.participation.title')}</div>
            <div className="prj-modal-sub">{t('projects.confirm.repoInUseTitle')}</div>
          </div>
        </div>

        <div className="prj-modal-body">
          <div className="prj-detected-item" style={{ marginBottom: 14 }}>
            <div className="prj-detected-main">
              <div className="prj-detected-title">{repo?.proyecto?.titulo || t('projects.card.defaultTitle')}</div>
              {repo?.url_repositorio && <div className="prj-detected-url">{repo.url_repositorio}</div>}
            </div>
            <div className="prj-detected-side">
              <span className="prj-detected-pill warn">{t('projects.github.inUse')}</span>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12">
              <label className="prj-label">{t('projects.participation.roleLabel')}</label>
              <input
                className="prj-input"
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                placeholder={t('projects.participation.rolePlaceholder')}
                maxLength={100}
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="col-12">
              <label className="prj-label">
                {t('projects.participation.descriptionLabel')}
                <span className="prj-char-count">{descripcion.length}/600</span>
              </label>
              <textarea
                className="prj-input"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                placeholder={t('projects.participation.descriptionPlaceholder')}
                maxLength={601}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className="prj-modal-foot">
          <button type="button" className="prj-btn-cancel" onClick={onClose} disabled={loading}>
            <span>{t('projects.form.cancel')}</span>
          </button>
          <button
            type="button"
            className="prj-btn-save"
            onClick={() => onConfirm({ rol: rol.trim(), descripcion_aporte: descripcion.trim() })}
            disabled={loading}
          >
            {loading && <span className="prj-spinner" />}
            <span>{loading ? t('projects.form.saving') : t('projects.github.bePart')}</span>
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
  actionLabel = null,
  connectInNewTab = false,
  selectedRepos: controlledSelectedRepos = null,
  showCreateButton = true,
  onAgregarConRepos,
  onSelectRepos,
  onSelectionChange,
  onReposChanged,
}) {
  const { t } = useLanguage();
  const providerMeta = PROVIDER_META[provider] || PROVIDER_META.github;
  const panelRef = useRef(null);
  const effectiveActionLabel = actionLabel || t('projects.form.addProject');
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
  const [preparingProject, setPreparingProject] = useState(false);
  const [joiningRepo, setJoiningRepo] = useState(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const effectiveSelectedRepos = Array.isArray(controlledSelectedRepos)
    ? controlledSelectedRepos
    : selectedRepos;

  const updateSelectedRepos = useCallback((updater) => {
    const base = effectiveSelectedRepos;
    const next = typeof updater === 'function' ? updater(base) : updater;

    if (Array.isArray(controlledSelectedRepos)) {
      if (typeof onSelectionChange === 'function') {
        onSelectionChange(next);
      }
      return;
    }

    setSelectedRepos(next);
    if (typeof onSelectionChange === 'function') {
      onSelectionChange(next);
    }
  }, [controlledSelectedRepos, effectiveSelectedRepos, onSelectionChange]);

  const loadDetectedRepos = useCallback(async (refresh = false) => {
    try {
      setLoadingRepos(true);
      setError('');
      const repos = await getGithubDetectedRepos({ refresh, provider });
      const normalized = Array.isArray(repos) ? repos : [];
      setDetectedRepos(normalized);
      return normalized;
    } catch (e) {
      setError(e.message || t('projects.github.loadError'));
      return [];
    } finally {
      setLoadingRepos(false);
    }
  }, [provider, providerMeta.name, t]);

  useEffect(() => {
    let mounted = true;

    const boot = async () => {
      try {
        setCheckingLinked(true);
        const linked = await isGithubLinked({ provider, force: true });
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
    effectiveSelectedRepos.map((repo) => normalizarGithubUrl(repo.url))
  ), [effectiveSelectedRepos]);

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
      setNotice(formatGithubSyncNotice(result?.stats, providerMeta.name, t));
    } catch (e) {
      setError(e.message || t('projects.github.syncError', { provider: providerMeta.name }));
    } finally {
      setSyncingRepos(false);
    }
  }, [loadDetectedRepos, provider, providerMeta.name, t]);

  const handleConnectGithub = useCallback(async () => {
    try {
      setConnectingGithub(true);
      setError('');
      const url = await getGithubConnectUrl({ provider });
      if (!url) throw new Error(t('projects.github.connectError', { provider: providerMeta.name }));

      if (connectInNewTab) {
        window.open(url, '_blank', 'noopener,noreferrer');
        setNotice(t('projects.github.connectNewTabNotice', { provider: providerMeta.name }));
        setConnectingGithub(false);
        return;
      }

      window.location.assign(url);
    } catch (e) {
      setError(e.message || t('projects.github.connectError', { provider: providerMeta.name }));
      setConnectingGithub(false);
    }
  }, [connectInNewTab, provider, providerMeta.name, t]);

  const toggleSelectedRepo = useCallback((repo) => {
    const item = getRepoSelection(repo);
    if (!item.url) return;

    updateSelectedRepos((prev) => {
      const key = normalizarGithubUrl(item.url);
      const exists = prev.some((current) => normalizarGithubUrl(current.url) === key);

      if (exists) {
        return prev.filter((current) => normalizarGithubUrl(current.url) !== key);
      }

      if (prev.length >= MAX_REPOSITORIOS_GITHUB) return prev;
      return [...prev, item];
    });
  }, [updateSelectedRepos]);

  const removeSelectedRepo = useCallback((url) => {
    const key = normalizarGithubUrl(url);
    updateSelectedRepos((prev) => prev.filter((repo) => normalizarGithubUrl(repo.url) !== key));
  }, [updateSelectedRepos]);

  const handleAgregarProyecto = useCallback(async () => {
    if (effectiveSelectedRepos.length === 0 || preparingProject) return;

    const selection = {
      repositorios: effectiveSelectedRepos.map((repo) => repo.url),
      detected_repo_ids: effectiveSelectedRepos
        .map((repo) => Number(repo.id))
        .filter((id) => Number.isInteger(id) && id > 0),
      detected_repos: effectiveSelectedRepos,
    };

    try {
      setPreparingProject(true);
      setError('');

      const languageGroups = await Promise.all(
        selection.repositorios.map((url) => getGithubRepoLanguages(url, { provider }).catch(() => []))
      );
      const languages = [...new Set(languageGroups.flat().map(lang => String(lang || '').trim()).filter(Boolean))];
      const tecnologias = languages.length > 0
        ? await ensureTecnologiasDetectadas(languages, 'lenguaje').catch(() => [])
        : [];

      if (tecnologias.length > 0) {
        selection.tecnologias = tecnologias.map(tech => tech.nombre).filter(Boolean);
        selection.etiquetas = selection.tecnologias;
        selection.tecnologias_detalle = tecnologias;
      } else if (languages.length > 0) {
        selection.tecnologias = languages;
        selection.etiquetas = languages;
      }
    } finally {
      setPreparingProject(false);
    }

    if (typeof onSelectRepos === 'function') {
      onSelectRepos(selection);
      return;
    }

    if (typeof onAgregarConRepos === 'function') {
      onAgregarConRepos(selection);
    }
  }, [effectiveSelectedRepos, onAgregarConRepos, onSelectRepos, preparingProject, provider]);

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
      setNotice(t('projects.github.joinSuccess'));
      await loadDetectedRepos(false);
      if (typeof onReposChanged === 'function') {
        await onReposChanged();
      }
    } catch (e) {
      setError(e.message || t('projects.github.joinError'));
    } finally {
      setJoinLoading(false);
    }
  }, [joiningRepo, loadDetectedRepos, onReposChanged, provider, t]);

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
                  {syncingRepos ? t('projects.github.syncing') : t('projects.github.syncProvider', { provider: providerMeta.name })}
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
                {connectingGithub ? t('projects.github.syncing') : t('projects.github.connectProvider', { provider: providerMeta.name })}
              </button>
            )}
          </div>
        </div>

        {error && <div className="prj-detected-error">{error}</div>}
        {notice && <div className="prj-detected-notice">{notice}</div>}

        {!githubLinked && !checkingLinked && (
          <div className="prj-detected-muted">
            {t('projects.github.privateHint', { provider: providerMeta.name })}
          </div>
        )}

        {githubLinked && (
          <>
            <div className="prj-github-selected-strip">
              <div className="prj-detected-muted">
                {t('projects.tech.select')} {effectiveSelectedRepos.length}/{MAX_REPOSITORIOS_GITHUB}
              </div>

              {effectiveSelectedRepos.length > 0 && (
                <div className="prj-github-selected-list">
                  {effectiveSelectedRepos.map((repo) => (
                    <button
                      key={repo.url}
                      type="button"
                      className="prj-github-selected-chip"
                      onClick={() => removeSelectedRepo(repo.url)}
                      title={t('projects.form.removeRepository')}
                    >
                      <RepositoryProviderIcon provider={provider} />
                      {repo.nombre}
                      <span>x</span>
                    </button>
                  ))}
                </div>
              )}

              {showCreateButton && (
                <button
                  type="button"
                  className="prj-btn-add prj-github-create-btn"
                  onClick={handleAgregarProyecto}
                  disabled={effectiveSelectedRepos.length === 0 || preparingProject}
                >
                  <svg viewBox="0 0 12 12">
                    <path d="M6 1v10M1 6h10" />
                  </svg>
                  <span>{preparingProject ? 'Detectando tecnologias...' : actionLabel}</span>
                </button>
              )}
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
                      placeholder={t('projects.github.searchPlaceholder')}
                      disabled={loadingRepos}
                    />

                    {busqueda && (
                      <button
                        type="button"
                        className="prj-detected-search-clear"
                        onClick={() => setBusqueda('')}
                        disabled={loadingRepos}
                        title={t('projects.github.clearSearch')}
                      >
                        x
                      </button>
                    )}
                  </div>
                )}

                {loadingRepos ? (
                  <div className="prj-detected-muted">{t('projects.github.loadingDetected')}</div>
                ) : detectedRepos.length === 0 ? (
                  <div className="prj-detected-muted">{t('projects.github.emptySyncHint')}</div>
                ) : reposFiltrados.length === 0 ? (
                  <div className="prj-detected-muted">{t('projects.github.noResults', { query: busqueda })}</div>
                ) : (
                  <div className="prj-detected-list">
                    {reposFiltrados.map((repo) => {
                      const url = repo?.url_repositorio || '';
                      const enUso = repo?.estado_vinculacion === 'en_uso';
                      const selected = selectedByUrl.has(normalizarGithubUrl(url));
                      const limitReached = effectiveSelectedRepos.length >= MAX_REPOSITORIOS_GITHUB && !selected;

                      return (
                        <div
                          key={repo.id_proyecto_repositorio || url}
                          className={`prj-detected-item${selected ? ' selected' : ''}`}
                        >
                          <div className="prj-detected-main">
                            <div className="prj-detected-title">
                              <RepositoryProviderIcon provider={provider} />
                              {getRepoTitle(repo)}
                            </div>
                            <div className="prj-detected-url">{url}</div>
                            {enUso && repo?.proyecto?.titulo && (
                              <div className="prj-detected-url">{t('projects.github.project')}: {repo.proyecto.titulo}</div>
                            )}
                          </div>

                          <div className="prj-detected-side">
                            {repo?.repo_github?.is_private && (
                              <span className="prj-detected-pill warn">{t('projects.github.private')}</span>
                            )}
                            <span className={`prj-detected-pill ${enUso ? 'warn' : repo?.validacion?.validado ? 'ok' : 'warn'}`}>
                              {enUso
                                ? t('projects.github.inUse')
                                : repo?.validacion?.validado
                                  ? (repo?.validacion?.relacion_github || t('projects.github.validated'))
                                  : t('projects.github.unvalidated')}
                            </span>

                            {enUso ? (
                              <button
                                type="button"
                                className="prj-detected-add-btn"
                                onClick={() => setJoiningRepo(repo)}
                                disabled={!repo?.puede_unirse || joinLoading}
                              >
                                {t('projects.github.bePart')}
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="prj-detected-add-btn"
                                onClick={() => toggleSelectedRepo(repo)}
                                disabled={limitReached}
                              >
                                {selected ? t('projects.config.remove') : t('projects.github.select')}
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

function formatGithubSyncNotice(stats = {}, providerName = 'GitHub', t = null) {
  const creados = Number(stats?.creados ?? 0);
  const actualizados = Number(stats?.actualizados ?? 0);

  if (typeof t === 'function') {
    return t('projects.github.syncResult', {
      provider: providerName,
      created: Number.isFinite(creados) ? creados : 0,
      updated: Number.isFinite(actualizados) ? actualizados : 0,
    });
  }

  return `${providerName} sync completed.`;
}
