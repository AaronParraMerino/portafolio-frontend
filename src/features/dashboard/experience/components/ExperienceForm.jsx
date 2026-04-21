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
  });

  const [errors, setErrors]         = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editData) setFormData(editData);
  }, [editData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.empresa.trim())    newErrors.empresa      = "Este campo es obligatorio";
    if (!formData.puesto.trim())     newErrors.puesto       = "Este campo es obligatorio";
    if (!formData.fecha_inicio)      newErrors.fecha_inicio = "La fecha de inicio es obligatoria";

    if (!formData.actual) {
      if (!formData.fecha_fin) {
        newErrors.fecha_fin = "La fecha de fin es obligatoria";
      } else {
        const inicio = new Date(formData.fecha_inicio);
        const fin    = new Date(formData.fecha_fin);
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
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(2px);
          display: flex;
          align-items: center;
          justify-content: center;
          /* padding lateral mínimo en móvil para que el modal no toque los bordes */
          padding: 12px;
          overflow-y: auto;
        }

        .ef-modal {
          width: 100%;
          max-width: 600px;
          border: none;
          border-radius: 8px;
          overflow: hidden;
          background: var(--blanco);
          font-family: var(--font);
          /* en pantallas muy pequeñas el modal puede crecer verticalmente,
             pero nunca supera el viewport */
          max-height: calc(100dvh - 24px);
          display: flex;
          flex-direction: column;
        }

        /* Cabecera — fija, no se mueve al hacer scroll */
        .ef-header {
          flex-shrink: 0;
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--negro-texto);
          border-bottom: 3px solid var(--azul);
        }
        .ef-header-title {
          color: white;
          font-size: 1.05rem;
          font-weight: 700;
          font-family: var(--font);
        }

        /* Cuerpo — scrolleable cuando el contenido supera el espacio */
        .ef-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        /* Footer — fijo abajo */
        .ef-footer {
          flex-shrink: 0;
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          padding: 12px 16px;
          background: var(--fondo);
          border-top: 1px solid var(--gris-borde);
        }

        /* En móvil reducimos el padding del cuerpo y el gap del footer */
        @media (max-width: 480px) {
          .ef-overlay {
            padding: 8px;
            align-items: flex-end;    /* el modal sube desde abajo en pantallas muy pequeñas */
          }
          .ef-modal {
            border-radius: 12px 12px 0 0;
            max-height: calc(100dvh - 8px);
          }
          .ef-body {
            padding: 16px;
          }
          .ef-footer {
            padding: 10px 14px;
          }
        }
      `}</style>

      <div className="ef-overlay">
        <div className="ef-modal shadow-lg">

          {/* CABECERA */}
          <div className="ef-header">
            <span className="ef-header-title">
              {editData ? "✏️ Editar Experiencia" : "➕ Agregar Nueva Experiencia"}
            </span>
            <button
              className="btn-close btn-close-white"
              onClick={onCancel}
              style={{ fontSize: "0.8rem", opacity: 0.8 }}
            />
          </div>

          <form onSubmit={handleSubmit} style={{ display: "contents" }}>
            {/* CUERPO */}
            <div className="ef-body">
              <div className="row g-3">

                {/* Tipo de experiencia */}
                <div className="col-12 mb-1">
                  <label className="form-label d-block fw-bold small text-muted text-uppercase" style={{ letterSpacing: "1px" }}>
                    Tipo de Experiencia:
                  </label>
                  <div className="d-flex gap-4 flex-wrap">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio" name="tipo_exp" id="lab"
                        checked={formData.tipo_experiencia === "Laboral"}
                        onChange={() => setFormData({ ...formData, tipo_experiencia: "Laboral" })}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="lab">💼 Laboral</label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio" name="tipo_exp" id="acad"
                        checked={formData.tipo_experiencia === "Académica"}
                        onChange={() => setFormData({ ...formData, tipo_experiencia: "Académica" })}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="acad">🎓 Académica</label>
                    </div>
                  </div>
                </div>

                {/* Empresa */}
                <div className="col-md-6 col-12">
                  <label className="form-label fw-bold small text-dark">Empresa / Institución *</label>
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
                  <div className="d-flex justify-content-between">
                    {errors.empresa && (
                      <small className="text-danger fw-bold" style={{ fontSize: "11px" }}>{errors.empresa}</small>
                    )}
                    <small className="text-muted ms-auto" style={{ fontSize: "10px" }}>
                      {formData.empresa.length}/30
                    </small>
                  </div>
                </div>

                {/* Puesto */}
                <div className="col-md-6 col-12">
                  <label className="form-label fw-bold small text-dark">Puesto / Cargo *</label>
                  <input
                    type="text"
                    className={`form-control ${errors.puesto ? "is-invalid" : ""}`}
                    placeholder="Ej: Desarrollador, QA, Docente..."
                    value={formData.puesto}
                    onChange={(e) => {
                      setFormData({ ...formData, puesto: e.target.value });
                      if (errors.puesto) setErrors({ ...errors, puesto: null });
                    }}
                  />
                  {errors.puesto && (
                    <small className="text-danger fw-bold" style={{ fontSize: "11px" }}>{errors.puesto}</small>
                  )}
                </div>

                {/* Descripción */}
                <div className="col-12">
                  <label className="form-label fw-bold small text-dark">Descripción de tareas</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    maxLength={200}
                    placeholder="Describe tus logros y responsabilidades..."
                    style={{ resize: "none" }}
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  />
                  <div className="text-end">
                    <small className="text-muted" style={{ fontSize: "10px" }}>
                      {formData.descripcion.length}/200
                    </small>
                  </div>
                </div>

                {/* Fecha inicio */}
                <div className="col-md-6 col-12">
                  <label className="form-label fw-bold small text-dark">Fecha Inicio *</label>
                  <input
                    type="date"
                    className={`form-control ${errors.fecha_inicio ? "is-invalid" : ""}`}
                    value={formData.fecha_inicio}
                    onChange={(e) => {
                      setFormData({ ...formData, fecha_inicio: e.target.value });
                      setErrors({ ...errors, fecha_inicio: null, fecha_fin: null });
                    }}
                  />
                  {errors.fecha_inicio && (
                    <small className="text-danger fw-bold" style={{ fontSize: "11px" }}>{errors.fecha_inicio}</small>
                  )}
                </div>

                {/* Fecha fin */}
                <div className="col-md-6 col-12">
                  <label className="form-label fw-bold small text-dark">
                    Fecha Fin {formData.actual ? <span className="fw-normal text-muted">(deshabilitado)</span> : "*"}
                  </label>
                  <input
                    type="date"
                    className={`form-control ${errors.fecha_fin ? "is-invalid" : ""}`}
                    disabled={formData.actual}
                    value={formData.fecha_fin}
                    onChange={(e) => {
                      setFormData({ ...formData, fecha_fin: e.target.value });
                      setErrors({ ...errors, fecha_fin: null });
                    }}
                  />
                  {errors.fecha_fin && (
                    <small className="text-danger fw-bold" style={{ fontSize: "11px" }}>{errors.fecha_fin}</small>
                  )}
                </div>

                {/* Checkbox actual */}
                <div className="col-12">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={formData.actual}
                      id="checkAct"
                      onChange={(e) => {
                        setFormData({ ...formData, actual: e.target.checked, fecha_fin: "" });
                        setErrors({ ...errors, fecha_fin: null });
                      }}
                    />
                    <label className="form-check-label small fw-bold text-muted" htmlFor="checkAct">
                      Actualmente trabajo/estudio aquí
                    </label>
                  </div>
                </div>

              </div>
            </div>

            {/* FOOTER */}
            <div className="ef-footer">
              <button
                type="button"
                className="btn fw-bold px-4"
                onClick={onCancel}
                style={{
                  color: "var(--gris-oscuro)",
                  backgroundColor: "var(--blanco)",
                  border: "1px solid var(--gris-borde)",
                  transition: "all 0.2s ease",
                  fontFamily: "var(--font)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--rojo-soft)";
                  e.currentTarget.style.color           = "var(--blanco)";
                  e.currentTarget.style.borderColor     = "var(--rojo-soft)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--blanco)";
                  e.currentTarget.style.color           = "var(--gris-oscuro)";
                  e.currentTarget.style.borderColor     = "var(--gris-borde)";
                }}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="btn fw-bold px-4 shadow-sm"
                disabled={isSubmitting}
                style={{
                  backgroundColor: isSubmitting ? "var(--gris-borde)" : "var(--azul)",
                  color: "var(--blanco)",
                  border: "none",
                  borderRadius: "4px",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  fontFamily: "var(--font)",
                  transition: "background-color 0.2s",
                }}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                    Procesando...
                  </>
                ) : editData ? "Actualizar Registro" : "Guardar Experiencia"}
              </button>
            </div>
          </form>

        </div>
      </div>
    </>
  );
}