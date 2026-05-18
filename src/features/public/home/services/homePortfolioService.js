import { get } from '../../../../services/http/Service';

export const getFeaturedPortfolios = async (search = '') => {
  const params = new URLSearchParams({ limit: '6' });
  const term = String(search || '').trim();

  if (term) {
    params.set('q', term);
  }

  const response = await get(`/home/portafolios-destacados?${params.toString()}`);
  return response?.data ?? {};
};
