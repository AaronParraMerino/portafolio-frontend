import { useState } from 'react';
import '../styles/profile.css';

export default function ProfileEdit({ perfil, onGuardar, onCancelar, guardando }) {

  const [form, setForm] = useState({
    nombre: perfil?.nombre || '',
    apellido: perfil?.apellido || '',
    profesion: perfil?.profesion || '',
    biografia: perfil?.biografia || '',
    correo: perfil?.correo || '',
    pais: perfil?.pais || '',
    ciudad: perfil?.ciudad || '',
    telefono: perfil?.telefono || '',
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Asegurar que todos los campos tengan valores válidos
    const datosLimpios = {
      nombre: form.nombre || '',
      apellido: form.apellido || '',
      profesion: form.profesion || '',
      biografia: form.biografia || '',
      correo: form.correo || '',
      pais: form.pais || '',
      ciudad: form.ciudad || '',
      telefono: form.telefono || '',
    };
    // BACKEND: onGuardar llama PUT /api/profile con payload
    onGuardar(datosLimpios);
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
        <form onSubmit={handleSubmit} style={{ display: 'contents' }} autoComplete="off">
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
                    autoComplete="given-name"
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
                    autoComplete="family-name"
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
                    autoComplete="organization-title"
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
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>

            {/* Sección: Contacto */}
            <div className="prf-form-section">
              <span className="prf-section-label">Contacto</span>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="prf-label">País</label>
                  <input
                    className="form-control prf-input"
                    name="pais"
                    value={form.pais}
                    onChange={handleChange}
                    placeholder="Bolivia"
                    autoComplete="country-name"
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
                    autoComplete="address-level2"
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
                    autoComplete="tel"
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