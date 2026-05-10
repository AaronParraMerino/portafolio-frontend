import { useState } from 'react';
import useFeaturedPortfolios from '../hooks/useFeaturedPortfolios';
import PortfolioCard from './PortfolioCard';

const SECTION_CONFIG = [
  {
    key: 'ultimas_actualizaciones',
    label: 'Ultimas actualizaciones',
    description: 'Portafolios activos con cambios recientes.',
    variant: 'updates',
  },
  {
    key: 'mas_proyectos',
    label: 'Mas proyectos',
    description: 'Perfiles con mayor cantidad de proyectos publicados.',
    variant: 'projects',
  },
  {
    key: 'mas_experiencia',
    label: 'Mas experiencia',
    description: 'Profesionales con mas experiencia laboral visible.',
    variant: 'experience',
  },
  {
    key: 'mas_habilidades',
    label: 'Mas habilidades',
    description: 'Portafolios con mas habilidades registradas.',
    variant: 'skills',
  },
];

export default function FeaturedPortfolios() {
  const { sections, loading, error } = useFeaturedPortfolios();
  const [activeKey, setActiveKey] = useState(SECTION_CONFIG[0].key);
  const activeSection = SECTION_CONFIG.find((section) => section.key === activeKey) || SECTION_CONFIG[0];
  const portfolios = sections[activeSection.key] || [];

  return (
    <>
      <style>{`
        .spk-featured-portfolios {
          background: var(--blanco);
          border-top: 1px solid rgba(209,213,219,.8);
          padding: 74px 24px 82px;
        }
        .spk-featured-inner { max-width: 1180px; margin: 0 auto; }
        .spk-featured-header {
          display: flex; align-items: end; justify-content: space-between;
          gap: 24px; margin-bottom: 24px;
        }
        .spk-featured-kicker {
          font-family: var(--mono); color: var(--azul); font-size: 11px;
          font-weight: 600; letter-spacing: .08em; text-transform: uppercase; margin-bottom: 8px;
        }
        .spk-featured-title {
          color: var(--negro-texto); font-size: clamp(28px, 4vw, 44px);
          font-weight: 800; letter-spacing: 0; line-height: 1.04; margin: 0;
        }
        .spk-featured-copy {
          color: var(--gris-texto); max-width: 440px; font-size: 14px;
          line-height: 1.7; margin: 10px 0 0;
        }
        .spk-featured-link {
          color: var(--azul); font-size: 13px; font-weight: 700; text-decoration: none;
          border: 1.5px solid var(--azul-mid); border-radius: 6px; padding: 9px 14px;
          white-space: nowrap; transition: background .15s, border-color .15s;
        }
        .spk-featured-link:hover { background: var(--azul-light); border-color: var(--azul); }
        .spk-featured-tabs {
          display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px; margin-bottom: 26px;
        }
        .spk-featured-tab {
          border: 1.5px solid var(--gris-borde); background: #f9fbfc; border-radius: 8px;
          padding: 13px 14px; text-align: left; color: var(--gris-oscuro); cursor: pointer;
          transition: border-color .15s, background .15s, box-shadow .15s;
        }
        .spk-featured-tab strong {
          display: block; font-size: 13px; color: var(--negro-texto); margin-bottom: 4px;
        }
        .spk-featured-tab span {
          display: block; font-size: 11px; line-height: 1.45; color: var(--gris-texto);
        }
        .spk-featured-tab.active {
          background: var(--azul-light); border-color: var(--azul);
          box-shadow: 0 8px 22px rgba(0,119,183,.12);
        }
        .spk-portfolio-grid {
          display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px; min-height: 235px;
        }
        .spk-portfolio-card,
        .spk-featured-empty {
          border: 1.5px solid var(--gris-borde); background: var(--blanco);
          border-radius: 8px; box-shadow: 0 4px 18px rgba(17,24,39,.06);
        }
        .spk-portfolio-card {
          padding: 18px; display: flex; min-height: 235px; flex-direction: column;
          justify-content: space-between; transition: transform .15s, box-shadow .15s, border-color .15s;
        }
        .spk-portfolio-card:hover {
          transform: translateY(-2px); border-color: var(--azul-mid);
          box-shadow: 0 12px 28px rgba(17,24,39,.1);
        }
        .spk-portfolio-card-head { display: flex; gap: 12px; align-items: center; min-width: 0; }
        .spk-portfolio-avatar {
          width: 54px; height: 54px; border-radius: 50%; object-fit: cover;
          border: 2px solid var(--azul-mid); flex: 0 0 auto;
        }
        .spk-portfolio-avatar-fallback {
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, var(--azul-light), var(--blanco));
          color: var(--azul-deep); font-size: 15px; font-weight: 800;
        }
        .spk-portfolio-main { min-width: 0; }
        .spk-portfolio-main h3 {
          color: var(--negro-texto); font-size: 16px; font-weight: 800; margin: 0 0 3px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .spk-portfolio-main p,
        .spk-portfolio-location {
          color: var(--gris-texto); font-size: 12px; line-height: 1.45; margin: 0;
        }
        .spk-portfolio-location { margin-top: 12px; }
        .spk-portfolio-skills { display: flex; flex-wrap: wrap; gap: 7px; margin: 16px 0; }
        .spk-portfolio-skills span {
          background: var(--azul-light); border: 1px solid var(--azul-mid); border-radius: 999px;
          color: var(--azul-deep); font-size: 11px; font-weight: 700; padding: 5px 9px;
          max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .spk-portfolio-card-foot {
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          border-top: 1px solid #eef2f6; padding-top: 14px;
        }
        .spk-portfolio-counter strong {
          display: block; color: var(--azul); font-size: 18px; font-weight: 800; line-height: 1;
        }
        .spk-portfolio-counter.wide strong { font-size: 12px; line-height: 1.35; }
        .spk-portfolio-counter span {
          display: block; color: var(--gris-texto); font-size: 10px; font-family: var(--mono);
          margin-top: 3px; text-transform: uppercase;
        }
        .spk-portfolio-cta {
          background: var(--azul); border: 1px solid var(--azul); border-radius: 6px;
          color: var(--blanco); font-size: 12px; font-weight: 700; padding: 8px 11px;
          text-decoration: none; white-space: nowrap; transition: background .15s, border-color .15s;
        }
        .spk-portfolio-cta:hover {
          background: var(--azul-hover); border-color: var(--azul-hover); color: var(--blanco);
        }
        .spk-featured-empty {
          grid-column: 1 / -1; min-height: 190px; display: flex; flex-direction: column;
          justify-content: center; align-items: center; text-align: center; padding: 28px;
        }
        .spk-featured-empty strong { color: var(--negro-texto); font-size: 16px; margin-bottom: 6px; }
        .spk-featured-empty span {
          color: var(--gris-texto); font-size: 13px; max-width: 380px; line-height: 1.6;
        }
        @media (max-width: 980px) {
          .spk-featured-header { align-items: flex-start; flex-direction: column; }
          .spk-featured-tabs { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .spk-portfolio-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 620px) {
          .spk-featured-portfolios { padding: 56px 18px 64px; }
          .spk-featured-tabs,
          .spk-portfolio-grid { grid-template-columns: 1fr; }
          .spk-featured-tab { padding: 12px; }
        }
      `}</style>

      <section className="spk-featured-portfolios" id="desarrolladores">
        <div className="spk-featured-inner">
          <div className="spk-featured-header">
            <div>
              <div className="spk-featured-kicker">Home publica</div>
              <h2 className="spk-featured-title">Portafolios destacados</h2>
              <p className="spk-featured-copy">
                Explora perfiles profesionales con actividad reciente, experiencia visible y habilidades publicas.
              </p>
            </div>
            <a className="spk-featured-link" href="#desarrolladores">
              Mostrar todo
            </a>
          </div>

          <div className="spk-featured-tabs" role="tablist" aria-label="Rankings de portafolios">
            {SECTION_CONFIG.map((section) => (
              <button
                key={section.key}
                type="button"
                className={`spk-featured-tab${section.key === activeKey ? ' active' : ''}`}
                onClick={() => setActiveKey(section.key)}
              >
                <strong>{section.label}</strong>
                <span>{section.description}</span>
              </button>
            ))}
          </div>

          <div className="spk-portfolio-grid">
            {loading && (
              <div className="spk-featured-empty">
                <strong>Cargando portafolios</strong>
                <span>Estamos preparando los perfiles publicos destacados.</span>
              </div>
            )}

            {!loading && error && (
              <div className="spk-featured-empty">
                <strong>No se pudo cargar la seccion</strong>
                <span>{error}</span>
              </div>
            )}

            {!loading && !error && portfolios.length === 0 && (
              <div className="spk-featured-empty">
                <strong>Aun no hay resultados</strong>
                <span>Cuando existan datos publicos suficientes, este bloque mostrara portafolios destacados.</span>
              </div>
            )}

            {!loading && !error && portfolios.map((portfolio) => (
              <PortfolioCard
                key={`${activeSection.key}-${portfolio.id_usuario}`}
                portfolio={portfolio}
                variant={activeSection.variant}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
