import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../../../core/i18n';
import {
  applyAdminEventAction,
  approvePublisherRequest,
  buildEventMetrics,
  buildEventWorkspaceCounts,
  createAdminEvent,
  createAdminEventCommunication,
  createAdminEventTemplate,
  createEventsWorkspaceShell,
  fetchEventsWorkspace,
  normalizeEvent,
  normalizeEventCommunication,
  normalizeEventHistoryItem,
  normalizePublisherRequest,
  normalizeEventTemplate,
  normalizeEventsWorkspace,
  rejectPublisherRequest,
  updateAdminEvent,
  updateAdminEventCommunication,
  updateAdminEventTemplate,
} from '../services/eventsService';

export function useEventsWorkspace() {
  const { t } = useLanguage();
  const [workspace, setWorkspace] = useState(() => normalizeEventsWorkspace(createEventsWorkspaceShell()));
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeView, setActiveView] = useState('requests');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [eventModal, setEventModal] = useState(null);
  const [communicationModal, setCommunicationModal] = useState(null);

  const loadWorkspace = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const nextWorkspace = await fetchEventsWorkspace();
      setWorkspace(nextWorkspace);
    } catch (error) {
      setWorkspace(normalizeEventsWorkspace(createEventsWorkspaceShell()));
      setErrorMessage(error.message || t('adminEvents.eventsPage.loadWorkspaceError'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  const events = useMemo(
    () => workspace.events.map(normalizeEvent),
    [workspace.events],
  );
  const publisherRequests = useMemo(
    () => (workspace.publisherRequests || []).map(normalizePublisherRequest),
    [workspace.publisherRequests],
  );
  const communications = useMemo(
    () => workspace.communications.map(normalizeEventCommunication),
    [workspace.communications],
  );
  const templates = useMemo(
    () => workspace.templates.map(normalizeEventTemplate),
    [workspace.templates],
  );
  const historyItems = useMemo(
    () => workspace.history.map(normalizeEventHistoryItem),
    [workspace.history],
  );

  const pageSize = workspace.pageSize;
  const sourceReady = !!workspace.sourceReady;
  const supportsMutations = !!workspace.supportsMutations;

  const metrics = useMemo(
    () => buildEventMetrics(events, communications, publisherRequests),
    [communications, events, publisherRequests],
  );

  const viewCounts = useMemo(() => buildEventWorkspaceCounts({
    sourceReady,
    events,
    requests: publisherRequests,
    communications,
    templates,
    history: historyItems,
  }), [communications, events, historyItems, publisherRequests, sourceReady, templates]);

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return events.filter((event) => {
      const matchesStatus = statusFilter === 'todos' || event.status === statusFilter;
      const matchesType = typeFilter === 'todos' || event.type === typeFilter;

      if (!matchesStatus || !matchesType) return false;
      if (!normalizedQuery) return true;

      return [
        event.title,
        event.description,
        event.type,
        event.status,
        event.location,
        event.date,
      ].some((value) => String(value || '').toLowerCase().includes(normalizedQuery));
    });
  }, [events, query, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * pageSize;
  const visibleEvents = filteredEvents.slice(pageStart, pageStart + pageSize);

  const paginationItems = useMemo(() => {
    const visibleCount = Math.min(3, totalPages);
    const start = totalPages <= 3
      ? 1
      : Math.max(1, Math.min(safeCurrentPage - 1, totalPages - 2));

    return Array.from({ length: visibleCount }, (_, index) => start + index);
  }, [safeCurrentPage, totalPages]);

  const statusCounts = useMemo(() => ({
    todos: events.length,
    activo: events.filter((event) => event.status === 'activo').length,
    programado: events.filter((event) => event.status === 'programado').length,
    borrador: events.filter((event) => event.status === 'borrador').length,
    cancelado: events.filter((event) => event.status === 'cancelado').length,
  }), [events]);

  const pageSummary = useMemo(() => {
    if (!sourceReady) return t('adminEvents.pagination.noRecords');
    if (!filteredEvents.length) return t('adminEvents.pagination.noResults');

    const start = (safeCurrentPage - 1) * pageSize + 1;
    const end = Math.min(safeCurrentPage * pageSize, filteredEvents.length);

    return t('adminEvents.pagination.showingEvents', {
      start,
      end,
      count: filteredEvents.length,
    });
  }, [filteredEvents.length, pageSize, safeCurrentPage, sourceReady, t]);

  const emptyState = useMemo(() => {
    if (!sourceReady) {
      return {
        title: t('adminEvents.empty.noRegistered.title'),
        description: t('adminEvents.empty.noRegistered.description'),
      };
    }

    if (query.trim() || statusFilter !== 'todos' || typeFilter !== 'todos') {
      return {
        title: t('adminEvents.empty.notFound.title'),
        description: t('adminEvents.empty.notFound.description'),
      };
    }

    return {
      title: t('adminEvents.empty.available.title'),
      description: t('adminEvents.empty.available.description'),
    };
  }, [query, sourceReady, statusFilter, t, typeFilter]);

  const handleViewChange = (nextView) => {
    setActiveView(nextView);
  };

  const handleQueryChange = (nextQuery) => {
    setQuery(nextQuery);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (nextFilter) => {
    setStatusFilter(nextFilter);
    setCurrentPage(1);
  };

  const handleTypeFilterChange = (nextFilter) => {
    setTypeFilter(nextFilter);
    setCurrentPage(1);
  };

  const handleGoToPage = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  const handleOpenCreateEvent = () => {
    setActiveView('events');
    setEventModal({ mode: 'create', event: null });
  };

  const handleOpenEditEvent = (event) => {
    setActiveView('events');
    setEventModal({ mode: 'edit', event });
  };

  const handleCloseEventModal = () => {
    setEventModal(null);
  };

  const handleOpenCommunication = (event = null) => {
    setActiveView('communications');
    setCommunicationModal({
      mode: 'communication',
      event,
      template: null,
    });
  };

  const handleOpenTemplateCommunication = (template = null) => {
    setActiveView('templates');
    setCommunicationModal({
      mode: 'template',
      event: null,
      template,
    });
  };

  const handleEditCommunication = (communication) => {
    setActiveView('communications');
    setCommunicationModal({
      mode: 'communication',
      event: events.find((event) => String(event.id) === String(communication.eventId)) || null,
      communication,
      template: null,
    });
  };

  const handleCloseCommunicationModal = () => {
    setCommunicationModal(null);
  };

  const handleSaveEvent = async (payload) => {
    if (eventModal?.mode === 'edit' && eventModal.event?.id) {
      await updateAdminEvent(eventModal.event.id, payload);
    } else {
      await createAdminEvent(payload);
    }

    await loadWorkspace();
    setEventModal(null);
  };

  const handleSaveCommunication = async (payload) => {
    if (communicationModal?.mode === 'template') {
      if (communicationModal.template?.id) {
        await updateAdminEventTemplate(communicationModal.template.id, payload);
      } else {
        await createAdminEventTemplate(payload);
      }
    } else if (communicationModal?.communication?.id) {
      await updateAdminEventCommunication(communicationModal.communication.id, payload);
    } else {
      await createAdminEventCommunication(payload);
    }

    await loadWorkspace();
    setCommunicationModal(null);
  };

  const handleAdminAction = async ({ action, target, reason }) => {
    if (action === 'aceptar') {
      await approvePublisherRequest(target.id, reason);
    } else if (action === 'rechazar') {
      await rejectPublisherRequest(target.id, reason);
    } else {
      await applyAdminEventAction(target.id, action, reason);
    }

    await loadWorkspace();
  };

  return {
    sourceReady,
    supportsMutations,
    isLoading,
    errorMessage,
    events,
    publisherRequests,
    communications,
    templates,
    historyItems,
    metrics,
    activeView,
    viewCounts,
    query,
    statusFilter,
    typeFilter,
    statusCounts,
    filteredEvents,
    visibleEvents,
    pageSummary,
    emptyState,
    currentPage: safeCurrentPage,
    totalPages,
    paginationItems,
    eventModal,
    communicationModal,
    onViewChange: handleViewChange,
    onQueryChange: handleQueryChange,
    onStatusFilterChange: handleStatusFilterChange,
    onTypeFilterChange: handleTypeFilterChange,
    onGoToPage: handleGoToPage,
    onOpenCreateEvent: handleOpenCreateEvent,
    onOpenEditEvent: handleOpenEditEvent,
    onCloseEventModal: handleCloseEventModal,
    onSaveEvent: handleSaveEvent,
    onOpenCommunication: handleOpenCommunication,
    onOpenTemplateCommunication: handleOpenTemplateCommunication,
    onEditCommunication: handleEditCommunication,
    onCloseCommunicationModal: handleCloseCommunicationModal,
    onSaveCommunication: handleSaveCommunication,
    onAdminAction: handleAdminAction,
  };
}
