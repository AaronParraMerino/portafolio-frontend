import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  activateUserAccount,
  blockUserAccount,
  buildUsersWorkspaceCounts,
  buildUsersMetrics,
  createUsersDirectoryShell,
  createGlobalAdminNotice,
  createAdminNoticeTemplate,
  deleteGlobalAdminNotice,
  deleteAdminNoticeTemplate,
  fetchUsersDirectory,
  inactivateUserAccount,
  normalizeUsersDirectory,
  pauseUserAccount,
  registerAdminNoticeTemplateUse,
  sendAdminNotice,
  toAdminNoticePriority,
  USER_GLOBAL_NOTICE_TYPES,
  updateAdminNoticeTemplate,
  updateGlobalAdminNotice,
  updateGlobalAdminNoticeStatus,
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

    const userContext = activeUser;
    const actionContext = pendingActionId;
    const messageContext = actionMessage.trim();
    const channelsContext = actionChannels;
    const isActivation = actionContext === 'activar';
    const isPausing = actionContext === 'pausar';
    const isBlocking = actionContext === 'bloquear';
    const isRoleAssign = actionContext === 'asignar_publicante';
    const isRoleRemove = actionContext === 'quitar_publicante';
    const isRoleAction = isRoleAssign || isRoleRemove;

    if (isRoleAction && messageContext.length < 10) {
      setActionError(t('admin.users.actionModal.reasonRequired'));
      return;
    }

    setActionSubmitting(true);
    setActionError('');
    setActionSuccess('');
    setActiveUserId(null);
    setPendingActionId('');
    setActionMessage('');
    setActionChannels(['inapp', 'email']);

    try {
      const actionPayload = {
        razon: messageContext || null,
        canales: channelsContext,
      };

      const nextRole = isRoleAssign ? 'publicante' : 'usuario';
      const response = isRoleAction
        ? (supportsRoleManagement
          ? await updateUserRole(userContext.id, { rol: nextRole, razon: messageContext, canales: channelsContext })
          : { message: t('admin.users.actionModal.frontendReady') })
        : (isActivation
          ? await activateUserAccount(userContext.id, actionPayload)
          : (isPausing
            ? await pauseUserAccount(userContext.id, actionPayload)
            : isBlocking
            ? await blockUserAccount(userContext.id, actionPayload)
            : await inactivateUserAccount(userContext.id, actionPayload)));
      setDirectory((current) => ({
        ...current,
        items: current.items.map((user) => (
          String(user.id) === String(userContext.id)
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
    } catch (error) {
      setActionError(error.message || (actionContext === 'activar'
        ? t('admin.users.action.activar.description')
        : (actionContext === 'pausar'
          ? t('admin.users.action.pausar.description')
          : actionContext === 'bloquear'
          ? t('admin.users.action.bloquear.description')
          : actionContext === 'asignar_publicante' || actionContext === 'quitar_publicante'
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
      duplicateNotice: !!options.duplicateNotice,
      forceUserNotice: !!options.forceUserNotice,
      fromTemplate: !!options.fromTemplate,
    });
  };

  const handleOpenTemplateModal = (template = null) => {
    setActiveView('templates');
    setNoticeModal({
      mode: 'template',
      initialSegments: ['todos'],
      directUser: null,
      initialNotice: template,
    });
  };

  const handleDeleteTemplate = async (templateId) => {
    const response = await deleteAdminNoticeTemplate(templateId);

    setDirectory((current) => ({
      ...current,
      templates: current.templates.filter((template) => String(template.id) !== String(templateId)),
    }));

    return response;
  };

  const handleUseTemplate = async (template) => {
    const response = await registerAdminNoticeTemplateUse(template.id);
    const updatedTemplate = response?.data || template;

    setDirectory((current) => ({
      ...current,
      templates: current.templates.map((item) => (
        String(item.id) === String(template.id) ? updatedTemplate : item
      )),
    }));
    setActiveView('communications');
    setNoticeModal({
      mode: 'notice',
      initialSegments: ['todos'],
      directUser: null,
      initialNotice: updatedTemplate,
      fromTemplate: true,
    });

    return response;
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
    if (payload.isTemplate) {
      const templatePayload = {
        titulo: payload.titulo,
        cuerpo: payload.contenido,
        tipo: payload.tipo,
        urgencia: payload.urgencia,
        canales: ['inapp'],
      };
      const response = payload.templateId
        ? await updateAdminNoticeTemplate(payload.templateId, templatePayload)
        : await createAdminNoticeTemplate(templatePayload);
      const template = response?.data;

      if (template) {
        setDirectory((current) => ({
          ...current,
          templates: payload.templateId
            ? current.templates.map((item) => (
              String(item.id) === String(payload.templateId) ? template : item
            ))
            : [template, ...current.templates],
        }));
      }

      return response;
    }

    const isGlobalNotice = !payload.forceUserNotice
      && !payload.directUser
      && Array.isArray(payload.segmentos)
      && payload.segmentos.length === 1
      && payload.segmentos[0] === 'todos'
      && USER_GLOBAL_NOTICE_TYPES.some((type) => type.id === payload.tipo);
    const globalNoticePayload = {
        tipo: payload.tipo,
        titulo: payload.titulo,
        mensaje: payload.contenido,
        estado: 'activo',
        prioridad: payload.prioridad || toAdminNoticePriority(payload.urgencia),
        visible_desde: payload.visible_desde || null,
        visible_hasta: payload.visible_hasta || null,
      };
    const response = isGlobalNotice
      ? (payload.noticeId
        ? await updateGlobalAdminNotice(payload.noticeId, globalNoticePayload)
        : await createGlobalAdminNotice(globalNoticePayload))
      : await sendAdminNotice(payload);
    const notice = response?.data || {};
    const createdAt = notice.created_at || new Date().toISOString();
    const noticeId = notice.id_aviso || notice.id_envio || payload.noticeId;
    const isIndividualNotice = !isGlobalNotice && (payload.directUser || (notice.destinatarios || payload.destinatarios?.length) === 1);
    const canDuplicateNotice = !isGlobalNotice
      && !isIndividualNotice
      && Array.isArray(payload.segmentos)
      && payload.segmentos.length > 0;
    const nextCommunication = {
      id: isGlobalNotice ? `global_${noticeId}` : noticeId,
      id_aviso: notice.id_aviso || payload.noticeId || undefined,
      source: isGlobalNotice ? 'global_aviso' : 'admin_notification',
      audience_kind: isGlobalNotice ? 'global' : (isIndividualNotice ? 'individual' : 'segmentada'),
      id_notificacion: notice.id_notificacion || undefined,
      titulo: notice.titulo || payload.titulo,
      cuerpo: notice.mensaje || notice.contenido || payload.contenido,
      tipo: notice.tipo || payload.tipo,
      urgencia: notice.urgencia || notice.prioridad || payload.urgencia,
      prioridad: notice.prioridad || payload.prioridad || toAdminNoticePriority(payload.urgencia),
      canales: notice.canales || ['inapp'],
      destinatarios: notice.destinatarios || 0,
      creado: new Date(createdAt).toLocaleString('es-BO'),
      estado: notice.estado || (isGlobalNotice ? 'activo' : 'enviado'),
      estado_aviso: isGlobalNotice ? (notice.estado || 'activo') : undefined,
      segmentos: notice.segmentos || payload.segmentos || [],
      editable: isGlobalNotice,
      deletable: isGlobalNotice,
      actions: isGlobalNotice
        ? ['edit', 'toggle_status', 'delete']
        : (canDuplicateNotice ? ['view', 'duplicate'] : ['view']),
    };

    setDirectory((current) => ({
      ...current,
      communications: payload.noticeId
        ? current.communications.map((item) => (
          String(item.id_aviso || item.id_comunicacion || item.id) === String(payload.noticeId)
            || String(item.id) === `global_${payload.noticeId}`
            ? {
              ...item,
              ...nextCommunication,
              destinatarios: nextCommunication.destinatarios || current.items.length,
            }
            : item
        ))
        : [
          {
            ...nextCommunication,
            destinatarios: nextCommunication.destinatarios || current.items.length,
          },
          ...current.communications,
        ],
      history: [
        {
          id: noticeId,
          titulo: notice.titulo || payload.titulo,
          cuerpo: notice.mensaje || notice.contenido || payload.contenido,
          tipo: notice.tipo || payload.tipo,
          estado: notice.estado || (isGlobalNotice ? 'activo' : 'enviado'),
          destinatarios: notice.destinatarios || (isGlobalNotice ? current.items.length : 0),
          creado: new Date(createdAt).toLocaleString('es-BO'),
          canales: notice.canales || ['inapp'],
        },
        ...current.history,
      ].slice(0, 20),
    }));

    return response;
  };

  const normalizeGlobalNoticeForDirectory = (notice = {}, fallbackNoticeId = null) => {
    const noticeId = notice.id_aviso || fallbackNoticeId;
    const createdAt = notice.created_at || new Date().toISOString();

    return {
      id: `global_${noticeId}`,
      source: 'global_aviso',
      id_aviso: noticeId,
      titulo: notice.titulo || '',
      cuerpo: notice.mensaje || notice.contenido || '',
      tipo: notice.tipo || USER_GLOBAL_NOTICE_TYPES[0]?.id,
      estado: notice.estado === 'activo' ? 'enviado' : 'archivado',
      estado_aviso: notice.estado || 'activo',
      urgencia: notice.urgencia || notice.prioridad || 'baja',
      prioridad: notice.prioridad || toAdminNoticePriority(notice.urgencia),
      canales: notice.canales || ['inapp'],
      destinatarios: users.length,
      creado: new Date(createdAt).toLocaleString('es-BO'),
      created_at: createdAt,
      segmentos: ['todos'],
      editable: true,
      deletable: true,
      actions: ['edit', 'toggle_status', 'delete'],
    };
  };

  const handleToggleGlobalNoticeStatus = async (notice) => {
    const noticeId = notice?.id_aviso;
    if (!noticeId) return null;

    const nextEstado = notice.status === 'archivado' || notice.estado === 'archivado'
      ? 'activo'
      : 'inactivo';
    const response = await updateGlobalAdminNoticeStatus(noticeId, nextEstado);
    const updatedNotice = normalizeGlobalNoticeForDirectory(response?.data || {}, noticeId);

    setDirectory((current) => ({
      ...current,
      communications: current.communications.map((item) => (
        String(item.id_aviso || item.id) === String(noticeId) || String(item.id) === `global_${noticeId}`
          ? {
            ...item,
            ...updatedNotice,
            destinatarios: item.destinatarios || current.items.length,
          }
          : item
      )),
    }));

    return response;
  };

  const handleDeleteGlobalNotice = async (notice) => {
    const noticeId = notice?.id_aviso;
    if (!noticeId) return null;

    const response = await deleteGlobalAdminNotice(noticeId);

    setDirectory((current) => ({
      ...current,
      communications: current.communications.filter((item) => (
        String(item.id_aviso || item.id) !== String(noticeId)
        && String(item.id) !== `global_${noticeId}`
      )),
      history: current.history.filter((item) => (
        String(item.id_aviso || item.id) !== String(noticeId)
        && String(item.id) !== `global_${noticeId}`
      )),
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
    onDeleteTemplate: handleDeleteTemplate,
    onUseTemplate: handleUseTemplate,
    onOpenDirectNoticeModal: handleOpenDirectNoticeModal,
    onCloseNoticeModal: handleCloseNoticeModal,
    onSendNotice: handleSendNotice,
    onToggleGlobalNoticeStatus: handleToggleGlobalNoticeStatus,
    onDeleteGlobalNotice: handleDeleteGlobalNotice,
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
