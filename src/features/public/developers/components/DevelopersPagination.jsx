import { useLanguage } from '../../../../core/i18n';
import PublicCatalogPagination from '../../shared/PublicCatalogPagination';

export { buildPaginationItems } from '../../shared/PublicCatalogPagination';

export default function DevelopersPagination(props) {
  const { t } = useLanguage();

  return (
    <PublicCatalogPagination
      {...props}
      ariaLabel={t('public.developers.paginationAria')}
      previousLabel={t('public.developers.previousPage')}
      nextLabel={t('public.developers.nextPage')}
    />
  );
}
