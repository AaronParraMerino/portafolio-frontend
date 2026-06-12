import {
  installAuth401Interceptor,
  onStoredUserUpdated,
  refreshStoredUser,
} from './authStorage';

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('actualiza el estado almacenado al verificar la cuenta con auth me', async () => {
  const onUpdated = jest.fn();
  const unsubscribe = onStoredUserUpdated(onUpdated);

  window.localStorage.setItem('tokenPORT', 'token-prueba');
  window.localStorage.setItem('usuario', JSON.stringify({ id_usuario: 39, estado: 'pausado' }));
  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => ({
      data: { id_usuario: 39, estado: 'activo' },
    }),
  });

  const user = await refreshStoredUser();

  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining('/auth/me'),
    expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: 'Bearer token-prueba',
      }),
    }),
  );
  expect(user.estado).toBe('activo');
  expect(JSON.parse(window.localStorage.getItem('usuario')).estado).toBe('activo');
  expect(onUpdated).toHaveBeenCalledTimes(1);

  unsubscribe();
});

test('no consulta auth me cuando no existe una sesion', async () => {
  await expect(refreshStoredUser()).resolves.toBeNull();
  expect(global.fetch).not.toHaveBeenCalled();
});

test('account paused dispara una verificacion inmediata con auth me', async () => {
  window.localStorage.setItem('tokenPORT', 'token-prueba');
  window.localStorage.setItem('usuario', JSON.stringify({ id_usuario: 39, estado: 'activo' }));

  const pausedResponse = new Response(JSON.stringify({
    status: 'account_paused',
    message: 'Tu cuenta esta en pausa.',
  }), {
    status: 423,
    headers: { 'Content-Type': 'application/json' },
  });
  const meResponse = new Response(JSON.stringify({
    data: { id_usuario: 39, estado: 'pausado' },
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

  global.fetch
    .mockResolvedValueOnce(pausedResponse)
    .mockResolvedValueOnce(meResponse);

  const mockFetch = global.fetch;
  const restore = installAuth401Interceptor();

  await window.fetch('http://localhost:8000/api/eventos-personales', {
    method: 'POST',
    headers: { Authorization: 'Bearer token-prueba' },
  });
  await new Promise((resolve) => setTimeout(resolve, 0));

  expect(mockFetch).toHaveBeenNthCalledWith(
    2,
    expect.stringContaining('/auth/me'),
    expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: 'Bearer token-prueba',
      }),
    }),
  );
  expect(JSON.parse(window.localStorage.getItem('usuario')).estado).toBe('pausado');

  restore();
});
