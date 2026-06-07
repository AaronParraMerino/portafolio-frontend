import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  activateUserAccount,
  blockUserAccount,
  buildUsersWorkspaceCounts,
  buildUsersMetrics,
  createUsersDirectoryShell,
  createGlobalAdminNotice,
  fetchUsersDirectory,
  inactivateUserAccount,
  normalizeUsersDirectory,
  pauseUserAccount,
  sendAdminNotice,
  updateUserRole,
} from '../services/usersService';
import { useLanguage } from '../../../../core/i18n';

export function useUsersDirectory() {
  const { t } = useLanguage();
  const [activeView, setActiveView] = useState('users');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
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
          setLoadError(error.message || t('admin.users.loadError'));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [t]);

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
  const activeUser = users.find((user) => String(user.id) === String(activeUserId)) || null;

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

  const pageSummary = useMemo(() => {
    if (!sourceReady) return t('admin.users.pagination.pending');
    if (!filteredUsers.length) return t('admin.users.pagination.noResults');

    const start = (safeCurrentPage - 1) * pageSize + 1;
    const end = Math.min(safeCurrentPage * pageSize, filteredUsers.length);

    return t('admin.users.pagination.range', {
      start,
      end,
      total: filteredUsers.length,
    });
  }, [filteredUsers.length, pageSize, safeCurrentPage, sourceReady, t]);

  const emptyState = useMemo(() => {
    if (!sourceReady) {
      return {
        title: t('admin.users.empty.ready.title'),
        description: t('admin.users.empty.ready.description'),
      };
    }

    if (query.trim() || statusFilter !== 'todos') {
      return {
        title: t('admin.users.empty.filtered.title'),
        description: t('admin.users.empty.filtered.description'),
      };
    }

    return {
      title: t('admin.users.empty.none.title'),
      description: t('admin.users.empty.none.description'),
    };
  }, [query, sourceReady, statusFilter, t]);

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
        setActionError(t('admin.users.actionModal.reasonRequired'));
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
          : { message: t('admin.users.actionModal.frontendReady') })
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
        ? (isRoleAssign ? t('admin.users.roleAction.asignar_publicante.label') : t('admin.users.roleAction.quitar_publicante.label'))
        : (isActivation
        ? t('admin.users.action.activar.label')
        : (isPausing
          ? t('admin.users.action.pausar.label')
          : (isBlocking ? t('admin.users.action.bloquear.label') : t('admin.users.action.inactivar.label'))))));
      setPendingActionId('');
      setActionMessage('');
      setActionChannels(['inapp', 'email']);
    } catch (error) {
      setActionError(error.message || (pendingActionId === 'activar'
        ? t('admin.users.action.activar.description')
        : (pendingActionId === 'pausar'
          ? t('admin.users.action.pausar.description')
          : pendingActionId === 'bloquear'
          ? t('admin.users.action.bloquear.description')
          : pendingActionId === 'asignar_publicante' || pendingActionId === 'quitar_publicante'
          ? t('admin.users.noticeModal.sendError')
          : t('admin.users.action.inactivar.description'))));
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
      initialSegments: ['todos'],
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
    onOpenTemplateModal: handleOpenTemplateModal,
    onOpenDirectNoticeModal: handleOpenDirectNoticeModal,
    onCloseNoticeModal: handleCloseNoticeModal,
    onSendNotice: handleSendNotice,
    onQueryChange: handleQueryChange,
    onStatusFilterChange: handleStatusFilterChange,
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
