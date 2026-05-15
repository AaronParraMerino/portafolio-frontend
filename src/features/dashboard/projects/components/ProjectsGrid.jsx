import '../styles/projects.css';
import ProjectCard from './ProjectCard';

/* ════════════════════════════════════════
   ProjectsGrid
   src/features/dashboard/projects/components/ProjectsGrid.jsx

   Renderiza la grilla de cards + card "agregar".
   Maneja el estado vacío con mensajes apropiados.

   Props:
   ─ proyectos    array   lista ya filtrada y ordenada
   ─ busqueda     string  para personalizar el mensaje vacío
   ─ onEditar     fn(proyecto)
   ─ onEliminar   fn(proyecto)
   ─ onAgregar    fn()
════════════════════════════════════════ */

function getProjectKey(project, index) {
  return project?.id || project?.id_proyecto || project?.idProyecto || `project-${index}`;
}

export default function ProjectsGrid({
  proyectos = [],
  busqueda = '',
  onEditar,
  onEliminar,
  onDesvincular,
  onConfigurar,
  onEstadoProyecto,
  onAgregar,
}) {
  const handleAgregar = () => {
    if (typeof onAgregar === 'function') {
      onAgregar();
    }
  };

  return (
    <div className="prj-grid">

      {/* ── Estado vacío ── */}
      {proyectos.length === 0 && (
        <div className="prj-empty">
          {busqueda ? (
            <>
              <svg viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>

              <div className="prj-empty-title">
                Sin resultados para &ldquo;{busqueda}&rdquo;
              </div>

              <div className="prj-empty-sub">
                Prueba con otro nombre, tecnología, tipo o estado
              </div>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M12 8v8M8 12h8" />
              </svg>

              <div className="prj-empty-title">
                Sin proyectos en esta categoría
              </div>

              <div className="prj-empty-sub">
                Agrega un proyecto para empezar
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Cards ── */}
      {proyectos.map((p, index) => (
        <ProjectCard
          key={getProjectKey(p, index)}
          proyecto={p}
          onEditar={onEditar}
          onEliminar={onEliminar}
          onDesvincular={onDesvincular}
          onConfigurar={onConfigurar}
          onEstadoProyecto={onEstadoProyecto}
        />
      ))}

      {/* ── Card agregar ── */}
      <div
        className="prj-card-add"
        onClick={handleAgregar}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleAgregar();
          }
        }}
      >
        <div className="prj-add-icon">
          <svg viewBox="0 0 20 20">
            <path d="M10 4v12M4 10h12" />
          </svg>
        </div>

        <div className="prj-add-label">Agregar nuevo proyecto</div>
        <div className="prj-add-sub">Muestra tu siguiente trabajo al mundo</div>
      </div>

    </div>
  );
}
