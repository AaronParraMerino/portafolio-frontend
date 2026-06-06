import { BsSearch, BsX } from 'react-icons/bs';
import { useLanguage } from '../../../../core/i18n';
import {
  EVENT_STATUS_FILTERS,
  EVENT_TYPES,
} from '../services/eventsService';

export default function EventsFilters({
  query,
  statusFilter,
  typeFilter,
  statusCounts,
  sourceReady,
  showSyncStatus = true,
  onQueryChange,
  onStatusFilterChange,
  onTypeFilterChange,
}) {
  const { t } = useLanguage();

  return (
    <div className="evt-toolbar">
      <div className="evt-search-box">
        <span className="evt-search-icon">
          <BsSearch />
        </span>
        <input
          type="text"
          className="evt-search-input"
          placeholder={t('adminEvents.filters.searchPlaceholder')}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          aria-label={t('adminEvents.filters.searchAria')}
        />
        {query ? (
          <button
            type="button"
            className="evt-search-clear"
            onClick={() => onQueryChange('')}
            aria-label={t('adminEvents.filters.clearSearch')}
            title={t('adminEvents.filters.clearSearch')}
          >
            <BsX />
          </button>
        ) : null}
      </div>

      <div className="evt-filter-group" aria-label={t('adminEvents.filters.statusAria')}>
        {EVENT_STATUS_FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className={`evt-filter-chip${statusFilter === filter.id ? ' active' : ''}`}
            onClick={() => onStatusFilterChange(filter.id)}
          >
            <span>{t(`adminEvents.statusPlural.${filter.id}`)}</span>
            {sourceReady ? <small>{statusCounts?.[filter.id] ?? 0}</small> : null}
          </button>
        ))}
      </div>

      <div className="evt-filter-group evt-filter-group--types" aria-label={t('adminEvents.filters.typeAria')}>
        {EVENT_TYPES.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className={`evt-filter-chip${typeFilter === filter.id ? ' active' : ''}`}
            onClick={() => onTypeFilterChange(filter.id)}
          >
            {t(`adminEvents.type.${filter.id}`)}
          </button>
        ))}
      </div>

      {showSyncStatus ? (
        <div className="evt-toolbar-side">
          <span className={`evt-sync-pill ${sourceReady ? 'ready' : 'pending'}`}>
            {sourceReady ? t('adminEvents.filters.updated') : t('adminEvents.filters.noRecords')}
          </span>
        </div>
      ) : null}
    </div>
  );
}
