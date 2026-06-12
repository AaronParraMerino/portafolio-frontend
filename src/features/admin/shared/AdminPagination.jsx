export function buildAdminPaginationItems(currentPage, totalPages) {
  const safeTotal = Math.max(1, totalPages || 1);
  const safeCurrent = Math.min(Math.max(1, currentPage || 1), safeTotal);
  const visibleCount = Math.min(3, safeTotal);
  const start = safeTotal <= 3
    ? 1
    : Math.max(1, Math.min(safeCurrent - 1, safeTotal - 2));

  return Array.from({ length: visibleCount }, (_, index) => start + index);
}

export function getAdminPageSlice(items, currentPage, pageSize) {
  const safeItems = Array.isArray(items) ? items : [];
  const safePageSize = Math.max(1, pageSize || 1);
  const totalPages = Math.max(1, Math.ceil(safeItems.length / safePageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage || 1), totalPages);
  const pageStart = (safeCurrentPage - 1) * safePageSize;

  return {
    currentPage: safeCurrentPage,
    pageItems: safeItems.slice(pageStart, pageStart + safePageSize),
    pageStart,
    totalPages,
    paginationItems: buildAdminPaginationItems(safeCurrentPage, totalPages),
  };
}

export default function AdminPagination({
  summary,
  currentPage,
  totalPages,
  paginationItems,
  previousLabel,
  nextLabel,
  disabled = false,
  onPageChange,
}) {
  const safeCurrent = currentPage || 1;
  const safeTotal = Math.max(1, totalPages || 1);
  const items = paginationItems?.length
    ? paginationItems
    : buildAdminPaginationItems(safeCurrent, safeTotal);

  return (
    <div className="adm-pagination">
      <div className="adm-pagination-info">{summary}</div>

      <div className="adm-pagination-actions">
        <button
          type="button"
          className="adm-page-btn"
          onClick={() => onPageChange?.(safeCurrent - 1)}
          disabled={disabled || safeCurrent <= 1}
        >
          {previousLabel}
        </button>

        {items.map((page) => (
          <button
            key={page}
            type="button"
            className={`adm-page-btn${page === safeCurrent ? ' active' : ''}`}
            onClick={() => onPageChange?.(page)}
            disabled={disabled || safeTotal <= 1}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          className="adm-page-btn"
          onClick={() => onPageChange?.(safeCurrent + 1)}
          disabled={disabled || safeCurrent >= safeTotal}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
