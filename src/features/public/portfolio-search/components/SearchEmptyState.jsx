import { useLanguage } from '../../../../core/i18n';

const SearchEmptyState = ({ hasSearched = false, authRequired = false, onClear }) => {
  const { t } = useLanguage();
  let title = t('portfolioSearch.empty.default.title');
  let description = t('portfolioSearch.empty.default.description');
  let code = 'BF';

  if (authRequired) {
    title = t('portfolioSearch.empty.auth.title');
    description = t('portfolioSearch.empty.auth.description');
    code = 'AU';
  } else if (hasSearched) {
    title = t('portfolioSearch.empty.noResults.title');
    description = t('portfolioSearch.empty.noResults.description');
    code = 'SR';
  }

  return (
    <div className="ps-empty-state">
      <div className="ps-empty-icon" aria-hidden="true">{code}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {hasSearched && onClear && !authRequired && (
        <button type="button" className="ps-btn-secondary danger-hover" onClick={onClear}>
          {t('portfolioSearch.empty.clear')}
        </button>
      )}
    </div>
  );
};

export default SearchEmptyState;
