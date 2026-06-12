import {
  getStoredProfileThumb,
  onProfileThumbUpdated,
  setStoredProfileThumb,
} from './profileThumbCache';

beforeEach(() => {
  localStorage.clear();
});

test('guarda el thumb por usuario y notifica los cambios', () => {
  const onUpdated = jest.fn();
  const unsubscribe = onProfileThumbUpdated(onUpdated);

  setStoredProfileThumb(39, 'https://example.com/thumb.webp');

  expect(getStoredProfileThumb(39)).toBe('https://example.com/thumb.webp');
  expect(onUpdated).toHaveBeenCalledWith(expect.objectContaining({
    detail: { userId: '39', url: 'https://example.com/thumb.webp' },
  }));

  unsubscribe();
});

test('elimina la referencia cuando se borra el avatar', () => {
  localStorage.setItem('profile-thumb-url:v1:39', 'https://example.com/thumb.webp');

  setStoredProfileThumb(39, '');

  expect(getStoredProfileThumb(39)).toBe('');
});
