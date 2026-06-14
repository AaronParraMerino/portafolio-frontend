import { fireEvent, render, screen } from '@testing-library/react';
import ImageZoomOverlay from './ImageZoomOverlay';

test('permite pellizcar y continuar moviendo con un dedo sin fallar', () => {
  render(<ImageZoomOverlay src="https://example.com/image.jpg" alt="Prueba" onClose={jest.fn()} />);

  const dialog = screen.getByRole('dialog', { name: 'Imagen ampliada: Prueba' });
  fireEvent.touchStart(dialog, {
    touches: [{ clientX: 20, clientY: 20 }, { clientX: 80, clientY: 80 }],
  });
  fireEvent.touchMove(dialog, {
    touches: [{ clientX: 10, clientY: 10 }, { clientX: 110, clientY: 110 }],
  });
  fireEvent.touchEnd(dialog, {
    touches: [{ clientX: 110, clientY: 110 }],
  });
  fireEvent.touchMove(dialog, {
    touches: [{ clientX: 125, clientY: 130 }],
  });
  fireEvent.touchEnd(dialog, { touches: [] });

  expect(dialog).toHaveClass('is-zoomed');
});
