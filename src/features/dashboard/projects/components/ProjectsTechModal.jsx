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
  'api', 'php', 'sql', 'html', 'css', 'xml', 'jwt', 'sdk', 'cli',
  'ui', 'ux', 'ios', 'aws', 'gcp', 'cdn', 'dns', 'orm', 'mvc',
  'spa', 'pwa', 'pdf', 'csv', 'json', 'yaml', 'toml', 'ci', 'cd',
  'http', 'https', 'rest', 'grpc', 'tcp', 'ip', 'oop', 'tdd',
  'bdd', 'ddd', 'sso', 'oauth', 'saml', 'ldap', 'cms', 'crm',
  'erp', 'pos', 'qr', 'ar', 'vr', 'ai', 'ml', 'nlp', 'llm',
  'gpu', 'cpu', 'ram', 'ssd', 'hdd', 'usb', 'ssh', 'ftp', 'smtp',
]);

export function formatearNombre(raw) {
  return String(raw || '')
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(word => {
      const lower = word.toLowerCase().replace(/[^a-z0-9]/g, '');

      if (ACROS.has(lower)) {
        return word.toUpperCase();
      }

      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

export default function ProjectsTechModal({
  catalogoTotal = [],
  onConfirmar,
  onCerrar,
}) {
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('Personalizado');
  const [touched, setTouched] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && typeof onCerrar === 'function') {
        onCerrar();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCerrar]);

  const nombreTrim = nombre.trim();
  const nombreFinal = nombreTrim ? formatearNombre(nombreTrim) : '';
  const idNorm = normalizarId(nombreTrim);
  const idFinal = normalizarId(nombreFinal);

  const duplicado = nombreTrim.length > 0
    ? catalogoTotal.find(
        t => normalizarId(t?.nombre || '') === idNorm || normalizarId(t?.nombre || '') === idFinal
      )
    : null;

  const getError = (force = false) => {
    if (!force && !touched) return null;
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

  const errorMsg = getError();
  const errorForzado = getError(true);
  const puedeGuardar = !errorForzado && nombreTrim.length >= 2;

  const cerrar = () => {
    if (typeof onCerrar === 'function') {
      onCerrar();
    }
  };

  const handleConfirmar = () => {
    setTouched(true);

    if (!puedeGuardar) return;

    if (typeof onConfirmar === 'function') {
      onConfirmar({
        id: normalizarId(nombreFinal),
        nombre: nombreFinal,
        categoria,
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirmar();
    }
  };

  return (
    <div
      className="dash-edit-overlay prj-modal-overlay"
      style={{ zIndex: 700 }}
      onClick={(e) => e.target === e.currentTarget && cerrar()}
    >
      <div
        className="dash-edit-modal dash-edit-modal--sm prj-modal"
        style={{ maxWidth: 420 }}
        role="dialog"
        aria-modal="true"
        aria-label="Nueva tecnología"
      >
        <div className="dash-edit-head prj-modal-head">
          <div>
            <div className="dash-edit-title prj-modal-title">Nueva tecnología</div>
            <div className="dash-edit-subtitle prj-modal-sub">
              Agrega una herramienta que no está en el catálogo
            </div>
          </div>

          <button
            type="button"
            className="dash-edit-close prj-modal-close"
            onClick={cerrar}
            title="Cerrar"
          >
            <svg viewBox="0 0 12 12">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" fill="none" strokeWidth="2.2" />
            </svg>
          </button>
        </div>

        <div className="dash-edit-body prj-modal-body" style={{ padding: '18px 20px' }}>
          <div className="row g-3">
            <div className="col-12">
              <label className="prj-label">
                Nombre de la tecnología
                <span className="prj-required-star"> *</span>
              </label>

              <input
                ref={inputRef}
                className={`dash-edit-input prj-input${errorMsg ? ' dash-edit-input-error prj-input-error' : ''}`}
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  setTouched(true);
                }}
                onBlur={() => setTouched(true)}
                onKeyDown={handleKeyDown}
                placeholder="Ej: Tauri, Bun, Drizzle ORM..."
                maxLength={61}
                autoComplete="off"
              />

              {nombreTrim.length >= 2 && !duplicado && (
                <div className="prj-tech-modal-preview">
                  <span>Se guardará como:</span>
                  <span className="prj-tag-chip" style={{ pointerEvents: 'none', fontSize: 11 }}>
                    {nombreFinal}
                  </span>
                </div>
              )}

              {errorMsg && (
                <div className="prj-field-error" role="alert">
                  <svg
                    viewBox="0 0 12 12"
                    style={{ width: 11, height: 11, stroke: 'currentColor', fill: 'none', strokeWidth: 2, flexShrink: 0 }}
                  >
                    <circle cx="6" cy="6" r="5" />
                    <path d="M6 3.5v3M6 8.5v.5" />
                  </svg>
                  {errorMsg}
                </div>
              )}

              {!touched && (
                <div className="prj-field-hint">
                  El nombre se formateará automáticamente al estilo del catálogo.
                </div>
              )}
            </div>

            <div className="col-12">
              <label className="prj-label">Categoría</label>

              <select
                className="dash-edit-select prj-select"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              >
                {CATEGORIAS_DISPONIBLES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <div className="prj-field-hint">
                Elegí la categoría que mejor describe esta tecnología.
                Si no estás seguro, dejá &ldquo;Personalizado&rdquo;.
              </div>
            </div>
          </div>
        </div>

        <div className="dash-edit-footer prj-modal-foot">
          <button type="button" className="dash-edit-btn dash-edit-btn--secondary prj-btn-cancel" onClick={cerrar}>
            Cancelar
          </button>

          <button
            type="button"
            className="dash-edit-btn dash-edit-btn--primary prj-btn-save"
            onClick={handleConfirmar}
            disabled={touched && !!errorMsg}
          >
            <svg viewBox="0 0 14 14">
              <path d="M6 1v10M1 6h10" stroke="currentColor" fill="none" strokeWidth="2.2" />
            </svg>
            Agregar al catálogo
          </button>
        </div>
      </div>
    </div>
  );
}
