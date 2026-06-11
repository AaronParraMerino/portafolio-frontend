import React, { useState, useEffect } from "react";
import { useLanguage } from "../../../../core/i18n";
import { createCatalogSkill, getCatalogSkills, getCachedCatalogSkills } from "../services/skillService";
import SkillCatalogModal from "./SkillCatalogModal";
import DashboardEdit, {
  DashboardEditBody,
  DashboardEditFieldError,
  DashboardEditFooter,
  DashboardEditSection,
} from "../../layout/DashboardEdit";

const normalizeSkillName = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

const getSkillId = (skill) =>
  skill?.catalogo_habilidad_id ??
  skill?.id_habilidad ??
  skill?.habilidad_id ??
  skill?.id ??
  "";

const getSkillName = (skill) =>
  skill?.nombre ?? skill?.nombre_habilidad ?? skill?.habilidad?.nombre ?? "";

const getSkillType = (skill) =>
  String(skill?.tipo ?? skill?.habilidad?.tipo ?? "").toLowerCase();

const typeLabel = (tipo, t) => t(`skills.type.${tipo}`);

const buildDuplicateMessage = (duplicate, requestedTipo, typedName, t) => {
  const duplicateTipo = getSkillType(duplicate);
  const duplicateName = getSkillName(duplicate) || typedName;

  if (duplicateTipo === requestedTipo) {
    return t("skills.form.duplicateSame", {
      name: duplicateName,
      type: typeLabel(duplicateTipo, t),
    });
  }

  return t("skills.form.duplicateOther", {
    name: duplicateName,
    existingType: typeLabel(duplicateTipo, t),
    requestedType: typeLabel(requestedTipo, t),
  });
};

const getInitialCatalog = () => {
  try {
    return getCachedCatalogSkills();
  } catch {
    return [];
  }
};

export default function SkillForm({ onSave, onCancel, editData, userSkills = [], onBackgroundActivity }) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    tipo: "",
    catalogo_habilidad_id: "",
    nombre_habilidad: "",
    nivel: "",
  });

  const [catalog, setCatalog] = useState(getInitialCatalog);
  const [suggestions, setSuggestions] = useState([]);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const data = await getCatalogSkills();
        setCatalog(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error cargando catálogo", err);
      }
    };
    loadCatalog();

    if (editData) {
      setFormData({
        tipo: editData.tipo || "",
        catalogo_habilidad_id: editData.catalogo_habilidad_id || getSkillId(editData) || "",
        nombre_habilidad: editData.nombre || editData.nombre_habilidad || "",
        nivel: editData.nivel || "",
      });
    }
  }, [editData]);

  const levelStyles = {
    basico: { color: "var(--gris-texto)", bg: "var(--fondo)", label: t("skills.level.basico") },
    intermedio: { color: "var(--verde-hover)", bg: "var(--verde-chip)", label: t("skills.level.intermedio") },
    avanzado: { color: "var(--azul)", bg: "var(--azul-light)", label: t("skills.level.avanzado") },
    experto: { color: "var(--violeta-hover)", bg: "var(--violeta-chip)", label: t("skills.level.experto") },
  };

  const findCatalogExact = (name) => {
    const normalized = normalizeSkillName(name);
    if (!normalized) return null;
    return catalog.find((skill) => normalizeSkillName(getSkillName(skill)) === normalized) || null;
  };

  const userAlreadyHasSkill = (skillOrName) => {
    const normalized = normalizeSkillName(
      typeof skillOrName === "string" ? skillOrName : getSkillName(skillOrName)
    );

    if (!normalized) return false;

    return userSkills.some((skill) => {
      if (editData && Number(skill?.id) === Number(editData?.id)) return false;
      return normalizeSkillName(getSkillName(skill)) === normalized;
    });
  };

  const setFieldError = (field, message) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const clearFieldError = (field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateTypedName = (value, tipoActual) => {
    const cleanValue = value.trim().replace(/\s+/g, " ");
    const normalized = normalizeSkillName(cleanValue);

    if (!normalized) {
      return { ok: true, message: "" };
    }

    if (normalized.length < 2) {
      return { ok: false, message: t("skills.form.error.minLength") };
    }

    if (cleanValue.length > 40) {
      return { ok: false, message: t("skills.form.error.maxLength") };
    }

    const duplicate = findCatalogExact(cleanValue);
    if (duplicate) {
      return {
        ok: false,
        message: buildDuplicateMessage(duplicate, tipoActual, cleanValue, t),
      };
    }

    return { ok: true, message: "" };
  };

  const handleTypeChange = (tipo) => {
    setFormData({
      ...formData,
      tipo,
      catalogo_habilidad_id: "",
      nombre_habilidad: "",
    });
    setSuggestions([]);
    setErrors((prev) => ({ ...prev, tipo: "", habilidad: "" }));
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    const selectedTipo = formData.tipo;

    setFormData({ ...formData, nombre_habilidad: value, catalogo_habilidad_id: "" });

    if (!selectedTipo) {
      setSuggestions([]);
      setErrors((prev) => ({
        ...prev,
        tipo: t("skills.form.error.selectTypeFirst"),
        habilidad: "",
      }));
      return;
    }

    const normalizedValue = normalizeSkillName(value);
    if (!normalizedValue) {
      setSuggestions([]);
      clearFieldError("habilidad");
      return;
    }

    const filtered = catalog.filter((skill) => {
      const sameType = getSkillType(skill) === selectedTipo;
      const skillName = normalizeSkillName(getSkillName(skill));
      return sameType && skillName.includes(normalizedValue);
    });
    setSuggestions(filtered);

    const duplicate = findCatalogExact(value);

    // Mientras se busca, solo mostramos error si la habilidad existe en la categoría contraria.
    // Si existe en el mismo tipo, no es error: debe poder seleccionarse desde el catálogo.
    if (duplicate && getSkillType(duplicate) !== selectedTipo) {
      setFieldError(
        "habilidad",
        buildDuplicateMessage(duplicate, selectedTipo, value.trim(), t)
      );
      return;
    }

    clearFieldError("habilidad");
  };

  const selectSkill = (skill) => {
    if (userAlreadyHasSkill(skill)) {
      setFormData({
        ...formData,
        catalogo_habilidad_id: "",
        nombre_habilidad: getSkillName(skill),
      });
      setSuggestions([]);
      setErrors({ habilidad: t("skills.toast.duplicateOwned", { name: getSkillName(skill) }) });
      return;
    }

    setFormData({
      ...formData,
      catalogo_habilidad_id: getSkillId(skill),
      nombre_habilidad: getSkillName(skill),
    });
    setSuggestions([]);
    setErrors({});
  };

  const handleOpenCatalogModal = () => {
    if (!formData.tipo) {
      setErrors({ tipo: t("skills.form.error.selectType") });
      return;
    }

    const cleanName = formData.nombre_habilidad.trim().replace(/\s+/g, " ");

    if (cleanName) {
      const validation = validateTypedName(cleanName, formData.tipo);
      if (!validation.ok) {
        setErrors({ habilidad: validation.message });
        return;
      }

      if (userAlreadyHasSkill(cleanName)) {
        setErrors({ habilidad: t("skills.toast.duplicateOwned", { name: cleanName }) });
        return;
      }
    }

    setErrors({});
    setShowCatalogModal(true);
  };

  const handleCreatedInCatalog = (newSkillData) => {
    setShowCatalogModal(false);

    const createTask = async () => {
      const newSkill = await createCatalogSkill(
        newSkillData.nombre,
        newSkillData.tipo,
        newSkillData.descripcion || ""
      );

    if (userAlreadyHasSkill(newSkill)) {
      setErrors({ habilidad: t("skills.toast.duplicateOwned", { name: getSkillName(newSkill) }) });
      return;
    }

    setCatalog((prev) => {
      const newSkillId = String(getSkillId(newSkill));
      const exists = prev.some((skill) => String(getSkillId(skill)) === newSkillId);
      return exists ? prev : [...prev, newSkill];
    });
    selectSkill(newSkill);
    };

    if (typeof onBackgroundActivity === "function") {
      onBackgroundActivity(createTask);
    } else {
      createTask().catch((error) => {
        setErrors({ habilidad: error.message || t("skills.catalog.error.create") });
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nextErrors = {};

    if (!formData.tipo) {
      nextErrors.tipo = t("skills.form.error.selectType");
    }

    if (!formData.nivel) {
      nextErrors.nivel = t("skills.form.error.selectLevel");
    }

    if (!editData && !formData.nombre_habilidad.trim()) {
      nextErrors.habilidad = t("skills.form.error.searchOrCreate");
    }

    if (!editData && formData.nombre_habilidad.trim() && !formData.catalogo_habilidad_id) {
      const duplicate = findCatalogExact(formData.nombre_habilidad);
      if (duplicate) {
        nextErrors.habilidad = buildDuplicateMessage(duplicate, formData.tipo, formData.nombre_habilidad.trim(), t);
      } else {
        nextErrors.habilidad = t("skills.form.error.selectOrCreate");
      }
    }

    if (!editData && userAlreadyHasSkill(formData.nombre_habilidad)) {
      nextErrors.habilidad = t("skills.toast.duplicateOwned", { name: formData.nombre_habilidad.trim() });
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSave(formData);
  };

  return (
    <>
      <DashboardEdit
        title={editData ? t("skills.form.title.edit") : t("skills.form.title.create")}
        subtitle={t("skills.form.subtitle")}
        onClose={onCancel}
        ariaLabel={editData ? t("skills.form.title.edit") : t("skills.form.title.create")}
        size="sm"
      >
        <form onSubmit={handleSubmit} style={{ display: "contents" }}>
          <DashboardEditBody>
            <DashboardEditSection label={t("skills.catalog.section")}>
              {!editData && (
                <div className="dash-edit-field mb-3">
                  <label className="dash-edit-label">
                    {t("skills.form.type")} <span className="dash-edit-required">*</span>
                  </label>
                  <div className="dash-edit-segmented">
                    <button
                      type="button"
                      className={`dash-edit-segmented-btn${formData.tipo === "tecnica" ? " active" : ""}`}
                      onClick={() => handleTypeChange("tecnica")}
                      aria-pressed={formData.tipo === "tecnica"}
                    >
                      {t("skills.type.technicalLabel")}
                    </button>
                    <button
                      type="button"
                      className={`dash-edit-segmented-btn${formData.tipo === "blanda" ? " active" : ""}`}
                      onClick={() => handleTypeChange("blanda")}
                      aria-pressed={formData.tipo === "blanda"}
                    >
                      {t("skills.type.softLabel")}
                    </button>
                  </div>
                  <DashboardEditFieldError msg={errors.tipo} />
                </div>
              )}

              <div className="dash-edit-field mb-3 position-relative">
                <label className="dash-edit-label">
                  {t("skills.form.name")} <span className="dash-edit-required">*</span>
                </label>
                <div className="input-group">
                  <input
                    type="text"
                    className={`form-control dash-edit-input${errors.habilidad ? " dash-edit-input-error" : ""}`}
                    placeholder={formData.tipo ? t("skills.form.searchPlaceholder") : t("skills.form.selectTypeFirst")}
                    value={formData.nombre_habilidad}
                    onChange={handleSearch}
                    disabled={!!editData || !formData.tipo}
                  />
                  {!editData && (
                    <button
                      type="button"
                      className="dash-edit-btn dash-edit-btn--primary dash-edit-btn-compact"
                      onClick={handleOpenCatalogModal}
                    >
                      {t("skills.form.new")}
                    </button>
                  )}
                </div>
                <DashboardEditFieldError msg={errors.habilidad} />

                {suggestions.length > 0 && (
                  <ul className="dash-edit-suggestions">
                    {suggestions.map((s) => (
                      <li key={getSkillId(s)}>
                        <button type="button" onClick={() => selectSkill(s)}>
                          {getSkillName(s)}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="dash-edit-field">
                <label className="dash-edit-label">
                  {t("skills.form.level")} <span className="dash-edit-required">*</span>
                </label>
                <div className="dash-edit-level-grid">
                  {Object.entries(levelStyles).map(([lvl, config]) => (
                    <button
                      type="button"
                      key={lvl}
                      className={`dash-edit-level-option dash-edit-level-option--${lvl}${formData.nivel === lvl ? " active" : ""}`}
                      onClick={() => {
                        setFormData({ ...formData, nivel: lvl });
                        clearFieldError("nivel");
                      }}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
                <DashboardEditFieldError msg={errors.nivel} />
              </div>
            </DashboardEditSection>
          </DashboardEditBody>

          <DashboardEditFooter>
            <button
              type="button"
              className="dash-edit-btn dash-edit-btn--secondary"
              onClick={onCancel}
            >
              {t("skills.common.cancel")}
            </button>
            <button
              type="submit"
              className="dash-edit-btn dash-edit-btn--primary"
            >
              {editData ? (
                t("skills.form.saveChanges")
              ) : (
                t("skills.form.saveSkill")
              )}
            </button>
          </DashboardEditFooter>
        </form>
      </DashboardEdit>

      {showCatalogModal && (
        <SkillCatalogModal
          tipo={formData.tipo}
          catalog={catalog}
          initialName={formData.nombre_habilidad}
          onSave={handleCreatedInCatalog}
          onCancel={() => setShowCatalogModal(false)}
        />
      )}
    </>
  );
}


