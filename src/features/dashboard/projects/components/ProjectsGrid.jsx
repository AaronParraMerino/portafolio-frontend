import '../styles/projects.css';
import { useLanguage } from '../../../../core/i18n';
import ProjectCard from './ProjectCard';
import DashboardEmptyState from '../../layout/DashboardEmptyState';
import { DashboardProjectIcon } from '../../layout/DashboardIcons';

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
  validatingConfigurationId = null,
}) {
  const { t } = useLanguage();

  const handleAgregar = () => {
    if (typeof onAgregar === 'function') {
      onAgregar();
    }
  };

  return (
    <div className="prj-grid">

      {/* ── Estado vacío ── */}
      {proyectos.length === 0 && (
        <DashboardEmptyState
          icon={DashboardProjectIcon}
          title={busqueda
            ? t('projects.empty.searchTitle', { query: busqueda })
            : t('projects.empty.categoryTitle')}
          description={busqueda ? t('projects.empty.searchText') : t('projects.empty.categoryText')}
          actionLabel={t('projects.empty.addLabel')}
          onAction={handleAgregar}
        />
      )}

      {/* ── Cards ── */}
      {proyectos.map((p, index) => (
        <ProjectCard
          key={getProjectKey(p, index)}
          proyecto={p}
          prioridadImagen={index < 3}
          onEditar={onEditar}
          onEliminar={onEliminar}
          onDesvincular={onDesvincular}
          onConfigurar={onConfigurar}
          onEstadoProyecto={onEstadoProyecto}
          validatingConfiguration={
            String(getProjectKey(p, index)) === String(validatingConfigurationId)
          }
        />
      ))}

      {/* ── Card agregar ── */}
      {proyectos.length > 0 && <div
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

        <div className="prj-add-label">{t('projects.empty.addLabel')}</div>
        <div className="prj-add-sub">{t('projects.empty.addSub')}</div>
      </div>}

    </div>
  );
}
