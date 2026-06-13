import { useLanguage } from '../../../../core/i18n';
import { USER_STATUS_FILTERS } from '../services/usersService';

function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="5" />
      <path d="M10.5 10.5 14 14" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true">
      <path d="M1 1l10 10M11 1 1 11" />
    </svg>
  );
}

export default function UsersFilters({
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  filterCounts,
  sourceReady,
}) {
  const { t } = useLanguage();

  return (
    <div className="usr-toolbar">
      <div className="usr-search-box">
        <span className="usr-search-icon">
          <SearchIcon />
        </span>

        <input
          type="text"
          className="usr-search-input"
          placeholder={t('admin.users.filters.searchPlaceholder')}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          aria-label={t('admin.users.filters.searchAria')}
        />

        {query && (
          <button
            type="button"
            className="usr-search-clear"
            onClick={() => onQueryChange('')}
            title={t('admin.users.filters.clearSearch')}
            aria-label={t('admin.users.filters.clearSearch')}
          >
            <CloseIcon />
          </button>
        )}
      </div>

      <label className="adm-filter-field">
        <span>{t('admin.users.filters.statusAria')}</span>
        <select
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value)}
        >
          {USER_STATUS_FILTERS.map((filter) => (
            <option key={filter.id} value={filter.id}>
              {t(`admin.users.status.${filter.id}.label`)}
              {sourceReady ? ` (${filterCounts?.[filter.id] ?? 0})` : ''}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
