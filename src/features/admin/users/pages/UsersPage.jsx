import { BsMegaphone } from 'react-icons/bs';
import AdminHeader from '../../layout/AdminHeader';
import { getAdminSectionConfig } from '../../layout/adminHeaderConfig';
import { useUsersDirectory } from '../hooks/useUsers';
import UsersActionModal from '../components/UsersActionModal';
import UsersBulkBar from '../components/UsersBulkBar';
import UsersCommunicationsPanel from '../components/UsersCommunicationsPanel';
import UsersFilters from '../components/UsersFilters';
import UsersHistoryPanel from '../components/UsersHistoryPanel';
import UsersModuleTabs from '../components/UsersModuleTabs';
import UsersNoticeModal from '../components/UsersNoticeModal';
import UsersStats from '../components/UsersStats';
import UsersTable from '../components/UsersTable';
import UsersTemplatesPanel from '../components/UsersTemplatesPanel';
import '../styles/users.css';

export default function UsersPage() {
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
    selectedIds,
    selectedCount,
    allVisibleSelected,
    someVisibleSelected,
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
    onOpenSelectedNoticeModal,
    onOpenTemplateModal,
    onOpenDirectNoticeModal,
    onCloseNoticeModal,
    onSendNotice,
    onQueryChange,
    onStatusFilterChange,
    onToggleUser,
    onToggleVisible,
    onClearSelection,
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
      label: 'Aviso general',
      title: 'Crear aviso general del sistema',
      ariaLabel: 'Crear aviso general del sistema',
      icon: <BsMegaphone />,
      variant: 'primary',
      onClick: () => onOpenNoticeModal(),
    },
  ];

  return (
    <div className="usr-page">
      <AdminHeader
        eyebrow={headerConfig.eyebrow}
        title={headerConfig.title}
        actions={headerActions}
      />

      <div className="usr-content">
        {loadError ? (
          <p className="usr-load-error" role="alert">{loadError}</p>
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
                selectedIds={selectedIds}
                allVisibleSelected={allVisibleSelected}
                someVisibleSelected={someVisibleSelected}
                pageSummary={pageSummary}
                emptyState={emptyState}
                currentPage={currentPage}
                totalPages={totalPages}
                paginationItems={paginationItems}
                onToggleUser={onToggleUser}
                onToggleVisible={onToggleVisible}
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
            />
          ) : null}
        </section>
      </div>

      {activeView === 'users' ? (
        <UsersBulkBar
          selectedCount={selectedCount}
          supportsMutations={supportsMutations}
          onClearSelection={onClearSelection}
          onNotifySelection={onOpenSelectedNoticeModal}
        />
      ) : null}

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
        selectedIds={selectedIds}
        metrics={metrics}
        supportsMutations={supportsMutations}
        supportsCommunications={supportsCommunications}
        onSendNotice={onSendNotice}
        onClose={onCloseNoticeModal}
      />
    </div>
  );
}
