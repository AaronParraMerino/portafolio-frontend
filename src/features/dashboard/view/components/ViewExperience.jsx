// src/features/dashboard/view/components/ViewExperience.jsx
import { isVisible } from '../model/viewModel';
function ExperienceBadge({ tipo }) {
  const isAcademico = tipo === 'academico';

  return (
    <span className={`tl-badge ${isAcademico ? 'b-academico' : 'b-laboral'}`}>
      {isAcademico ? 'Académico' : 'Laboral'}
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

function ExperienceCard({ experiencia }) {
  const isAcademico = experiencia.tipo === 'academico';

  return (
    <article className={`exp-card ${isAcademico ? 'academico' : 'laboral'}`}>
      <div className="exp-left-panel" />

      <div className="exp-content">
        <div className="exp-body">
          <div className="exp-top">
            <div className="exp-badges">
              <ExperienceBadge tipo={experiencia.tipo} />

              {experiencia.actual && (
                <span className="b-current">
                  Actual
                </span>
              )}
            </div>

            <span className="exp-dates">
              {experiencia.fechas}
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
const visibles = experiencias.filter(exp =>
  isVisible(visibilidad, 'experiencias', exp.id)
);

const laborales = visibles.filter(exp => exp.tipo === 'laboral');
const academicas = visibles.filter(exp => exp.tipo === 'academico');

  if (!laborales.length && !academicas.length) return null;

  return (
    <section className="pf-sec">
      <div className="pf-sec-top">
        <div>
          <h2 className="pf-sec-title">Experiencia</h2>
          <div className="pf-sec-subtitle">Trayectoria laboral y académica</div>
        </div>
      </div>

      {!!laborales.length && (
        <>
          <SubsectionTitle>Laboral</SubsectionTitle>

          <div className="exp-list">
            {laborales.map(experiencia => (
              <ExperienceCard
                key={experiencia.id}
                experiencia={experiencia}
              />
            ))}
          </div>
        </>
      )}

      {!!academicas.length && (
        <>
          <SubsectionTitle>Académica</SubsectionTitle>

          <div className="exp-list">
            {academicas.map(experiencia => (
              <ExperienceCard
                key={experiencia.id}
                experiencia={experiencia}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}