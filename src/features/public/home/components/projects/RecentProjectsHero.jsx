import { useCallback, useEffect, useRef, useState } from 'react';
import { BsChevronLeft, BsChevronRight, BsCodeSlash } from 'react-icons/bs';
import { useLanguage } from '../../../../../core/i18n';
import useHeroInputNavigation from '../../hooks/useHeroInputNavigation';
import {
  getProjectPlatformLabel,
  getProjectTypeLabel,
} from '../../../../dashboard/projects/model/projectsModel';
import './recentProjectsHero.css';

const AUTO_ADVANCE_MS = 6000;
const VISIBLE_TECHNOLOGIES = 4;

function colorWithAlpha(color, alphaHex) {
  const hex = String(color || '').trim();

  if (/^#[0-9a-f]{6}$/i.test(hex)) return `${hex}${alphaHex}`;
  if (/^#[0-9a-f]{3}$/i.test(hex)) {
    const expanded = hex.slice(1).split('').map((character) => character.repeat(2)).join('');
    return `#${expanded}${alphaHex}`;
  }

  return '';
}

function formatPublishedDate(value, language) {
  const date = new Date(value || '');
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat(
    language === 'en' ? 'en-US' : language === 'pt' ? 'pt-BR' : 'es-BO',
    { day: 'numeric', month: 'long', year: 'numeric' },
  ).format(date);
}

export default function RecentProjectsHero({ projects = [], onViewDetails }) {
  const { language, t } = useLanguage();
  const visibleProjects = projects.filter(Boolean).slice(0, 6);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(null);
  const project = visibleProjects[activeIndex] || visibleProjects[0];

  const move = useCallback((step) => {
    setActiveIndex((index) => (index + step + visibleProjects.length) % visibleProjects.length);
  }, [visibleProjects.length]);

  const heroInputNavigation = useHeroInputNavigation({
    enabled: visibleProjects.length > 1,
    onMove: move,
  });

  useEffect(() => {
    if (activeIndex >= visibleProjects.length) setActiveIndex(0);
  }, [activeIndex, visibleProjects.length]);

  useEffect(() => {
    if (paused || visibleProjects.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % visibleProjects.length);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, [paused, visibleProjects.length]);

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches?.[0]?.clientX ?? null;
    setPaused(true);
  };

  const handleTouchEnd = (event) => {
    const startX = touchStartX.current;
    const endX = event.changedTouches?.[0]?.clientX;

    if (typeof startX === 'number' && typeof endX === 'number' && Math.abs(endX - startX) >= 50) {
      move(endX > startX ? -1 : 1);
    }

    touchStartX.current = null;
    setPaused(false);
  };

  if (!project) return null;

  const technologies = project.technologies || [];

  return (
    <section className="prh-section" id="proyectos">
      <div className="prh-inner">
        <div className="prh-head">
          <h2>{t('home.projects.explore')}</h2>
        </div>
        <article
          className={`prh-hero${project.imageUrl ? ' has-image' : ''}`}
          {...heroInputNavigation}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="prh-content">
            <div className="prh-meta prh-content-mobile-only">
              <span className="prh-type">{getProjectTypeLabel(project.type, t)}</span>
              <span>{getProjectPlatformLabel(project.platform, t)}</span>
            </div>

            <h3>{project.title}</h3>
            <p className="prh-description">{project.description || t('home.projects.recentDescription')}</p>

            <div className="prh-technologies" aria-label={t('home.projects.technologiesAria')}>
              {technologies.slice(0, VISIBLE_TECHNOLOGIES).map((technology) => (
                <span
                  key={technology.id_tecnologia || technology.nombre}
                  style={technology.color ? {
                    '--prh-tech-color': technology.color,
                    '--prh-tech-bg': colorWithAlpha(technology.color, '38'),
                    '--prh-tech-border': colorWithAlpha(technology.color, '9c'),
                  } : undefined}
                >
                  <span className="prh-tech-icon" aria-hidden="true">
                    {technology.icono_url ? (
                      <img src={technology.icono_url} alt="" />
                    ) : (
                      String(technology.nombre || '?').slice(0, 1).toUpperCase()
                    )}
                  </span>
                  <span className="prh-tech-label">{technology.nombre}</span>
                </span>
              ))}
              {technologies.length > VISIBLE_TECHNOLOGIES && (
                <span className="prh-tech-more">+{technologies.length - VISIBLE_TECHNOLOGIES}</span>
              )}
            </div>

            <span className="prh-date">{t('home.projects.publishedOn', { date: formatPublishedDate(project.publishedAt, language) || t('home.projects.publishedRecently') })}</span>
            <button type="button" className="prh-detail-button prh-content-mobile-only" onClick={() => onViewDetails?.(project)}>
              {t('home.projects.details')}
            </button>
          </div>

          <div className="prh-media">
            {project.imageUrl ? (
              <div className="prh-contained-media" aria-hidden="true">
                <img className="prh-media-backdrop" src={project.imageUrl} alt="" />
                <div className="prh-contained-canvas">
                  <img className="prh-media-image" src={project.imageUrl} alt="" />
                </div>
              </div>
            ) : (
              <div className="prh-media-fallback">
                <BsCodeSlash />
                <span>{getProjectTypeLabel(project.type, t)}</span>
              </div>
            )}
            <div className="prh-media-actions">
              <div className="prh-meta">
                <span className="prh-type">{getProjectTypeLabel(project.type, t)}</span>
                <span>{getProjectPlatformLabel(project.platform, t)}</span>
              </div>
              <button type="button" className="prh-detail-button" onClick={() => onViewDetails?.(project)}>
                {t('home.projects.details')}
              </button>
            </div>
          </div>

          {visibleProjects.length > 1 && (
            <>
              <button type="button" className="prh-nav prh-prev" onClick={() => move(-1)} aria-label={t('home.projects.previous')}>
                <BsChevronLeft />
              </button>
              <button type="button" className="prh-nav prh-next" onClick={() => move(1)} aria-label={t('home.projects.next')}>
                <BsChevronRight />
              </button>
            </>
          )}

          {visibleProjects.length > 1 && (
            <div className="prh-dots" aria-label={t('home.projects.recentAria')}>
              {visibleProjects.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={index === activeIndex ? 'active' : ''}
                  onClick={() => setActiveIndex(index)}
                  aria-label={t('home.projects.showAria', { title: item.title })}
                />
              ))}
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
