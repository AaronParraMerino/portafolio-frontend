import { USER_DETAIL_ACTIONS, getUserInitials, getUserSessionCount, getUserStatusMeta } from '../services/usersService';

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
  actionChannels,
  supportsSessions,
  supportsInactivation,
  actionError,
  actionSuccess,
  actionSubmitting,
  onOpenDirectNotice,
  onClose,
  onSelectAction,
  onCancelAction,
  onConfirmAction,
  onActionMessageChange,
  onToggleActionChannel,
}) {
  if (!user) return null;

  const statusMeta = getUserStatusMeta(user.estado);
  const sessions = Array.isArray(user.sessions) ? user.sessions : [];
  const selectedAction = USER_DETAIL_ACTIONS.find((action) => action.id === pendingActionId) || null;
  const sessionCount = getUserSessionCount(user);
  const canInactivate = supportsInactivation && user.estado !== 'inactivo';
  const canConfirmSelectedAction = selectedAction?.id === 'inactivar' && canInactivate;

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
              <p>La inactivacion utiliza el flujo real de desactivacion; las otras acciones se habilitaran despues.</p>
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
                  disabled={action.id === 'inactivar' && !canInactivate}
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
                  <span>{canConfirmSelectedAction ? 'Accion disponible' : 'Pendiente de integracion'}</span>
                </div>

                {canConfirmSelectedAction ? (
                  <>
                    <p className="usr-action-confirm-copy">
                      La cuenta quedara inactiva, su contenido dejara de mostrarse y se cerraran sus sesiones activas.
                    </p>
                    <textarea
                      className="usr-reason-textarea"
                      rows="4"
                      maxLength="1000"
                      value={actionMessage}
                      onChange={(event) => onActionMessageChange(event.target.value)}
                      placeholder="Motivo para el usuario (opcional). Si se deja vacio, se enviara un aviso generico."
                    />
                    <div className="usr-action-channels" aria-label="Canales para notificar la inactivacion">
                      <label>
                        <input
                          type="checkbox"
                          checked={actionChannels.includes('inapp')}
                          onChange={() => onToggleActionChannel('inapp')}
                        />
                        <span>In-app</span>
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={actionChannels.includes('email')}
                          onChange={() => onToggleActionChannel('email')}
                        />
                        <span>Correo</span>
                      </label>
                    </div>
                  </>
                ) : (
                  <textarea
                    className="usr-reason-textarea"
                    rows="4"
                    maxLength="400"
                    value={actionMessage}
                    onChange={(event) => onActionMessageChange(event.target.value)}
                    placeholder="Escribe el motivo o una nota interna para esta accion..."
                  />
                )}

                <div className="usr-reason-foot">
                  <p>
                    {canConfirmSelectedAction
                      ? 'Se enviara la razon personalizada o el mensaje generico por los canales seleccionados.'
                      : 'Este bloque queda preparado para integrar esta accion posteriormente.'}
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
                      disabled={!canConfirmSelectedAction || actionSubmitting}
                      onClick={onConfirmAction}
                    >
                      {canConfirmSelectedAction
                        ? (actionSubmitting ? 'Inactivando...' : 'Confirmar inactivacion')
                        : 'Disponible proximamente'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {actionError ? <p className="usr-action-feedback usr-action-feedback--error">{actionError}</p> : null}
            {actionSuccess ? <p className="usr-action-feedback usr-action-feedback--success">{actionSuccess}</p> : null}
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
                  : 'Gestiona las sesiones desde el desplegable de la columna Sesiones en la tabla.'}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
