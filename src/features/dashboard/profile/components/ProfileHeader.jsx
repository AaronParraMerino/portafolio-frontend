import '../styles/profile.css';

export default function ProfileHeader({ perfil, onEditar, onVistaPublica }) {
  /* Iniciales desde nombre completo */
  const iniciales = perfil.nombre
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('');

  return (
    <div className="prf-header">

      {/* ── Banner ── */}
      <div
        className={`prf-banner${perfil.bannerUrl ? ' has-img' : ''}`}
        style={perfil.bannerUrl ? { backgroundImage: `url(${perfil.bannerUrl})` } : undefined}
      >
        {/* BACKEND: onClick → upload banner → PUT /api/profile/banner */}
        <button className="prf-banner-edit">
          <svg viewBox="0 0 14 14">
            <path d="M2 11.5V13h1.5l5-5-1.5-1.5-5 5zM12.5 3.5a1 1 0 000-1.4L11.4 1a1 1 0 00-1.4 0L9 2 12 5z"/>
          </svg>
          Cambiar banner
        </button>
      </div>

      {/* ── Avatar ── */}
      <div className="prf-avatar-zone">
        <div className="prf-avatar">
          {perfil.avatarUrl
            ? <img src={perfil.avatarUrl} alt={perfil.nombre && `${perfil.nombre} ${perfil.apellido}`} />
            : iniciales
          }
        </div>
        {/* BACKEND: onClick → upload avatar → PUT /api/profile/avatar */}
        <button className="prf-avatar-btn" title="Cambiar foto">
          <svg viewBox="0 0 14 14">
            <path d="M2 11.5V13h1.5l5-5-1.5-1.5-5 5zM12.5 3.5a1 1 0 000-1.4L11.4 1a1 1 0 00-1.4 0L9 2 12 5z"/>
          </svg>
        </button>
      </div>

      {/* ── Nombre + rol + acciones ── */}
      <div className="prf-info-row">
        <div className="prf-info">
          <div className="prf-nombre">{perfil.nombre && `${perfil.nombre} ${perfil.apellido}`}</div>
        </div>

        <div className="prf-acciones">
          <button className="prf-btn-primary" onClick={onEditar}>
            <svg viewBox="0 0 14 14">
              <path d="M2 11.5V13h1.5l5-5-1.5-1.5-5 5zM12.5 3.5a1 1 0 000-1.4L11.4 1a1 1 0 00-1.4 0L9 2 12 5z"/>
            </svg>
            Editar perfil
          </button>
          <button className="prf-btn-outline" onClick={onVistaPublica}>
            <svg viewBox="0 0 14 14">
              <path d="M1 7S3.5 2 7 2s6 5 6 5-2.5 5-6 5-6-5-6-5z"/>
              <circle cx="7" cy="7" r="2"/>
            </svg>
            Vista pública
          </button>
        </div>
      </div>
    </div>
  );
}