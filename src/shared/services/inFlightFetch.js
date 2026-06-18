import { scheduleNetworkRequest } from './requestScheduler';

const pendingFetches = new Map();
let installedFetch = null;

const BACKGROUND_PATTERNS = [
  '/sync',
  '/stats',
  '/catalogo',
  '/catalogos/',
  '/reportes/',
  '/respaldos',
  '/repos/detected',
];

const HIGH_PRIORITY_PATTERNS = [
  '/configuration',
  '/deletion-preview',
  '/auth/me',
  '/auth/login',
  '/auth/confirm-link',
];

function normalizeHeaders(input, init = {}) {
  const headers = new Headers(input instanceof Request ? input.headers : undefined);
  new Headers(init.headers || {}).forEach((value, key) => headers.set(key, value));

  return Array.from(headers.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}:${value}`)
    .join('|');
}

function normalizeBody(body) {
  if (body === undefined || body === null) return '';
  if (typeof body === 'string') return body;
  if (body instanceof URLSearchParams) return body.toString();
  return null;
}

function requestKey(input, init = {}) {
  const request = input instanceof Request ? input : null;
  const method = String(init.method || request?.method || 'GET').toUpperCase();
  const url = String(request?.url || input);
  const signal = init.signal || request?.signal;

  if (signal || init.body instanceof FormData || init.body instanceof Blob) return null;
  if (request && init.body === undefined && !['GET', 'HEAD'].includes(method)) return null;

  const body = normalizeBody(init.body);
  if (body === null) return null;

  return [
    method,
    url,
    normalizeHeaders(input, init),
    String(init.credentials || request?.credentials || ''),
    String(init.mode || request?.mode || ''),
    body,
  ].join('::');
}

export function classifyFetchPriority(input, init = {}) {
  const request = input instanceof Request ? input : null;
  const method = String(init.method || request?.method || 'GET').toUpperCase();
  const url = String(request?.url || input).toLowerCase();

  if (BACKGROUND_PATTERNS.some((pattern) => url.includes(pattern))) {
    return 'background';
  }

  if (!['GET', 'HEAD'].includes(method) || HIGH_PRIORITY_PATTERNS.some((pattern) => url.includes(pattern))) {
    return 'high';
  }

  return 'normal';
}

function canSchedule(input, init = {}) {
  const request = input instanceof Request ? input : null;
  const signal = init.signal || request?.signal;
  return !signal && !(init.body instanceof FormData) && !(init.body instanceof Blob);
}

export function deduplicatedFetch(originalFetch, input, init = {}) {
  const key = requestKey(input, init);
  const execute = () => originalFetch(input, init);
  const scheduledExecute = () => (
    canSchedule(input, init)
      ? scheduleNetworkRequest(execute, { priority: classifyFetchPriority(input, init) })
      : execute()
  );

  if (!key) {
    return scheduledExecute();
  }

  if (!pendingFetches.has(key)) {
    const request = Promise.resolve()
      .then(scheduledExecute)
      .finally(() => pendingFetches.delete(key));

    pendingFetches.set(key, request);
  }

  return pendingFetches.get(key).then((response) => response.clone());
}

export function installInFlightFetchDeduplication() {
  if (typeof window === 'undefined' || typeof window.fetch !== 'function' || installedFetch) {
    return;
  }

  installedFetch = window.fetch.bind(window);
  window.fetch = (input, init) => deduplicatedFetch(installedFetch, input, init);
}

export function resetInFlightFetchDeduplicationForTests() {
  pendingFetches.clear();

  if (installedFetch && typeof window !== 'undefined') {
    window.fetch = installedFetch;
  }

  installedFetch = null;
}
