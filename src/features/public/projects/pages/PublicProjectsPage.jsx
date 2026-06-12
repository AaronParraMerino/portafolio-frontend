import { useEffect, useMemo, useState } from 'react';
import { BsArrowClockwise, BsArrowLeft, BsCodeSlash } from 'react-icons/bs';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../../core/i18n';
import { getProjectPlatformLabel } from '../../../dashboard/projects/model/projectsModel';
import ProjectDetailModal from '../../home/components/projects/ProjectDetailModal';
import RecentProjectCard from '../../home/components/projects/RecentProjectCard';
import {
  getCachedAllPublicProjects,
  getAllPublicProjects,
  getPublicProjectDetail,
} from '../../home/services/homePortfolioService';
import '../styles/publicProjects.css';
import { getStoredUser } from '../../../../shared/utils/authStorage';

export default function PublicProjectsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const cachedProjects = getCachedAllPublicProjects();
  const [projects, setProjects] = useState(cachedProjects || []);
  const [activePlatform, setActivePlatform] = useState('todos');
  const [loading, setLoading] = useState(!cachedProjects);
  const [error, setError] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  const translateKnownProjectError = (message, fallbackKey) => {
    if (message === 'No se encontro el proyecto seleccionado.') {
      return t('public.projects.missingSelection');
    }
    return message || t(fallbackKey);
  };

  const platforms = useMemo(
    () => [...new Set(projects.map((project) => project.platform).filter(Boolean))],
    [projects],
  );
  const visibleProjects = activePlatform === 'todos'
    ? projects
    : projects.filter((project) => project.platform === activePlatform);

  const loadProjects = async ({ force = false } = {}) => {
    if (force || projects.length === 0) setLoading(true);
    setError('');
    try {
      setProjects(await getAllPublicProjects({ force }));
    } catch (requestError) {
      setError(translateKnownProjectError(requestError?.message, 'public.projects.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
    // La carga usa cache vigente y deduplica solicitudes simultaneas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openDetail = async (project) => {
    if (!getStoredUser()) {
      sessionStorage.setItem('auth:return-to', '/proyectos');
      navigate('/auth/login', { state: { from: '/proyectos' } });
      return;
    }

    setSelectedProject(project);
    setDetailLoading(true);
    setDetailError('');
    try {
      setSelectedProject(await getPublicProjectDetail(project.id || project.id_proyecto));
    } catch (requestError) {
      setDetailError(translateKnownProjectError(requestError?.message, 'public.projects.detailError'));
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <main className="prjpub-page">
      <section className="prjpub-shell">
        <header className="prjpub-header">
          <div>
            <div className="prjpub-kicker">
              <BsCodeSlash aria-hidden="true" />
              {t('public.projects.kicker')}
            </div>
            <h1>{t('public.projects.title')}</h1>
            <p>{t('public.projects.description')}</p>
          </div>
          <div className="prjpub-actions">
            <button type="button" onClick={() => loadProjects({ force: true })} disabled={loading}><BsArrowClockwise />{t('public.projects.refresh')}</button>
            <Link to="/"><BsArrowLeft />{t('public.projects.backHome')}</Link>
          </div>
        </header>

        <div className="prjpub-filters" role="group" aria-label={t('public.projects.filterAria')}>
          <button type="button" className={activePlatform === 'todos' ? 'active' : ''} onClick={() => setActivePlatform('todos')}>
            {t('public.projects.filterAll')} <span>{projects.length}</span>
          </button>
          {platforms.map((platform) => (
            <button type="button" key={platform} className={activePlatform === platform ? 'active' : ''} onClick={() => setActivePlatform(platform)}>
              {getProjectPlatformLabel(platform, t)}
              <span>{projects.filter((project) => project.platform === platform).length}</span>
            </button>
          ))}
        </div>

        {error && <div className="prjpub-state is-error">{error}</div>}
        {loading && <div className="prjpub-state">{t('public.projects.loading')}</div>}
        {!loading && !error && visibleProjects.length === 0 && (
          <div className="prjpub-state"><BsCodeSlash /><span>{t('public.projects.empty')}</span></div>
        )}
        {!loading && !error && visibleProjects.length > 0 && (
          <section className="prjpub-grid" aria-live="polite">
            {visibleProjects.map((project) => <RecentProjectCard key={project.id} project={project} onViewDetails={openDetail} />)}
          </section>
        )}
      </section>

      <ProjectDetailModal
        project={selectedProject}
        loading={detailLoading}
        error={detailError}
        onClose={() => setSelectedProject(null)}
      />
    </main>
  );
}
