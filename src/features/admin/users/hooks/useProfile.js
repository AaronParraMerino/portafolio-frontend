import { useMemo, useState } from 'react';
import {
  buildUsersMetrics,
  createUsersDirectoryShell,
  getUsersEmptyState,
  getUsersPageSummary,
  normalizeUsersDirectory,
} from '../services/profileService';

export function useUsersDirectory() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeUserId, setActiveUserId] = useState(null);
  const [pendingActionId, setPendingActionId] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const directory = useMemo(
    () => normalizeUsersDirectory(createUsersDirectoryShell()),
    [],
  );

  const users = directory.items;
  const pageSize = directory.pageSize;
  const sourceReady = !!directory.sourceReady;
  const supportsMutations = !!directory.supportsMutations;
  const supportsSessions = !!directory.supportsSessions;

  const metrics = useMemo(() => buildUsersMetrics(users), [users]);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesStatus = statusFilter === 'todos' || user.estado === statusFilter;

      if (!matchesStatus) return false;
      if (!normalizedQuery) return true;

      return [
        user.nombre,
        user.email,
        user.estado,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery));
    });
  }, [users, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * pageSize;
  const visibleUsers = filteredUsers.slice(pageStart, pageStart + pageSize);
  const visibleIds = visibleUsers.map((user) => String(user.id));
  const activeUser = users.find((user) => String(user.id) === String(activeUserId)) || null;

  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const someVisibleSelected = visibleIds.some((id) => selectedIds.includes(id)) && !allVisibleSelected;

  const paginationItems = useMemo(() => {
    const visibleCount = Math.min(3, totalPages);
    const start = totalPages <= 3
      ? 1
      : Math.max(1, Math.min(safeCurrentPage - 1, totalPages - 2));

    return Array.from({ length: visibleCount }, (_, index) => start + index);
  }, [safeCurrentPage, totalPages]);

  const filterCounts = useMemo(() => ({
    todos: users.length,
    activo: users.filter((user) => user.estado === 'activo').length,
    pausado: users.filter((user) => user.estado === 'pausado').length,
    suspendido: users.filter((user) => user.estado === 'suspendido').length,
    inactivo: users.filter((user) => user.estado === 'inactivo').length,
  }), [users]);

  const pageSummary = useMemo(() => getUsersPageSummary({
    sourceReady,
    filteredCount: filteredUsers.length,
    currentPage: safeCurrentPage,
    pageSize,
  }), [filteredUsers.length, pageSize, safeCurrentPage, sourceReady]);

  const emptyState = useMemo(() => getUsersEmptyState({
    sourceReady,
    hasQuery: !!query.trim(),
    hasFilters: statusFilter !== 'todos',
  }), [query, sourceReady, statusFilter]);

  const handleQueryChange = (nextQuery) => {
    setQuery(nextQuery);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (nextFilter) => {
    setStatusFilter(nextFilter);
    setCurrentPage(1);
  };

  const handleToggleUser = (userId) => {
    const key = String(userId);

    setSelectedIds((current) => (
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key]
    ));
  };

  const handleToggleVisible = () => {
    if (!visibleIds.length) return;

    setSelectedIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !visibleIds.includes(id));
      }

      return Array.from(new Set([...current, ...visibleIds]));
    });
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleGoToPage = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  const handleOpenUser = (userId) => {
    setActiveUserId(userId);
    setPendingActionId('');
    setActionMessage('');
  };

  const handleCloseUser = () => {
    setActiveUserId(null);
    setPendingActionId('');
    setActionMessage('');
  };

  const handleSelectAction = (actionId) => {
    setPendingActionId(actionId);
    setActionMessage('');
  };

  const handleCancelAction = () => {
    setPendingActionId('');
    setActionMessage('');
  };

  return {
    sourceReady,
    supportsMutations,
    supportsSessions,
    users,
    metrics,
    query,
    statusFilter,
    filterCounts,
    filteredUsers,
    visibleUsers,
    pageSummary,
    emptyState,
    selectedIds,
    selectedCount: selectedIds.length,
    allVisibleSelected,
    someVisibleSelected,
    currentPage: safeCurrentPage,
    totalPages,
    paginationItems,
    activeUser,
    pendingActionId,
    actionMessage,
    onQueryChange: handleQueryChange,
    onStatusFilterChange: handleStatusFilterChange,
    onToggleUser: handleToggleUser,
    onToggleVisible: handleToggleVisible,
    onClearSelection: handleClearSelection,
    onGoToPage: handleGoToPage,
    onOpenUser: handleOpenUser,
    onCloseUser: handleCloseUser,
    onSelectAction: handleSelectAction,
    onCancelAction: handleCancelAction,
    onActionMessageChange: setActionMessage,
  };
}
