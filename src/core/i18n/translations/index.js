import { commonTranslations } from './common';
import { navTranslations } from './nav';
import { homeTranslations } from './home';
import { footerTranslations } from './footer';
import { bannerTranslations } from './banner';
import { authTranslations } from './auth';
import { dashboardTranslations } from './dashboard';
import { calendarTranslations } from './calendar';
import { skillsTranslations } from './skills';
import { portfolioSearchTranslations } from './portfolioSearch';
import { profileTranslations } from './profile';
import { configurateTranslations } from './configurate';

export const SUPPORTED_LANGUAGES = [
  { code: 'es', label: 'Español', shortLabel: 'ES' },
  { code: 'en', label: 'English', shortLabel: 'EN' },
  { code: 'pt', label: 'Português', shortLabel: 'PT' },
];

export const DEFAULT_LANGUAGE = 'es';

const translationModules = [
  commonTranslations,
  navTranslations,
  homeTranslations,
  footerTranslations,
  bannerTranslations,
  authTranslations,
  dashboardTranslations,
  calendarTranslations,
  skillsTranslations,
  portfolioSearchTranslations,
  profileTranslations,
  configurateTranslations,
];

const createEmptyTranslations = () => (
  SUPPORTED_LANGUAGES.reduce((acc, language) => {
    acc[language.code] = {};
    return acc;
  }, {})
);

export const translations = translationModules.reduce((acc, moduleTranslations) => {
  SUPPORTED_LANGUAGES.forEach((language) => {
    const code = language.code;
    acc[code] = {
      ...acc[code],
      ...(moduleTranslations[code] || {}),
    };
  });

  return acc;
}, createEmptyTranslations());

const fillMissingTranslations = () => {
  const defaultDictionary = translations[DEFAULT_LANGUAGE] || {};

  SUPPORTED_LANGUAGES.forEach((language) => {
    translations[language.code] = {
      ...defaultDictionary,
      ...(translations[language.code] || {}),
    };
  });
};

fillMissingTranslations();
