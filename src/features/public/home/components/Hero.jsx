import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import { useLanguage } from '../../../../core/i18n';
import { getHomeStats } from '../services/homePortfolioService';
import useHeroInputNavigation from '../hooks/useHeroInputNavigation';
import { EventDetailModal, EventHeroBanner } from './events';
import { hasActiveStoredSession } from '../../../../shared/utils/authStorage';

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
const CHIPS_CORNER = [
  { text: 'Next.js', red: false },
  { text: 'Django', red: false },
  { text: 'Supabase', red: true },
  { text: 'Kubernetes', red: false },
  { text: 'Tailwind', red: false },
  { text: 'MongoDB', red: true },
];

const STATS = [
  { key: 'developers', labelKey: 'hero.stats.developers' },
  { key: 'projects', labelKey: 'hero.stats.projects' },
  { key: 'technologies', labelKey: 'hero.stats.technologies' },
  { key: 'events', labelKey: 'hero.stats.events', red: true },
];

function formatStatValue(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '--';

  return new Intl.NumberFormat().format(number);
}


export default function Hero({ eventsState }) {
  const { t } = useLanguage();
  const heroRef = useRef(null);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const touchStartX = useRef(null);
  const highlighted = eventsState?.highlighted || [];
  const slideCount = highlighted.length + 1;

  const moveSlide = useCallback((step) => {
    setActiveSlide((index) => (index + step + slideCount) % slideCount);
  }, [slideCount]);

  const heroInputNavigation = useHeroInputNavigation({
    enabled: slideCount > 1,
    onMove: moveSlide,
  });

  useEffect(() => {
    let active = true;

    getHomeStats()
      .then((nextStats) => {
        if (active) setStats(nextStats);
      })
      .catch(() => {
        if (active) setStats({});
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (carouselPaused || slideCount <= 1) return undefined;

    const timer = window.setInterval(() => {
      setActiveSlide((index) => (index + 1) % slideCount);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [carouselPaused, slideCount]);

  useEffect(() => {
    if (activeSlide >= slideCount) {
      setActiveSlide(0);
    }
  }, [activeSlide, slideCount]);

  const redirectToLogin = () => {
    sessionStorage.setItem('auth:return-to', '/');
    navigate('/auth/login', { state: { from: '/' } });
  };

  const handleViewDetails = (event) => {
    if (!hasActiveStoredSession()) {
      redirectToLogin();
      return;
    }

    setSelectedEvent(event);
  };

  const handleRegister = async (event) => {
    if (!hasActiveStoredSession()) {
      redirectToLogin();
      return;
    }

    const result = await eventsState?.register?.(event);
    if (result?.refreshed && selectedEvent) {
      const updated = result.refreshed.events.find((item) => String(item.id) === String(selectedEvent.id));
      if (updated) setSelectedEvent(updated);
    }
  };

  const handleTouchStart = (event) => {
    if (!window.matchMedia('(max-width: 768px)').matches) return;
    touchStartX.current = event.touches?.[0]?.clientX ?? null;
    setCarouselPaused(true);
  };

  const handleTouchEnd = (event) => {
    if (!window.matchMedia('(max-width: 768px)').matches) return;
    const endX = event.changedTouches?.[0]?.clientX;
    const startX = touchStartX.current;

    if (typeof startX === 'number' && typeof endX === 'number' && Math.abs(endX - startX) >= 50) {
      moveSlide(endX > startX ? -1 : 1);
    }

    touchStartX.current = null;
    setCarouselPaused(false);
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
          padding: 34px 24px 70px;
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
            linear-gradient(rgba(0,119,183,.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,119,183,.07) 1px, transparent 1px);
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
          opacity: .76;
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
        .cl-0 { top: 118px; left:  44px; transform: rotate(-4deg); }
        .cl-1 { top: 248px; left:  18px; transform: rotate( 2deg); }
        .cl-2 { bottom: 156px; left:  52px; transform: rotate(-3deg); }
        .cl-3 { top: 50%; left:  116px; transform: translateY(-50%) rotate( 4deg); }
        .cl-4 { bottom: 76px; left:  192px; transform: rotate(-2deg); }
        .cl-5 { top: 74px; left:  228px; transform: rotate( 3deg); }

        /* posiciones — derecha */
        .cr-0 { top: 116px; right:  52px; transform: rotate( 4deg); }
        .cr-1 { top: 246px; right: 18px; transform: rotate(-3deg); }
        .cr-2 { bottom: 158px; right: 48px; transform: rotate( 2deg); }
        .cr-3 { top: 50%; right: 116px; transform: translateY(-50%) rotate(-4deg); }
        .cr-4 { bottom: 78px; right: 190px; transform: rotate( 3deg); }
        .cr-5 { top: 72px; right: 228px; transform: rotate(-2deg); }

        .ct-0 { top: 66px; left:  calc(50% - 430px); transform: rotate(-2deg); }
        .ct-1 { top: 66px; left:  calc(50% + 286px); transform: rotate( 2deg); }
        .cc-0 { top: 28px; left: 34px; transform: rotate(3deg); }
        .cc-1 { top: 28px; right: 34px; transform: rotate(-3deg); }
        .cc-2 { bottom: 28px; left: 42px; transform: rotate(-2deg); }
        .cc-3 { bottom: 28px; right: 42px; transform: rotate(2deg); }
        .cc-4 { bottom: 30px; left: calc(50% - 250px); transform: rotate(2deg); }
        .cc-5 { bottom: 30px; right: calc(50% - 250px); transform: rotate(-2deg); }

        /* ══ CONTENIDO CENTRAL ══ */
        .spk-hero-inner {
          position: relative; z-index: 1;
          max-width: 880px; width: 100%;
          display: flex; flex-direction: column;
          align-items: center;
          order: 1;
        }

        .spk-hero-showcase {
          order: 1;
          position: relative;
          width: min(1340px, calc(100% - 44px));
          z-index: 3;
          padding: 0;
          background: transparent;
          border-radius: 14px;
        }
        .spk-hero-institutional {
          align-items: center;
          display: flex;
          justify-content: center;
          min-height: clamp(500px, 62vh, 620px);
          padding: 24px;
        }
        .spk-hero-showcase .evh-hero-media {
          border: 1.5px solid rgba(184, 221, 240, .8);
          border-radius: 14px;
          box-shadow: 0 24px 62px rgba(0, 79, 124, .2);
          min-height: clamp(540px, 68vh, 680px);
        }
        .spk-hero-showcase .evh-hero-content {
          max-width: min(560px, 50%);
          padding: 36px 38px;
        }
        .spk-hero-showcase .evh-hero h3 {
          font-size: clamp(31px, 4vw, 54px);
        }
        .spk-hero-showcase .evh-hero p {
          font-size: 16px;
          line-height: 1.65;
        }
        .spk-hero-showcase .spk-hero-inner { max-width: 880px; }
        .spk-hero-showcase-nav {
          align-items: center;
          background: var(--blanco);
          border: 1.5px solid var(--azul-mid);
          border-radius: 7px;
          box-shadow: 0 6px 18px rgba(17,24,39,.12);
          color: var(--azul-deep);
          cursor: pointer;
          display: flex;
          height: 72px;
          justify-content: center;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 30px;
          z-index: 8;
        }
        .spk-hero-showcase-nav:hover { background: var(--azul-light); border-color: var(--azul); color: var(--azul); }
        .spk-hero-showcase-prev { left: -14px; }
        .spk-hero-showcase-next { right: -14px; }
        .spk-hero-showcase-dots {
          bottom: 28px;
          display: flex;
          gap: 7px;
          left: 50%;
          position: absolute;
          transform: translateX(-50%);
          z-index: 8;
        }
        .spk-hero-showcase-dot {
          background: rgba(0,119,183,.35);
          border: 0;
          border-radius: 999px;
          cursor: pointer;
          height: 8px;
          padding: 0;
          width: 8px;
        }
        .spk-hero-showcase-dot.active { background: var(--azul); width: 26px; }

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
          position: relative;
          z-index: 4;
          width: min(540px, 100%);
          margin: 22px auto 0;
          text-align: center;
          order: 2;
          animation: fadeUp .5s .52s ease both;
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
          justify-content: center;
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
          .spk-hero {
            justify-content: flex-start;
            min-height: auto;
            padding: 28px 16px 64px;
          }
          .spk-search-box {
            width: min(100%, 560px);
            margin: 20px auto 0;
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
          .spk-hero-showcase {
            width: 100%;
            border-radius: 12px;
          }
          .spk-hero-institutional {
            min-height: calc(100svh - var(--nav-height, 60px) - 92px);
            padding: 20px 0 34px;
          }
          .spk-hero-title {
            font-size: clamp(34px, 11vw, 52px);
            line-height: 1;
            margin-bottom: 18px;
          }
          .spk-divider {
            margin-bottom: 18px;
          }
          .spk-hero-desc {
            max-width: 92%;
          }
          .spk-hero-showcase .evh-hero-media {
            border-radius: 10px;
            box-shadow: 0 16px 36px rgba(0, 79, 124, .18);
            min-height: 0;
          }
          .spk-hero-showcase .evh-hero-content {
            max-width: none;
            padding: 20px;
          }
          .spk-hero-showcase .evh-hero h3 {
            font-size: clamp(28px, 8vw, 40px);
          }
          .spk-hero-showcase .evh-hero p {
            font-size: 14px;
            line-height: 1.55;
          }
          .spk-hero-showcase-nav,
          .spk-hero-showcase-dots { display: none; }
        }
        @media (max-width: 520px) {
          .spk-hero {
            padding: 22px 12px 56px;
          }
          .spk-badge {
            font-size: 10px;
            padding-inline: 12px;
            margin-bottom: 16px;
          }
          .spk-hero-desc {
            font-size: 14px;
            line-height: 1.65;
            margin-bottom: 0;
          }
          .spk-hero-institutional {
            min-height: calc(100svh - var(--nav-height, 60px) - 76px);
            padding: 16px 0 26px;
          }
          .spk-stats {
            margin-top: 24px;
          }
          .spk-hero-showcase .evh-hero-content {
            padding: 18px;
          }
          .spk-search-icon {
            width: 28px;
            height: 28px;
          }
          .spk-search-input {
            font-size: 13px;
          }
          .spk-stats {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            width: min(100%, 340px);
          }
          .spk-stat {
            border-right: 1px solid var(--gris-borde) !important;
            border-bottom: 1px solid var(--gris-borde);
          }
          .spk-stat:nth-child(2n) {
            border-right: none !important;
          }
          .spk-stat:nth-last-child(-n + 2) {
            border-bottom: none;
          }
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
          {CHIPS_CORNER.map((c, i) => (
            <div key={`c${i}`} className={`spk-chip cc-${i}${c.red ? ' chip-red' : ''}`}>
              <span className="spk-chip-dot" />{c.text}
            </div>
          ))}
        </div>

        {/* Contenido principal y eventos destacados */}
        <div
          className="spk-hero-showcase"
          {...heroInputNavigation}
          onMouseEnter={() => setCarouselPaused(true)}
          onMouseLeave={() => setCarouselPaused(false)}
          onFocus={() => setCarouselPaused(true)}
          onBlur={() => setCarouselPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {activeSlide === 0 ? (
            <div className="spk-hero-institutional">
              <div className="spk-hero-inner">
                <div className="spk-badge">
                  <div className="spk-badge-dot" />
                  {t('hero.badge')}
                </div>

                <h1 className="spk-hero-title">
                  <span className="spk-title-blue">{t('hero.title.brand')}</span>{' '}
                  <span className="spk-title-dark">{t('hero.title.line1')}</span>
                  <br />
                  <span className="spk-title-dark">{t('hero.title.line2')}</span>
                </h1>

                <div className="spk-divider" />

                <p className="spk-hero-desc">
                  <strong>{t('hero.description.prefix')}</strong> {t('hero.description.text')}
                </p>

                <div className="spk-stats">
                  {STATS.map(({ key, labelKey, red }) => (
                    <div key={labelKey} className={`spk-stat${red ? ' stat-red' : ''}`}>
                      <div className="spk-stat-num">{formatStatValue(stats?.[key])}</div>
                      <div className="spk-stat-lbl">{t(labelKey)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <EventHeroBanner
              events={[highlighted[activeSlide - 1]]}
              onRegister={handleRegister}
              onViewDetails={handleViewDetails}
              registeringId={eventsState?.registeringId}
              showMobileNavigation={false}
            />
          )}

          {slideCount > 1 && activeSlide !== 0 && (
            <>
              <button type="button" className="spk-hero-showcase-nav spk-hero-showcase-prev" onClick={() => moveSlide(-1)} aria-label="Banner anterior">
                <BsChevronLeft />
              </button>
              <button type="button" className="spk-hero-showcase-nav spk-hero-showcase-next" onClick={() => moveSlide(1)} aria-label="Siguiente banner">
                <BsChevronRight />
              </button>
              <div className="spk-hero-showcase-dots" aria-label="Banners principales">
                {Array.from({ length: slideCount }, (_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`spk-hero-showcase-dot${index === activeSlide ? ' active' : ''}`}
                    onClick={() => setActiveSlide(index)}
                    aria-label={`Mostrar banner ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Scroll hint */}
        <div className="spk-scroll-hint" aria-hidden="true">
          <span>{t('hero.scroll')}</span>
          <div className="spk-scroll-line" />
        </div>

      </section>

      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onRegister={handleRegister}
        registering={String(eventsState?.registeringId || '') === String(selectedEvent?.id || '')}
      />
    </>
  );
}
