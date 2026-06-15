import {
  classifyFetchPriority,
  deduplicatedFetch,
  resetInFlightFetchDeduplicationForTests,
} from './inFlightFetch';

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('inFlightFetch', () => {
  beforeEach(() => {
    resetInFlightFetchDeduplicationForTests();
  });

  test('comparte llamadas identicas mientras estan en vuelo', async () => {
    let release;
    const response = new Response(JSON.stringify({ ok: true }));
    const fetcher = jest.fn(() => new Promise((resolve) => {
      release = () => resolve(response);
    }));

    const first = deduplicatedFetch(fetcher, '/api/projects/1');
    const second = deduplicatedFetch(fetcher, '/api/projects/1');

    await flush();
    expect(fetcher).toHaveBeenCalledTimes(1);

    release();
    const [firstResponse, secondResponse] = await Promise.all([first, second]);

    await expect(firstResponse.json()).resolves.toEqual({ ok: true });
    await expect(secondResponse.json()).resolves.toEqual({ ok: true });
  });

  test('distingue metodo y contenido de la solicitud', async () => {
    const fetcher = jest.fn(async () => new Response('{}'));

    await Promise.all([
      deduplicatedFetch(fetcher, '/api/projects/1', { method: 'PUT', body: '{"value":1}' }),
      deduplicatedFetch(fetcher, '/api/projects/1', { method: 'PUT', body: '{"value":2}' }),
      deduplicatedFetch(fetcher, '/api/projects/1', { method: 'GET' }),
    ]);

    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  test('comparte mutaciones simultaneas con el mismo contenido', async () => {
    const fetcher = jest.fn(async () => new Response('{}'));
    const options = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: '{"puede_editar_proyecto":"propietarios"}',
    };

    await Promise.all([
      deduplicatedFetch(fetcher, '/api/projects/1/configuration', options),
      deduplicatedFetch(fetcher, '/api/projects/1/configuration', options),
    ]);

    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  test('vuelve a ejecutar una llamada igual despues de finalizar', async () => {
    const fetcher = jest.fn(async () => new Response('{}'));

    await deduplicatedFetch(fetcher, '/api/projects/1');
    await deduplicatedFetch(fetcher, '/api/projects/1');

    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  test('no comparte solicitudes con signal de cancelacion', async () => {
    const fetcher = jest.fn(async () => new Response('{}'));
    const controller = new AbortController();

    await Promise.all([
      deduplicatedFetch(fetcher, '/api/search', { signal: controller.signal }),
      deduplicatedFetch(fetcher, '/api/search', { signal: controller.signal }),
    ]);

    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  test('clasifica interacciones, lecturas y tareas costosas', () => {
    expect(classifyFetchPriority('/api/projects/1/configuration')).toBe('high');
    expect(classifyFetchPriority('/api/projects/1', { method: 'PUT' })).toBe('high');
    expect(classifyFetchPriority('/api/projects/usuario/1')).toBe('normal');
    expect(classifyFetchPriority('/api/auth/github/repos/sync', { method: 'POST' })).toBe('background');
    expect(classifyFetchPriority('/api/home/stats')).toBe('background');
  });

  test('limita a dos solicitudes de red simultaneas', async () => {
    const releases = [];
    let active = 0;
    let peak = 0;
    const fetcher = jest.fn(() => new Promise((resolve) => {
      active += 1;
      peak = Math.max(peak, active);
      releases.push(() => {
        active -= 1;
        resolve(new Response('{}'));
      });
    }));

    const requests = [
      deduplicatedFetch(fetcher, '/api/projects/1'),
      deduplicatedFetch(fetcher, '/api/projects/2'),
      deduplicatedFetch(fetcher, '/api/projects/3'),
    ];

    await flush();
    expect(peak).toBe(2);

    releases.shift()();
    await flush();
    releases.splice(0).forEach((release) => release());
    await Promise.all(requests);
  });
});
