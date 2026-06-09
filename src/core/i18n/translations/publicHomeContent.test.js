import { publicHomeContentTranslations } from './publicHomeContent';

test('mantiene las mismas claves publicas de eventos y proyectos en cada idioma', () => {
  const spanishKeys = Object.keys(publicHomeContentTranslations.es).sort();

  expect(Object.keys(publicHomeContentTranslations.en).sort()).toEqual(spanishKeys);
  expect(Object.keys(publicHomeContentTranslations.pt).sort()).toEqual(spanishKeys);
});

test('incluye traducciones propias para las acciones principales', () => {
  expect(publicHomeContentTranslations.en['home.events.register']).toBe('Register');
  expect(publicHomeContentTranslations.pt['home.projects.details']).toBe('Ver detalhes');
});
