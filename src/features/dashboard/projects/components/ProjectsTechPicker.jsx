import { useState, useRef, useEffect, useMemo } from 'react';
import { useLanguage } from '../../../../core/i18n';
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
  'Móvil',
  'Lenguaje',
  'Framework',
  'Libreria',
  'Base de datos',
  'Herramienta',
  'Servicio',
  'Plataforma',
  'Otro',
];

function normalizarTexto(value) {
  return String(value || '').trim().toLowerCase();
}

function getTechNombre(tech) {
  if (typeof tech === 'string') return tech;
  return tech?.nombre || tech?.name || tech?.label || '';
}

function getTechCategoria(tech) {
  return tech?.categoria || tech?.category || 'Otro';
}

function getTechIcono(tech) {
  return tech?.icono_url || tech?.iconoUrl || tech?.icon || '';
}

function getTechColor(tech) {
  return tech?.color || '';
}


const CATEGORY_KEY_BY_NAME = {
  Frontend: 'projects.category.frontend',
  Backend: 'projects.category.backend',
  'Móvil': 'projects.category.mobile',
  Mobile: 'projects.category.mobile',
  Lenguaje: 'projects.category.language',
  Language: 'projects.category.language',
  Framework: 'projects.category.framework',
  Libreria: 'projects.category.library',
  Librería: 'projects.category.library',
  Library: 'projects.category.library',
  BD: 'projects.category.database',
  'Base de datos': 'projects.category.database',
  DevOps: 'projects.category.devops',
  Herramienta: 'projects.category.tool',
  Tool: 'projects.category.tool',
  Servicio: 'projects.category.service',
  Service: 'projects.category.service',
  Plataforma: 'projects.category.platform',
  Platform: 'projects.category.platform',
  Personalizado: 'projects.category.custom',
  Custom: 'projects.category.custom',
  Otro: 'projects.category.other',
  Other: 'projects.category.other',
};

function getCategoryLabel(category, t) {
  const key = CATEGORY_KEY_BY_NAME[category] || 'projects.category.other';
  return typeof t === 'function' ? t(key) : category;
}

function colorWithAlpha(color = '', alphaHex = '24') {
  const hex = String(color || '').trim();

  if (/^#[0-9a-f]{6}$/i.test(hex)) {
    return `${hex}${alphaHex}`;
  }

  return '';
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
        icono_url: getTechIcono(item),
        color: getTechColor(item),
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
  const { t } = useLanguage();
  const [busqueda, setBusqueda] = useState('');
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);

  const ref = useRef(null);
  const inputRef = useRef(null);

  const selectedList = Array.isArray(selected)
    ? selected.filter(Boolean)
    : [];

  const catalogoTotal = useMemo(() => {
    return limpiarCatalogo(Array.isArray(catalogoExtra) ? catalogoExtra : []);
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

  const getSelectedTech = (nombre) => {
    const normalized = normalizarTexto(nombre);
    return catalogoTotal.find(tech => normalizarTexto(tech.nombre) === normalized) || {
      nombre,
      categoria: 'Otro',
      icono_url: '',
      color: '',
    };
  };

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

  const handleConfirmarTecnologia = async (tech) => {
    let finalTech = tech;

    if (typeof onAgregarExtra === 'function') {
      finalTech = await onAgregarExtra(tech) || tech;
    }

    if (!selectedList.includes(finalTech.nombre) && selectedList.length < MAX_TECHS) {
      emitirCambio([...selectedList, finalTech.nombre]);
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
          aria-label={t('projects.tech.select')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setPanelAbierto(v => !v);
            }
          }}
        >
          {selectedList.length === 0 ? (
            <span className="prj-tech-placeholder">{t('projects.tech.select')}...</span>
          ) : (
            <div className="prj-tech-chips" onClick={(e) => e.stopPropagation()}>
              {selectedList.map(s => {
                const tech = getSelectedTech(s);
                const chipStyle = tech.color
                  ? {
                      '--tech-color': tech.color,
                      '--tech-bg': colorWithAlpha(tech.color, '24'),
                      '--tech-text': '#111827',
                    }
                  : undefined;

                return (
                <span key={s} className="prj-tag-chip prj-tech-chip" style={chipStyle}>
                  <span className="prj-tech-chip-icon" aria-hidden="true">
                    {tech.icono_url ? (
                      <img src={tech.icono_url} alt="" />
                    ) : (
                      s.slice(0, 1).toUpperCase()
                    )}
                  </span>

                  <span className="prj-tech-chip-label">{s}</span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      quitarSeleccionada(s);
                    }}
                    title={`${t('projects.config.remove')} ${s}`}
                    aria-label={`${t('projects.config.remove')} ${s}`}
                  >
                    <svg viewBox="0 0 12 12">
                      <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" fill="none" strokeWidth="2.4" />
                    </svg>
                  </button>
                </span>
              );
              })}
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
                  placeholder={t('projects.tech.searchPlaceholder')}
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
                    title={t('projects.tech.clearSearch')}
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
                title={t('projects.tech.addCustomHint')}
              >
                <svg viewBox="0 0 12 12">
                  <path d="M6 1v10M1 6h10" stroke="currentColor" fill="none" strokeWidth="2.2" />
                </svg>
                {t('projects.tech.newTechnology')}
              </button>
            </div>

            {sinResultados && (
              <div className="prj-tech-no-results">
                <svg viewBox="0 0 16 16" style={{ width: 14, height: 14, stroke: 'currentColor', fill: 'none', strokeWidth: 1.6, flexShrink: 0 }}>
                  <circle cx="7" cy="7" r="5.5" />
                  <path d="M10.5 10.5l3 3" />
                </svg>

                <span>
                  {t('projects.tech.noResults', { query: busqueda })}{' '}
                  <button
                    type="button"
                    className="prj-tech-no-results-link"
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalAbierto(true);
                    }}
                  >
                    {t('projects.tech.newTechnology')}
                  </button>
                </span>
              </div>
            )}

            <div className="prj-tech-list">
              {!hayCategorias && !sinResultados ? (
                <div className="prj-tech-empty">{t('skills.loading')}</div>
              ) : hayCategorias ? (
                Object.entries(porCategoria).map(([cat, items]) => (
                  <div key={cat} className="prj-tech-group">
                    <div className="prj-tech-group-label">{getCategoryLabel(cat, t)}</div>

                    {items.map(tech => {
                      const checked = selectedList.includes(tech.nombre);
                      const disabled = !checked && selectedList.length >= MAX_TECHS;

                      return (
                        <label
                          key={tech.id}
                          className={`prj-tech-item${checked ? ' checked' : ''}${disabled ? ' disabled' : ''}`}
                          title={disabled ? t('projects.validation.maxRepos', { count: MAX_TECHS }) : undefined}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={disabled}
                            onChange={() => toggle(tech.nombre)}
                          />

                          <span
                            className="prj-tech-icon"
                            style={{ backgroundColor: tech.color || 'transparent' }}
                            aria-hidden="true"
                          >
                            {tech.icono_url ? (
                              <img src={tech.icono_url} alt="" />
                            ) : (
                              tech.nombre.slice(0, 1).toUpperCase()
                            )}
                          </span>

                          <span className="prj-tech-nombre">{tech.nombre}</span>

                          {tech.categoria && (
                            <span className="prj-tech-custom-badge">{getCategoryLabel(tech.categoria, t)}</span>
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
              <span>{selectedList.length} {t('projects.tech.select')} · {t('projects.tech.max')} {MAX_TECHS}</span>

              {selectedList.length > 0 && (
                <button
                  type="button"
                  className="prj-tech-clear-all"
                  onClick={() => emitirCambio([])}
                >
                  {t('portfolioSearch.filters.clearAll')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {modalAbierto && (
        <ProjectsTechModal
          catalogoTotal={catalogoTotal}
          onConfirmar={handleConfirmarTecnologia}
          onCerrar={() => setModalAbierto(false)}
        />
      )}
    </>
  );
}
