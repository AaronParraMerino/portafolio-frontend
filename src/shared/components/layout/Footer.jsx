import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaDiscord, FaEnvelope, FaGitlab, FaGithub } from 'react-icons/fa';
import { useLanguage } from '../../../core/i18n';
import PoliticaCookies from '../../../features/auth/components/PoliticasC';
import PoliticaPrivacidad from '../../../features/auth/components/PoliticasP';
import { getStoredUser, isAdminUser } from '../../utils/authStorage';

const FOOTER_LINKS = [
  {
    titleKey: 'footer.platform.title',
    links: [
      { labelKey: 'footer.platform.exploreDevelopers', href: '/desarrolladores' },
      { labelKey: 'footer.platform.exploreProjects', href: '/proyectos' },
      { labelKey: 'footer.platform.exploreEvents', href: '/eventos' },
    ],
  },
  {
    titleKey: 'footer.developers.title',
    links: [
      { labelKey: 'footer.developers.createPortfolio', href: '/dashboard', protected: true },
      { labelKey: 'footer.developers.myProfile', href: '/dashboard/profile', protected: true },
      { labelKey: 'footer.developers.myProjects', href: '/dashboard/projects', protected: true },
    ],
  },
  {
    titleKey: 'footer.legal.title',
    links: [
      { labelKey: 'footer.legal.terms', action: 'terms' },
      { labelKey: 'footer.legal.privacy', action: 'privacy' },
    ],
  },
];

const SOCIALS = [
  {
    label: 'GitHub',
    href: 'https://github.com/sparkyhubteam-dev',
    icon: <FaGithub size={16} />,
  },
  {
    label: 'Gmail',
    href: 'mailto:sparkyhub.team@gmail.com',
    icon: <FaEnvelope size={15} />,
  },
  {
    label: 'Discord',
    href: '#',
    icon: <FaDiscord size={16} />,
  },
  {
    label: 'GitLab',
    href: 'https://gitlab.com/sparkyhub.team',
    icon: <FaGitlab size={16} />,
  },
];

export default function Footer({ isBackendAvailable = true }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [legalModal, setLegalModal] = useState(null);
  const user = getStoredUser();
  const isAdmin = isAdminUser(user);

  const footerLinks = useMemo(() => ([
    FOOTER_LINKS[0],
    {
      titleKey: isAdmin ? 'footer.admin.title' : 'footer.developers.title',
      links: isAdmin
        ? [
          { labelKey: 'footer.admin.manageSystem', href: '/admin' },
          { labelKey: 'footer.admin.manageUsers', href: '/admin/users' },
          { labelKey: 'footer.admin.manageEvents', href: '/admin/events' },
        ]
        : FOOTER_LINKS[1].links,
    },
    FOOTER_LINKS[2],
  ]), [isAdmin]);

  const navigateFromFooter = (href) => {
    navigate(href);
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  };

  const goToProtected = (href) => {
    if (user) {
      navigateFromFooter(href);
      return;
    }

    navigateFromFooter('/auth/login');
  };

  const handleFooterLink = (event, link) => {
    event.preventDefault();

    if (link.action === 'privacy') {
      setLegalModal('privacy');
      return;
    }

    if (link.action === 'terms') {
      setLegalModal('terms');
      return;
    }

    if (link.protected) {
      goToProtected(link.href);
      return;
    }

    navigateFromFooter(link.href);
  };

  const platformStatusClass = isBackendAvailable
    ? 'spk-footer-active spk-footer-active-online'
    : 'spk-footer-active spk-footer-active-offline';

  const platformStatusText = isBackendAvailable
    ? t('footer.status.online')
    : t('footer.status.offline');

  return (
    <>
      <style>{`
        /* ══════════════════════════════════════
           FOOTER — dark, rich, coherente con el
           sistema de diseño CreaFolio / UMSS
        ══════════════════════════════════════ */

        .spk-footer {
          position: relative;
          z-index: 180;
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
        .spk-footer-social svg {
          display: block;
          flex-shrink: 0;
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
        .spk-footer-col-links a,
        .spk-footer-col-links button {
          font-size: 12.5px;
          color: rgba(255,255,255,.38);
          text-decoration: none;
          padding: 5px 8px;
          border-radius: 5px;
          transition: all .12s;
          display: flex; align-items: center; gap: 6px;
          border: 0;
          background: transparent;
          font-family: var(--font);
          cursor: pointer;
          text-align: left;
        }
        .spk-footer-col-links a::before,
        .spk-footer-col-links button::before {
          content: '';
          width: 3px; height: 3px; border-radius: 50%;
          background: rgba(255,255,255,.15);
          flex-shrink: 0;
          transition: background .12s;
        }
        .spk-footer-col-links a:hover,
        .spk-footer-col-links button:hover {
          color: rgba(255,255,255,.82);
          background: rgba(255,255,255,.05);
        }
        .spk-footer-col-links a:hover::before,
        .spk-footer-col-links button:hover::before {
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
          border-radius: 20px;
          padding: 3px 10px;
          font-size: 10px; font-weight: 600;
          letter-spacing: .05em; text-transform: uppercase;
        }
        .spk-footer-active-online {
          background: rgba(16,185,129,.1);
          border: 1px solid rgba(16,185,129,.22);
          color: #34d399;
        }
        .spk-footer-active-offline {
          background: rgba(239,68,68,.12);
          border: 1px solid rgba(239,68,68,.25);
          color: #f87171;
        }
        .spk-footer-active-dot {
          width: 5px; height: 5px; border-radius: 50%;
          animation: fPulse 2s ease infinite;
        }
        .spk-footer-active-online .spk-footer-active-dot {
          background: #34d399;
        }
        .spk-footer-active-offline .spk-footer-active-dot {
          background: #f87171;
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
            <div className="spk-footer-cta-label">{t('footer.cta.label')}</div>
            <div className="spk-footer-cta-title">
              {t('footer.cta.titleLine1')}<br />{t('footer.cta.titleLine2')} <span>{t('footer.cta.titleHighlight')}</span>
            </div>
          </div>
        </div>

        {/* ── MAIN GRID ── */}
        <div className="spk-footer-main">

          {/* BRAND */}
          <div className="spk-footer-brand-col">
            <div className="spk-footer-logo-row">
              <a href="/" className="spk-footer-logo-link" aria-label="CreaFolio">
                <img
                  src="/img/logoFooterCreaFolio.png"
                  width="140" height="30"
                  alt="CreaFolio"
                  className="spk-footer-logo-img"
                />
              </a>
            </div>

            <div className="spk-footer-umss">
              <div className="spk-footer-umss-dot" />
              <span>UMSS · Cochabamba, Bolivia</span>
            </div>

            <p className="spk-footer-desc">
              {t('footer.description')}
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
          {footerLinks.map(({ titleKey, links }) => (
            <div key={titleKey}>
              <div className="spk-footer-col-title">{t(titleKey)}</div>
              <div className="spk-footer-col-links">
                {links.map((link) => (
                  <button
                    key={link.labelKey}
                    type="button"
                    onClick={(event) => handleFooterLink(event, link)}
                  >
                    {t(link.labelKey)}
                  </button>
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
            <div className={platformStatusClass}>
              <div className="spk-footer-active-dot" />
              {platformStatusText}
            </div>
            <span className="spk-footer-version">v1.0.0 · 2026</span>
          </div>

          <div className="spk-footer-copy">
            <div className="spk-footer-copy-bar" />
            <strong>© 2026 CreaFolio</strong>
            <span>· {t('footer.rights')}</span>
          </div>
        </div>
      </footer>

      {legalModal === 'privacy' && (
        <PoliticaPrivacidad onClose={() => setLegalModal(null)} />
      )}

      {legalModal === 'terms' && (
        <PoliticaCookies onClose={() => setLegalModal(null)} />
      )}
    </>
  );
}
