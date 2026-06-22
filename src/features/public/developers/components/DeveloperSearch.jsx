import { FiSearch, FiX } from 'react-icons/fi';
import { useLanguage } from '../../../../core/i18n';

export default function DeveloperSearch({
  value,
  loading,
  onChange,
  onSearch,
  onClear,
}) {
  const { t } = useLanguage();

  return (
    <form
      className="dev-search"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch();
      }}
    >
      <label className="dev-search-field">
        <FiSearch aria-hidden="true" />
        <span className="dev-sr-only">{t('public.developers.searchAria')}</span>
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t('public.developers.searchPlaceholder')}
          aria-label={t('public.developers.searchAria')}
        />
        {value && (
          <button
            type="button"
            className="dev-search-clear"
            onClick={onClear}
            aria-label={t('public.developers.clearSearch')}
            disabled={loading}
          >
            <FiX aria-hidden="true" />
          </button>
        )}
      </label>

      <button type="submit" className="dev-search-submit" disabled={loading}>
        {loading ? t('public.developers.searching') : t('public.developers.search')}
      </button>
    </form>
  );
}
