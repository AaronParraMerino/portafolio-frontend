import AdminHeader from '../../layout/AdminHeader';
import { getAdminSectionConfig } from '../../layout/adminHeaderConfig';
import { useUsersDirectory } from '../hooks/useProfile';
import UsersActionModal from '../components/UsersActionModal';
import UsersBulkBar from '../components/UsersBulkBar';
import UsersFilters from '../components/UsersFilters';
import UsersStats from '../components/UsersStats';
import UsersTable from '../components/UsersTable';
import '../styles/users.css';

export default function UsersPage() {
  const headerConfig = getAdminSectionConfig('users');
  const {
    sourceReady,
    supportsMutations,
    supportsSessions,
    metrics,
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
    onQueryChange,
    onStatusFilterChange,
    onToggleUser,
    onToggleVisible,
    onClearSelection,
    onGoToPage,
    onOpenUser,
    onCloseUser,
    onSelectAction,
    onCancelAction,
    onActionMessageChange,
  } = useUsersDirectory();

  return (
    <div className="usr-page">
      <AdminHeader eyebrow={headerConfig.eyebrow} title={headerConfig.title} />

      <div className="usr-content">
        <UsersStats metrics={metrics} sourceReady={sourceReady} />

        <section className="usr-panel">
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
          />
        </section>
      </div>

      <UsersBulkBar
        selectedCount={selectedCount}
        supportsMutations={supportsMutations}
        onClearSelection={onClearSelection}
      />

      <UsersActionModal
        user={activeUser}
        pendingActionId={pendingActionId}
        actionMessage={actionMessage}
        supportsMutations={supportsMutations}
        supportsSessions={supportsSessions}
        onClose={onCloseUser}
        onSelectAction={onSelectAction}
        onCancelAction={onCancelAction}
        onActionMessageChange={onActionMessageChange}
      />
    </div>
  );
}
