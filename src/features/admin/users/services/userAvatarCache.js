const ADMIN_AVATAR_CACHE_NAME = 'admin-user-avatars-v1';
const resolvedAvatarUrls = new Map();

export async function getCachedUserAvatarUrl(url) {
  if (!url) return null;
  if (resolvedAvatarUrls.has(url)) return resolvedAvatarUrls.get(url);
  if (typeof window === 'undefined' || !('caches' in window)) return url;

  try {
    const cache = await window.caches.open(ADMIN_AVATAR_CACHE_NAME);
    let response = await cache.match(url);

    if (!response) {
      const requested = await fetch(url, { mode: 'cors', credentials: 'omit' });

      if (!requested.ok) return url;
      await cache.put(url, requested.clone());
      response = requested;
    }

    const objectUrl = URL.createObjectURL(await response.blob());
    resolvedAvatarUrls.set(url, objectUrl);
    return objectUrl;
  } catch {
    return url;
  }
}
