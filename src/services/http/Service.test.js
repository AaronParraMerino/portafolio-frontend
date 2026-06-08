import { get } from './Service';

describe('HTTP Service authentication', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ data: {} }),
    });
  });

  test('envia el token guardado como Bearer', async () => {
    localStorage.setItem('tokenPORT', 'token-de-prueba');

    await get('/projects/public/30');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/projects/public/30'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer token-de-prueba',
        }),
      }),
    );
  });

  test('mantiene publicas las solicitudes sin token', async () => {
    await get('/home/proyectos-recientes');

    const [, options] = global.fetch.mock.calls[0];
    expect(options.headers).not.toHaveProperty('Authorization');
  });
});
