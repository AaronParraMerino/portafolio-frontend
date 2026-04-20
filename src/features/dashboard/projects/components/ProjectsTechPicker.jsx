import { useState, useRef, useEffect } from 'react';
import { CATALOGO_TECNOLOGIAS } from '../model/projectsModel';
import ProjectsTechModal from './ProjectsTechModal';
import '../styles/projects.css';

/* ════════════════════════════════════════
   ProjectsTechPicker
   src/features/dashboard/projects/components/ProjectsTechPicker.jsx

   Selector de tecnologías estilo GitHub:
   ─ Panel desplegable con buscador + X
   ─ Checkboxes agrupados por categoría
   ─ Hint "no encontraste tu tecnología" cuando búsqueda sin resultados
   ─ Botón separado "+ Nueva tecnología" → abre ProjectsTechModal
   ─ Las tecnologías custom aparecen con badge CUSTOM
   ─ Chips en el trigger con X individual

   Props:
   ─ selected        string[]
   ─ onChange        fn(string[])
   ─ catalogoExtra   object[]     tecnologías custom de esta sesión (viven en ProjectsEdit)
   ─ onAgregarExtra  fn(tech)     persiste una nueva tech en el padre
════════════════════════════════════════ */

const ORDEN_CATEGORIAS = [
  'Frontend', 'Backend', 'Móvil', 'Lenguaje',
  'BD', 'DevOps', 'Herramienta',
];

export default function ProjectsTechPicker({
  selected      = [],
  onChange,
  catalogoExtra = [],
  onAgregarExtra,
}) {
  const [busqueda,     setBusqueda]     = useState('');
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const ref      = useRef(null);
  const inputRef = useRef(null);

  const catalogoTotal = [...CATALOGO_TECNOLOGIAS, ...catalogoExtra];

  // Cerrar panel al click fuera
  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setPanelAbierto(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Focus al abrir panel; limpiar al cerrar
  useEffect(() => {
    if (panelAbierto && inputRef.current) inputRef.current.focus();
    if (!panelAbierto) setBusqueda('');
  }, [panelAbierto]);

  // ── Filtrar catálogo ──
  const q = busqueda.trim().toLowerCase();
  const filtrado = q
    ? catalogoTotal.filter(t => t.nombre.toLowerCase().includes(q))
    : catalogoTotal;

  // Agrupar por categoría en orden
  const porCategoria = {};
  ORDEN_CATEGORIAS.forEach(cat => {
    const items = filtrado.filter(t => t.categoria === cat);
    if (items.length) porCategoria[cat] = items;
  });
  // Categorías extra (Personalizado, etc.)
  [...new Set(filtrado.filter(t => !ORDEN_CATEGORIAS.includes(t.categoria)).map(t => t.categoria))]
    .forEach(cat => {
      const items = filtrado.filter(t => t.categoria === cat);
      if (items.length) porCategoria[cat] = items;
    });

  const hayCategorias     = Object.keys(porCategoria).length > 0;
  const sinResultados     = q.length > 0 && !hayCategorias;

  // ── Toggle checkbox ──
  const toggle = (nombre) => {
    if (selected.includes(nombre)) {
      onChange(selected.filter(s => s !== nombre));
    } else if (selected.length < 15) {
      onChange([...selected, nombre]);
    }
  };

  const quitarSeleccionada = (nombre) => onChange(selected.filter(s => s !== nombre));

  // ── Confirmar nueva tecnología desde el modal ──
  const handleConfirmarNueva = (tech) => {
    // Agregar al catálogo de la sesión
    onAgregarExtra?.(tech);
    // Seleccionarla automáticamente
    if (!selected.includes(tech.nombre) && selected.length < 15) {
      onChange([...selected, tech.nombre]);
    }
    setModalAbierto(false);
    // Mantener el panel abierto para que el usuario vea la nueva tech
    setBusqueda('');
  };

  return (
    <>
      <div className="prj-tech-picker" ref={ref}>

        {/* ── Trigger: chips + contador + chevron ── */}
        <div
          className={`prj-tech-trigger${panelAbierto ? ' open' : ''}`}
          onClick={() => setPanelAbierto(v => !v)}
          role="button"
          tabIndex={0}
          aria-expanded={panelAbierto}
          aria-label="Seleccionar tecnologías"
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setPanelAbierto(v => !v);
            }
          }}
        >
          {selected.length === 0 ? (
            <span className="prj-tech-placeholder">Seleccionar tecnologías...</span>
          ) : (
            <div className="prj-tech-chips" onClick={e => e.stopPropagation()}>
              {selected.map(s => (
                <span key={s} className="prj-tag-chip">
                  {s}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); quitarSeleccionada(s); }}
                    title={`Quitar ${s}`}
                    aria-label={`Quitar ${s}`}
                  >
                    <svg viewBox="0 0 12 12">
                      <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" fill="none" strokeWidth="2.4"/>
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}

          <div style={{ marginLeft: 'auto', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            {selected.length > 0 && (
              <span className="prj-tech-count">{selected.length}/15</span>
            )}
            <svg
              viewBox="0 0 10 6"
              style={{
                width: 10, height: 10,
                stroke: 'var(--gris-texto)', fill: 'none', strokeWidth: 2,
                transition: 'transform .15s',
                transform: panelAbierto ? 'rotate(180deg)' : 'none',
              }}
            >
              <path d="M1 1l4 4 4-4"/>
            </svg>
          </div>
        </div>

        {/* ── Panel desplegable ── */}
        {panelAbierto && (
          <div className="prj-tech-panel">

            {/* ── Cabecera del panel: buscador + botón nueva tech ── */}
            <div className="prj-tech-panel-head">

              {/* Buscador */}
              <div className="prj-tech-search-wrap">
                <svg viewBox="0 0 14 14" style={{ width: 13, height: 13, stroke: 'var(--gris-texto)', fill: 'none', strokeWidth: 1.8, flexShrink: 0 }}>
                  <circle cx="6" cy="6" r="4.5"/>
                  <path d="M10 10l2.5 2.5"/>
                </svg>
                <input
                  ref={inputRef}
                  className="prj-tech-search-input"
                  placeholder="Buscar tecnología..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Escape') setPanelAbierto(false); }}
                />
                {busqueda && (
                  <button
                    type="button"
                    className="prj-tech-search-clear"
                    title="Limpiar búsqueda"
                    onClick={() => { setBusqueda(''); inputRef.current?.focus(); }}
                  >
                    <svg viewBox="0 0 12 12">
                      <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" fill="none" strokeWidth="2"/>
                    </svg>
                  </button>
                )}
              </div>

              {/* Botón "+ Nueva tecnología" separado */}
              <button
                type="button"
                className="prj-tech-new-btn"
                onClick={(e) => { e.stopPropagation(); setModalAbierto(true); }}
                title="Agregar una tecnología que no está en la lista"
              >
                <svg viewBox="0 0 12 12">
                  <path d="M6 1v10M1 6h10" stroke="currentColor" fill="none" strokeWidth="2.2"/>
                </svg>
                Nueva
              </button>
            </div>

            {/* ── Hint cuando no hay resultados ── */}
            {sinResultados && (
              <div className="prj-tech-no-results">
                <svg viewBox="0 0 16 16" style={{ width: 14, height: 14, stroke: 'currentColor', fill: 'none', strokeWidth: 1.6, flexShrink: 0 }}>
                  <circle cx="7" cy="7" r="5.5"/>
                  <path d="M10.5 10.5l3 3"/>
                </svg>
                <span>
                  No encontramos &ldquo;{busqueda}&rdquo; en el catálogo.{' '}
                  <button
                    type="button"
                    className="prj-tech-no-results-link"
                    onClick={(e) => { e.stopPropagation(); setModalAbierto(true); }}
                  >
                    Crear nueva tecnología
                  </button>
                </span>
              </div>
            )}

            {/* ── Lista de checkboxes ── */}
            <div className="prj-tech-list">
              {!hayCategorias && !sinResultados ? (
                <div className="prj-tech-empty">Cargando catálogo...</div>
              ) : hayCategorias ? (
                Object.entries(porCategoria).map(([cat, items]) => (
                  <div key={cat} className="prj-tech-group">
                    <div className="prj-tech-group-label">{cat}</div>
                    {items.map(tech => {
                      const checked  = selected.includes(tech.nombre);
                      const disabled = !checked && selected.length >= 15;
                      return (
                        <label
                          key={tech.id}
                          className={`prj-tech-item${checked ? ' checked' : ''}${disabled ? ' disabled' : ''}`}
                          title={disabled ? 'Máximo 15 tecnologías' : undefined}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={disabled}
                            onChange={() => toggle(tech.nombre)}
                          />
                          <span className="prj-tech-nombre">{tech.nombre}</span>
                          {tech.categoria === 'Personalizado' && (
                            <span className="prj-tech-custom-badge">CUSTOM</span>
                          )}
                          {checked && (
                            <svg viewBox="0 0 12 12" style={{ width: 12, height: 12, stroke: 'var(--azul)', fill: 'none', strokeWidth: 2.2, marginLeft: 'auto', flexShrink: 0 }}>
                              <path d="M2 6l3 3 5-5"/>
                            </svg>
                          )}
                        </label>
                      );
                    })}
                  </div>
                ))
              ) : null}
            </div>

            {/* Footer */}
            <div className="prj-tech-footer">
              <span>{selected.length} seleccionadas · máx. 15</span>
              {selected.length > 0 && (
                <button type="button" className="prj-tech-clear-all" onClick={() => onChange([])}>
                  Limpiar todo
                </button>
              )}
            </div>

          </div>
        )}
      </div>

      {/* ── Modal para crear nueva tecnología ── */}
      {modalAbierto && (
        <ProjectsTechModal
          catalogoTotal={catalogoTotal}
          onConfirmar={handleConfirmarNueva}
          onCerrar={() => setModalAbierto(false)}
        />
      )}
    </>
  );
}