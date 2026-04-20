import { useState, useEffect, useRef } from 'react';
import { normalizarId } from '../model/projectsModel';
import '../styles/projects.css';

/* ════════════════════════════════════════
   ProjectsTechModal
   src/features/dashboard/projects/components/ProjectsTechModal.jsx

   Mini-modal para crear una nueva tecnología que no
   existe en el catálogo. Se abre desde el botón
   "+ Nueva tecnología" del ProjectsTechPicker.

   Flujo:
   1. Usuario escribe el nombre
   2. Sistema normaliza y detecta duplicados en tiempo real
   3. Muestra preview del formato final
   4. Al confirmar → llama onConfirmar(tech) y cierra

   Props:
   ─ catalogoTotal   object[]   catálogo base + extras de sesión
   ─ onConfirmar     fn(tech)   { id, nombre, categoria }
   ─ onCerrar        fn()
════════════════════════════════════════ */

const CATEGORIAS_DISPONIBLES = [
  'Frontend',
  'Backend',
  'Móvil',
  'Lenguaje',
  'BD',
  'DevOps',
  'Herramienta',
  'Personalizado',
];

const ACROS = new Set([
  'api','php','sql','html','css','xml','jwt','sdk','cli',
  'ui','ux','ios','aws','gcp','cdn','dns','orm','mvc',
  'spa','pwa','pdf','csv','json','yaml','toml','ci','cd',
  'http','https','rest','grpc','tcp','ip','oop','tdd',
  'bdd','ddd','sso','oauth','saml','ldap','cms','crm',
  'erp','pos','qr','ar','vr','ai','ml','nlp','llm',
  'gpu','cpu','ram','ssd','hdd','usb','ssh','ftp','smtp',
]);

export function formatearNombre(raw) {
  return raw
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(word => {
      const lower = word.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (ACROS.has(lower)) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

export default function ProjectsTechModal({ catalogoTotal = [], onConfirmar, onCerrar }) {
  const [nombre,    setNombre]    = useState('');
  const [categoria, setCategoria] = useState('Personalizado');
  const [touched,   setTouched]   = useState(false);
  const inputRef = useRef(null);

  // Focus al montar
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 60);
  }, []);

  // Cerrar con Escape
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onCerrar(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onCerrar]);

  // ── Lógica de validación en tiempo real ──
  const nombreTrim  = nombre.trim();
  const nombreFinal = nombreTrim ? formatearNombre(nombreTrim) : '';
  const idNorm      = normalizarId(nombreTrim);
  const idFinal     = normalizarId(nombreFinal);

  // Detectar duplicado comparando ambas versiones normalizadas
  const duplicado = nombreTrim.length > 0
    ? catalogoTotal.find(
        t => normalizarId(t.nombre) === idNorm || normalizarId(t.nombre) === idFinal
      )
    : null;

  // Mensajes de validación
  const getError = () => {
    if (!touched) return null;
    if (!nombreTrim) return 'El nombre es obligatorio.';
    if (nombreTrim.length < 2) return 'Mínimo 2 caracteres.';
    if (nombreTrim.length > 60) return 'Máximo 60 caracteres.';
    if (duplicado) {
      const cat = duplicado.categoria !== 'Personalizado'
        ? ` (categoría: ${duplicado.categoria})`
        : '';
      return `"${duplicado.nombre}" ya existe en el catálogo${cat}. No es necesario crearla.`;
    }
    return null;
  };

  const errorMsg  = getError();
  const puedeGuardar = touched && !errorMsg && nombreTrim.length >= 2;

  const handleConfirmar = () => {
    setTouched(true);
    if (!puedeGuardar) return;
    onConfirmar({
      id:        normalizarId(nombreFinal),
      nombre:    nombreFinal,
      categoria,
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleConfirmar(); }
  };

  return (
    /* z-index 700 — por encima del modal de edición (500) y ConfirmModal (600) */
    <div
      className="prj-modal-overlay"
      style={{ zIndex: 700 }}
      onClick={(e) => e.target === e.currentTarget && onCerrar()}
    >
      <div
        className="prj-modal"
        style={{ maxWidth: 420 }}
        role="dialog"
        aria-modal="true"
        aria-label="Nueva tecnología"
      >

        {/* ── Cabecera ── */}
        <div className="prj-modal-head">
          <div>
            <div className="prj-modal-title">Nueva tecnología</div>
            <div className="prj-modal-sub">
              Agrega una herramienta que no está en el catálogo
            </div>
          </div>
          <button className="prj-modal-close" onClick={onCerrar} title="Cerrar">
            <svg viewBox="0 0 12 12">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" fill="none" strokeWidth="2.2"/>
            </svg>
          </button>
        </div>

        {/* ── Cuerpo ── */}
        <div className="prj-modal-body" style={{ padding: '18px 20px' }}>
          <div className="row g-3">

            {/* Campo nombre */}
            <div className="col-12">
              <label className="prj-label">
                Nombre de la tecnología
                <span className="prj-required-star"> *</span>
              </label>
              <input
                ref={inputRef}
                className={`prj-input${errorMsg ? ' prj-input-error' : ''}`}
                value={nombre}
                onChange={e => { setNombre(e.target.value); setTouched(true); }}
                onKeyDown={handleKeyDown}
                placeholder="Ej: Tauri, Bun, Drizzle ORM..."
                maxLength={61}
                autoComplete="off"
              />

              {/* Preview del formato final */}
              {nombreTrim.length >= 2 && !duplicado && (
                <div className="prj-tech-modal-preview">
                  <span>Se guardará como:</span>
                  <span className="prj-tag-chip" style={{ pointerEvents: 'none', fontSize: 11 }}>
                    {nombreFinal}
                  </span>
                </div>
              )}

              {/* Error */}
              {errorMsg && (
                <div className="prj-field-error" role="alert">
                  <svg viewBox="0 0 12 12" style={{ width: 11, height: 11, stroke: 'currentColor', fill: 'none', strokeWidth: 2, flexShrink: 0 }}>
                    <circle cx="6" cy="6" r="5"/>
                    <path d="M6 3.5v3M6 8.5v.5"/>
                  </svg>
                  {errorMsg}
                </div>
              )}

              {/* Hint */}
              {!touched && (
                <div className="prj-field-hint">
                  El nombre se formateará automáticamente al estilo del catálogo.
                </div>
              )}
            </div>

            {/* Selector de categoría */}
            <div className="col-12">
              <label className="prj-label">Categoría</label>
              <select
                className="prj-select"
                value={categoria}
                onChange={e => setCategoria(e.target.value)}
              >
                {CATEGORIAS_DISPONIBLES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="prj-field-hint">
                Elegí la categoría que mejor describe esta tecnología.
                Si no estás seguro, dejá &ldquo;Personalizado&rdquo;.
              </div>
            </div>

          </div>
        </div>

        {/* ── Footer ── */}
        <div className="prj-modal-foot">
          <button type="button" className="prj-btn-cancel" onClick={onCerrar}>
            Cancelar
          </button>
          <button
            type="button"
            className="prj-btn-save"
            onClick={handleConfirmar}
            disabled={touched && !!errorMsg}
          >
            <svg viewBox="0 0 14 14">
              <path d="M6 1v10M1 6h10" stroke="currentColor" fill="none" strokeWidth="2.2"/>
            </svg>
            Agregar al catálogo
          </button>
        </div>

      </div>
    </div>
  );
}