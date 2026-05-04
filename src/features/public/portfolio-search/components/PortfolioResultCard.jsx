import { useNavigate } from 'react-router-dom';

const pick = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

const getInitials = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'PF';
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
};

const normalizeSkills = (portfolio) => {
  const rawSkills = pick(
    portfolio.habilidades_principales,
    portfolio.habilidades,
    portfolio.skills,
    portfolio.tecnologias,
    []
  );

  if (!Array.isArray(rawSkills)) return [];

  return rawSkills
    .map((skill) => {
      if (typeof skill === 'string') return skill;
      return skill?.nombre || skill?.name || skill?.habilidad || skill?.tecnologia || '';
    })
    .filter(Boolean)
    .slice(0, 8);
};

const normalizePortfolio = (portfolio = {}) => {
  const user = portfolio.usuario || portfolio.user || portfolio.perfil || portfolio.profile || {};

  const id = pick(
    portfolio.id_portafolio,
    portfolio.id_usuario,
    portfolio.usuario_id,
    portfolio.user_id,
    portfolio.id,
    user.id_usuario,
    user.id
  );

  const nombre = pick(
    portfolio.nombre_completo,
    portfolio.nombre,
    portfolio.name,
    user.nombre_completo,
    user.nombre,
    user.name,
    'Portafolio profesional'
  );

  const profesion = pick(
    portfolio.profesion,
    portfolio.rol,
    portfolio.cargo,
    user.profesion,
    user.rol,
    'Profesional de software'
  );

  const ciudad = pick(portfolio.ciudad, user.ciudad, '');
  const pais = pick(portfolio.pais, user.pais, '');
  const ubicacion = [ciudad, pais].filter(Boolean).join(', ') || 'Ubicación no especificada';

  return {
    id,
    nombre,
    profesion,
    ubicacion,
    relevancia: Number(pick(portfolio.relevancia, portfolio.score, portfolio.match, 0)),
    nivel: pick(portfolio.nivel, portfolio.nivel_principal, portfolio.nivel_habilidad, ''),
    estado: pick(portfolio.estado, portfolio.estado_portafolio, ''),
    proyectos: Number(pick(portfolio.total_proyectos, portfolio.proyectos_count, portfolio.cantidad_proyectos, 0)),
    experiencias: Number(pick(portfolio.total_experiencias, portfolio.experiencias_count, portfolio.cantidad_experiencias, 0)),
    habilidades: Number(pick(portfolio.total_habilidades, portfolio.habilidades_count, portfolio.cantidad_habilidades, 0)),
    skills: normalizeSkills(portfolio),
  };
};

const PortfolioResultCard = ({ portfolio }) => {
  const navigate = useNavigate();
  const data = normalizePortfolio(portfolio);

  const handleOpen = () => {
    if (!data.id) return;
    navigate(`/portafolio/${data.id}`);
  };

  const relevance = Math.max(0, Math.min(100, Math.round(data.relevancia || 0)));

  return (
    <article className="ps-result-card">
      <button type="button" className="ps-card-click" onClick={handleOpen} aria-label={`Ver portafolio de ${data.nombre}`}>
        <span className="ps-avatar" aria-hidden="true">{getInitials(data.nombre)}</span>

        <span className="ps-card-main">
          <span className="ps-card-top">
            <span>
              <strong className="ps-card-name">{data.nombre}</strong>
              <span className="ps-card-role">{data.profesion}</span>
              <span className="ps-card-location">{data.ubicacion}</span>
            </span>

            {relevance > 0 && (
              <span className="ps-relevance">
                <strong>{relevance}%</strong>
                <span className="ps-relevance-bar"><span style={{ width: `${relevance}%` }} /></span>
                <small>Relevancia</small>
              </span>
            )}
          </span>

          <span className="ps-card-badges">
            {data.nivel && <span className="ps-badge blue">{data.nivel}</span>}
            {data.estado && <span className="ps-badge green">{data.estado}</span>}
            <span className="ps-badge yellow">{data.proyectos} proyectos</span>
          </span>

          {data.skills.length > 0 && (
            <span className="ps-skill-list">
              {data.skills.map((skill) => (
                <span className="ps-skill" key={skill}>{skill}</span>
              ))}
            </span>
          )}

          <span className="ps-card-stats">
            <span><strong>{data.proyectos}</strong> proyectos</span>
            <span><strong>{data.experiencias}</strong> experiencias</span>
            <span><strong>{data.habilidades}</strong> habilidades</span>
          </span>
        </span>

        <span className="ps-card-action">Ver portafolio</span>
      </button>
    </article>
  );
};

export default PortfolioResultCard;
