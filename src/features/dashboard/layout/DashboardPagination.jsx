import { useMemo } from "react";
import { useLanguage } from "../../../core/i18n";

export default function DashboardPagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
}) {
  const { t } = useLanguage();
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const items = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const start = Math.max(1, Math.min(page - 1, totalPages - 3));
    return [start, start + 1, start + 2, start + 3].filter((item) => item <= totalPages);
  }, [page, totalPages]);

  if (totalItems <= 0) return null;

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  return (
    <div className="dash-pagination-row">
      <p className="dash-pagination-info">
        {t("dashboard.pagination.summary", {
          start: startItem,
          end: endItem,
          total: totalItems,
        })}
      </p>

      <div className="dash-pager" role="navigation" aria-label={t("dashboard.pagination.aria")}>
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
        >
          {t("dashboard.pagination.previous")}
        </button>

        {items.map((item) => (
          <button
            key={item}
            type="button"
            className={item === page ? "is-active" : ""}
            onClick={() => onPageChange(item)}
            aria-current={item === page ? "page" : undefined}
          >
            {item}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
        >
          {t("dashboard.pagination.next")}
        </button>
      </div>
    </div>
  );
}
