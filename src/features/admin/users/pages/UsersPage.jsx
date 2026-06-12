import { useState } from 'react';
import { BsMegaphone } from 'react-icons/bs';
import AdminHeader from '../../layout/AdminHeader';
import { getAdminSectionConfig } from '../../layout/adminHeaderConfig';
import { useUsersDirectory } from '../hooks/useUsers';
import UsersActionModal from '../components/UsersActionModal';
import UsersCommunicationsPanel from '../components/UsersCommunicationsPanel';
import UsersFilters from '../components/UsersFilters';
import UsersHistoryPanel from '../components/UsersHistoryPanel';
import UsersModuleTabs from '../components/UsersModuleTabs';
import UsersNoticeModal from '../components/UsersNoticeModal';
import UsersStats from '../components/UsersStats';
import UsersTable from '../components/UsersTable';
import UsersTemplatesPanel from '../components/UsersTemplatesPanel';
import BackgroundSaveIndicator from '../../../../shared/ui/BackgroundSaveIndicator';
import '../styles/users.css';
import { useLanguage } from '../../../../core/i18n';

export default function UsersPage() {
  const { t } = useLanguage();
  const [backgroundSavingCount, setBackgroundSavingCount] = useState(0);
  const headerConfig = getAdminSectionConfig('users');
  const {
    sourceReady,
    loadError,
    supportsMutations,
    supportsSessions,
    supportsInactivation,
    supportsActivation,
    supportsPausing,
    supportsBlocking,
    supportsCommunications,
    supportsRoleManagement,
    users,
    communications,
    historyItems,
    templates,
    metrics,
    activeView,
    viewCounts,
    noticeModal,
    query,
    statusFilter,
    filterCounts,
    visibleUsers,
    pageSummary,
    emptyState,
    currentPage,
    totalPages,
    paginationItems,
    activeUser,
    pendingActionId,
    actionMessage,
    actionChannels,
    actionError,
    actionSuccess,
    actionSubmitting,
    onViewChange,
    onOpenNoticeModal,
    onOpenTemplateModal,
    onDeleteTemplate,
    onUseTemplate,
    onOpenDirectNoticeModal,
    onCloseNoticeModal,
    onSendNotice,
    onQueryChange,
    onStatusFilterChange,
    onGoToPage,
    onOpenUser,
    onSessionCountChange,
    onCloseUser,
    onSelectAction,
    onCancelAction,
    onConfirmAction,
    onActionMessageChange,
    onToggleActionChannel,
  } = useUsersDirectory();

  const headerActions = [
    {
      key: 'communication',
      label: t('admin.users.header.action.notice'),
      title: t('admin.users.header.action.noticeTitle'),
      ariaLabel: t('admin.users.header.action.noticeTitle'),
      icon: <BsMegaphone />,
      variant: 'primary',
      onClick: () => onOpenNoticeModal(),
    },
  ];

  const runUserChangeInBackground = (task) => {
    setBackgroundSavingCount((count) => count + 1);
    return Promise.resolve()
      .then(task)
      .finally(() => setBackgroundSavingCount((count) => Math.max(0, count - 1)));
  };

  const handleSendNoticeInBackground = (payload) => (
    runUserChangeInBackground(() => onSendNotice(payload))
  );

  const handleDeleteTemplateInBackground = (templateId) => (
    runUserChangeInBackground(() => onDeleteTemplate(templateId))
  );

  return (
    <div className="usr-page">
      <AdminHeader
        eyebrow={t(headerConfig.eyebrowKey || 'admin.layout.eyebrow.management')}
        title={t(headerConfig.titleKey || 'admin.layout.section.users.title')}
        actions={headerActions}
      />

      <div className="usr-content">
        {loadError ? (
          <p className="usr-load-error" role="alert">{loadError}</p>
        ) : null}
        {!activeUser && actionError ? (
          <p className="usr-load-error" role="alert">{actionError}</p>
        ) : null}
        {!activeUser && actionSuccess ? (
          <p className="usr-action-feedback usr-action-feedback--success">{actionSuccess}</p>
        ) : null}
        <UsersStats metrics={metrics} sourceReady={sourceReady} />

        <section className="usr-panel">
          <UsersModuleTabs
            activeView={activeView}
            counts={viewCounts}
            onViewChange={onViewChange}
          />

          {activeView === 'users' ? (
            <>
              <UsersFilters
                query={query}
                onQueryChange={onQueryChange}
                statusFilter={statusFilter}
                onStatusFilterChange={onStatusFilterChange}
                filterCounts={filterCounts}
                sourceReady={sourceReady}
              />

              <UsersTable
                users={visibleUsers}
                sourceReady={sourceReady}
                pageSummary={pageSummary}
                emptyState={emptyState}
                currentPage={currentPage}
                totalPages={totalPages}
                paginationItems={paginationItems}
                onGoToPage={onGoToPage}
                onOpenUser={onOpenUser}
                onSessionCountChange={onSessionCountChange}
              />
            </>
          ) : null}

          {activeView === 'communications' ? (
            <UsersCommunicationsPanel
              sourceReady={sourceReady}
              communications={communications}
              onCreateNotice={() => onOpenNoticeModal()}
              onEditNotice={(notice) => onOpenNoticeModal({ initialNotice: notice })}
            />
          ) : null}

          {activeView === 'history' ? (
            <UsersHistoryPanel
              sourceReady={sourceReady}
              historyItems={historyItems}
            />
          ) : null}

          {activeView === 'templates' ? (
            <UsersTemplatesPanel
              sourceReady={sourceReady}
              templates={templates}
              onCreateTemplate={onOpenTemplateModal}
              onEditTemplate={onOpenTemplateModal}
              onDeleteTemplate={handleDeleteTemplateInBackground}
              onUseTemplate={onUseTemplate}
            />
          ) : null}
        </section>
      </div>

      <UsersActionModal
        user={activeUser}
        pendingActionId={pendingActionId}
        actionMessage={actionMessage}
        actionChannels={actionChannels}
        supportsSessions={supportsSessions}
        supportsInactivation={supportsInactivation}
        supportsActivation={supportsActivation}
        supportsPausing={supportsPausing}
        supportsBlocking={supportsBlocking}
        supportsRoleManagement={supportsRoleManagement}
        onOpenDirectNotice={onOpenDirectNoticeModal}
        onSessionCountChange={onSessionCountChange}
        onRunInBackground={runUserChangeInBackground}
        onClose={onCloseUser}
        onSelectAction={onSelectAction}
        onCancelAction={onCancelAction}
        onConfirmAction={onConfirmAction}
        onActionMessageChange={onActionMessageChange}
        onToggleActionChannel={onToggleActionChannel}
        actionError={actionError}
        actionSuccess={actionSuccess}
        actionSubmitting={actionSubmitting}
      />

      <UsersNoticeModal
        modal={noticeModal}
        users={users}
        metrics={metrics}
        supportsMutations={supportsMutations}
        supportsCommunications={supportsCommunications}
        onSendNotice={handleSendNoticeInBackground}
        onClose={onCloseNoticeModal}
      />

      <BackgroundSaveIndicator
        active={actionSubmitting || backgroundSavingCount > 0}
        label={t('admin.users.background.processing')}
      />
    </div>
  );
}
