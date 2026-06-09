import { act, render, screen } from '@testing-library/react';
import RecentProjectsHero from './RecentProjectsHero';

jest.mock('../../../../../core/i18n', () => ({
  useLanguage: () => ({
    language: 'es',
    t: (key) => key,
  }),
}));

const projects = [
  {
    id: 1,
    title: 'Proyecto uno',
    description: 'Descripcion uno',
    type: 'educativo',
    platform: 'web',
    publishedAt: '2026-06-08T10:00:00Z',
    technologies: [{
      id_tecnologia: 1,
      nombre: 'React',
      color: '#61dafb',
      icono_url: 'https://example.com/react.svg',
    }],
  },
  {
    id: 2,
    title: 'Proyecto dos',
    description: 'Descripcion dos',
    type: 'portafolio',
    platform: 'movil',
    publishedAt: '2026-06-07T10:00:00Z',
    technologies: [],
  },
];

test('rota los proyectos recientes cada seis segundos', () => {
  jest.useFakeTimers();
  render(<RecentProjectsHero projects={projects} />);

  expect(screen.getByRole('heading', { name: 'Proyecto uno' })).toBeInTheDocument();

  act(() => {
    jest.advanceTimersByTime(6000);
  });

  expect(screen.getByRole('heading', { name: 'Proyecto dos' })).toBeInTheDocument();
  jest.useRealTimers();
});

test('muestra el logo de la tecnologia y admite hasta seis proyectos', () => {
  const sixProjects = Array.from({ length: 6 }, (_, index) => ({
    ...projects[index % projects.length],
    id: index + 1,
    title: `Proyecto ${index + 1}`,
  }));

  const { container } = render(<RecentProjectsHero projects={sixProjects} />);

  expect(container.querySelector('.prh-tech-icon img')).toHaveAttribute('src', 'https://example.com/react.svg');
  expect(screen.getAllByRole('button', { name: 'home.projects.showAria' })).toHaveLength(6);
  expect(screen.queryByRole('heading', { name: 'Proyectos recientes' })).not.toBeInTheDocument();
});
