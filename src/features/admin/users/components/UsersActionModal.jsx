import { USER_DETAIL_ACTIONS, getUserInitials, getUserSessionCount, getUserStatusMeta } from '../services/profileService';

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 1l10 10M11 1 1 11" />
    </svg>
  );
}

export default function UsersActionModal({
  user,
  pendingActionId,
  actionMessage,
  supportsMutations,
  supportsSessions,
  onOpenDirectNotice,
  onClose,
  onSelectAction,
  onCancelAction,
  onActionMessageChange,
}) {
  if (!user) return null;

  const statusMeta = getUserStatusMeta(user.estado);
  const sessions = Array.isArray(user.sessions) ? user.sessions : [];
  const selectedAction = USER_DETAIL_ACTIONS.find((action) => action.id === pendingActionId) || null;
  const sessionCount = getUserSessionCount(user);

  return (
    <div className="usr-modal-backdrop" onClick={onClose} aria-hidden="true">
      <div
        className="usr-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Gestionar a ${user.nombre || 'usuario'}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="usr-modal-head">
          <div className="usr-modal-avatar">
            {getUserInitials(user.nombre)}
          </div>

          <div className="usr-modal-copy">
            <strong>{user.nombre || 'Usuario sin nombre'}</strong>
            <span>{user.email || 'Sin correo registrado'}</span>
            <div className={`usr-status-badge usr-status-badge--${statusMeta.tone}`}>
              <span className="usr-status-dot" />
              {statusMeta.label}
            </div>
          </div>

          <button
            type="button"
            className="usr-modal-close"
            onClick={onClose}
            title="Cerrar"
            aria-label="Cerrar"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="usr-modal-body">
          <section className="usr-modal-section">
            <div className="usr-modal-section-head">
              <span className="usr-modal-section-kicker">Gestion de cuenta</span>
              <h3>Acciones disponibles</h3>
              <p>La estructura visual ya esta lista para conectarse luego con las acciones reales del backend.</p>
            </div>

            <div className="usr-modal-toolbar">
              <button
                type="button"
                className="usr-reason-btn usr-reason-btn--primary"
                onClick={onOpenDirectNotice}
              >
                Aviso directo
              </button>
            </div>

            <div className="usr-action-grid">
              {USER_DETAIL_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  className={`usr-action-card usr-action-card--${action.tone}${pendingActionId === action.id ? ' active' : ''}`}
                  onClick={() => onSelectAction(action.id)}
                >
                  <strong>{action.label}</strong>
                  <span>{action.description}</span>
                </button>
              ))}
            </div>

            {selectedAction && (
              <div className="usr-reason-panel">
                <div className="usr-reason-head">
                  <strong>{selectedAction.label}</strong>
                  <span>{supportsMutations ? 'Accion lista para enviar' : 'Pendiente de integracion'}</span>
                </div>

                <textarea
                  className="usr-reason-textarea"
                  rows="4"
                  maxLength="400"
                  value={actionMessage}
                  onChange={(event) => onActionMessageChange(event.target.value)}
                  placeholder="Escribe el motivo o una nota interna para esta accion..."
                />

                <div className="usr-reason-foot">
                  <p>
                    {supportsMutations
                      ? 'Este mensaje podra enviarse al usuario junto con la accion.'
                      : 'Este bloque queda preparado para enviar notificaciones cuando se integre el backend.'}
                  </p>

                  <div className="usr-reason-actions">
                    <button
                      type="button"
                      className="usr-reason-btn usr-reason-btn--ghost"
                      onClick={onCancelAction}
                    >
                      Cancelar
                    </button>

                    <button
                      type="button"
                      className="usr-reason-btn usr-reason-btn--primary"
                      disabled={!supportsMutations}
                    >
                      {supportsMutations ? 'Confirmar accion' : 'Disponible con backend'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="usr-modal-section">
            <div className="usr-modal-section-head">
              <span className="usr-modal-section-kicker">Sesiones</span>
              <h3>Actividad del usuario</h3>
              <p>{supportsSessions ? `${sessionCount} sesiones visibles para esta cuenta.` : 'El bloque de sesiones quedo preparado para mostrarse cuando exista integracion real.'}</p>
            </div>

            {supportsSessions && sessions.length > 0 ? (
              <div className="usr-sessions-list">
                {sessions.map((session) => (
                  <article key={session.id} className="usr-session-card">
                    <div>
                      <strong>{session.label || 'Dispositivo'}</strong>
                      <span>{session.loc || 'Ubicacion no disponible'}</span>
                    </div>
                    <div className="usr-session-meta">
                      <span>{session.ip || 'Sin IP'}</span>
                      <span>{session.time || 'Sin registro'}</span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="usr-session-empty">
                {supportsSessions
                  ? 'No existen sesiones activas registradas para esta cuenta.'
                  : 'Aqui apareceran las sesiones activas, ubicaciones y accesos recientes del usuario.'}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
