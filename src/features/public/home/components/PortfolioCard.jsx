import { Link, useLocation } from 'react-router-dom';

const counterLabels = {
  updates: 'Actualizacion',
  projects: 'Proyectos',
  experience: 'Experiencias',
  skills: 'Habilidades',
};

const pick = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

function portfolioPathFor(portfolio) {
  const id = pick(portfolio?.id_usuario, portfolio?.usuario_id, portfolio?.user_id, portfolio?.id);
  if (id) return `/portafolio/${id}`;

  return String(portfolio?.ruta_portafolio || '#').replace(/^\/portfolio\//, '/portafolio/');
}

function initialsFor(portfolio) {
  const first = portfolio?.nombre?.trim()?.slice(0, 1) || 'C';
  const last = portfolio?.apellido?.trim()?.slice(0, 1) || 'F';
  return `${first}${last}`.toUpperCase();
}

function locationFor(portfolio) {
  return [portfolio?.ciudad, portfolio?.pais].filter(Boolean).join(', ');
}

function relativeDate(value) {
  if (!value) return 'Actualizado recientemente';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Actualizado recientemente';

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60000));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 60) return `Actualizado hace ${minutes} min`;
  if (hours < 24) return `Actualizado hace ${hours} h`;
  if (days === 1) return 'Actualizado ayer';
  return `Actualizado hace ${days} dias`;
}

function counterValue(portfolio, variant) {
  if (variant === 'projects') return portfolio.total_proyectos || 0;
  if (variant === 'experience') return portfolio.total_experiencias || 0;
  if (variant === 'skills') return portfolio.total_habilidades || 0;
  return relativeDate(portfolio.fecha_ultima_actualizacion);
}

export default function PortfolioCard({ portfolio, variant }) {
  const routerLocation = useLocation();
  const skills = Array.isArray(portfolio.skills_destacadas)
    ? portfolio.skills_destacadas.slice(0, 3)
    : [];
  const portfolioLocation = locationFor(portfolio);
  const portfolioPath = portfolioPathFor(portfolio);
  const backFallback = `${routerLocation.pathname}${routerLocation.search}${routerLocation.hash}` || '/';

  return (
    <article className="spk-portfolio-card">
      <div className="spk-portfolio-card-head">
        {portfolio.foto_perfil ? (
          <img className="spk-portfolio-avatar" src={portfolio.foto_perfil} alt={portfolio.nombre_completo} />
        ) : (
          <div className="spk-portfolio-avatar spk-portfolio-avatar-fallback">
            {initialsFor(portfolio)}
          </div>
        )}

        <div className="spk-portfolio-main">
          <h3>{portfolio.nombre_completo || 'Portafolio profesional'}</h3>
          <p>{portfolio.profesion || 'Desarrollador de software'}</p>
        </div>
      </div>

      {portfolioLocation && <div className="spk-portfolio-location">{portfolioLocation}</div>}

      <div className="spk-portfolio-skills" aria-label="Habilidades destacadas">
        {skills.length > 0 ? (
          skills.map((skill) => <span key={skill}>{skill}</span>)
        ) : (
          <span>Perfil publico</span>
        )}
      </div>

      <div className="spk-portfolio-card-foot">
        <div className={`spk-portfolio-counter ${variant === 'updates' ? 'wide' : ''}`}>
          <strong>{counterValue(portfolio, variant)}</strong>
          {variant !== 'updates' && <span>{counterLabels[variant]}</span>}
        </div>

        <Link
          className="spk-portfolio-cta"
          to={portfolioPath}
          state={{ backLabel: 'Volver al Home', backFallback }}
        >
          Ver portafolio
        </Link>
      </div>
    </article>
  );
}
