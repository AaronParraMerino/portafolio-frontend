import '../styles/profile.css';

export default function ProfileSkills({ habilidades = [] }) {
  const tecnicas = habilidades.filter(h => h.tipo === 'tecnica');
  const blandas  = habilidades.filter(h => h.tipo === 'blanda');

  return (
    <div className="prf-card">
      <div className="prf-card-head">
        <span className="prf-card-title">Habilidades</span>
        <span className="prf-card-sub">{habilidades.length} en total</span>
      </div>
      <div className="prf-skills-wrap">
        {tecnicas.length > 0 && (
          <>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--gris-texto)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6 }}>
              Técnicas
            </div>
            <div style={{ marginBottom: 10 }}>
              {tecnicas.map(h => (
                <span key={h.id} className="prf-skill-chip prf-skill-tecnica">
                  <span className="prf-skill-dot" />
                  {h.nombre}
                  <span className="prf-nivel">{h.nivel}</span>
                </span>
              ))}
            </div>
          </>
        )}
        {blandas.length > 0 && (
          <>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--gris-texto)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6 }}>
              Blandas
            </div>
            <div>
              {blandas.map(h => (
                <span key={h.id} className="prf-skill-chip prf-skill-blanda">
                  <span className="prf-skill-dot" />
                  {h.nombre}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}