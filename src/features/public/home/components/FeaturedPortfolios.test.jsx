import { render, screen } from '@testing-library/react';
import FeaturedPortfolios from './FeaturedPortfolios';

jest.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}), { virtual: true });

jest.mock('../hooks/useFeaturedPortfolios', () => ({
  __esModule: true,
  default: () => ({
    sections: {
      ultimas_actualizaciones: [],
      mas_proyectos: [],
      mas_experiencia: [],
      mas_habilidades: [],
      resultados_busqueda: [],
      meta: {},
    },
    loading: false,
    error: '',
  }),
}));

test('renderiza la seccion de portafolios destacados de HU09', () => {
  render(<FeaturedPortfolios />);

  expect(screen.getByRole('heading', { name: /portafolios destacados/i })).toBeInTheDocument();
});
