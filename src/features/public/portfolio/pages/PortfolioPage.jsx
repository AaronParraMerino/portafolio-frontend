import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
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

const backBarStyle = {
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: 10,
  justifyContent: 'space-between',
  marginBottom: 18,
};

const backButtonStyle = {
  alignItems: 'center',
  background: 'var(--blanco)',
  border: '1.5px solid var(--azul-mid)',
  borderRadius: 8,
  boxShadow: '0 8px 22px var(--azul-glow)',
  color: 'var(--azul-deep)',
  cursor: 'pointer',
  display: 'inline-flex',
  fontFamily: 'var(--font)',
  fontSize: 13,
  fontWeight: 800,
  gap: 8,
  minHeight: 40,
  padding: '0 14px',
};

const backIndicatorStyle = {
  background: 'var(--azul-light)',
  border: '1px solid var(--azul-mid)',
  borderRadius: 999,
  color: 'var(--azul-deep)',
  fontFamily: 'var(--mono)',
  fontSize: 11,
  fontWeight: 700,
  padding: '6px 10px',
};

function PublicPortfolioBackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const backLabel = typeof state.backLabel === 'string' ? state.backLabel : 'Volver atras';
  const backFallback = typeof state.backFallback === 'string' ? state.backFallback : '/portafolios';
  const hasPreviousEntry = typeof window !== 'undefined'
    && window.history.length > 1
    && location.key !== 'default';

  const handleBack = () => {
    if (hasPreviousEntry) {
      navigate(-1);
      return;
    }

    navigate(backFallback, { replace: true });
  };

  return (
    <div style={backBarStyle}>
      <button
        type="button"
        style={backButtonStyle}
        onClick={handleBack}
        aria-label={backLabel}
      >
        <FiArrowLeft aria-hidden="true" size={17} />
        <span>{backLabel}</span>
      </button>
      <span style={backIndicatorStyle}>Vista anterior</span>
    </div>
  );
}

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
          <PublicPortfolioBackButton />
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
          <PublicPortfolioBackButton />
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
        <PublicPortfolioBackButton />
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
            showUnvalidatedParticipants
          />
        </ViewOsFrame>
      </div>
    </div>
  );
}
