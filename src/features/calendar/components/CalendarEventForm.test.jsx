import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CalendarEventForm from './CalendarEventForm';

jest.mock('../../../core/i18n', () => ({
  useLanguage: () => ({
    t: (key) => key,
  }),
}));

beforeEach(() => {
  window.localStorage.clear();
});

test('envia los datos de un nuevo evento personal', async () => {
  const onSubmit = jest.fn().mockResolvedValue(true);

  render(
    <CalendarEventForm
      open
      mode="create"
      selectedDate="2026-06-10"
      today="2026-06-09"
      editingEvent={null}
      onCancel={jest.fn()}
      onSubmit={onSubmit}
    />,
  );

  fireEvent.change(screen.getByPlaceholderText('calendar.form.titlePlaceholder'), {
    target: { value: '  Reunion   de equipo  ' },
  });
  fireEvent.change(screen.getByPlaceholderText('calendar.form.descriptionPlaceholder'), {
    target: { value: '  Definir   tareas pendientes  ' },
  });
  fireEvent.change(screen.getByLabelText('calendar.form.timeAria'), {
    target: { value: '14:30' },
  });
  fireEvent.change(screen.getByRole('combobox'), {
    target: { value: 'Trabajo' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'calendar.actions.save' }));

  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith({
      titulo: 'Reunion de equipo',
      descripcion: 'Definir tareas pendientes',
      fecha: '2026-06-10',
      hora: '14:30',
      tipo: 'Trabajo',
    });
  });
});
