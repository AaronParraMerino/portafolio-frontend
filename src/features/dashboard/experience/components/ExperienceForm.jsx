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

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) setFormData(editData);
  }, [editData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.empresa.trim())
      newErrors.empresa = "Este campo es obligatorio";
    if (!formData.puesto.trim()) newErrors.puesto = "Este campo es obligatorio";
    if (!formData.fecha_inicio)
      newErrors.fecha_inicio = "La fecha de inicio es obligatoria";

    if (!formData.actual) {
      if (!formData.fecha_fin) {
        newErrors.fecha_fin = "La fecha de fin es obligatoria";
      } else {
        const inicio = new Date(formData.fecha_inicio);
        const fin = new Date(formData.fecha_fin);
        if (inicio > fin)
          newErrors.fecha_fin =
            "La fecha de inicio no puede ser mayor a la fecha fin";
        else if (formData.fecha_inicio === formData.fecha_fin)
          newErrors.fecha_fin = "Las fechas no pueden ser iguales";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    // Agregamos async
    e.preventDefault();

    if (validate()) {
      setIsSubmitting(true); // Bloqueamos antes de enviar
      try {
        await onSave(formData); // Esperamos a que termine la petición
      } catch (error) {
        console.error("Error al guardar:", error);
        setIsSubmitting(false); // Si hay error, liberamos el botón para reintentar
      }
      // No ponemos false aquí si el modal se va a cerrar solo,
      // pero es buena práctica por si algo falla.
    }
  };
  // ... otros estados
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div
      className="prf-modal-overlay"
      style={{
        zIndex: 1050,
        backgroundColor: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        className="prf-modal-content p-0 shadow-lg"
        style={{
          maxWidth: "600px",
          border: "none",
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "white",
        }}
      >
        {/* CABECERA OSCURA (#111827) */}
        <div
          className="p-3 d-flex justify-content-between align-items-center"
          style={{
            backgroundColor: "#111827",
            borderBottom: "3px solid var(--azul)",
          }}
        >
          <span
            className="fw-bold"
            style={{ color: "white", fontSize: "1.1rem" }}
          >
            {editData
              ? "✏️ Editar Experiencia"
              : "➕ Agregar Nueva Experiencia"}
          </span>
          <button
            className="btn-close btn-close-white"
            onClick={onCancel}
            style={{ fontSize: "0.8rem", opacity: 0.8 }}
          ></button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* CUERPO BLANCO LIMPIO */}
          <div className="p-4">
            <div className="row g-3">
              <div className="col-12 mb-2">
                <label
                  className="form-label d-block fw-bold small text-muted text-uppercase"
                  style={{ letterSpacing: "1px" }}
                >
                  Tipo de Experiencia:
                </label>
                <div className="d-flex gap-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="tipo_exp"
                      id="lab"
                      checked={formData.tipo_experiencia === "Laboral"}
                      onChange={() =>
                        setFormData({
                          ...formData,
                          tipo_experiencia: "Laboral",
                        })
                      }
                    />
                    <label
                      className="form-check-label fw-semibold"
                      htmlFor="lab"
                    >
                      💼 Laboral
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="tipo_exp"
                      id="acad"
                      checked={formData.tipo_experiencia === "Académica"}
                      onChange={() =>
                        setFormData({
                          ...formData,
                          tipo_experiencia: "Académica",
                        })
                      }
                    />
                    <label
                      className="form-check-label fw-semibold"
                      htmlFor="acad"
                    >
                      🎓 Académica
                    </label>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold small text-dark">
                  Empresa / Institución *
                </label>
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
                    <small
                      className="text-danger fw-bold"
                      style={{ fontSize: "11px" }}
                    >
                      {errors.empresa}
                    </small>
                  )}
                  <small
                    className="text-muted ms-auto"
                    style={{ fontSize: "10px" }}
                  >
                    {formData.empresa.length}/30
                  </small>
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold small text-dark">
                  Puesto / Cargo *
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.puesto ? "is-invalid" : ""}`}
                  placeholder="Ej: Desarrollador, QA, Docente...."
                  value={formData.puesto}
                  onChange={(e) => {
                    setFormData({ ...formData, puesto: e.target.value });
                    if (errors.puesto) setErrors({ ...errors, puesto: null });
                  }}
                />
                {errors.puesto && (
                  <small
                    className="text-danger fw-bold"
                    style={{ fontSize: "11px" }}
                  >
                    {errors.puesto}
                  </small>
                )}
              </div>

              <div className="col-12">
                <label className="form-label fw-bold small text-dark">
                  Descripción de tareas
                </label>
                <textarea
                  className="form-control"
                  rows="3"
                  maxLength={200}
                  placeholder="Describe tus logros y responsabilidades..."
                  style={{ resize: "none" }}
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                />
                <div className="text-end">
                  <small className="text-muted" style={{ fontSize: "10px" }}>
                    {formData.descripcion.length}/200
                  </small>
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold small text-dark">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  className={`form-control ${errors.fecha_inicio ? "is-invalid" : ""}`}
                  value={formData.fecha_inicio}
                  onChange={(e) => {
                    setFormData({ ...formData, fecha_inicio: e.target.value });
                    setErrors({
                      ...errors,
                      fecha_inicio: null,
                      fecha_fin: null,
                    });
                  }}
                />
                {errors.fecha_inicio && (
                  <small
                    className="text-danger fw-bold"
                    style={{ fontSize: "11px" }}
                  >
                    {errors.fecha_inicio}
                  </small>
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold small text-dark">
                  Fecha Fin
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
                  <small
                    className="text-danger fw-bold"
                    style={{ fontSize: "11px" }}
                  >
                    {errors.fecha_fin}
                  </small>
                )}
              </div>

              <div className="col-12">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={formData.actual}
                    id="checkAct"
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        actual: e.target.checked,
                        fecha_fin: "",
                      });
                      setErrors({ ...errors, fecha_fin: null });
                    }}
                  />
                  <label
                    className="form-check-label small fw-bold text-muted"
                    htmlFor="checkAct"
                  >
                    Actualmente trabajo/estudio aquí
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER GRIS CLARO (#F8FAFC) */}
          <div
            className="d-flex gap-2 justify-content-end p-3"
            style={{
              backgroundColor: "#f8fafc",
              borderTop: "1px solid #e2e8f0",
            }}
          >
            <button
              type="button"
              className="btn fw-bold px-4"
              onClick={onCancel}
              style={{
                color: "#64748b",
                backgroundColor: "white",
                border: "1px solid #cbd5e1",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#ef4444";
                e.target.style.color = "white";
                e.target.style.borderColor = "#ef4444";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "white";
                e.target.style.color = "#64748b";
                e.target.style.borderColor = "#cbd5e1";
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary fw-bold px-4 shadow-sm"
              disabled={isSubmitting} // <-- ESTO deshabilita el clic si está cargando
              style={{
                backgroundColor: isSubmitting ? "#94a3b8" : "var(--azul)", // Cambia a gris si está bloqueado
                border: "none",
                borderRadius: "4px",
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Procesando...
                </>
              ) : editData ? (
                "Actualizar Registro"
              ) : (
                "Guardar Experiencia"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
