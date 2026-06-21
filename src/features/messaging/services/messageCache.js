const MESSAGE_CACHE_PREFIX = 'messaging-messages-cache:v2';
const MESSAGE_CACHE_TTL_MS = 2 * 60 * 60 * 1000;
const MESSAGE_CACHE_LIMIT = 40;

function parseJson(value) {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function cacheKey(userId, chatId) {
  return `${MESSAGE_CACHE_PREFIX}:${userId}:${chatId}`;
}

function normalizeMessages(messages, chatId) {
  const byId = new Map();
  const normalizedChatId = Number(chatId || 0);

  (Array.isArray(messages) ? messages : []).forEach((message) => {
    if (
      message?.id_chat_mensaje
      && Number(message.id_chat) === normalizedChatId
    ) {
      byId.set(Number(message.id_chat_mensaje), message);
    }
  });

  return Array.from(byId.values())
    .sort((a, b) => Number(a.id_chat_mensaje || 0) - Number(b.id_chat_mensaje || 0))
    .slice(-MESSAGE_CACHE_LIMIT);
}

export function readCachedChatMessages(userId, chatId) {
  if (!userId || !chatId) return [];

  const key = cacheKey(userId, chatId);
  const entry = parseJson(sessionStorage.getItem(key));

  if (!entry?.value || Date.now() - Number(entry.cachedAt || 0) > MESSAGE_CACHE_TTL_MS) {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // Cache is only an optimization.
    }
    return [];
  }

  return normalizeMessages(entry.value, chatId);
}

export function writeCachedChatMessages(userId, chatId, messages) {
  if (!userId || !chatId) return [];

  const value = normalizeMessages(messages, chatId);

  try {
    sessionStorage.setItem(cacheKey(userId, chatId), JSON.stringify({
      cachedAt: Date.now(),
      value,
    }));
  } catch {
    // Cache is only an optimization.
  }

  return value;
}

export function appendCachedChatMessage(userId, chatId, message) {
  if (!message?.id_chat_mensaje) return;

  const current = readCachedChatMessages(userId, chatId);
  writeCachedChatMessages(userId, chatId, [...current, message]);
}

export function clearMessagingMessageCache() {
  try {
    for (let index = sessionStorage.length - 1; index >= 0; index -= 1) {
      const key = sessionStorage.key(index);
      if (key?.startsWith(MESSAGE_CACHE_PREFIX)) sessionStorage.removeItem(key);
    }
  } catch {
    // Cache is only an optimization.
  }
}
