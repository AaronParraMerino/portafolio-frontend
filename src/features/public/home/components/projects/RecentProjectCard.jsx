import { BsCodeSlash } from 'react-icons/bs';
import { useLanguage } from '../../../../../core/i18n';
import {
  getProjectPlatformLabel,
  getProjectTypeLabel,
} from '../../../../dashboard/projects/model/projectsModel';
import './recentProjectsCarousel.css';

const VISIBLE_TECHNOLOGIES = 3;

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
  if (Number.isNaN(date.getTime())) return 'Publicacion reciente';

  return new Intl.DateTimeFormat(
    language === 'en' ? 'en-US' : language === 'pt' ? 'pt-BR' : 'es-BO',
    { day: 'numeric', month: 'short', year: 'numeric' },
  ).format(date);
}

export default function RecentProjectCard({ project, onViewDetails }) {
  const { language, t } = useLanguage();
  const technologies = project.technologies || [];

  return (
    <article className="prc-card">
      <div className="prc-media">
        {project.imageUrl ? (
          <>
            <img className="prc-media-backdrop" src={project.imageUrl} alt="" />
            <img className="prc-media-image" src={project.imageUrl} alt={project.title} />
          </>
        ) : (
          <div className="prc-media-fallback" aria-hidden="true">
            <BsCodeSlash />
          </div>
        )}
        <span className="prc-type">{getProjectTypeLabel(project.type, t)}</span>
      </div>

      <div className="prc-body">
        <span className="prc-platform">{getProjectPlatformLabel(project.platform, t)}</span>
        <h3>{project.title}</h3>
        <p>{project.description || 'Proyecto publicado recientemente en Creafolio.'}</p>

        <div className="prc-technologies" aria-label="Tecnologias del proyecto">
          {technologies.slice(0, VISIBLE_TECHNOLOGIES).map((technology) => (
            <span
              key={technology.id_tecnologia || technology.nombre}
              style={technology.color ? {
                '--prc-tech-color': technology.color,
                '--prc-tech-bg': colorWithAlpha(technology.color, '24'),
                '--prc-tech-border': colorWithAlpha(technology.color, '78'),
              } : undefined}
            >
              <span className="prc-tech-icon" aria-hidden="true">
                {technology.icono_url ? (
                  <img src={technology.icono_url} alt="" />
                ) : (
                  String(technology.nombre || '?').slice(0, 1).toUpperCase()
                )}
              </span>
              <span>{technology.nombre}</span>
            </span>
          ))}
          {technologies.length > VISIBLE_TECHNOLOGIES && (
            <span className="prc-tech-more">+{technologies.length - VISIBLE_TECHNOLOGIES}</span>
          )}
        </div>

        <div className="prc-card-foot">
          <span className="prc-date">Publicado el {formatPublishedDate(project.publishedAt, language)}</span>
          <button type="button" onClick={() => onViewDetails?.(project)}>Ver detalle</button>
        </div>
      </div>
    </article>
  );
}
