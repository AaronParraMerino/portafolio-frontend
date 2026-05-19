import '../styles/projects.css';
import ProjectsGithubSyncPanel from './ProjectsGithubSyncPanel';

/* ════════════════════════════════════════
   ProjectsFilters
   src/features/dashboard/projects/components/ProjectsFilters.jsx

   Incluye: buscador con X + tabs de filtro + selector de orden.

   Props:
   ─ busqueda    string
   ─ onBusqueda  fn(string)
   ─ filtro      string   ('todos' | 'publicado' | 'desarrollo' | 'borrador' | 'archivado')
   ─ onFiltro    fn(string)
   ─ orden       string   ('recientes' | 'antiguos' | 'alfa')
   ─ onOrden     fn(string)
   ─ conteo      { todos, publicado, desarrollo, borrador, archivado }
════════════════════════════════════════ */

const TABS = [
  { id: 'todos', label: 'Todos' },
  { id: 'publicado', label: 'Publicados' },
  { id: 'desarrollo', label: 'En desarrollo' },
  { id: 'borrador', label: 'Borradores' },
  { id: 'archivado', label: 'Archivados' },
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
  const handleBusqueda = (value) => {
    if (typeof onBusqueda === 'function') {
      onBusqueda(value);
    }
  };

  const handleFiltro = (value) => {
    if (typeof onFiltro === 'function') {
      onFiltro(value);
    }
  };

  const handleOrden = (value) => {
    if (typeof onOrden === 'function') {
      onOrden(value);
    }
  };

  return (
    <>
      {/* ── Buscador ── */}
      <div className="prj-search-wrap">
        <svg className="prj-search-icon" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="6.5" cy="6.5" r="5" />
          <path d="M10.5 10.5l3.5 3.5" />
        </svg>

        <input
          className="prj-search-input"
          type="text"
          placeholder="Buscar por nombre, tecnología, tipo o estado..."
          value={busqueda}
          onChange={(e) => handleBusqueda(e.target.value)}
          aria-label="Buscar proyectos"
        />

        {busqueda && (
          <button
            className="prj-search-clear"
            type="button"
            onClick={() => handleBusqueda('')}
            title="Limpiar búsqueda"
            aria-label="Limpiar búsqueda"
          >
            <svg viewBox="0 0 12 12">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" fill="none" strokeWidth="2" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Tabs + Orden ── */}
      <ProjectsGithubSyncPanel
        expandSignal={githubSyncSignal}
        onAgregarConRepos={onAgregarConRepos}
        onReposChanged={onReposChanged}
      />

      <ProjectsGithubSyncPanel
        provider="gitlab"
        actionLabel="Agregar proyecto con repos GitLab"
        onAgregarConRepos={onAgregarConRepos}
        onReposChanged={onReposChanged}
      />

      <div className="prj-filter-row">
        <div className="prj-tab-grp">
          {TABS.map(tab => {
            const count = conteo?.[tab.id] || 0;

            return (
              <button
                key={tab.id}
                type="button"
                className={`prj-tab${filtro === tab.id ? ' active' : ''}`}
                onClick={() => handleFiltro(tab.id)}
              >
                {tab.label}

                {count > 0 && (
                  <span className="prj-tab-count">{count}</span>
                )}
              </button>
            );
          })}
        </div>

        <select
          className="prj-sort-select"
          value={orden}
          onChange={(e) => handleOrden(e.target.value)}
          aria-label="Ordenar proyectos"
        >
          <option value="recientes">Más recientes</option>
          <option value="antiguos">Más antiguos</option>
          <option value="alfa">Alfabético</option>
        </select>
      </div>
    </>
  );
}
