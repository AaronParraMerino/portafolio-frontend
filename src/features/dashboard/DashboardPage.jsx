import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './layout/Header';

const QUICK_STATS = [
  { num: '4', lbl: 'Proyectos', color: 'var(--azul)', bg: 'var(--azul-light)', border: 'var(--azul-mid)' },
  { num: '8', lbl: 'Habilidades', color: 'var(--azul)', bg: 'var(--azul-light)', border: 'var(--azul-mid)' },
  { num: '3', lbl: 'Experiencias', color: 'var(--azul)', bg: 'var(--azul-light)', border: 'var(--azul-mid)' },
  { num: '95', lbl: 'Contrataciones', color: 'var(--rojo-mid)', bg: 'var(--rojo-bg)', border: 'var(--rojo-borde)' },
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
    desc: 'Edita tu informacion personal y configuracion publica',
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
    desc: 'Agrega o actualiza tus tecnologias y skills tecnicos',
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
    desc: 'Registra tu experiencia laboral y formacion academica',
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
    to: '/dashboard/enlaces',
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
    desc: 'Revisa como se vera tu portafolio antes de publicarlo',
    to: '/dashboard/view',
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
    label: 'Configuracion',
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
    if (!userStr) return;

    const user = JSON.parse(userStr);
    const nombreReal = user.nombre || user.name;
    if (nombreReal) {
      setNombreUsuario(nombreReal);
    }
  }, []);

  return (
    <>
      <Header
        eyebrow="GENERAL"
        title="Dashboard"
        subtitle="Resumen de tu portafolio y accesos principales."
      />

      <div className="dsh-overview">
        <div className="dsh-welcome">
          <div className="dsh-welcome-text">
            <div className="dsh-welcome-label">CreaFolio</div>
            <div className="dsh-welcome-title">
              Bienvenido de vuelta, {nombreUsuario}
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

        <div className="dsh-section-header">
          <div className="dsh-section-title">Acceso rapido</div>
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

        <div className="dsh-profile-progress">
          <div className="dsh-pp-text">
            <div className="dsh-pp-title">Completa tu perfil</div>
            <div className="dsh-pp-sub">Mas completitud = mas visibilidad ante empresas</div>
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
