import { Link, useParams } from 'react-router-dom';
import '../../../dashboard/styles/dashboard.css';
import '../../../dashboard/view/styles/view.css';
import '../styles/portfolio.css';

import ViewOsFrame from '../../../dashboard/view/components/ViewOsFrame';
import ViewHero from '../../../dashboard/view/components/ViewHero';
import ViewIdentity from '../../../dashboard/view/components/ViewIdentity';
import ViewStats from '../../../dashboard/view/components/ViewStats';
import ViewSkills from '../../../dashboard/view/components/ViewSkills';
import ViewExperience from '../../../dashboard/view/components/ViewExperience';
import ViewProjects from '../../../dashboard/view/components/ViewProjects';
import { FONTS, getAutoTextColor, getFullName } from '../../../dashboard/view/model/viewModel';
import { usePublicPortfolio } from '../hooks/usePublicPortfolio';

export default function PortfolioPage() {
  const { userId } = useParams();
  const { data, loading, error } = usePublicPortfolio(userId);
  const {
    perfil,
    redes = [],
    stats = [],
    habilidades,
    experiencias = [],
    proyectos = [],
    config,
  } = data;

  const selectedFont = FONTS.find(font => font.id === config?.fontId) || FONTS[0];
  const resolvedTextColor = config?.textColorAuto
    ? getAutoTextColor(config?.cardBg || '#ffffff')
    : (config?.textColor || '#111827');
  const visibilidad = config?.visibilidad || {};
  const title = `${getFullName(perfil)} - Portafolio`;
  const hasPortfolioContent = Boolean(perfil)
    || redes.length > 0
    || stats.length > 0
    || (habilidades?.tecnicas || []).length > 0
    || (habilidades?.blandas || []).length > 0
    || experiencias.length > 0
    || proyectos.length > 0;

  if (loading && !hasPortfolioContent) {
    return (
      <div className="vw-page public-portfolio-page">
        <div className="page public-portfolio-main">
          <div className="dash-loading dash-loading--page" role="status" aria-live="polite">
            <span className="dash-loading-spinner" />
            <span>Cargando portafolio publico...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && error && !hasPortfolioContent) {
    return (
      <div className="vw-page public-portfolio-page">
        <div className="page public-portfolio-main">
          <section className="public-portfolio-state">
            <h1>Portafolio no disponible</h1>
            <p>{error}</p>
            <Link className="public-portfolio-link" to="/portafolios">
              Volver a portafolios
            </Link>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div
      className="vw-page public-portfolio-page"
      style={{
        '--hero-bg': config?.heroColor || '#0c1a2e',
        '--avatar-bg': config?.avatarColor || '#0077b7',
        '--accent': config?.accentColor || '#0077b7',
        '--card-bg': config?.cardBg || '#ffffff',
        '--pf-font': selectedFont.value,
        '--text-color': resolvedTextColor,
      }}
    >
      <div className="page public-portfolio-main">
        <ViewOsFrame frameId={config?.frameId || 'mac'} title={title}>
          <ViewHero perfil={perfil} config={config} />

          <ViewIdentity
            perfil={perfil}
            redes={redes}
            disponible={config?.disponible}
            visibilidad={visibilidad}
          />

          <ViewStats
            stats={stats}
            visibilidad={visibilidad}
          />

          <ViewSkills
            habilidades={habilidades}
            visibilidad={visibilidad}
          />

          <ViewExperience
            experiencias={experiencias}
            visibilidad={visibilidad}
          />

          <ViewProjects
            proyectos={proyectos}
            visibilidad={visibilidad}
          />
        </ViewOsFrame>
      </div>
    </div>
  );
}
