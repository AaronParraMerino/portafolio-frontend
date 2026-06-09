import { fireEvent, render, screen } from '@testing-library/react';
import RecentProjectsCarousel from './RecentProjectsCarousel';

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
}), { virtual: true });

jest.mock('../../../../../core/i18n', () => ({
  useLanguage: () => ({
    language: 'es',
    t: (key) => key,
  }),
}));

const projects = Array.from({ length: 4 }, (_, index) => ({
  id: index + 1,
  title: `Proyecto ${index + 1}`,
  description: `Descripcion ${index + 1}`,
  type: 'educativo',
  platform: index < 2 ? 'web' : 'movil',
  publishedAt: '2026-06-08T10:00:00Z',
  technologies: [{
    id_tecnologia: index + 1,
    nombre: 'React',
    color: '#61dafb',
    icono_url: 'https://example.com/react.svg',
  }],
}));

test('renderiza tarjetas y desplaza el carrusel con sus controles', () => {
  const scrollBy = jest.fn();
  Element.prototype.scrollBy = scrollBy;

  render(<RecentProjectsCarousel projects={projects} />);

  expect(screen.getAllByRole('heading', { name: /Proyecto/ })).toHaveLength(4);
  expect(screen.getAllByText('React')).toHaveLength(4);
  expect(screen.getByRole('link', { name: 'home.projects.all' })).toHaveAttribute('href', '/proyectos');

  fireEvent.click(screen.getByRole('button', { name: 'home.projects.nextList' }));
  expect(scrollBy).toHaveBeenCalled();
});

test('filtra las tarjetas por la plataforma seleccionada', () => {
  Element.prototype.scrollTo = jest.fn();
  render(<RecentProjectsCarousel projects={projects} />);

  fireEvent.click(screen.getByRole('button', { name: /projects.platform.movil/i }));

  expect(screen.queryByRole('heading', { name: 'Proyecto 1' })).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Proyecto 3' })).toBeInTheDocument();
  expect(screen.getAllByRole('heading', { name: /Proyecto/ })).toHaveLength(2);
});
