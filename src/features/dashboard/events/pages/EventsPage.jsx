import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BsCalendar2Plus,
  BsCalendar3,
  BsCheck2Circle,
  BsExclamationTriangle,
  BsLock,
  BsShieldCheck,
} from 'react-icons/bs';
import Header from '../../layout/Header';
import { useLanguage } from '../../../../core/i18n';
import { getStoredUser, isPublisherUser } from '../../../../shared/utils/authStorage';
import ConfirmModal from '../../../../shared/ui/ConfirmModal';
import BackgroundSaveIndicator from '../../../../shared/ui/BackgroundSaveIndicator';
import EventFormModal from '../../../admin/events/components/EventFormModal';
import EventsCalendar from '../../../admin/events/components/EventsCalendar';
import EventsFilters from '../../../admin/events/components/EventsFilters';
import EventsGrid from '../../../admin/events/components/EventsGrid';
import {
  EVENT_PAGE_SIZE,
  buildEventMetrics,
  createPublisherEvent,
  createPublisherRequest,
  fetchEventProfileTargets,
  fetchPublisherEvents,
  normalizeEvent,
  updatePublisherEvent,
} from '../../../admin/events/services/eventsService';
import '../../../admin/events/styles/events.css';
import '../styles/dashboard-events.css';
import PublisherPermissionModal from '../components/PublisherPermissionModal';
import {
  DashboardCalendarIcon,
  DashboardCheckIcon,
  DashboardEventsIcon,
  DashboardStatusIcon,
} from '../../layout/DashboardIcons';

const MONTHLY_LIMIT = 3;

const PUBLISHER_TABS = [
  { id: 'events', labelKey: 'adminEvents.dashboard.tab.events', icon: BsCalendar2Plus },
  { id: 'calendar', labelKey: 'adminEvents.dashboard.tab.calendar', icon: BsCalendar3 },
];

function isSameMonth(dateValue, date = new Date()) {
  if (!dateValue) return false;
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.getFullYear() === date.getFullYear() && parsed.getMonth() === date.getMonth();
}

function buildPublisherStatusPayload(event, status) {
  return {
    title: event.title,
    type: event.type,
    status,
    startsAt: event.startsAt || event.raw?.fecha_inicio || null,
    endsAt: event.endsAt || event.raw?.fecha_fin || null,
    sendAt: status === 'programado' ? (event.sendAt || event.raw?.programado_para || null) : null,
    location: event.location,
    imageUrl: event.imageUrl || '',
    capacity: Number(event.capacity || 0),
    description: event.description || '',
    targetMode: event.targetMode || event.raw?.targetMode || event.raw?.target_mode || 'all_users',
    targetSelections: event.targetSelections || event.raw?.targetSelections || event.raw?.target_selections || {},
  };
}

export default function DashboardEventsPage() {
  const { t } = useLanguage();
  const user = getStoredUser();
  const canPublish = isPublisherUser(user);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [notice, setNotice] = useState('');
  const [activeView, setActiveView] = useState('events');
  const [eventModal, setEventModal] = useState(null);
  const [events, setEvents] = useState([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [profileTargets, setProfileTargets] = useState(null);
  const [profileTargetsLoading, setProfileTargetsLoading] = useState(false);
  const [eventSavingCount, setEventSavingCount] = useState(0);
  const [savingEventIds, setSavingEventIds] = useState([]);
  const [pendingEventSave, setPendingEventSave] = useState(null);
  const eventSaving = eventSavingCount > 0;

  const loadEvents = useCallback(async () => {
    if (!canPublish) return;

    try {
      const data = await fetchPublisherEvents();
      setEvents(data);
      setNotice('');
    } catch (error) {
      setNotice(error.message || t('adminEvents.dashboard.noLoadEvents'));
    }
  }, [canPublish, t]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    if (!canPublish) return undefined;

    let active = true;
    setProfileTargetsLoading(true);

    fetchEventProfileTargets()
      .then((targets) => {
        if (active) setProfileTargets(targets);
      })
      .catch(() => {
        if (active) setProfileTargets(null);
      })
      .finally(() => {
        if (active) setProfileTargetsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [canPublish]);

  const normalizedEvents = useMemo(
    () => events.map(normalizeEvent),
    [events],
  );
  const metrics = useMemo(() => buildEventMetrics(normalizedEvents, []), [normalizedEvents]);
  const currentMonthCount = normalizedEvents.filter((event) => isSameMonth(event.startsAt || event.date)).length;
  const remainingThisMonth = Math.max(MONTHLY_LIMIT - currentMonthCount, 0);
  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return normalizedEvents.filter((event) => {
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
  }, [normalizedEvents, query, statusFilter, typeFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / EVENT_PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const visibleEvents = filteredEvents.slice((safeCurrentPage - 1) * EVENT_PAGE_SIZE, safeCurrentPage * EVENT_PAGE_SIZE);
  const paginationItems = useMemo(() => {
    const visibleCount = Math.min(3, totalPages);
    const start = totalPages <= 3
      ? 1
      : Math.max(1, Math.min(safeCurrentPage - 1, totalPages - 2));

    return Array.from({ length: visibleCount }, (_, index) => start + index);
  }, [safeCurrentPage, totalPages]);
  const statusCounts = useMemo(() => ({
    todos: normalizedEvents.length,
    activo: normalizedEvents.filter((event) => event.status === 'activo').length,
    programado: normalizedEvents.filter((event) => event.status === 'programado').length,
    borrador: normalizedEvents.filter((event) => event.status === 'borrador').length,
    pausado: normalizedEvents.filter((event) => event.status === 'pausado').length,
    suspendido: normalizedEvents.filter((event) => event.status === 'suspendido').length,
    cancelado: normalizedEvents.filter((event) => event.status === 'cancelado').length,
  }), [normalizedEvents]);
  const pageSummary = filteredEvents.length
    ? t('adminEvents.pagination.showingEvents', {
      start: ((safeCurrentPage - 1) * EVENT_PAGE_SIZE) + 1,
      end: Math.min(safeCurrentPage * EVENT_PAGE_SIZE, filteredEvents.length),
      count: filteredEvents.length,
    })
    : t('adminEvents.pagination.noResults');

  const emptyState = query.trim() || statusFilter !== 'todos' || typeFilter !== 'todos'
    ? {
      title: t('adminEvents.empty.notFound.title'),
      description: t('adminEvents.empty.notFound.description'),
    }
    : {
      title: t('adminEvents.empty.available.title'),
      description: t('adminEvents.empty.available.description'),
    };
  const handleGoToPage = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
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

  const headerActions = canPublish ? [
    {
      key: 'create-event',
      label: remainingThisMonth > 0 ? t('adminEvents.dashboard.addEvent') : t('adminEvents.dashboard.monthlyLimit'),
      icon: <BsCalendar2Plus />,
      variant: 'primary',
      disabled: remainingThisMonth <= 0,
      onClick: () => setEventModal({ mode: 'create', event: null }),
    },
  ] : [
    {
      key: 'request-permission',
      label: requestSent ? t('adminEvents.dashboard.requestSent') : t('adminEvents.dashboard.requestPermission'),
      icon: requestSent ? <BsCheck2Circle /> : <BsShieldCheck />,
      variant: requestSent ? 'secondary' : 'primary',
      disabled: requestSent,
      onClick: () => setPermissionModalOpen(true),
    },
  ];

  const getPublisherStatusActions = (event) => {
    const actions = [
      {
        id: 'editar',
        labelKey: 'adminEvents.action.editar',
        icon: 'edit',
        variant: 'primary',
      },
    ];

    if (['pausado', 'suspendido', 'cancelado'].includes(event.status)) {
      return actions;
    }

    if (event.status === 'borrador') {
      return [
        ...actions,
        {
          id: 'activar',
          labelKey: 'adminEvents.action.activar',
          status: 'activo',
          icon: 'play',
          variant: 'primary',
        },
        {
          id: 'cancelar',
          labelKey: 'adminEvents.action.cancelar',
          status: 'cancelado',
          icon: 'cancel',
          variant: 'danger',
        },
      ];
    }

    return [
      ...actions,
      {
        id: 'borrador',
        labelKey: 'adminEvents.action.borrador',
        status: 'borrador',
        icon: 'draft',
        variant: 'ghost',
      },
      {
        id: 'cancelar',
        labelKey: 'adminEvents.action.cancelar',
        status: 'cancelado',
        icon: 'cancel',
        variant: 'danger',
      },
    ];
  };

  const handleRequestSaveEvent = (payload) => {
    if (remainingThisMonth <= 0 && eventModal?.mode !== 'edit') {
      throw new Error(t('adminEvents.dashboard.limitReachedError'));
    }

    setPendingEventSave({
      payload,
      mode: eventModal?.mode || 'create',
      eventId: eventModal?.event?.id || null,
    });
  };

  const handleCancelConfirmSave = () => {
    setPendingEventSave(null);
  };

  const handleConfirmSaveEvent = async () => {
    if (!pendingEventSave) return;

    const saveContext = pendingEventSave;

    setPendingEventSave(null);
    setEventModal(null);
    setEventSavingCount((count) => count + 1);
    if (saveContext.eventId) {
      setSavingEventIds((current) => (
        current.includes(String(saveContext.eventId)) ? current : [...current, String(saveContext.eventId)]
      ));
    }

    try {
      if (saveContext.mode === 'edit' && saveContext.eventId) {
        await updatePublisherEvent(saveContext.eventId, saveContext.payload);
      } else {
        await createPublisherEvent(saveContext.payload);
      }

      await loadEvents();
      setNotice(saveContext.mode === 'edit'
        ? t('adminEvents.dashboard.updatedNotice')
        : t('adminEvents.dashboard.savedNotice'));
    } catch (error) {
      setNotice(error.message || t('adminEvents.form.validation.saveError'));
    } finally {
      setEventSavingCount((count) => Math.max(0, count - 1));
      if (saveContext.eventId) {
        setSavingEventIds((current) => current.filter((id) => id !== String(saveContext.eventId)));
      }
    }
  };

  const handlePublisherStatusAction = async (event, action) => {
    if (action?.id === 'editar') {
      if (savingEventIds.includes(String(event?.id))) return;
      setEventModal({ mode: 'edit', event });
      return;
    }

    if (!event?.id || !action?.status) return;

    setEventSavingCount((count) => count + 1);
    setSavingEventIds((current) => (
      current.includes(String(event.id)) ? current : [...current, String(event.id)]
    ));

    try {
      await updatePublisherEvent(event.id, buildPublisherStatusPayload(event, action.status));
      await loadEvents();
      setNotice(t('adminEvents.dashboard.statusUpdated'));
    } catch (error) {
      setNotice(error.message || t('adminEvents.dashboard.statusUpdateError'));
    } finally {
      setEventSavingCount((count) => Math.max(0, count - 1));
      setSavingEventIds((current) => current.filter((id) => id !== String(event.id)));
    }
  };

  const handleSubmitPermission = async (payload) => {
    await createPublisherRequest(payload);
    setRequestSent(true);
    setPermissionModalOpen(false);
    setNotice(t('adminEvents.dashboard.requestReviewNotice'));
  };

  return (
    <div className="dbe-page">
      <Header
        eyebrow={t('adminEvents.dashboard.eyebrow')}
        title={t('adminEvents.dashboard.title')}
        actions={headerActions}
      />

      <div className="dbe-content">
        {notice ? (
          <div className="evt-admin-notice">{notice}</div>
        ) : null}

        {!canPublish ? (
          <section className="dbe-gate">
            <div className="dbe-gate-hero">
              <span className="dbe-gate-icon">
                <BsLock />
              </span>
              <div>
                <span className="dbe-kicker">{t('adminEvents.dashboard.permissionAccess')}</span>
                <h2>{t('adminEvents.dashboard.permissionTitle')}</h2>
                <p>{t('adminEvents.dashboard.permissionDescription')}</p>
              </div>
            </div>

            {requestSent ? (
              <div className="dbe-request-status">
                <BsCheck2Circle />
                <span>{t('adminEvents.dashboard.requestPrepared')}</span>
              </div>
            ) : null}

            <div className="dbe-requirement-grid">
              <article>
                <BsShieldCheck />
                <strong>{t('adminEvents.dashboard.identityTitle')}</strong>
                <p>{t('adminEvents.dashboard.identityDescription')}</p>
              </article>
              <article>
                <BsCalendar2Plus />
                <strong>{t('adminEvents.dashboard.reasonTitle')}</strong>
                <p>{t('adminEvents.dashboard.reasonDescription')}</p>
              </article>
              <article>
                <BsExclamationTriangle />
                <strong>{t('adminEvents.dashboard.responsibilityTitle')}</strong>
                <p>{t('adminEvents.dashboard.responsibilityDescription')}</p>
              </article>
            </div>

            <div className="dbe-note-panel">
              <strong>{t('adminEvents.dashboard.whenPublisherTitle')}</strong>
              <p>{t('adminEvents.dashboard.whenPublisherDescription')}</p>
              <button type="button" className="evt-context-btn evt-context-btn--primary" onClick={() => setPermissionModalOpen(true)}>
                <BsShieldCheck />
                {t('adminEvents.dashboard.requestPermissions')}
              </button>
            </div>
          </section>
        ) : (
          <>
            <section className="dbe-quota">
              <div>
                <span className="dbe-kicker">{t('adminEvents.dashboard.monthlyLimit')}</span>
                <strong>{t('adminEvents.dashboard.monthlyCreated', { current: currentMonthCount, limit: MONTHLY_LIMIT })}</strong>
                <p>{t('adminEvents.dashboard.monthlyDescription')}</p>
              </div>
              <span className={`dbe-quota-pill${remainingThisMonth <= 0 ? ' locked' : ''}`}>
                {remainingThisMonth > 0 ? t('adminEvents.dashboard.available', { count: remainingThisMonth }) : t('adminEvents.dashboard.limitReached')}
              </span>
            </section>

            <section className="dbe-publisher-stats" aria-label={t('adminEvents.dashboard.publisherSummaryAria')}>
              <article>
                <div className="dbe-stat-icon"><DashboardEventsIcon /></div>
                <div>
                  <strong>{metrics.total}</strong>
                  <span>{t('adminEvents.dashboard.totalEvents')}</span>
                </div>
              </article>
              <article>
                <div className="dbe-stat-icon"><DashboardCheckIcon /></div>
                <div>
                  <strong>{metrics.activo}</strong>
                  <span>{t('adminEvents.dashboard.active')}</span>
                </div>
              </article>
              <article>
                <div className="dbe-stat-icon"><DashboardCalendarIcon /></div>
                <div>
                  <strong>{metrics.programado}</strong>
                  <span>{t('adminEvents.dashboard.scheduled')}</span>
                </div>
              </article>
              <article>
                <div className="dbe-stat-icon"><DashboardStatusIcon /></div>
                <div>
                  <strong>{remainingThisMonth}/{MONTHLY_LIMIT}</strong>
                  <span>{t('adminEvents.dashboard.monthlyQuota')}</span>
                </div>
              </article>
            </section>

            <section className="evt-panel">
              <div className="evt-tabs-wrap">
                <div className="evt-tabs" role="tablist" aria-label={t('adminEvents.dashboard.publisherViewsAria')}>
                  {PUBLISHER_TABS.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        className={`evt-tab${activeView === tab.id ? ' active' : ''}`}
                        onClick={() => setActiveView(tab.id)}
                      >
                        <Icon />
                        <span>{t(tab.labelKey)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {activeView === 'events' ? (
                <>
                  <div className="dbe-admin-state-note">
                    <BsExclamationTriangle />
                    <span>{t('adminEvents.dashboard.adminStateNote')}</span>
                  </div>

                  <EventsFilters
                    query={query}
                    statusFilter={statusFilter}
                    typeFilter={typeFilter}
                    statusCounts={statusCounts}
                    sourceReady
                    showSyncStatus={false}
                    onQueryChange={handleQueryChange}
                    onStatusFilterChange={handleStatusFilterChange}
                    onTypeFilterChange={handleTypeFilterChange}
                  />

                  <EventsGrid
                    events={visibleEvents}
                    sourceReady
                    emptyState={emptyState}
                    pageSummary={pageSummary}
                    currentPage={safeCurrentPage}
                    totalPages={totalPages}
                    paginationItems={paginationItems}
                    onGoToPage={handleGoToPage}
                    onEditEvent={(event) => setEventModal({ mode: 'edit', event })}
                    onStatusAction={handlePublisherStatusAction}
                    getStatusActions={getPublisherStatusActions}
                    showCommunicationAction={false}
                    showCommunicationsMeta={false}
                    showPrimaryAction={false}
                    emptyHint={t('adminEvents.dashboard.firstEventHint')}
                  />
                </>
              ) : null}

              {activeView === 'calendar' ? (
                <EventsCalendar
                  events={normalizedEvents}
                  showActions={false}
                />
              ) : null}

            </section>
          </>
        )}
      </div>

      <PublisherPermissionModal
        open={permissionModalOpen}
        user={user}
        onClose={() => setPermissionModalOpen(false)}
        onSubmit={handleSubmitPermission}
      />

      <EventFormModal
        modal={eventModal}
        profileTargets={profileTargets}
        profileTargetsLoading={profileTargetsLoading}
        onClose={() => setEventModal(null)}
        onSave={handleRequestSaveEvent}
      />

      <ConfirmModal
        open={!!pendingEventSave}
        variant="blue"
        icon="check"
        title={pendingEventSave?.mode === 'edit'
          ? t('adminEvents.dashboard.saveEditTitle')
          : t('adminEvents.dashboard.saveCreateTitle')}
        subtitle={t('adminEvents.dashboard.saveConfirmSubtitle')}
        message={pendingEventSave?.mode === 'edit'
          ? t('adminEvents.dashboard.saveEditMessage')
          : t('adminEvents.dashboard.saveCreateMessage')}
        confirmLabel={t('adminEvents.common.save')}
        cancelLabel={t('adminEvents.common.cancel')}
        onConfirm={handleConfirmSaveEvent}
        onClose={handleCancelConfirmSave}
      />

      <BackgroundSaveIndicator active={eventSaving} label={t('adminEvents.dashboard.savingEvent')} />
    </div>
  );
}
