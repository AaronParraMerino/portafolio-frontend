import { Link, useLocation } from 'react-router-dom';
import { FiArrowUpRight, FiClock, FiMapPin } from 'react-icons/fi';

const pick = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

function developerId(developer) {
  return pick(developer?.id_usuario, developer?.usuario_id, developer?.user_id, developer?.id);
}

function portfolioPathFor(developer) {
  const id = developerId(developer);
  if (id) return `/portafolio/${id}`;

  return String(developer?.ruta_portafolio || '#').replace(/^\/portfolio\//, '/portafolio/');
}

function developerName(developer = {}) {
  const fullName = [developer.nombre, developer.apellido].filter(Boolean).join(' ').trim();
  return pick(developer.nombre_completo, fullName, developer.nombre, 'Portafolio profesional');
}

function initialsFor(developer = {}) {
  const name = developerName(developer);
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'CF';
  return parts.slice(0, 2).map((part) => part.slice(0, 1).toUpperCase()).join('');
}

function locationFor(developer = {}) {
  return [developer.ciudad, developer.pais].filter(Boolean).join(', ');
}

function relativeDate(value) {
  if (!value) return 'Actividad reciente';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Actividad reciente';

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return 'Actualizado hoy';

  const minutes = Math.max(1, Math.floor(diffMs / 60000));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 60) return `Hace ${minutes} min`;
  if (hours < 24) return `Hace ${hours} h`;
  if (days === 1) return 'Ayer';
  return `Hace ${days} dias`;
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
  const location = useLocation();
  const name = developerName(developer);
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
            {initialsFor(developer)}
          </div>
        )}

        <div className="dev-card-main">
          <h2>{name}</h2>
          <p>{developer.profesion || 'Desarrollador de software'}</p>
        </div>
      </div>

      {developerLocation && (
        <div className="dev-location">
          <FiMapPin aria-hidden="true" />
          <span>{developerLocation}</span>
        </div>
      )}

      <p className="dev-summary">
        {developer.resumen || 'Portafolio publico activo en CreaFolio.'}
      </p>

      <div className="dev-metrics" aria-label="Resumen del portafolio">
        <span><strong>{projectsCount}</strong> Proy.</span>
        <span><strong>{safeNumber(developer.total_experiencias)}</strong> Exp.</span>
        <span><strong>{safeNumber(developer.total_habilidades)}</strong> Habs.</span>
      </div>

      <div className="dev-card-foot">
        <span className="dev-updated">
          <FiClock aria-hidden="true" />
          {relativeDate(developer.fecha_ultima_actualizacion)}
        </span>

        <Link
          className="dev-portfolio-link"
          to={portfolioPathFor(developer)}
          state={{ backLabel: 'Volver a desarrolladores', backFallback }}
        >
          Ver
          <FiArrowUpRight aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
