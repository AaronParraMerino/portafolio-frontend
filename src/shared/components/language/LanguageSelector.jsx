// src/shared/components/language/LanguageSelector.jsx

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../../../core/i18n';

const LANGUAGE_ORDER = {
  es: ['es', 'en', 'pt'],
  en: ['en', 'pt', 'es'],
  pt: ['pt', 'es', 'en'],
};

const LANGUAGE_LABELS = {
  es: {
    es: 'Español',
    en: 'English',
    pt: 'Português',
  },
  en: {
    en: 'English',
    pt: 'Portuguese',
    es: 'Spanish',
  },
  pt: {
    pt: 'Português',
    es: 'Espanhol',
    en: 'Inglês',
  },
};

export default function LanguageSelector({ mobile = false }) {
  const { language, languages, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const selectorRef = useRef(null);

  const current = languages.find((item) => item.code === language) || languages[0];

  const orderedLanguages = useMemo(() => {
    const order = LANGUAGE_ORDER[language] || LANGUAGE_ORDER.es;
    const languageMap = languages.reduce((acc, item) => {
      acc[item.code] = item;
      return acc;
    }, {});

    return order
      .map((code) => languageMap[code])
      .filter(Boolean);
  }, [language, languages]);

  const getLanguageLabel = (code) => {
    return LANGUAGE_LABELS[language]?.[code] || languages.find((item) => item.code === code)?.label || code;
  };

  useEffect(() => {
    const handleClick = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, []);

  const handleSelect = (code) => {
    setLanguage(code);
    setOpen(false);
  };

  return (
    <div
      className={`spk-lang-selector${mobile ? ' mobile' : ''}${open ? ' open' : ''}`}
      ref={selectorRef}
    >
      <style>{`
        .spk-lang-selector {
          position: relative;
          flex-shrink: 0;
        }

        .spk-lang-btn {
          height: 34px;
          min-width: 58px;
          border-radius: 7px;
          border: 1px solid rgba(255, 255, 255, .18);
          background: rgba(255, 255, 255, .08);
          color: rgba(255, 255, 255, .9);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .04em;
          transition: background .15s, border-color .15s, transform .15s, box-shadow .15s;
        }

        .spk-lang-btn:hover,
        .spk-lang-selector.open .spk-lang-btn {
          background: rgba(255, 255, 255, .18);
          border-color: rgba(255, 255, 255, .35);
          color: #ffffff;
          transform: translateY(-1px);
          box-shadow: 0 8px 18px rgba(0, 0, 0, .12);
        }

        .spk-lang-btn:focus-visible {
          outline: 2px solid rgba(255, 255, 255, .9);
          outline-offset: 3px;
        }

        .spk-lang-chevron {
          width: 10px;
          height: 10px;
          stroke: currentColor;
          fill: none;
          stroke-width: 2;
          transition: transform .18s;
        }

        .spk-lang-selector.open .spk-lang-chevron {
          transform: rotate(180deg);
        }

        .spk-lang-menu {
          position: absolute;
          top: calc(100% + 9px);
          right: 0;
          width: 205px;
          padding: 7px;
          background: #ffffff;
          border: 1.5px solid #d1d5db;
          border-radius: 10px;
          box-shadow: 0 12px 36px rgba(0, 0, 0, .14);
          z-index: 360;
          animation: spkLangFade .18s ease both;
        }

        .spk-lang-option {
          width: 100%;
          border: none;
          background: transparent;
          border-radius: 7px;
          padding: 8px 9px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #374151;
          cursor: pointer;
          font-size: 13px;
          font-weight: 650;
          text-align: left;
        }

        .spk-lang-option:hover {
          background: #f0ede8;
          color: #111827;
        }

        .spk-lang-option:focus-visible {
          outline: 2px solid #0077b7;
          outline-offset: 2px;
        }

        .spk-lang-option.active {
          background: #e8f4fb;
          color: #0077b7;
        }

        .spk-lang-option-main {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .spk-lang-short {
          font-family: var(--mono, monospace);
          font-size: 10px;
          color: #6b7280;
          font-weight: 800;
        }

        .spk-flag {
          width: 20px;
          height: 14px;
          display: inline-block;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
          border-radius: 3px;
          border: 1px solid rgba(17, 24, 39, .18);
          box-shadow: 0 1px 2px rgba(0, 0, 0, .12);
        }

        .spk-flag.es {
          background: linear-gradient(
            to bottom,
            #aa151b 0%,
            #aa151b 25%,
            #f1bf00 25%,
            #f1bf00 75%,
            #aa151b 75%,
            #aa151b 100%
          );
        }

        .spk-flag.en {
          background: repeating-linear-gradient(
            to bottom,
            #b22234 0,
            #b22234 1.08px,
            #ffffff 1.08px,
            #ffffff 2.16px
          );
        }

        .spk-flag.en::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 8.8px;
          height: 7.6px;
          background: #3c3b6e;
        }

        .spk-flag.pt {
          background: #009b3a;
        }

        .spk-flag.pt::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 10px;
          height: 10px;
          background: #ffdf00;
          transform: translate(-50%, -50%) rotate(45deg);
        }

        .spk-flag.pt::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 5.6px;
          height: 5.6px;
          border-radius: 999px;
          background: #002776;
          transform: translate(-50%, -50%);
        }

        .spk-lang-selector.mobile {
          width: 100%;
        }

        .spk-lang-selector.mobile .spk-lang-btn {
          width: 100%;
          justify-content: center;
          height: 38px;
        }

        .spk-lang-selector.mobile .spk-lang-menu {
          position: static;
          width: 100%;
          margin-top: 8px;
          box-shadow: none;
        }

        @keyframes spkLangFade {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <button
        type="button"
        className="spk-lang-btn"
        onClick={() => setOpen((value) => !value)}
        aria-label={t('language.label')}
        title={t('language.label')}
      >
        <span className={`spk-flag ${current.code}`} aria-hidden="true" />
        {current.shortLabel}
        <svg className="spk-lang-chevron" viewBox="0 0 10 6" aria-hidden="true">
          <path d="M1 1l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <div className="spk-lang-menu" role="menu">
          {orderedLanguages.map((item) => (
            <button
              key={item.code}
              type="button"
              role="menuitem"
              className={`spk-lang-option${item.code === language ? ' active' : ''}`}
              onClick={() => handleSelect(item.code)}
            >
              <span className="spk-lang-option-main">
                <span className={`spk-flag ${item.code}`} aria-hidden="true" />
                <span>{getLanguageLabel(item.code)}</span>
              </span>
              <span className="spk-lang-short">{item.shortLabel}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}