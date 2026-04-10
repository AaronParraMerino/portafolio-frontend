const FOOTER_LINKS = {
  Plataforma: [
    { label: 'Explorar desarrolladores', href: '#' },
    { label: 'Proyectos trending',        href: '#' },
    { label: 'Cómo funciona',             href: '#' },
    { label: 'Empresas',                  href: '#' },
  ],
  Desarrolladores: [
    { label: 'Crear portafolio', href: '#' },
    { label: 'Mi perfil',        href: '#' },
    { label: 'Mis proyectos',    href: '#' },
    { label: 'Vista pública',    href: '#' },
  ],
  Legal: [
    { label: 'Sobre nosotros',  href: '#' },
    { label: 'Términos de uso', href: '#' },
    { label: 'Privacidad',      href: '#' },
    { label: 'Contacto',        href: '#' },
  ],
};

const SOCIALS = [
  {
    label: 'GitHub',
    href: '#',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: '#',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    label: 'Twitter / X',
    href: '#',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <>
      <style>{`
        /* ══════════════════════════════════════
           FOOTER — dark, rich, coherente con el
           sistema de diseño CreaFolio / UMSS
        ══════════════════════════════════════ */

        .spk-footer {
          position: relative;
          background: #0c1220;          /* mismo color que el sidebar */
          overflow: hidden;
        }

        /* ── Franja de acento superior ── */
        .spk-footer::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg,
            var(--rojo-soft) 0%,
            var(--azul) 40%,
            var(--azul-mid) 100%
          );
          z-index: 2;
        }

        /* ── Cuadrícula de fondo (igual al hero) ── */
        .spk-footer-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(0,119,183,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,119,183,.04) 1px, transparent 1px);
          background-size: 52px 52px;
          pointer-events: none; z-index: 0;
        }

        /* ── Blobs decorativos ── */
        .spk-footer-blob {
          position: absolute; border-radius: 50%;
          pointer-events: none; z-index: 0;
        }
        .spk-footer-blob-tl {
          top: -100px; left: -80px;
          width: 360px; height: 360px;
          background: radial-gradient(circle, rgba(0,119,183,.12) 0%, transparent 65%);
        }
        .spk-footer-blob-br {
          bottom: -80px; right: -60px;
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(232,85,85,.08) 0%, transparent 65%);
        }

        /* ── CTA BAND ── */
        .spk-footer-cta {
          position: relative; z-index: 1;
          border-bottom: 1px solid rgba(255,255,255,.07);
          padding: 40px 40px;
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
        }
        .spk-footer-cta-text {}
        .spk-footer-cta-label {
          font-family: var(--mono);
          font-size: 10px; font-weight: 500;
          color: var(--azul);
          letter-spacing: .14em; text-transform: uppercase;
          margin-bottom: 6px;
          display: flex; align-items: center; gap: 6px;
        }
        .spk-footer-cta-label::before {
          content: '';
          width: 20px; height: 1.5px;
          background: var(--azul);
          border-radius: 2px;
        }
        .spk-footer-cta-title {
          font-size: 22px; font-weight: 700;
          color: rgba(255,255,255,.92);
          letter-spacing: -.02em; line-height: 1.2;
        }
        .spk-footer-cta-title span { color: var(--azul); }

        .spk-footer-cta-actions {
          display: flex; gap: 10px; flex-wrap: wrap;
        }
        .spk-footer-btn-primary {
          display: flex; align-items: center; gap: 6px;
          background: var(--azul);
          color: #fff;
          border: none; border-radius: 7px;
          padding: 10px 22px;
          font-family: var(--font); font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all .15s; white-space: nowrap;
          text-decoration: none;
        }
        .spk-footer-btn-primary:hover {
          background: var(--azul-hover);
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(0,119,183,.4);
        }
        .spk-footer-btn-primary svg {
          width: 12px; height: 12px;
          stroke: #fff; fill: none; stroke-width: 2.2;
        }
        .spk-footer-btn-ghost {
          display: flex; align-items: center; gap: 6px;
          background: transparent;
          color: rgba(255,255,255,.6);
          border: 1px solid rgba(255,255,255,.18);
          border-radius: 7px;
          padding: 10px 22px;
          font-family: var(--font); font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all .15s; white-space: nowrap;
          text-decoration: none;
        }
        .spk-footer-btn-ghost:hover {
          border-color: rgba(255,255,255,.4);
          color: rgba(255,255,255,.9);
          background: rgba(255,255,255,.06);
        }

        /* ── STATS STRIP ── */
        .spk-footer-stats-wrap {
          position: relative; z-index: 1;
          border-bottom: 1px solid rgba(255,255,255,.07);
        }
        .spk-footer-stats {
          max-width: 1100px; margin: 0 auto;
          padding: 0 40px;
          display: flex;
        }
        .spk-footer-stat {
          flex: 1;
          padding: 18px 0;
          border-right: 1px solid rgba(255,255,255,.07);
          text-align: center;
          transition: background .15s;
          cursor: default;
        }
        .spk-footer-stat:last-child { border-right: none; }
        .spk-footer-stat:hover {
          background: rgba(255,255,255,.03);
        }
        .spk-footer-stat-num {
          font-size: 20px; font-weight: 700;
          color: var(--azul);
          letter-spacing: -.02em; line-height: 1.1;
        }
        .spk-footer-stat.red .spk-footer-stat-num { color: var(--rojo-soft); }
        .spk-footer-stat-lbl {
          font-size: 10px; font-weight: 500;
          color: rgba(255,255,255,.28);
          text-transform: uppercase; letter-spacing: .08em;
          margin-top: 3px; white-space: nowrap;
        }

        /* ── MAIN GRID ── */
        .spk-footer-main {
          position: relative; z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
          padding: 44px 40px 36px;
          display: grid;
          grid-template-columns: 1.6fr repeat(3, 1fr);
          gap: 48px;
        }

        /* BRAND COL */
        .spk-footer-logo-row {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 16px;
        }
        .spk-footer-logo-mark {
          width: 32px; height: 32px; border-radius: 7px;
          background: linear-gradient(135deg, var(--azul), var(--azul-deep));
          border: 1px solid rgba(255,255,255,.12);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .spk-footer-logo-mark svg { width: 14px; height: 14px; fill: white; }
        .spk-footer-logo-name {
          font-size: 15px; font-weight: 700;
          color: rgba(255,255,255,.9); letter-spacing: -.01em;
        }
        .spk-footer-logo-name span { color: var(--azul); }
        .spk-footer-logo-sub {
          font-family: var(--mono);
          font-size: 9px; color: rgba(255,255,255,.22);
          letter-spacing: .1em; text-transform: uppercase;
          margin-top: 1px;
        }

        .spk-footer-desc {
          font-size: 12.5px;
          color: rgba(255,255,255,.38);
          line-height: 1.7; max-width: 220px;
          margin-bottom: 22px;
        }

        /* BADGE UMSS */
        .spk-footer-umss {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(0,119,183,.15);
          border: 1px solid rgba(0,119,183,.3);
          border-radius: 6px;
          padding: 5px 10px;
          margin-bottom: 18px;
        }
        .spk-footer-umss-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--rojo-soft);
          animation: fPulse 2s ease infinite;
        }
        @keyframes fPulse {
          0%,100% { opacity:.4; transform:scale(1); }
          50%      { opacity:1; transform:scale(1.2); }
        }
        .spk-footer-umss span {
          font-family: var(--mono);
          font-size: 9.5px; font-weight: 500;
          color: rgba(255,255,255,.45);
          letter-spacing: .07em; text-transform: uppercase;
        }

        /* SOCIALES */
        .spk-footer-socials {
          display: flex; gap: 7px;
        }
        .spk-footer-social {
          width: 32px; height: 32px; border-radius: 7px;
          border: 1px solid rgba(255,255,255,.1);
          background: rgba(255,255,255,.05);
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,.4);
          text-decoration: none;
          transition: all .15s;
        }
        .spk-footer-social:hover {
          border-color: var(--azul);
          background: rgba(0,119,183,.18);
          color: var(--azul-mid);
          transform: translateY(-2px);
        }

        /* LINK COLS */
        .spk-footer-col-title {
          font-size: 10px; font-weight: 700;
          color: rgba(255,255,255,.55);
          text-transform: uppercase; letter-spacing: .1em;
          margin-bottom: 16px;
          display: flex; align-items: center; gap: 7px;
        }
        .spk-footer-col-title::after {
          content: '';
          flex: 1; height: 1px;
          background: rgba(255,255,255,.07);
        }
        .spk-footer-col-links {
          display: flex; flex-direction: column; gap: 2px;
        }
        .spk-footer-col-links a {
          font-size: 12.5px;
          color: rgba(255,255,255,.38);
          text-decoration: none;
          padding: 5px 8px;
          border-radius: 5px;
          transition: all .12s;
          display: flex; align-items: center; gap: 6px;
        }
        .spk-footer-col-links a::before {
          content: '';
          width: 3px; height: 3px; border-radius: 50%;
          background: rgba(255,255,255,.15);
          flex-shrink: 0;
          transition: background .12s;
        }
        .spk-footer-col-links a:hover {
          color: rgba(255,255,255,.82);
          background: rgba(255,255,255,.05);
        }
        .spk-footer-col-links a:hover::before {
          background: var(--azul);
        }

        /* ── DIVIDER ── */
        .spk-footer-divider {
          position: relative; z-index: 1;
          height: 1px;
          background: rgba(255,255,255,.07);
          margin: 0 40px;
        }

        /* ── BOTTOM BAR ── */
        .spk-footer-bottom {
          position: relative; z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
          padding: 18px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .spk-footer-bottom-left {
          display: flex; align-items: center; gap: 14px;
        }

        /* badge activo */
        .spk-footer-active {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(16,185,129,.1);
          border: 1px solid rgba(16,185,129,.22);
          border-radius: 20px;
          padding: 3px 10px;
          font-size: 10px; font-weight: 600;
          color: #34d399;
          letter-spacing: .05em; text-transform: uppercase;
        }
        .spk-footer-active-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #34d399;
          animation: fPulse 2s ease infinite;
        }

        .spk-footer-version {
          font-family: var(--mono);
          font-size: 10px; color: rgba(255,255,255,.2);
          letter-spacing: .06em;
        }

        /* copyright */
        .spk-footer-copy {
          display: flex; align-items: center; gap: 8px;
          font-family: var(--mono);
          font-size: 11px;
          color: rgba(255,255,255,.22);
          letter-spacing: .04em;
        }
        .spk-footer-copy-bar {
          width: 14px; height: 1.5px;
          background: var(--rojo-soft);
          border-radius: 2px; flex-shrink: 0;
        }
        .spk-footer-copy strong {
          color: rgba(255,255,255,.5);
          font-weight: 600;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 960px) {
          .spk-footer-cta { padding: 32px 24px; }
          .spk-footer-main {
            grid-template-columns: 1fr 1fr;
            gap: 32px; padding: 36px 24px 28px;
          }
          .spk-footer-brand-col { grid-column: 1 / -1; }
          .spk-footer-stats { padding: 0 24px; }
          .spk-footer-divider { margin: 0 24px; }
          .spk-footer-bottom { padding: 16px 24px; }
        }

        @media (max-width: 640px) {
          .spk-footer-cta {
            flex-direction: column;
            align-items: flex-start;
            padding: 28px 20px;
          }
          .spk-footer-main {
            grid-template-columns: 1fr;
            padding: 28px 20px;
          }
          .spk-footer-stats { flex-wrap: wrap; padding: 0 20px; }
          .spk-footer-stat {
            flex: 1 1 calc(33% - 1px);
            border-bottom: 1px solid rgba(255,255,255,.07);
          }
          .spk-footer-divider { margin: 0 20px; }
          .spk-footer-bottom {
            flex-direction: column; align-items: flex-start;
            padding: 14px 20px; gap: 10px;
          }
          .spk-footer-cta-title { font-size: 18px; }
        }
      `}</style>

      <footer className="spk-footer">
        {/* Fondos decorativos */}
        <div className="spk-footer-grid" />
        <div className="spk-footer-blob spk-footer-blob-tl" />
        <div className="spk-footer-blob spk-footer-blob-br" />

        {/* ── CTA BAND ── */}
        <div className="spk-footer-cta">
          <div className="spk-footer-cta-text">
            <div className="spk-footer-cta-label">Únete ahora</div>
            <div className="spk-footer-cta-title">
              Tu próxima oportunidad<br />empieza con un <span>buen portafolio</span>
            </div>
          </div>
        </div>

        {/* ── MAIN GRID ── */}
        <div className="spk-footer-main">

          {/* BRAND */}
          <div className="spk-footer-brand-col">
            <div className="spk-footer-logo-row">
              <div className="spk-footer-logo-mark">
                <svg viewBox="0 0 14 14">
                  <polygon points="7,1 9.3,5.3 14,6 10.5,9.3 11.4,14 7,11.6 2.6,14 3.5,9.3 0,6 4.7,5.3" />
                </svg>
              </div>
              <div>
                <div className="spk-footer-logo-name">
                  Crea<span>Folio</span>
                </div>
                <div className="spk-footer-logo-sub">by S.P.A.R.K.Y Hub</div>
              </div>
            </div>

            <div className="spk-footer-umss">
              <div className="spk-footer-umss-dot" />
              <span>UMSS · Cochabamba, Bolivia</span>
            </div>

            <p className="spk-footer-desc">
              La vitrina digital para desarrolladores de software bolivianos. Portafolios reales, proyectos reales, conexiones reales.
            </p>

            <div className="spk-footer-socials">
              {SOCIALS.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  className="spk-footer-social"
                  title={label}
                  aria-label={label}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* LINK COLUMNS */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <div className="spk-footer-col-title">{title}</div>
              <div className="spk-footer-col-links">
                {links.map(({ label, href }) => (
                  <a key={label} href={href}>{label}</a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* DIVIDER */}
        <div className="spk-footer-divider" />

        {/* BOTTOM BAR */}
        <div className="spk-footer-bottom">
          <div className="spk-footer-bottom-left">
            <div className="spk-footer-active">
              <div className="spk-footer-active-dot" />
              Plataforma activa
            </div>
            <span className="spk-footer-version">v1.0.0 · 2026</span>
          </div>

          <div className="spk-footer-copy">
            <div className="spk-footer-copy-bar" />
            <strong>© 2026 CreaFolio</strong>
            <span>· Todos los derechos reservados</span>
          </div>
        </div>
      </footer>
    </>
  );
}