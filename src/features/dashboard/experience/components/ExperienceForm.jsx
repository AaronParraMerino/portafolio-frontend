import { useState, useEffect } from "react";
import DashboardEdit, {
  DashboardEditBody,
  DashboardEditFieldError,
  DashboardEditFooter,
  DashboardEditSection,
  DashboardEditSpinner,
} from "../../layout/DashboardEdit";

const ACADEMIC_TYPE = "Acad\u00e9mica";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editData) setFormData(editData);
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
        if (inicio > fin) {
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
      await onSave(formData);
    } catch (error) {
      console.error("Error al guardar:", error);
      setIsSubmitting(false);
    }
  };

  const patchForm = (patch) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  };

  return (
    <DashboardEdit
      title={editData ? "Editar experiencia" : "Agregar experiencia"}
      subtitle="Completa los datos para mantener tu portafolio actualizado."
      onClose={onCancel}
      closeDisabled={isSubmitting}
      ariaLabel={editData ? "Editar experiencia" : "Agregar experiencia"}
    >
      <form onSubmit={handleSubmit} style={{ display: "contents" }}>
        <DashboardEditBody>
          <DashboardEditSection label="Datos de experiencia">
            <div className="row g-3">
              <div className="col-12 dash-edit-field">
                <label className="dash-edit-label">Tipo de experiencia</label>
                <div className="dash-edit-segmented">
                  <button
                    type="button"
                    className={`dash-edit-segmented-btn${formData.tipo_experiencia === "Laboral" ? " active" : ""}`}
                    onClick={() => patchForm({ tipo_experiencia: "Laboral" })}
                    aria-pressed={formData.tipo_experiencia === "Laboral"}
                  >
                    Laboral
                  </button>
                  <button
                    type="button"
                    className={`dash-edit-segmented-btn${formData.tipo_experiencia === ACADEMIC_TYPE ? " active" : ""}`}
                    onClick={() => patchForm({ tipo_experiencia: ACADEMIC_TYPE })}
                    aria-pressed={formData.tipo_experiencia === ACADEMIC_TYPE}
                  >
                    Academica
                  </button>
                </div>
              </div>

              <div className="col-md-6 col-12 dash-edit-field">
                <label className="dash-edit-label">Empresa / Institucion <span className="dash-edit-required">*</span></label>
                <input
                  type="text"
                  className={`form-control dash-edit-input${errors.empresa ? " dash-edit-input-error" : ""}`}
                  maxLength={30}
                  placeholder="Ej: Google, UMSS, Facebook..."
                  value={formData.empresa}
                  onChange={(e) => {
                    patchForm({ empresa: e.target.value });
                    if (errors.empresa) setErrors({ ...errors, empresa: null });
                  }}
                />
                <div className="d-flex justify-content-between">
                  <DashboardEditFieldError msg={errors.empresa} />
                  <small className="dash-edit-char-count" style={{ color: "var(--gris-texto)" }}>
                    {formData.empresa.length}/30
                  </small>
                </div>
              </div>

              <div className="col-md-6 col-12 dash-edit-field">
                <label className="dash-edit-label">Puesto / Cargo <span className="dash-edit-required">*</span></label>
                <input
                  type="text"
                  className={`form-control dash-edit-input${errors.puesto ? " dash-edit-input-error" : ""}`}
                  placeholder="Ej: Desarrollador, QA, Docente..."
                  value={formData.puesto}
                  onChange={(e) => {
                    patchForm({ puesto: e.target.value });
                    if (errors.puesto) setErrors({ ...errors, puesto: null });
                  }}
                />
                <DashboardEditFieldError msg={errors.puesto} />
              </div>

              <div className="col-12 dash-edit-field">
                <label className="dash-edit-label">
                  Descripcion de tareas
                  <span className="dash-edit-char-count" style={{ color: "var(--gris-texto)" }}>
                    {formData.descripcion.length}/200
                  </span>
                </label>
                <textarea
                  className="form-control dash-edit-textarea"
                  rows="3"
                  maxLength={200}
                  placeholder="Describe tus logros y responsabilidades..."
                  value={formData.descripcion}
                  onChange={(e) => patchForm({ descripcion: e.target.value })}
                />
              </div>

              <div className="col-md-6 col-12 dash-edit-field">
                <label className="dash-edit-label">Fecha Inicio <span className="dash-edit-required">*</span></label>
                <input
                  type="date"
                  className={`form-control dash-edit-input${errors.fecha_inicio ? " dash-edit-input-error" : ""}`}
                  value={formData.fecha_inicio}
                  onChange={(e) => {
                    patchForm({ fecha_inicio: e.target.value });
                    setErrors({ ...errors, fecha_inicio: null, fecha_fin: null });
                  }}
                />
                <DashboardEditFieldError msg={errors.fecha_inicio} />
              </div>

              <div className="col-md-6 col-12 dash-edit-field">
                <label className="dash-edit-label">
                  Fecha Fin {formData.actual ? <span className="text-muted">(deshabilitado)</span> : <span className="dash-edit-required">*</span>}
                </label>
                <input
                  type="date"
                  className={`form-control dash-edit-input${errors.fecha_fin ? " dash-edit-input-error" : ""}`}
                  disabled={formData.actual}
                  value={formData.fecha_fin}
                  onChange={(e) => {
                    patchForm({ fecha_fin: e.target.value });
                    setErrors({ ...errors, fecha_fin: null });
                  }}
                />
                <DashboardEditFieldError msg={errors.fecha_fin} />
              </div>

              <div className="col-12">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={formData.actual}
                    id="checkAct"
                    onChange={(e) => {
                      patchForm({ actual: e.target.checked, fecha_fin: "" });
                      setErrors({ ...errors, fecha_fin: null });
                    }}
                  />
                  <label className="form-check-label small fw-bold text-muted" htmlFor="checkAct">
                    Actualmente trabajo/estudio aqui
                  </label>
                </div>
              </div>
            </div>
          </DashboardEditSection>
        </DashboardEditBody>

        <DashboardEditFooter>
          <button
            type="button"
            className="dash-edit-btn dash-edit-btn--secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="dash-edit-btn dash-edit-btn--primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <DashboardEditSpinner />
                Procesando...
              </>
            ) : editData ? "Actualizar registro" : "Guardar experiencia"}
          </button>
        </DashboardEditFooter>
      </form>
    </DashboardEdit>
  );
}
