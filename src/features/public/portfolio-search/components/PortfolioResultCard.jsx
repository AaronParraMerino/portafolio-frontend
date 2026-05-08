import { useNavigate } from 'react-router-dom';

const pick = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

const getInitials = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'PF';
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
};

const parseTechnologies = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean).slice(0, 8);
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
};

const normalizePortfolio = (portfolio = {}) => {
  const id = pick(portfolio.id_usuario, portfolio.usuario_id, portfolio.user_id, portfolio.id);
  const fullName = [portfolio.nombre, portfolio.apellido].filter(Boolean).join(' ').trim();
  const nombre = pick(portfolio.nombre_completo, fullName, portfolio.nombre, 'Portafolio profesional');
  const profesion = pick(portfolio.profesion, 'Profesional de software');
  const ciudad = pick(portfolio.ciudad, '');
  const pais = pick(portfolio.pais, '');

  return {
    id,
    nombre,
    profesion,
    ubicacion: [ciudad, pais].filter(Boolean).join(', ') || 'Ubicación no especificada',
    foto: pick(portfolio.foto_perfil, portfolio.avatar, portfolio.foto, ''),
    tecnologias: parseTechnologies(portfolio.tecnologias_relacionadas),
    habilidades: Number(portfolio.habilidades_relacionadas || 0),
    experiencias: Number(portfolio.experiencias_relacionadas || 0),
    proyectos: Number(portfolio.proyectos_relacionados || 0),
  };
};

const PortfolioResultCard = ({ portfolio }) => {
  const navigate = useNavigate();
  const data = normalizePortfolio(portfolio);

  const handleOpen = () => {
    if (!data.id) return;
    navigate(`/portafolio/${data.id}`);
  };

  return (
    <article className="ps-result-card">
      <button type="button" className="ps-card-click" onClick={handleOpen} aria-label={`Ver portafolio de ${data.nombre}`}>
        <span className={`ps-avatar ${data.foto ? 'has-image' : ''}`} aria-hidden="true">
          {data.foto ? <img src={data.foto} alt="" /> : getInitials(data.nombre)}
        </span>

        <span className="ps-card-main">
          <span className="ps-card-top">
            <span>
              <strong className="ps-card-name">{data.nombre}</strong>
              <span className="ps-card-role">{data.profesion}</span>
              <span className="ps-card-location">{data.ubicacion}</span>
            </span>
          </span>

          {data.tecnologias.length > 0 && (
            <span className="ps-skill-list">
              {data.tecnologias.map((tech) => (
                <span className="ps-skill" key={tech}>{tech}</span>
              ))}
            </span>
          )}

          <span className="ps-card-stats">
            <span><strong>{data.proyectos}</strong> proyectos relacionados</span>
            <span><strong>{data.experiencias}</strong> experiencias relacionadas</span>
            <span><strong>{data.habilidades}</strong> habilidades relacionadas</span>
          </span>
        </span>

        <span className="ps-card-action">Ver portafolio</span>
      </button>
    </article>
  );
};

export default PortfolioResultCard;
