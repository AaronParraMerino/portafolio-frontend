import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BsBoxArrowUpRight,
  BsChevronLeft,
  BsChevronRight,
  BsCodeSlash,
  BsGithub,
  BsPeople,
  BsStar,
  BsX,
} from 'react-icons/bs';
import { useLanguage } from '../../../../../core/i18n';
import {
  getProjectPlatformLabel,
  getProjectStatusLabel,
  getProjectTypeLabel,
} from '../../../../dashboard/projects/model/projectsModel';
import './projectDetailModal.css';

function youtubeEmbed(url = '') {
  const match = String(url).match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
  return match?.[1] ? `https://www.youtube.com/embed/${match[1]}` : '';
}

function youtubeThumbnail(url = '') {
  const match = String(url).match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
  return match?.[1] ? `https://i.ytimg.com/vi/${match[1]}/mqdefault.jpg` : '';
}

function mediaFromProject(project = {}) {
  return (project?.evidencias || [])
    .filter((item) => ['imagen', 'captura', 'video'].includes(String(item.tipo || '').toLowerCase()) && item.url)
    .map((item) => ({
      ...item,
      mediaType: String(item.tipo).toLowerCase() === 'video' ? 'video' : 'image',
      mediaUrl: item.url,
      fallbackMediaUrl: item.imagen_detail_url || '',
      embedUrl: youtubeEmbed(item.url),
      thumbnailUrl: item.imagen_card_url || youtubeThumbnail(item.url),
    }));
}

function linkEvidences(project = {}) {
  return (project?.evidencias || []).filter((item) => (
    !['imagen', 'captura', 'video'].includes(String(item.tipo || '').toLowerCase()) && item.url
  ));
}

export default function ProjectDetailModal({ project, loading, error, onClose }) {
  const { t } = useLanguage();
  const media = useMemo(() => mediaFromProject(project), [project]);
  const links = useMemo(() => linkEvidences(project), [project]);
  const [activeMedia, setActiveMedia] = useState(0);
  const currentMedia = media[activeMedia];

  useEffect(() => setActiveMedia(0), [project?.id, media.length]);

  useEffect(() => {
    if (!project) return undefined;
    const onKeyDown = (event) => event.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, project]);

  if (!project) return null;

  const move = (step) => setActiveMedia((index) => (index + step + media.length) % media.length);

  return (
    <div className="pdm-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="pdm-modal" role="dialog" aria-modal="true" aria-labelledby="pdm-title" onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" className="pdm-close" onClick={onClose} aria-label={t('home.projects.detail.close')}><BsX /></button>

        <header className="pdm-header">
          <span>{getProjectTypeLabel(project.tipo || project.type, t)}</span>
          <h2 id="pdm-title">{project.titulo || project.title}</h2>
        </header>

        <div className="pdm-gallery">
          <div className="pdm-gallery-main">
            {currentMedia?.mediaType === 'video' && currentMedia.embedUrl ? (
              <iframe src={currentMedia.embedUrl} title={currentMedia.titulo || t('home.projects.detail.videoTitle')} allowFullScreen />
            ) : currentMedia?.mediaUrl ? (
              <img
                src={currentMedia.mediaUrl}
                alt={currentMedia.titulo || project.titulo || project.title}
                onError={(event) => {
                  if (currentMedia.fallbackMediaUrl && event.currentTarget.src !== currentMedia.fallbackMediaUrl) {
                    event.currentTarget.src = currentMedia.fallbackMediaUrl;
                  }
                }}
              />
            ) : (
              <div className="pdm-gallery-empty"><BsCodeSlash /><span>{t('home.projects.detail.noGallery')}</span></div>
            )}
            {media.length > 1 && (
              <>
                <button type="button" className="pdm-gallery-nav pdm-gallery-prev" onClick={() => move(-1)} aria-label={t('home.projects.detail.previousMedia')}><BsChevronLeft /></button>
                <button type="button" className="pdm-gallery-nav pdm-gallery-next" onClick={() => move(1)} aria-label={t('home.projects.detail.nextMedia')}><BsChevronRight /></button>
              </>
            )}
          </div>
          {media.length > 1 && (
            <div className="pdm-thumbnails">
              {media.map((item, index) => (
                <button key={item.id_evidencia || `${item.url}-${index}`} type="button" className={index === activeMedia ? 'active' : ''} onClick={() => setActiveMedia(index)}>
                  {item.mediaType === 'image' || item.thumbnailUrl ? <img src={item.thumbnailUrl || item.mediaUrl} alt="" /> : <span>{t('home.projects.detail.video')}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading && <div className="pdm-notice is-loading" role="status"><span className="pdm-loading-dot" />{t('home.projects.detail.loading')}</div>}
        {error && <div className="pdm-notice is-error">{error}</div>}

        <div className="pdm-content">
          <section className="pdm-panel pdm-description-panel">
            <h3>{t('home.projects.detail.description')}</h3>
            <p>{project.descripcion || project.description || t('home.projects.detail.noDescription')}</p>
          </section>

          {(project.tecnologias || project.technologies)?.length > 0 && (
            <section className="pdm-panel pdm-technologies-panel">
              <h3>{t('home.projects.detail.technologies')}</h3>
              <div className="pdm-technologies">
                {(project.tecnologias || project.technologies).map((tech, index) => (
                  <span key={`technology-${tech.id_tecnologia || tech.nombre || index}-${index}`}>
                    {tech.icono_url ? <img src={tech.icono_url} alt="" /> : <b>{String(tech.nombre || '?')[0]}</b>}
                    <span><strong>{tech.nombre}</strong>{tech.version_usada && <small>{t('home.projects.detail.version', { version: tech.version_usada })}</small>}</span>
                    {tech.porcentaje_uso !== null && tech.porcentaje_uso !== undefined && <em>{tech.porcentaje_uso}%</em>}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="pdm-panel pdm-information-panel">
            <h3>{t('home.projects.detail.information')}</h3>
            <div className="pdm-facts">
              <span><strong>{t('home.projects.detail.type')}</strong>{getProjectTypeLabel(project.tipo || project.type, t)}</span>
              <span><strong>{t('home.projects.detail.platform')}</strong>{getProjectPlatformLabel(project.desarrollado_para || project.platform, t)}</span>
              <span><strong>{t('home.projects.detail.status')}</strong>{getProjectStatusLabel(project.estado_desarrollo, t)}</span>
              <span><strong>{t('home.projects.detail.origin')}</strong>{project.origen || t('home.projects.detail.manual')}</span>
              <span><strong>{t('home.projects.detail.start')}</strong>{project.fecha_inicio || t('home.projects.detail.undefined')}</span>
              <span><strong>{t('home.projects.detail.end')}</strong>{project.fecha_fin || t('home.projects.detail.inProgress')}</span>
            </div>
          </section>

          {(project.participantes || []).length > 0 && (
            <section className="pdm-panel pdm-participants-panel">
              <h3><BsPeople /> {t('home.projects.detail.participants', { count: project.participantes_count || project.participantes.length })}</h3>
              <div className="pdm-participants">
                {project.participantes.map((participant, index) => (
                  <Link
                    key={`participant-${participant.id_participacion || participant.id_usuario || index}-${index}`}
                    className={participant.vinculado_repositorio || participant.es_propietario_repositorio ? 'is-repository-linked' : ''}
                    to={participant.ruta_portafolio || `/portafolio/${participant.id_usuario}`}
                    aria-label={t('home.projects.detail.viewPortfolio', { name: participant.nombre })}
                  >
                    {participant.avatar_thumb_url || participant.avatar_url ? <img src={participant.avatar_thumb_url || participant.avatar_url} alt="" /> : <span>{String(participant.nombre || '?')[0]}</span>}
                    <div>
                      <strong>{participant.nombre}</strong>
                      <small>{participant.es_propietario_repositorio ? t('home.projects.detail.repositoryOwner') : participant.vinculado_repositorio ? t('home.projects.detail.repositoryLinked') : participant.es_propietario ? t('home.projects.detail.owner') : participant.rol || t('home.projects.detail.participant')}</small>
                      <p>{participant.descripcion_aporte}</p>
                    </div>
                    <BsBoxArrowUpRight className="pdm-participant-link-icon" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {(project.repositorios || []).length > 0 && (
            <section className="pdm-panel pdm-repositories-panel">
              <h3>{t('home.projects.detail.repositories')}</h3>
              <div className="pdm-repositories">
                {project.repositorios.map((repo, index) => (
                  <article key={`repository-${repo.id_proyecto_repositorio || repo.url_repositorio || index}-${index}`}>
                    <div><BsGithub /><strong>{repo.nombre || repo.github_repo_name || t('home.projects.detail.repository')}</strong><span>{repo.proveedor}</span></div>
                    <p>{repo.descripcion || repo.github_description || repo.readme_resumen || t('home.projects.detail.noDescription')}</p>
                    <div className="pdm-repo-stats">
                      <span><BsStar /> {repo.stars_count || 0}</span>
                      <span>{t('home.projects.detail.commits', { count: repo.commits_count || 0 })}</span>
                      <span>{t('home.projects.detail.contributors', { count: repo.contributors_count || 0 })}</span>
                    </div>
                    {repo.url_repositorio && <a href={repo.url_repositorio} target="_blank" rel="noreferrer">{t('home.projects.detail.openRepository')} <BsBoxArrowUpRight /></a>}
                  </article>
                ))}
              </div>
            </section>
          )}

          {links.length > 0 && (
            <section className="pdm-panel pdm-links-panel">
              <h3>{t('home.projects.detail.links')}</h3>
              <div className="pdm-links">
                {links.map((item, index) => <a key={`link-${item.id_evidencia || item.url || index}-${index}`} href={item.url} target="_blank" rel="noreferrer">{item.titulo || item.tipo}<BsBoxArrowUpRight /></a>)}
              </div>
            </section>
          )}

        </div>
      </section>
    </div>
  );
}
