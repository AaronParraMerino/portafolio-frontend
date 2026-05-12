import { useState, useEffect } from "react";
import DashboardEdit, {
  DashboardEditBody,
  DashboardEditFieldError,
  DashboardEditFooter,
  DashboardEditSection,
  DashboardEditSpinner,
} from "../../layout/DashboardEdit";
import { getCatalogSkills } from "../services/skillService";
import SkillCatalogModal from "./SkillCatalogModal";

const LEVELS = ["basico", "intermedio", "avanzado", "experto"];

export default function SkillForm({ onSave, onCancel, editData }) {
  const [formData, setFormData] = useState({
    tipo: "tecnica",
    catalogo_habilidad_id: "",
    nombre_habilidad: "",
    nivel: "basico",
    es_publico: true,
  });

  const [catalog, setCatalog] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadCatalog = async () => {
      const data = await getCatalogSkills();
      setCatalog(data);
    };

    loadCatalog();

    if (editData) {
      setFormData({
        ...editData,
        nombre_habilidad: editData.nombre || editData.nombre_habilidad,
      });
    }
  }, [editData]);

  const patchForm = (patch) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    patchForm({ nombre_habilidad: value, catalogo_habilidad_id: "" });

    if (errors.habilidad) {
      setErrors({});
    }

    if (value.trim().length > 0) {
      const filtered = catalog.filter((skill) =>
        skill.tipo === formData.tipo &&
        skill.nombre.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const selectSkill = (skill) => {
    patchForm({
      catalogo_habilidad_id: skill.id,
      nombre_habilidad: skill.nombre,
    });
    setErrors({});
    setSuggestions([]);
  };

  const handleCreatedInCatalog = (newSkill) => {
    setCatalog([...catalog, newSkill]);
    selectSkill(newSkill);
    setShowCatalogModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.catalogo_habilidad_id && !editData) {
      setErrors({ habilidad: "Debes seleccionar una habilidad del catalogo o crear una nueva." });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DashboardEdit
        title={editData ? "Editar habilidad" : "Registrar habilidad"}
        subtitle="Usa el catalogo para mantener las habilidades consistentes."
        onClose={onCancel}
        closeDisabled={isSubmitting}
        size="sm"
        ariaLabel={editData ? "Editar habilidad" : "Registrar habilidad"}
      >
        <form onSubmit={handleSubmit} style={{ display: "contents" }}>
          <DashboardEditBody>
            {!editData && (
              <DashboardEditSection label="Tipo de habilidad">
                <div className="dash-edit-segmented">
                  <button
                    type="button"
                    className={`dash-edit-segmented-btn${formData.tipo === "tecnica" ? " active" : ""}`}
                    onClick={() => patchForm({ tipo: "tecnica", catalogo_habilidad_id: "", nombre_habilidad: "" })}
                  >
                    Tecnica
                  </button>
                  <button
                    type="button"
                    className={`dash-edit-segmented-btn${formData.tipo === "blanda" ? " active" : ""}`}
                    onClick={() => patchForm({ tipo: "blanda", catalogo_habilidad_id: "", nombre_habilidad: "" })}
                  >
                    Blanda
                  </button>
                </div>
              </DashboardEditSection>
            )}

            <DashboardEditSection label="Datos de habilidad">
              <div className="dash-edit-field position-relative mb-3">
                <label className="dash-edit-label">Nombre de habilidad <span className="dash-edit-required">*</span></label>
                <div className="input-group">
                  <input
                    type="text"
                    className={`form-control dash-edit-input${errors.habilidad ? " dash-edit-input-error" : ""}`}
                    placeholder="Buscar..."
                    value={formData.nombre_habilidad}
                    onChange={handleSearch}
                    disabled={!!editData}
                  />
                  {!editData && (
                    <button
                      type="button"
                      className="dash-edit-btn dash-edit-btn--secondary dash-edit-btn-compact"
                      onClick={() => setShowCatalogModal(true)}
                    >
                      Nueva
                    </button>
                  )}
                </div>
                <DashboardEditFieldError msg={errors.habilidad} />

                {suggestions.length > 0 && (
                  <ul className="dash-edit-suggestions">
                    {suggestions.map((skill) => (
                      <li key={skill.id}>
                        <button type="button" onClick={() => selectSkill(skill)}>
                          {skill.nombre}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="dash-edit-field mb-3">
                <label className="dash-edit-label">Nivel de dominio</label>
                <div className="dash-edit-level-grid">
                  {LEVELS.map((level) => (
                    <button
                      type="button"
                      key={level}
                      className={`dash-edit-level-option dash-edit-level-option--${level}${formData.nivel === level ? " active" : ""}`}
                      onClick={() => patchForm({ nivel: level })}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-check form-switch mb-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="v-switch"
                  checked={formData.es_publico}
                  onChange={(e) => patchForm({ es_publico: e.target.checked })}
                />
                <label className="form-check-label fw-bold text-muted small" htmlFor="v-switch">
                  Mostrar en perfil publico
                </label>
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
                  Guardando...
                </>
              ) : "Guardar habilidad"}
            </button>
          </DashboardEditFooter>
        </form>
      </DashboardEdit>

      {showCatalogModal && (
        <SkillCatalogModal
          tipo={formData.tipo}
          onSave={handleCreatedInCatalog}
          onCancel={() => setShowCatalogModal(false)}
        />
      )}
    </>
  );
}
