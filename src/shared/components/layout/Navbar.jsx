import { useState, useEffect, useRef } from 'react';
import ConfirmModal from '../../ui/ConfirmModal'
import { clearAuthStorage } from '../../utils/authStorage';

/* ── Links de navegación pública ── */
const NAV_LINKS = [
  { label: 'Inicio',          href: '/'                },
  { label: 'Cómo funciona',   href: '#como-funciona'   },
  { label: 'Proyectos',       href: '#proyectos'        },
  { label: 'Desarrolladores', href: '#desarrolladores'  },
];

const NOTIFICACIONES = [
  { red: true,  text: 'TechBol visitó tu perfil',             time: 'hace 5 min' },
  { red: false, text: 'Nuevo match con stack React + Laravel', time: 'hace 1 h'  },
  { red: false, text: 'Tu proyecto tiene 12 nuevas vistas',    time: 'ayer'       },
];

export default function Navbar() {
  const BASE_URL = process.env.REACT_APP_API_URL;
  const [scrolled,      setScrolled]      = useState(false);
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [notifOpen,     setNotifOpen]     = useState(false);
  const [userMenuOpen,  setUserMenuOpen]  = useState(false);
  const [user,          setUser]          = useState(null);
  /* NUEVO: controla el modal de confirmación de logout */
  const [logoutModal,   setLogoutModal]   = useState(false);
  const [loggingOut,    setLoggingOut]    = useState(false);
  const notifRef = useRef(null);
  const userRef  = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userRef.current  && !userRef.current.contains(e.target))  setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('usuario');
    if (!stored) return;
    try { setUser(JSON.parse(stored)); }
    catch (err) { console.warn('Usuario inválido en localStorage', err); setUser(null); }
  }, []);

  /* ── Ejecuta el logout real (solo desde el modal) ── */
  const doLogout = async () => {
    setLoggingOut(true);
    const token = localStorage.getItem('tokenPORT');
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Error al intentar cerrar sesión:', err);
    }
    clearAuthStorage();
    window.location.href = '/';
  };

  /* ── Abre el modal en vez de cerrar sesión directamente ── */
  const handleLogoutClick = () => {
    setUserMenuOpen(false);
    setMobileOpen(false);
    setLogoutModal(true);
  };

  const userName = user ? `${user.nombre || user.name || 'Usuario'} ${user.apellido || ''}`.trim() : '';
  const initials = user
    ? [user.nombre || user.name || 'U', user.apellido || user.lastName || '']
        .map(name => String(name || ' ').trim().slice(0, 1).toUpperCase())
        .join('').padEnd(2, 'U')
    : 'U';
  const userRole = user?.rol || user?.role || 'ADMIN / DEV';

  return (
    <>
      <style>{`
        .spk-nav {
          position: fixed; top: 0; left: 0; right: 0;
          z-index: 200; height: var(--nav-height, 60px);
          display: flex; align-items: center;
          padding: 0 40px; padding-bottom: 3px;
          background: linear-gradient(90deg, var(--azul-deep, #004f7c) 0%, var(--azul, #0077b7) 100%);
          border-bottom: 3px solid rgba(255,255,255,.12);
          box-shadow: 0 2px 18px rgba(0,77,124,.25);
          transition: box-shadow .2s;
        }
        .spk-nav.scrolled { box-shadow: 0 4px 28px rgba(0,77,124,.38); }
        .spk-nav-logo { display: flex; align-items: center; text-decoration: none; flex-shrink: 0; }
        .spk-nav-logo img { height: 38px; width: auto; display: block; filter: brightness(0) invert(1); opacity: .92; }
        .spk-nav-sep { width: 1px; height: 22px; background: rgba(255,255,255,.15); margin: 0 18px 0 12px; flex-shrink: 0; }
        .spk-nav-tagline { font-family: var(--mono, monospace); font-size: 10px; font-weight: 400; color: rgba(255,255,255,.35); letter-spacing: .12em; text-transform: uppercase; white-space: nowrap; }
        .spk-nav-links { display: flex; align-items: center; gap: 2px; list-style: none; margin: 0; padding: 0; margin-left: auto; }
        .spk-nav-links li { display: flex; align-items: center; }
        .spk-nav-links a { font-size: 13px; font-weight: 500; color: rgba(255,255,255,.65); text-decoration: none; padding: 6px 13px; border-radius: 5px; transition: color .15s, background .15s; white-space: nowrap; letter-spacing: .01em; display: block; }
        .spk-nav-links a:hover { color: rgba(255,255,255,.97); background: rgba(255,255,255,.1); }
        .spk-nav-right { display: flex; align-items: center; gap: 8px; margin-left: 20px; }
        .spk-nav-user { position: relative; }
        .spk-user-toggle { all: unset; display: flex; align-items: center; gap: 9px; padding: 5px 10px 5px 5px; border-radius: 8px; border: 1px solid rgba(255,255,255,.15); cursor: pointer; transition: all .15s; user-select: none; box-sizing: border-box; }
        .spk-user-toggle:hover { background: rgba(255,255,255,.1); }
        .spk-nav-user.open .spk-user-toggle { background: rgba(255,255,255,.12); }
        .spk-user-avatar { width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, #b8ddf0, #ffffff); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #004f7c; flex-shrink: 0; border: 1.5px solid rgba(255,255,255,.3); }
        .spk-user-info { display: flex; flex-direction: column; align-items: flex-start; line-height: 1.2; }
        .spk-user-name { font-size: 12px; font-weight: 600; color: rgba(255,255,255,.9); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100px; display: block; }
        .spk-user-role { font-size: 10px; color: rgba(255,255,255,.38); font-family: var(--mono, monospace); letter-spacing: .04em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100px; display: block; }
        .spk-user-chevron { width: 12px; height: 12px; stroke: rgba(255,255,255,.45); fill: none; stroke-width: 2; transition: transform .2s; }
        .spk-nav-user.open .spk-user-chevron { transform: rotate(180deg); }
        .spk-user-dropdown { position: absolute; top: calc(100% + 8px); right: 0; width: 220px; background: #ffffff; border: 1.5px solid #d1d5db; border-radius: 10px; box-shadow: 0 12px 36px rgba(0,0,0,.14); z-index: 350; animation: fadeUp .18s ease both; overflow: hidden; }
        .spk-dd-header { padding: 14px 16px 12px; border-bottom: 1px solid #f0ede8; display: flex; align-items: center; gap: 10px; }
        .spk-dd-avatar { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #e8f4fb, #b8ddf0); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #004f7c; border: 2px solid #b8ddf0; flex-shrink: 0; }
        .spk-dd-name { font-size: 13px; font-weight: 600; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; display: block; }
        .spk-dd-email { font-size: 11px; color: #6b7280; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; display: block; }
        .spk-dd-status { font-size: 10px; color: #10b981; display: flex; align-items: center; gap: 4px; margin-top: 3px; }
        .spk-dd-status-dot { width: 5px; height: 5px; border-radius: 50%; background: #10b981; }
        .spk-dd-section { padding: 6px 8px; border-bottom: 1px solid #f0ede8; }
        .spk-dd-section:last-child { border-bottom: none; }
        .spk-dd-label { font-size: 10px; font-weight: 600; color: #d1d5db; text-transform: uppercase; letter-spacing: .08em; padding: 4px 8px 2px; }
        .spk-dd-item { display: flex; align-items: center; gap: 9px; padding: 7px 8px; border-radius: 6px; font-size: 13px; color: #374151; cursor: pointer; transition: all .12s; text-decoration: none; background: none; border: none; width: 100%; text-align: left; }
        .spk-dd-item:hover { background: #f0ede8; color: #111827; }
        .spk-dd-item svg { width: 14px; height: 14px; stroke: currentColor; fill: none; stroke-width: 1.8; flex-shrink: 0; }
        .spk-dd-item.highlight { color: #0077b7; font-weight: 600; }
        .spk-dd-item.highlight:hover { background: #e8f4fb; }
        .spk-dd-item.highlight svg { stroke: #0077b7; }
        .spk-dd-item.danger { color: #c94040; }
        .spk-dd-item.danger:hover { background: rgba(232,85,85,.08); }
        .spk-dd-item.danger svg { stroke: #c94040; }
        .spk-bell-wrap { position: relative; }
        .spk-bell { width: 34px; height: 34px; border-radius: 7px; border: 1px solid rgba(255,255,255,.18); background: rgba(255,255,255,.08); display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all .15s; }
        .spk-bell:hover { background: rgba(255,255,255,.18); border-color: rgba(255,255,255,.35); }
        .spk-bell svg { width: 15px; height: 15px; stroke: rgba(255,255,255,.8); fill: none; stroke-width: 1.9; }
        .spk-bell-dot { position: absolute; top: 6px; right: 6px; width: 7px; height: 7px; border-radius: 50%; background: var(--rojo-soft, #ef4444); border: 1.5px solid var(--azul, #0077b7); pointer-events: none; }
        .spk-notif-dropdown { position: absolute; top: calc(100% + 10px); right: 0; width: 284px; background: #ffffff; border: 1.5px solid #d1d5db; border-radius: 10px; box-shadow: 0 8px 32px rgba(0,0,0,.13); overflow: hidden; animation: fadeUp .18s ease both; z-index: 300; }
        .spk-notif-header { padding: 11px 16px; border-bottom: 1px solid #d1d5db; font-size: 12px; font-weight: 700; color: #111827; display: flex; justify-content: space-between; align-items: center; }
        .spk-notif-clear { font-size: 10px; color: #0077b7; font-weight: 500; cursor: pointer; background: none; border: none; padding: 0; transition: color .12s; }
        .spk-notif-clear:hover { color: #005f95; }
        .spk-notif-item { padding: 11px 16px; border-bottom: 1px solid #f0ede8; display: flex; gap: 10px; align-items: flex-start; cursor: pointer; transition: background .12s; }
        .spk-notif-item:last-child { border-bottom: none; }
        .spk-notif-item:hover { background: #e8f4fb; }
        .spk-notif-ico { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; background: #0077b7; }
        .spk-notif-ico.red { background: #ef4444; }
        .spk-notif-text { font-size: 12px; color: #374151; line-height: 1.5; text-align: left; }
        .spk-notif-time { font-size: 10px; color: #6b7280; font-family: var(--mono, monospace); margin-top: 2px; }
        .spk-nav-divider { width: 1px; height: 18px; background: rgba(255,255,255,.15); }
        .spk-btn-login { font-size: 13px; font-weight: 500; color: rgba(255,255,255,.82); background: transparent; border: 1px solid rgba(255,255,255,.22); padding: 7px 16px; border-radius: 6px; cursor: pointer; transition: all .15s; white-space: nowrap; }
        .spk-btn-login:hover { border-color: rgba(255,255,255,.55); color: #ffffff; background: rgba(255,255,255,.08); }
        .spk-btn-register { font-size: 13px; font-weight: 600; color: #0077b7; background: #ffffff; border: 1px solid #ffffff; padding: 7px 16px; border-radius: 6px; cursor: pointer; transition: all .15s; white-space: nowrap; }
        .spk-btn-register:hover { background: #e8f4fb; border-color: #e8f4fb; }
        .spk-hamburger { display: none; flex-direction: column; gap: 4px; padding: 7px; border-radius: 6px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15); cursor: pointer; transition: background .15s; margin-left: auto; }
        .spk-hamburger:hover { background: rgba(255,255,255,.18); }
        .spk-hamburger span { display: block; width: 18px; height: 2px; background: rgba(255,255,255,.85); border-radius: 2px; transition: all .22s; }
        .spk-hamburger.open span:nth-child(1) { transform: rotate(45deg) translateY(6px); }
        .spk-hamburger.open span:nth-child(2) { opacity: 0; width: 0; }
        .spk-hamburger.open span:nth-child(3) { transform: rotate(-45deg) translateY(-6px); }
        .spk-mobile-menu { position: fixed; top: var(--nav-height, 60px); left: 0; right: 0; background: #004f7c; border-bottom: 2px solid rgba(255,255,255,.1); padding: 14px 24px 22px; box-shadow: 0 8px 24px rgba(0,0,0,.22); z-index: 199; animation: fadeDown .2s ease both; }
        .spk-mobile-links { display: flex; flex-direction: column; gap: 2px; margin-bottom: 14px; }
        .spk-mobile-links a { font-size: 14px; font-weight: 500; color: rgba(255,255,255,.72); text-decoration: none; padding: 10px 12px; border-radius: 6px; transition: all .12s; display: block; }
        .spk-mobile-links a:hover { color: #ffffff; background: rgba(255,255,255,.1); }
        .spk-mobile-actions { display: flex; gap: 8px; flex-wrap: wrap; padding-top: 12px; border-top: 1px solid rgba(255,255,255,.1); }
        .spk-mobile-actions .spk-btn-login, .spk-mobile-actions .spk-btn-register { flex: 1; justify-content: center; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 900px) { .spk-nav { padding: 0 24px; padding-bottom: 3px; } .spk-nav-tagline, .spk-nav-sep { display: none; } }
        @media (max-width: 768px) { .spk-nav-links, .spk-nav-right { display: none; } .spk-hamburger { display: flex; } }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className={`spk-nav${scrolled ? ' scrolled' : ''}`}>

        <a href="/" className="spk-nav-logo">
          <img src="/img/logo.png" width="130" height="38" alt="CreaFolio" />
        </a>
        <div className="spk-nav-sep" />
        <span className="spk-nav-tagline">CreaFolio</span>

        <ul className="spk-nav-links">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}><a href={href}>{label}</a></li>
          ))}
        </ul>

        <div className="spk-nav-right">

          {/* Campana */}
          <div className="spk-bell-wrap" ref={notifRef}>
            <button className="spk-bell" title="Notificaciones" onClick={() => setNotifOpen(v => !v)}>
              <svg viewBox="0 0 18 18">
                <path d="M9 1a4 4 0 014 4c0 5 2 6.5 2 6.5H3S5 10 5 5a4 4 0 014-4zM7 12.5a2 2 0 004 0" />
              </svg>
              <div className="spk-bell-dot" />
            </button>
            {notifOpen && (
              <div className="spk-notif-dropdown">
                <div className="spk-notif-header">
                  Notificaciones
                  <button className="spk-notif-clear" onClick={() => setNotifOpen(false)}>Marcar leídas</button>
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
              <button className="spk-user-toggle" type="button" onClick={() => setUserMenuOpen(v => !v)}>
                <div className="spk-user-avatar">{initials}</div>
                <div className="spk-user-info">
                  <div className="spk-user-name">{userName}</div>
                  <div className="spk-user-role">{userRole}</div>
                </div>
                <svg className="spk-user-chevron" viewBox="0 0 14 14">
                  <path d="m3 5 4 4 4-4" />
                </svg>
              </button>

              {userMenuOpen && (
                <div className="spk-user-dropdown" onClick={(e) => e.stopPropagation()}>
                  <div className="spk-dd-header">
                    <div className="spk-dd-avatar">{initials}</div>
                    <div>
                      <div className="spk-dd-name">{userName || 'Usuario'}</div>
                      <div className="spk-dd-email">{user?.correo || user?.email || '---'}</div>
                      <div className="spk-dd-status">
                        <span className="spk-dd-status-dot" />Perfil activo
                      </div>
                    </div>
                  </div>
                  <div className="spk-dd-section">
                    <div className="spk-dd-label">Mi cuenta</div>
                    <button className="spk-dd-item" type="button" onClick={() => { setUserMenuOpen(false); window.location.href = '/dashboard/profile'; }}>
                      <svg viewBox="0 0 14 14"><circle cx="7" cy="5" r="3"/><path d="M1 13c0-3 2.7-5 6-5s6 2 6 5"/></svg>
                      Ver mi perfil
                    </button>
                    <button className="spk-dd-item" type="button" onClick={() => { setUserMenuOpen(false); window.location.href = '/dashboard'; }}>
                      <svg viewBox="0 0 14 14"><circle cx="7" cy="7" r="2"/><path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.9 2.9l1 1M10.1 10.1l1 1M2.9 11.1l1-1M10.1 3.9l1-1"/></svg>
                      Configuración
                    </button>
                  </div>
                  <div className="spk-dd-section">
                    <div className="spk-dd-label">Portafolio</div>
                    <button className="spk-dd-item highlight" type="button" onClick={() => { setUserMenuOpen(false); window.location.href = '/dashboard'; }}>
                      <svg viewBox="0 0 14 14"><rect x="2" y="3" width="10" height="9" rx="1.5"/><path d="M5 3V2M9 3V2M2 6h10"/></svg>
                      Gestionar portafolio
                    </button>
                  </div>
                  <div className="spk-dd-section">
                    {/* CAMBIO: abre modal en vez de cerrar sesión directo */}
                    <button className="spk-dd-item danger" type="button" onClick={handleLogoutClick}>
                      <svg viewBox="0 0 14 14"><path d="M10 1L13 4 10 7M13 4H5c-2 0-4 1-4 3v6"/></svg>
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className="spk-btn-login" onClick={() => window.location.href = "/auth/login"}>Iniciar sesión</button>
              <button className="spk-btn-register" onClick={() => window.location.href = "/auth/register"}>Registrarse</button>
            </>
          )}
        </div>

        <button className={`spk-hamburger${mobileOpen ? ' open' : ''}`} onClick={() => setMobileOpen(v => !v)} aria-label="Abrir menú">
          <span /><span /><span />
        </button>
      </nav>

      {/* ── MENÚ MÓVIL ── */}
      {mobileOpen && (
        <div className="spk-mobile-menu">
          <div className="spk-mobile-links">
            {NAV_LINKS.map(({ label, href }) => (
              <a key={label} href={href} onClick={() => setMobileOpen(false)}>{label}</a>
            ))}
          </div>
          <div className="spk-mobile-actions">
            {user ? (
              <>
                <button className="spk-btn-login" onClick={() => { setMobileOpen(false); window.location.href = '/dashboard'; }}>Mi portafolio</button>
                {/* CAMBIO: también abre modal desde móvil */}
                <button className="spk-btn-register" onClick={handleLogoutClick}>Cerrar sesión</button>
              </>
            ) : (
              <>
                <button className="spk-btn-login" onClick={() => { setMobileOpen(false); window.location.href = "/auth/login"; }}>Iniciar sesión</button>
                <button className="spk-btn-register" onClick={() => { setMobileOpen(false); window.location.href = "/auth/register"; }}>Registrarse</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Modal de confirmación de cierre de sesión ── */}
      <ConfirmModal
        open={logoutModal}
        title="¿Cerrar sesión?"
        message="Tu sesión se cerrará y tendrás que volver a iniciar sesión para acceder a tu portafolio."
        confirmLabel="Sí, cerrar sesión"
        cancelLabel="Cancelar"
        variant="red"
        icon="logout"
        loading={loggingOut}
        onConfirm={doLogout}
        onClose={() => !loggingOut && setLogoutModal(false)}
      />
    </>
  );
}