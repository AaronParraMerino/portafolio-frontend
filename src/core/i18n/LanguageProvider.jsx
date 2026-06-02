import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, translations } from './translations';
import {
  getLanguagePreference,
  getStoredLanguage,
  LANGUAGE_STORAGE_KEY,
  normalizeLanguage,
  saveStoredLanguage,
  updateLanguagePreference,
} from './languagePreferenceService';

export const LanguageContext = createContext(null);

function interpolate(text, params = {}) {
  return Object.entries(params).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    text,
  );
}

export default function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getStoredLanguage);
  const [syncError, setSyncError] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    saveStoredLanguage(language);
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    let active = true;

    getLanguagePreference()
      .then((backendLanguage) => {
        if (!active) return;
        setLanguageState(normalizeLanguage(backendLanguage));
        setSyncError(null);
      })
      .catch((error) => {
        if (!active) return;
        setSyncError(error.message);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleStorage = (event) => {
      if (event.key === LANGUAGE_STORAGE_KEY) {
        setLanguageState(normalizeLanguage(event.newValue));
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setLanguage = useCallback((nextLanguage) => {
    const normalized = normalizeLanguage(nextLanguage);
    setLanguageState(normalized);
    saveStoredLanguage(normalized);

    updateLanguagePreference(normalized)
      .then(() => setSyncError(null))
      .catch((error) => setSyncError(error.message));
  }, []);

  const value = useMemo(() => {
    const t = (key, params) => {
      const dictionary = translations[language] || translations[DEFAULT_LANGUAGE];
      const fallback = translations[DEFAULT_LANGUAGE] || {};
      const text = dictionary[key] ?? fallback[key] ?? key;
      return interpolate(text, params);
    };

    return {
      language,
      languages: SUPPORTED_LANGUAGES,
      setLanguage,
      syncError,
      t,
    };
  }, [language, setLanguage, syncError]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
