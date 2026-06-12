import { useState } from 'react';
import { useLanguage } from '../../../../core/i18n';
import AdminHeader from '../../layout/AdminHeader';
import { getAdminSectionConfig } from '../../layout/adminHeaderConfig';
import AdminEventActionModal from '../components/AdminEventActionModal';
import AdminEventsManagementPanel from '../components/AdminEventsManagementPanel';
import AdminPublisherRequestsPanel from '../components/AdminPublisherRequestsPanel';
import EventsHistoryPanel from '../components/EventsHistoryPanel';
import EventsStats from '../components/EventsStats';
import EventsWorkspaceTabs from '../components/EventsWorkspaceTabs';
import BackgroundSaveIndicator from '../../../../shared/ui/BackgroundSaveIndicator';
import { useEventsWorkspace } from '../hooks/useEvents';
import '../styles/events.css';

export default function EventsPage() {
  const { t } = useLanguage();
  const headerConfig = getAdminSectionConfig('events');
  const [actionModal, setActionModal] = useState(null);
  const [actionNotice, setActionNotice] = useState('');
  const [actionSaving, setActionSaving] = useState(false);
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
    const targetName = target.title || target.name || t('adminEvents.common.record');
    setActionModal(null);
    setActionSaving(true);

    try {
      await onAdminAction({ action, target, reason });
      setActionNotice(t('adminEvents.eventsPage.actionApplied', { action, target: targetName }));
    } catch (error) {
      setActionNotice(error.message || t('adminEvents.eventsPage.actionError', { action }));
    } finally {
      setActionSaving(false);
    }
  };

  return (
    <div className="evt-page">
      <AdminHeader
        eyebrow={t(headerConfig.eyebrowKey || headerConfig.eyebrow)}
        title={t(headerConfig.titleKey || headerConfig.title)}
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

      <BackgroundSaveIndicator active={actionSaving} label={t('adminEvents.eventsPage.applyingAction')} />
    </div>
  );
}
