import { Link, useLocation } from 'react-router-dom';
import { FiArrowUpRight, FiClock, FiMapPin } from 'react-icons/fi';
import { useLanguage } from '../../../../core/i18n';

const pick = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

function developerId(developer) {
  return pick(developer?.id_usuario, developer?.usuario_id, developer?.user_id, developer?.id);
}

function portfolioPathFor(developer) {
  const id = developerId(developer);
  if (id) return `/portafolio/${id}`;

  return String(developer?.ruta_portafolio || '#').replace(/^\/portfolio\//, '/portafolio/');
}

function developerName(developer = {}, fallback = 'CreaFolio') {
  const fullName = [developer.nombre, developer.apellido].filter(Boolean).join(' ').trim();
  return pick(developer.nombre_completo, fullName, developer.nombre, fallback);
}

function initialsFor(developer = {}, fallback) {
  const name = developerName(developer, fallback);
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'CF';
  return parts.slice(0, 2).map((part) => part.slice(0, 1).toUpperCase()).join('');
}

function locationFor(developer = {}) {
  return [developer.ciudad, developer.pais].filter(Boolean).join(', ');
}

function relativeDate(value, t) {
  if (!value) return t('public.developers.recentActivity');

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return t('public.developers.recentActivity');

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return t('public.developers.updatedToday');

  const minutes = Math.max(1, Math.floor(diffMs / 60000));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 60) return t('public.developers.minutesAgo', { count: minutes });
  if (hours < 24) return t('public.developers.hoursAgo', { count: hours });
  if (days === 1) return t('public.developers.yesterday');
  return t('public.developers.daysAgo', { count: days });
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function countProjects(developer = {}) {
  const listCount = Array.isArray(developer.proyectos) ? developer.proyectos.length : undefined;

  return [
    developer.total_proyectos,
    developer.proyectos_relacionados,
    developer.proyectos_publicos,
    developer.total_proyectos_publicos,
    developer.proyectos_count,
    developer.projects_count,
    developer.total_projects,
    developer.cantidad_proyectos,
    developer.numero_proyectos,
    developer.metricas?.proyectos,
    developer.stats?.proyectos,
    listCount
  ].reduce((max, value) => {
    const number = safeNumber(value);
    return number > max ? number : max;
  }, 0);
}

export default function DeveloperCard({ developer }) {
  const { t } = useLanguage();
  const location = useLocation();
  const fallbackName = t('public.developers.defaultName');
  const name = developerName(developer, fallbackName);
  const developerLocation = locationFor(developer);
  const projectsCount = countProjects(developer);
  const backFallback = `${location.pathname}${location.search}${location.hash}` || '/desarrolladores';

  return (
    <article className="dev-card">
      <div className="dev-card-head">
        {developer.foto_perfil ? (
          <img className="dev-avatar" src={developer.foto_perfil} alt={name} />
        ) : (
          <div className="dev-avatar dev-avatar-fallback" aria-hidden="true">
            {initialsFor(developer, fallbackName)}
          </div>
        )}

        <div className="dev-card-main">
          <h2>{name}</h2>
          <p>{developer.profesion || t('public.developers.defaultProfession')}</p>
        </div>
      </div>

      {developerLocation && (
        <div className="dev-location">
          <FiMapPin aria-hidden="true" />
          <span>{developerLocation}</span>
        </div>
      )}

      <p className="dev-summary">
        {developer.resumen || t('public.developers.defaultSummary')}
      </p>

      <div className="dev-metrics" aria-label={t('public.developers.metricsAria')}>
        <span><strong>{projectsCount}</strong> {t('public.developers.projectsShort')}</span>
        <span><strong>{safeNumber(developer.total_experiencias)}</strong> {t('public.developers.experienceShort')}</span>
        <span><strong>{safeNumber(developer.total_habilidades)}</strong> {t('public.developers.skillsShort')}</span>
      </div>

      <div className="dev-card-foot">
        <span className="dev-updated">
          <FiClock aria-hidden="true" />
          {relativeDate(developer.fecha_ultima_actualizacion, t)}
        </span>

        <Link
          className="dev-portfolio-link"
          to={portfolioPathFor(developer)}
          state={{ backLabel: t('public.developers.backToDevelopers'), backFallback }}
        >
          {t('public.developers.view')}
          <FiArrowUpRight aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
