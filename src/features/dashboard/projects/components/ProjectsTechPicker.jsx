import { useState, useRef, useEffect, useMemo } from 'react';
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
   ─ catalogoExtra   object[]     tecnologías custom de esta sesión
   ─ onAgregarExtra  fn(tech)     persiste una nueva tech en el padre
════════════════════════════════════════ */

const MAX_TECHS = 15;

const ORDEN_CATEGORIAS = [
  'Frontend',
  'Backend',
  'Móvil',
  'Lenguaje',
  'BD',
  'DevOps',
  'Herramienta',
];

function normalizarTexto(value) {
  return String(value || '').trim().toLowerCase();
}

function getTechNombre(tech) {
  if (typeof tech === 'string') return tech;
  return tech?.nombre || tech?.name || tech?.label || '';
}

function getTechCategoria(tech) {
  return tech?.categoria || tech?.category || 'Personalizado';
}

function getTechId(tech) {
  return tech?.id || normalizarTexto(getTechNombre(tech)).replace(/[^a-z0-9]/g, '');
}

function limpiarCatalogo(catalogo = []) {
  const map = new Map();

  catalogo.forEach(item => {
    const nombre = getTechNombre(item).trim();
    if (!nombre) return;

    const id = getTechId(item) || normalizarTexto(nombre).replace(/[^a-z0-9]/g, '');
    const key = id || normalizarTexto(nombre);

    if (!map.has(key)) {
      map.set(key, {
        id: key,
        nombre,
        categoria: getTechCategoria(item),
      });
    }
  });

  return Array.from(map.values());
}

export default function ProjectsTechPicker({
  selected = [],
  onChange,
  catalogoExtra = [],
  onAgregarExtra,
}) {
  const [busqueda, setBusqueda] = useState('');
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);

  const ref = useRef(null);
  const inputRef = useRef(null);

  const selectedList = Array.isArray(selected)
    ? selected.filter(Boolean)
    : [];

  const catalogoTotal = useMemo(() => {
    return limpiarCatalogo([
      ...CATALOGO_TECNOLOGIAS,
      ...(Array.isArray(catalogoExtra) ? catalogoExtra : []),
    ]);
  }, [catalogoExtra]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setPanelAbierto(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setPanelAbierto(false);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    if (panelAbierto && inputRef.current) {
      inputRef.current.focus();
    }

    if (!panelAbierto) {
      setBusqueda('');
    }
  }, [panelAbierto]);

  const emitirCambio = (next) => {
    if (typeof onChange === 'function') {
      onChange(next);
    }
  };

  const q = busqueda.trim().toLowerCase();

  const filtrado = q
    ? catalogoTotal.filter(t => t.nombre.toLowerCase().includes(q))
    : catalogoTotal;

  const porCategoria = {};

  ORDEN_CATEGORIAS.forEach(cat => {
    const items = filtrado.filter(t => t.categoria === cat);

    if (items.length) {
      porCategoria[cat] = items;
    }
  });

  [...new Set(filtrado.filter(t => !ORDEN_CATEGORIAS.includes(t.categoria)).map(t => t.categoria))]
    .forEach(cat => {
      const items = filtrado.filter(t => t.categoria === cat);

      if (items.length) {
        porCategoria[cat] = items;
      }
    });

  const hayCategorias = Object.keys(porCategoria).length > 0;
  const sinResultados = q.length > 0 && !hayCategorias;

  const toggle = (nombre) => {
    if (selectedList.includes(nombre)) {
      emitirCambio(selectedList.filter(s => s !== nombre));
      return;
    }

    if (selectedList.length < MAX_TECHS) {
      emitirCambio([...selectedList, nombre]);
    }
  };

  const quitarSeleccionada = (nombre) => {
    emitirCambio(selectedList.filter(s => s !== nombre));
  };

  const handleConfirmarNueva = (tech) => {
    if (typeof onAgregarExtra === 'function') {
      onAgregarExtra(tech);
    }

    if (!selectedList.includes(tech.nombre) && selectedList.length < MAX_TECHS) {
      emitirCambio([...selectedList, tech.nombre]);
    }

    setModalAbierto(false);
    setBusqueda('');
  };

  return (
    <>
      <div className="prj-tech-picker" ref={ref}>
        <div
          className={`prj-tech-trigger${panelAbierto ? ' open' : ''}`}
          onClick={() => setPanelAbierto(v => !v)}
          role="button"
          tabIndex={0}
          aria-expanded={panelAbierto}
          aria-label="Seleccionar tecnologías"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setPanelAbierto(v => !v);
            }
          }}
        >
          {selectedList.length === 0 ? (
            <span className="prj-tech-placeholder">Seleccionar tecnologías...</span>
          ) : (
            <div className="prj-tech-chips" onClick={(e) => e.stopPropagation()}>
              {selectedList.map(s => (
                <span key={s} className="prj-tag-chip">
                  {s}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      quitarSeleccionada(s);
                    }}
                    title={`Quitar ${s}`}
                    aria-label={`Quitar ${s}`}
                  >
                    <svg viewBox="0 0 12 12">
                      <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" fill="none" strokeWidth="2.4" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}

          <div style={{ marginLeft: 'auto', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            {selectedList.length > 0 && (
              <span className="prj-tech-count">{selectedList.length}/{MAX_TECHS}</span>
            )}

            <svg
              viewBox="0 0 10 6"
              style={{
                width: 10,
                height: 10,
                stroke: 'var(--gris-texto)',
                fill: 'none',
                strokeWidth: 2,
                transition: 'transform .15s',
                transform: panelAbierto ? 'rotate(180deg)' : 'none',
              }}
            >
              <path d="M1 1l4 4 4-4" />
            </svg>
          </div>
        </div>

        {panelAbierto && (
          <div className="prj-tech-panel">
            <div className="prj-tech-panel-head">
              <div className="prj-tech-search-wrap">
                <svg viewBox="0 0 14 14" style={{ width: 13, height: 13, stroke: 'var(--gris-texto)', fill: 'none', strokeWidth: 1.8, flexShrink: 0 }}>
                  <circle cx="6" cy="6" r="4.5" />
                  <path d="M10 10l2.5 2.5" />
                </svg>

                <input
                  ref={inputRef}
                  className="prj-tech-search-input"
                  placeholder="Buscar tecnología..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setPanelAbierto(false);
                    }
                  }}
                />

                {busqueda && (
                  <button
                    type="button"
                    className="prj-tech-search-clear"
                    title="Limpiar búsqueda"
                    onClick={() => {
                      setBusqueda('');
                      inputRef.current?.focus();
                    }}
                  >
                    <svg viewBox="0 0 12 12">
                      <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" fill="none" strokeWidth="2" />
                    </svg>
                  </button>
                )}
              </div>

              <button
                type="button"
                className="prj-tech-new-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setModalAbierto(true);
                }}
                title="Agregar una tecnología que no está en la lista"
              >
                <svg viewBox="0 0 12 12">
                  <path d="M6 1v10M1 6h10" stroke="currentColor" fill="none" strokeWidth="2.2" />
                </svg>
                Nueva
              </button>
            </div>

            {sinResultados && (
              <div className="prj-tech-no-results">
                <svg viewBox="0 0 16 16" style={{ width: 14, height: 14, stroke: 'currentColor', fill: 'none', strokeWidth: 1.6, flexShrink: 0 }}>
                  <circle cx="7" cy="7" r="5.5" />
                  <path d="M10.5 10.5l3 3" />
                </svg>

                <span>
                  No encontramos &ldquo;{busqueda}&rdquo; en el catálogo.{' '}
                  <button
                    type="button"
                    className="prj-tech-no-results-link"
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalAbierto(true);
                    }}
                  >
                    Crear nueva tecnología
                  </button>
                </span>
              </div>
            )}

            <div className="prj-tech-list">
              {!hayCategorias && !sinResultados ? (
                <div className="prj-tech-empty">Cargando catálogo...</div>
              ) : hayCategorias ? (
                Object.entries(porCategoria).map(([cat, items]) => (
                  <div key={cat} className="prj-tech-group">
                    <div className="prj-tech-group-label">{cat}</div>

                    {items.map(tech => {
                      const checked = selectedList.includes(tech.nombre);
                      const disabled = !checked && selectedList.length >= MAX_TECHS;

                      return (
                        <label
                          key={tech.id}
                          className={`prj-tech-item${checked ? ' checked' : ''}${disabled ? ' disabled' : ''}`}
                          title={disabled ? `Máximo ${MAX_TECHS} tecnologías` : undefined}
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
                              <path d="M2 6l3 3 5-5" />
                            </svg>
                          )}
                        </label>
                      );
                    })}
                  </div>
                ))
              ) : null}
            </div>

            <div className="prj-tech-footer">
              <span>{selectedList.length} seleccionadas · máx. {MAX_TECHS}</span>

              {selectedList.length > 0 && (
                <button
                  type="button"
                  className="prj-tech-clear-all"
                  onClick={() => emitirCambio([])}
                >
                  Limpiar todo
                </button>
              )}
            </div>
          </div>
        )}
      </div>

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