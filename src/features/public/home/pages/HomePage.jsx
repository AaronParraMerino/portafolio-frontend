import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import HomeEventsSection from '../components/HomeEventsSection';
import FeaturedPortfolios from '../components/FeaturedPortfolios';
import ProjectDetailModal from '../components/projects/ProjectDetailModal';
import RecentProjectsCarousel from '../components/projects/RecentProjectsCarousel';
import RecentProjectsHero from '../components/projects/RecentProjectsHero';
import useHomeEvents from '../hooks/useHomeEvents';
import useRecentProjects from '../hooks/useRecentProjects';
import { getPublicProjectDetail } from '../services/homePortfolioService';
import { hasActiveStoredSession } from '../../../../shared/utils/authStorage';

export default function HomePage() {
  const eventsState = useHomeEvents();
  const navigate = useNavigate();
  const recentProjects = useRecentProjects();
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectDetailLoading, setProjectDetailLoading] = useState(false);
  const [projectDetailError, setProjectDetailError] = useState('');

  const openProjectDetail = async (project) => {
    if (!hasActiveStoredSession()) {
      sessionStorage.setItem('auth:return-to', '/');
      navigate('/auth/login', { state: { from: '/' } });
      return;
    }

    setSelectedProject(project);
    setProjectDetailLoading(true);
    setProjectDetailError('');

    try {
      const detail = await getPublicProjectDetail(project.id || project.id_proyecto);
      setSelectedProject(detail);
    } catch (error) {
      setProjectDetailError(error?.message || 'No se pudo cargar el detalle del proyecto.');
    } finally {
      setProjectDetailLoading(false);
    }
  };

  return (
    <>
      <Hero />
      <HomeEventsSection eventsState={eventsState} />
      <FeaturedPortfolios />
      <RecentProjectsHero projects={recentProjects.hero} onViewDetails={openProjectDetail} />
      <RecentProjectsCarousel projects={recentProjects.recientes} onViewDetails={openProjectDetail} />
      <ProjectDetailModal
        project={selectedProject}
        loading={projectDetailLoading}
        error={projectDetailError}
        onClose={() => setSelectedProject(null)}
      />
    </>
  );
}
