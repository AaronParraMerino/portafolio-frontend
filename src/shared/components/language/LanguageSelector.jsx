import { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../../../core/i18n';

const LANGUAGE_ICONS = {
  es: '🇪🇸',
  en: '🇺🇸',
  pt: '🇵🇹',
};

export default function LanguageSelector({ mobile = false }) {
  const { language, languages, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const selectorRef = useRef(null);
  const current = languages.find((item) => item.code === language) || languages[0];
  const orderedLanguages = useMemo(() => {
    const selected = languages.find((item) => item.code === language);
    const rest = languages.filter((item) => item.code !== language);
    return selected ? [selected, ...rest] : languages;
  }, [language, languages]);

  useEffect(() => {
    const handleClick = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (code) => {
    setLanguage(code);
    setOpen(false);
  };

  return (
    <div className={`spk-lang-selector${mobile ? ' mobile' : ''}${open ? ' open' : ''}`} ref={selectorRef}>
      <style>{`
        .spk-lang-selector { position: relative; flex-shrink: 0; }
        .spk-lang-btn {
          height: 34px; min-width: 46px; border-radius: 7px;
          border: 1px solid rgba(255,255,255,.18); background: rgba(255,255,255,.08);
          color: rgba(255,255,255,.9); display: inline-flex; align-items: center; justify-content: center;
          gap: 5px; cursor: pointer; font-size: 12px; font-weight: 800; letter-spacing: .04em;
          transition: background .15s, border-color .15s, transform .15s;
        }
        .spk-lang-btn:hover,
        .spk-lang-selector.open .spk-lang-btn {
          background: rgba(255,255,255,.18); border-color: rgba(255,255,255,.35); color: #ffffff;
          transform: translateY(-1px);
        }
        .spk-lang-icon { font-size: 14px; line-height: 1; }
        .spk-lang-chevron { width: 10px; height: 10px; stroke: currentColor; fill: none; stroke-width: 2; transition: transform .18s; }
        .spk-lang-selector.open .spk-lang-chevron { transform: rotate(180deg); }
        .spk-lang-menu {
          position: absolute; top: calc(100% + 9px); right: 0; width: 188px; padding: 7px;
          background: #ffffff; border: 1.5px solid #d1d5db; border-radius: 10px;
          box-shadow: 0 12px 36px rgba(0,0,0,.14); z-index: 360; animation: spkLangFade .18s ease both;
        }
        .spk-lang-option {
          width: 100%; border: none; background: transparent; border-radius: 7px;
          padding: 8px 9px; display: flex; align-items: center; justify-content: space-between;
          color: #374151; cursor: pointer; font-size: 13px; font-weight: 650; text-align: left;
        }
        .spk-lang-option:hover { background: #f0ede8; color: #111827; }
        .spk-lang-option.active { background: #e8f4fb; color: #0077b7; }
        .spk-lang-option-main { display: inline-flex; align-items: center; gap: 8px; }
        .spk-lang-short {
          font-family: var(--mono, monospace); font-size: 10px; color: #6b7280; font-weight: 800;
        }
        .spk-lang-selector.mobile { width: 100%; }
        .spk-lang-selector.mobile .spk-lang-btn {
          width: 100%; justify-content: center; height: 38px;
        }
        .spk-lang-selector.mobile .spk-lang-menu {
          position: static; width: 100%; margin-top: 8px; box-shadow: none;
        }
        @keyframes spkLangFade { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <button
        type="button"
        className="spk-lang-btn"
        onClick={() => setOpen((value) => !value)}
        aria-label={t('language.label')}
        title={t('language.label')}
      >
        <span className="spk-lang-icon" aria-hidden="true">{LANGUAGE_ICONS[current.code]}</span>
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
                <span aria-hidden="true">{LANGUAGE_ICONS[item.code]}</span>
                <span>{item.label}</span>
              </span>
              <span className="spk-lang-short">{item.shortLabel}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
