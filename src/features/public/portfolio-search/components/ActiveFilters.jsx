import { useLanguage } from '../../../../core/i18n';

const ActiveFilters = ({ chips = [], onClear, className = '' }) => {
  const { t } = useLanguage();

  if (!chips.length) return null;

  return (
    <div className={`ps-active-wrap ${className}`.trim()}>
      <div className="ps-active-filters">
        {chips.map((chip) => (
          <span className={`ps-active-chip ${chip.className || ''}`} key={chip.id}>
            {chip.label}
            <button
              type="button"
              onClick={chip.onRemove}
              aria-label={t('portfolioSearch.filters.remove', { label: chip.label })}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {onClear && (
        <button type="button" className="ps-clear-inline" onClick={onClear}>
          {t('portfolioSearch.filters.clearAll')}
        </button>
      )}
    </div>
  );
};

export default ActiveFilters;
