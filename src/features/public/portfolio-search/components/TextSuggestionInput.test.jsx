import { fireEvent, render, screen } from '@testing-library/react';
import TextSuggestionInput from './TextSuggestionInput';

test('sugiere por la palabra actual y reemplaza solo esa palabra', () => {
  const onChange = jest.fn();

  render(
    <TextSuggestionInput
      label="Nombre"
      value="Juan ca"
      onChange={onChange}
      suggestions={['Carlos', 'Camila', 'Juan']}
    />
  );

  fireEvent.focus(screen.getByLabelText('Nombre'));

  expect(screen.getByText('Carlos')).toBeInTheDocument();
  expect(screen.getByText('Camila')).toBeInTheDocument();
  expect(screen.queryByText('Juan')).not.toBeInTheDocument();

  fireEvent.click(screen.getByText('Carlos'));
  expect(onChange).toHaveBeenCalledWith('Juan Carlos');
});

test('encuentra sugerencias aunque se escriban sin acento', () => {
  render(
    <TextSuggestionInput
      label="Nombre"
      value="jose"
      onChange={jest.fn()}
      suggestions={['José']}
    />
  );

  fireEvent.focus(screen.getByLabelText('Nombre'));
  expect(screen.getByText('José')).toBeInTheDocument();
});
