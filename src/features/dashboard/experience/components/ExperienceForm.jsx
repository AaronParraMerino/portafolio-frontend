import React, { useEffect, useState } from "react";

export default function ExperienceForm({ onSave, onCancel, editData }) {
  const MAX_EMPRESA = 30;
  const MAX_PUESTO = 50;
  const MAX_DESCRIPCION = 200;

  const toBoolean = (value) =>
    value === true || value === 1 || value === "1" || String(value).toLowerCase() === "true";

  const [formData, setFormData] = useState({
    tipo_experiencia: "Laboral",
    empresa: "",
    puesto: "",
    fecha_inicio: "",
    fecha_fin: "",
    actual: false,
    descripcion: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editData) {
      const isActual = toBoolean(editData.actual);
      setFormData({
        tipo_experiencia: editData.tipo_experiencia || "Laboral",
        empresa: editData.empresa || "",
        puesto: editData.puesto || "",
        fecha_inicio: editData.fecha_inicio || "",
        fecha_fin: isActual ? "" : editData.fecha_fin || "",
        actual: isActual,
        descripcion: editData.descripcion || "",
      });
    }
  }, [editData]);

  const clearError = (field) => {
    if (!errors[field]) return;
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.empresa.trim()) newErrors.empresa = "Este campo es obligatorio";
    if (!formData.puesto.trim()) newErrors.puesto = "Este campo es obligatorio";
    if (!formData.fecha_inicio) newErrors.fecha_inicio = "La fecha de inicio es obligatoria";

    if (!formData.actual) {
      if (!formData.fecha_fin) {
        newErrors.fecha_fin = "La fecha de fin es obligatoria";
      } else if (formData.fecha_inicio) {
        if (formData.fecha_inicio > formData.fecha_fin) {
          newErrors.fecha_fin = "La fecha de inicio no puede ser mayor a la fecha fin";
        } else if (formData.fecha_inicio === formData.fecha_fin) {
          newErrors.fecha_fin = "Las fechas no pueden ser iguales";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        ...formData,
        actual: Boolean(formData.actual),
        empresa: formData.empresa.trim(),
        puesto: formData.puesto.trim(),
        descripcion: formData.descripcion.trim(),
        fecha_fin: formData.actual ? "" : formData.fecha_fin,
      });
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActualChange = (e) => {
    const checked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      actual: checked,
      // Solo limpiamos fecha fin cuando marca "actual".
      // Si lo desmarca, dejamos el campo libre para colocar la fecha real de finalización.
      fecha_fin: checked ? "" : prev.fecha_fin,
    }));

    if (checked) {
      setErrors((prev) => ({ ...prev, fecha_fin: null }));
    }
  };

  return (
    <>
      <style>{`
        .ef-overlay {
          position: fixed;
          inset: 0;
          z-index: 1050;
          background: rgba(17, 24, 39, 0.72);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          overflow-y: auto;
        }

        .ef-modal {
          width: 100%;
          max-width: 600px;
          border: 1.5px solid var(--gris-borde);
          border-radius: 14px;
          overflow: hidden;
          background: var(--blanco);
          max-height: calc(100dvh - 24px);
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0,0,0,.22);
          font-family: var(--font);
        }

        .ef-header {
          flex-shrink: 0;
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--negro-texto);
          border-bottom: 4px solid var(--azul);
        }
        .ef-header-title {
          color: var(--blanco);
          font-weight: 800;
          letter-spacing: -.01em;
        }
        .ef-close-btn {
          transition: filter .15s ease, opacity .15s ease, transform .15s ease;
        }
        .ef-close-btn:hover {
          filter: invert(42%) sepia(76%) saturate(948%) hue-rotate(319deg) brightness(96%) contrast(91%);
          opacity: 1;
          transform: scale(1.05);
        }

        .ef-body {
          flex: 1;
          overflow-y: auto;
          padding: 22px 24px;
          background: var(--blanco);
        }

        .tipo-selector {
          cursor: pointer;
          flex: 1;
          padding: 11px 12px;
          border-radius: 10px;
          border: 1.5px solid var(--gris-borde);
          background: var(--blanco);
          color: var(--gris-oscuro);
          transition: all .15s ease;
          text-align: center;
          user-select: none;
        }
        .tipo-selector:hover {
          border-color: var(--azul-mid);
          background: var(--azul-light);
        }
        .tipo-selector.active-lab {
          background: var(--azul-light);
          border-color: var(--azul);
          color: var(--azul);
          box-shadow: 0 0 0 3px var(--azul-glow);
        }
        .tipo-selector.active-acad {
          background: var(--violeta-chip);
          border-color: var(--violeta);
          color: var(--violeta-hover);
          box-shadow: 0 0 0 3px var(--violeta-bg);
        }

        .ef-label {
          color: var(--gris-oscuro);
          font-size: .78rem;
          font-weight: 700;
          margin-bottom: 5px;
        }
        .ef-input,
        .ef-textarea,
        .ef-date-input {
          font-family: var(--font) !important;
          font-size: 13.5px !important;
          border: 1.5px solid var(--gris-borde) !important;
          border-radius: 8px !important;
          color: var(--negro-texto) !important;
          background: var(--blanco) !important;
          transition: border-color .15s, box-shadow .15s, background .15s !important;
        }
        .ef-input:focus,
        .ef-textarea:focus,
        .ef-date-input:focus {
          outline: none !important;
          border-color: var(--azul) !important;
          box-shadow: 0 0 0 3px var(--azul-glow) !important;
        }
        .ef-input::placeholder,
        .ef-textarea::placeholder {
          color: #9ca3af;
        }
        .ef-input.is-invalid,
        .ef-textarea.is-invalid,
        .ef-date-input.is-invalid {
          border-color: var(--rojo-soft) !important;
          background: var(--rojo-bg) !important;
          box-shadow: 0 0 0 3px rgba(232,85,85,.08) !important;
        }

        .ef-date-input {
          min-height: 38px;
          color-scheme: light;
          accent-color: var(--azul);
          cursor: pointer;
        }
        .ef-date-input:hover {
          border-color: var(--azul-mid) !important;
          background: var(--azul-light) !important;
        }
        .ef-date-input:disabled {
          cursor: not-allowed;
          background: var(--fondo) !important;
          color: var(--gris-texto) !important;
          opacity: .75;
        }
        .ef-date-input::-webkit-calendar-picker-indicator {
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          background-color: var(--azul-light);
          border: 1px solid var(--azul-mid);
          transition: background .15s, border-color .15s, transform .15s;
        }
        .ef-date-input::-webkit-calendar-picker-indicator:hover {
          background-color: var(--azul-mid);
          border-color: var(--azul);
          transform: scale(1.04);
        }

        .ef-field-count {
          color: var(--gris-texto);
          font-family: var(--mono);
          font-size: 10px;
        }
        .ef-error-text {
          color: var(--rojo-soft);
          font-size: 11px;
          font-weight: 600;
          margin-top: 4px;
        }

        .ef-switch .form-check-input {
          cursor: pointer;
          accent-color: var(--azul);
        }
        .ef-switch .form-check-input:checked {
          background-color: var(--azul);
          border-color: var(--azul);
        }
        .ef-switch .form-check-input:focus {
          border-color: var(--azul);
          box-shadow: 0 0 0 3px var(--azul-glow);
        }

        .ef-footer {
          flex-shrink: 0;
          padding: 14px 22px;
          background: var(--fondo);
          border-top: 1.5px solid var(--gris-borde);
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }
        .ef-btn-cancel {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 18px;
          border-radius: 7px;
          border: 1.5px solid var(--gris-borde);
          background: var(--blanco);
          color: var(--gris-oscuro);
          font-family: var(--font);
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all .15s ease;
        }
        .ef-btn-cancel:hover {
          border-color: var(--rojo-soft);
          color: var(--rojo-soft);
          background: var(--rojo-bg);
        }
        .ef-btn-save {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 20px;
          border-radius: 7px;
          border: none;
          background: var(--azul);
          color: var(--blanco);
          font-family: var(--font);
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all .15s ease;
        }
        .ef-btn-save:hover {
          background: var(--azul-hover);
          box-shadow: 0 4px 12px rgba(0,119,183,.3);
          transform: translateY(-1px);
        }
        .ef-btn-save:disabled,
        .ef-btn-cancel:disabled {
          opacity: .6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        @media (max-width: 480px) {
          .ef-overlay { align-items: flex-end; padding: 0; }
          .ef-modal { border-radius: 16px 16px 0 0; max-height: calc(100dvh - 8px); }
          .ef-body { padding: 18px 16px; }
          .ef-footer { padding: 12px 16px; flex-direction: column-reverse; }
          .ef-btn-save,
          .ef-btn-cancel { width: 100%; }
        }
      `}</style>

      <div className="ef-overlay">
        <div className="ef-modal">
          <div className="ef-header">
            <span className="ef-header-title">
              {editData ? "Editar Experiencia" : "Nueva Experiencia"}
            </span>
            <button
              type="button"
              className="btn-close btn-close-white ef-close-btn"
              onClick={onCancel}
              disabled={isSubmitting}
              aria-label="Cerrar"
            />
          </div>

          <form onSubmit={handleSubmit} style={{ display: "contents" }}>
            <div className="ef-body">
              <div className="row g-3">
                <div className="col-12 mb-2">
                  <label className="ef-label d-block text-uppercase mb-3">
                    Tipo de Experiencia
                  </label>
                  <div className="d-flex gap-3">
                    <div
                      className={`tipo-selector ${formData.tipo_experiencia === "Laboral" ? "active-lab" : ""}`}
                      onClick={() => setFormData((prev) => ({ ...prev, tipo_experiencia: "Laboral" }))}
                    >
                      <span className="fw-bold small">Laboral</span>
                    </div>
                    <div
                      className={`tipo-selector ${formData.tipo_experiencia === "Académica" ? "active-acad" : ""}`}
                      onClick={() => setFormData((prev) => ({ ...prev, tipo_experiencia: "Académica" }))}
                    >
                      <span className="fw-bold small">Académica</span>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-12">
                  <label className="ef-label">Empresa / Institución *</label>
                  <input
                    type="text"
                    className={`form-control ef-input ${errors.empresa ? "is-invalid" : ""}`}
                    maxLength={MAX_EMPRESA}
                    placeholder="Ej: Google, UMSS, Facebook..."
                    value={formData.empresa}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, empresa: e.target.value }));
                      clearError("empresa");
                    }}
                  />
                  <div className="text-end mt-1">
                    <small className="ef-field-count">{formData.empresa.length}/{MAX_EMPRESA}</small>
                  </div>
                  {errors.empresa && <div className="ef-error-text">{errors.empresa}</div>}
                </div>

                <div className="col-md-6 col-12">
                  <label className="ef-label">Puesto / Cargo *</label>
                  <input
                    type="text"
                    className={`form-control ef-input ${errors.puesto ? "is-invalid" : ""}`}
                    maxLength={MAX_PUESTO}
                    placeholder="Ej: Desarrollador, QA, Docente..."
                    value={formData.puesto}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, puesto: e.target.value }));
                      clearError("puesto");
                    }}
                  />
                  <div className="text-end mt-1">
                    <small className="ef-field-count">{formData.puesto.length}/{MAX_PUESTO}</small>
                  </div>
                  {errors.puesto && <div className="ef-error-text">{errors.puesto}</div>}
                </div>

                <div className="col-12">
                  <label className="ef-label">Logros y Responsabilidades</label>
                  <textarea
                    className="form-control ef-textarea"
                    rows="3"
                    maxLength={MAX_DESCRIPCION}
                    placeholder="Describe tus logros y responsabilidades..."
                    style={{ resize: "none" }}
                    value={formData.descripcion}
                    onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
                  />
                  <div className="text-end mt-1">
                    <small className="ef-field-count">{formData.descripcion.length}/{MAX_DESCRIPCION}</small>
                  </div>
                </div>

                <div className="col-md-6 col-12">
                  <label className="ef-label">Fecha Inicio *</label>
                  <input
                    type="date"
                    className={`form-control ef-date-input ${errors.fecha_inicio ? "is-invalid" : ""}`}
                    value={formData.fecha_inicio}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, fecha_inicio: e.target.value }));
                      clearError("fecha_inicio");
                    }}
                  />
                  {errors.fecha_inicio && <div className="ef-error-text">{errors.fecha_inicio}</div>}
                </div>

                <div className="col-md-6 col-12">
                  <label className="ef-label">Fecha Fin</label>
                  <input
                    type="date"
                    className={`form-control ef-date-input ${errors.fecha_fin ? "is-invalid" : ""}`}
                    disabled={formData.actual}
                    value={formData.fecha_fin}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, fecha_fin: e.target.value }));
                      clearError("fecha_fin");
                    }}
                  />
                  {errors.fecha_fin && <div className="ef-error-text">{errors.fecha_fin}</div>}
                </div>

                <div className="col-12 mb-1">
                  <div className="form-check form-switch ef-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="checkAct"
                      checked={formData.actual}
                      onChange={handleActualChange}
                    />
                    <label className="form-check-label small fw-bold text-muted" htmlFor="checkAct">
                      Actualmente trabajo/estudio aquí
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="ef-footer">
              <button type="button" className="ef-btn-cancel" onClick={onCancel} disabled={isSubmitting}>
                Cancelar
              </button>
              <button type="submit" className="ef-btn-save" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : editData ? "Actualizar Registro" : "Guardar Experiencia"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

