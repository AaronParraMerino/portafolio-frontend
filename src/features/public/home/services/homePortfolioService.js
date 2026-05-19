import { get } from '../../../../services/http/Service';
import {
  publicCacheKey,
  readPublicCache,
  withPublicCache,
} from '../../services/publicCache';

const FEATURED_TTL_MS = 2 * 60 * 1000;

function featuredCacheKey(search = '') {
  return publicCacheKey('home:featured', {
    limit: 6,
    q: String(search || '').trim(),
  });
}

export const getCachedFeaturedPortfolios = (search = '') => (
  readPublicCache(featuredCacheKey(search), { ttlMs: FEATURED_TTL_MS }) || null
);

export const getFeaturedPortfolios = async (search = '', { force = false } = {}) => {
  const params = new URLSearchParams({ limit: '6' });
  const term = String(search || '').trim();

  if (term) {
    params.set('q', term);
  }

  return withPublicCache(
    featuredCacheKey(search),
    async () => {
      const response = await get(`/home/portafolios-destacados?${params.toString()}`);
      return response?.data ?? {};
    },
    { force, ttlMs: FEATURED_TTL_MS },
  );
};
