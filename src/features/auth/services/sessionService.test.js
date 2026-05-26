import { post } from '../../../services/http/Service';
import { initSesionBase } from './sessionService';

jest.mock('../../../services/http/Service', () => ({
  post: jest.fn(),
}));

describe('initSesionBase', () => {
  beforeEach(() => {
    sessionStorage.clear();
    post.mockReset();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-26T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('no vuelve a solicitar la sesion base antes de tres horas tras un exito', async () => {
    post.mockResolvedValue({ session_token: 'base-token', origen: 'nueva_cookie' });

    await initSesionBase();
    const cached = await initSesionBase();

    expect(post).toHaveBeenCalledTimes(1);
    expect(cached).toEqual({
      session_token: 'base-token',
      origen: 'sesion_base_reciente',
    });
  });

  test('vuelve a solicitarla cuando han transcurrido tres horas', async () => {
    post
      .mockResolvedValueOnce({ session_token: 'first-token' })
      .mockResolvedValueOnce({ session_token: 'refreshed-token' });

    await initSesionBase();
    jest.advanceTimersByTime(3 * 60 * 60 * 1000);
    await initSesionBase();

    expect(post).toHaveBeenCalledTimes(2);
  });

  test('comparte una solicitud en curso entre montajes simultaneos', async () => {
    let resolveRequest;
    post.mockImplementation(() => new Promise((resolve) => {
      resolveRequest = resolve;
    }));

    const first = initSesionBase();
    const second = initSesionBase();

    expect(post).toHaveBeenCalledTimes(1);

    resolveRequest({ session_token: 'base-token' });
    await Promise.all([first, second]);

    expect(post).toHaveBeenCalledTimes(1);
  });
});
