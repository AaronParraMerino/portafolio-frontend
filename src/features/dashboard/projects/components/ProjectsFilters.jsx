import '../styles/projects.css';
import { useLanguage } from '../../../../core/i18n';
import { DashboardMenuIcon } from '../../layout/DashboardIcons';
import ProjectsRepositoriesSyncBar from './ProjectsRepositoriesSyncBar';

const TABS = [
  { id: 'todos', labelKey: 'projects.filters.all' },
  { id: 'publicado', labelKey: 'projects.filters.published' },
  { id: 'desarrollo', labelKey: 'projects.filters.development' },
  { id: 'borrador', labelKey: 'projects.filters.drafts' },
  { id: 'archivado', labelKey: 'projects.filters.archived' },
];

const SORT_OPTIONS = [
  { value: 'recientes', labelKey: 'projects.filters.sort.recent' },
  { value: 'antiguos', labelKey: 'projects.filters.sort.oldest' },
  { value: 'alfa', labelKey: 'projects.filters.sort.alpha' },
];

export default function ProjectsFilters({
  busqueda = '',
  onBusqueda,
  filtro = 'todos',
  onFiltro,
  orden = 'recientes',
  onOrden,
  conteo = {},
  githubSyncSignal = 0,
  onAgregarConRepos,
  onReposChanged,
}) {
  const { t } = useLanguage();

  const handleBusqueda = (value) => {
    if (typeof onBusqueda === 'function') onBusqueda(value);
  };

  const handleFiltro = (value) => {
    if (typeof onFiltro === 'function') onFiltro(value);
  };

  const handleOrden = (value) => {
    if (typeof onOrden === 'function') onOrden(value);
  };

  return (
    <>
      <ProjectsRepositoriesSyncBar
        expandSignal={githubSyncSignal}
        onAgregarConRepos={onAgregarConRepos}
        onReposChanged={onReposChanged}
      />

      <div className="prj-search-wrap">
        <svg className="prj-search-icon" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="6.5" cy="6.5" r="5" />
          <path d="M10.5 10.5l3.5 3.5" />
        </svg>

        <input
          className="prj-search-input"
          type="text"
          placeholder={t('projects.filters.searchPlaceholder')}
          value={busqueda}
          onChange={(event) => handleBusqueda(event.target.value)}
          aria-label={t('projects.filters.searchAria')}
        />

        {busqueda ? (
          <button
            className="prj-search-clear"
            type="button"
            onClick={() => handleBusqueda('')}
            title={t('projects.filters.clearSearch')}
            aria-label={t('projects.filters.clearSearch')}
          >
            <svg viewBox="0 0 12 12">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" fill="none" strokeWidth="2" />
            </svg>
          </button>
        ) : null}
      </div>

      <div className="prj-filter-layout">
        <div className="prj-filter-row">
          <div className="prj-tab-grp" role="tablist">
            {TABS.map((tab) => {
              const count = conteo?.[tab.id] || 0;

              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`prj-tab${filtro === tab.id ? ' active' : ''}`}
                  onClick={() => handleFiltro(tab.id)}
                >
                  <span>{t(tab.labelKey)}</span>
                  {count > 0 ? <span className="prj-tab-count">{count}</span> : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="prj-filter-menu-row">
          <details className="prj-sort-menu">
            <summary className="prj-sort-menu-trigger" aria-label={t('projects.filters.sortAria')}>
              <DashboardMenuIcon />
              <span>
                {t(SORT_OPTIONS.find((option) => option.value === orden)?.labelKey || 'projects.filters.sort.recent')}
              </span>
            </summary>

            <div className="prj-sort-menu-list">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`prj-sort-menu-item${orden === option.value ? ' active' : ''}`}
                  onClick={(event) => {
                    event.currentTarget.closest('details')?.removeAttribute('open');
                    handleOrden(option.value);
                  }}
                >
                  {t(option.labelKey)}
                </button>
              ))}
            </div>
          </details>
        </div>
      </div>
    </>
  );
}
