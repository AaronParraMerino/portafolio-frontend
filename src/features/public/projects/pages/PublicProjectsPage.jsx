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
      setError(requestError?.message || 'No se pudieron cargar los proyectos.');
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
      setDetailError(requestError?.message || 'No se pudo cargar el detalle del proyecto.');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <main className="prjpub-page">
      <section className="prjpub-shell">
        <header className="prjpub-header">
          <div>
            <span>Explorar proyectos</span>
            <h1>Todos los proyectos</h1>
            <p>Descubre proyectos publicados y filtralos por la plataforma para la que fueron construidos.</p>
          </div>
          <div className="prjpub-actions">
            <button type="button" onClick={() => loadProjects({ force: true })} disabled={loading}><BsArrowClockwise />Actualizar</button>
            <Link to="/"><BsArrowLeft />Volver al inicio</Link>
          </div>
        </header>

        <div className="prjpub-filters" role="group" aria-label="Filtrar proyectos por plataforma">
          <button type="button" className={activePlatform === 'todos' ? 'active' : ''} onClick={() => setActivePlatform('todos')}>
            Todos <span>{projects.length}</span>
          </button>
          {platforms.map((platform) => (
            <button type="button" key={platform} className={activePlatform === platform ? 'active' : ''} onClick={() => setActivePlatform(platform)}>
              {getProjectPlatformLabel(platform, t)}
              <span>{projects.filter((project) => project.platform === platform).length}</span>
            </button>
          ))}
        </div>

        {error && <div className="prjpub-state is-error">{error}</div>}
        {loading && <div className="prjpub-state">Los proyectos se estan cargando...</div>}
        {!loading && !error && visibleProjects.length === 0 && (
          <div className="prjpub-state"><BsCodeSlash /><span>No hay proyectos disponibles en esta categoria.</span></div>
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
