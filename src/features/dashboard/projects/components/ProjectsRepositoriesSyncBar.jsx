import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../../../../core/i18n';
import {
  attachDetectedReposToProject,
  getGithubConnectUrl,
  getGithubDetectedRepos,
  isGithubLinked,
  syncGithubRepos,
} from '../services/projectsService';
import RepositoryProviderIcon from './RepositoryProviderIcon';
import ProjectRecoveryActions from './ProjectRecoveryActions';
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
  const { t } = useLanguage();
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
            <span className="prj-detected-pill warn">{t('projects.github.inUse')}</span>
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
                maxLength={600}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className="prj-modal-foot">
          <button type="button" className="prj-btn-cancel" onClick={onClose} disabled={loading}>
            {t('projects.form.cancel')}
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

export default function ProjectsRepositoriesSyncBar({
  expandSignal = 0,
  onAgregarConRepos,
  onReposChanged,
}) {
  const { t } = useLanguage();
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
        setError(t('projects.github.loadProviderError', { providers: failedProviders.join(' y ') }));
      }

      setDetectedRepos(combined);
      return combined;
    } finally {
      setLoadingRepos(false);
    }
  }, [linked, t]);

  useEffect(() => {
    let mounted = true;

    Promise.resolve()
      .then(async () => {
        const github = await isGithubLinked({ provider: 'github', force: true });
        const gitlab = await isGithubLinked({ provider: 'gitlab' });
        return [['github', github], ['gitlab', gitlab]];
      })
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
        if (!url) throw new Error(t('projects.github.connectError', { provider: name }));
        window.location.assign(url);
      } catch (e) {
        setError(e.message || t('projects.github.joinError'));
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
      setNotice(t('projects.github.syncResult', { provider: name, created: 0, updated: 0 }));
    } catch (e) {
      setError(e.message || t('projects.github.syncError', { provider: name }));
    } finally {
      setSyncing((current) => ({ ...current, [provider]: false }));
    }
  }, [linked, loadDetectedRepos, t]);

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
      setNotice(t('projects.github.joinSuccess'));
      await loadDetectedRepos();
      if (typeof onReposChanged === 'function') await onReposChanged();
    } catch (e) {
      setError(e.message || t('projects.github.joinError'));
    } finally {
      setJoinLoading(false);
    }
  }, [joiningRepo, loadDetectedRepos, onReposChanged, t]);

  return (
    <div ref={panelRef} className="prj-repositories-panel">
      <div className="prj-detected-repos-box prj-repositories-sync-box">
        <div className="prj-repositories-toolbar">
          <div className="prj-provider-actions">
            {PROVIDERS.map((provider) => {
              const name = PROVIDER_NAMES[provider];
              const busy = syncing[provider] || connecting[provider];
              const label = linked[provider] ? `${t('projects.github.syncProvider', { provider: name })}` : `${t('projects.github.connectProvider', { provider: name })}`;

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
              {showRepos ? t('projects.github.hide') : t('projects.github.show')}
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
              <span>{t('projects.form.addProject')}</span>
            </button>
          </div>
        </div>

        <div className="prj-repositories-caption">
          <span>{t('projects.github.privateHint', { provider: 'GitHub/GitLab' })}</span>
          <span>{t('projects.tech.select')} {selectedRepos.length}/{MAX_SELECTED_REPOS}</span>
        </div>

        {selectedRepos.length > 0 && (
          <div className="prj-github-selected-list prj-repositories-selected">
            {selectedRepos.map((repo) => (
              <button
                key={`${repo.provider}:${repo.url}`}
                type="button"
                className="prj-github-selected-chip"
                onClick={() => toggleSelectedRepo(repo)}
                title={t('projects.config.remove')}
              >
                <RepositoryProviderIcon provider={repo.provider} />
                <span className="prj-github-selected-name">{repo.nombre}</span>
                <span>x</span>
              </button>
            ))}
          </div>
        )}

        {error && <div className="prj-detected-error">{error}</div>}
        {notice && <div className="prj-detected-notice">{notice}</div>}

        {!checkingLinked && !Object.values(linked).some(Boolean) && (
          <div className="prj-detected-muted">
            {t('projects.github.privateHint', { provider: 'GitHub/GitLab' })}
          </div>
        )}

        {showRepos && (
          <>
            {detectedRepos.length > 0 && (
              <div className="prj-detected-search-wrap">
                <input
                  type="text"
                  className="prj-input prj-detected-search-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('projects.github.searchLinked')}
                  disabled={loadingRepos}
                />
                {search && (
                  <button
                    type="button"
                    className="prj-detected-search-clear"
                    onClick={() => setSearch('')}
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
              <div className="prj-detected-muted">{t('projects.github.empty')}</div>
            ) : visibleRepos.length === 0 ? (
              <div className="prj-detected-muted">{t('projects.github.noResults', { query: search })}</div>
            ) : (
              <div className="prj-detected-list">
                {visibleRepos.map((repo) => {
                  const provider = providerOf(repo);
                  const key = `${provider}:${normalizeUrl(repo.url_repositorio)}`;
                  const selected = selectedKeys.has(key);
                  const enUso = repo.estado_vinculacion === 'en_uso';
                  const proyectoEliminado = repo.estado_vinculacion === 'proyecto_eliminado';
                  const limitReached = selectedRepos.length >= MAX_SELECTED_REPOS && !selected;

                  return (
                    <div
                      key={`${provider}:${repo.id_proyecto_repositorio || repo.url_repositorio}`}
                      className={`prj-detected-item${selected ? ' selected' : ''}`}
                    >
                      <div className="prj-detected-main">
                        <div className="prj-detected-title">
                          <RepositoryProviderIcon provider={provider} />
                          <span className="prj-detected-name">{getRepoTitle(repo)}</span>
                        </div>
                        <div className="prj-detected-url">{repo.url_repositorio}</div>
                        {(enUso || proyectoEliminado) && repo.proyecto?.titulo && (
                          <div className="prj-detected-url">{t('projects.github.project')}: {repo.proyecto.titulo}</div>
                        )}
                      </div>

                      <div className="prj-detected-side">
                        <span className="prj-detected-pill">
                          <RepositoryProviderIcon provider={provider} />
                          {PROVIDER_NAMES[provider]}
                        </span>
                        {repo.repo_github?.is_private && <span className="prj-detected-pill warn">{t('projects.github.private')}</span>}
                        <span className={`prj-detected-pill ${(enUso || proyectoEliminado) ? 'warn' : repo.validacion?.validado ? 'ok' : 'warn'}`}>
                          {proyectoEliminado
                            ? t('projects.github.deletedProject')
                            : enUso
                              ? t('projects.github.inUse')
                              : repo.validacion?.validado
                                ? t('projects.github.validated')
                                : t('projects.github.unvalidated')}
                        </span>
                        {proyectoEliminado ? (
                          <ProjectRecoveryActions
                            repo={repo}
                            disabled={joinLoading}
                            onNotice={setNotice}
                            onError={setError}
                            onChanged={async () => {
                              await loadDetectedRepos();
                              if (typeof onReposChanged === 'function') await onReposChanged();
                            }}
                          />
                        ) : enUso ? (
                          <button
                            type="button"
                            className="prj-detected-add-btn"
                            onClick={() => setJoiningRepo(repo)}
                            disabled={!repo.puede_unirse || joinLoading}
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
                            {selected ? t('projects.github.remove') : t('projects.github.select')}
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
