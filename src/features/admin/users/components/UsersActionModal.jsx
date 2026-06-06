import {
  USER_DETAIL_ACTIONS,
  USER_ROLE_ACTIONS,
  getUserRoleMeta,
  getUserRoleValue,
  getUserSessionCount,
  getUserStatusMeta,
} from '../services/usersService';
import CachedUserAvatar from './CachedUserAvatar';
import { useLanguage } from '../../../../core/i18n';

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
  const { t } = useLanguage();

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
        aria-label={t('admin.users.actionModal.aria', { name: user.nombre || t('admin.users.table.unknownUser') })}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="usr-modal-head">
          <CachedUserAvatar user={user} className="usr-modal-avatar" />

          <div className="usr-modal-copy">
            <strong>{user.nombre || t('admin.users.table.unknownUser')}</strong>
            <span>{user.email || t('admin.users.table.noEmail')}</span>
            <div className={`usr-status-badge usr-status-badge--${statusMeta.tone}`}>
              <span className="usr-status-dot" />
              {t(`admin.users.status.${user.estado || 'inactivo'}.label`)}
            </div>
            <div className={`usr-role-badge usr-role-badge--${roleMeta.tone}`}>
              {t(`admin.users.role.${roleValue}.label`)}
            </div>
          </div>

          <button
            type="button"
            className="usr-modal-close"
            onClick={onClose}
            title={t('admin.users.actionModal.close')}
            aria-label={t('admin.users.actionModal.close')}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="usr-modal-body">
          <section className="usr-modal-section">
            <div className="usr-modal-section-head">
              <span className="usr-modal-section-kicker">{t('admin.users.actionModal.account.kicker')}</span>
              <h3>{t('admin.users.actionModal.account.title')}</h3>
              <p>{t('admin.users.actionModal.account.description')}</p>
            </div>

            <div className="usr-modal-toolbar">
              <button
                type="button"
                className="usr-reason-btn usr-reason-btn--primary"
                onClick={onOpenDirectNotice}
              >
                {t('admin.users.actionModal.directNotice')}
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
                  <strong>{t(`admin.users.action.${action.id}.label`)}</strong>
                  <span>{t(`admin.users.action.${action.id}.description`)}</span>
                </button>
              ))}
            </div>

            {selectedAccountAction && (
              <div className="usr-reason-panel">
                <div className="usr-reason-head">
                  <strong>{t(`admin.users.action.${selectedAccountAction.id}.label`)}</strong>
                  <span>{canConfirmSelectedAction ? t('admin.users.actionModal.available') : t('admin.users.actionModal.integrationPending')}</span>
                </div>

                {canConfirmSelectedAction ? (
                  <>
                    <p className="usr-action-confirm-copy">
                      {isActivation
                        ? t('admin.users.actionModal.activationCopy')
                        : (isPausing
                          ? t('admin.users.actionModal.pauseCopy')
                          : isBlocking
                          ? t('admin.users.actionModal.blockCopy')
                          : t('admin.users.actionModal.inactiveCopy'))}
                    </p>
                    <textarea
                      className="usr-reason-textarea"
                      rows="4"
                      maxLength="1000"
                      value={actionMessage}
                      onChange={(event) => onActionMessageChange(event.target.value)}
                      placeholder={isActivation
                        ? t('admin.users.actionModal.activationPlaceholder')
                        : (isPausing
                          ? t('admin.users.actionModal.pausePlaceholder')
                          : isBlocking
                          ? t('admin.users.actionModal.blockPlaceholder')
                          : t('admin.users.actionModal.genericPlaceholder'))}
                    />
                    {isPausing || isBlocking ? (
                      <p className="usr-action-confirm-copy">
                        {t('admin.users.actionModal.restrictionNotice')}
                      </p>
                    ) : (
                      <div className="usr-action-channels" aria-label={t('admin.users.noticeModal.channelsLabel')}>
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
                          <span>{t('admin.users.channel.email')}</span>
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
                    placeholder={t('admin.users.actionModal.internalNotePlaceholder')}
                  />
                )}

                <div className="usr-reason-foot">
                  <p>
                    {canConfirmSelectedAction
                      ? (isBlocking
                        ? t('admin.users.actionModal.blockFoot')
                        : (isPausing
                          ? t('admin.users.actionModal.pauseFoot')
                          : t('admin.users.actionModal.customMessageFoot', { messageType: isActivation ? t('admin.users.actionModal.customMessage') : t('admin.users.actionModal.customReason') })))
                      : t('admin.users.actionModal.futureReady')}
                  </p>

                  <div className="usr-reason-actions">
                    <button
                      type="button"
                      className="usr-reason-btn usr-reason-btn--ghost"
                      onClick={onCancelAction}
                    >
                      {t('admin.users.actionModal.cancel')}
                    </button>

                    <button
                      type="button"
                      className="usr-reason-btn usr-reason-btn--primary"
                      disabled={!canConfirmSelectedAction || actionSubmitting}
                      onClick={onConfirmAction}
                    >
                      {canConfirmSelectedAction
                        ? (actionSubmitting
                          ? (isActivation ? t('admin.users.actionModal.activating') : (isPausing ? t('admin.users.actionModal.pausing') : (isBlocking ? t('admin.users.actionModal.blocking') : t('admin.users.actionModal.inactivating'))))
                          : (isActivation ? t('admin.users.actionModal.confirmActivation') : (isPausing ? t('admin.users.actionModal.confirmPause') : (isBlocking ? t('admin.users.actionModal.confirmBlock') : t('admin.users.actionModal.confirmInactivation')))))
                        : t('admin.users.actionModal.availableSoon')}
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
              <span className="usr-modal-section-kicker">{t('admin.users.actionModal.role.kicker')}</span>
              <h3>{t('admin.users.actionModal.role.title')}</h3>
              <p>
                {t('admin.users.actionModal.role.description', { role: t(`admin.users.role.${roleValue}.label`) })}
              </p>
            </div>

            <div className="usr-role-summary-card">
              <div>
                <span>{t('admin.users.actionModal.currentRole')}</span>
                <strong>{t(`admin.users.role.${roleValue}.label`)}</strong>
                <small>{t(`admin.users.role.${roleValue}.helper`)}</small>
              </div>
              <div>
                <span>{t('admin.users.actionModal.events')}</span>
                <strong>{roleValue === 'publicante' ? t('admin.users.actionModal.enabled') : t('admin.users.actionModal.noPermission')}</strong>
                <small>{t('admin.users.actionModal.publisherLimit')}</small>
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
                    <strong>{t(`admin.users.roleAction.${action.id}.label`)}</strong>
                    <span>{t(`admin.users.roleAction.${action.id}.description`)}</span>
                  </button>
                );
              })}
            </div>

            {isRoleAction ? (
              <div className="usr-reason-panel">
                <div className="usr-reason-head">
                  <strong>{t(`admin.users.roleAction.${selectedRoleAction.id}.label`)}</strong>
                  <span>{supportsRoleManagement ? t('admin.users.actionModal.backendConnected') : t('admin.users.actionModal.frontendReady')}</span>
                </div>

                <p className="usr-action-confirm-copy">
                  {t('admin.users.actionModal.roleReasonCopy')}
                </p>

                <textarea
                  className="usr-reason-textarea"
                  rows="4"
                  maxLength="1000"
                  value={actionMessage}
                  onChange={(event) => onActionMessageChange(event.target.value)}
                  placeholder={t('admin.users.actionModal.roleReasonExample')}
                />

                <div className="usr-reason-foot">
                  <p>
                    {t('admin.users.actionModal.roleReasonRequired')}
                  </p>

                  <div className="usr-reason-actions">
                    <button
                      type="button"
                      className="usr-reason-btn usr-reason-btn--ghost"
                      onClick={onCancelAction}
                    >
                      {t('admin.users.actionModal.cancel')}
                    </button>

                    <button
                      type="button"
                      className="usr-reason-btn usr-reason-btn--primary"
                      disabled={!canConfirmSelectedAction || actionSubmitting}
                      onClick={onConfirmAction}
                    >
                      {actionSubmitting ? t('admin.users.actionModal.updatingRole') : t('admin.users.actionModal.confirmRoleChange')}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          <section className="usr-modal-section">
            <div className="usr-modal-section-head">
              <span className="usr-modal-section-kicker">{t('admin.users.actionModal.sessions.kicker')}</span>
              <h3>{t('admin.users.actionModal.activityTitle')}</h3>
              <p>{supportsSessions ? t('admin.users.actionModal.sessions.descriptionReady', { count: sessionCount }) : t('admin.users.actionModal.sessions.descriptionPending')}</p>
            </div>

            {supportsSessions && sessions.length > 0 ? (
              <div className="usr-sessions-list">
                {sessions.map((session) => (
                  <article key={session.id} className="usr-session-card">
                    <div>
                      <strong>{session.label || t('admin.users.actionModal.device')}</strong>
                      <span>{session.loc || t('admin.users.actionModal.locationUnavailable')}</span>
                    </div>
                    <div className="usr-session-meta">
                      <span>{session.ip || t('admin.users.actionModal.noIp')}</span>
                      <span>{session.time || t('admin.users.actionModal.noRecord')}</span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="usr-session-empty">
                {supportsSessions
                  ? t('admin.users.actionModal.sessions.empty')
                  : t('admin.users.actionModal.sessions.hint')}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
