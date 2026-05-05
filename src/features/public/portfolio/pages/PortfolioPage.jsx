import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { get } from '../../../../services/http/Service';

function initialsFor(portfolio) {
  const first = portfolio?.nombre?.trim()?.slice(0, 1) || 'C';
  const last = portfolio?.apellido?.trim()?.slice(0, 1) || 'F';
  return `${first}${last}`.toUpperCase();
}

function formatDate(value) {
  if (!value) return '';
  const [year, month, day] = String(value).slice(0, 10).split('-');
  return year && month && day ? `${day}/${month}/${year}` : value;
}

export default function PortfolioPage() {
  const { userId } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadPortfolio() {
      try {
        setLoading(true);
        const response = await get(`/home/portafolios/${userId}`);
        if (mounted) {
          if (response?.data) {
            setPortfolio(response.data);
            setError('');
          } else {
            setPortfolio(null);
            setError(response?.message || 'Portafolio publico no encontrado.');
          }
        }
      } catch (err) {
        if (mounted) {
          setPortfolio(null);
          setError(err?.message || 'No se pudo cargar el portafolio.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadPortfolio();

    return () => {
      mounted = false;
    };
  }, [userId]);

  const skills = portfolio?.skills_destacadas || [];
  const experiences = portfolio?.experiencias_destacadas || [];
  const remainingSkills = Number(portfolio?.habilidades_restantes || 0);
  const remainingExperiences = Number(portfolio?.experiencias_restantes || 0);
  const location = [portfolio?.ciudad, portfolio?.pais].filter(Boolean).join(', ');

  return (
    <>
      <style>{`
        .spk-public-portfolio {
          background: var(--fondo);
          min-height: calc(100vh - var(--nav-height));
          padding: 72px 24px 86px;
        }
        .spk-public-portfolio-inner {
          max-width: 960px;
          margin: 0 auto;
        }
        .spk-public-back {
          color: var(--azul);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 18px;
          text-decoration: none;
        }
        .spk-public-card {
          background: var(--blanco);
          border: 1.5px solid var(--gris-borde);
          border-radius: 8px;
          box-shadow: 0 12px 34px rgba(17,24,39,.08);
          padding: 28px;
        }
        .spk-public-card::before {
          content: "";
          display: block;
          height: 4px;
          margin: -28px -28px 24px;
          background: linear-gradient(90deg, var(--azul-deep), var(--azul), var(--azul-mid));
        }
        .spk-public-head {
          display: flex;
          align-items: center;
          gap: 18px;
          margin-bottom: 22px;
        }
        .spk-public-avatar {
          width: 82px;
          height: 82px;
          border-radius: 50%;
          border: 2px solid var(--azul-mid);
          object-fit: cover;
          flex: 0 0 auto;
        }
        .spk-public-avatar-fallback {
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--azul-light), var(--blanco));
          color: var(--azul-deep);
          font-size: 22px;
          font-weight: 800;
        }
        .spk-public-title h1 {
          color: var(--negro-texto);
          font-size: clamp(28px, 5vw, 42px);
          font-weight: 800;
          line-height: 1.05;
          margin: 0 0 8px;
        }
        .spk-public-title p {
          color: var(--gris-texto);
          font-size: 15px;
          margin: 0;
        }
        .spk-public-summary {
          color: var(--gris-oscuro);
          font-size: 15px;
          line-height: 1.7;
          margin: 0 0 22px;
          max-width: 720px;
        }
        .spk-public-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin: 22px 0;
        }
        .spk-public-stat {
          background: var(--azul-light);
          border: 1px solid var(--azul-mid);
          border-radius: 8px;
          padding: 14px;
        }
        .spk-public-stat strong {
          color: var(--azul);
          display: block;
          font-size: 24px;
          font-weight: 800;
          line-height: 1;
        }
        .spk-public-stat span {
          color: var(--gris-texto);
          display: block;
          font-family: var(--mono);
          font-size: 10px;
          margin-top: 6px;
          text-transform: uppercase;
        }
        .spk-public-skills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .spk-public-skills span {
          background: var(--blanco);
          border: 1px solid var(--azul-mid);
          border-radius: 999px;
          color: var(--azul-deep);
          font-size: 12px;
          font-weight: 700;
          padding: 7px 10px;
        }
        .spk-public-skills .spk-public-more {
          background: var(--azul-light);
        }
        .spk-public-section {
          border-top: 1px solid #eef2f6;
          margin-top: 24px;
          padding-top: 22px;
        }
        .spk-public-section-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 12px;
        }
        .spk-public-section-head h2 {
          color: var(--negro-texto);
          font-size: 17px;
          font-weight: 800;
          margin: 0;
        }
        .spk-public-section-head span {
          color: var(--gris-texto);
          font-family: var(--mono);
          font-size: 10px;
          text-transform: uppercase;
        }
        .spk-public-experience-list {
          display: grid;
          gap: 10px;
        }
        .spk-public-experience {
          background: #f9fbfc;
          border: 1px solid var(--gris-borde);
          border-radius: 8px;
          padding: 13px 14px;
        }
        .spk-public-experience strong {
          color: var(--negro-texto);
          display: block;
          font-size: 14px;
          margin-bottom: 3px;
        }
        .spk-public-experience p {
          color: var(--gris-texto);
          font-size: 12px;
          line-height: 1.45;
          margin: 0;
        }
        .spk-public-preview-note {
          color: var(--gris-texto);
          font-size: 12px;
          margin: 10px 0 0;
        }
        .spk-public-empty {
          color: var(--gris-texto);
          font-size: 14px;
          margin: 0;
          min-height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        @media (max-width: 620px) {
          .spk-public-head { align-items: flex-start; flex-direction: column; }
          .spk-public-stats { grid-template-columns: 1fr; }
          .spk-public-card { padding: 22px; }
          .spk-public-card::before { margin: -22px -22px 22px; }
        }
      `}</style>

      <section className="spk-public-portfolio">
        <div className="spk-public-portfolio-inner">
          <Link className="spk-public-back" to="/#desarrolladores">Volver a destacados</Link>

          <div className="spk-public-card">
            {loading && <p className="spk-public-empty">Cargando portafolio publico...</p>}
            {!loading && error && <p className="spk-public-empty">{error}</p>}
            {!loading && !error && portfolio && (
              <>
                <div className="spk-public-head">
                  {portfolio.foto_perfil ? (
                    <img className="spk-public-avatar" src={portfolio.foto_perfil} alt={portfolio.nombre_completo} />
                  ) : (
                    <div className="spk-public-avatar spk-public-avatar-fallback">
                      {initialsFor(portfolio)}
                    </div>
                  )}

                  <div className="spk-public-title">
                    <h1>{portfolio.nombre_completo}</h1>
                    <p>{portfolio.profesion || 'Desarrollador de software'}{location ? ` - ${location}` : ''}</p>
                  </div>
                </div>

                {portfolio.resumen && <p className="spk-public-summary">{portfolio.resumen}</p>}

                <div className="spk-public-stats">
                  <div className="spk-public-stat">
                    <strong>{portfolio.total_proyectos}</strong>
                    <span>Proyectos</span>
                  </div>
                  <div className="spk-public-stat">
                    <strong>{portfolio.total_experiencias}</strong>
                    <span>Experiencias</span>
                  </div>
                  <div className="spk-public-stat">
                    <strong>{portfolio.total_habilidades}</strong>
                    <span>Habilidades</span>
                  </div>
                </div>

                <div className="spk-public-section">
                  <div className="spk-public-section-head">
                    <h2>Habilidades destacadas</h2>
                    <span>{portfolio.total_habilidades} publicas</span>
                  </div>
                  <div className="spk-public-skills">
                    {skills.length > 0
                      ? (
                        <>
                          {skills.map((skill) => <span key={skill}>{skill}</span>)}
                          {remainingSkills > 0 && <span className="spk-public-more">+{remainingSkills} mas</span>}
                        </>
                      )
                      : <span>Sin habilidades publicas</span>}
                  </div>
                  {remainingSkills > 0 && (
                    <p className="spk-public-preview-note">
                      Se muestra una vista previa de habilidades destacadas.
                    </p>
                  )}
                </div>

                <div className="spk-public-section">
                  <div className="spk-public-section-head">
                    <h2>Experiencia publica</h2>
                    <span>{portfolio.total_experiencias} visibles</span>
                  </div>
                  <div className="spk-public-experience-list">
                    {experiences.length > 0 ? experiences.map((experience) => (
                      <div className="spk-public-experience" key={experience.id_experiencia}>
                        <strong>{experience.cargo || 'Cargo no especificado'}</strong>
                        <p>{experience.institucion || 'Institucion no especificada'}</p>
                        <p>
                          {formatDate(experience.fecha_inicio)}
                          {' - '}
                          {experience.es_actual ? 'Actualidad' : formatDate(experience.fecha_fin)}
                        </p>
                      </div>
                    )) : (
                      <div className="spk-public-experience">
                        <p>Sin experiencia publica.</p>
                      </div>
                    )}
                  </div>
                  {remainingExperiences > 0 && (
                    <p className="spk-public-preview-note">+{remainingExperiences} experiencias publicas mas.</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
