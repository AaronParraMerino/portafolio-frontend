import { useState, useRef, useEffect } from 'react';
import { CATALOGO_TECNOLOGIAS, normalizarId } from '../model/projectsModel';
import '../styles/projects.css';

/* ════════════════════════════════════════
   ProjectsTechPicker
   src/features/dashboard/projects/components/ProjectsTechPicker.jsx

   Selector de tecnologías estilo GitHub:
   ─ Panel desplegable con buscador
   ─ Checkboxes agrupados por categoría
   ─ Agregar tecnología custom con formato automático
   ─ Detección de duplicados (normalizado, case-insensitive)
   ─ Mensaje de error si ya existe
   ─ Chips de seleccionadas en el trigger

   Props:
   ─ selected   string[]
   ─ onChange   fn(string[])
════════════════════════════════════════ */

const ORDEN_CATEGORIAS = ['Frontend', 'Backend', 'Móvil', 'Lenguaje', 'BD', 'DevOps', 'Herramienta'];

/* Convierte "react native" → "React Native" (Title Case preservando mayúsculas forzadas) */
function formatearNombre(raw) {
  return raw
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
    // Preservar acrónimos conocidos en mayúsculas
    .replace(/\b(api|php|sql|html|css|xml|jwt|sdk|cli|ui|ux|ios|aws|gcp|cdn|dns|orm|mvc|spa|pwa|pdf|csv|json|yaml|toml|ci|cd)\b/gi,
      m => m.toUpperCase());
}

export default function ProjectsTechPicker({ selected = [], onChange }) {
  const [busqueda,       setBusqueda]       = useState('');
  const [panelAbierto,   setPanelAbierto]   = useState(false);
  const [catalogoExtra,  setCatalogoExtra]  = useState([]);
  const [errorDuplicado, setErrorDuplicado] = useState('');
  const ref      = useRef(null);
  const inputRef = useRef(null);

  const catalogoTotal = [...CATALOGO_TECNOLOGIAS, ...catalogoExtra];

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setPanelAbierto(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    if (panelAbierto && inputRef.current) inputRef.current.focus();
    if (!panelAbierto) { setBusqueda(''); setErrorDuplicado(''); }
  }, [panelAbierto]);

  // Limpiar error cuando el usuario sigue escribiendo
  useEffect(() => { setErrorDuplicado(''); }, [busqueda]);

  // ── Filtrar + agrupar ──
  const q = busqueda.trim().toLowerCase();
  const filtrado = q ? catalogoTotal.filter(t => t.nombre.toLowerCase().includes(q)) : catalogoTotal;

  const porCategoria = ORDEN_CATEGORIAS.reduce((acc, cat) => {
    const items = filtrado.filter(t => t.categoria === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});
  const categoriasExtra = [...new Set(
    filtrado.filter(t => !ORDEN_CATEGORIAS.includes(t.categoria)).map(t => t.categoria)
  )];
  categoriasExtra.forEach(cat => {
    const items = filtrado.filter(t => t.categoria === cat);
    if (items.length) porCategoria[cat] = items;
  });

  // ¿Hay coincidencia exacta (normalizada)?
  const busqNorm = normalizarId(busqueda);
  const existeExacto = busqueda.trim().length > 0 &&
    catalogoTotal.some(t => normalizarId(t.nombre) === busqNorm);

  const mostrarBotonAgregar = busqueda.trim().length >= 2 && !existeExacto;

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
    const rawNombre = busqueda.trim();
    if (!rawNombre || rawNombre.length < 2) return;

    const idNorm = normalizarId(rawNombre);

    // Buscar en todo el catálogo (normalizado) — previene duplicados case-insensitive
    const duplicado = catalogoTotal.find(t => normalizarId(t.nombre) === idNorm);
    if (duplicado) {
      setErrorDuplicado(
        `"${duplicado.nombre}" ya existe en el catálogo (categoría: ${duplicado.categoria}).`
      );
      return;
    }

    // Formatear al estilo del catálogo
    const nombreFormateado = formatearNombre(rawNombre);

    const nueva = { id: idNorm, nombre: nombreFormateado, categoria: 'Personalizado' };
    setCatalogoExtra(prev => [...prev, nueva]);

    // Seleccionar automáticamente
    if (!selected.includes(nombreFormateado) && selected.length < 15) {
      onChange([...selected, nombreFormateado]);
    }

    setBusqueda('');
    setErrorDuplicado('');
    inputRef.current?.focus();
  };

  const quitarSeleccionada = (nombre) => onChange(selected.filter(s => s !== nombre));

  return (
    <div className="prj-tech-picker" ref={ref}>

      {/* ── Trigger ── */}
      <div
        className={`prj-tech-trigger${panelAbierto ? ' open' : ''}`}
        onClick={() => setPanelAbierto(v => !v)}
        role="button"
        tabIndex={0}
        aria-expanded={panelAbierto}
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
          {selected.length > 0 && <span className="prj-tech-count">{selected.length}/15</span>}
          <svg viewBox="0 0 10 6" style={{ width: 10, height: 10, stroke: 'var(--gris-texto)', fill: 'none', strokeWidth: 2, transition: 'transform .15s', transform: panelAbierto ? 'rotate(180deg)' : 'none' }}>
            <path d="M1 1l4 4 4-4"/>
          </svg>
        </div>
      </div>

      {/* ── Panel ── */}
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
              placeholder="Buscar o escribir una nueva tecnología..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && mostrarBotonAgregar) { e.preventDefault(); agregarPersonalizada(); }
                if (e.key === 'Escape') setPanelAbierto(false);
              }}
            />
            {busqueda && (
              <button type="button" className="prj-tech-search-clear"
                onClick={() => { setBusqueda(''); setErrorDuplicado(''); inputRef.current?.focus(); }}>
                <svg viewBox="0 0 12 12"><path d="M1 1l10 10M11 1L1 11" stroke="var(--gris-texto)" fill="none" strokeWidth="2"/></svg>
              </button>
            )}
          </div>

          {/* Error de duplicado */}
          {errorDuplicado && (
            <div className="prj-tech-dup-error">
              <svg viewBox="0 0 12 12" style={{ width: 12, height: 12, stroke: 'currentColor', fill: 'none', strokeWidth: 2, flexShrink: 0 }}>
                <circle cx="6" cy="6" r="5"/><path d="M6 3.5v3M6 8.5v.5"/>
              </svg>
              {errorDuplicado}
            </div>
          )}

          {/* Botón agregar personalizada */}
          {mostrarBotonAgregar && !errorDuplicado && (
            <div className="prj-tech-add-custom">
              <button type="button" className="prj-tech-add-btn" onClick={agregarPersonalizada}>
                <svg viewBox="0 0 12 12"><path d="M6 1v10M1 6h10" stroke="currentColor" fill="none" strokeWidth="2"/></svg>
                Agregar &quot;{formatearNombre(busqueda)}&quot;
              </button>
              <span className="prj-tech-add-hint">Se formateará automáticamente · Enter para confirmar</span>
            </div>
          )}

          {/* Lista de checkboxes */}
          <div className="prj-tech-list">
            {Object.keys(porCategoria).length === 0 && !mostrarBotonAgregar ? (
              <div className="prj-tech-empty">Sin resultados para &ldquo;{busqueda}&rdquo;</div>
            ) : (
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