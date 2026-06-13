import { useState } from 'react';
import { Link } from 'react-router-dom';
import useFeaturedPortfolios from '../hooks/useFeaturedPortfolios';
import PortfolioCard from './PortfolioCard';
import { useLanguage } from '../../../../core/i18n';

const SECTION_CONFIG = [
  {
    key: 'ultimas_actualizaciones',
    labelKey: 'featured.tab.updates.label',
    descriptionKey: 'featured.tab.updates.description',
    variant: 'updates',
  },
  {
    key: 'mas_proyectos',
    labelKey: 'featured.tab.projects.label',
    descriptionKey: 'featured.tab.projects.description',
    variant: 'projects',
  },
  {
    key: 'mas_experiencia',
    labelKey: 'featured.tab.experience.label',
    descriptionKey: 'featured.tab.experience.description',
    variant: 'experience',
  },
  {
    key: 'mas_habilidades',
    labelKey: 'featured.tab.skills.label',
    descriptionKey: 'featured.tab.skills.description',
    variant: 'skills',
  },
];

export default function FeaturedPortfolios() {
  const { t } = useLanguage();
  const { sections, loading, error } = useFeaturedPortfolios('', {
    defaultErrorMessage: t('featured.error.text'),
  });
  const [activeKey, setActiveKey] = useState(SECTION_CONFIG[0].key);
  const activeSection = SECTION_CONFIG.find((section) => section.key === activeKey) || SECTION_CONFIG[0];
  const portfolios = sections[activeSection.key] || [];

  return (
    <>
      <style>{`
        .spk-featured-portfolios {
          background-color: #043B5A;
          background-image: url("data:image/svg+xml,%3Csvg width='52' height='52' viewBox='0 0 52 52' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M52 0H0V52' fill='none' stroke='%23ffffff' stroke-opacity='.09' stroke-width='1'/%3E%3C/svg%3E");
          background-size: 52px 52px;
          border-top: 1px solid rgba(209,213,219,.8);
          overflow-x: hidden;
          padding: 74px 24px 82px;
        }
        .spk-featured-inner { max-width: 1180px; margin: 0 auto; }
        .spk-featured-header {
          display: flex; align-items: center; justify-content: space-between;
          gap: 18px; margin-bottom: 18px; min-width: 0;
        }
        .spk-featured-title {
          color: var(--blanco); font-size: 18px;
          font-weight: 900; letter-spacing: 0; line-height: 1.2; margin: 0;
          overflow-wrap: anywhere;
        }
        .spk-featured-copy {
          color: rgba(255, 255, 255, .78); max-width: 440px; font-size: 14px;
          line-height: 1.7; margin: 8px 0 0;
        }
        .spk-featured-link {
          background: rgba(255, 255, 255, .08); color: var(--blanco); font-size: 13px; font-weight: 900; text-decoration: none;
          border: 1.5px solid rgba(255, 255, 255, .55); border-radius: 7px; padding: 9px 13px;
          white-space: nowrap; transition: background .15s, border-color .15s, color .15s;
        }
        .spk-featured-link:hover { background: var(--blanco); border-color: var(--blanco); color: var(--azul-deep); }
        .spk-featured-tabs {
          display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px; margin-bottom: 26px;
        }
        .spk-featured-tab {
          align-items: flex-start; background: rgba(255, 255, 255, .08);
          border: 1.5px solid rgba(255, 255, 255, .32); border-radius: 8px;
          color: rgba(255, 255, 255, .86); cursor: pointer; display: flex;
          flex-direction: column; font-family: var(--font); gap: 4px;
          min-height: 40px; min-width: 0; padding: 8px 12px;
          text-align: left;
          transition: background .15s, border-color .15s, color .15s, box-shadow .15s;
        }
        .spk-featured-tab strong {
          display: block; font-size: 12px; color: inherit; margin-bottom: 0;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .spk-featured-tab span {
          display: block; color: rgba(255, 255, 255, .66);
          font-size: 11px; line-height: 1.35; max-width: 230px;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .spk-featured-tab:hover {
          border-color: rgba(255, 255, 255, .62);
          color: var(--blanco);
        }
        .spk-featured-tab.active {
          background: var(--blanco); border-color: var(--blanco);
          box-shadow: 0 8px 22px rgba(0, 15, 25, .18);
          color: var(--azul-deep);
        }
        .spk-featured-tab.active span {
          color: var(--gris-texto);
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
          min-width: 0; overflow: hidden;
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
        .spk-portfolio-main { min-width: 0; overflow: hidden; }
        .spk-portfolio-main h3 {
          color: var(--negro-texto); font-size: 16px; font-weight: 800; margin: 0 0 3px;
          display: block; max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .spk-portfolio-main p,
        .spk-portfolio-location {
          color: var(--gris-texto); font-size: 12px; line-height: 1.45; margin: 0;
          overflow: hidden; text-overflow: ellipsis;
        }
        .spk-portfolio-main p,
        .spk-portfolio-location { white-space: nowrap; }
        .spk-portfolio-location { margin-top: 12px; max-width: 100%; }
        .spk-portfolio-skills { display: flex; flex-wrap: wrap; gap: 7px; margin: 16px 0; }
        .spk-portfolio-skills span {
          background: var(--azul-light); border: 1px solid var(--azul-mid); border-radius: 999px;
          color: var(--azul-deep); font-size: 11px; font-weight: 700; padding: 5px 9px;
          max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .spk-portfolio-card-foot {
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          border-top: 1px solid #eef2f6; padding-top: 14px;
          min-width: 0;
        }
        .spk-portfolio-counter { min-width: 0; }
        .spk-portfolio-counter strong {
          display: block; color: var(--azul); font-size: 18px; font-weight: 800; line-height: 1;
          max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .spk-portfolio-counter.wide strong { font-size: 12px; line-height: 1.35; }
        .spk-portfolio-counter span {
          display: block; color: var(--gris-texto); font-size: 10px; font-family: var(--mono);
          margin-top: 3px; text-transform: uppercase;
        }
        .spk-portfolio-cta {
          background: var(--azul); border: 1px solid var(--azul); border-radius: 6px;
          color: var(--blanco); font-size: 12px; font-weight: 700; padding: 8px 11px;
          flex: 0 0 auto; max-width: 48%; overflow: hidden; text-align: center; text-decoration: none;
          text-overflow: ellipsis; white-space: nowrap; transition: background .15s, border-color .15s;
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
          .spk-featured-header { align-items: flex-start; }
          .spk-featured-tabs {
            display: flex; gap: 9px; overflow-x: auto; padding: 2px 2px 8px; scrollbar-width: thin;
          }
          .spk-featured-tab {
            align-items: center; flex: 0 0 auto; flex-direction: row; gap: 8px;
          }
          .spk-portfolio-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 620px) {
          .spk-featured-portfolios { padding: 56px 18px 64px; }
          .spk-featured-header {
            display: grid; gap: 14px; grid-template-columns: minmax(0, 1fr) auto;
          }
          .spk-featured-link { width: fit-content; max-width: 100%; }
          .spk-featured-tabs {
            margin-left: -2px; margin-right: -2px; max-width: 100%;
          }
          .spk-featured-tab {
            min-height: 38px; padding: 8px 11px;
          }
          .spk-featured-tab span { display: none; }
          .spk-portfolio-grid { grid-template-columns: 1fr; }
          .spk-portfolio-card { padding: 14px; min-height: 220px; }
          .spk-portfolio-card-head { align-items: flex-start; }
          .spk-portfolio-avatar { width: 48px; height: 48px; }
          .spk-portfolio-card-foot { align-items: stretch; flex-direction: column; gap: 10px; }
          .spk-portfolio-cta { max-width: none; width: 100%; }
        }
        @media (max-width: 380px) {
          .spk-featured-portfolios { padding-left: 14px; padding-right: 14px; }
          .spk-featured-title { font-size: 17px; }
          .spk-portfolio-main h3 { font-size: 15px; }
          .spk-portfolio-skills span { max-width: calc(100vw - 64px); }
        }
      `}</style>

      <section className="spk-featured-portfolios" id="desarrolladores">
        <div className="spk-featured-inner">
          <div className="spk-featured-header">
            <div>
              <h2 className="spk-featured-title">{t('featured.title')}</h2>
              <p className="spk-featured-copy">
                {t('featured.copy')}
              </p>
            </div>
            <Link className="spk-featured-link" to="/desarrolladores">
              {t('featured.showAll')}
            </Link>
          </div>

          <div className="spk-featured-tabs" role="tablist" aria-label={t('featured.tabs.aria')}>
            {SECTION_CONFIG.map((section) => (
              <button
                key={section.key}
                type="button"
                className={`spk-featured-tab${section.key === activeKey ? ' active' : ''}`}
                onClick={() => setActiveKey(section.key)}
              >
                <strong>{t(section.labelKey)}</strong>
                <span>{t(section.descriptionKey)}</span>
              </button>
            ))}
          </div>

          <div className="spk-portfolio-grid">
            {loading && (
              <div className="spk-featured-empty">
                <strong>{t('featured.loading.title')}</strong>
                <span>{t('featured.loading.text')}</span>
              </div>
            )}

            {!loading && error && (
              <div className="spk-featured-empty">
                <strong>{t('featured.error.title')}</strong>
                <span>{error}</span>
              </div>
            )}

            {!loading && !error && portfolios.length === 0 && (
              <div className="spk-featured-empty">
                <strong>{t('featured.empty.default.title')}</strong>
                <span>{t('featured.empty.default.text')}</span>
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
