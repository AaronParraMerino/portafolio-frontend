import {
  getRequestSchedulerSnapshot,
  resetRequestSchedulerForTests,
  scheduleRequest,
} from './requestScheduler';

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('requestScheduler', () => {
  beforeEach(() => {
    resetRequestSchedulerForTests();
  });

  test('limita las solicitudes activas a dos', async () => {
    const releases = [];
    let active = 0;
    let peak = 0;

    const task = () => scheduleRequest(() => new Promise((resolve) => {
      active += 1;
      peak = Math.max(peak, active);
      releases.push(() => {
        active -= 1;
        resolve();
      });
    }));

    const requests = [task(), task(), task()];
    await flush();

    expect(peak).toBe(2);
    expect(getRequestSchedulerSnapshot().queued.normal).toBe(1);

    releases.shift()();
    await flush();
    releases.splice(0).forEach((release) => release());
    await Promise.all(requests);
  });

  test('comparte la promesa de solicitudes con la misma clave', async () => {
    const loader = jest.fn(async () => 'ok');
    const first = scheduleRequest(loader, { key: 'events:home' });
    const second = scheduleRequest(loader, { key: 'events:home' });

    await expect(first).resolves.toBe('ok');
    await expect(second).resolves.toBe('ok');
    expect(loader).toHaveBeenCalledTimes(1);
  });

  test('ejecuta background cuando no queda trabajo principal', async () => {
    const order = [];
    let releaseNormal;

    const normal = scheduleRequest(() => new Promise((resolve) => {
      order.push('normal');
      releaseNormal = resolve;
    }), { priority: 'normal' });
    const background = scheduleRequest(async () => {
      order.push('background');
    }, { priority: 'background' });

    await flush();
    expect(order).toEqual(['normal']);

    releaseNormal();
    await Promise.all([normal, background]);
    expect(order).toEqual(['normal', 'background']);
  });
});
