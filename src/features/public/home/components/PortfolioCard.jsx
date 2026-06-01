import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../../../core/i18n';

const counterLabelKeys = {
  updates: 'portfolio.counter.updates',
  projects: 'portfolio.counter.projects',
  experience: 'portfolio.counter.experience',
  skills: 'portfolio.counter.skills',
};

const pick = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

function portfolioPathFor(portfolio) {
  const id = pick(portfolio?.id_usuario, portfolio?.usuario_id, portfolio?.user_id, portfolio?.id);
  if (id) return `/portafolio/${id}`;

  return String(portfolio?.ruta_portafolio || '#').replace(/^\/portfolio\//, '/portafolio/');
}

function initialsFor(portfolio) {
  const first = portfolio?.nombre?.trim()?.slice(0, 1) || 'C';
  const last = portfolio?.apellido?.trim()?.slice(0, 1) || 'F';
  return `${first}${last}`.toUpperCase();
}

function locationFor(portfolio) {
  return [portfolio?.ciudad, portfolio?.pais].filter(Boolean).join(', ');
}

function relativeDate(value, t) {
  if (!value) return t('portfolio.updatedRecently');

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return t('portfolio.updatedRecently');

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60000));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 60) return t('portfolio.updatedMinutes', { count: minutes });
  if (hours < 24) return t('portfolio.updatedHours', { count: hours });
  if (days === 1) return t('portfolio.updatedYesterday');
  return t('portfolio.updatedDays', { count: days });
}

function counterValue(portfolio, variant, t) {
  if (variant === 'projects') return portfolio.total_proyectos || 0;
  if (variant === 'experience') return portfolio.total_experiencias || 0;
  if (variant === 'skills') return portfolio.total_habilidades || 0;
  return relativeDate(portfolio.fecha_ultima_actualizacion, t);
}

export default function PortfolioCard({ portfolio, variant }) {
  const { t } = useLanguage();
  const routerLocation = useLocation();
  const skills = Array.isArray(portfolio.skills_destacadas)
    ? portfolio.skills_destacadas.slice(0, 3)
    : [];
  const portfolioLocation = locationFor(portfolio);
  const portfolioPath = portfolioPathFor(portfolio);
  const backFallback = `${routerLocation.pathname}${routerLocation.search}${routerLocation.hash}` || '/';

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
          <h3>{portfolio.nombre_completo || t('portfolio.defaultName')}</h3>
          <p>{portfolio.profesion || t('portfolio.defaultProfession')}</p>
        </div>
      </div>

      {portfolioLocation && <div className="spk-portfolio-location">{portfolioLocation}</div>}

      <div className="spk-portfolio-skills" aria-label={t('portfolio.skillsAria')}>
        {skills.length > 0 ? (
          skills.map((skill) => <span key={skill}>{skill}</span>)
        ) : (
          <span>{t('portfolio.publicProfile')}</span>
        )}
      </div>

      <div className="spk-portfolio-card-foot">
        <div className={`spk-portfolio-counter ${variant === 'updates' ? 'wide' : ''}`}>
          <strong>{counterValue(portfolio, variant, t)}</strong>
          {variant !== 'updates' && <span>{t(counterLabelKeys[variant])}</span>}
        </div>

        <Link
          className="spk-portfolio-cta"
          to={portfolioPath}
          state={{ backLabel: t('portfolio.backHome'), backFallback }}
        >
          {t('portfolio.viewPortfolio')}
        </Link>
      </div>
    </article>
  );
}
