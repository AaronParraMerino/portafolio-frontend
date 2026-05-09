import { isVisible } from '../model/viewModel';
import {
  getSkillLevelColor,
  getSkillLevelLabel,
  getSkillLevelShortLabel,
  getSkillProgress,
  normalizeSkillLevel,
} from '../../skills/model/skillLevel';

function getSkillPercentage(skill) {
  const fromSkill = Number(skill?.porcentaje);

  if (!Number.isNaN(fromSkill) && fromSkill > 0) {
    return Math.max(0, Math.min(fromSkill, 100));
  }

  return getSkillProgress(skill?.nivel);
}

function SkillCard({ skill, soft = false }) {
  const normalizedLevel = normalizeSkillLevel(skill.nivel);
  const pct = getSkillPercentage(skill);
  const progressColor = getSkillLevelColor(skill.nivel);
  const levelLabel = getSkillLevelLabel(skill.nivel);
  const shortLabel = getSkillLevelShortLabel(skill.nivel);

  return (
    <article
      className={`sk-view-card ${soft ? 'is-soft' : 'is-tech'} lvl-${normalizedLevel}`}
      style={{ '--skill-progress-color': progressColor }}
    >
      <div className="sk-left-panel" />

      <div className="sk-view-content">
        <div className="sk-view-main">
          <div
            className="sk-level-circle"
            title={levelLabel}
            aria-label={`Nivel ${levelLabel}`}
          >
            {shortLabel}
          </div>

          <div className="sk-view-text">
            <div className="sk-view-top">
              <h3 className="sk-view-name">
                {skill.nombre}
              </h3>

              <span className="sk-level-badge">
                {levelLabel}
              </span>
            </div>

            <p className="sk-view-desc">
              {skill.descripcion || 'Sin descripción adicional.'}
            </p>
          </div>
        </div>

        <div className="sk-view-progress">
          <div className="sk-view-track-label">
            <span className="sk-view-track-title">
              Dominio
            </span>

            <span className="sk-view-pct">
              {pct}%
            </span>
          </div>

          <div className="sk-view-track">
            <div
              className="sk-view-fill"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </article>
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

export default function ViewSkills({ habilidades, visibilidad }) {
  const tecnicas = (habilidades?.tecnicas || []).filter(skill =>
    isVisible(visibilidad, 'habilidades', skill.id)
  );

  const blandas = (habilidades?.blandas || []).filter(skill =>
    isVisible(visibilidad, 'habilidades', skill.id)
  );

  if (!tecnicas.length && !blandas.length) return null;

  return (
    <section className="pf-sec">
      <div className="pf-sec-top">
        <div>
          <h2 className="pf-sec-title">Habilidades</h2>
          <div className="pf-sec-subtitle">Tecnologías y competencias</div>
        </div>
      </div>

      {!!tecnicas.length && (
        <>
          <SubsectionTitle>Técnicas</SubsectionTitle>

          <div className="sk-list">
            {tecnicas.map(skill => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </>
      )}

      {!!blandas.length && (
        <>
          <SubsectionTitle>Blandas</SubsectionTitle>

          <div className="sk-soft-grid">
            {blandas.map(skill => (
              <SkillCard key={skill.id} skill={skill} soft />
            ))}
          </div>
        </>
      )}
    </section>
  );
}