import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';

function getPages(currentPage, lastPage) {
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(lastPage, start + 4);
  const adjustedStart = Math.max(1, end - 4);

  return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
}

export default function EventsPagination({
  currentPage = 1,
  lastPage = 1,
  loading = false,
  onPageChange,
}) {
  if (lastPage <= 1) return null;

  const pages = getPages(currentPage, lastPage);

  return (
    <nav className="evtpub-pagination" aria-label="Paginacion de eventos">
      <button
        type="button"
        disabled={loading || currentPage <= 1}
        onClick={() => onPageChange?.(currentPage - 1)}
        aria-label="Pagina anterior"
      >
        <BsChevronLeft />
      </button>

      {pages.map((page) => (
        <button
          key={page}
          type="button"
          className={page === currentPage ? 'active' : ''}
          disabled={loading || page === currentPage}
          onClick={() => onPageChange?.(page)}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        disabled={loading || currentPage >= lastPage}
        onClick={() => onPageChange?.(currentPage + 1)}
        aria-label="Pagina siguiente"
      >
        <BsChevronRight />
      </button>
    </nav>
  );
}
