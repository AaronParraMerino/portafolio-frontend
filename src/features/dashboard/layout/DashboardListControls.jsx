import { useLanguage } from "../../../core/i18n";
import {
  DashboardCloseIcon,
  DashboardMenuIcon,
  DashboardSearchIcon,
} from "./DashboardIcons";

export default function DashboardListControls({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  searchAria,
  tabs = [],
  activeTab,
  onTabChange,
  sortValue,
  onSortChange,
  sortOptions = [],
  sortAria,
}) {
  const { t } = useLanguage();

  return (
    <div className="dash-list-controls">
      <div className="dash-list-search-wrap">
        <DashboardSearchIcon className="dash-list-search-icon" aria-hidden="true" />
        <input
          type="text"
          className="dash-list-search-input"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchAria || searchPlaceholder}
        />

        {searchValue ? (
          <button
            type="button"
            className="dash-list-search-clear"
            onClick={() => onSearchChange("")}
            aria-label={t("dashboard.filters.clearSearch")}
            title={t("dashboard.filters.clearSearch")}
          >
            <DashboardCloseIcon />
          </button>
        ) : null}
      </div>

      <div className="dash-list-filter-row">
        <div className="dash-list-tab-grp" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={`dash-list-tab ${activeTab === tab.value ? "active" : ""}`}
              onClick={() => onTabChange(tab.value)}
            >
              <span>{tab.label}</span>
              {typeof tab.count === "number" ? (
                <span className="dash-list-tab-count">{tab.count}</span>
              ) : null}
            </button>
          ))}
        </div>

        {sortOptions.length > 0 ? (
          <details className="dash-list-menu">
            <summary
              className="dash-list-menu-trigger"
              aria-label={sortAria || t("dashboard.filters.sort")}
            >
              <DashboardMenuIcon />
              <span>
                {sortOptions.find((option) => option.value === sortValue)?.label || t("dashboard.filters.sort")}
              </span>
            </summary>

            <div className="dash-list-menu-list">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`dash-list-menu-item ${sortValue === option.value ? "active" : ""}`}
                  onClick={(event) => {
                    event.currentTarget.closest("details")?.removeAttribute("open");
                    onSortChange(option.value);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </details>
        ) : null}
      </div>
    </div>
  );
}
