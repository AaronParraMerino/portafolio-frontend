import '../styles/projects.css';

/* ════════════════════════════════════════
   ProjectsHeader
   src/features/dashboard/projects/components/ProjectsHeader.jsx

   Props:
   ─ onAgregar  fn()   abre el modal de nuevo proyecto
════════════════════════════════════════ */
export default function ProjectsHeader({ onAgregar }) {
  return (
    <div className="prj-module-header">
      <div>
        <div className="prj-header-eyebrow">Portafolio</div>
        <div className="prj-header-title">Mis Proyectos</div>
      </div>

      {/* Botón: texto completo en desktop, solo + en móvil */}
      <button className="prj-btn-add" onClick={onAgregar} title="Agregar nuevo proyecto">
        <svg viewBox="0 0 12 12"><path d="M6 1v10M1 6h10"/></svg>
        <span className="prj-btn-add-label">Agregar nuevo</span>
      </button>
    </div>
  );
}