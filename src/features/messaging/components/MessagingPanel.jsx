import {
  FiArchive,
  FiCheck,
  FiChevronLeft,
  FiClock,
  FiInbox,
  FiLogOut,
  FiMessageSquare,
  FiPlus,
  FiRefreshCcw,
  FiSend,
  FiSlash,
  FiUserPlus,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { useLanguage } from '../../../core/i18n';
import usePausedAccount from '../../../shared/hooks/usePausedAccount';
import useMessagingPanel from '../hooks/useMessagingPanel';
import '../styles/messaging.css';

const TAB_CONFIG = [
  { id: 'privados', labelKey: 'messaging.tabs.private', icon: FiMessageSquare },
  { id: 'grupos', labelKey: 'messaging.tabs.groups', icon: FiUsers },
  { id: 'solicitudes', labelKey: 'messaging.tabs.requests', icon: FiInbox },
];

function localeForLanguage(language) {
  if (language === 'en') return 'en-US';
  if (language === 'pt') return 'pt-BR';
  return 'es-BO';
}

function formatTime(value, language = 'es') {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat(localeForLanguage(language), {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function memberLabel(count, t) {
  return t('messaging.members', {
    count,
    suffix: Number(count) === 1 ? '' : 's',
  });
}

function chatPreview(chat, t) {
  if (chat?.bloqueado_por_mi) return t('messaging.preview.blocked');
  if (chat?.archivado) return t('messaging.preview.archived');
  if (chat?.tipo === 'grupo' && !chat?.ultimo_mensaje) {
    return memberLabel(Number(chat.miembros_activos || 0), t);
  }
  return chat?.ultimo_mensaje?.contenido || t('messaging.preview.noMessages');
}

function ChatList({ chats, emptyText, activeChatId, language, onOpenChat, t }) {
  if (!chats.length) {
    return <div className="msg-empty">{emptyText}</div>;
  }

  return (
    <div className="msg-chat-list">
      {chats.map((chat) => (
        <button
          key={chat.id_chat}
          type="button"
          className={`msg-chat-row${Number(activeChatId) === Number(chat.id_chat) ? ' is-active' : ''}`}
          onClick={() => onOpenChat(chat)}
        >
          <span className="msg-chat-icon">
            {chat.tipo === 'grupo' ? <FiUsers /> : <FiMessageSquare />}
          </span>
          <span className="msg-chat-main">
            <span className="msg-chat-title">{chat.nombre || t('messaging.conversation.default')}</span>
            <span className="msg-chat-preview">{chatPreview(chat, t)}</span>
          </span>
          {chat.ultimo_mensaje?.created_at && (
            <span className="msg-chat-time">{formatTime(chat.ultimo_mensaje.created_at, language)}</span>
          )}
        </button>
      ))}
    </div>
  );
}

function RequestList({
  actingId,
  currentUserId,
  invitaciones,
  onRespond,
  onRespondInvitation,
  paused = false,
  solicitudes,
  t,
  language,
}) {
  if (!solicitudes.length && !invitaciones.length) {
    return <div className="msg-empty">{t('messaging.empty.requests')}</div>;
  }

  return (
    <div className="msg-request-list">
      {invitaciones.map((invitacion) => (
        <article className="msg-request-row" key={`inv-${invitacion.id_chat_invitacion}`}>
          <div className="msg-request-head">
            <div>
              <strong>{t('messaging.request.groupInvitation')}</strong>
              <span>{formatTime(invitacion.expires_at, language) ? t('messaging.request.expires', { time: formatTime(invitacion.expires_at, language) }) : t('messaging.request.pending')}</span>
            </div>
            <FiUsers />
          </div>

          <p>
            {t('messaging.request.invited', {
              user: invitacion.invitador_nombre || t('messaging.request.unknownUser'),
              group: invitacion.grupo_nombre || t('messaging.request.unknownGroup'),
            })}
          </p>

          <div className="msg-request-actions">
            <button
              type="button"
              className="msg-btn msg-btn-primary"
              disabled={paused || actingId === `inv-${invitacion.id_chat_invitacion}`}
              onClick={() => onRespondInvitation(invitacion, 'accept')}
            >
              <FiCheck />
              {t('messaging.actions.accept')}
            </button>
            <button
              type="button"
              className="msg-btn msg-btn-ghost"
              disabled={paused || actingId === `inv-${invitacion.id_chat_invitacion}`}
              onClick={() => onRespondInvitation(invitacion, 'reject')}
            >
              <FiX />
              {t('messaging.actions.reject')}
            </button>
          </div>
        </article>
      ))}

      {solicitudes.map((solicitud) => {
        const incoming = Number(solicitud.id_destinatario) === Number(currentUserId);
        const title = incoming ? t('messaging.request.received') : t('messaging.request.sent');

        return (
          <article className="msg-request-row" key={solicitud.id_chat_solicitud}>
            <div className="msg-request-head">
              <div>
                <strong>{title}</strong>
                <span>{formatTime(solicitud.expires_at, language) ? t('messaging.request.expires', { time: formatTime(solicitud.expires_at, language) }) : t('messaging.request.pending')}</span>
              </div>
              <FiClock />
            </div>

            <p>{solicitud.mensaje_inicial || t('messaging.request.noInitialMessage')}</p>

            {incoming ? (
              <div className="msg-request-actions">
                <button
                  type="button"
                  className="msg-btn msg-btn-primary"
                  disabled={paused || actingId === solicitud.id_chat_solicitud}
                  onClick={() => onRespond(solicitud, 'accept')}
                >
                  <FiCheck />
                  {t('messaging.actions.accept')}
                </button>
                <button
                  type="button"
                  className="msg-btn msg-btn-ghost"
                  disabled={paused || actingId === solicitud.id_chat_solicitud}
                  onClick={() => onRespond(solicitud, 'reject')}
                >
                  <FiX />
                  {t('messaging.actions.reject')}
                </button>
              </div>
            ) : (
              <span className="msg-request-state">{t('messaging.request.waiting')}</span>
            )}
          </article>
        );
      })}
    </div>
  );
}

function GroupCreateForm({
  creating,
  draft,
  onChange,
  onSubmit,
  paused = false,
  t,
}) {
  return (
    <form
      className="msg-group-create"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <input
        type="text"
        value={draft}
        maxLength={150}
        placeholder={t('messaging.form.groupName')}
        disabled={paused || creating}
        onChange={(event) => onChange(event.target.value)}
      />
      <button type="submit" disabled={paused || creating || !draft.trim()} title={t('messaging.actions.createGroup')}>
        <FiPlus />
      </button>
    </form>
  );
}

function GroupInviteForm({
  candidates,
  disabled,
  onChange,
  onSubmit,
  t,
  value,
}) {
  if (!candidates.length) return null;

  return (
    <form
      className="msg-group-invite"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{t('messaging.form.inviteUser')}</option>
        {candidates.map((candidate) => (
          <option key={candidate.id_usuario} value={candidate.id_usuario}>
            {candidate.nombre}
          </option>
        ))}
      </select>
      <button type="submit" disabled={disabled || !value} title={t('messaging.actions.invite')}>
        <FiPlus />
      </button>
    </form>
  );
}

function Conversation({
  actionBusy,
  activeChat,
  currentUserId,
  draft,
  hasMoreMessages,
  inviteCandidates,
  inviteUserId,
  invitingUser,
  language,
  loadingMessages,
  messages,
  paused = false,
  sending,
  onArchive,
  onBlock,
  onDraft,
  onHistory,
  onInvite,
  onInviteDraft,
  onLeave,
  onSend,
  onUnarchive,
  onUnblock,
  t,
}) {
  const [showInvite, setShowInvite] = useState(false);

  if (!activeChat) {
    return (
      <div className="msg-conversation-empty">
        <FiMessageSquare />
        <span>{t('messaging.empty.selectConversation')}</span>
      </div>
    );
  }

  const blocked = activeChat.tipo === 'privado' && activeChat.bloqueado_por_mi;
  const interactionsDisabled = paused || blocked;
  const groupMeta = activeChat.tipo === 'grupo'
    ? [
        activeChat.rol,
        memberLabel(Number(activeChat.miembros_activos || 0), t),
      ].filter(Boolean).join(' - ')
    : '';
  const statusLabel = blocked
    ? t('messaging.preview.blocked')
    : activeChat.archivado
      ? t('messaging.preview.archived')
      : '';

  return (
    <section className="msg-conversation">
      <div className="msg-conversation-head">
        <div>
          <strong>{activeChat.nombre || t('messaging.conversation.default')}</strong>
          <span>{activeChat.tipo === 'grupo' ? `${t('messaging.conversation.group')}${groupMeta ? ` - ${groupMeta}` : ''}` : t('messaging.conversation.private')}</span>
          {statusLabel && <em>{statusLabel}</em>}
        </div>

        <div className="msg-conversation-actions">
          {activeChat.archivado ? (
            <button type="button" title={t('messaging.actions.restore')} disabled={paused || actionBusy} onClick={onUnarchive}>
              <FiRefreshCcw />
            </button>
          ) : (
            <button type="button" title={t('messaging.actions.archive')} disabled={paused || actionBusy} onClick={onArchive}>
              <FiArchive />
            </button>
          )}

          {activeChat.tipo === 'privado' && (
            blocked ? (
              <button type="button" title={t('messaging.actions.restoreInteractions')} disabled={paused || actionBusy} onClick={onUnblock}>
                <FiCheck />
              </button>
            ) : (
              <button type="button" title={t('messaging.actions.block')} disabled={paused || actionBusy} onClick={onBlock}>
                <FiSlash />
              </button>
            )
          )}

          {activeChat.tipo === 'grupo' && (
            <>
              <button
                type="button"
                title={showInvite ? t('messaging.actions.hideInvite') : t('messaging.actions.inviteUser')}
                disabled={paused || actionBusy}
                onClick={() => setShowInvite((value) => !value)}
              >
                <FiUserPlus />
              </button>
              <button type="button" title={t('messaging.actions.leaveGroup')} disabled={paused || actionBusy} onClick={onLeave}>
                <FiLogOut />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="msg-history-bar">
        {hasMoreMessages ? (
          <button type="button" onClick={onHistory} disabled={loadingMessages}>
            <FiChevronLeft />
            {t('messaging.actions.history')}
          </button>
        ) : (
          <span>{messages.length ? t('messaging.empty.historyStart') : t('messaging.empty.noMessages')}</span>
        )}
      </div>

      {activeChat.tipo === 'grupo' && showInvite && (
        <GroupInviteForm
          candidates={inviteCandidates}
          disabled={paused || invitingUser}
          value={inviteUserId}
          onChange={onInviteDraft}
          onSubmit={onInvite}
          t={t}
        />
      )}

      <div className="msg-message-list">
        {loadingMessages && !messages.length && (
          <div className="msg-empty">{t('messaging.empty.loadingMessages')}</div>
        )}

        {messages.map((message) => {
          const mine = Number(message.id_usuario_emisor) === Number(currentUserId);
          const senderName = mine ? t('messaging.sender.you') : (message.emisor_nombre || t('messaging.sender.user'));

          return (
            <div
              key={message.id_chat_mensaje}
              className={`msg-bubble-row${mine ? ' mine' : ''}`}
            >
              <div className="msg-bubble">
                {activeChat.tipo === 'grupo' && (
                  <strong className="msg-bubble-sender">{senderName}</strong>
                )}
                <p>{message.contenido}</p>
                <span>{formatTime(message.created_at, language)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <form
        className="msg-compose"
        onSubmit={(event) => {
          event.preventDefault();
          onSend();
        }}
      >
        <textarea
          value={draft}
          disabled={interactionsDisabled || sending}
          maxLength={4000}
          placeholder={paused ? t('messaging.form.paused') : blocked ? t('messaging.preview.blocked') : t('messaging.form.message')}
          onChange={(event) => onDraft(event.target.value)}
        />
        <button type="submit" disabled={interactionsDisabled || sending || !draft.trim()} title={t('messaging.actions.send')}>
          <FiSend />
        </button>
      </form>
    </section>
  );
}

export default function MessagingPanel({
  controlledOpen,
  embedded = false,
  enabled = true,
  hideToggle = false,
  onOpenChange,
} = {}) {
  const { t, language } = useLanguage();
  const paused = usePausedAccount();
  const state = useMessagingPanel(t);

  const {
    actingId,
    activeChat,
    closeChat,
    createGroup,
    creatingGroup,
    currentUserId,
    draft,
    error,
    feedback,
    groupNameDraft,
    grupos,
    hasMoreMessages,
    inviteToActiveGroup,
    inviteUserId,
    invitingUser,
    invitaciones,
    loadHistory,
    loadingMessages,
    loadingPanel,
    messages,
    novedades,
    open,
    openChat,
    privados,
    respondRequest,
    respondInvitation,
    sendMessage,
    sending,
    setDraft,
    setGroupNameDraft,
    setInviteUserId,
    setOpen,
    setTab,
    solicitudes,
    tab,
    updateChatState,
  } = state;

  const panelOpen = typeof controlledOpen === 'boolean' ? controlledOpen : open;
  const currentChats = tab === 'grupos' ? grupos : privados;
  const inviteCandidates = privados
    .filter((chat) => chat.id_otro_usuario && !chat.bloqueado_por_mi)
    .map((chat) => ({
      id_usuario: chat.id_otro_usuario,
      nombre: chat.nombre || t('messaging.sender.user'),
    }));
  const setPanelOpen = (nextOpen) => {
    setOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };
  const showConversation = tab !== 'solicitudes' && Boolean(activeChat);

  const handleTabClick = (nextTab) => {
    if (tab === nextTab && activeChat) {
      closeChat();
      return;
    }

    setTab(nextTab);
    closeChat();
  };

  useEffect(() => {
    if (typeof controlledOpen === 'boolean') {
      setOpen(controlledOpen);
    }
  }, [controlledOpen, setOpen]);

  if (!enabled) return null;

  const content = (
    <>
      <header className="msg-panel-header">
        <div>
          <div className="msg-panel-title">{t('messaging.title')}</div>
          <div className="msg-panel-subtitle">{t('messaging.subtitle')}</div>
        </div>
        <button type="button" className="msg-panel-close" onClick={() => setPanelOpen(false)} aria-label={t('messaging.close')}>
          <FiX />
        </button>
      </header>

      <div className="msg-panel-body">
        <nav className="msg-tabs" aria-label={t('messaging.categories')}>
          {TAB_CONFIG.map(({ id, labelKey, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={tab === id ? 'is-active' : ''}
              onClick={() => handleTabClick(id)}
            >
              <Icon />
              {t(labelKey)}
              {id === 'solicitudes' && solicitudes.length + invitaciones.length > 0 && (
                <span>{solicitudes.length + invitaciones.length}</span>
              )}
            </button>
          ))}
        </nav>

        {error && <div className="msg-feedback error">{error}</div>}
        {feedback && <div className="msg-feedback">{feedback}</div>}
        {paused && (
          <div className="msg-feedback msg-paused-notice">
            {t('messaging.paused.notice')}
          </div>
        )}

        {!showConversation && (
          <section className="msg-list-section is-full">
            {tab === 'grupos' && (
              <GroupCreateForm
                creating={creatingGroup}
                draft={groupNameDraft}
                onChange={setGroupNameDraft}
                onSubmit={createGroup}
                paused={paused}
                t={t}
              />
            )}

            {loadingPanel ? (
              <div className="msg-empty">{t('messaging.empty.loadingPanel')}</div>
            ) : tab === 'solicitudes' ? (
              <RequestList
                actingId={actingId}
                currentUserId={currentUserId}
                invitaciones={invitaciones}
                language={language}
                onRespond={respondRequest}
                onRespondInvitation={respondInvitation}
                paused={paused}
                solicitudes={solicitudes}
                t={t}
              />
            ) : (
              <ChatList
                chats={currentChats}
                emptyText={tab === 'grupos' ? t('messaging.empty.groups') : t('messaging.empty.private')}
                activeChatId={activeChat?.id_chat}
                language={language}
                onOpenChat={openChat}
                t={t}
              />
            )}
          </section>
        )}

        {showConversation && (
          <Conversation
            actionBusy={Number(actingId) === Number(activeChat?.id_chat)}
            activeChat={activeChat}
            currentUserId={currentUserId}
            draft={draft}
            hasMoreMessages={hasMoreMessages}
            inviteCandidates={inviteCandidates}
            inviteUserId={inviteUserId}
            invitingUser={invitingUser}
            language={language}
            loadingMessages={loadingMessages}
            messages={messages}
            paused={paused}
            sending={sending}
            onArchive={() => updateChatState('archive')}
            onBlock={() => updateChatState('block')}
            onDraft={setDraft}
            onHistory={loadHistory}
            onInvite={inviteToActiveGroup}
            onInviteDraft={setInviteUserId}
            onLeave={() => updateChatState('leave')}
            onSend={sendMessage}
            onUnarchive={() => updateChatState('unarchive')}
            onUnblock={() => updateChatState('unblock')}
            t={t}
          />
        )}
      </div>
    </>
  );

  if (embedded) {
    if (!panelOpen) return null;

    return (
      <section className="msg-panel msg-panel-embedded is-open" aria-hidden={false}>
        {content}
      </section>
    );
  }

  return (
    <>
      {!hideToggle && (
        <button
          type="button"
          className={`msg-side-toggle${panelOpen ? ' is-open' : ''}`}
          onClick={() => setPanelOpen(!panelOpen)}
          aria-label={t('messaging.open')}
        >
          <span className="msg-side-toggle-label">{t('messaging.title')}</span>
          {novedades > 0 && <span className="msg-side-badge">{novedades > 9 ? '9+' : novedades}</span>}
        </button>
      )}

      <aside className={`msg-panel${panelOpen ? ' is-open' : ''}${paused ? ' is-paused' : ''}`} aria-hidden={!panelOpen}>
        {content}
      </aside>
    </>
  );
}
