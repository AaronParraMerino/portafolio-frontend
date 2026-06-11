import { fireEvent, render, screen } from '@testing-library/react';
import DashboardLayout from './DashboardLayout';

const mockAction = jest.fn();

jest.mock('react-router-dom', () => ({
  Outlet: () => (
    <div>
      <button type="button" onClick={mockAction}>Editar</button>
      <div role="button" tabIndex={0} onClick={mockAction}>Agregar</div>
      <a href="/dashboard/profile">Consultar perfil</a>
    </div>
  ),
}), { virtual: true });

jest.mock('./Sidebar', () => () => <aside>Sidebar</aside>);
jest.mock('../services/dashboardPrefetchService', () => ({
  preloadDashboardData: jest.fn(),
}));
jest.mock('../../../core/i18n', () => ({
  useLanguage: () => ({
    t: (key) => key,
  }),
}));

beforeEach(() => {
  mockAction.mockClear();
  window.localStorage.clear();
  window.sessionStorage.clear();
});

test('una cuenta pausada no puede abrir acciones de modificacion', () => {
  window.localStorage.setItem('usuario', JSON.stringify({
    estado: 'pausado',
    razon_pausa: 'Revision administrativa',
  }));

  render(<DashboardLayout />);

  fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
  fireEvent.click(screen.getByRole('button', { name: 'Agregar' }));

  expect(mockAction).not.toHaveBeenCalled();
  expect(screen.getByText('dashboard.paused.badge')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Editar' }).closest('.dsh-paused-content'))
    .toHaveAttribute('aria-disabled', 'true');
});

test('una cuenta activa conserva las acciones de modificacion', () => {
  window.localStorage.setItem('usuario', JSON.stringify({ estado: 'activo' }));

  render(<DashboardLayout />);
  fireEvent.click(screen.getByRole('button', { name: 'Editar' }));

  expect(mockAction).toHaveBeenCalledTimes(1);
});
