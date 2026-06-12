import { fireEvent, render, screen } from '@testing-library/react';
import EventActionButton from './EventActionButton';

jest.mock('../../../../../core/i18n', () => ({
  useLanguage: () => ({
    t: (key) => key,
  }),
}));

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
});

test('deshabilita la inscripcion del home para una cuenta pausada', () => {
  const onRegister = jest.fn();
  window.localStorage.setItem('usuario', JSON.stringify({ estado: 'pausado' }));

  render(<EventActionButton event={{ id: 12 }} onRegister={onRegister} />);

  const button = screen.getByRole('button', { name: 'home.events.register' });
  expect(button).toBeDisabled();
  expect(button).toHaveClass('evh-action-paused');

  fireEvent.click(button);
  expect(onRegister).not.toHaveBeenCalled();
});

test('mantiene habilitada la inscripcion del home para una cuenta activa', () => {
  const onRegister = jest.fn();
  window.localStorage.setItem('usuario', JSON.stringify({ estado: 'activo' }));

  render(<EventActionButton event={{ id: 12 }} onRegister={onRegister} />);

  const button = screen.getByRole('button', { name: 'home.events.register' });
  expect(button).toBeEnabled();

  fireEvent.click(button);
  expect(onRegister).toHaveBeenCalledTimes(1);
});
