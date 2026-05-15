import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function buildPaginationItems(currentPage, lastPage) {
  const current = Math.max(1, Number(currentPage) || 1);
  const last = Math.max(1, Number(lastPage) || 1);

  if (last <= 7) return range(1, last);
  if (current <= 5) return [...range(1, 5), 'end-gap', last];
  if (current >= last - 4) return [1, 'start-gap', ...range(last - 4, last)];

  return [1, 'start-gap', current - 1, current, current + 1, 'end-gap', last];
}

export default function DevelopersPagination({
  currentPage,
  lastPage,
  loading,
  onPageChange,
}) {
  const pages = buildPaginationItems(currentPage, lastPage);
  const current = Math.max(1, Number(currentPage) || 1);
  const last = Math.max(1, Number(lastPage) || 1);

  if (last <= 1) return null;

  return (
    <nav className="dev-pagination" aria-label="Paginacion de desarrolladores">
      <button
        type="button"
        className="dev-page-btn dev-page-nav"
        onClick={() => onPageChange(current - 1)}
        disabled={current <= 1 || loading}
        aria-label="Pagina anterior"
      >
        <FiChevronLeft aria-hidden="true" />
      </button>

      <div className="dev-page-list">
        {pages.map((item) => (
          typeof item === 'number' ? (
            <button
              type="button"
              key={item}
              className={`dev-page-btn${item === current ? ' active' : ''}`}
              onClick={() => onPageChange(item)}
              disabled={item === current || loading}
              aria-current={item === current ? 'page' : undefined}
            >
              {item}
            </button>
          ) : (
            <span className="dev-page-gap" key={item}>...</span>
          )
        ))}
      </div>

      <button
        type="button"
        className="dev-page-btn dev-page-nav"
        onClick={() => onPageChange(current + 1)}
        disabled={current >= last || loading}
        aria-label="Pagina siguiente"
      >
        <FiChevronRight aria-hidden="true" />
      </button>
    </nav>
  );
}
