const PROFILE_THUMB_CACHE_NAME = 'profile-thumbs-v1';
const PROFILE_THUMB_KEY_PREFIX = 'profile-thumb-url:v1:';
const PROFILE_THUMB_UPDATED_EVENT = 'profile:thumb-updated';
const resolvedThumbUrls = new Map();

function storageKey(userId) {
  return `${PROFILE_THUMB_KEY_PREFIX}${userId}`;
}

export function getStoredProfileThumb(userId) {
  if (!userId || typeof window === 'undefined') return '';

  try {
    return localStorage.getItem(storageKey(userId)) || '';
  } catch {
    return '';
  }
}

async function deleteCachedUrl(url) {
  if (!url || typeof window === 'undefined' || !('caches' in window)) return;

  try {
    const cache = await window.caches.open(PROFILE_THUMB_CACHE_NAME);
    await cache.delete(url);
  } catch {
    // Cache Storage is only an optimization.
  }
}

async function warmProfileThumb(url) {
  if (!url || typeof window === 'undefined' || !('caches' in window)) return;

  try {
    const cache = await window.caches.open(PROFILE_THUMB_CACHE_NAME);
    const response = await fetch(url, { mode: 'cors', credentials: 'omit' });

    if (response.ok) {
      await cache.put(url, response);
    }
  } catch {
    // The direct URL remains available when cache warming fails.
  }
}

export function setStoredProfileThumb(userId, url) {
  if (!userId || typeof window === 'undefined') return;

  const nextUrl = String(url || '').trim();
  const previousUrl = getStoredProfileThumb(userId);

  try {
    if (nextUrl) {
      localStorage.setItem(storageKey(userId), nextUrl);
    } else {
      localStorage.removeItem(storageKey(userId));
    }
  } catch {
    // The navbar can still use the URL from the current response.
  }

  if (previousUrl && previousUrl !== nextUrl) {
    deleteCachedUrl(previousUrl);
  }

  if (nextUrl) {
    warmProfileThumb(nextUrl);
  }

  window.dispatchEvent(new CustomEvent(PROFILE_THUMB_UPDATED_EVENT, {
    detail: { userId: String(userId), url: nextUrl },
  }));
}

export async function getCachedProfileThumb(url) {
  if (!url || typeof window === 'undefined' || !('caches' in window)) return url || '';
  if (resolvedThumbUrls.has(url)) return resolvedThumbUrls.get(url);

  try {
    const cache = await window.caches.open(PROFILE_THUMB_CACHE_NAME);
    let response = await cache.match(url);

    if (!response) {
      const requested = await fetch(url, { mode: 'cors', credentials: 'omit' });
      if (!requested.ok) return url;
      await cache.put(url, requested.clone());
      response = requested;
    }

    const objectUrl = URL.createObjectURL(await response.blob());
    resolvedThumbUrls.set(url, objectUrl);
    return objectUrl;
  } catch {
    return url;
  }
}

export function onProfileThumbUpdated(handler) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(PROFILE_THUMB_UPDATED_EVENT, handler);
  return () => window.removeEventListener(PROFILE_THUMB_UPDATED_EVENT, handler);
}
