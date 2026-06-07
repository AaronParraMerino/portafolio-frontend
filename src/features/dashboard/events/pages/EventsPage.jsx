import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BsCalendar2Plus,
  BsCalendar3,
  BsCheck2Circle,
  BsExclamationTriangle,
  BsFileEarmarkText,
  BsLock,
  BsShieldCheck,
} from 'react-icons/bs';
import Header from '../../layout/Header';
import { useLanguage } from '../../../../core/i18n';
import { getStoredUser, isPublisherUser } from '../../../../shared/utils/authStorage';
import EventFormModal from '../../../admin/events/components/EventFormModal';
import EventsCalendar from '../../../admin/events/components/EventsCalendar';
import EventsFilters from '../../../admin/events/components/EventsFilters';
import EventsGrid from '../../../admin/events/components/EventsGrid';
import EventsTemplatesPanel from '../../../admin/events/components/EventsTemplatesPanel';
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

const MONTHLY_LIMIT = 3;

const PUBLISHER_TABS = [
  { id: 'events', labelKey: 'adminEvents.dashboard.tab.events', icon: BsCalendar2Plus },
  { id: 'calendar', labelKey: 'adminEvents.dashboard.tab.calendar', icon: BsCalendar3 },
  { id: 'templates', labelKey: 'adminEvents.dashboard.tab.templates', icon: BsFileEarmarkText },
];

function isSameMonth(dateValue, date = new Date()) {
  if (!dateValue) return false;
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.getFullYear() === date.getFullYear() && parsed.getMonth() === date.getMonth();
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
  const [templates] = useState([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [profileTargets, setProfileTargets] = useState(null);
  const [profileTargetsLoading, setProfileTargetsLoading] = useState(false);

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

  const handleSaveEvent = async (payload) => {
    if (remainingThisMonth <= 0 && eventModal?.mode !== 'edit') {
      throw new Error(t('adminEvents.dashboard.limitReachedError'));
    }

    if (eventModal?.mode === 'edit' && eventModal.event?.id) {
      await updatePublisherEvent(eventModal.event.id, payload);
    } else {
      await createPublisherEvent(payload);
    }

    await loadEvents();
    setEventModal(null);
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
                <BsFileEarmarkText />
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
                <span>{t('adminEvents.dashboard.totalEvents')}</span>
                <strong>{metrics.total}</strong>
              </article>
              <article>
                <span>{t('adminEvents.dashboard.active')}</span>
                <strong>{metrics.activo}</strong>
              </article>
              <article>
                <span>{t('adminEvents.dashboard.scheduled')}</span>
                <strong>{metrics.programado}</strong>
              </article>
              <article>
                <span>{t('adminEvents.dashboard.monthlyQuota')}</span>
                <strong>{remainingThisMonth}/{MONTHLY_LIMIT}</strong>
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
                  <EventsFilters
                    query={query}
                    statusFilter={statusFilter}
                    typeFilter={typeFilter}
                    statusCounts={statusCounts}
                    sourceReady
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
                    showCommunicationAction={false}
                    primaryActionLabel={t('adminEvents.common.edit')}
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

              {activeView === 'templates' ? (
                <EventsTemplatesPanel
                  sourceReady
                  templates={templates}
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
        onSave={handleSaveEvent}
      />
    </div>
  );
}
