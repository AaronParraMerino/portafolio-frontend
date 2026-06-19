import { useState, useRef, useEffect } from 'react';
import '../styles/projects.css';
import { useLanguage } from '../../../../core/i18n';
import {
  DashboardDeleteIcon,
  DashboardEditIcon,
  DashboardMenuIcon,
  DashboardSettingsIcon,
  DashboardStatusIcon,
  DashboardUnlinkIcon,
} from '../../layout/DashboardIcons';

/* ════════════════════════════════════════
   ProjectsDotsMenu — Menú de 3 puntos por card
   src/features/dashboard/projects/components/ProjectsDotsMenu.jsx

   Props:
   ─ proyecto     object
   ─ onEditar     fn(proyecto)
   ─ onEliminar   fn(proyecto)
════════════════════════════════════════ */
export default function ProjectsDotsMenu({
  proyecto,
  onEditar,
  onEliminar,
  onDesvincular,
  onConfigurar,
  onEstadoProyecto,
  disabled = false,
  loading = false,
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const permisos = proyecto?.permisos || {};
  const puedeEditar = permisos.puede_editar ?? proyecto?.puede_editar ?? true;
  const puedeEliminar = permisos.puede_eliminar ?? proyecto?.puede_eliminar ?? true;
  const puedeConfigurar = permisos.puede_configurar ?? proyecto?.puede_configurar ?? false;
  const puedeDesvincular = permisos.puede_desvincular_participacion ?? proyecto?.puede_desvincular_participacion ?? false;
  const puedeCambiarEstado = puedeEditar && typeof onEstadoProyecto === 'function';

  useEffect(() => {
    if (loading) setOpen(false);
  }, [loading]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const action = (fn) => () => {
    if (disabled) return;

    setOpen(false);

    if (typeof fn === 'function') {
      fn(proyecto);
    }
  };

  return (
    <div
      className="prj-dots-wrap"
      ref={ref}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="prj-dots-btn"
        type="button"
        title={t('projects.menu.options')}
        aria-label={loading ? 'Validando permisos del proyecto' : t('projects.menu.optionsProject')}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen(v => !v)}
      >
        {loading ? (
          <span className="prj-dots-spinner" aria-hidden="true" />
        ) : (
          <DashboardMenuIcon />
        )}
      </button>

      {open && (
        <div className="prj-dots-menu" role="menu">
          {puedeEditar && (
            <button
              className="prj-menu-item is-edit"
              type="button"
              role="menuitem"
              onClick={action(onEditar)}
            >
              <DashboardEditIcon />
              {t('projects.menu.edit')}
            </button>
          )}

          {puedeConfigurar && (
            <button
              className="prj-menu-item"
              type="button"
              role="menuitem"
              onClick={action(onConfigurar)}
            >
              <DashboardSettingsIcon />
              {t('projects.menu.configure')}
            </button>
          )}

          {puedeCambiarEstado && (
            <button
              className="prj-menu-item"
              type="button"
              role="menuitem"
              onClick={action(onEstadoProyecto)}
            >
              <DashboardStatusIcon />
              {t('projects.menu.changeStatus')}
            </button>
          )}

          <div className="prj-menu-divider" />

          {puedeDesvincular && (
            <button
              className="prj-menu-item"
              type="button"
              role="menuitem"
              onClick={action(onDesvincular)}
            >
              <DashboardUnlinkIcon />
              {t('projects.menu.unlink')}
            </button>
          )}

          {puedeEliminar && (
            <button
              className="prj-menu-item is-delete danger"
              type="button"
              role="menuitem"
              onClick={action(onEliminar)}
            >
              <DashboardDeleteIcon />
              {t('projects.menu.delete')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
