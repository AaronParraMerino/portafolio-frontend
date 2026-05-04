import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* ── Datos ── */
const CHIPS_LEFT = [
  { text: 'React.js',   red: false },
  { text: 'Laravel',    red: false },
  { text: 'Firebase',   red: true  },
  { text: 'Python',     red: false },
  { text: 'PostgreSQL', red: false },
  { text: 'Redis',      red: true  },
];
const CHIPS_RIGHT = [
  { text: 'Flutter',   red: false },
  { text: 'Node.js',   red: false },
  { text: 'Kotlin',    red: true  },
  { text: 'Docker',    red: false },
  { text: 'GraphQL',   red: false },
  { text: 'Vue.js',    red: false },
];
const CHIPS_TOP = [
  { text: 'TypeScript', red: false },
  { text: 'Rust',       red: false },
];

const STATS = [
  { num: '1,240+', lbl: 'Desarrolladores' },
  { num: '380+',   lbl: 'Proyectos'       },
  { num: '95',     lbl: 'Contrataciones', red: true },
  { num: '18+',    lbl: 'Tecnologías'    },
];


export default function Hero() {
  const heroRef = useRef(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const goToSearch = (term = searchTerm) => {
    const cleanTerm = term.trim();
    if (cleanTerm) {
      navigate(`/portafolios?q=${encodeURIComponent(cleanTerm)}`);
      return;
    }
    navigate('/portafolios');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    goToSearch();
  };


  return (
    <>
      <style>{`
        /* ══════════════════════════════════════
           HERO — variables de la paleta oficial
        ══════════════════════════════════════ */
        .spk-hero {
          min-height: calc(100vh - var(--nav-height));
          background: var(--fondo);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          position: relative;
          overflow: hidden;
          padding: 42px 24px 86px;
        }

        /* Franja superior azul */
        .spk-hero::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg,
            var(--azul-deep) 0%, var(--azul) 50%, var(--azul-mid) 100%
          );
          z-index: 2;
        }

        /* Blobs decorativos */
        .spk-blob {
          position: absolute; border-radius: 50%;
          pointer-events: none;
        }
        .spk-blob-right {
          top: -80px; right: -120px;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(0,119,183,.1) 0%, transparent 68%);
        }
        .spk-blob-left {
          bottom: 40px; left: -100px;
          width: 380px; height: 380px;
          background: radial-gradient(circle, rgba(0,79,124,.07) 0%, transparent 65%);
        }
        .spk-blob-red {
          bottom: -60px; right: 60px;
          width: 280px; height: 280px;
          background: radial-gradient(circle, rgba(232,85,85,.07) 0%, transparent 65%);
        }

        /* Cuadrícula de fondo */
        .spk-hero-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(0,119,183,.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,119,183,.05) 1px, transparent 1px);
          background-size: 52px 52px;
          pointer-events: none;
        }

        /* Línea decorativa */
        .spk-deco-line {
          position: absolute; bottom: 88px; left: 50%;
          transform: translateX(-50%);
          width: 240px; height: 1px;
          background: linear-gradient(90deg, transparent, var(--gris-borde), transparent);
        }

        /* ══ CHIPS DE TECNOLOGÍA ══ */
        .spk-chips-area {
          position: absolute; inset: 0;
          pointer-events: none; overflow: hidden;
        }
        .spk-chip {
          position: absolute;
          background: var(--blanco);
          border: 1.5px solid var(--gris-borde);
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 11px; font-weight: 600;
          color: var(--gris-oscuro);
          display: flex; align-items: center; gap: 5px;
          box-shadow: 0 2px 10px rgba(0,0,0,.07);
          font-family: var(--mono);
          white-space: nowrap;
          opacity: .72;
        }
        .spk-chip.chip-red {
          background: var(--rojo-chip);
          border-color: var(--rojo-borde);
          color: var(--rojo-mid);
        }
        .spk-chip-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--azul); flex-shrink: 0;
        }
        .spk-chip.chip-red .spk-chip-dot { background: var(--rojo-soft); }

        /* posiciones — izquierda */
        .cl-0 { top: 130px; left:  20px; transform: rotate(-4deg); }
        .cl-1 { top: 200px; left: -10px; transform: rotate( 2deg); }
        .cl-2 { top: 270px; left:  25px; transform: rotate(-3deg); }
        .cl-3 { top: 345px; left:  -5px; transform: rotate( 4deg); }
        .cl-4 { top: 415px; left:  30px; transform: rotate(-2deg); }
        .cl-5 { top: 480px; left:  -8px; transform: rotate( 3deg); }

        /* posiciones — derecha */
        .cr-0 { top: 130px; right:  15px; transform: rotate( 4deg); }
        .cr-1 { top: 200px; right: -10px; transform: rotate(-3deg); }
        .cr-2 { top: 270px; right:  20px; transform: rotate( 2deg); }
        .cr-3 { top: 345px; right:  -5px; transform: rotate(-4deg); }
        .cr-4 { top: 415px; right:  25px; transform: rotate( 3deg); }
        .cr-5 { top: 480px; right: -12px; transform: rotate(-2deg); }

        .ct-0 { top: 62px; left:  calc(50% - 360px); transform: rotate(-2deg); }
        .ct-1 { top: 62px; left:  calc(50% + 240px); transform: rotate( 2deg); }

        /* ══ CONTENIDO CENTRAL ══ */
        .spk-hero-inner {
          position: relative; z-index: 1;
          max-width: 880px; width: 100%;
          display: flex; flex-direction: column;
          align-items: center;
        }

        /* badge institución */
        .spk-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--blanco);
          border: 1.5px solid var(--azul-mid);
          border-radius: 20px;
          padding: 5px 16px;
          font-size: 11px; font-weight: 600;
          color: var(--azul);
          letter-spacing: .07em; text-transform: uppercase;
          margin-bottom: 14px;
          box-shadow: 0 2px 10px rgba(0,119,183,.1);
          animation: fadeUp .5s .05s ease both;
        }
        .spk-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--rojo-soft);
          animation: pulse 2s ease infinite;
        }

        /* título */
        .spk-hero-title {
          font-size: clamp(34px, 7vw, 72px);
          font-weight: 800;
          line-height: .94;
          letter-spacing: -.03em;
          margin-bottom: 22px;
          animation: fadeUp .5s .26s ease both;
        }
        .spk-title-dark { color: var(--negro-texto); }
        .spk-title-blue { color: var(--azul); }

        /* divisor */
        .spk-divider {
          width: 48px; height: 3px;
          background: linear-gradient(90deg, var(--azul), var(--azul-mid));
          border-radius: 2px;
          margin: 0 auto 22px;
          animation: fadeUp .5s .32s ease both;
        }

        /* descripción */
        .spk-hero-desc {
          font-size: 15.5px; line-height: 1.8;
          color: var(--gris-texto);
          max-width: 540px; margin: 0 auto 0;
          animation: fadeUp .5s .38s ease both;
        }
        .spk-hero-desc strong { color: var(--negro-texto); font-weight: 600; }

        /* ══ BUSCADOR PÚBLICO ══ */
        .spk-search-box {
          position: absolute;
          top: 24px;
          left: 28px;
          z-index: 4;
          width: min(440px, calc(100% - 56px));
          margin: 0;
          text-align: left;
          animation: fadeUp .5s .12s ease both;
        }
        .spk-portfolio-search {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 6px;
          background: rgba(255,255,255,.94);
          border: 1.5px solid var(--azul-mid);
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,79,124,.10);
          backdrop-filter: blur(8px);
        }
        .spk-search-input-wrap {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 6px 0 10px;
        }
        .spk-search-icon {
          width: 30px;
          height: 30px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: var(--azul-light);
          color: var(--azul);
          flex-shrink: 0;
        }
        .spk-search-icon svg {
          width: 16px;
          height: 16px;
          stroke: currentColor;
          fill: none;
          stroke-width: 2.2;
        }
        .spk-search-input {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          font-family: var(--font);
          font-size: 14px;
          font-weight: 500;
          color: var(--negro-texto);
          min-height: 38px;
        }
        .spk-search-input::placeholder {
          color: var(--gris-texto);
          font-weight: 400;
        }
        .spk-search-btn {
          min-height: 40px;
          border: none;
          border-radius: 12px;
          padding: 0 15px;
          background: var(--azul);
          color: var(--blanco);
          font-family: var(--font);
          font-size: 13px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          white-space: nowrap;
          transition: background .15s, box-shadow .15s, transform .15s;
        }
        .spk-search-btn:hover {
          background: var(--azul-hover);
          box-shadow: 0 6px 18px rgba(0,119,183,.28);
          transform: translateY(-1px);
        }
        .spk-search-btn svg {
          width: 14px;
          height: 14px;
          stroke: currentColor;
          fill: none;
          stroke-width: 2.4;
        }
        .spk-search-meta {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 9px;
          padding: 0 2px;
        }
        .spk-advanced-btn {
          border: 1.5px solid var(--gris-borde);
          background: var(--blanco);
          color: var(--gris-oscuro);
          border-radius: 999px;
          padding: 7px 14px;
          font-family: var(--font);
          font-size: 12px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          cursor: pointer;
          transition: all .15s;
          white-space: nowrap;
        }
        .spk-advanced-btn:hover {
          border-color: var(--azul);
          color: var(--azul);
          background: var(--azul-light);
          transform: translateY(-1px);
        }
        .spk-advanced-btn svg {
          width: 13px;
          height: 13px;
          stroke: currentColor;
          fill: none;
          stroke-width: 2.2;
        }


        /* ══ MINI STATS ══ */
        .spk-stats {
          display: flex; align-items: stretch;
          margin-top: 28px;
          background: var(--blanco);
          border: 1.5px solid var(--gris-borde);
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,.06);
          animation: fadeUp .5s .46s ease both;
        }
        .spk-stat {
          padding: 13px 22px; text-align: center;
          border-right: 1px solid var(--gris-borde);
          transition: background .15s; cursor: default;
        }
        .spk-stat:last-child { border-right: none; }
        .spk-stat:hover { background: var(--azul-light); }
        .spk-stat.stat-red:hover { background: var(--rojo-bg); }
        .spk-stat-num {
          font-size: 19px; font-weight: 700;
          color: var(--azul); letter-spacing: -.02em; line-height: 1.1;
        }
        .spk-stat.stat-red .spk-stat-num { color: var(--rojo-mid); }
        .spk-stat-lbl {
          font-size: 10px; color: var(--gris-texto);
          font-weight: 500; text-transform: uppercase;
          letter-spacing: .06em; margin-top: 3px; white-space: nowrap;
        }

        /* ══ SCROLL HINT ══ */
        .spk-scroll-hint {
          position: absolute; bottom: 24px; left: 50%;
          transform: translateX(-50%);
          display: flex; flex-direction: column;
          align-items: center; gap: 5px;
          font-size: 10px; color: var(--gris-borde);
          letter-spacing: .1em; text-transform: uppercase;
          animation: fadeUp .5s .55s ease both;
        }
        .spk-scroll-line {
          width: 1px; height: 26px;
          background: linear-gradient(to bottom, transparent, var(--azul-mid));
          animation: scrollPulse 2s infinite;
        }

        /* ══ COPYRIGHT ══ */
        .spk-copyright {
          position: absolute; bottom: 22px; right: 40px;
          font-family: var(--mono);
          font-size: 11px; font-weight: 500;
          color: var(--gris-texto); letter-spacing: .06em;
          display: flex; align-items: center; gap: 6px;
          z-index: 2;
          animation: fadeUp .5s .6s ease both;
        }
        .spk-copyright-bar {
          width: 16px; height: 1.5px;
          background: var(--rojo-soft); border-radius: 2px;
        }
        .spk-copyright strong { color: var(--azul); font-weight: 600; }

        /* ══ RESPONSIVE ══ */
        @media (max-width: 1100px) {
          .spk-chips-area { display: none; }
        }
        @media (max-width: 768px) {
          .spk-hero { padding: 34px 20px 80px; }
          .spk-search-box {
            position: relative;
            top: auto;
            left: auto;
            width: min(100%, 560px);
            margin: 0 auto 28px;
          }
          .spk-portfolio-search {
            flex-direction: column;
            align-items: stretch;
            border-radius: 16px;
          }
          .spk-search-input-wrap {
            padding: 4px 8px 4px 10px;
          }
          .spk-search-btn {
            width: 100%;
          }
          .spk-search-meta {
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .spk-stats { flex-wrap: wrap; }
          .spk-stat {
            flex: 1 1 calc(50% - 1px);
            border-bottom: 1px solid var(--gris-borde);
          }
          .spk-stat:nth-child(2) { border-right: none; }
          .spk-stat:nth-child(3),
          .spk-stat:nth-child(4) { border-bottom: none; }
          .spk-copyright { right: 20px; }
        }
        @media (max-width: 520px) {
          .spk-badge {
            font-size: 10px;
            padding-inline: 12px;
          }
          .spk-hero-desc {
            font-size: 14px;
            margin-bottom: 20px;
          }
          .spk-search-icon {
            width: 28px;
            height: 28px;
          }
          .spk-search-input {
            font-size: 13px;
          }
          .spk-stats { flex-direction: column; width: min(100%, 340px); }
          .spk-stat { border-right: none !important; }
          .spk-copyright { font-size: 10px; }
        }
      `}</style>

      <section className="spk-hero" ref={heroRef}>

        {/* Fondo */}
        <div className="spk-hero-grid" />
        <div className="spk-blob spk-blob-right" />
        <div className="spk-blob spk-blob-left" />
        <div className="spk-blob spk-blob-red" />
        <div className="spk-deco-line" />

        {/* Chips decorativos — solo visibles en pantallas ≥ 1100px */}
        <div className="spk-chips-area" aria-hidden="true">
          {CHIPS_TOP.map((c, i) => (
            <div key={`t${i}`} className={`spk-chip ct-${i}${c.red ? ' chip-red' : ''}`}>
              <span className="spk-chip-dot" />{c.text}
            </div>
          ))}
          {CHIPS_LEFT.map((c, i) => (
            <div key={`l${i}`} className={`spk-chip cl-${i}${c.red ? ' chip-red' : ''}`}>
              <span className="spk-chip-dot" />{c.text}
            </div>
          ))}
          {CHIPS_RIGHT.map((c, i) => (
            <div key={`r${i}`} className={`spk-chip cr-${i}${c.red ? ' chip-red' : ''}`}>
              <span className="spk-chip-dot" />{c.text}
            </div>
          ))}
        </div>

        {/* Buscador público — esquina superior izquierda */}
        <div className="spk-search-box" aria-label="Buscador público de portafolios">
          <form className="spk-portfolio-search" onSubmit={handleSubmit}>
            <div className="spk-search-input-wrap">
              <span className="spk-search-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.8-3.8" />
                </svg>
              </span>
              <input
                className="spk-search-input"
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar habilidad, profesión, tecnología o nombre..."
                aria-label="Buscar portafolios"
              />
            </div>

            <button className="spk-search-btn" type="submit">
              Buscar
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
            </button>
          </form>

          <div className="spk-search-meta">
            <button className="spk-advanced-btn" type="button" onClick={() => navigate('/portafolios')}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 6h16" />
                <path d="M7 12h10" />
                <path d="M10 18h4" />
              </svg>
              Búsqueda avanzada
            </button>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="spk-hero-inner">

          {/* Badge institución */}
          <div className="spk-badge">
            <div className="spk-badge-dot" />
            Universidad Mayor de San Simón · Cochabamba, Bolivia
          </div>

          {/* Título */}
          <h1 className="spk-hero-title">
            <span className="spk-title-blue">CreaFolio</span>{' '}
            <span className="spk-title-dark">donde</span>
            <br />
            <span className="spk-title-dark">el talento es visible</span>
          </h1>

          {/* Divisor */}
          <div className="spk-divider" />

          {/* Descripción */}
          <p className="spk-hero-desc">
            <strong>CreaFolio</strong> es la vitrina digital para desarrolladores de software bolivianos.
            Creá tu portafolio profesional, publicá tus proyectos reales y conectá directamente
            con las empresas que buscan tu stack.
          </p>



          {/* Mini stats */}
          <div className="spk-stats">
            {STATS.map(({ num, lbl, red }) => (
              <div key={lbl} className={`spk-stat${red ? ' stat-red' : ''}`}>
                <div className="spk-stat-num">{num}</div>
                <div className="spk-stat-lbl">{lbl}</div>
              </div>
            ))}
          </div>

        </div>

        {/* Scroll hint */}
        <div className="spk-scroll-hint" aria-hidden="true">
          <span>Scroll</span>
          <div className="spk-scroll-line" />
        </div>

      </section>
    </>
  );
}

