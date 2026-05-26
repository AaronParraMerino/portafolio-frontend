import {
  BsCalendar2Plus,
  BsMegaphone,
} from 'react-icons/bs';
import AdminHeader from '../../layout/AdminHeader';
import { getAdminSectionConfig } from '../../layout/adminHeaderConfig';
import EventCommunicationModal from '../components/EventCommunicationModal';
import EventFormModal from '../components/EventFormModal';
import EventsCalendar from '../components/EventsCalendar';
import EventsCommunicationsPanel from '../components/EventsCommunicationsPanel';
import EventsFilters from '../components/EventsFilters';
import EventsGrid from '../components/EventsGrid';
import EventsHistoryPanel from '../components/EventsHistoryPanel';
import EventsStats from '../components/EventsStats';
import EventsTemplatesPanel from '../components/EventsTemplatesPanel';
import EventsWorkspaceTabs from '../components/EventsWorkspaceTabs';
import { useEventsWorkspace } from '../hooks/useEvents';
import '../styles/events.css';

export default function EventsPage() {
  const headerConfig = getAdminSectionConfig('events');
  const {
    sourceReady,
    events,
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
    visibleEvents,
    pageSummary,
    emptyState,
    currentPage,
    totalPages,
    paginationItems,
    eventModal,
    communicationModal,
    errorMessage,
    onViewChange,
    onQueryChange,
    onStatusFilterChange,
    onTypeFilterChange,
    onGoToPage,
    onOpenCreateEvent,
    onOpenEditEvent,
    onCloseEventModal,
    onSaveEvent,
    onOpenCommunication,
    onOpenTemplateCommunication,
    onEditCommunication,
    onCloseCommunicationModal,
    onSaveCommunication,
  } = useEventsWorkspace();

  const headerActions = [
    {
      key: 'communication',
      label: 'Anuncio general',
      title: 'Crear anuncio general',
      ariaLabel: 'Crear anuncio general',
      icon: <BsMegaphone />,
      variant: 'secondary',
      className: 'evt-header-action--muted',
      onClick: () => onOpenCommunication(),
    },
    {
      key: 'event',
      label: 'Crear evento',
      title: 'Crear evento',
      ariaLabel: 'Crear evento',
      icon: <BsCalendar2Plus />,
      variant: 'primary',
      onClick: onOpenCreateEvent,
    },
  ];

  return (
    <div className="evt-page">
      <AdminHeader
        eyebrow={headerConfig.eyebrow}
        title={headerConfig.title}
        actions={headerActions}
      />

      <div className="evt-content">
        <EventsStats metrics={metrics} sourceReady={sourceReady} />

        {errorMessage ? (
          <div className="evt-modal-message">{errorMessage}</div>
        ) : null}

        <section className="evt-panel">
          <EventsWorkspaceTabs
            activeView={activeView}
            counts={viewCounts}
            onViewChange={onViewChange}
          />

          {activeView === 'events' ? (
            <>
              <EventsFilters
                query={query}
                statusFilter={statusFilter}
                typeFilter={typeFilter}
                statusCounts={statusCounts}
                sourceReady={sourceReady}
                onQueryChange={onQueryChange}
                onStatusFilterChange={onStatusFilterChange}
                onTypeFilterChange={onTypeFilterChange}
              />

              <EventsGrid
                events={visibleEvents}
                sourceReady={sourceReady}
                emptyState={emptyState}
                pageSummary={pageSummary}
                currentPage={currentPage}
                totalPages={totalPages}
                paginationItems={paginationItems}
                onGoToPage={onGoToPage}
                onEditEvent={onOpenEditEvent}
                onCommunicate={onOpenCommunication}
              />
            </>
          ) : null}

          {activeView === 'communications' ? (
            <EventsCommunicationsPanel
              sourceReady={sourceReady}
              communications={communications}
              onCreateCommunication={() => onOpenCommunication()}
              onEditCommunication={onEditCommunication}
            />
          ) : null}

          {activeView === 'calendar' ? (
            <EventsCalendar
              events={events}
              onEditEvent={onOpenEditEvent}
              onCommunicate={onOpenCommunication}
            />
          ) : null}

          {activeView === 'history' ? (
            <EventsHistoryPanel
              sourceReady={sourceReady}
              historyItems={historyItems}
            />
          ) : null}

          {activeView === 'templates' ? (
            <EventsTemplatesPanel
              sourceReady={sourceReady}
              templates={templates}
              onCreateTemplate={onOpenTemplateCommunication}
              onUseTemplate={onOpenTemplateCommunication}
            />
          ) : null}
        </section>
      </div>

      <EventFormModal
        modal={eventModal}
        onClose={onCloseEventModal}
        onSave={onSaveEvent}
      />

      <EventCommunicationModal
        modal={communicationModal}
        events={events}
        onClose={onCloseCommunicationModal}
        onSave={onSaveCommunication}
      />
    </div>
  );
}
