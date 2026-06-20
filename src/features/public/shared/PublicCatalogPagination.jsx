import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';

export function buildPaginationItems(currentPage, lastPage) {
  const last = Math.max(1, Number(lastPage) || 1);
  const current = Math.min(Math.max(1, Number(currentPage) || 1), last);

  if (last <= 7) return Array.from({ length: last }, (_, index) => index + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, 'end-gap', last];
  if (current >= last - 3) return [1, 'start-gap', ...Array.from({ length: 5 }, (_, index) => last - 4 + index)];
  return [1, 'start-gap', current - 1, current, current + 1, 'end-gap', last];
}

function scrollCatalogToTop() {
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const catalog = document.querySelector('.pubcat-page');
  const top = catalog
    ? Math.max(0, catalog.getBoundingClientRect().top + window.scrollY - 72)
    : 0;

  window.requestAnimationFrame(() => {
    window.scrollTo({ top, left: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
}

export default function PublicCatalogPagination({
  currentPage = 1,
  lastPage = 1,
  loading = false,
  onPageChange,
  ariaLabel = 'Paginacion',
  previousLabel = 'Pagina anterior',
  nextLabel = 'Pagina siguiente',
}) {
  const last = Math.max(1, Number(lastPage) || 1);
  const current = Math.min(Math.max(1, Number(currentPage) || 1), last);

  const changePage = (nextPage) => {
    const safePage = Math.min(Math.max(1, Number(nextPage) || 1), last);
    if (safePage === current || loading) return;
    onPageChange?.(safePage);
    scrollCatalogToTop();
  };

  return (
    <nav className="pubcat-pagination" aria-label={ariaLabel}>
      <button type="button" onClick={() => changePage(current - 1)} disabled={loading || current <= 1} aria-label={previousLabel}>
        <BsChevronLeft />
      </button>

      <div className="pubcat-pagination__pages">
        {buildPaginationItems(current, last).map((item) => (
          typeof item === 'number' ? (
            <button
              key={item}
              type="button"
              className={item === current ? 'active' : ''}
              disabled={loading || item === current}
              onClick={() => changePage(item)}
              aria-current={item === current ? 'page' : undefined}
            >
              {item}
            </button>
          ) : <span className="pubcat-pagination__gap" key={item} aria-hidden="true">...</span>
        ))}
      </div>

      <button type="button" onClick={() => changePage(current + 1)} disabled={loading || current >= last} aria-label={nextLabel}>
        <BsChevronRight />
      </button>
    </nav>
  );
}
