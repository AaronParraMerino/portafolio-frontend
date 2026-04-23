import React, { useState, useEffect } from "react";

export default function ExperienceForm({ onSave, onCancel, editData }) {
  const [formData, setFormData] = useState({
    tipo_experiencia: "Laboral",
    empresa: "",
    puesto: "",
    fecha_inicio: "",
    fecha_fin: "",
    actual: false,
    descripcion: "",
    es_publico: true, // Nuevo campo para visibilidad
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editData) {
      setFormData({
        ...editData,
        es_publico: editData.es_publico ?? true // Aseguramos que tenga valor
      });
    }
  }, [editData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.empresa.trim()) newErrors.empresa = "Este campo es obligatorio";
    if (!formData.puesto.trim()) newErrors.puesto = "Este campo es obligatorio";
    if (!formData.fecha_inicio) newErrors.fecha_inicio = "La fecha de inicio es obligatoria";

    if (!formData.actual) {
      if (!formData.fecha_fin) {
        newErrors.fecha_fin = "La fecha de fin es obligatoria";
      } else {
        const inicio = new Date(formData.fecha_inicio);
        const fin = new Date(formData.fecha_fin);
        if (inicio > fin)
          newErrors.fecha_fin = "La fecha de inicio no puede ser mayor a la fecha fin";
        else if (formData.fecha_inicio === formData.fecha_fin)
          newErrors.fecha_fin = "Las fechas no pueden ser iguales";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      try {
        await onSave(formData);
      } catch (error) {
        console.error("Error al guardar:", error);
        setIsSubmitting(false);
      }
    }
  };

  return (
    <>
      <style>{`
        .ef-overlay {
          position: fixed;
          inset: 0;
          z-index: 1050;
          background: rgba(17, 24, 39, 0.8);
          backdrop-filter: blur(8px); /* Estilo Glassmorphism */
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          overflow-y: auto;
        }

        .ef-modal {
          width: 100%;
          max-width: 600px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          overflow: hidden;
          background: var(--blanco);
          max-height: calc(100dvh - 24px);
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
        }

        .ef-header {
          flex-shrink: 0;
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #111827;
          border-bottom: 4px solid var(--azul);
        }

        /* Estilo para los selectores de tipo (Dashboard Style) */
        .tipo-selector {
          cursor: pointer;
          flex: 1;
          padding: 12px;
          border-radius: 12px;
          border: 2px solid #f3f4f6;
          transition: all 0.2s ease;
          text-align: center;
        }

        .tipo-selector.active-lab {
          background: var(--azul-light);
          border-color: var(--azul);
          color: var(--azul);
        }

        .tipo-selector.active-acad {
          background: #f5f3ff;
          border-color: #7c3aed;
          color: #7c3aed;
        }

        .visibility-banner {
          background: #f8fafc;
          border-radius: 12px;
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        @media (max-width: 480px) {
          .ef-overlay { align-items: flex-end; padding: 0; }
          .ef-modal { border-radius: 20px 20px 0 0; }
        }
      `}</style>

      <div className="ef-overlay">
        <div className="ef-modal">
          {/* CABECERA */}
          <div className="ef-header">
            <span className="ef-header-title text-white fw-bold">
              {editData ? "✏️ Editar Experiencia" : "➕ Nueva Experiencia"}
            </span>
            <button className="btn-close btn-close-white" onClick={onCancel} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: "contents" }}>
            <div className="ef-body" style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
              <div className="row g-3">
                
                {/* TIPO DE EXPERIENCIA (Estilo Botones Dashboard) */}
                <div className="col-12 mb-3">
                  <label className="form-label d-block fw-bold small text-muted text-uppercase mb-3">
                    Categoría de Experiencia
                  </label>
                  <div className="d-flex gap-3">
                    <div 
                      className={`tipo-selector ${formData.tipo_experiencia === "Laboral" ? "active-lab" : ""}`}
                      onClick={() => setFormData({ ...formData, tipo_experiencia: "Laboral" })}
                    >
                      <div className="fs-4 mb-1">💼</div>
                      <span className="fw-bold small">Laboral</span>
                    </div>
                    <div 
                      className={`tipo-selector ${formData.tipo_experiencia === "Académica" ? "active-acad" : ""}`}
                      onClick={() => setFormData({ ...formData, tipo_experiencia: "Académica" })}
                    >
                      <div className="fs-4 mb-1">🎓</div>
                      <span className="fw-bold small">Académica</span>
                    </div>
                  </div>
                </div>

                {/* EMPRESA Y PUESTO */}
                <div className="col-md-6 col-12">
                  <label className="form-label fw-bold small">Empresa / Institución *</label>
                  <input
                    type="text"
                    className={`form-control ${errors.empresa ? "is-invalid" : ""}`}
                    maxLength={30}
                    placeholder="Ej: Google, UMSS, Facebook..."
                    value={formData.empresa}
                    onChange={(e) => {
                      setFormData({ ...formData, empresa: e.target.value });
                      if (errors.empresa) setErrors({ ...errors, empresa: null });
                    }}
                  />
                  <div className="text-end mt-1">
                    <small className="text-muted" style={{ fontSize: "10px" }}>{formData.empresa.length}/30</small>
                  </div>
                </div>

                <div className="col-md-6 col-12">
                  <label className="form-label fw-bold small">Puesto / Cargo *</label>
                  <input
                    type="text"
                    className={`form-control ${errors.puesto ? "is-invalid" : ""}`}
                    value={formData.puesto}
                    placeholder="Ej: Desarrollador, QA, Docente..."
                    onChange={(e) => {
                      setFormData({ ...formData, puesto: e.target.value });
                      if (errors.puesto) setErrors({ ...errors, puesto: null });
                    }}
                  />
                </div>

                {/* DESCRIPCIÓN */}
                <div className="col-12">
                  <label className="form-label fw-bold small">Logros y Responsabilidades</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    maxLength={200}
                    placeholder="Describe tus logros y responsabilidades..."
                    style={{ resize: "none" }}
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  />
                  <div className="text-end mt-1">
                    <small className="text-muted" style={{ fontSize: "10px" }}>{formData.descripcion.length}/200</small>
                  </div>
                </div>

                {/* FECHAS */}
                <div className="col-md-6 col-12">
                  <label className="form-label fw-bold small">Fecha Inicio *</label>
                  <input
                    type="date"
                    className={`form-control ${errors.fecha_inicio ? "is-invalid" : ""}`}
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                  />
                </div>

                <div className="col-md-6 col-12">
                  <label className="form-label fw-bold small">Fecha Fin</label>
                  <input
                    type="date"
                    className={`form-control ${errors.fecha_fin ? "is-invalid" : ""}`}
                    disabled={formData.actual}
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                  />
                </div>

                {/* CHECKBOX ACTUAL */}
                <div className="col-12 mb-2">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="checkAct"
                      checked={formData.actual}
                      onChange={(e) => setFormData({ ...formData, actual: e.target.checked, fecha_fin: "" })}
                    />
                    <label className="form-check-label small fw-bold text-muted" htmlFor="checkAct">
                      Actualmente trabajo/estudio aquí
                    </label>
                  </div>
                </div>

                {/* VISIBILIDAD (EL OJITO) */}
                <div className="col-12 mt-2">
                  <div className="visibility-banner">
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ fontSize: '1.2rem' }}>{formData.es_publico ? '👁️' : '👁️‍🗨️'}</span>
                      <div>
                        <div className="fw-bold small">Visibilidad del Perfil</div>
                        <div className="text-muted" style={{ fontSize: '11px' }}>
                          {formData.es_publico ? 'Visible para empresas' : 'Oculto en el portafolio'}
                        </div>
                      </div>
                    </div>
                    <div className="form-check form-switch">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        checked={formData.es_publico}
                        onChange={(e) => setFormData({...formData, es_publico: e.target.checked})}
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* FOOTER */}
            <div className="ef-footer" style={{ padding: '16px 24px', background: '#f9fafb', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '12px', justifyContent: 'end' }}>
              <button type="button" className="btn btn-light border fw-bold px-4" onClick={onCancel} disabled={isSubmitting}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary fw-bold px-4 shadow-sm" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : editData ? "Actualizar Registro" : "Guardar Experiencia"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}