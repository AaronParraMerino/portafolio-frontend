import { BsArrowClockwise, BsSearch, BsXCircle } from 'react-icons/bs';
import { useLanguage } from '../../../../core/i18n';
import {
  AUDIT_ACTION_GROUPS,
  AUDIT_PRESET_MODULES,
} from '../services/auditService';

export default function AuditFilters({
  filters,
  availableFilters,
  hasActiveFilters,
  loading,
  onFilterChange,
  onClearFilters,
  onRefresh,
}) {
  const { t } = useLanguage();
  const modules = getMergedModules(availableFilters?.modules || []);

  return (
    <section className="aud-toolbar">
      <div className="aud-toolbar-main">
        <div className="aud-search">
          <BsSearch />
          <input
            value={filters.q}
            onChange={(event) => onFilterChange('q', event.target.value)}
            placeholder={t('adminAudit.filters.searchPlaceholder')}
            aria-label={t('adminAudit.filters.searchAria')}
          />
        </div>

        <button
          type="button"
          className="aud-refresh-btn"
          onClick={onRefresh}
          disabled={loading}
        >
          <BsArrowClockwise />
          {t('adminAudit.filters.refresh')}
        </button>

        {hasActiveFilters ? (
          <button type="button" className="aud-clear-btn" onClick={onClearFilters}>
            <BsXCircle />
            {t('adminAudit.filters.clear')}
          </button>
        ) : null}
      </div>

      <div className="adm-filter-row">
        <label className="adm-filter-field">
          <span>{t('adminAudit.filters.module')}</span>
          <select
            value={filters.module}
            onChange={(event) => onFilterChange('module', event.target.value)}
          >
            {modules.map((module) => (
              <option key={module.id} value={module.id}>
                {module.labelKey ? t(module.labelKey) : module.label}
              </option>
            ))}
          </select>
        </label>

        <label className="adm-filter-field">
          <span>{t('adminAudit.filters.actionGroupAria')}</span>
          <select
            value={filters.actionGroup}
            onChange={(event) => onFilterChange('actionGroup', event.target.value)}
          >
            {AUDIT_ACTION_GROUPS.map((group) => (
              <option key={group.id} value={group.id}>
                {t(group.labelKey)}
              </option>
            ))}
          </select>
        </label>

        <label className="adm-filter-field adm-filter-field--date">
          <span>{t('adminAudit.filters.from')}</span>
          <input
            type="date"
            value={filters.from}
            onChange={(event) => onFilterChange('from', event.target.value)}
          />
        </label>

        <label className="adm-filter-field adm-filter-field--date">
          <span>{t('adminAudit.filters.to')}</span>
          <input
            type="date"
            value={filters.to}
            onChange={(event) => onFilterChange('to', event.target.value)}
          />
        </label>
      </div>
    </section>
  );
}

function getMergedModules(dynamicModules = []) {
  const knownIds = new Set(AUDIT_PRESET_MODULES.map((module) => module.id));
  const dynamicItems = dynamicModules
    .filter((module) => module && !knownIds.has(module))
    .map((module) => ({
      id: module,
      label: module.replace(/_/g, ' '),
    }));

  return [...AUDIT_PRESET_MODULES, ...dynamicItems];
}
