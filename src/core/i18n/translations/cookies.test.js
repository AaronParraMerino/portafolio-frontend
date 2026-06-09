import { cookiesTranslations } from './cookies';

test('mantiene las mismas claves de cookies en cada idioma', () => {
  const spanishKeys = Object.keys(cookiesTranslations.es).sort();

  expect(Object.keys(cookiesTranslations.en).sort()).toEqual(spanishKeys);
  expect(Object.keys(cookiesTranslations.pt).sort()).toEqual(spanishKeys);
});

test('traduce las acciones principales del aviso de cookies', () => {
  expect(cookiesTranslations.en['cookie.accept']).toBe('Accept cookies');
  expect(cookiesTranslations.pt['cookie.close']).toBe('Agora não');
});
