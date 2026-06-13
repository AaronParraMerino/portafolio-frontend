import { fireEvent, render, screen } from '@testing-library/react';
import FilterSection from './FilterSection';

test('respeta el estado controlado cuando funciona como acordeon', () => {
  const onAccordionToggle = jest.fn();
  const { rerender } = render(
    <FilterSection
      title="Usuarios"
      icon="US"
      sectionId="user"
      accordion
      openSectionId="user"
      onAccordionToggle={onAccordionToggle}
    >
      <div>Contenido usuario</div>
    </FilterSection>
  );

  expect(screen.getByText('Contenido usuario')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Usuarios/i }));
  expect(onAccordionToggle).toHaveBeenCalledWith(null);

  rerender(
    <FilterSection
      title="Usuarios"
      icon="US"
      sectionId="user"
      accordion
      openSectionId="skills"
      onAccordionToggle={onAccordionToggle}
    >
      <div>Contenido usuario</div>
    </FilterSection>
  );

  expect(screen.queryByText('Contenido usuario')).not.toBeInTheDocument();
});
