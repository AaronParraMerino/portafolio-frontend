/* ══════════════════════════════════════
   DashboardPage.jsx — /dashboard (index)
   Vista de bienvenida / resumen general.
══════════════════════════════════════ */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const QUICK_STATS = [
  { num: '4',   lbl: 'Proyectos',      color: 'var(--azul)',      bg: 'var(--azul-light)', border: 'var(--azul-mid)' },
  { num: '8',   lbl: 'Habilidades',    color: 'var(--azul)',      bg: 'var(--azul-light)', border: 'var(--azul-mid)' },
  { num: '3',   lbl: 'Experiencias',   color: 'var(--azul)',      bg: 'var(--azul-light)', border: 'var(--azul-mid)' },
  { num: '95',  lbl: 'Contrataciones', color: 'var(--rojo-mid)',  bg: 'var(--rojo-bg)',    border: 'var(--rojo-borde)' },
];

const QUICK_LINKS = [
  {
    id: 'projects',
    label: 'Mis Proyectos',
    desc: 'Gestiona y publica tus proyectos en tu portafolio',
    to: '/dashboard/projects',
    badge: '4 proyectos',
    badgeColor: 'var(--azul)',
    badgeBg: 'var(--azul-light)',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="4" width="14" height="13" rx="2" />
        <path d="M7 4V3M13 4V3M3 8h14" />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Mi Perfil',
    desc: 'Edita tu información personal y configuración pública',
    to: '/dashboard/profile',
    badge: '72% completo',
    badgeColor: '#f59e0b',
    badgeBg: 'rgba(245,158,11,.1)',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="10" cy="7" r="4" />
        <path d="M2 19c0-4.4 3.6-8 8-8s8 3.6 8 8" />
      </svg>
    ),
  },
  {
    id: 'skills',
    label: 'Habilidades',
    desc: 'Agrega o actualiza tus tecnologías y skills técnicos',
    to: '/dashboard/skills',
    badge: '8 habilidades',
    badgeColor: 'var(--azul)',
    badgeBg: 'var(--azul-light)',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M3 15V17h2l7-7-2-2-7 7zM17 5a1.4 1.4 0 000-2l-1.5-1.5a1.4 1.4 0 00-2 0L12 3l3.5 3.5L17 5z" />
      </svg>
    ),
  },
  {
    id: 'experience',
    label: 'Experiencia',
    desc: 'Registra tu experiencia laboral y formación académica',
    to: '/dashboard/experience',
    badge: '3 entradas',
    badgeColor: '#f59e0b',
    badgeBg: 'rgba(245,158,11,.1)',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="4" width="14" height="13" rx="2" />
        <path d="M7 4V2M13 4V2M3 9h14M7 13h2M7 16h6" />
      </svg>
    ),
  },
  {
  id: 'enlaces',
  label: 'Redes Profesionales',
  desc: 'Gestiona tus enlaces de LinkedIn, GitHub y otras redes',
  to: '/dashboard/enlaces',   // ← la ruta donde montaste EnlacePage
  badge: 'Nuevo',
  badgeColor: 'var(--azul)',
  badgeBg: 'var(--azul-light)',
  icon: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M13 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
      <path d="M13 10l4-4M7 10l-4 4M10 7V3M10 17v-4" />
    </svg>
  ),
  },
  {
    id: 'preview',
    label: 'Vista Previa',
    desc: 'Revisa cómo se verá tu portafolio antes de publicarlo',
    to: '/dashboard/preview',
    badge: '2 sugerencias',
    badgeColor: 'var(--rojo-mid)',
    badgeBg: 'var(--rojo-bg)',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M1 10S4.5 3 10 3s9 7 9 7-3.5 7-9 7-9-7-9-7z" />
        <circle cx="10" cy="10" r="3" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Configuración',
    desc: 'Ajustes de cuenta, privacidad y preferencias',
    to: '/dashboard/settings',
    badge: null,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="10" cy="10" r="3" />
        <path d="M10 1v2.5M10 16.5V19M1 10h2.5M16.5 10H19M3.2 3.2l1.8 1.8M15 15l1.8 1.8M3.2 16.8L5 15M15 5l1.8-1.8" />
      </svg>
    ),
  },
];

export default function DashboardPage() {
  const [nombreUsuario, setNombreUsuario] = useState('Desarrollador');
  useEffect(() => {
    const userStr = localStorage.getItem('usuario');
    if (userStr) {
      const user = JSON.parse(userStr);
      // Busca 'nombre' o 'name' (dependiendo de cómo lo guardaste)
      const nombreReal = user.nombre || user.name;
      if (nombreReal) {
        setNombreUsuario(nombreReal);
      }
    }
  }, []);
  return (
    <>
      <style>{`
        /* ── OVERVIEW LAYOUT ── */
        .dsh-overview { padding: 24px 28px; }

        /* ── WELCOME ── */
        .dsh-welcome {
          background: linear-gradient(90deg, var(--azul-deep, #004f7c) 0%, var(--azul, #0077b7) 100%);
          border-radius: 12px;
          padding: 28px 32px;
          display: flex; align-items: center;
          justify-content: space-between; gap: 24px;
          margin-bottom: 22px;
          position: relative; overflow: hidden;
        }
        .dsh-welcome::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
        }
        .dsh-welcome-text { position: relative; z-index: 1; flex: 1; min-width: 0; }
        .dsh-welcome-label {
          font-family: var(--mono, monospace);
          font-size: 10px; font-weight: 500;
          color: rgba(255,255,255,.45);
          letter-spacing: .12em; text-transform: uppercase;
          margin-bottom: 6px;
        }
        .dsh-welcome-title {
          font-size: 22px; font-weight: 700;
          color: #fff; letter-spacing: -.02em; line-height: 1.2;
          margin-bottom: 6px;
        }
        .dsh-welcome-sub {
          font-size: 13px; color: rgba(255,255,255,.6);
          line-height: 1.5;
        }
        .dsh-welcome-badges {
          display: flex; gap: 12px;
          position: relative; z-index: 1;
          flex-shrink: 0;
        }
        .dsh-welcome-badge {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.2);
          border-radius: 10px; padding: 12px 20px;
        }
        .dsh-welcome-badge-num {
          font-size: 28px; font-weight: 800;
          color: #fff; letter-spacing: -.03em; line-height: 1;
        }
        .dsh-welcome-badge-lbl {
          font-size: 11px; color: rgba(255,255,255,.55);
          text-transform: uppercase; letter-spacing: .07em;
          line-height: 1.3;
        }

        /* ── QUICK STATS ── */
        .dsh-stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px; margin-bottom: 26px;
        }
        .dsh-stat-card {
          background: var(--blanco, #fff);
          border: 1.5px solid var(--gris-borde, #d1d5db);
          border-radius: 10px; padding: 18px 16px;
          display: flex; align-items: center; gap: 14px;
          transition: box-shadow .15s, transform .15s;
        }
        .dsh-stat-card:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,.08);
          transform: translateY(-2px);
        }
        .dsh-stat-icon {
          width: 40px; height: 40px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .dsh-stat-icon svg {
          width: 18px; height: 18px;
          fill: none; stroke: currentColor; stroke-width: 1.7;
        }
        .dsh-stat-num {
          font-size: 24px; font-weight: 800;
          letter-spacing: -.02em; line-height: 1;
        }
        .dsh-stat-lbl {
          font-size: 11px; color: var(--gris-texto, #6b7280);
          font-weight: 500; text-transform: uppercase;
          letter-spacing: .06em; margin-top: 2px;
        }

        /* ── SECTION TITLE ── */
        .dsh-section-header {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 16px;
        }
        .dsh-section-title {
          font-size: 14px; font-weight: 700;
          color: var(--negro-texto, #111827);
          letter-spacing: -.01em; white-space: nowrap;
        }
        .dsh-section-line {
          flex: 1; height: 1px;
          background: var(--gris-borde, #d1d5db);
        }

        /* ── QUICK LINKS GRID ── */
        .dsh-links-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }
        .dsh-link-card {
          background: var(--blanco, #fff);
          border: 1.5px solid var(--gris-borde, #d1d5db);
          border-radius: 10px; padding: 18px;
          display: flex; flex-direction: column; gap: 10px;
          cursor: pointer; text-decoration: none;
          transition: all .15s; position: relative;
          overflow: hidden;
        }
        .dsh-link-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--azul, #0077b7), var(--azul-mid, #b8ddf0));
          opacity: 0; transition: opacity .15s;
        }
        .dsh-link-card:hover {
          border-color: var(--azul-mid, #b8ddf0);
          box-shadow: 0 4px 16px rgba(0,119,183,.1);
          transform: translateY(-2px);
        }
        .dsh-link-card:hover::before { opacity: 1; }

        .dsh-link-card-top {
          display: flex; align-items: flex-start;
          justify-content: space-between;
        }
        .dsh-link-icon {
          width: 36px; height: 36px; border-radius: 8px;
          background: var(--azul-light, #e8f4fb);
          border: 1px solid var(--azul-mid, #b8ddf0);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .dsh-link-icon svg {
          width: 17px; height: 17px;
          stroke: var(--azul, #0077b7); fill: none; stroke-width: 1.6;
        }
        .dsh-link-arrow {
          width: 18px; height: 18px;
          stroke: var(--gris-borde, #d1d5db); fill: none; stroke-width: 1.8;
          transition: stroke .15s, transform .15s;
        }
        .dsh-link-card:hover .dsh-link-arrow {
          stroke: var(--azul, #0077b7);
          transform: translate(2px, -2px);
        }
        .dsh-link-name {
          font-size: 14px; font-weight: 600;
          color: var(--negro-texto, #111827);
        }
        .dsh-link-desc {
          font-size: 12px; color: var(--gris-texto, #6b7280);
          line-height: 1.5;
        }
        .dsh-link-badge {
          display: inline-flex; align-items: center;
          font-size: 10px; font-weight: 600;
          padding: 2px 8px; border-radius: 10px;
          letter-spacing: .04em;
          align-self: flex-start;
        }

        /* ── PROGRESO PERFIL ── */
        .dsh-profile-progress {
          margin-top: 22px;
          background: var(--blanco, #fff);
          border: 1px solid var(--gris-borde, #d1d5db);
          border-left: 4px solid #f59e0b;
          border-radius: 10px; padding: 16px 20px;
          display: flex; align-items: center; gap: 20px;
          box-shadow: 0 1px 4px rgba(0,0,0,.04);
        }
        .dsh-pp-text { flex: 1; min-width: 0; }
        .dsh-pp-title {
          font-size: 13px; font-weight: 600;
          color: var(--negro-texto, #111827); margin-bottom: 2px;
        }
        .dsh-pp-sub {
          font-size: 11px; color: var(--gris-texto, #6b7280);
        }
        .dsh-pp-bar-wrap { flex: 2; min-width: 0; }
        .dsh-pp-bar-labels {
          display: flex; justify-content: space-between;
          font-size: 10px; font-family: var(--mono, monospace);
          color: var(--gris-texto, #6b7280);
          margin-bottom: 5px;
        }
        .dsh-pp-bar-labels strong { color: #f59e0b; }
        .dsh-pp-bar {
          height: 5px; border-radius: 3px;
          background: var(--gris-borde, #d1d5db); overflow: hidden;
        }
        .dsh-pp-bar-fill {
          height: 100%; width: 72%;
          background: linear-gradient(90deg, #f59e0b, #fbbf24);
          border-radius: 3px;
        }
        .dsh-pp-hint {
          font-size: 11px; color: var(--gris-texto, #6b7280);
          flex-shrink: 0; white-space: nowrap;
        }
        .dsh-pp-hint span { color: #f59e0b; font-weight: 600; }

        /* ══ RESPONSIVE ══ */

        /* Tablet */
        @media (max-width: 960px) {
          .dsh-stats-row   { grid-template-columns: repeat(2, 1fr); }
          .dsh-links-grid  { grid-template-columns: repeat(2, 1fr); }
        }

        /* Móvil grande */
        @media (max-width: 640px) {
          .dsh-overview    { padding: 14px; }

          /* Welcome: apila texto + badges */
          .dsh-welcome     {
            flex-direction: column;
            align-items: flex-start;
            padding: 20px 20px;
            gap: 16px;
          }
          .dsh-welcome-title  { font-size: 18px; }
          .dsh-welcome-sub    { font-size: 12px; }
          .dsh-welcome-badges { width: 100%; }
          .dsh-welcome-badge  {
            flex: 1;
            justify-content: center;
            padding: 10px 12px;
          }
          .dsh-welcome-badge-num  { font-size: 22px; }

          /* Stats: 1 columna en móvil para evitar distorsión */
          .dsh-stats-row {
            grid-template-columns: 1fr;
            gap: 10px;
            margin-bottom: 20px;
          }
          .dsh-stat-card   { padding: 14px 12px; gap: 10px; }
          .dsh-stat-icon   { width: 34px; height: 34px; border-radius: 8px; }
          .dsh-stat-num    { font-size: 20px; }
          .dsh-stat-lbl    { font-size: 10px; }

          /* Quick links: 1 columna */
          .dsh-links-grid  { grid-template-columns: 1fr; gap: 10px; }

          /* Card horizontal en móvil */
          .dsh-link-card   { flex-direction: row; align-items: center; padding: 14px; gap: 14px; }
          .dsh-link-card-top { flex-direction: column; gap: 0; align-items: center; }
          .dsh-link-arrow  { display: none; }
          .dsh-link-content { flex: 1; min-width: 0; }
          .dsh-link-name   { font-size: 13px; }
          .dsh-link-desc   { font-size: 11px; }

          /* Progreso: apila */
          .dsh-profile-progress {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            padding: 14px 16px;
          }
          .dsh-pp-bar-wrap { width: 100%; }
          .dsh-pp-hint     { font-size: 12px; }
        }

        /* Móvil pequeño */
        @media (max-width: 380px) {
          .dsh-welcome-badges { flex-direction: column; gap: 8px; }
          .dsh-stats-row      { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="dsh-overview">

        {/* Welcome banner */}
        <div className="dsh-welcome">
          <div className="dsh-welcome-text">
            <div className="dsh-welcome-label">CreaFolio</div>
            <div className="dsh-welcome-title">
                ¡Bienvenido de vuelta, {nombreUsuario}! 
            </div>
            <div className="dsh-welcome-sub">
                Gestiona tu portafolio, actualiza tus proyectos y conecta con empresas. 
            </div>
          </div>
          <div className="dsh-welcome-badges">
            <div className="dsh-welcome-badge">
              <div>
                <div className="dsh-welcome-badge-num">72%</div>
                <div className="dsh-welcome-badge-lbl">Perfil<br />completo</div>
              </div>
            </div>
            <div className="dsh-welcome-badge">
              <div>
                <div className="dsh-welcome-badge-num">4</div>
                <div className="dsh-welcome-badge-lbl">Proyectos<br />activos</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="dsh-stats-row">
          {QUICK_STATS.map(({ num, lbl, color, bg, border }) => (
            <div className="dsh-stat-card" key={lbl}>
              <div
                className="dsh-stat-icon"
                style={{ background: bg, border: `1px solid ${border}`, color }}
              >
                <svg viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="8" />
                  <path d="M10 6v4l3 3" />
                </svg>
              </div>
              <div>
                <div className="dsh-stat-num" style={{ color }}>{num}</div>
                <div className="dsh-stat-lbl">{lbl}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Acceso rápido */}
        <div className="dsh-section-header">
          <div className="dsh-section-title">Acceso rápido</div>
          <div className="dsh-section-line" />
        </div>

        <div className="dsh-links-grid">
          {QUICK_LINKS.map((item) => (
            <Link key={item.id} to={item.to} className="dsh-link-card">
              <div className="dsh-link-card-top">
                <div className="dsh-link-icon">{item.icon}</div>
                <svg className="dsh-link-arrow" viewBox="0 0 14 14">
                  <path d="M3 11L11 3M5 3h6v6" />
                </svg>
              </div>
              <div className="dsh-link-content">
                <div className="dsh-link-name">{item.label}</div>
                <div className="dsh-link-desc">{item.desc}</div>
                {item.badge && (
                  <span
                    className="dsh-link-badge"
                    style={{
                      color: item.badgeColor,
                      background: item.badgeBg,
                      border: `1px solid ${item.badgeColor}33`,
                      marginTop: 6,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Progreso del perfil */}
        <div className="dsh-profile-progress">
          <div className="dsh-pp-text">
            <div className="dsh-pp-title">Completa tu perfil</div>
            <div className="dsh-pp-sub">Más completitud = más visibilidad ante empresas</div>
          </div>
          <div className="dsh-pp-bar-wrap">
            <div className="dsh-pp-bar-labels">
              <span>Progreso</span>
              <strong>72%</strong>
            </div>
            <div className="dsh-pp-bar">
              <div className="dsh-pp-bar-fill" />
            </div>
          </div>
          <div className="dsh-pp-hint">
            Faltan <span>28%</span> para completar
          </div>
        </div>

      </div>
    </>
  );
}