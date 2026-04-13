import BASE_URL from './const';

const headers = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

const apiActivityListeners = new Set();

function notifyApiActivity(event) {
  apiActivityListeners.forEach((listener) => {
    try {
      listener(event);
    } catch (_) {
      // no-op
    }
  });
}

export function subscribeToApiActivity(listener) {
  apiActivityListeners.add(listener);
  return () => {
    apiActivityListeners.delete(listener);
  };
}

async function request(method, endpoint, body) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      credentials: 'include',
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    notifyApiActivity({ endpoint, method, reachable: true, ok: res.ok, status: res.status });

    return res.json();
  } catch (error) {
    notifyApiActivity({ endpoint, method, reachable: false, ok: false, error });
    throw error;
  }
}

export const get = async (endpoint) => {
  return request('GET', endpoint);
};

export const post = async (endpoint, body) => {
  return request('POST', endpoint, body);
};


