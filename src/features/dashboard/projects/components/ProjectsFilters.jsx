import '../styles/projects.css';

/* ════════════════════════════════════════
   ProjectsFilters
   src/features/dashboard/projects/components/ProjectsFilters.jsx

   Incluye: buscador con X + tabs de filtro + selector de orden.

   Props:
   ─ busqueda    string
   ─ onBusqueda  fn(string)
   ─ filtro      string   ('todos' | 'publicado' | 'desarrollo' | 'borrador')
   ─ onFiltro    fn(string)
   ─ orden       string   ('recientes' | 'antiguos' | 'alfa')
   ─ onOrden     fn(string)
   ─ conteo      { todos, publicado, desarrollo, borrador }
════════════════════════════════════════ */

const TABS = [
  { id: 'todos',      label: 'Todos'         },
  { id: 'publicado',  label: 'Publicados'    },
  { id: 'desarrollo', label: 'En desarrollo' },
  { id: 'borrador',   label: 'Borradores'    },
];

export default function ProjectsFilters({
  busqueda, onBusqueda,
  filtro,   onFiltro,
  orden,    onOrden,
  conteo,
}) {
  return (
    <>
      {/* ── Buscador ── */}
      <div className="prj-search-wrap">
        <svg className="prj-search-icon" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="6.5" cy="6.5" r="5"/>
          <path d="M10.5 10.5l3.5 3.5"/>
        </svg>
        <input
          className="prj-search-input"
          type="text"
          placeholder="Buscar por nombre, tecnología o estado..."
          value={busqueda}
          onChange={e => onBusqueda(e.target.value)}
          aria-label="Buscar proyectos"
        />
        {/* X para limpiar — visible solo cuando hay texto */}
        {busqueda && (
          <button
            className="prj-search-clear"
            type="button"
            onClick={() => onBusqueda('')}
            title="Limpiar búsqueda"
            aria-label="Limpiar búsqueda"
          >
            <svg viewBox="0 0 12 12">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" fill="none" strokeWidth="2"/>
            </svg>
          </button>
        )}
      </div>

      {/* ── Tabs + Orden ── */}
      <div className="prj-filter-row">
        <div className="prj-tab-grp">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`prj-tab${filtro === tab.id ? ' active' : ''}`}
              onClick={() => onFiltro(tab.id)}
            >
              {tab.label}
              {conteo[tab.id] > 0 && (
                <span className="prj-tab-count">{conteo[tab.id]}</span>
              )}
            </button>
          ))}
        </div>

        <select
          className="prj-sort-select"
          value={orden}
          onChange={e => onOrden(e.target.value)}
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