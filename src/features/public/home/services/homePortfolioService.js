import { get } from '../../../../services/http/Service';

export const getFeaturedPortfolios = async () => {
  const response = await get('/home/portafolios-destacados?limit=6');
  return response?.data ?? {};
};
