import { useState, useRef, useEffect } from 'react';
import { CATALOGO_TECNOLOGIAS, normalizarId } from '../model/projectsModel';
import '../styles/projects.css';

/* ════════════════════════════════════════
   TechCheckboxPicker
   src/features/dashboard/projects/components/TechCheckboxPicker.jsx

   Selector de tecnologías con:
   ─ Buscador integrado
   ─ Checkboxes agrupados por categoría
   ─ Botón "+ Agregar [X]" si no encuentra la tecnología
   ─ Normalización de ids para evitar duplicados
   ─ Chips visuales de las seleccionadas

   Props:
   ─ selected   string[]   tecnologías actualmente seleccionadas
   ─ onChange   fn(string[])
════════════════════════════════════════ */

// Categorías en el orden que queremos mostrarlas
const ORDEN_CATEGORIAS = ['Frontend', 'Backend', 'Móvil', 'Lenguaje', 'BD', 'DevOps', 'Herramienta'];

export default function TechCheckboxPicker({ selected = [], onChange }) {
  const [busqueda,         setBusqueda]         = useState('');
  const [panelAbierto,     setPanelAbierto]     = useState(false);
  const [catalogoExtra,    setCatalogoExtra]     = useState([]); // techs añadidas manualmente
  const ref      = useRef(null);
  const inputRef = useRef(null);

  // Catálogo combinado (base + extras)
  const catalogoTotal = [...CATALOGO_TECNOLOGIAS, ...catalogoExtra];

  // Cierra el panel al hacer click fuera
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setPanelAbierto(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Focus al abrir
  useEffect(() => {
    if (panelAbierto && inputRef.current) inputRef.current.focus();
  }, [panelAbierto]);

  // ── Filtrar catálogo por búsqueda ──
  const q = busqueda.trim().toLowerCase();
  const filtrado = q
    ? catalogoTotal.filter(t => t.nombre.toLowerCase().includes(q))
    : catalogoTotal;

  // Agrupar por categoría manteniendo el orden
  const porCategoria = ORDEN_CATEGORIAS.reduce((acc, cat) => {
    const items = filtrado.filter(t => t.categoria === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});
  // Categorías extra que no están en ORDEN_CATEGORIAS (custom)
  const categoriasExtra = [...new Set(filtrado.filter(t => !ORDEN_CATEGORIAS.includes(t.categoria)).map(t => t.categoria))];
  categoriasExtra.forEach(cat => {
    const items = filtrado.filter(t => t.categoria === cat);
    if (items.length > 0) porCategoria[cat] = items;
  });

  // ¿Hay exactamente esta búsqueda en el catálogo?
  const existeExacto = q && catalogoTotal.some(t => t.nombre.toLowerCase() === q);
  const mostrarBotonAgregar = q && !existeExacto && busqueda.trim().length >= 2;

  // ── Toggle checkbox ──
  const toggle = (nombre) => {
    if (selected.includes(nombre)) {
      onChange(selected.filter(s => s !== nombre));
    } else if (selected.length < 15) {
      onChange([...selected, nombre]);
    }
  };

  // ── Agregar tecnología personalizada ──
  const agregarPersonalizada = () => {
    const nombre = busqueda.trim();
    if (!nombre) return;
    const id = normalizarId(nombre);
    // Verificar que no exista ya en el catálogo (normalizado)
    const yaExiste = catalogoTotal.some(t => t.id === id || t.nombre.toLowerCase() === nombre.toLowerCase());
    if (!yaExiste) {
      const nueva = { id, nombre, categoria: 'Personalizado' };
      setCatalogoExtra(prev => [...prev, nueva]);
    }
    // Seleccionar automáticamente
    const nombreFinal = yaExiste
      ? catalogoTotal.find(t => t.nombre.toLowerCase() === nombre.toLowerCase())?.nombre || nombre
      : nombre;
    if (!selected.includes(nombreFinal)) {
      onChange([...selected, nombreFinal]);
    }
    setBusqueda('');
    inputRef.current?.focus();
  };

  // ── Quitar chip ──
  const quitarSeleccionada = (nombre) => onChange(selected.filter(s => s !== nombre));

  return (
    <div className="prj-tech-picker" ref={ref}>

      {/* ── Chips de seleccionadas + botón abrir ── */}
      <div
        className={`prj-tech-trigger${panelAbierto ? ' open' : ''}`}
        onClick={() => setPanelAbierto(v => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setPanelAbierto(v => !v)}
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
                >
                  <svg viewBox="0 0 12 12"><path d="M1 1l10 10M11 1L1 11"/></svg>
                </button>
              </span>
            ))}
          </div>
        )}
        <div style={{ marginLeft: 'auto', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          {selected.length > 0 && (
            <span className="prj-tech-count">{selected.length}/15</span>
          )}
          <svg viewBox="0 0 10 6" style={{ width: 10, height: 10, stroke: 'var(--gris-texto)', fill: 'none', strokeWidth: 2, transition: 'transform .15s', transform: panelAbierto ? 'rotate(180deg)' : 'none' }}>
            <path d="M1 1l4 4 4-4"/>
          </svg>
        </div>
      </div>

      {/* ── Panel desplegable ── */}
      {panelAbierto && (
        <div className="prj-tech-panel">

          {/* Buscador */}
          <div className="prj-tech-search-wrap">
            <svg viewBox="0 0 14 14" style={{ width: 13, height: 13, stroke: 'var(--gris-texto)', fill: 'none', strokeWidth: 1.8, flexShrink: 0 }}>
              <circle cx="6" cy="6" r="4.5"/><path d="M10 10l2.5 2.5"/>
            </svg>
            <input
              ref={inputRef}
              className="prj-tech-search-input"
              placeholder="Buscar tecnología..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && mostrarBotonAgregar) agregarPersonalizada(); }}
            />
            {busqueda && (
              <button type="button" className="prj-tech-search-clear" onClick={() => { setBusqueda(''); inputRef.current?.focus(); }}>
                <svg viewBox="0 0 12 12"><path d="M1 1l10 10M11 1L1 11" stroke="var(--gris-texto)" fill="none" strokeWidth="2"/></svg>
              </button>
            )}
          </div>

          {/* Botón agregar personalizada */}
          {mostrarBotonAgregar && (
            <div className="prj-tech-add-custom">
              <button type="button" className="prj-tech-add-btn" onClick={agregarPersonalizada}>
                <svg viewBox="0 0 12 12"><path d="M6 1v10M1 6h10" stroke="currentColor" fill="none" strokeWidth="2"/></svg>
                Agregar &quot;{busqueda.trim()}&quot;
              </button>
              <span className="prj-tech-add-hint">Tecnología personalizada</span>
            </div>
          )}

          {/* Lista de checkboxes */}
          <div className="prj-tech-list">
            {Object.keys(porCategoria).length === 0 ? (
              <div className="prj-tech-empty">
                Sin resultados.
                {busqueda.trim().length >= 2 && <> Usa el botón de arriba para agregar &quot;{busqueda.trim()}&quot;.</>}
              </div>
            ) : (
              Object.entries(porCategoria).map(([cat, items]) => (
                <div key={cat} className="prj-tech-group">
                  <div className="prj-tech-group-label">{cat}</div>
                  {items.map(tech => {
                    const checked = selected.includes(tech.nombre);
                    const disabled = !checked && selected.length >= 15;
                    return (
                      <label
                        key={tech.id}
                        className={`prj-tech-item${checked ? ' checked' : ''}${disabled ? ' disabled' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disabled}
                          onChange={() => toggle(tech.nombre)}
                        />
                        <span className="prj-tech-nombre">{tech.nombre}</span>
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
            )}
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
  );
}
