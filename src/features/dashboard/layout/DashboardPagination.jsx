import { useMemo } from "react";
import { useLanguage } from "../../../core/i18n";

const DASHBOARD_SCROLL_CONTAINERS = [
  ".dsh-main",
  ".dsh-paused-content",
  ".prj-content",
  ".dbe-content",
  ".links-content",
  ".skill-page-body",
  ".exp-page-body",
];

export function scrollDashboardPageToTop() {
  const behavior = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";

  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior });

    DASHBOARD_SCROLL_CONTAINERS.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        if (element.scrollTop > 0) {
          element.scrollTo({ top: 0, left: 0, behavior });
        }
      });
    });
  });
}

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
  const handlePageChange = (nextPage) => {
    const safePage = Math.min(Math.max(nextPage, 1), totalPages);
    if (safePage === page) return;

    onPageChange(safePage);
    scrollDashboardPageToTop();
  };

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
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
        >
          {t("dashboard.pagination.previous")}
        </button>

        {items.map((item) => (
          <button
            key={item}
            type="button"
            className={item === page ? "is-active" : ""}
            onClick={() => handlePageChange(item)}
            aria-current={item === page ? "page" : undefined}
          >
            {item}
          </button>
        ))}

        <button
          type="button"
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages}
        >
          {t("dashboard.pagination.next")}
        </button>
      </div>
    </div>
  );
}
