import { useLanguage } from '../../../../core/i18n';
import AdminHeader from '../../layout/AdminHeader';
import { getAdminSectionConfig } from '../../layout/adminHeaderConfig';
import AuditDetailModal from '../components/AuditDetailModal';
import AuditFilters from '../components/AuditFilters';
import AuditStats from '../components/AuditStats';
import AuditTable from '../components/AuditTable';
import { useAuditLogs } from '../hooks/useAudit';
import '../styles/audit.css';

export default function AuditPage() {
  const { t } = useLanguage();
  const headerConfig = getAdminSectionConfig('audit');
  const {
    metrics,
    filters,
    availableFilters,
    meta,
    visibleItems,
    loading,
    errorMessage,
    selectedLog,
    hasActiveFilters,
    updateFilter,
    clearFilters,
    setSelectedLog,
    refresh,
  } = useAuditLogs();

  return (
    <div className="aud-page adm-page-shell">
      <AdminHeader
        eyebrow={t(headerConfig.eyebrowKey || headerConfig.eyebrow)}
        title={t(headerConfig.titleKey || headerConfig.title)}
      />

      <div className="aud-content">
        <AuditStats metrics={metrics} loading={loading} />

        {errorMessage ? (
          <div className="aud-error" role="alert">
            {errorMessage}
          </div>
        ) : null}

        <section className="aud-panel">
          <div className="aud-panel-head">
            <div>
              <span>{t('adminAudit.panel.kicker')}</span>
              <h3>{t('adminAudit.panel.title')}</h3>
            </div>
            <small>{t('adminAudit.panel.subtitle')}</small>
          </div>

          <AuditFilters
            filters={filters}
            availableFilters={availableFilters}
            hasActiveFilters={hasActiveFilters}
            loading={loading}
            onFilterChange={updateFilter}
            onClearFilters={clearFilters}
            onRefresh={refresh}
          />

          <AuditTable
            items={visibleItems}
            loading={loading}
            meta={meta}
            onPageChange={(page) => updateFilter('page', page)}
            onOpenDetail={setSelectedLog}
          />
        </section>
      </div>

      <AuditDetailModal
        item={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}
