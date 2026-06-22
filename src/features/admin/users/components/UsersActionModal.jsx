import {
  USER_DETAIL_ACTIONS,
  USER_ROLE_ACTIONS,
  getUserRoleMeta,
  getUserRoleValue,
  getUserSessionCount,
  getUserStatusMeta,
} from '../services/usersService';
import CachedUserAvatar from './CachedUserAvatar';
import UsersSessionsMenu from './UsersSessionsMenu';
import { useLanguage } from '../../../../core/i18n';
import AdminEdit, { AdminEditBody, AdminEditSection } from '../../layout/AdminEdit';

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
  onSessionCountChange,
  onRunInBackground,
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
  const canManageSelectedRole = supportsRoleManagement && (
    (selectedRoleAction?.id === 'asignar_publicante' && canAssignPublisher)
    || (selectedRoleAction?.id === 'quitar_publicante' && canRemovePublisher)
  );
  const canConfirmSelectedAction = (isActivation && canActivate)
    || (isPausing && canPause)
    || (isBlocking && canBlock)
    || (isInactivation && canInactivate)
    || (isRoleAction && canManageSelectedRole && actionMessage.trim().length >= 10);

  return (
    <AdminEdit
      title={user.nombre || t('admin.users.table.unknownUser')}
      subtitle={user.email || t('admin.users.table.noEmail')}
      icon={<CachedUserAvatar user={user} className="usr-modal-avatar" />}
      onClose={onClose}
      size="xl"
      ariaLabel={t('admin.users.actionModal.aria', { name: user.nombre || t('admin.users.table.unknownUser') })}
    >
        <AdminEditBody>
          <div className="usr-modal-copy usr-modal-copy--inline">
            <div className={`usr-status-badge usr-status-badge--${statusMeta.tone}`}>
              <span className="usr-status-dot" />
              {t(`admin.users.status.${user.estado || 'inactivo'}.label`)}
            </div>
            <div className={`usr-role-badge usr-role-badge--${roleMeta.tone}`}>
              {t(`admin.users.role.${roleValue}.label`)}
            </div>
          </div>

          <AdminEditSection>
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
                  <span>{t('admin.users.actionModal.available')}</span>
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
                      ? t('admin.users.actionModal.customMessageFoot', { messageType: isActivation ? t('admin.users.actionModal.customMessage') : t('admin.users.actionModal.customReason') })
                      : t('admin.users.actionModal.roleReasonRequired')}
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
                        : t('admin.users.actionModal.confirmRoleChange')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {actionError ? <p className="usr-action-feedback usr-action-feedback--error">{actionError}</p> : null}
            {actionSuccess ? <p className="usr-action-feedback usr-action-feedback--success">{actionSuccess}</p> : null}
          </AdminEditSection>

          <AdminEditSection>
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
                const disabled = !supportsRoleManagement || (action.id === 'asignar_publicante' ? !canAssignPublisher : !canRemovePublisher);

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
                  <span>{t('admin.users.actionModal.available')}</span>
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
          </AdminEditSection>

          {supportsSessions ? (
          <AdminEditSection>
            <div className="usr-modal-section-head">
              <span className="usr-modal-section-kicker">{t('admin.users.actionModal.sessions.kicker')}</span>
              <h3>{t('admin.users.actionModal.activityTitle')}</h3>
              <p>{t('admin.users.actionModal.sessions.descriptionReady', { count: sessionCount })}</p>
            </div>

            <UsersSessionsMenu
              key={`${user.id}:${user.estado}:${sessionCount}`}
              user={user}
              onCountChange={onSessionCountChange}
              onRequestClose={onClose}
              onRunInBackground={onRunInBackground}
            />
          </AdminEditSection>
          ) : null}
        </AdminEditBody>
    </AdminEdit>
  );
}
