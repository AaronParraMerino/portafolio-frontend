import { consumeNavSearchSelection, storeNavSearchSelection } from './navSearchTransfer';

test('transfiere una unica seleccion y la elimina despues de consumirla', () => {
  const selection = { type: 'technology', value: 'React' };

  storeNavSearchSelection(selection);

  expect(consumeNavSearchSelection()).toEqual(selection);
  expect(consumeNavSearchSelection()).toBeNull();
});
