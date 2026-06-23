import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getStoredUser } from '../../../shared/utils/authStorage';
import {
  acceptChatRequest,
  acceptGroupInvitation,
  archiveChat,
  blockPrivateChat,
  createGroupChat,
  fetchChatMessages,
  fetchMessagingPanel,
  inviteGroupMember,
  leaveGroupChat,
  rejectChatRequest,
  rejectGroupInvitation,
  sendChatMessage,
  unarchiveChat,
  unblockPrivateChat,
} from '../services/messagingService';
import {
  appendCachedChatMessage,
  readCachedChatMessages,
  writeCachedChatMessages,
} from '../services/messageCache';

const EMPTY_PANEL = {
  privados: [],
  grupos: [],
  invitaciones: [],
  solicitudes: [],
  contador_novedades: 0,
};
const ACTIVE_CHAT_REFRESH_MS = 7500;

function getCurrentUserId() {
  const user = getStoredUser();
  return Number(user?.id_usuario || user?.id || user?.idUsuario || 0);
}

function mergeMessages(current, incoming, prepend = false, chatId = null) {
  const byId = new Map();
  const ordered = prepend ? [...incoming, ...current] : [...current, ...incoming];
  const normalizedChatId = chatId ? Number(chatId) : null;

  ordered.forEach((message) => {
    if (
      message?.id_chat_mensaje
      && (!normalizedChatId || Number(message.id_chat) === normalizedChatId)
    ) {
      byId.set(message.id_chat_mensaje, message);
    }
  });

  return Array.from(byId.values())
    .sort((a, b) => Number(a.id_chat_mensaje || 0) - Number(b.id_chat_mensaje || 0));
}

function normalizePanel(data) {
  return {
    ...EMPTY_PANEL,
    ...data,
    privados: Array.isArray(data?.privados) ? data.privados : [],
    grupos: Array.isArray(data?.grupos) ? data.grupos : [],
    invitaciones: Array.isArray(data?.invitaciones) ? data.invitaciones : [],
    solicitudes: Array.isArray(data?.solicitudes) ? data.solicitudes : [],
  };
}

function actionFeedback(action, t) {
  return {
    archive: t('messaging.feedback.archived'),
    unarchive: t('messaging.feedback.unarchived'),
    block: t('messaging.feedback.blocked'),
    leave: t('messaging.feedback.left'),
    unblock: t('messaging.feedback.unblocked'),
  }[action] || t('messaging.feedback.updated');
}

export default function useMessagingPanel(t = (key) => key) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('privados');
  const [panel, setPanel] = useState(EMPTY_PANEL);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [draft, setDraft] = useState('');
  const [groupNameDraft, setGroupNameDraft] = useState('');
  const [inviteUserId, setInviteUserId] = useState('');
  const [loadingPanel, setLoadingPanel] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [invitingUser, setInvitingUser] = useState(false);
  const [sending, setSending] = useState(false);
  const [actingId, setActingId] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const pollingMessagesRef = useRef(false);

  const currentUserId = useMemo(getCurrentUserId, []);

  const loadPanel = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoadingPanel(true);
      setError('');
    }

    try {
      const data = await fetchMessagingPanel();
      setPanel(normalizePanel(data));
    } catch (err) {
      setError(err.message || t('messaging.error.loadPanel'));
    } finally {
      if (!silent) setLoadingPanel(false);
    }
  }, [t]);

  const loadMessages = useCallback(async (chat, {
    beforeId,
    mergeWithCurrent = false,
    prepend = false,
    silent = false,
  } = {}) => {
    if (!chat?.id_chat) return;

    if (!silent) {
      setLoadingMessages(true);
      setError('');
    }

    try {
      const data = await fetchChatMessages(chat.id_chat, { beforeId });
      const nextMessages = Array.isArray(data?.mensajes) ? data.mensajes : [];
      setMessages((current) => {
        const baseMessages = prepend || mergeWithCurrent ? current : [];
        const mergedMessages = mergeMessages(baseMessages, nextMessages, prepend, chat.id_chat);
        writeCachedChatMessages(currentUserId, chat.id_chat, mergedMessages);
        return mergedMessages;
      });
      setHasMoreMessages(Boolean(data?.has_more));
    } catch (err) {
      if (!silent) setError(err.message || t('messaging.error.loadMessages'));
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }, [currentUserId, t]);

  const openChat = useCallback((chat) => {
    const cachedMessages = readCachedChatMessages(currentUserId, chat?.id_chat);

    setActiveChat(chat);
    setMessages(cachedMessages);
    setHasMoreMessages(false);
    setDraft('');
    setFeedback('');
    setError('');
    loadMessages(chat, { mergeWithCurrent: cachedMessages.length > 0 });
  }, [currentUserId, loadMessages]);

  const closeChat = useCallback(() => {
    setActiveChat(null);
    setMessages([]);
    setHasMoreMessages(false);
    setDraft('');
    setFeedback('');
    setError('');
  }, []);

  const loadHistory = useCallback(() => {
    if (!activeChat || !messages.length || loadingMessages) return;
    loadMessages(activeChat, {
      beforeId: messages[0].id_chat_mensaje,
      prepend: true,
    });
  }, [activeChat, loadMessages, loadingMessages, messages]);

  const sendMessage = useCallback(async () => {
    const contenido = draft.trim();
    if (!activeChat || !contenido || sending) return;

    setSending(true);
    setError('');

    try {
      const data = await sendChatMessage(activeChat.id_chat, contenido);
      if (data?.mensaje) {
        setMessages((current) => mergeMessages(current, [data.mensaje], false, activeChat.id_chat));
        appendCachedChatMessage(currentUserId, activeChat.id_chat, data.mensaje);
      }
      setDraft('');
      await loadPanel({ silent: true });
    } catch (err) {
      setError(err.message || t('messaging.error.sendMessage'));
    } finally {
      setSending(false);
    }
  }, [activeChat, currentUserId, draft, loadPanel, sending, t]);

  const respondRequest = useCallback(async (solicitud, action) => {
    if (!solicitud?.id_chat_solicitud || actingId) return;

    setActingId(solicitud.id_chat_solicitud);
    setError('');

    try {
      const data = action === 'accept'
        ? await acceptChatRequest(solicitud.id_chat_solicitud)
        : await rejectChatRequest(solicitud.id_chat_solicitud);

      setFeedback(action === 'accept' ? t('messaging.feedback.requestAccepted') : t('messaging.feedback.requestRejected'));
      await loadPanel({ silent: true });

      if (action === 'accept' && data?.chat?.id_chat) {
        const chat = {
          id_chat: data.chat.id_chat,
          tipo: data.chat.tipo || 'privado',
          nombre: data.chat.nombre || t('messaging.conversation.private'),
        };
        setTab(chat.tipo === 'grupo' ? 'grupos' : 'privados');
        openChat(chat);
      }
    } catch (err) {
      setError(err.message || t('messaging.error.respondRequest'));
    } finally {
      setActingId(null);
    }
  }, [actingId, loadPanel, openChat, t]);

  const respondInvitation = useCallback(async (invitacion, action) => {
    if (!invitacion?.id_chat_invitacion || actingId) return;

    setActingId(`inv-${invitacion.id_chat_invitacion}`);
    setError('');

    try {
      await (action === 'accept'
        ? acceptGroupInvitation(invitacion.id_chat_invitacion)
        : rejectGroupInvitation(invitacion.id_chat_invitacion));

      const nextPanelData = await fetchMessagingPanel();
      const nextPanel = normalizePanel(nextPanelData);
      setPanel(nextPanel);
      setFeedback(action === 'accept' ? t('messaging.feedback.invitationAccepted') : t('messaging.feedback.invitationRejected'));

      if (action === 'accept') {
        const group = nextPanel.grupos.find((chat) => Number(chat.id_chat) === Number(invitacion.id_chat));
        if (group) {
          setTab('grupos');
          openChat(group);
        }
      }
    } catch (err) {
      setError(err.message || t('messaging.error.respondInvitation'));
    } finally {
      setActingId(null);
    }
  }, [actingId, openChat, t]);

  const createGroup = useCallback(async () => {
    const nombre = groupNameDraft.trim();
    if (!nombre || creatingGroup) return;

    setCreatingGroup(true);
    setError('');
    setFeedback('');

    try {
      const data = await createGroupChat(nombre);
      const nextPanelData = await fetchMessagingPanel();
      const nextPanel = normalizePanel(nextPanelData);
      setPanel(nextPanel);
      setGroupNameDraft('');
      setFeedback(t('messaging.feedback.groupCreated'));
      setTab('grupos');

      const createdChat = data?.chat?.id_chat
        ? [...nextPanel.grupos, data.chat].find((chat) => Number(chat.id_chat) === Number(data.chat.id_chat))
        : null;

      if (createdChat) {
        openChat({
          ...createdChat,
          tipo: createdChat.tipo || 'grupo',
        });
      }
    } catch (err) {
      setError(err.message || t('messaging.error.createGroup'));
    } finally {
      setCreatingGroup(false);
    }
  }, [creatingGroup, groupNameDraft, openChat, t]);

  const inviteToActiveGroup = useCallback(async () => {
    const idInvitado = Number(inviteUserId);
    if (!activeChat?.id_chat || activeChat.tipo !== 'grupo' || !idInvitado || invitingUser) return;

    setInvitingUser(true);
    setError('');
    setFeedback('');

    try {
      await inviteGroupMember(activeChat.id_chat, idInvitado);
      setInviteUserId('');
      setFeedback(t('messaging.feedback.invitationSent'));
    } catch (err) {
      setError(err.message || t('messaging.error.invite'));
    } finally {
      setInvitingUser(false);
    }
  }, [activeChat, inviteUserId, invitingUser, t]);

  const updateChatState = useCallback(async (action) => {
    if (!activeChat?.id_chat || actingId) return;

    setActingId(activeChat.id_chat);
    setError('');

    try {
      if (action === 'archive') await archiveChat(activeChat.id_chat);
      if (action === 'unarchive') await unarchiveChat(activeChat.id_chat);
      if (action === 'block') await blockPrivateChat(activeChat.id_chat);
      if (action === 'unblock') await unblockPrivateChat(activeChat.id_chat);
      if (action === 'leave') await leaveGroupChat(activeChat.id_chat);

      const data = await fetchMessagingPanel();
      const nextPanel = normalizePanel(data);
      setPanel(nextPanel);

      const chats = [...nextPanel.privados, ...nextPanel.grupos];
      const refreshed = chats.find((chat) => Number(chat.id_chat) === Number(activeChat.id_chat));
      setActiveChat(action === 'leave' ? null : (refreshed || null));
      if (action === 'leave') {
        setMessages([]);
        setHasMoreMessages(false);
        setDraft('');
        setInviteUserId('');
        setTab('grupos');
      }
      setFeedback(actionFeedback(action, t));
    } catch (err) {
      setError(err.message || t('messaging.error.updateChat'));
    } finally {
      setActingId(null);
    }
  }, [actingId, activeChat, t]);

  useEffect(() => {
    if (open) loadPanel();
  }, [loadPanel, open]);

  useEffect(() => {
    if (!open || !activeChat?.id_chat) return undefined;

    const refreshActiveChat = async () => {
      if (pollingMessagesRef.current) return;
      pollingMessagesRef.current = true;

      try {
        await loadMessages(activeChat, {
          mergeWithCurrent: true,
          silent: true,
        });
      } finally {
        pollingMessagesRef.current = false;
      }
    };

    const intervalId = window.setInterval(refreshActiveChat, ACTIVE_CHAT_REFRESH_MS);

    return () => {
      window.clearInterval(intervalId);
      pollingMessagesRef.current = false;
    };
  }, [activeChat, loadMessages, open]);

  return {
    actingId,
    activeChat,
    currentUserId,
    draft,
    error,
    feedback,
    createGroup,
    creatingGroup,
    groupNameDraft,
    grupos: panel.grupos,
    hasMoreMessages,
    inviteToActiveGroup,
    inviteUserId,
    invitingUser,
    invitaciones: panel.invitaciones,
    loadHistory,
    loadingMessages,
    loadingPanel,
    messages,
    novedades: Number(panel.contador_novedades || 0),
    open,
    openChat,
    closeChat,
    privados: panel.privados,
    respondRequest,
    respondInvitation,
    sendMessage,
    sending,
    setActiveChat,
    setDraft,
    setGroupNameDraft,
    setInviteUserId,
    setOpen,
    setTab,
    solicitudes: panel.solicitudes,
    tab,
    updateChatState,
  };
}
