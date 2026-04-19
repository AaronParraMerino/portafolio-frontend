import { useState, useRef } from 'react';
import '../styles/projects.css';
import ConfirmModal from '../../../../shared/ui/ConfirmModal';
import TechCheckboxPicker from './TechCheckboxPicker';
import { ESTADOS_PROYECTO, TIPOS_PROYECTO } from '../model/projectsModel';

/* ════════════════════════════════════════
   Validaciones
════════════════════════════════════════ */
function validate(form) {
  const e = {};
  if (!form.titulo.trim()) e.titulo = 'El título es obligatorio.';
  else if (form.titulo.trim().length < 3) e.titulo = 'Mínimo 3 caracteres.';
  else if (form.titulo.length > 100) e.titulo = 'Máximo 100 caracteres.';
  if (form.descripcion.length > 600) e.descripcion = `Máximo 600 caracteres (${form.descripcion.length}/600).`;
  if (form.url_repositorio && !/^https?:\/\/.+/.test(form.url_repositorio))
    e.url_repositorio = 'Debe ser una URL válida (https://...)';
  if (form.url_demo && !/^https?:\/\/.+/.test(form.url_demo))
    e.url_demo = 'Debe ser una URL válida (https://...)';
  if (!form.en_curso && form.fecha_inicio && form.fecha_fin && form.fecha_fin < form.fecha_inicio)
    e.fecha_fin = 'La fecha de fin no puede ser anterior al inicio.';
  return e;
}

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <div className="prj-field-error" role="alert">
      <svg viewBox="0 0 12 12"><circle cx="6" cy="6" r="5"/><path d="M6 3.5v3M6 8.5v.5"/></svg>
      {msg}
    </div>
  );
}

/* ════════════════════════════════════════
   Sub-componente: zona de upload imagen
════════════════════════════════════════ */
function ImageUploadZone({ preview, onFile, onRemove, cargando }) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);

  const handleFile = (f) => { if (f?.type.startsWith('image/')) onFile(f); };

  return (
    <div
      className={`prj-upload-zone${drag ? ' drag' : ''}${preview ? ' has-preview' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files?.[0]); }}
      onClick={() => !preview && inputRef.current?.click()}
    >
      {preview ? (
        <div className="prj-upload-preview-wrap">
          <img src={preview} alt="Portada" className="prj-upload-preview" />
          <button type="button" className="prj-upload-remove" onClick={(e) => { e.stopPropagation(); onRemove(); }} title="Quitar">
            <svg viewBox="0 0 12 12"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" fill="none" strokeWidth="2.2"/></svg>
          </button>
        </div>
      ) : (
        <div className="prj-upload-placeholder">
          <div className="prj-upload-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <div className="prj-upload-text">Arrastrá la imagen de portada aquí</div>
          <div className="prj-upload-subtext">o hacé clic para seleccionar · JPG, PNG — máx. 5 MB</div>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
        className="d-none" disabled={cargando}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

/* ════════════════════════════════════════
   ProjectsEdit — Modal crear / editar
   Props:
   ─ proyecto   object | null   (null = nuevo)
   ─ onGuardar  fn(datos, archivo)
   ─ onCancelar fn()
   ─ guardando  bool
════════════════════════════════════════ */
export default function ProjectsEdit({ proyecto, onGuardar, onCancelar, guardando }) {
  const esNuevo = !proyecto;

  const [form, setForm] = useState({
    titulo:          proyecto?.titulo          || '',
    descripcion:     proyecto?.descripcion     || '',
    url_repositorio: proyecto?.url_repositorio || '',
    url_demo:        proyecto?.url_demo        || '',
    estado:          proyecto?.estado          || 'borrador',
    tipo:            proyecto?.tipo            || '',
    fecha_inicio:    proyecto?.fecha_inicio    || '',
    fecha_fin:       proyecto?.fecha_fin       || '',
    en_curso:        proyecto?.en_curso        ?? false,
    es_publico:      proyecto?.es_publico      ?? true,
    etiquetas:       proyecto?.etiquetas       || [],
  });
  const [preview,         setPreview]         = useState(proyecto?.imagenUrl || proyecto?.imagen_portada || null);
  const [archivoImagen,   setArchivoImagen]   = useState(null);
  const [touched,         setTouched]         = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [confirmPending,  setConfirmPending]  = useState(null);

  const errors   = validate(form);
  const hasErrors = Object.keys(errors).length > 0;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  const handleBlur = (e) => setTouched(prev => ({ ...prev, [e.target.name]: true }));
  const showErr = (f) => (touched[f] || submitAttempted) && errors[f];

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setTouched({ titulo: true, descripcion: true, url_repositorio: true, url_demo: true, fecha_fin: true });
    if (hasErrors) return;
    setConfirmPending({ ...form, _archivo: archivoImagen });
  };

  const handleConfirmar = () => {
    if (confirmPending) {
      const { _archivo, ...datos } = confirmPending;
      onGuardar(datos, _archivo);
      setConfirmPending(null);
    }
  };

  return (
    <>
      <div
        className="prj-modal-overlay"
        onClick={(e) => e.target === e.currentTarget && !guardando && onCancelar()}
      >
        <div className="prj-modal" role="dialog" aria-modal="true">

          {/* Cabecera */}
          <div className="prj-modal-head">
            <div>
              <div className="prj-modal-title">{esNuevo ? 'Nuevo proyecto' : 'Editar proyecto'}</div>
              <div className="prj-modal-sub">
                {esNuevo ? 'Completa los datos para agregar un nuevo proyecto' : 'Edita la información del proyecto'}
              </div>
            </div>
            <button className="prj-modal-close" onClick={onCancelar} disabled={guardando} title="Cerrar">
              <svg viewBox="0 0 12 12"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" fill="none" strokeWidth="2.2"/></svg>
            </button>
          </div>

          {/* Banner error global */}
          {submitAttempted && hasErrors && (
            <div style={{ display:'flex', alignItems:'center', gap:8, margin:'0 22px 0', padding:'9px 14px', background:'var(--rojo-bg)', border:'1px solid var(--rojo-borde)', borderRadius:7, fontSize:12.5, fontWeight:600, color:'var(--rojo-soft)' }}>
              <svg viewBox="0 0 14 14" style={{ width:14, height:14, stroke:'currentColor', fill:'none', strokeWidth:2, flexShrink:0 }}><path d="M7 1L1 12h12L7 1z"/><path d="M7 5.5v3M7 10v.5"/></svg>
              Revisa los campos marcados antes de guardar.
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'contents' }} autoComplete="off" noValidate>
            <div className="prj-modal-body">

              {/* ── Imagen de portada ── */}
              <div className="prj-form-section">
                <span className="prj-section-label">Imagen de portada</span>
                <ImageUploadZone
                  preview={preview}
                  onFile={(f) => { setArchivoImagen(f); setPreview(URL.createObjectURL(f)); }}
                  onRemove={() => { setArchivoImagen(null); setPreview(null); }}
                  cargando={guardando}
                />
              </div>

              {/* ── Info básica ── */}
              <div className="prj-form-section">
                <span className="prj-section-label">Información básica</span>
                <div className="row g-3">

                  <div className="col-12">
                    <label className="prj-label">
                      Título del proyecto <span className="prj-required-star">*</span>
                      <span className="prj-char-count" style={{ color: form.titulo.length > 90 ? 'var(--rojo-soft)' : 'var(--gris-texto)' }}>
                        {form.titulo.length}/100
                      </span>
                    </label>
                    <input
                      className={`prj-input${showErr('titulo') ? ' prj-input-error' : ''}`}
                      name="titulo" value={form.titulo}
                      onChange={handleChange} onBlur={handleBlur}
                      placeholder="Ej: Sistema de Gestión Académica — UMSS"
                      maxLength={101}
                    />
                    <FieldError msg={showErr('titulo')} />
                  </div>

                  <div className="col-12">
                    <label className="prj-label">
                      Descripción
                      <span className="prj-char-count" style={{ color: form.descripcion.length > 550 ? 'var(--rojo-soft)' : 'var(--gris-texto)' }}>
                        {form.descripcion.length}/600
                      </span>
                    </label>
                    <textarea
                      className={`prj-input${showErr('descripcion') ? ' prj-input-error' : ''}`}
                      name="descripcion" value={form.descripcion}
                      onChange={handleChange} onBlur={handleBlur}
                      rows={3}
                      placeholder="Describe el proyecto, sus funcionalidades y objetivos..."
                      maxLength={601}
                    />
                    <FieldError msg={showErr('descripcion')} />
                  </div>

                  {/* Estado + Tipo */}
                  <div className="col-md-6">
                    <label className="prj-label">Estado</label>
                    <select className="prj-select" name="estado" value={form.estado} onChange={handleChange}>
                      {ESTADOS_PROYECTO.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="prj-label">Tipo de proyecto</label>
                    <select className="prj-select" name="tipo" value={form.tipo} onChange={handleChange}>
                      <option value="">Sin especificar</option>
                      {TIPOS_PROYECTO.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="prj-checkbox-label">
                      <input type="checkbox" name="es_publico" checked={form.es_publico} onChange={handleChange} />
                      Visible en mi portafolio público
                    </label>
                  </div>

                </div>
              </div>

              {/* ── Tecnologías ── */}
              <div className="prj-form-section">
                <span className="prj-section-label">Tecnologías / Stack</span>
                <label className="prj-label">Seleccionar tecnologías</label>
                <TechCheckboxPicker
                  selected={form.etiquetas}
                  onChange={(tags) => setForm(prev => ({ ...prev, etiquetas: tags }))}
                />
              </div>

              {/* ── Links ── */}
              <div className="prj-form-section">
                <span className="prj-section-label">Links</span>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="prj-label">URL del repositorio</label>
                    <input
                      className={`prj-input${showErr('url_repositorio') ? ' prj-input-error' : ''}`}
                      name="url_repositorio" value={form.url_repositorio}
                      onChange={handleChange} onBlur={handleBlur}
                      placeholder="https://github.com/usuario/proyecto"
                    />
                    <FieldError msg={showErr('url_repositorio')} />
                  </div>
                  <div className="col-12">
                    <label className="prj-label">URL de demo / sitio web</label>
                    <input
                      className={`prj-input${showErr('url_demo') ? ' prj-input-error' : ''}`}
                      name="url_demo" value={form.url_demo}
                      onChange={handleChange} onBlur={handleBlur}
                      placeholder="https://mi-proyecto.com"
                    />
                    <FieldError msg={showErr('url_demo')} />
                  </div>
                </div>
              </div>

              {/* ── Período ── */}
              <div className="prj-form-section">
                <span className="prj-section-label">Período</span>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="prj-label">Fecha de inicio</label>
                    <input type="date" className="prj-input" name="fecha_inicio" value={form.fecha_inicio} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="prj-label">Fecha de fin</label>
                    <input
                      type="date"
                      className={`prj-input${showErr('fecha_fin') ? ' prj-input-error' : ''}`}
                      name="fecha_fin" value={form.fecha_fin}
                      onChange={handleChange} onBlur={handleBlur}
                      disabled={form.en_curso}
                    />
                    <FieldError msg={showErr('fecha_fin')} />
                  </div>
                  <div className="col-12">
                    <label className="prj-checkbox-label">
                      <input type="checkbox" name="en_curso" checked={form.en_curso} onChange={handleChange} />
                      Proyecto en curso (sin fecha de fin)
                    </label>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="prj-modal-foot">
              <button type="button" className="prj-btn-cancel" onClick={onCancelar} disabled={guardando}>Cancelar</button>
              <button type="submit" className="prj-btn-save" disabled={guardando}>
                {guardando
                  ? <><span className="prj-spinner" /> Guardando...</>
                  : <><svg viewBox="0 0 14 14"><path d="M2 7l3.5 3.5L12 3" stroke="currentColor" fill="none" strokeWidth="2.2"/></svg>{esNuevo ? 'Agregar proyecto' : 'Guardar cambios'}</>
                }
              </button>
            </div>
          </form>
        </div>
      </div>

      {confirmPending && (
        <ConfirmModal
          open
          title={esNuevo ? '¿Agregar proyecto?' : '¿Guardar cambios?'}
          message={esNuevo
            ? 'El proyecto se añadirá a tu portafolio. Podrás editarlo en cualquier momento.'
            : 'Los cambios se reflejarán en tu portafolio público de inmediato.'
          }
          confirmLabel={esNuevo ? 'Sí, agregar' : 'Sí, guardar'}
          variant="blue"
          icon="check"
          loading={guardando}
          onConfirm={handleConfirmar}
          onClose={() => !guardando && setConfirmPending(null)}
        />
      )}
    </>
  );
}