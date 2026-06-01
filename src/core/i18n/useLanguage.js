import { useContext } from 'react';
import { LanguageContext } from './LanguageProvider';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, translations } from './translations';

function fallbackTranslate(key, params = {}) {
  const text = translations[DEFAULT_LANGUAGE]?.[key] ?? key;
  return Object.entries(params).reduce(
    (result, [paramKey, value]) => result.replaceAll(`{${paramKey}}`, String(value)),
    text,
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    return {
      language: DEFAULT_LANGUAGE,
      languages: SUPPORTED_LANGUAGES,
      setLanguage: () => {},
      t: fallbackTranslate,
    };
  }

  return context;
}
