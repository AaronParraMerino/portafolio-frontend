import { useState, useRef, useEffect } from 'react';
import '../styles/projects.css';

/* ════════════════════════════════════════
   ProjectsDotsMenu — Menú de 3 puntos por card
   src/features/dashboard/projects/components/ProjectsDotsMenu.jsx

   Props:
   ─ proyecto     object
   ─ onEditar     fn(proyecto)
   ─ onToggleVis  fn(proyecto)
   ─ onEliminar   fn(proyecto)
════════════════════════════════════════ */
export default function ProjectsDotsMenu({ proyecto, onEditar, onToggleVis, onEliminar }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const action = (fn) => () => { setOpen(false); fn(proyecto); };

  return (
    <div className="prj-dots-wrap" ref={ref} onClick={e => e.stopPropagation()}>
      <button
        className="prj-dots-btn"
        type="button"
        title="Opciones"
        aria-label="Opciones del proyecto"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
      >
        <svg viewBox="0 0 4 16" fill="rgba(255,255,255,.85)" stroke="none">
          <circle cx="2" cy="2"  r="1.5"/>
          <circle cx="2" cy="8"  r="1.5"/>
          <circle cx="2" cy="14" r="1.5"/>
        </svg>
      </button>

      {open && (
        <div className="prj-dots-menu" role="menu">
          <button className="prj-menu-item" type="button" role="menuitem" onClick={action(onEditar)}>
            <svg viewBox="0 0 14 14"><path d="M2 11.5V13h1.5l5-5-1.5-1.5-5 5zM12.5 3.5a1 1 0 000-1.4L11.4 1a1 1 0 00-1.4 0L9 2 12 5z"/></svg>
            Editar
          </button>

          <button className="prj-menu-item" type="button" role="menuitem" onClick={action(onToggleVis)}>
            {proyecto.es_publico ? (
              <>
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M1 1l12 12M5.5 3.5A5 5 0 017 3c3.5 0 6 4 6 4s-.7 1.2-2 2.3M8.8 10A5.3 5.3 0 017 11c-3.5 0-6-4-6-4s.9-1.5 2.5-2.8"/>
                </svg>
                Ocultar
              </>
            ) : (
              <>
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M1 7S3.5 2 7 2s6 5 6 5-2.5 5-6 5-6-5-6-5z"/>
                  <circle cx="7" cy="7" r="2"/>
                </svg>
                Mostrar
              </>
            )}
          </button>

          <div className="prj-menu-divider" />

          <button className="prj-menu-item danger" type="button" role="menuitem" onClick={action(onEliminar)}>
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M1 3.5h12M5 3.5V2a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1.5M3 3.5v8a1.5 1.5 0 001.5 1.5h5A1.5 1.5 0 0011 11.5v-8M5.5 6v4M8.5 6v4"/>
            </svg>
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
}