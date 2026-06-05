import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  activateUserAccount,
  blockUserAccount,
  buildUsersWorkspaceCounts,
  buildUsersMetrics,
  createUsersDirectoryShell,
  createGlobalAdminNotice,
  fetchUsersDirectory,
  getUsersEmptyState,
  getUsersPageSummary,
  inactivateUserAccount,
  normalizeUsersDirectory,
  pauseUserAccount,
  sendAdminNotice,
  updateUserRole,
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
  const supportsActivation = !!directory.supportsActivation;
  const supportsPausing = !!directory.supportsPausing;
  const supportsBlocking = !!directory.supportsBlocking;
  const supportsCommunications = !!directory.supportsCommunications;
  const supportsRoleManagement = !!directory.supportsRoleManagement;

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
        user.rol,
        user.role,
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
    if (!activeUser || !['activar', 'pausar', 'bloquear', 'inactivar', 'asignar_publicante', 'quitar_publicante'].includes(pendingActionId)) return;

    setActionSubmitting(true);
    setActionError('');
    setActionSuccess('');

    try {
      const isActivation = pendingActionId === 'activar';
      const isPausing = pendingActionId === 'pausar';
      const isBlocking = pendingActionId === 'bloquear';
      const isRoleAssign = pendingActionId === 'asignar_publicante';
      const isRoleRemove = pendingActionId === 'quitar_publicante';
      const isRoleAction = isRoleAssign || isRoleRemove;

      if (isRoleAction && actionMessage.trim().length < 10) {
        setActionError('Escribe un motivo de al menos 10 caracteres para cambiar el rol.');
        setActionSubmitting(false);
        return;
      }

      const actionPayload = {
        razon: actionMessage.trim() || null,
        ...(isPausing || isBlocking ? {} : { canales: actionChannels }),
      };

      const nextRole = isRoleAssign ? 'publicante' : 'usuario';
      const response = isRoleAction
        ? (supportsRoleManagement
          ? await updateUserRole(activeUser.id, { rol: nextRole, razon: actionMessage.trim(), canales: actionChannels })
          : { message: 'Rol actualizado en la vista de gestion. La integracion persistente queda lista para backend.' })
        : (isActivation
          ? await activateUserAccount(activeUser.id, actionPayload)
          : (isPausing
            ? await pauseUserAccount(activeUser.id, actionPayload)
            : isBlocking
            ? await blockUserAccount(activeUser.id, actionPayload)
            : await inactivateUserAccount(activeUser.id, actionPayload)));
      setDirectory((current) => ({
        ...current,
        items: current.items.map((user) => (
          String(user.id) === String(activeUser.id)
            ? {
              ...user,
              ...(isRoleAction
                ? { rol: nextRole, role: nextRole }
                : {
                  estado: isActivation ? 'activo' : (isPausing ? 'pausado' : (isBlocking ? 'bloqueado' : 'inactivo')),
                  sesionesActivas: isActivation || isPausing ? user.sesionesActivas : 0,
                }),
            }
            : user
        )),
      }));
      setActionSuccess(response?.message || (isRoleAction
        ? (isRoleAssign ? 'Rol publicante asignado correctamente.' : 'Rol publicante retirado correctamente.')
        : (isActivation
        ? 'Cuenta activada correctamente.'
        : (isPausing
          ? 'Cuenta pausada correctamente.'
          : (isBlocking ? 'Cuenta bloqueada correctamente.' : 'Cuenta inactivada correctamente.')))));
      setPendingActionId('');
      setActionMessage('');
      setActionChannels(['inapp', 'email']);
    } catch (error) {
      setActionError(error.message || (pendingActionId === 'activar'
        ? 'No se pudo activar la cuenta.'
        : (pendingActionId === 'pausar'
          ? 'No se pudo pausar la cuenta.'
          : pendingActionId === 'bloquear'
          ? 'No se pudo bloquear la cuenta.'
          : pendingActionId === 'asignar_publicante' || pendingActionId === 'quitar_publicante'
          ? 'No se pudo actualizar el rol del usuario.'
          : 'No se pudo inactivar la cuenta.')));
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
    const isGlobalNotice = !payload.directUser && Array.isArray(payload.segmentos) && payload.segmentos.length === 1 && payload.segmentos[0] === 'todos';
    const response = isGlobalNotice
      ? await createGlobalAdminNotice({
        tipo: payload.tipo,
        titulo: payload.titulo,
        mensaje: payload.contenido,
        estado: 'activo',
        prioridad: payload.prioridad || (payload.urgencia === 'media' ? 'normal' : payload.urgencia),
        visible_desde: payload.visible_desde || null,
        visible_hasta: payload.visible_hasta || null,
      })
      : await sendAdminNotice(payload);
    const notice = response?.data || {};
    const createdAt = notice.created_at || new Date().toISOString();

    setDirectory((current) => ({
      ...current,
      communications: [
        {
          id: notice.id_aviso || notice.id_envio,
          titulo: notice.titulo || payload.titulo,
          cuerpo: notice.mensaje || notice.contenido || payload.contenido,
          tipo: notice.tipo,
          urgencia: notice.prioridad || notice.urgencia || payload.urgencia,
          canales: notice.canales || ['inapp'],
          destinatarios: notice.destinatarios || (isGlobalNotice ? current.items.length : 0),
          creado: new Date(createdAt).toLocaleString('es-BO'),
          estado: notice.estado || 'enviado',
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
