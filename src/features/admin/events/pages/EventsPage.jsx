import { useState } from 'react';
import AdminHeader from '../../layout/AdminHeader';
import { getAdminSectionConfig } from '../../layout/adminHeaderConfig';
import AdminEventActionModal from '../components/AdminEventActionModal';
import AdminEventsManagementPanel from '../components/AdminEventsManagementPanel';
import AdminPublisherRequestsPanel from '../components/AdminPublisherRequestsPanel';
import EventsHistoryPanel from '../components/EventsHistoryPanel';
import EventsStats from '../components/EventsStats';
import EventsWorkspaceTabs from '../components/EventsWorkspaceTabs';
import { useEventsWorkspace } from '../hooks/useEvents';
import '../styles/events.css';

export default function EventsPage() {
  const headerConfig = getAdminSectionConfig('events');
  const [actionModal, setActionModal] = useState(null);
  const [actionNotice, setActionNotice] = useState('');
  const {
    sourceReady,
    events,
    publisherRequests,
    historyItems,
    metrics,
    activeView,
    viewCounts,
    errorMessage,
    onViewChange,
    onAdminAction,
  } = useEventsWorkspace();

  const handleOpenAction = (target, action) => {
    setActionModal({ target, action });
    setActionNotice('');
  };

  const handleConfirmAction = async ({ action, target, reason }) => {
    const targetName = target.title || target.name || 'registro';
    try {
      await onAdminAction({ action, target, reason });
      setActionNotice(`Accion "${action}" aplicada para ${targetName}.`);
      setActionModal(null);
    } catch (error) {
      setActionNotice(error.message || `No se pudo aplicar la accion "${action}".`);
    }
  };

  return (
    <div className="evt-page">
      <AdminHeader
        eyebrow={headerConfig.eyebrow}
        title={headerConfig.title}
      />

      <div className="evt-content">
        <EventsStats metrics={metrics} sourceReady={sourceReady} />

        {errorMessage ? (
          <div className="evt-modal-message">{errorMessage}</div>
        ) : null}
        {actionNotice ? (
          <div className="evt-admin-notice">{actionNotice}</div>
        ) : null}

        <section className="evt-panel">
          <EventsWorkspaceTabs
            activeView={activeView}
            counts={viewCounts}
            onViewChange={onViewChange}
          />

          {activeView === 'requests' ? (
            <AdminPublisherRequestsPanel
              sourceReady={sourceReady}
              requests={publisherRequests}
              onReviewRequest={handleOpenAction}
            />
          ) : null}

          {activeView === 'events' ? (
            <AdminEventsManagementPanel
              sourceReady={sourceReady}
              events={events}
              onReviewEvent={handleOpenAction}
            />
          ) : null}

          {activeView === 'history' ? (
            <EventsHistoryPanel
              sourceReady={sourceReady}
              historyItems={historyItems}
            />
          ) : null}

        </section>
      </div>

      <AdminEventActionModal
        action={actionModal?.action}
        target={actionModal?.target}
        onClose={() => setActionModal(null)}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
