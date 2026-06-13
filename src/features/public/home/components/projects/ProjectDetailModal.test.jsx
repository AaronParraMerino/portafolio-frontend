import { fireEvent, render, screen } from '@testing-library/react';
import ProjectDetailModal from './ProjectDetailModal';

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
}), { virtual: true });

jest.mock('../../../../../core/i18n', () => ({
  useLanguage: () => ({ t: (key) => key }),
}));

const project = {
  id: 1,
  titulo: 'Proyecto completo',
  descripcion: 'Descripcion completa',
  tipo: 'educativo',
  desarrollado_para: 'web',
  estado_desarrollo: 'en_desarrollo',
  origen: 'github',
  evidencias: [
    { id_evidencia: 1, titulo: 'Captura', tipo: 'imagen', url: 'https://example.com/image.jpg' },
    { id_evidencia: 2, titulo: 'Demo', tipo: 'video', url: 'https://youtube.com/watch?v=abc123' },
  ],
  tecnologias: [{ id_tecnologia: 1, nombre: 'React', version_usada: '18', porcentaje_uso: 70 }],
  repositorios: [{ id_proyecto_repositorio: 1, nombre: 'frontend', proveedor: 'github', stars_count: 4 }],
  participantes: [{ id_participacion: 1, id_usuario: 10, nombre: 'Ada Lovelace', rol: 'Backend', vinculado_repositorio: true }],
  participantes_count: 1,
};

test('muestra el detalle completo y permite cerrar con Escape', () => {
  const onClose = jest.fn();
  render(<ProjectDetailModal project={project} onClose={onClose} />);

  expect(screen.getByRole('heading', { name: 'Proyecto completo' })).toBeInTheDocument();
  expect(screen.getByText('React')).toBeInTheDocument();
  expect(screen.getByText('frontend')).toBeInTheDocument();
  expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'home.projects.detail.viewPortfolio' })).toHaveAttribute('href', '/portafolio/10');
  expect(screen.getByRole('link', { name: 'home.projects.detail.viewPortfolio' })).toHaveClass('is-repository-linked');

  fireEvent.keyDown(window, { key: 'Escape' });
  expect(onClose).toHaveBeenCalled();
});

test('no falla cuando el modal esta cerrado sin proyecto', () => {
  const { container } = render(<ProjectDetailModal project={null} onClose={jest.fn()} />);

  expect(container).toBeEmptyDOMElement();
});

test('muestra miniatura de YouTube y el estado de carga', () => {
  const { container } = render(<ProjectDetailModal project={project} loading onClose={jest.fn()} />);

  expect(screen.getByRole('status')).toHaveTextContent('home.projects.detail.loading');
  expect(container.querySelector('img[src="https://i.ytimg.com/vi/abc123/mqdefault.jpg"]')).toBeInTheDocument();
});

test('amplia una imagen sin cerrar el detalle', () => {
  const onClose = jest.fn();
  render(<ProjectDetailModal project={project} onClose={onClose} />);

  fireEvent.click(screen.getByRole('button', { name: 'Ampliar imagen del proyecto' }));
  expect(screen.getByRole('dialog', { name: 'Imagen ampliada: Captura' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Cerrar imagen ampliada' }));
  expect(screen.queryByRole('dialog', { name: 'Imagen ampliada: Captura' })).not.toBeInTheDocument();
  expect(onClose).not.toHaveBeenCalled();
});

test('muestra el demo junto al titulo solo cuando existe y no lo repite abajo', () => {
  const projectWithDemo = {
    ...project,
    evidencias: [
      ...project.evidencias,
      { id_evidencia: 3, titulo: 'Demo', tipo: 'demo', url: 'https://example.com/demo' },
    ],
  };

  const { rerender } = render(<ProjectDetailModal project={projectWithDemo} onClose={jest.fn()} />);
  expect(screen.getByRole('link', { name: 'Demo' })).toHaveAttribute('href', 'https://example.com/demo');
  expect(screen.queryByText('home.projects.detail.links')).not.toBeInTheDocument();

  rerender(<ProjectDetailModal project={project} onClose={jest.fn()} />);
  expect(screen.queryByRole('link', { name: 'Demo' })).not.toBeInTheDocument();
});
