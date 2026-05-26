import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  buildUsersWorkspaceCounts,
  buildUsersMetrics,
  createUsersDirectoryShell,
  fetchUsersDirectory,
  getUsersEmptyState,
  getUsersPageSummary,
  inactivateUserAccount,
  normalizeUsersDirectory,
  sendAdminNotice,
} from '../services/usersService';

export function useUsersDirectory() {
  const [activeView, setActiveView] = useState('users');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeUserId, setActiveUserId] = useState(null);
  const [pendingActionId, setPendingActionId] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [actionChannels, setActionChannels] = useState(['inapp', 'email']);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [noticeModal, setNoticeModal] = useState(null);
  const [loadError, setLoadError] = useState('');

  const [directory, setDirectory] = useState(() => (
    normalizeUsersDirectory(createUsersDirectoryShell())
  ));

  useEffect(() => {
    let cancelled = false;

    fetchUsersDirectory()
      .then((result) => {
        if (!cancelled) {
          setDirectory(result);
          setLoadError('');
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError(error.message || 'No se pudo cargar la lista de usuarios.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const users = directory.items;
  const communications = directory.communications;
  const historyItems = directory.history;
  const templates = directory.templates;
  const pageSize = directory.pageSize;
  const sourceReady = !!directory.sourceReady;
  const supportsMutations = !!directory.supportsMutations;
  const supportsSessions = !!directory.supportsSessions;
  const supportsInactivation = !!directory.supportsInactivation;
  const supportsCommunications = !!directory.supportsCommunications;

  const metrics = useMemo(() => buildUsersMetrics(users), [users]);
  const viewCounts = useMemo(() => buildUsersWorkspaceCounts({
    sourceReady,
    users,
    communications,
    history: historyItems,
    templates,
  }), [communications, historyItems, sourceReady, templates, users]);

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
    bloqueado: users.filter((user) => user.estado === 'bloqueado').length,
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

  const handleViewChange = (nextView) => {
    setActiveView(nextView);
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
    setActionChannels(['inapp', 'email']);
    setActionError('');
    setActionSuccess('');
  };

  const handleSessionCountChange = useCallback((userId, count) => {
    setDirectory((current) => ({
      ...current,
      items: current.items.map((user) => (
        String(user.id) === String(userId)
          ? { ...user, sesionesActivas: count }
          : user
      )),
    }));
  }, []);

  const handleCloseUser = () => {
    setActiveUserId(null);
    setPendingActionId('');
    setActionMessage('');
    setActionChannels(['inapp', 'email']);
    setActionError('');
    setActionSuccess('');
  };

  const handleSelectAction = (actionId) => {
    setPendingActionId(actionId);
    setActionMessage('');
    setActionChannels(['inapp', 'email']);
    setActionError('');
    setActionSuccess('');
  };

  const handleCancelAction = () => {
    setPendingActionId('');
    setActionMessage('');
    setActionChannels(['inapp', 'email']);
    setActionError('');
    setActionSuccess('');
  };

  const handleConfirmAction = async () => {
    if (!activeUser || pendingActionId !== 'inactivar') return;

    setActionSubmitting(true);
    setActionError('');
    setActionSuccess('');

    try {
      const response = await inactivateUserAccount(activeUser.id, {
        razon: actionMessage.trim() || null,
        canales: actionChannels,
      });
      setDirectory((current) => ({
        ...current,
        items: current.items.map((user) => (
          String(user.id) === String(activeUser.id)
            ? { ...user, estado: 'inactivo', sesionesActivas: 0 }
            : user
        )),
      }));
      setActionSuccess(response?.message || 'Cuenta inactivada correctamente.');
      setPendingActionId('');
      setActionMessage('');
      setActionChannels(['inapp', 'email']);
    } catch (error) {
      setActionError(error.message || 'No se pudo inactivar la cuenta.');
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleToggleActionChannel = (channel) => {
    setActionChannels((current) => (
      current.includes(channel)
        ? (current.length === 1 ? current : current.filter((item) => item !== channel))
        : [...current, channel]
    ));
  };

  const handleOpenNoticeModal = (options = {}) => {
    setActiveView('communications');
    setNoticeModal({
      mode: options.mode || 'notice',
      initialSegments: options.initialSegments || ['todos'],
      directUser: options.directUser || null,
      initialNotice: options.initialNotice || null,
    });
  };

  const handleOpenSelectedNoticeModal = () => {
    handleOpenNoticeModal({
      initialSegments: selectedIds.length ? ['seleccionados'] : ['todos'],
    });
  };

  const handleOpenTemplateModal = () => {
    setActiveView('templates');
    setNoticeModal({
      mode: 'template',
      initialSegments: ['todos'],
      directUser: null,
      initialNotice: null,
    });
  };

  const handleOpenDirectNoticeModal = () => {
    if (!activeUser) return;

    setNoticeModal({
      mode: 'notice',
      initialSegments: ['seleccionados'],
      directUser: activeUser,
    });
  };

  const handleCloseNoticeModal = () => {
    setNoticeModal(null);
  };

  const handleSendNotice = async (payload) => {
    const response = await sendAdminNotice(payload);
    const notice = response?.data || {};

    setDirectory((current) => ({
      ...current,
      communications: [
        {
          id: notice.id_envio,
          titulo: notice.titulo,
          cuerpo: notice.contenido,
          tipo: notice.tipo,
          urgencia: notice.urgencia,
          canales: notice.canales,
          destinatarios: notice.destinatarios,
          creado: new Date(notice.created_at).toLocaleString('es-BO'),
          estado: 'enviado',
          segmentos: notice.segmentos || payload.segmentos || [],
        },
        ...current.communications,
      ],
    }));

    return response;
  };

  return {
    sourceReady,
    loadError,
    supportsMutations,
    supportsSessions,
    supportsInactivation,
    supportsCommunications,
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
    actionChannels,
    actionError,
    actionSuccess,
    actionSubmitting,
    onViewChange: handleViewChange,
    onOpenNoticeModal: handleOpenNoticeModal,
    onOpenSelectedNoticeModal: handleOpenSelectedNoticeModal,
    onOpenTemplateModal: handleOpenTemplateModal,
    onOpenDirectNoticeModal: handleOpenDirectNoticeModal,
    onCloseNoticeModal: handleCloseNoticeModal,
    onSendNotice: handleSendNotice,
    onQueryChange: handleQueryChange,
    onStatusFilterChange: handleStatusFilterChange,
    onToggleUser: handleToggleUser,
    onToggleVisible: handleToggleVisible,
    onClearSelection: handleClearSelection,
    onGoToPage: handleGoToPage,
    onOpenUser: handleOpenUser,
    onSessionCountChange: handleSessionCountChange,
    onCloseUser: handleCloseUser,
    onSelectAction: handleSelectAction,
    onCancelAction: handleCancelAction,
    onConfirmAction: handleConfirmAction,
    onActionMessageChange: setActionMessage,
    onToggleActionChannel: handleToggleActionChannel,
  };
}
