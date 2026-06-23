import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'http://sparky.tis.cs.umss.edu.bo';
const SITE_TITLE = 'CreaFolio | Portafolios digitales y proyectos UMSS';
const SITE_DESCRIPTION = 'CreaFolio reune portafolios digitales, proyectos de software, repositorios, evidencias, habilidades, desarrolladores y eventos UMSS para mostrar experiencia, descubrir talento y colaborar.';
const INDEX_ROBOTS = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, value);
  });
}

function upsertCanonical(url) {
  let element = document.head.querySelector('link[rel="canonical"]');

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }

  element.setAttribute('href', url);
}

export default function SeoHead() {
  const { pathname } = useLocation();

  useEffect(() => {
    const canonicalUrl = `${SITE_URL}${pathname === '/' ? '/' : pathname}`;

    document.title = SITE_TITLE;
    upsertMeta('meta[name="description"]', { name: 'description', content: SITE_DESCRIPTION });
    upsertMeta('meta[name="robots"]', { name: 'robots', content: INDEX_ROBOTS });
    upsertMeta('meta[name="googlebot"]', { name: 'googlebot', content: INDEX_ROBOTS });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: SITE_TITLE });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: SITE_DESCRIPTION });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: SITE_TITLE });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: SITE_DESCRIPTION });
    upsertCanonical(canonicalUrl);
  }, [pathname]);

  return null;
}
