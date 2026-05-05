// src/features/dashboard/view/components/ViewSkills.jsx
  import { isVisible } from '../model/viewModel';
function normalizeLevel(level = '') {
  return level
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function levelLabel(level = '') {
  const normalized = normalizeLevel(level);

  if (normalized === 'experto') return 'Experto';
  if (normalized === 'avanzado') return 'Avanzado';
  if (normalized === 'intermedio') return 'Intermedio';

  return level || 'Intermedio';
}

function SkillCard({ skill, soft = false }) {
  const normalizedLevel = normalizeLevel(skill.nivel);
  const pct = Math.max(0, Math.min(Number(skill.porcentaje) || 0, 100));

  const rootClass = soft
    ? `sk-soft-card lvl-${normalizedLevel}`
    : `sk-item lvl-${normalizedLevel}`;

  return (
    <article className={rootClass}>
      <div className="sk-left-panel" />

      <div className={soft ? 'sk-soft-content' : 'sk-item-content'}>
        <div className={soft ? 'sk-soft-body' : 'sk-item-body'}>
          <div className={soft ? 'sk-soft-top' : 'sk-item-header'}>
            <h3 className={soft ? 'sk-soft-name' : 'sk-item-name'}>
              {skill.nombre}
            </h3>

            <span className={`sk-level-badge lvl-${normalizedLevel}-badge`}>
              {levelLabel(skill.nivel)}
            </span>
          </div>

          <p className={soft ? 'sk-soft-desc' : 'sk-item-desc'}>
            {skill.descripcion}
          </p>
        </div>

        <div className={soft ? 'sk-soft-foot' : 'sk-item-foot'}>
          <div className={soft ? 'sk-soft-track-wrap' : 'sk-item-track-wrap'}>
            <div className={soft ? 'sk-soft-track-label' : 'sk-item-track-label'}>
              <span className={soft ? 'sk-soft-pct' : 'sk-item-pct'}>
                Dominio
              </span>

              <span className={soft ? 'sk-soft-pct' : 'sk-item-pct'}>
                {pct}%
              </span>
            </div>

            <div className={soft ? 'sk-soft-track' : 'sk-item-track'}>
              <div
                className={soft ? 'sk-soft-fill' : 'sk-item-fill'}
                style={{ width: `${pct}%` }}
              />
            </div>
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