import BASE_URL from '../../../services/http/const';
import { scheduleRequest } from '../../../shared/services/requestScheduler';

function getToken() {
  return localStorage.getItem('tokenPORT') || sessionStorage.getItem('tokenPORT');
}

function headers(withJson = false) {
  const token = getToken();

  if (!token) throw new Error('No hay una sesion activa.');

  return {
    Accept: 'application/json',
    ...(withJson ? { 'Content-Type': 'application/json' } : {}),
    Authorization: `Bearer ${token}`,
  };
}

function encodePath(value) {
  return encodeURIComponent(String(value ?? ''));
}

function isTechnicalErrorMessage(message) {
  if (!message) return false;

  return /SQLSTATE|Connection:|Stack trace|syntax error|Integrity constraint|Datatype mismatch/i.test(String(message));
}

async function resolveResponse(response, fallbackMessage) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload?.status !== 'success') {
    const message = payload.message || fallbackMessage;
    throw new Error(isTechnicalErrorMessage(message) ? fallbackMessage : message);
  }

  return payload;
}

async function requestJson(path, options = {}) {
  const {
    fallbackMessage = 'No se pudo completar la solicitud.',
    priority,
    ...fetchOptions
  } = options;
  const method = String(fetchOptions.method || 'GET').toUpperCase();

  return scheduleRequest(async () => {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...fetchOptions,
      headers: {
        ...headers(Boolean(fetchOptions.body)),
        ...(fetchOptions.headers || {}),
      },
    });

    return resolveResponse(response, fallbackMessage);
  }, {
    key: method === 'GET' ? `messaging:${path}` : '',
    priority: priority || (method === 'GET' ? 'normal' : 'high'),
  });
}

export async function fetchMessagingPanel() {
  return requestJson('/mensajeria/panel', {
    fallbackMessage: 'No se pudo cargar la mensajeria.',
  }).then((payload) => payload.data || {});
}

export async function fetchProfileContactState(usuarioId) {
  return requestJson(`/mensajeria/perfil/${encodePath(usuarioId)}/contacto`, {
    fallbackMessage: 'No se pudo cargar el estado de contacto.',
  }).then((payload) => payload.data || {});
}

export async function createPrivateChatRequest(idDestinatario, mensajeInicial) {
  return requestJson('/mensajeria/solicitudes', {
    method: 'POST',
    body: JSON.stringify({
      id_destinatario: idDestinatario,
      mensaje_inicial: mensajeInicial,
    }),
    fallbackMessage: 'No se pudo enviar la solicitud de chat.',
  }).then((payload) => payload.data || {});
}

export async function fetchChatMessages(chatId, { beforeId } = {}) {
  const query = new URLSearchParams();
  if (beforeId) query.set('antes_de', String(beforeId));
  const queryString = query.toString();

  return requestJson(
    `/mensajeria/chats/${encodePath(chatId)}/mensajes${queryString ? `?${queryString}` : ''}`,
    { fallbackMessage: 'No se pudieron cargar los mensajes.' }
  ).then((payload) => payload.data || {});
}

export async function sendChatMessage(chatId, contenido) {
  return requestJson(`/mensajeria/chats/${encodePath(chatId)}/mensajes`, {
    method: 'POST',
    body: JSON.stringify({ contenido }),
    fallbackMessage: 'No se pudo enviar el mensaje.',
  }).then((payload) => payload.data || {});
}

export async function createGroupChat(nombre) {
  return requestJson('/mensajeria/grupos', {
    method: 'POST',
    body: JSON.stringify({ nombre }),
    fallbackMessage: 'No se pudo crear el grupo.',
  }).then((payload) => payload.data || {});
}

export async function inviteGroupMember(chatId, idInvitado) {
  return requestJson(`/mensajeria/grupos/${encodePath(chatId)}/invitaciones`, {
    method: 'POST',
    body: JSON.stringify({ id_invitado: idInvitado }),
    fallbackMessage: 'No se pudo enviar la invitacion.',
  }).then((payload) => payload.data || {});
}

export async function acceptGroupInvitation(invitacionId) {
  return requestJson(`/mensajeria/invitaciones/${encodePath(invitacionId)}/aceptar`, {
    method: 'PATCH',
    fallbackMessage: 'No se pudo aceptar la invitacion.',
  }).then((payload) => payload.data || {});
}

export async function rejectGroupInvitation(invitacionId) {
  return requestJson(`/mensajeria/invitaciones/${encodePath(invitacionId)}/rechazar`, {
    method: 'PATCH',
    fallbackMessage: 'No se pudo rechazar la invitacion.',
  }).then((payload) => payload.data || {});
}

export async function leaveGroupChat(chatId) {
  return requestJson(`/mensajeria/grupos/${encodePath(chatId)}/salir`, {
    method: 'PATCH',
    fallbackMessage: 'No se pudo salir del grupo.',
  }).then((payload) => payload.data || {});
}

export async function acceptChatRequest(solicitudId) {
  return requestJson(`/mensajeria/solicitudes/${encodePath(solicitudId)}/aceptar`, {
    method: 'PATCH',
    fallbackMessage: 'No se pudo aceptar la solicitud.',
  }).then((payload) => payload.data || {});
}

export async function rejectChatRequest(solicitudId) {
  return requestJson(`/mensajeria/solicitudes/${encodePath(solicitudId)}/rechazar`, {
    method: 'PATCH',
    fallbackMessage: 'No se pudo rechazar la solicitud.',
  }).then((payload) => payload.data || {});
}

export async function archiveChat(chatId) {
  return requestJson(`/mensajeria/chats/${encodePath(chatId)}/archivar`, {
    method: 'PATCH',
    fallbackMessage: 'No se pudo archivar el chat.',
  }).then((payload) => payload.data || {});
}

export async function unarchiveChat(chatId) {
  return requestJson(`/mensajeria/chats/${encodePath(chatId)}/desarchivar`, {
    method: 'PATCH',
    fallbackMessage: 'No se pudo restaurar el chat.',
  }).then((payload) => payload.data || {});
}

export async function blockPrivateChat(chatId) {
  return requestJson(`/mensajeria/chats/${encodePath(chatId)}/bloquear`, {
    method: 'PATCH',
    fallbackMessage: 'No se pudo bloquear el chat.',
  }).then((payload) => payload.data || {});
}

export async function unblockPrivateChat(chatId) {
  return requestJson(`/mensajeria/chats/${encodePath(chatId)}/desbloquear`, {
    method: 'PATCH',
    fallbackMessage: 'No se pudo restaurar la interaccion.',
  }).then((payload) => payload.data || {});
}
