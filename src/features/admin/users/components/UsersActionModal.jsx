import {
  USER_DETAIL_ACTIONS,
  USER_ROLE_ACTIONS,
  getUserRoleMeta,
  getUserRoleValue,
  getUserSessionCount,
  getUserStatusMeta,
} from '../services/usersService';
import CachedUserAvatar from './CachedUserAvatar';

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
  supportsActivation,
  supportsPausing,
  supportsBlocking,
  supportsRoleManagement,
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
  const roleMeta = getUserRoleMeta(user);
  const roleValue = getUserRoleValue(user);
  const sessions = Array.isArray(user.sessions) ? user.sessions : [];
  const selectedAccountAction = USER_DETAIL_ACTIONS.find((action) => action.id === pendingActionId) || null;
  const selectedRoleAction = USER_ROLE_ACTIONS.find((action) => action.id === pendingActionId) || null;
  const sessionCount = getUserSessionCount(user);
  const canInactivate = supportsInactivation && user.estado !== 'inactivo';
  const canActivate = supportsActivation && user.estado !== 'activo';
  const canPause = supportsPausing && user.estado === 'activo';
  const canBlock = supportsBlocking && user.estado !== 'bloqueado';
  const isActivation = selectedAccountAction?.id === 'activar';
  const isPausing = selectedAccountAction?.id === 'pausar';
  const isBlocking = selectedAccountAction?.id === 'bloquear';
  const isInactivation = selectedAccountAction?.id === 'inactivar';
  const isRoleAction = !!selectedRoleAction;
  const canAssignPublisher = roleValue !== 'publicante' && roleValue !== 'administrador';
  const canRemovePublisher = roleValue === 'publicante';
  const canManageSelectedRole = (selectedRoleAction?.id === 'asignar_publicante' && canAssignPublisher)
    || (selectedRoleAction?.id === 'quitar_publicante' && canRemovePublisher);
  const canConfirmSelectedAction = (isActivation && canActivate)
    || (isPausing && canPause)
    || (isBlocking && canBlock)
    || (isInactivation && canInactivate)
    || (isRoleAction && canManageSelectedRole && actionMessage.trim().length >= 10);

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
          <CachedUserAvatar user={user} className="usr-modal-avatar" />

          <div className="usr-modal-copy">
            <strong>{user.nombre || 'Usuario sin nombre'}</strong>
            <span>{user.email || 'Sin correo registrado'}</span>
            <div className={`usr-status-badge usr-status-badge--${statusMeta.tone}`}>
              <span className="usr-status-dot" />
              {statusMeta.label}
            </div>
            <div className={`usr-role-badge usr-role-badge--${roleMeta.tone}`}>
              {roleMeta.label}
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
              <p>Activar, pausar, bloquear e inactivar ya aplican su estado real y generan el aviso correspondiente.</p>
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
                  disabled={(action.id === 'activar' && !canActivate)
                    || (action.id === 'pausar' && !canPause)
                    || (action.id === 'bloquear' && !canBlock)
                    || (action.id === 'inactivar' && !canInactivate)}
                >
                  <strong>{action.label}</strong>
                  <span>{action.description}</span>
                </button>
              ))}
            </div>

            {selectedAccountAction && (
              <div className="usr-reason-panel">
                <div className="usr-reason-head">
                  <strong>{selectedAccountAction.label}</strong>
                  <span>{canConfirmSelectedAction ? 'Accion disponible' : 'Pendiente de integracion'}</span>
                </div>

                {canConfirmSelectedAction ? (
                  <>
                    <p className="usr-action-confirm-copy">
                      {isActivation
                        ? 'La cuenta quedara activa inmediatamente y el usuario podra iniciar sesion sin codigo de verificacion.'
                        : (isPausing
                          ? 'La cuenta seguira visible y con inicio de sesion, pero solo podra consultar informacion hasta que administracion la active.'
                          : isBlocking
                          ? 'La cuenta quedara bloqueada, su contenido dejara de mostrarse y solo un administrador podra activarla nuevamente.'
                          : 'La cuenta quedara inactiva, su contenido dejara de mostrarse y se cerraran sus sesiones activas.')}
                    </p>
                    <textarea
                      className="usr-reason-textarea"
                      rows="4"
                      maxLength="1000"
                      value={actionMessage}
                      onChange={(event) => onActionMessageChange(event.target.value)}
                      placeholder={isActivation
                        ? 'Mensaje para el usuario (opcional). Si se deja vacio, se enviara un aviso generico de activacion.'
                        : (isPausing
                          ? 'Motivo de la pausa. Se mostrara como aviso de solo lectura en su dashboard.'
                          : isBlocking
                          ? 'Motivo del bloqueo. Se mostrara al usuario cuando intente iniciar sesion.'
                          : 'Motivo para el usuario (opcional). Si se deja vacio, se enviara un aviso generico.')}
                    />
                    {isPausing || isBlocking ? (
                      <p className="usr-action-confirm-copy">
                        El motivo se registrara como notificacion In-app obligatoria para informar esta restriccion.
                      </p>
                    ) : (
                      <div className="usr-action-channels" aria-label={`Canales para notificar la ${isActivation ? 'activacion' : 'inactivacion'}`}>
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
                    )}
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
                      ? (isBlocking
                        ? 'El usuario no podra desbloquearse; la accion Activar cuenta del administrador restaura el acceso.'
                        : (isPausing
                          ? 'El usuario conservara lectura y visibilidad; la accion Activar cuenta restaura las modificaciones.'
                          : `Se enviara ${isActivation ? 'el mensaje personalizado' : 'la razon personalizada'} o el aviso generico por los canales seleccionados.`))
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
                        ? (actionSubmitting
                          ? (isActivation ? 'Activando...' : (isPausing ? 'Pausando...' : (isBlocking ? 'Bloqueando...' : 'Inactivando...')))
                          : (isActivation ? 'Confirmar activacion' : (isPausing ? 'Confirmar pausa' : (isBlocking ? 'Confirmar bloqueo' : 'Confirmar inactivacion'))))
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
              <span className="usr-modal-section-kicker">Gestion de rol</span>
              <h3>Permisos de publicante</h3>
              <p>
                Rol actual: <strong>{roleMeta.label}</strong>. Si un publicante incumple reglas,
                puedes retirar el permiso registrando un motivo administrativo.
              </p>
            </div>

            <div className="usr-role-summary-card">
              <div>
                <span>Rol actual</span>
                <strong>{roleMeta.label}</strong>
                <small>{roleMeta.helper}</small>
              </div>
              <div>
                <span>Eventos</span>
                <strong>{roleValue === 'publicante' ? 'Habilitado' : 'Sin permiso'}</strong>
                <small>El rol publicante permite crear hasta 3 eventos por mes.</small>
              </div>
            </div>

            <div className="usr-action-grid">
              {USER_ROLE_ACTIONS.map((action) => {
                const disabled = action.id === 'asignar_publicante' ? !canAssignPublisher : !canRemovePublisher;

                return (
                  <button
                    key={action.id}
                    type="button"
                    className={`usr-action-card usr-action-card--${action.tone}${pendingActionId === action.id ? ' active' : ''}`}
                    onClick={() => onSelectAction(action.id)}
                    disabled={disabled}
                  >
                    <strong>{action.label}</strong>
                    <span>{action.description}</span>
                  </button>
                );
              })}
            </div>

            {isRoleAction ? (
              <div className="usr-reason-panel">
                <div className="usr-reason-head">
                  <strong>{selectedRoleAction.label}</strong>
                  <span>{supportsRoleManagement ? 'Accion conectable con backend' : 'Accion preparada en frontend'}</span>
                </div>

                <p className="usr-action-confirm-copy">
                  Escribe un motivo claro. Este texto debe quedar asociado al cambio de rol y servir como aviso administrativo para el usuario.
                </p>

                <textarea
                  className="usr-reason-textarea"
                  rows="4"
                  maxLength="1000"
                  value={actionMessage}
                  onChange={(event) => onActionMessageChange(event.target.value)}
                  placeholder="Ej. Se retira el rol publicante por publicar contenido no verificable o incumplir las reglas de eventos..."
                />

                <div className="usr-reason-foot">
                  <p>
                    El motivo es obligatorio y debe tener al menos 10 caracteres para confirmar el cambio de rol.
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
                      {actionSubmitting ? 'Actualizando rol...' : 'Confirmar cambio de rol'}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
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
