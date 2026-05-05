import { useState } from 'react';
import useFeaturedPortfolios from '../hooks/useFeaturedPortfolios';
import PortfolioCard from './PortfolioCard';

const SECTION_CONFIG = [
  {
    key: 'ultimas_actualizaciones',
    label: 'Ultimas actualizaciones',
    description: 'Actividad reciente en perfiles publicos.',
    variant: 'updates',
  },
  {
    key: 'mas_proyectos',
    label: 'Mas proyectos',
    description: 'Se activara cuando existan proyectos publicos.',
    variant: 'projects',
  },
  {
    key: 'mas_experiencia',
    label: 'Mas experiencia',
    description: 'Experiencias publicas laborales y academicas.',
    variant: 'experience',
  },
  {
    key: 'mas_habilidades',
    label: 'Mas habilidades',
    description: 'Stacks con mayor cantidad de habilidades.',
    variant: 'skills',
  },
];

function EmptyState({ sectionKey, meta }) {
  const isProjects = sectionKey === 'mas_proyectos';

  return (
    <div className={`spk-featured-empty${isProjects ? ' projects' : ''}`}>
      <div className="spk-empty-icon" aria-hidden="true">
        {isProjects ? (
          <svg viewBox="0 0 28 28">
            <rect x="4" y="6" width="20" height="15" rx="2.5" />
            <path d="M8 11h5M8 15h8M18 6v15" />
          </svg>
        ) : (
          <svg viewBox="0 0 28 28">
            <circle cx="14" cy="14" r="9" />
            <path d="M10 14h8M14 10v8" />
          </svg>
        )}
      </div>
      <strong>{isProjects ? 'Proyectos publicos en preparacion' : 'Aun no hay resultados'}</strong>
      <span>
        {isProjects
          ? (meta?.mensaje_proyectos || 'Este bloque se activara cuando HU-06 publique proyectos visibles para Home.')
          : 'Cuando existan datos publicos suficientes, este bloque mostrara portafolios destacados.'}
      </span>
    </div>
  );
}

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
          padding: 78px 24px 88px;
        }
        .spk-featured-inner {
          max-width: 1180px;
          margin: 0 auto;
        }
        .spk-featured-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 28px;
          margin-bottom: 26px;
        }
        .spk-featured-kicker {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-family: var(--mono);
          color: var(--azul);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .08em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .spk-featured-kicker::before {
          content: "";
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--rojo-soft);
        }
        .spk-featured-title {
          color: var(--negro-texto);
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 800;
          letter-spacing: 0;
          line-height: 1.04;
          margin: 0;
        }
        .spk-featured-copy {
          color: var(--gris-texto);
          max-width: 540px;
          font-size: 14px;
          line-height: 1.7;
          margin: 11px 0 0;
        }
        .spk-featured-tabs {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 24px;
        }
        .spk-featured-tab {
          min-height: 86px;
          border: 1.5px solid var(--gris-borde);
          background: #f9fbfc;
          border-radius: 8px;
          padding: 14px;
          text-align: left;
          color: var(--gris-oscuro);
          cursor: pointer;
          transition: border-color .15s, background .15s, box-shadow .15s, transform .15s;
        }
        .spk-featured-tab:hover {
          border-color: var(--azul-mid);
          transform: translateY(-1px);
        }
        .spk-featured-tab strong {
          display: block;
          font-size: 13px;
          color: var(--negro-texto);
          margin-bottom: 5px;
        }
        .spk-featured-tab span {
          display: block;
          font-size: 11px;
          line-height: 1.45;
          color: var(--gris-texto);
        }
        .spk-featured-tab.active {
          background: var(--azul-light);
          border-color: var(--azul);
          box-shadow: 0 8px 22px rgba(0,119,183,.12);
        }
        .spk-portfolio-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          min-height: 242px;
        }
        .spk-portfolio-card,
        .spk-featured-empty {
          border: 1.5px solid var(--gris-borde);
          background: var(--blanco);
          border-radius: 8px;
          box-shadow: 0 4px 18px rgba(17,24,39,.06);
        }
        .spk-portfolio-card {
          padding: 18px;
          display: flex;
          min-height: 242px;
          flex-direction: column;
          justify-content: space-between;
          transition: transform .15s, box-shadow .15s, border-color .15s;
        }
        .spk-portfolio-card:hover {
          transform: translateY(-2px);
          border-color: var(--azul-mid);
          box-shadow: 0 12px 28px rgba(17,24,39,.1);
        }
        .spk-portfolio-card-head {
          display: flex;
          gap: 12px;
          align-items: center;
          min-width: 0;
        }
        .spk-portfolio-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--azul-mid);
          flex: 0 0 auto;
        }
        .spk-portfolio-avatar-fallback {
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--azul-light), var(--blanco));
          color: var(--azul-deep);
          font-size: 15px;
          font-weight: 800;
        }
        .spk-portfolio-main {
          min-width: 0;
        }
        .spk-portfolio-main h3 {
          color: var(--negro-texto);
          font-size: 16px;
          font-weight: 800;
          margin: 0 0 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .spk-portfolio-main p,
        .spk-portfolio-location {
          color: var(--gris-texto);
          font-size: 12px;
          line-height: 1.45;
          margin: 0;
        }
        .spk-portfolio-location {
          margin-top: 12px;
        }
        .spk-portfolio-skills {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin: 16px 0;
        }
        .spk-portfolio-skills span {
          background: var(--azul-light);
          border: 1px solid var(--azul-mid);
          border-radius: 999px;
          color: var(--azul-deep);
          font-size: 11px;
          font-weight: 700;
          padding: 5px 9px;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .spk-portfolio-skills .spk-chip-more {
          background: var(--blanco);
          color: var(--gris-oscuro);
          border-color: var(--gris-borde);
        }
        .spk-portfolio-card-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border-top: 1px solid #eef2f6;
          padding-top: 14px;
        }
        .spk-portfolio-counter strong {
          display: block;
          color: var(--azul);
          font-size: 19px;
          font-weight: 800;
          line-height: 1;
        }
        .spk-portfolio-counter.wide strong {
          font-size: 12px;
          line-height: 1.35;
        }
        .spk-portfolio-counter span {
          display: block;
          color: var(--gris-texto);
          font-size: 10px;
          font-family: var(--mono);
          margin-top: 3px;
          text-transform: uppercase;
        }
        .spk-portfolio-cta {
          background: var(--azul);
          border: 1px solid var(--azul);
          border-radius: 6px;
          color: var(--blanco);
          font-size: 12px;
          font-weight: 700;
          padding: 8px 11px;
          text-decoration: none;
          white-space: nowrap;
          transition: background .15s, border-color .15s;
        }
        .spk-portfolio-cta:hover {
          background: var(--azul-hover);
          border-color: var(--azul-hover);
          color: var(--blanco);
        }
        .spk-featured-empty {
          grid-column: 1 / -1;
          min-height: 214px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 30px;
        }
        .spk-featured-empty.projects {
          background: linear-gradient(180deg, #ffffff 0%, var(--azul-light) 100%);
          border-style: dashed;
        }
        .spk-empty-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--azul);
          background: var(--blanco);
          border: 1.5px solid var(--azul-mid);
          margin-bottom: 12px;
        }
        .spk-empty-icon svg {
          width: 25px;
          height: 25px;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        .spk-featured-empty strong {
          color: var(--negro-texto);
          font-size: 16px;
          margin-bottom: 6px;
        }
        .spk-featured-empty span {
          color: var(--gris-texto);
          font-size: 13px;
          max-width: 440px;
          line-height: 1.6;
        }
        @media (max-width: 980px) {
          .spk-featured-header {
            align-items: flex-start;
            flex-direction: column;
          }
          .spk-featured-tabs {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .spk-portfolio-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 620px) {
          .spk-featured-portfolios {
            padding: 58px 18px 66px;
          }
          .spk-featured-tabs,
          .spk-portfolio-grid {
            grid-template-columns: 1fr;
          }
          .spk-featured-tab {
            min-height: auto;
            padding: 12px;
          }
          .spk-portfolio-card-foot {
            align-items: flex-start;
            flex-direction: column;
          }
          .spk-portfolio-cta {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>

      <section className="spk-featured-portfolios" id="desarrolladores">
        <div className="spk-featured-inner">
          <div className="spk-featured-header">
            <div>
              <div className="spk-featured-kicker">Portafolios publicos</div>
              <h2 className="spk-featured-title">Portafolios destacados</h2>
              <p className="spk-featured-copy">
                Descubre perfiles profesionales activos con experiencia visible, habilidades registradas y datos publicos listos para consultar.
              </p>
            </div>
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
                <div className="spk-empty-icon" aria-hidden="true">
                  <svg viewBox="0 0 28 28">
                    <circle cx="14" cy="14" r="9" />
                    <path d="M14 8v6l4 3" />
                  </svg>
                </div>
                <strong>Cargando portafolios</strong>
                <span>Estamos preparando los perfiles publicos destacados.</span>
              </div>
            )}

            {!loading && error && (
              <div className="spk-featured-empty">
                <div className="spk-empty-icon" aria-hidden="true">
                  <svg viewBox="0 0 28 28">
                    <circle cx="14" cy="14" r="9" />
                    <path d="M14 9v6M14 19h.01" />
                  </svg>
                </div>
                <strong>No se pudo cargar la seccion</strong>
                <span>{error}</span>
              </div>
            )}

            {!loading && !error && portfolios.length === 0 && (
              <EmptyState sectionKey={activeSection.key} meta={sections.meta} />
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
