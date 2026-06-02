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
  fetchPublisherEvents,
  getEventsEmptyState,
  getEventsPageSummary,
  normalizeEvent,
  updatePublisherEvent,
} from '../../../admin/events/services/eventsService';
import '../../../admin/events/styles/events.css';
import '../styles/dashboard-events.css';
import PublisherPermissionModal from '../components/PublisherPermissionModal';

const MONTHLY_LIMIT = 3;

const PUBLISHER_TABS = [
  { id: 'events', label: 'Mis eventos', icon: BsCalendar2Plus },
  { id: 'calendar', label: 'Calendario', icon: BsCalendar3 },
  { id: 'templates', label: 'Plantillas', icon: BsFileEarmarkText },
];

function isSameMonth(dateValue, date = new Date()) {
  if (!dateValue) return false;
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.getFullYear() === date.getFullYear() && parsed.getMonth() === date.getMonth();
}

export default function DashboardEventsPage() {
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

  const loadEvents = useCallback(async () => {
    if (!canPublish) return;

    try {
      const data = await fetchPublisherEvents();
      setEvents(data);
      setNotice('');
    } catch (error) {
      setNotice(error.message || 'No se pudieron cargar tus eventos.');
    }
  }, [canPublish]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

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
  const pageSummary = getEventsPageSummary({
    sourceReady: true,
    filteredCount: filteredEvents.length,
    currentPage: safeCurrentPage,
    pageSize: EVENT_PAGE_SIZE,
  });
  const emptyState = getEventsEmptyState({
    sourceReady: true,
    hasQuery: !!query.trim(),
    hasFilters: statusFilter !== 'todos' || typeFilter !== 'todos',
  });
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
      label: remainingThisMonth > 0 ? 'Agregar evento' : 'Limite mensual',
      icon: <BsCalendar2Plus />,
      variant: 'primary',
      disabled: remainingThisMonth <= 0,
      onClick: () => setEventModal({ mode: 'create', event: null }),
    },
  ] : [
    {
      key: 'request-permission',
      label: requestSent ? 'Solicitud enviada' : 'Solicitar permiso',
      icon: requestSent ? <BsCheck2Circle /> : <BsShieldCheck />,
      variant: requestSent ? 'secondary' : 'primary',
      disabled: requestSent,
      onClick: () => setPermissionModalOpen(true),
    },
  ];

  const handleSaveEvent = async (payload) => {
    if (remainingThisMonth <= 0 && eventModal?.mode !== 'edit') {
      throw new Error('Ya alcanzaste el limite de 3 eventos este mes.');
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
    setNotice('Tu solicitud fue enviada para revision administrativa.');
  };

  return (
    <div className="dbe-page">
      <Header
        eyebrow="Publicar"
        title="Eventos"
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
                <span className="dbe-kicker">Acceso con permiso</span>
                <h2>Publicar eventos requiere revision administrativa</h2>
                <p>
                  Este espacio permite solicitar el rol publicador. Antes de habilitar la creacion,
                  administracion revisara tus datos, respaldo de contacto y responsabilidad de uso.
                </p>
              </div>
            </div>

            {requestSent ? (
              <div className="dbe-request-status">
                <BsCheck2Circle />
                <span>Tu solicitud fue preparada para revision.</span>
              </div>
            ) : null}

            <div className="dbe-requirement-grid">
              <article>
                <BsShieldCheck />
                <strong>Identidad verificable</strong>
                <p>Usa datos personales claros, correo de respaldo y canales de contacto reales.</p>
              </article>
              <article>
                <BsFileEarmarkText />
                <strong>Motivo de publicacion</strong>
                <p>Explica que tipo de cursos, trabajos, ferias o convocatorias deseas publicar.</p>
              </article>
              <article>
                <BsExclamationTriangle />
                <strong>Responsabilidad</strong>
                <p>Los eventos deben ser utiles, verificables y respetar las reglas de la plataforma.</p>
              </article>
            </div>

            <div className="dbe-note-panel">
              <strong>Cuando seas publicador</strong>
              <p>Podras crear hasta 3 eventos por mes, revisar tus eventos, consultar el calendario y preparar convocatorias con plantillas.</p>
              <button type="button" className="evt-context-btn evt-context-btn--primary" onClick={() => setPermissionModalOpen(true)}>
                <BsShieldCheck />
                Solicitar permisos
              </button>
            </div>
          </section>
        ) : (
          <>
            <section className="dbe-quota">
              <div>
                <span className="dbe-kicker">Limite mensual</span>
                <strong>{currentMonthCount}/{MONTHLY_LIMIT} eventos creados este mes</strong>
                <p>Puedes publicar hasta 3 eventos por mes. Planifica cursos, trabajos o convocatorias con datos verificables.</p>
              </div>
              <span className={`dbe-quota-pill${remainingThisMonth <= 0 ? ' locked' : ''}`}>
                {remainingThisMonth > 0 ? `${remainingThisMonth} disponibles` : 'Limite alcanzado'}
              </span>
            </section>

            <section className="dbe-publisher-stats" aria-label="Resumen de eventos del publicador">
              <article>
                <span>Total eventos</span>
                <strong>{metrics.total}</strong>
              </article>
              <article>
                <span>Activos</span>
                <strong>{metrics.activo}</strong>
              </article>
              <article>
                <span>Programados</span>
                <strong>{metrics.programado}</strong>
              </article>
              <article>
                <span>Cupo mensual</span>
                <strong>{remainingThisMonth}/{MONTHLY_LIMIT}</strong>
              </article>
            </section>

            <section className="evt-panel">
              <div className="evt-tabs-wrap">
                <div className="evt-tabs" role="tablist" aria-label="Vistas de eventos del publicador">
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
                        <span>{tab.label}</span>
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
                    primaryActionLabel="Editar"
                    emptyHint="Crea tu primer evento cuando tengas una convocatoria lista para publicar."
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
        onClose={() => setEventModal(null)}
        onSave={handleSaveEvent}
      />
    </div>
  );
}
