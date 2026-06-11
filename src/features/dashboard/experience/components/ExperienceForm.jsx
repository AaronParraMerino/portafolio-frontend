import { useState, useEffect } from "react";
import { useLanguage } from "../../../../core/i18n";
import { formatExperienceText, getExperienceCatalog } from "../services/experienceService";
import DashboardEdit, {
  DashboardEditBody,
  DashboardEditFieldError,
  DashboardEditFooter,
  DashboardEditSection,
  DashboardEditSpinner,
} from "../../layout/DashboardEdit";

const WORK_TYPE = "Laboral";
const ACADEMIC_TYPE = "Acad\u00e9mica";
const COMPANY_MAX_LENGTH = 60;
const POSITION_MAX_LENGTH = 80;
const TEXT_PATTERN = /^[\p{L}0-9][\p{L}0-9\s.,&/#+()-]*$/u;

const cleanText = (value = "") => String(value).trim().replace(/\s+/g, " ");

const normalizeText = (value = "") =>
  cleanText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const normalizeType = (value = "") => normalizeText(value);

const sameExperienceKey = (a, b) =>
  normalizeType(a?.tipo_experiencia) === normalizeType(b?.tipo_experiencia) &&
  normalizeText(a?.empresa) === normalizeText(b?.empresa) &&
  normalizeText(a?.puesto) === normalizeText(b?.puesto);

const uniqueByNormalized = (items = []) => {
  const seen = new Set();
  return items.reduce((acc, value) => {
    const formatted = formatExperienceText(value);
    const key = normalizeText(formatted);

    if (!key || seen.has(key)) return acc;
    seen.add(key);
    acc.push(formatted);
    return acc;
  }, []);
};

const getFilteredSuggestions = (options, value) => {
  const query = normalizeText(value);
  if (!query) return [];

  return options
    .filter((option) => normalizeText(option).includes(query))
    .slice(0, 8);
};

const findExactOption = (options, value) => {
  const key = normalizeText(value);
  if (!key) return "";
  return options.find((option) => normalizeText(option) === key) || "";
};

export default function ExperienceForm({
  onSave,
  onCancel,
  editData,
  existingExperiences = [],
}) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    tipo_experiencia: "",
    empresa: "",
    puesto: "",
    fecha_inicio: "",
    fecha_fin: "",
    actual: false,
    descripcion: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSuggest, setActiveSuggest] = useState(null);
  const [catalog, setCatalog] = useState({
    empresas: { laboral: [], academica: [] },
    puestos: { laboral: [], academica: [] },
  });

  useEffect(() => {
    if (editData) setFormData(editData);
  }, [editData]);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const data = await getExperienceCatalog({ force: true });
        setCatalog(data);
      } catch (error) {
        console.error("Error cargando catálogo de experiencias", error);
      }
    };

    loadCatalog();
  }, []);

  const hasSelectedType = !!formData.tipo_experiencia;
  const selectedTypeKey = normalizeType(formData.tipo_experiencia) === "academica" ? "academica" : "laboral";
  const experiencesByType = hasSelectedType ? existingExperiences.filter(
    (experience) => normalizeType(experience?.tipo_experiencia) === normalizeType(formData.tipo_experiencia)
  ) : [];

  const companyOptions = uniqueByNormalized([
    ...(hasSelectedType ? (catalog.empresas?.[selectedTypeKey] || []) : []),
    ...experiencesByType.map((experience) => experience?.empresa),
  ]);
  const positionOptions = uniqueByNormalized([
    ...(catalog.puestos?.[selectedTypeKey] || []),
    ...experiencesByType.map((experience) => experience?.puesto),
  ]);
  const companySuggestions = getFilteredSuggestions(companyOptions, formData.empresa);
  const positionSuggestions = getFilteredSuggestions(positionOptions, formData.puesto);
  const companyExists = !!findExactOption(companyOptions, formData.empresa);
  const positionExists = !!findExactOption(positionOptions, formData.puesto);

  const validateTextField = (field, maxLength) => {
    const value = cleanText(formData[field]);

    if (!value) return t("experience.validation.required");
    if (value.length < 2) return t("experience.validation.minLength");
    if (value.length > maxLength) {
      return t("experience.validation.maxLength", { max: maxLength });
    }
    if (!TEXT_PATTERN.test(value)) return t("experience.validation.textPattern");

    return "";
  };

  const normalizeFieldValue = (field) => {
    const options = field === "empresa" ? companyOptions : positionOptions;
    const exactOption = findExactOption(options, formData[field]);
    const normalizedValue = exactOption || formatExperienceText(formData[field]);

    patchForm({ [field]: normalizedValue });
    setActiveSuggest(null);
  };

  const selectSuggestion = (field, value) => {
    patchForm({ [field]: value });
    setErrors((prev) => ({ ...prev, [field]: null }));
    setActiveSuggest(null);
  };

  const validate = () => {
    const newErrors = {};
    const cleanEmpresa = findExactOption(companyOptions, formData.empresa) || formatExperienceText(formData.empresa);
    const cleanPuesto = findExactOption(positionOptions, formData.puesto) || formatExperienceText(formData.puesto);

    if (!formData.tipo_experiencia) {
      newErrors.tipo_experiencia = t("experience.validation.selectType");
    }

    const companyError = validateTextField("empresa", COMPANY_MAX_LENGTH);
    const positionError = validateTextField("puesto", POSITION_MAX_LENGTH);

    if (companyError) newErrors.empresa = companyError;
    if (positionError) newErrors.puesto = positionError;

    if (!formData.fecha_inicio) newErrors.fecha_inicio = t("experience.validation.startRequired");

    if (!formData.actual) {
      if (!formData.fecha_fin) {
        newErrors.fecha_fin = t("experience.validation.endRequired");
      } else {
        const inicio = new Date(formData.fecha_inicio);
        const fin = new Date(formData.fecha_fin);
        if (inicio > fin) {
          newErrors.fecha_fin = t("experience.validation.startAfterEnd");
        } else if (formData.fecha_inicio === formData.fecha_fin) {
          newErrors.fecha_fin = t("experience.validation.sameDates");
        }
      }
    }

    if (!newErrors.empresa && !newErrors.puesto) {
      const duplicate = existingExperiences.some((experience) => {
        if (editData && Number(experience?.id) === Number(editData?.id)) return false;

        return sameExperienceKey(experience, {
          ...formData,
          empresa: cleanEmpresa,
          puesto: cleanPuesto,
        });
      });

      if (duplicate) {
        newErrors.puesto = t("experience.validation.duplicate", {
          company: cleanEmpresa,
          position: cleanPuesto,
        });
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
        empresa: findExactOption(companyOptions, formData.empresa) || formatExperienceText(formData.empresa),
        puesto: findExactOption(positionOptions, formData.puesto) || formatExperienceText(formData.puesto),
        descripcion: cleanText(formData.descripcion),
      });
    } catch (error) {
      console.error("Error al guardar:", error);
      setIsSubmitting(false);
    }
  };

  const patchForm = (patch) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  };

  const handleTypeChange = (tipo) => {
    patchForm({
      tipo_experiencia: tipo,
      empresa: "",
      puesto: "",
    });
    setActiveSuggest(null);
    setErrors((prev) => ({ ...prev, tipo_experiencia: null, empresa: null, puesto: null }));
  };

  return (
    <DashboardEdit
      title={editData ? t("experience.form.title.edit") : t("experience.form.title.add")}
      subtitle={t("experience.form.subtitle")}
      onClose={onCancel}
      closeDisabled={isSubmitting}
      ariaLabel={editData ? t("experience.form.title.edit") : t("experience.form.title.add")}
    >
      <form onSubmit={handleSubmit} style={{ display: "contents" }}>
        <DashboardEditBody>
          <DashboardEditSection label={t("experience.form.section.data")}>
            <div className="row g-3">
              <div className="col-12 dash-edit-field">
                <label className="dash-edit-label">{t("experience.field.type")}</label>
                <div className="dash-edit-segmented">
                  <button
                    type="button"
                    className={`dash-edit-segmented-btn${formData.tipo_experiencia === WORK_TYPE ? " active" : ""}`}
                    onClick={() => handleTypeChange(WORK_TYPE)}
                    aria-pressed={formData.tipo_experiencia === WORK_TYPE}
                  >
                    {t("experience.type.work")}
                  </button>
                  <button
                    type="button"
                    className={`dash-edit-segmented-btn${formData.tipo_experiencia === ACADEMIC_TYPE ? " active" : ""}`}
                    onClick={() => handleTypeChange(ACADEMIC_TYPE)}
                    aria-pressed={formData.tipo_experiencia === ACADEMIC_TYPE}
                  >
                    {t("experience.type.academic")}
                  </button>
                </div>
                <DashboardEditFieldError msg={errors.tipo_experiencia} />
              </div>

              <div className="col-md-6 col-12 dash-edit-field">
                <label className="dash-edit-label">{t("experience.field.companyInstitution")} <span className="dash-edit-required">*</span></label>
                <div className="position-relative">
                  <input
                    type="text"
                    className={`form-control dash-edit-input${errors.empresa ? " dash-edit-input-error" : ""}`}
                    maxLength={COMPANY_MAX_LENGTH}
                    placeholder={hasSelectedType ? t("experience.placeholder.company") : t("experience.validation.selectType")}
                    value={formData.empresa}
                    autoComplete="off"
                    disabled={!hasSelectedType}
                    onFocus={() => {
                      if (!hasSelectedType) {
                        setErrors((prev) => ({ ...prev, tipo_experiencia: t("experience.validation.selectType") }));
                        return;
                      }
                      setActiveSuggest("empresa");
                    }}
                    onBlur={() => normalizeFieldValue("empresa")}
                    onChange={(e) => {
                      if (!hasSelectedType) return;
                      patchForm({ empresa: e.target.value });
                      setActiveSuggest("empresa");
                      if (errors.empresa) setErrors({ ...errors, empresa: null });
                    }}
                  />
                  {hasSelectedType && activeSuggest === "empresa" && companySuggestions.length > 0 && (
                    <ul className="dash-edit-suggestions">
                      {companySuggestions.map((company) => (
                        <li key={company}>
                          <button
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => selectSuggestion("empresa", company)}
                          >
                            {company}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="d-flex justify-content-between">
                  <DashboardEditFieldError msg={errors.empresa} />
                  <small className="dash-edit-char-count" style={{ color: "var(--gris-texto)" }}>
                    {formData.empresa.length}/{COMPANY_MAX_LENGTH}
                  </small>
                </div>
                {hasSelectedType && !errors.empresa && cleanText(formData.empresa) && !companyExists && (
                  <small className="dash-edit-char-count" style={{ float: "none", color: "var(--gris-texto)" }}>
                    {t("experience.catalog.newCompany")}
                  </small>
                )}
              </div>

              <div className="col-md-6 col-12 dash-edit-field">
                <label className="dash-edit-label">{t("experience.field.position")} <span className="dash-edit-required">*</span></label>
                <div className="position-relative">
                  <input
                    type="text"
                    className={`form-control dash-edit-input${errors.puesto ? " dash-edit-input-error" : ""}`}
                    maxLength={POSITION_MAX_LENGTH}
                    placeholder={hasSelectedType ? t("experience.placeholder.position") : t("experience.validation.selectType")}
                    value={formData.puesto}
                    autoComplete="off"
                    disabled={!hasSelectedType}
                    onFocus={() => {
                      if (!hasSelectedType) {
                        setErrors((prev) => ({ ...prev, tipo_experiencia: t("experience.validation.selectType") }));
                        return;
                      }
                      setActiveSuggest("puesto");
                    }}
                    onBlur={() => normalizeFieldValue("puesto")}
                    onChange={(e) => {
                      if (!hasSelectedType) return;
                      patchForm({ puesto: e.target.value });
                      setActiveSuggest("puesto");
                      if (errors.puesto) setErrors({ ...errors, puesto: null });
                    }}
                  />
                  {hasSelectedType && activeSuggest === "puesto" && positionSuggestions.length > 0 && (
                    <ul className="dash-edit-suggestions">
                      {positionSuggestions.map((position) => (
                        <li key={position}>
                          <button
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => selectSuggestion("puesto", position)}
                          >
                            {position}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="d-flex justify-content-between">
                  <DashboardEditFieldError msg={errors.puesto} />
                  <small className="dash-edit-char-count" style={{ color: "var(--gris-texto)" }}>
                    {formData.puesto.length}/{POSITION_MAX_LENGTH}
                  </small>
                </div>
                {hasSelectedType && !errors.puesto && cleanText(formData.puesto) && !positionExists && (
                  <small className="dash-edit-char-count" style={{ float: "none", color: "var(--gris-texto)" }}>
                    {t("experience.catalog.newPosition")}
                  </small>
                )}
              </div>

              <div className="col-12 dash-edit-field">
                <label className="dash-edit-label">
                  {t("experience.field.taskDescription")}
                  <span className="dash-edit-char-count" style={{ color: "var(--gris-texto)" }}>
                    {formData.descripcion.length}/200
                  </span>
                </label>
                <textarea
                  className="form-control dash-edit-textarea"
                  rows="3"
                  maxLength={200}
                  placeholder={t("experience.placeholder.description")}
                  value={formData.descripcion}
                  onChange={(e) => patchForm({ descripcion: e.target.value })}
                />
              </div>

              <div className="col-md-6 col-12 dash-edit-field">
                <label className="dash-edit-label">{t("experience.field.startDate")} <span className="dash-edit-required">*</span></label>
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
                  {t("experience.field.endDate")} {formData.actual ? <span className="text-muted">{t("experience.form.disabled")}</span> : <span className="dash-edit-required">*</span>}
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
                    {t("experience.form.currentlyHere")}
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
            {t("experience.actions.cancel")}
          </button>
          <button
            type="submit"
            className="dash-edit-btn dash-edit-btn--primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <DashboardEditSpinner />
                {t("experience.actions.processing")}
              </>
            ) : editData ? t("experience.actions.updateRecord") : t("experience.actions.saveExperience")}
          </button>
        </DashboardEditFooter>
      </form>
    </DashboardEdit>
  );
}
