import { fireEvent, render, screen } from '@testing-library/react';
import GlobalSearchInput, { buildGlobalSuggestions } from './GlobalSearchInput';

jest.mock('../../../../core/i18n', () => ({
  useLanguage: () => ({ t: (key) => key }),
}));

const catalogs = {
  habilidadesTecnicas: ['React'],
  tecnologias: ['React'],
  ciudades: ['Cochabamba'],
};

test('solo sugiere coincidencias que empiezan con el texto', () => {
  expect(buildGlobalSuggestions(catalogs, 'rea')).toHaveLength(2);
  expect(buildGlobalSuggestions(catalogs, 'act')).toEqual([]);
  expect(buildGlobalSuggestions(catalogs, 'r')).toHaveLength(2);
});

test('distingue sugerencias iguales por tipo y exige nivel para habilidad', () => {
  const onSelect = jest.fn();

  render(
    <GlobalSearchInput
      value="rea"
      onChange={jest.fn()}
      onSelect={onSelect}
      catalogs={catalogs}
      placeholder="Buscar"
    />
  );

  fireEvent.focus(screen.getByPlaceholderText('Buscar'));
  expect(screen.getAllByText('React')).toHaveLength(2);

  fireEvent.click(screen.getByText('portfolioSearch.skills.technical'));
  expect(onSelect).not.toHaveBeenCalled();

  fireEvent.click(screen.getByText('portfolioSearch.level.intermedio'));
  expect(onSelect).toHaveBeenCalledWith({
    type: 'technicalSkill',
    value: 'React',
    qualifier: 'intermedio',
  });
});
