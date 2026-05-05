import { Link } from 'react-router-dom';

const counterLabels = {
  updates: '',
  projects: 'Proyectos',
  experience: 'Experiencias',
  skills: 'Habilidades publicas',
};

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
  const skills = Array.isArray(portfolio.skills_destacadas)
    ? portfolio.skills_destacadas.slice(0, 3)
    : [];
  const projects = Array.isArray(portfolio.proyectos_destacados)
    ? portfolio.proyectos_destacados.slice(0, 2).map((project) => project.titulo).filter(Boolean)
    : [];
  const location = locationFor(portfolio);
  const remainingSkills = Number(portfolio.habilidades_restantes || 0);
  const remainingProjects = Number(portfolio.proyectos_restantes || 0);
  const previewItems = variant === 'projects' && projects.length > 0 ? projects : skills;
  const remainingItems = variant === 'projects' && projects.length > 0 ? remainingProjects : remainingSkills;
  const previewLabel = variant === 'projects'
    ? 'Vista previa de proyectos publicos'
    : 'Vista previa de habilidades destacadas';

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

      {location && <div className="spk-portfolio-location">{location}</div>}

      <div className="spk-portfolio-skills" aria-label={previewLabel}>
        {previewItems.length > 0 ? (
          <>
            {previewItems.map((item) => <span key={item}>{item}</span>)}
            {remainingItems > 0 && <span className="spk-chip-more">+{remainingItems} mas</span>}
          </>
        ) : (
          <span>Perfil publico</span>
        )}
      </div>

      <div className="spk-portfolio-card-foot">
        <div className={`spk-portfolio-counter ${variant === 'updates' ? 'wide' : ''}`}>
          <strong>{counterValue(portfolio, variant)}</strong>
          {variant !== 'updates' && <span>{counterLabels[variant]}</span>}
        </div>

        <Link className="spk-portfolio-cta" to={portfolio.ruta_portafolio || '#'}>
          Ver portafolio
        </Link>
      </div>
    </article>
  );
}
