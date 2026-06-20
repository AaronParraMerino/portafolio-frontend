import { useLanguage } from '../../../../core/i18n';
import PublicCatalogPagination from '../../shared/PublicCatalogPagination';

export default function EventsPagination(props) {
  const { t } = useLanguage();
  return (
    <PublicCatalogPagination
      {...props}
      ariaLabel={t('public.events.paginationAria')}
      previousLabel={t('public.events.previousPage')}
      nextLabel={t('public.events.nextPage')}
    />
  );
}
