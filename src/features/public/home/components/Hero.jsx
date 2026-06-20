import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../../../core/i18n';
import { getHomeStats } from '../services/homePortfolioService';

const CHIPS_LEFT = [
  { text: 'React.js', red: false },
  { text: 'Laravel', red: false },
  { text: 'Firebase', red: true },
  { text: 'Python', red: false },
  { text: 'PostgreSQL', red: false },
  { text: 'Redis', red: true },
];

const CHIPS_RIGHT = [
  { text: 'Flutter', red: false },
  { text: 'Node.js', red: false },
  { text: 'Kotlin', red: true },
  { text: 'Docker', red: false },
  { text: 'GraphQL', red: false },
  { text: 'Vue.js', red: false },
];

const CHIPS_TOP = [
  { text: 'TypeScript', red: false },
  { text: 'Rust', red: false },
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

function renderChip(chip, className, key) {
  return (
    <div key={key} className={`spk-chip ${className}${chip.red ? ' chip-red' : ''}`}>
      <span className="spk-chip-dot" />
      {chip.text}
    </div>
  );
}

export default function Hero() {
  const { t } = useLanguage();
  const heroRef = useRef(null);
  const [stats, setStats] = useState(null);

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

  return (
    <>
      <style>{`
        .spk-hero {
          align-items: center;
          background: var(--fondo);
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: calc(100vh - var(--nav-height));
          overflow: hidden;
          padding: 34px 24px 70px;
          position: relative;
          text-align: center;
        }

        .spk-hero::before {
          background: linear-gradient(90deg, var(--azul-deep) 0%, var(--azul) 50%, var(--azul-mid) 100%);
          content: '';
          height: 4px;
          left: 0;
          position: absolute;
          right: 0;
          top: 0;
          z-index: 2;
        }

        .spk-hero-grid {
          background-image:
            linear-gradient(rgba(0,119,183,.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,119,183,.07) 1px, transparent 1px);
          background-size: 52px 52px;
          inset: 0;
          pointer-events: none;
          position: absolute;
        }

        .spk-blob {
          border-radius: 50%;
          pointer-events: none;
          position: absolute;
        }

        .spk-blob-right {
          background: radial-gradient(circle, rgba(0,119,183,.1) 0%, transparent 68%);
          height: 500px;
          right: -120px;
          top: -80px;
          width: 500px;
        }

        .spk-blob-left {
          background: radial-gradient(circle, rgba(0,79,124,.07) 0%, transparent 65%);
          bottom: 40px;
          height: 380px;
          left: -100px;
          width: 380px;
        }

        .spk-blob-red {
          background: radial-gradient(circle, rgba(232,85,85,.07) 0%, transparent 65%);
          bottom: -60px;
          height: 280px;
          right: 60px;
          width: 280px;
        }

        .spk-deco-line {
          background: linear-gradient(90deg, transparent, var(--gris-borde), transparent);
          bottom: 88px;
          height: 1px;
          left: 50%;
          position: absolute;
          transform: translateX(-50%);
          width: 240px;
        }

        .spk-chips-area {
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          position: absolute;
        }

        .spk-chip {
          align-items: center;
          background: var(--blanco);
          border: 1.5px solid var(--gris-borde);
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,.07);
          color: var(--gris-oscuro);
          display: flex;
          font-family: var(--mono);
          font-size: 11px;
          font-weight: 600;
          gap: 5px;
          opacity: .76;
          padding: 6px 12px;
          position: absolute;
          white-space: nowrap;
        }

        .spk-chip.chip-red {
          background: var(--rojo-chip);
          border-color: var(--rojo-borde);
          color: var(--rojo-mid);
        }

        .spk-chip-dot {
          background: var(--azul);
          border-radius: 50%;
          flex-shrink: 0;
          height: 6px;
          width: 6px;
        }

        .spk-chip.chip-red .spk-chip-dot { background: var(--rojo-soft); }

        .cl-0 { top: 118px; left: 44px; transform: rotate(-4deg); }
        .cl-1 { top: 248px; left: 18px; transform: rotate(2deg); }
        .cl-2 { bottom: 156px; left: 52px; transform: rotate(-3deg); }
        .cl-3 { top: 50%; left: 116px; transform: translateY(-50%) rotate(4deg); }
        .cl-4 { bottom: 76px; left: 192px; transform: rotate(-2deg); }
        .cl-5 { top: 74px; left: 228px; transform: rotate(3deg); }
        .cr-0 { top: 116px; right: 52px; transform: rotate(4deg); }
        .cr-1 { top: 246px; right: 18px; transform: rotate(-3deg); }
        .cr-2 { bottom: 158px; right: 48px; transform: rotate(2deg); }
        .cr-3 { top: 50%; right: 116px; transform: translateY(-50%) rotate(-4deg); }
        .cr-4 { bottom: 78px; right: 190px; transform: rotate(3deg); }
        .cr-5 { top: 72px; right: 228px; transform: rotate(-2deg); }
        .ct-0 { top: 66px; left: calc(50% - 430px); transform: rotate(-2deg); }
        .ct-1 { top: 66px; left: calc(50% + 286px); transform: rotate(2deg); }
        .cc-0 { top: 28px; left: 34px; transform: rotate(3deg); }
        .cc-1 { top: 28px; right: 34px; transform: rotate(-3deg); }
        .cc-2 { bottom: 28px; left: 42px; transform: rotate(-2deg); }
        .cc-3 { bottom: 28px; right: 42px; transform: rotate(2deg); }
        .cc-4 { bottom: 30px; left: calc(50% - 250px); transform: rotate(2deg); }
        .cc-5 { bottom: 30px; right: calc(50% - 250px); transform: rotate(-2deg); }

        .spk-hero-showcase {
          background: transparent;
          border-radius: 14px;
          order: 1;
          padding: 0;
          position: relative;
          width: min(1340px, calc(100% - 44px));
          z-index: 3;
        }

        .spk-hero-institutional {
          align-items: center;
          display: flex;
          justify-content: center;
          min-height: clamp(500px, 62vh, 620px);
          padding: 24px;
        }

        .spk-hero-inner {
          align-items: center;
          display: flex;
          flex-direction: column;
          max-width: 880px;
          position: relative;
          width: 100%;
          z-index: 1;
        }

        .spk-badge {
          align-items: center;
          animation: fadeUp .5s .05s ease both;
          background: var(--blanco);
          border: 1.5px solid var(--azul-mid);
          border-radius: 20px;
          box-shadow: 0 2px 10px rgba(0,119,183,.1);
          color: var(--azul);
          display: inline-flex;
          font-size: 11px;
          font-weight: 600;
          gap: 8px;
          letter-spacing: .07em;
          margin-bottom: 14px;
          padding: 5px 16px;
          text-transform: uppercase;
        }

        .spk-badge-dot {
          animation: pulse 2s ease infinite;
          background: var(--rojo-soft);
          border-radius: 50%;
          height: 6px;
          width: 6px;
        }

        .spk-hero-title {
          animation: fadeUp .5s .26s ease both;
          font-size: clamp(34px, 7vw, 72px);
          font-weight: 800;
          letter-spacing: -.03em;
          line-height: .94;
          margin-bottom: 22px;
        }

        .spk-title-dark { color: var(--negro-texto); }
        .spk-title-blue { color: var(--azul); }

        .spk-divider {
          animation: fadeUp .5s .32s ease both;
          background: linear-gradient(90deg, var(--azul), var(--azul-mid));
          border-radius: 2px;
          height: 3px;
          margin: 0 auto 22px;
          width: 48px;
        }

        .spk-hero-desc {
          animation: fadeUp .5s .38s ease both;
          color: var(--gris-texto);
          font-size: 15.5px;
          line-height: 1.8;
          margin: 0 auto;
          max-width: 540px;
        }

        .spk-hero-desc strong {
          color: var(--negro-texto);
          font-weight: 600;
        }

        .spk-stats {
          align-items: stretch;
          animation: fadeUp .5s .46s ease both;
          background: var(--blanco);
          border: 1.5px solid var(--gris-borde);
          border-radius: 10px;
          box-shadow: 0 2px 12px rgba(0,0,0,.06);
          display: flex;
          margin-top: 28px;
          overflow: hidden;
        }

        .spk-stat {
          border-right: 1px solid var(--gris-borde);
          cursor: default;
          padding: 13px 22px;
          text-align: center;
          transition: background .15s;
        }

        .spk-stat:last-child { border-right: none; }
        .spk-stat:hover { background: var(--azul-light); }
        .spk-stat.stat-red:hover { background: var(--rojo-bg); }

        .spk-stat-num {
          color: var(--azul);
          font-size: 19px;
          font-weight: 700;
          letter-spacing: -.02em;
          line-height: 1.1;
        }

        .spk-stat.stat-red .spk-stat-num { color: var(--rojo-mid); }

        .spk-stat-lbl {
          color: var(--gris-texto);
          font-size: 10px;
          font-weight: 500;
          letter-spacing: .06em;
          margin-top: 3px;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .spk-scroll-hint {
          align-items: center;
          animation: fadeUp .5s .55s ease both;
          bottom: 24px;
          color: var(--gris-borde);
          display: flex;
          flex-direction: column;
          font-size: 10px;
          gap: 5px;
          left: 50%;
          letter-spacing: .1em;
          position: absolute;
          text-transform: uppercase;
          transform: translateX(-50%);
        }

        .spk-scroll-line {
          animation: scrollPulse 2s infinite;
          background: linear-gradient(to bottom, transparent, var(--azul-mid));
          height: 26px;
          width: 1px;
        }

        @media (max-width: 1100px) {
          .spk-chips-area { display: none; }
        }

        @media (max-width: 768px) {
          .spk-hero {
            justify-content: flex-start;
            min-height: auto;
            padding: 28px 16px 64px;
          }

          .spk-hero-showcase {
            border-radius: 12px;
            width: 100%;
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

          .spk-divider { margin-bottom: 18px; }
          .spk-hero-desc { max-width: 92%; }
          .spk-stats { flex-wrap: wrap; }

          .spk-stat {
            border-bottom: 1px solid var(--gris-borde);
            flex: 1 1 calc(50% - 1px);
          }

          .spk-stat:nth-child(2) { border-right: none; }
          .spk-stat:nth-child(3),
          .spk-stat:nth-child(4) { border-bottom: none; }
        }

        @media (max-width: 520px) {
          .spk-hero { padding: 22px 12px 56px; }

          .spk-badge {
            font-size: 10px;
            margin-bottom: 16px;
            padding-inline: 12px;
          }

          .spk-hero-desc {
            font-size: 14px;
            line-height: 1.65;
          }

          .spk-hero-institutional {
            min-height: calc(100svh - var(--nav-height, 60px) - 76px);
            padding: 16px 0 26px;
          }

          .spk-stats {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            margin-top: 24px;
            width: min(100%, 340px);
          }

          .spk-stat {
            border-bottom: 1px solid var(--gris-borde);
            border-right: 1px solid var(--gris-borde) !important;
          }

          .spk-stat:nth-child(2n) {
            border-right: none !important;
          }

          .spk-stat:nth-last-child(-n + 2) {
            border-bottom: none;
          }
        }
      `}</style>

      <section className="spk-hero" ref={heroRef}>
        <div className="spk-hero-grid" />
        <div className="spk-blob spk-blob-right" />
        <div className="spk-blob spk-blob-left" />
        <div className="spk-blob spk-blob-red" />
        <div className="spk-deco-line" />

        <div className="spk-chips-area" aria-hidden="true">
          {CHIPS_TOP.map((chip, index) => renderChip(chip, `ct-${index}`, `top-${chip.text}`))}
          {CHIPS_LEFT.map((chip, index) => renderChip(chip, `cl-${index}`, `left-${chip.text}`))}
          {CHIPS_RIGHT.map((chip, index) => renderChip(chip, `cr-${index}`, `right-${chip.text}`))}
          {CHIPS_CORNER.map((chip, index) => renderChip(chip, `cc-${index}`, `corner-${chip.text}`))}
        </div>

        <div className="spk-hero-showcase">
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
        </div>

        <div className="spk-scroll-hint" aria-hidden="true">
          <span>{t('hero.scroll')}</span>
          <div className="spk-scroll-line" />
        </div>
      </section>
    </>
  );
}
