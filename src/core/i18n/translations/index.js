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
import { projectsTranslations } from './projects';
import { experienceTranslations } from './experience';
import { viewTranslations } from './view';
import { linksTranslations } from './links';
import { adminEventsTranslations } from './adminEvents';
import { adminUsersTranslations } from './adminUsers';

export const SUPPORTED_LANGUAGES = [
  { code: 'es', label: 'Español', shortLabel: 'ES', flag: '🇧🇴' },
  { code: 'en', label: 'English', shortLabel: 'EN', flag: '🇺🇸' },
  { code: 'pt', label: 'Português', shortLabel: 'PT', flag: '🇧🇷' },
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
  projectsTranslations,
  experienceTranslations,
  viewTranslations,
  linksTranslations,
  adminEventsTranslations,
  adminUsersTranslations,
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
