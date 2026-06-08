const MAX_CONCURRENT_REQUESTS = 2;
const PRIORITIES = ['high', 'normal', 'background'];

const queues = {
  high: [],
  normal: [],
  background: [],
};

const pendingByKey = new Map();
let activeCount = 0;
let activeForegroundCount = 0;
let sequence = 0;

function normalizePriority(priority) {
  return PRIORITIES.includes(priority) ? priority : 'normal';
}

function hasForegroundWork() {
  return activeForegroundCount > 0 || queues.high.length > 0 || queues.normal.length > 0;
}

function nextTask() {
  if (queues.high.length) return queues.high.shift();
  if (queues.normal.length) return queues.normal.shift();
  if (!hasForegroundWork() && queues.background.length) return queues.background.shift();
  return null;
}

function startTask(task) {
  activeCount += 1;
  if (task.priority !== 'background') activeForegroundCount += 1;

  Promise.resolve()
    .then(task.loader)
    .then(task.resolve, task.reject)
    .finally(() => {
      activeCount -= 1;
      if (task.priority !== 'background') activeForegroundCount -= 1;
      if (task.key) pendingByKey.delete(task.key);
      drainQueue();
    });
}

function drainQueue() {
  while (activeCount < MAX_CONCURRENT_REQUESTS) {
    const task = nextTask();
    if (!task) break;
    startTask(task);
  }
}

export function scheduleRequest(loader, options = {}) {
  if (typeof loader !== 'function') {
    return Promise.reject(new TypeError('scheduleRequest requiere una funcion loader.'));
  }

  const priority = normalizePriority(options.priority);
  const key = options.key ? String(options.key) : '';

  if (key && pendingByKey.has(key)) {
    return pendingByKey.get(key);
  }

  const promise = new Promise((resolve, reject) => {
    queues[priority].push({
      id: sequence += 1,
      key,
      loader,
      priority,
      reject,
      resolve,
    });
  });

  if (key) pendingByKey.set(key, promise);

  queueMicrotask(drainQueue);
  return promise;
}

export function getRequestSchedulerSnapshot() {
  return {
    activeCount,
    activeForegroundCount,
    maxConcurrent: MAX_CONCURRENT_REQUESTS,
    pendingKeys: Array.from(pendingByKey.keys()),
    queued: {
      high: queues.high.length,
      normal: queues.normal.length,
      background: queues.background.length,
    },
  };
}

export function resetRequestSchedulerForTests() {
  queues.high.splice(0);
  queues.normal.splice(0);
  queues.background.splice(0);
  pendingByKey.clear();
  activeCount = 0;
  activeForegroundCount = 0;
  sequence = 0;
}
