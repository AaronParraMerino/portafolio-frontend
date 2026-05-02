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
export default function ProjectsDotsMenu({ proyecto, onEditar, onEliminar }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

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

          <div className="prj-menu-divider" />

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
        </div>
      )}
    </div>
  );
}