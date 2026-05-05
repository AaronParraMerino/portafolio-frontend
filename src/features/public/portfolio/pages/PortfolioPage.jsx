import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { get } from '../../../../services/http/Service';

function initialsFor(portfolio) {
  const first = portfolio?.nombre?.trim()?.slice(0, 1) || 'C';
  const last = portfolio?.apellido?.trim()?.slice(0, 1) || 'F';
  return `${first}${last}`.toUpperCase();
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
        const response = await get(`/home/portafolios/${userId}`);
        if (mounted) {
          setPortfolio(response?.data ?? null);
          setError('');
        }
      } catch (err) {
        if (mounted) {
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
        .spk-public-empty {
          color: var(--gris-texto);
          text-align: center;
        }
        @media (max-width: 620px) {
          .spk-public-head { align-items: flex-start; flex-direction: column; }
          .spk-public-stats { grid-template-columns: 1fr; }
          .spk-public-card { padding: 22px; }
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

                <div className="spk-public-skills">
                  {skills.length > 0
                    ? skills.map((skill) => <span key={skill}>{skill}</span>)
                    : <span>Perfil publico</span>}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
