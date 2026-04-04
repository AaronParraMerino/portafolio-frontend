import { useState, useEffect, useRef } from 'react';

/* ── Links de navegación pública ── */
const NAV_LINKS = [
  { label: 'Inicio',          href: '/'          },
  { label: 'Cómo funciona',   href: '#como-funciona'   },
  { label: 'Proyectos',       href: '#proyectos'        },
  { label: 'Desarrolladores', href: '#desarrolladores'  },
  { label: 'Dashboard',       href: '/dashboard'       },
];

const NOTIFICACIONES = [
  { red: true,  text: 'TechBol visitó tu perfil',              time: 'hace 5 min' },
  { red: false, text: 'Nuevo match con stack React + Laravel',  time: 'hace 1 h'  },
  { red: false, text: 'Tu proyecto tiene 12 nuevas vistas',     time: 'ayer'       },
];

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user,        setUser]        = useState(null);
  const notifRef = useRef(null);
  const userRef  = useRef(null);

  /* sombra al hacer scroll */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* cerrar menú móvil al redimensionar */
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* cerrar dropdown de notificaciones al click fuera */
  useEffect(() => {
    const onClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('usuario');
    if (!stored) return;
    try {
      setUser(JSON.parse(stored));
    } catch (err) {
      console.warn('Usuario inválido en localStorage', err);
      setUser(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('tokenPORT');
    localStorage.removeItem('usuario');
    window.location.href = '/';
  };

  const userName = user ? `${user.nombre || user.name || 'Usuario'} ${user.apellido || ''}`.trim() : '';
  const initials = user
    ? [user.nombre || user.name || 'U', user.apellido || user.lastName || '']
        .map(name => String(name || ' ').trim().slice(0, 1).toUpperCase())
        .join('')
        .padEnd(2, 'U')
    : 'U';
  const userRole = user?.rol || user?.role || 'Mi perfil';

  return (
    <>
      <style>{`
        .spk-nav {
          position: fixed; top: 0; left: 0; right: 0;
          z-index: 200;
          height: var(--nav-height, 60px);
          display: flex; align-items: center;
          padding: 0 40px;
          padding-bottom: 3px;
          background: linear-gradient(90deg, var(--azul-deep) 0%, var(--azul) 100%);
          border-bottom: 3px solid rgba(255,255,255,.12);
          box-shadow: 0 2px 18px rgba(0,77,124,.25);
          transition: box-shadow .2s;
        }
        .spk-nav.scrolled {
          box-shadow: 0 4px 28px rgba(0,77,124,.38);
        }

        /* LOGO */
        .spk-nav-logo {
          display: flex; align-items: center;
          text-decoration: none; flex-shrink: 0;
        }
        .spk-nav-logo img {
          height: 38px; width: auto;
          display: block;
          filter: brightness(0) invert(1);
          opacity: .92;
        }
        .spk-nav-sep {
          width: 1px; height: 22px;
          background: rgba(255,255,255,.15);
          margin: 0 18px 0 12px; flex-shrink: 0;
        }
        .spk-nav-tagline {
          font-family: var(--mono);
          font-size: 10px; font-weight: 400;
          color: rgba(255,255,255,.35);
          letter-spacing: .12em; text-transform: uppercase;
          white-space: nowrap;
        }

        /* LINKS DESKTOP */
        .spk-nav-links {
          display: flex; align-items: center;
          gap: 2px; list-style: none;
          margin: 0; padding: 0;
          margin-left: auto;
        }
        .spk-nav-links li {
          display: flex; align-items: center;
        }
        .spk-nav-links a {
          font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,.65);
          text-decoration: none;
          padding: 6px 13px; border-radius: 5px;
          transition: color .15s, background .15s;
          white-space: nowrap; letter-spacing: .01em;
          display: block;
        }
        .spk-nav-links a:hover {
          color: rgba(255,255,255,.97);
          background: rgba(255,255,255,.1);
        }

        /* DERECHA */
        .spk-nav-right {
          display: flex; align-items: center;
          gap: 8px; margin-left: 20px;
        }

        .spk-nav-user {
          display: flex; align-items: center; gap: 9px;
          padding: 6px 10px; border-radius: 10px;
          border: 1px solid rgba(255,255,255,.18);
          background: rgba(255,255,255,.08);
          cursor: pointer;
          position: relative;
          transition: background .15s, border-color .15s;
        }
        .spk-nav-user:hover {
          background: rgba(255,255,255,.16);
        }
        .spk-nav-user.open {
          background: rgba(255,255,255,.18);
          border-color: rgba(255,255,255,.3);
        }

        .spk-user-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, rgba(255,255,255,.95), rgba(255,255,255,.5));
          color: var(--azul-deep);
          font-weight: 700; font-size: 13px;
          border: 1.5px solid rgba(255,255,255,.3);
          flex-shrink: 0;
        }
        .spk-user-info {
          display: flex; flex-direction: column; align-items: flex-start;
          line-height: 1.1;
        }
        .spk-user-toggle {
          all: unset;
          display: flex;
          align-items: center;
          gap: 9px;
          width: 100%;
          cursor: pointer;
        }
        .spk-user-name {
          font-size: 12px; font-weight: 600;
          color: rgba(255,255,255,.95);
          white-space: nowrap;
        }
        .spk-user-role {
          font-size: 10px; color: rgba(255,255,255,.55);
          text-transform: uppercase; letter-spacing: .08em;
          font-family: var(--mono);
          white-space: nowrap;
        }
        .spk-user-chevron {
          width: 12px; height: 12px;
          stroke: rgba(255,255,255,.65); fill: none; stroke-width: 2;
          transition: transform .2s;
        }
        .spk-nav-user.open .spk-user-chevron {
          transform: rotate(180deg);
        }

        .spk-user-dropdown {
          position: absolute; top: calc(100% + 10px); right: 0;
          width: 240px; background: var(--blanco);
          border: 1.5px solid var(--gris-borde);
          border-radius: 12px; overflow: hidden;
          box-shadow: 0 14px 44px rgba(0,0,0,.16);
          z-index: 300;
        }
        .spk-dd-header {
          padding: 14px 16px 12px;
          border-bottom: 1px solid rgba(228,231,235,.95);
          display: flex; align-items: center; gap: 10px;
        }
        .spk-dd-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, rgba(56,189,248,.18), rgba(255,255,255,.95));
          color: var(--azul-deep);
          font-size: 14px; font-weight: 700;
          flex-shrink: 0;
          border: 1px solid rgba(56,189,248,.32);
        }
        .spk-dd-name {
          font-size: 13px; font-weight: 700; color: var(--negro-texto);
        }
        .spk-dd-email {
          font-size: 11px; color: var(--gris-texto); margin-top: 3px;
        }
        .spk-dd-item {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 12px 14px;
          background: none; border: none; text-align: left;
          color: var(--gris-oscuro); cursor: pointer;
          font-size: 13px; transition: background .15s, color .15s;
        }
        .spk-dd-item:hover {
          background: rgba(0,119,183,.05);
          color: var(--azul-deep);
        }
        .spk-dd-item > span {
          flex: 1;
        }
        .spk-dd-item.danger { color: var(--rojo-mid); }
        .spk-dd-item.danger:hover { background: rgba(232,85,85,.1); }

        /* CAMPANA */
        .spk-bell-wrap { position: relative; }
        .spk-bell {
          width: 34px; height: 34px; border-radius: 7px;
          border: 1px solid rgba(255,255,255,.18);
          background: rgba(255,255,255,.08);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0; transition: all .15s;
        }
        .spk-bell:hover {
          background: rgba(255,255,255,.18);
          border-color: rgba(255,255,255,.35);
        }
        .spk-bell svg {
          width: 15px; height: 15px;
          stroke: rgba(255,255,255,.8); fill: none; stroke-width: 1.9;
        }
        .spk-bell-dot {
          position: absolute; top: 6px; right: 6px;
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--rojo-soft);
          border: 1.5px solid var(--azul);
          pointer-events: none;
        }

        /* NOTIF DROPDOWN */
        .spk-notif-dropdown {
          position: absolute; top: calc(100% + 10px); right: 0;
          width: 284px;
          background: var(--blanco);
          border: 1.5px solid var(--gris-borde);
          border-radius: 10px;
          box-shadow: 0 8px 32px rgba(0,0,0,.13);
          overflow: hidden;
          animation: fadeUp .18s ease both;
          z-index: 300;
        }
        .spk-notif-header {
          padding: 11px 16px;
          border-bottom: 1px solid var(--gris-borde);
          font-size: 12px; font-weight: 700;
          color: var(--negro-texto);
          display: flex; justify-content: space-between; align-items: center;
        }
        .spk-notif-clear {
          font-size: 10px; color: var(--azul);
          font-weight: 500; cursor: pointer;
          background: none; border: none;
          font-family: var(--font); padding: 0; transition: color .12s;
        }
        .spk-notif-clear:hover { color: var(--azul-hover); }
        .spk-notif-item {
          padding: 11px 16px;
          border-bottom: 1px solid var(--fondo);
          display: flex; gap: 10px; align-items: flex-start;
          cursor: pointer; transition: background .12s;
        }
        .spk-notif-item:last-child { border-bottom: none; }
        .spk-notif-item:hover { background: var(--azul-light); }
        .spk-notif-ico {
          width: 8px; height: 8px; border-radius: 50%;
          flex-shrink: 0; margin-top: 4px; background: var(--azul);
        }
        .spk-notif-ico.red { background: var(--rojo-soft); }
        .spk-notif-text { font-size: 12px; color: var(--gris-oscuro); line-height: 1.5; }
        .spk-notif-time {
          font-size: 10px; color: var(--gris-texto);
          font-family: var(--mono); margin-top: 2px;
        }

        /* DIVISOR */
        .spk-nav-divider { width: 1px; height: 18px; background: rgba(255,255,255,.15); }

        /* BOTÓN INICIAR SESIÓN */
        .spk-btn-login {
          font-family: var(--font);
          font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,.82);
          background: transparent;
          border: 1px solid rgba(255,255,255,.22);
          padding: 7px 16px; border-radius: 6px;
          cursor: pointer; transition: all .15s; white-space: nowrap;
        }
        .spk-btn-login:hover {
          border-color: rgba(255,255,255,.55);
          color: var(--blanco);
          background: rgba(255,255,255,.08);
        }

        /* BOTÓN REGISTRARSE */
        .spk-btn-register {
          font-family: var(--font);
          font-size: 13px; font-weight: 600;
          color: var(--azul); background: var(--blanco);
          border: 1px solid var(--blanco);
          padding: 7px 16px; border-radius: 6px;
          cursor: pointer; transition: all .15s; white-space: nowrap;
        }
        .spk-btn-register:hover {
          background: var(--azul-light);
          border-color: var(--azul-light);
        }

        /* HAMBURGUESA */
        .spk-hamburger {
          display: none;
          flex-direction: column; gap: 4px;
          padding: 7px; border-radius: 6px;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.15);
          cursor: pointer; transition: background .15s;
          margin-left: auto;
        }
        .spk-hamburger:hover { background: rgba(255,255,255,.18); }
        .spk-hamburger span {
          display: block; width: 18px; height: 2px;
          background: rgba(255,255,255,.85);
          border-radius: 2px; transition: all .22s;
        }
        .spk-hamburger.open span:nth-child(1) { transform: rotate(45deg) translateY(6px); }
        .spk-hamburger.open span:nth-child(2) { opacity: 0; width: 0; }
        .spk-hamburger.open span:nth-child(3) { transform: rotate(-45deg) translateY(-6px); }

        /* MENÚ MÓVIL */
        .spk-mobile-menu {
          position: fixed;
          top: var(--nav-height, 60px); left: 0; right: 0;
          background: var(--azul-deep);
          border-bottom: 2px solid rgba(255,255,255,.1);
          padding: 14px 24px 22px;
          box-shadow: 0 8px 24px rgba(0,0,0,.22);
          z-index: 199;
          animation: fadeDown .2s ease both;
        }
        .spk-mobile-links {
          display: flex; flex-direction: column; gap: 2px;
          margin-bottom: 14px;
        }
        .spk-mobile-links a {
          font-size: 14px; font-weight: 500;
          color: rgba(255,255,255,.72);
          text-decoration: none;
          padding: 10px 12px; border-radius: 6px;
          transition: all .12s; display: block;
        }
        .spk-mobile-links a:hover {
          color: var(--blanco); background: rgba(255,255,255,.1);
        }
        .spk-mobile-actions {
          display: flex; gap: 8px; flex-wrap: wrap;
          padding-top: 12px;
          border-top: 1px solid rgba(255,255,255,.1);
        }
        .spk-mobile-actions .spk-btn-login,
        .spk-mobile-actions .spk-btn-register { flex: 1; justify-content: center; }

        /* KEYFRAMES */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .spk-nav { padding: 0 24px; padding-bottom: 3px; }
          .spk-nav-tagline, .spk-nav-sep { display: none; }
        }
        @media (max-width: 768px) {
          .spk-nav-links, .spk-nav-right { display: none; }
          .spk-hamburger { display: flex; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className={`spk-nav${scrolled ? ' scrolled' : ''}`}>

        {/* Logo */}
        <a href="/" className="spk-nav-logo">
          <img src="img/logo.png" width="130" height="38" alt="CreaFolio" />
        </a>
        <div className="spk-nav-sep" />
        <span className="spk-nav-tagline">CreaFolio</span>

        {/* Links desktop */}
        <ul className="spk-nav-links">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <a href={href}>{label}</a>
            </li>
          ))}
        </ul>

        {/* Zona derecha desktop */}
        <div className="spk-nav-right">

          {/* Campana */}
          <div className="spk-bell-wrap" ref={notifRef}>
            <button
              className="spk-bell"
              title="Notificaciones"
              onClick={() => setNotifOpen(v => !v)}
            >
              <svg viewBox="0 0 18 18">
                <path d="M9 1a4 4 0 014 4c0 5 2 6.5 2 6.5H3S5 10 5 5a4 4 0 014-4zM7 12.5a2 2 0 004 0" />
              </svg>
              <div className="spk-bell-dot" />
            </button>

            {notifOpen && (
              <div className="spk-notif-dropdown">
                <div className="spk-notif-header">
                  Notificaciones
                  <button className="spk-notif-clear" onClick={() => setNotifOpen(false)}>
                    Marcar leídas
                  </button>
                </div>
                {NOTIFICACIONES.map((n, i) => (
                  <div className="spk-notif-item" key={i}>
                    <div className={`spk-notif-ico${n.red ? ' red' : ''}`} />
                    <div>
                      <div className="spk-notif-text">{n.text}</div>
                      <div className="spk-notif-time">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="spk-nav-divider" />

          {user ? (
            <div className={`spk-nav-user${userMenuOpen ? ' open' : ''}`} ref={userRef}>
              <button
                className="spk-user-toggle"
                type="button"
                onClick={() => setUserMenuOpen(v => !v)}
              >
                <span className="spk-user-avatar">{initials}</span>
                <span className="spk-user-info">
                  <span className="spk-user-name">{userName}</span>
                  <span className="spk-user-role">{userRole}</span>
                </span>
                <svg className="spk-user-chevron" viewBox="0 0 14 14">
                  <path d="m3 5 4 4 4-4" />
                </svg>
              </button>

              {userMenuOpen && (
                <div className="spk-user-dropdown">
                  <div className="spk-dd-header">
                    <span className="spk-dd-avatar">{initials}</span>
                    <div>
                      <div className="spk-dd-name">{userName || 'Usuario'}</div>
                      <div className="spk-dd-email">{user?.correo || user?.email || '---'}</div>
                    </div>
                  </div>

                  <button className="spk-dd-item" type="button" onClick={() => { window.location.href = '/dashboard/profile'; }}>
                    <span>Ver mi perfil</span>
                  </button>
                  <button className="spk-dd-item" type="button" onClick={() => { window.location.href = '/dashboard'; }}>
                    <span>Ir al dashboard</span>
                  </button>
                  <button className="spk-dd-item" type="button" onClick={() => { window.location.href = '/dashboard/experience'; }}>
                    <span>Mis proyectos</span>
                  </button>
                  <button className="spk-dd-item danger" type="button" onClick={handleLogout}>
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                className="spk-btn-login"
                onClick={() => window.location.href = "/auth/login"}
              >
                Iniciar sesión
              </button>
              <button
                className="spk-btn-register"
                onClick={() => window.location.href = "/auth/register"}
              >
                Registrarse
              </button>
            </>
          )}

        </div>

        {/* Hamburguesa móvil */}
        <button
          className={`spk-hamburger${mobileOpen ? ' open' : ''}`}
          onClick={() => setMobileOpen(v => !v)}
          aria-label="Abrir menú"
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* ── MENÚ MÓVIL ── */}
      {mobileOpen && (
        <div className="spk-mobile-menu">
          <div className="spk-mobile-links">
            {NAV_LINKS.map(({ label, href }) => (
              <a key={label} href={href} onClick={() => setMobileOpen(false)}>
                {label}
              </a>
            ))}
          </div>

          <div className="spk-mobile-actions">
            {user ? (
              <>
                <button
                  className="spk-btn-login"
                  onClick={() => {
                    setMobileOpen(false);
                    window.location.href = '/dashboard/profile';
                  }}
                >
                  Mi perfil
                </button>
                <button
                  className="spk-btn-register"
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <button 
                  className="spk-btn-login"
                  onClick={() => {
                    setMobileOpen(false);
                    window.location.href = "/auth/login";
                  }}
                >
                  Iniciar sesión
                </button>

                <button 
                  className="spk-btn-register"
                  onClick={() => {
                    setMobileOpen(false);
                    window.location.href = "/auth/register";
                  }}
                >
                  Registrarse
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}