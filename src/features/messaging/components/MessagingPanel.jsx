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
import usePausedAccount from '../../../shared/hooks/usePausedAccount';
import useMessagingPanel from '../hooks/useMessagingPanel';
import '../styles/messaging.css';

const TAB_CONFIG = [
  { id: 'privados', label: 'Privados', icon: FiMessageSquare },
  { id: 'grupos', label: 'Grupos', icon: FiUsers },
  { id: 'solicitudes', label: 'Solicitudes', icon: FiInbox },
];

function formatTime(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function chatPreview(chat) {
  if (chat?.bloqueado_por_mi) return 'Interacciones bloqueadas';
  if (chat?.archivado) return 'Archivado';
  if (chat?.tipo === 'grupo' && !chat?.ultimo_mensaje) {
    return `${Number(chat.miembros_activos || 0)} miembro${Number(chat.miembros_activos || 0) === 1 ? '' : 's'}`;
  }
  return chat?.ultimo_mensaje?.contenido || 'Sin mensajes todavia';
}

function ChatList({ chats, emptyText, activeChatId, onOpenChat }) {
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
            <span className="msg-chat-title">{chat.nombre || 'Conversacion'}</span>
            <span className="msg-chat-preview">{chatPreview(chat)}</span>
          </span>
          {chat.ultimo_mensaje?.created_at && (
            <span className="msg-chat-time">{formatTime(chat.ultimo_mensaje.created_at)}</span>
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
}) {
  if (!solicitudes.length && !invitaciones.length) {
    return <div className="msg-empty">No hay solicitudes pendientes.</div>;
  }

  return (
    <div className="msg-request-list">
      {invitaciones.map((invitacion) => (
        <article className="msg-request-row" key={`inv-${invitacion.id_chat_invitacion}`}>
          <div className="msg-request-head">
            <div>
              <strong>Invitacion a grupo</strong>
              <span>{formatTime(invitacion.expires_at) ? `Vence ${formatTime(invitacion.expires_at)}` : 'Pendiente'}</span>
            </div>
            <FiUsers />
          </div>

          <p>
            {invitacion.invitador_nombre || 'Un usuario'} te invito a {invitacion.grupo_nombre || 'un grupo'}.
          </p>

          <div className="msg-request-actions">
            <button
              type="button"
              className="msg-btn msg-btn-primary"
              disabled={paused || actingId === `inv-${invitacion.id_chat_invitacion}`}
              onClick={() => onRespondInvitation(invitacion, 'accept')}
            >
              <FiCheck />
              Aceptar
            </button>
            <button
              type="button"
              className="msg-btn msg-btn-ghost"
              disabled={paused || actingId === `inv-${invitacion.id_chat_invitacion}`}
              onClick={() => onRespondInvitation(invitacion, 'reject')}
            >
              <FiX />
              Rechazar
            </button>
          </div>
        </article>
      ))}

      {solicitudes.map((solicitud) => {
        const incoming = Number(solicitud.id_destinatario) === Number(currentUserId);
        const title = incoming ? 'Solicitud recibida' : 'Solicitud enviada';

        return (
          <article className="msg-request-row" key={solicitud.id_chat_solicitud}>
            <div className="msg-request-head">
              <div>
                <strong>{title}</strong>
                <span>{formatTime(solicitud.expires_at) ? `Vence ${formatTime(solicitud.expires_at)}` : 'Pendiente'}</span>
              </div>
              <FiClock />
            </div>

            <p>{solicitud.mensaje_inicial || 'Sin mensaje inicial.'}</p>

            {incoming ? (
              <div className="msg-request-actions">
                <button
                  type="button"
                  className="msg-btn msg-btn-primary"
                  disabled={paused || actingId === solicitud.id_chat_solicitud}
                  onClick={() => onRespond(solicitud, 'accept')}
                >
                  <FiCheck />
                  Aceptar
                </button>
                <button
                  type="button"
                  className="msg-btn msg-btn-ghost"
                  disabled={paused || actingId === solicitud.id_chat_solicitud}
                  onClick={() => onRespond(solicitud, 'reject')}
                >
                  <FiX />
                  Rechazar
                </button>
              </div>
            ) : (
              <span className="msg-request-state">Esperando respuesta</span>
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
        placeholder="Nombre del grupo"
        disabled={paused || creating}
        onChange={(event) => onChange(event.target.value)}
      />
      <button type="submit" disabled={paused || creating || !draft.trim()} title="Crear grupo">
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
        <option value="">Invitar usuario</option>
        {candidates.map((candidate) => (
          <option key={candidate.id_usuario} value={candidate.id_usuario}>
            {candidate.nombre}
          </option>
        ))}
      </select>
      <button type="submit" disabled={disabled || !value} title="Enviar invitacion">
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
}) {
  const [showInvite, setShowInvite] = useState(false);

  if (!activeChat) {
    return (
      <div className="msg-conversation-empty">
        <FiMessageSquare />
        <span>Selecciona una conversacion.</span>
      </div>
    );
  }

  const blocked = activeChat.tipo === 'privado' && activeChat.bloqueado_por_mi;
  const interactionsDisabled = paused || blocked;
  const groupMeta = activeChat.tipo === 'grupo'
    ? [
        activeChat.rol,
        `${Number(activeChat.miembros_activos || 0)} miembro${Number(activeChat.miembros_activos || 0) === 1 ? '' : 's'}`,
      ].filter(Boolean).join(' - ')
    : '';
  const statusLabel = blocked
    ? 'Interacciones bloqueadas'
    : activeChat.archivado
      ? 'Archivado'
      : '';

  return (
    <section className="msg-conversation">
      <div className="msg-conversation-head">
        <div>
          <strong>{activeChat.nombre || 'Conversacion'}</strong>
          <span>{activeChat.tipo === 'grupo' ? `Chat grupal${groupMeta ? ` - ${groupMeta}` : ''}` : 'Chat privado'}</span>
          {statusLabel && <em>{statusLabel}</em>}
        </div>

        <div className="msg-conversation-actions">
          {activeChat.archivado ? (
            <button type="button" title="Restaurar" disabled={paused || actionBusy} onClick={onUnarchive}>
              <FiRefreshCcw />
            </button>
          ) : (
            <button type="button" title="Archivar" disabled={paused || actionBusy} onClick={onArchive}>
              <FiArchive />
            </button>
          )}

          {activeChat.tipo === 'privado' && (
            blocked ? (
              <button type="button" title="Restaurar interacciones" disabled={paused || actionBusy} onClick={onUnblock}>
                <FiCheck />
              </button>
            ) : (
              <button type="button" title="Bloquear" disabled={paused || actionBusy} onClick={onBlock}>
                <FiSlash />
              </button>
            )
          )}

          {activeChat.tipo === 'grupo' && (
            <>
              <button
                type="button"
                title={showInvite ? 'Ocultar invitacion' : 'Invitar usuario'}
                disabled={paused || actionBusy}
                onClick={() => setShowInvite((value) => !value)}
              >
                <FiUserPlus />
              </button>
              <button type="button" title="Salir del grupo" disabled={paused || actionBusy} onClick={onLeave}>
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
            Ver historial
          </button>
        ) : (
          <span>{messages.length ? 'Inicio visible del historial' : 'Sin mensajes'}</span>
        )}
      </div>

      {activeChat.tipo === 'grupo' && showInvite && (
        <GroupInviteForm
          candidates={inviteCandidates}
          disabled={paused || invitingUser}
          value={inviteUserId}
          onChange={onInviteDraft}
          onSubmit={onInvite}
        />
      )}

      <div className="msg-message-list">
        {loadingMessages && !messages.length && (
          <div className="msg-empty">Cargando mensajes...</div>
        )}

        {messages.map((message) => {
          const mine = Number(message.id_usuario_emisor) === Number(currentUserId);
          const senderName = mine ? 'Tu' : (message.emisor_nombre || 'Usuario');

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
                <span>{formatTime(message.created_at)}</span>
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
          placeholder={paused ? 'Cuenta en pausa: solo lectura' : blocked ? 'Interacciones bloqueadas' : 'Escribe un mensaje'}
          onChange={(event) => onDraft(event.target.value)}
        />
        <button type="submit" disabled={interactionsDisabled || sending || !draft.trim()} title="Enviar">
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
  const paused = usePausedAccount();
  const state = useMessagingPanel();

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
      nombre: chat.nombre || 'Usuario',
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
          <div className="msg-panel-title">Mensajeria</div>
          <div className="msg-panel-subtitle">Chats, grupos y solicitudes</div>
        </div>
        <button type="button" className="msg-panel-close" onClick={() => setPanelOpen(false)} aria-label="Cerrar">
          <FiX />
        </button>
      </header>

      <div className="msg-panel-body">
        <nav className="msg-tabs" aria-label="Categorias de mensajeria">
          {TAB_CONFIG.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={tab === id ? 'is-active' : ''}
              onClick={() => handleTabClick(id)}
            >
              <Icon />
              {label}
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
            Cuenta en pausa: puedes revisar tus mensajes, pero no responder ni cambiar chats.
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
              />
            )}

            {loadingPanel ? (
              <div className="msg-empty">Cargando mensajeria...</div>
            ) : tab === 'solicitudes' ? (
              <RequestList
                actingId={actingId}
                currentUserId={currentUserId}
                invitaciones={invitaciones}
                onRespond={respondRequest}
                onRespondInvitation={respondInvitation}
                paused={paused}
                solicitudes={solicitudes}
              />
            ) : (
              <ChatList
                chats={currentChats}
                emptyText={tab === 'grupos' ? 'No hay grupos activos.' : 'No hay chats privados activos.'}
                activeChatId={activeChat?.id_chat}
                onOpenChat={openChat}
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
          aria-label="Abrir mensajeria"
        >
          <span className="msg-side-toggle-label">Mensajeria</span>
          {novedades > 0 && <span className="msg-side-badge">{novedades > 9 ? '9+' : novedades}</span>}
        </button>
      )}

      <aside className={`msg-panel${panelOpen ? ' is-open' : ''}${paused ? ' is-paused' : ''}`} aria-hidden={!panelOpen}>
        {content}
      </aside>
    </>
  );
}
