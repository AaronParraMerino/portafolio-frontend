import { useState } from 'react';
import '../styles/profile.css';

/* Separa "Nombre Apellido" en dos campos al abrir el modal */
function splitNombre(nombreCompleto = '') {
  const parts = nombreCompleto.trim().split(/\s+/);
  if (parts.length === 1) return { nombre: parts[0], apellido: '' };
  const apellido = parts.slice(1).join(' ');
  return { nombre: parts[0], apellido };
}

export default function ProfileEdit({ perfil, onGuardar, onCancelar, guardando }) {
  const { nombre, apellido } = splitNombre(perfil.nombre);

  const [form, setForm] = useState({
    nombre,
    apellido,
    profesion: perfil.profesion || '',
    biografia: perfil.biografia || '',
    correo:    perfil.correo    || '',
    pais:      perfil.pais      || '',
    ciudad:    perfil.ciudad    || '',
    telefono:  perfil.telefono  || '',
    linkedin:  perfil.linkedin  || '',
    github:    perfil.github    || '',
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    /* Reconstruye nombre completo antes de guardar */
    const nombreCompleto = [form.nombre, form.apellido].filter(Boolean).join(' ');
    // BACKEND: onGuardar llama PUT /api/profile con payload
    onGuardar({ ...form, nombre: nombreCompleto });
  };

  /* Cierra al hacer click en el overlay */
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !guardando) onCancelar();
  };

  return (
    <div className="prf-modal-overlay" onClick={handleOverlayClick}>
      <div className="prf-modal" role="dialog" aria-modal="true" aria-label="Editar perfil">

        {/* ── Cabecera ── */}
        <div className="prf-modal-head">
          <div>
            <div className="prf-modal-title">Editar perfil</div>
            <div className="prf-modal-sub">Los cambios se reflejan en tu vista pública</div>
          </div>
          <button
            className="prf-modal-close"
            onClick={onCancelar}
            disabled={guardando}
            title="Cerrar"
          >
            <svg viewBox="0 0 12 12">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" fill="none" strokeWidth="2.2"/>
            </svg>
          </button>
        </div>

        {/* ── Formulario ── */}
        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
          <div className="prf-modal-body">

            {/* Sección: Información básica */}
            <div className="prf-form-section">
              <span className="prf-section-label">Información básica</span>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="prf-label">Nombre</label>
                  <input
                    className="form-control prf-input"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                    placeholder="Tu nombre"
                  />
                </div>
                <div className="col-md-6">
                  <label className="prf-label">Apellido</label>
                  <input
                    className="form-control prf-input"
                    name="apellido"
                    value={form.apellido}
                    onChange={handleChange}
                    placeholder="Tu apellido"
                  />
                </div>
                <div className="col-md-6">
                  <label className="prf-label">Profesión</label>
                  <input
                    className="form-control prf-input"
                    name="profesion"
                    value={form.profesion}
                    onChange={handleChange}
                    placeholder="Ej: Dev Full Stack"
                  />
                </div>
                <div className="col-12">
                  <label className="prf-label">Acerca de mí</label>
                  <textarea
                    className="form-control prf-input"
                    name="biografia"
                    value={form.biografia}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Cuéntanos sobre ti, tu experiencia y objetivos..."
                  />
                </div>
              </div>
            </div>

            {/* Sección: Contacto */}
            <div className="prf-form-section">
              <span className="prf-section-label">Contacto</span>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="prf-label">Correo electrónico</label>
                  <input
                    className="form-control prf-input"
                    type="email"
                    name="correo"
                    value={form.correo}
                    onChange={handleChange}
                    placeholder="ejemplo@correo.com"
                  />
                </div>
                <div className="col-md-3">
                  <label className="prf-label">País</label>
                  <input
                    className="form-control prf-input"
                    name="pais"
                    value={form.pais}
                    onChange={handleChange}
                    placeholder="Bolivia"
                  />
                </div>
                <div className="col-md-3">
                  <label className="prf-label">Ciudad</label>
                  <input
                    className="form-control prf-input"
                    name="ciudad"
                    value={form.ciudad}
                    onChange={handleChange}
                    placeholder="Cochabamba"
                  />
                </div>
                <div className="col-md-6">
                  <label className="prf-label">Teléfono</label>
                  <input
                    className="form-control prf-input"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    placeholder="+591 70000000"
                  />
                </div>
              </div>
            </div>

            {/* Sección: Redes */}
            <div className="prf-form-section">
              <span className="prf-section-label">Redes profesionales</span>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="prf-label">LinkedIn</label>
                  <input
                    className="form-control prf-input"
                    name="linkedin"
                    value={form.linkedin}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/usuario"
                  />
                </div>
                <div className="col-md-6">
                  <label className="prf-label">GitHub</label>
                  <input
                    className="form-control prf-input"
                    name="github"
                    value={form.github}
                    onChange={handleChange}
                    placeholder="https://github.com/usuario"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* ── Footer ── */}
          <div className="prf-modal-foot">
            <button
              type="button"
              className="prf-btn-cancel"
              onClick={onCancelar}
              disabled={guardando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="prf-btn-save"
              disabled={guardando}
            >
              {guardando ? (
                <><span className="prf-spinner" style={{ width: 13, height: 13, borderWidth: 2 }} /> Guardando...</>
              ) : (
                <>
                  <svg viewBox="0 0 14 14">
                    <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" fill="none" strokeWidth="2.2"/>
                  </svg>
                  Guardar cambios
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}