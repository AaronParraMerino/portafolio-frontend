import '../styles/profile.css';

const CheckIcon = () => (
  <svg viewBox="0 0 14 14"><path d="M2 7l3.5 3.5L12 3"/></svg>
);
const CircleIcon = () => (
  <svg viewBox="0 0 14 14"><circle cx="7" cy="7" r="5"/></svg>
);

export default function ProfileCompletitud({ perfil }) {
  const items = [
    { label: 'Nombre y Apellido', done: !!(perfil.nombre && perfil.apellido) },
    { label: 'Foto de perfil',     done: !!perfil.avatarUrl },
    { label: 'Foto de portada',     done: !!perfil.bannerUrl },
    { label: 'Profesión',          done: !!perfil.profesion },
    { label: 'Correo de contacto', done: !!perfil.correo },
    { label: 'Teléfono',           done: !!perfil.telefono },
    { label: 'Acerca de mí',       done: !!perfil.biografia },
    { label: 'Ubicación',          done: !!(perfil.ciudad && perfil.pais) },
  ];

  const doneCount = items.filter(item => item.done).length;
  const pct = Math.round((doneCount / items.length) * 100);


  return (
    <div className="prf-card">
      <div className="prf-card-head">
        <span className="prf-card-title">Completitud</span>
        <span className="prf-card-sub">Mejora tu visibilidad</span>
      </div>
      <div className="prf-completitud">
        <div className="prf-comp-labels">
          <span>Progreso del perfil</span>
          <strong>{pct}%</strong>
        </div>
        <div className="prf-comp-bar">
          <div className="prf-comp-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="prf-comp-items">
          {items.map(({ label, done }) => (
            <div key={label} className={`prf-comp-item${done ? ' done' : ''}`}>
              {done ? <CheckIcon /> : <CircleIcon />}
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}