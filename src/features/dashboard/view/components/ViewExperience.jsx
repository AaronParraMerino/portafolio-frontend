// src/features/dashboard/view/components/ViewExperience.jsx
import { isVisible } from '../model/viewModel';
import { useLanguage } from '../../../../core/i18n';

function ExperienceBadge({ tipo, t }) {
  const isAcademico = tipo === 'academico' || tipo === 'academica';

  return (
    <span className={`tl-badge ${isAcademico ? 'b-academico' : 'b-laboral'}`}>
      {isAcademico ? t('view.experience.academic') : t('view.experience.work')}
    </span>
  );
}

function SubsectionTitle({ children }) {
  return (
    <div className="subsec-divider">
      <div className="subsec-title">{children}</div>
      <div className="subsec-line" />
    </div>
  );
}

function formatMonthYear(value, language) {
  if (!value) return '';
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';

  const locale = language === 'en' ? 'en-US' : language === 'pt' ? 'pt-BR' : 'es-BO';
  return new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' }).format(date);
}

function getExperienceDates(experiencia, language, t) {
  const from = formatMonthYear(experiencia.fechaInicio, language);
  const to = experiencia.actual
    ? t('view.experience.present')
    : formatMonthYear(experiencia.fechaFin, language);

  if (from && to) return `${from} - ${to}`;
  return from || to || experiencia.fechas || '';
}

function ExperienceCard({ experiencia, t, language }) {
  const isAcademico = experiencia.tipo === 'academico' || experiencia.tipo === 'academica';

  return (
    <article className={`exp-card ${isAcademico ? 'academico' : 'laboral'}`}>
      <div className="exp-left-panel" />

      <div className="exp-content">
        <div className="exp-body">
          <div className="exp-top">
            <div className="exp-badges">
              <ExperienceBadge tipo={experiencia.tipo} t={t} />

              {experiencia.actual && (
                <span className="b-current">
                  {t('view.experience.current')}
                </span>
              )}
            </div>

            <span className="exp-dates">
              {getExperienceDates(experiencia, language, t)}
            </span>
          </div>

          <h3 className="exp-role">
            {experiencia.cargo}
          </h3>

          <div className={`exp-org ${isAcademico ? 'acad-color' : ''}`}>
            {experiencia.organizacion}
          </div>

          <p className="exp-desc">
            {experiencia.descripcion}
          </p>
        </div>
      </div>
    </article>
  );
}

export default function ViewExperience({ experiencias = [], visibilidad }) {
  const { t, language } = useLanguage();
  const visibles = experiencias.filter(exp =>
    isVisible(visibilidad, 'experiencias', exp.id)
  );

  const laborales = visibles.filter(exp => exp.tipo === 'laboral');
  const academicas = visibles.filter(exp => exp.tipo === 'academico' || exp.tipo === 'academica');

  if (!laborales.length && !academicas.length) return null;

  return (
    <section className="pf-sec">
      <div className="pf-sec-top">
        <div>
          <h2 className="pf-sec-title">{t('view.experience.title')}</h2>
          <div className="pf-sec-subtitle">{t('view.experience.subtitle')}</div>
        </div>
      </div>

      {!!laborales.length && (
        <>
          <SubsectionTitle>{t('view.experience.work')}</SubsectionTitle>

          <div className="exp-list">
            {laborales.map(experiencia => (
              <ExperienceCard
                key={experiencia.id}
                experiencia={experiencia}
                t={t}
                language={language}
              />
            ))}
          </div>
        </>
      )}

      {!!academicas.length && (
        <>
          <SubsectionTitle>{t('view.experience.academic')}</SubsectionTitle>

          <div className="exp-list">
            {academicas.map(experiencia => (
              <ExperienceCard
                key={experiencia.id}
                experiencia={experiencia}
                t={t}
                language={language}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
