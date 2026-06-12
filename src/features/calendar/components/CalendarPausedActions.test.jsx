import { fireEvent, render, screen } from '@testing-library/react';
import CalendarEventList from './CalendarEventList';

jest.mock('../../../core/i18n', () => ({
  useLanguage: () => ({
    language: 'es',
    t: (key) => key,
  }),
}));

test('mantiene visibles y deshabilita las acciones de modificacion del calendario', () => {
  const onEdit = jest.fn();
  const onDelete = jest.fn();
  const onUnsubscribe = jest.fn();
  const onViewDetails = jest.fn();

  render(
    <CalendarEventList
      selectedDate="2026-06-11"
      today="2026-06-11"
      paused
      events={[
        { id: 1, titulo: 'Evento personal', fecha: '2026-06-11', hora: '09:00', origen: 'personal' },
        { id: 2, titulo: 'Evento inscrito', fecha: '2026-06-11', hora: '10:00', origen: 'inscrito' },
      ]}
      onCreate={jest.fn()}
      onEdit={onEdit}
      onDelete={onDelete}
      onDeleteAll={jest.fn()}
      onUnsubscribe={onUnsubscribe}
      onViewDetails={onViewDetails}
    />,
  );

  const edit = screen.getByRole('button', { name: 'calendar.actions.edit' });
  const remove = screen.getByRole('button', { name: 'calendar.actions.delete' });
  const unsubscribe = screen.getByRole('button', { name: 'calendar.actions.unsubscribe' });
  const details = screen.getByRole('button', { name: 'calendar.actions.viewDetails' });

  expect(edit).toBeDisabled();
  expect(remove).toBeDisabled();
  expect(unsubscribe).toBeDisabled();
  expect(details).toBeEnabled();

  fireEvent.click(edit);
  fireEvent.click(remove);
  fireEvent.click(unsubscribe);
  fireEvent.click(details);

  expect(onEdit).not.toHaveBeenCalled();
  expect(onDelete).not.toHaveBeenCalled();
  expect(onUnsubscribe).not.toHaveBeenCalled();
  expect(onViewDetails).toHaveBeenCalledTimes(1);
});

test('deshabilita crear evento personal cuando la cuenta esta pausada', () => {
  const onCreate = jest.fn();

  render(
    <CalendarEventList
      selectedDate="2026-06-11"
      today="2026-06-11"
      paused
      events={[]}
      onCreate={onCreate}
    />,
  );

  const create = screen.getByRole('button', { name: 'calendar.empty.createButton' });
  expect(create).toBeDisabled();

  fireEvent.click(create);
  expect(onCreate).not.toHaveBeenCalled();
});
