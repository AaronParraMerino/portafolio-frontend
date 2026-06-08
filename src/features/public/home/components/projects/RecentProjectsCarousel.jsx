import { useMemo, useRef, useState } from 'react';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../../../../core/i18n';
import { getProjectPlatformLabel } from '../../../../dashboard/projects/model/projectsModel';
import RecentProjectCard from './RecentProjectCard';
import './recentProjectsCarousel.css';

export default function RecentProjectsCarousel({ projects = [], onViewDetails }) {
  const { t } = useLanguage();
  const trackRef = useRef(null);
  const [activePlatform, setActivePlatform] = useState('todos');
  const allProjects = useMemo(() => projects.filter(Boolean).slice(0, 12), [projects]);
  const platforms = useMemo(() => (
    [...new Set(allProjects.map((project) => project.platform).filter(Boolean))]
  ), [allProjects]);
  const visibleProjects = activePlatform === 'todos'
    ? allProjects
    : allProjects.filter((project) => project.platform === activePlatform);

  if (!allProjects.length) return null;

  const scrollBy = (direction) => {
    const node = trackRef.current;
    if (!node) return;

    node.scrollBy({
      left: direction * Math.max(300, node.clientWidth * 0.78),
      behavior: 'smooth',
    });
  };

  const selectPlatform = (platform) => {
    setActivePlatform(platform);
    trackRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
  };

  return (
    <section className="prc-section" aria-labelledby="prc-title">
      <div className="prc-inner">
        <div className="prc-head">
          <div>
            <span>Explorar proyectos</span>
            <h2 id="prc-title">Construido para</h2>
          </div>
          <div className="prc-head-actions">
            <Link to="/proyectos">Ver todos</Link>
            <div className="prc-controls">
              <button type="button" onClick={() => scrollBy(-1)} aria-label="Ver proyectos anteriores">
                <BsChevronLeft />
              </button>
              <button type="button" onClick={() => scrollBy(1)} aria-label="Ver mas proyectos">
                <BsChevronRight />
              </button>
            </div>
          </div>
        </div>

        <div className="prc-platform-filters" role="group" aria-label="Filtrar proyectos por plataforma">
          <button
            type="button"
            className={activePlatform === 'todos' ? 'active' : ''}
            onClick={() => selectPlatform('todos')}
          >
            Todos
            <span>{allProjects.length}</span>
          </button>
          {platforms.map((platform) => (
            <button
              key={platform}
              type="button"
              className={activePlatform === platform ? 'active' : ''}
              onClick={() => selectPlatform(platform)}
            >
              {getProjectPlatformLabel(platform, t)}
              <span>{allProjects.filter((project) => project.platform === platform).length}</span>
            </button>
          ))}
        </div>

        <div className="prc-track" ref={trackRef}>
          {visibleProjects.map((project) => (
            <RecentProjectCard key={project.id} project={project} onViewDetails={onViewDetails} />
          ))}
        </div>
      </div>
    </section>
  );
}
