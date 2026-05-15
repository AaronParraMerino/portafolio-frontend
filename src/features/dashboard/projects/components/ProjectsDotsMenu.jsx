import { useState, useRef, useEffect } from 'react';
import '../styles/projects.css';

/* ════════════════════════════════════════
   ProjectsDotsMenu — Menú de 3 puntos por card
   src/features/dashboard/projects/components/ProjectsDotsMenu.jsx

   Props:
   ─ proyecto     object
   ─ onEditar     fn(proyecto)
   ─ onEliminar   fn(proyecto)
════════════════════════════════════════ */
export default function ProjectsDotsMenu({ proyecto, onEditar, onEliminar, onDesvincular, onConfigurar }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const permisos = proyecto?.permisos || {};
  const puedeEditar = permisos.puede_editar ?? proyecto?.puede_editar ?? true;
  const puedeEliminar = permisos.puede_eliminar ?? proyecto?.puede_eliminar ?? true;
  const puedeConfigurar = permisos.puede_configurar ?? proyecto?.puede_configurar ?? false;
  const puedeDesvincular = permisos.puede_desvincular_participacion ?? proyecto?.puede_desvincular_participacion ?? false;

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
        title="Opciones"
        aria-label="Opciones del proyecto"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
      >
        <svg viewBox="0 0 4 16" fill="rgba(255,255,255,.85)" stroke="none">
          <circle cx="2" cy="2" r="1.5" />
          <circle cx="2" cy="8" r="1.5" />
          <circle cx="2" cy="14" r="1.5" />
        </svg>
      </button>

      {open && (
        <div className="prj-dots-menu" role="menu">
          {puedeEditar && (
            <button
              className="prj-menu-item"
              type="button"
              role="menuitem"
              onClick={action(onEditar)}
            >
              <svg viewBox="0 0 14 14">
                <path d="M2 11.5V13h1.5l5-5-1.5-1.5-5 5zM12.5 3.5a1 1 0 000-1.4L11.4 1a1 1 0 00-1.4 0L9 2 12 5z" />
              </svg>
              Editar
            </button>
          )}

          {puedeConfigurar && (
            <button
              className="prj-menu-item"
              type="button"
              role="menuitem"
              onClick={action(onConfigurar)}
            >
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M7 1.5v2M7 10.5v2M2.2 4.2l1.7 1M10.1 8.8l1.7 1M2.2 9.8l1.7-1M10.1 5.2l1.7-1" />
                <circle cx="7" cy="7" r="2" />
              </svg>
              Configurar
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
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M5.5 2.5h-2A1.5 1.5 0 002 4v6a1.5 1.5 0 001.5 1.5h2M8 4l3 3-3 3M11 7H5" />
              </svg>
              Desvincularme
            </button>
          )}

          {puedeEliminar && (
            <button
              className="prj-menu-item danger"
              type="button"
              role="menuitem"
              onClick={action(onEliminar)}
            >
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M1 3.5h12M5 3.5V2a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1.5M3 3.5v8a1.5 1.5 0 001.5 1.5h5A1.5 1.5 0 0011 11.5v-8M5.5 6v4M8.5 6v4" />
              </svg>
              Eliminar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
