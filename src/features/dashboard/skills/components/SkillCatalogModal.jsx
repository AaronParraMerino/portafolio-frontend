import { useState } from "react";
import { useLanguage } from "../../../../core/i18n";
import DashboardEdit, {
  DashboardEditBody,
  DashboardEditFieldError,
  DashboardEditFooter,
  DashboardEditSection,
} from "../../layout/DashboardEdit";
import {
  formatSkillDisplayName,
  normalizeSkillText,
} from "../services/skillService";

const getSkillName = (skill) =>
  skill?.nombre ?? skill?.nombre_habilidad ?? skill?.habilidad?.nombre ?? "";

const getSkillType = (skill) =>
  String(skill?.tipo ?? skill?.habilidad?.tipo ?? "").toLowerCase();

const typeLabel = (tipo, t) => t(`skills.type.${tipo}`);

const duplicateMessage = (duplicate, requestedTipo, typedName, t) => {
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

export default function SkillCatalogModal({
  tipo,
  catalog = [],
  initialName = "",
  onSave,
  onCancel,
}) {
  const { t } = useLanguage();
  const [nombre, setNombre] = useState(
    initialName ? formatSkillDisplayName(initialName.trim().replace(/\s+/g, " ")) : ""
  );
  const [desc, setDesc] = useState("");
  const [confirmar, setConfirmar] = useState(false);
  const [error, setError] = useState("");

  const findDuplicate = (value) => {
    const normalized = normalizeSkillText(value);
    if (!normalized) return null;

    return (
      catalog.find((skill) => normalizeSkillText(getSkillName(skill)) === normalized) ||
      null
    );
  };

  const validateName = (rawValue) => {
    const cleanName = String(rawValue || "").trim().replace(/\s+/g, " ");

    if (!cleanName) {
      return {
        ok: false,
        cleanName,
        message: t("skills.catalog.error.nameRequired"),
      };
    }

    if (normalizeSkillText(cleanName).length < 2) {
      return {
        ok: false,
        cleanName,
        message: t("skills.form.error.minLength"),
      };
    }

    if (cleanName.length > 40) {
      return {
        ok: false,
        cleanName,
        message: t("skills.form.error.maxLength"),
      };
    }

    const duplicate = findDuplicate(cleanName);

    if (duplicate) {
      return {
        ok: false,
        cleanName,
        message: duplicateMessage(duplicate, tipo, cleanName, t),
      };
    }

    return {
      ok: true,
      cleanName,
      message: "",
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validation = validateName(nombre);

    if (!validation.ok) {
      setNombre(validation.cleanName);
      setError(validation.message);
      setConfirmar(false);
      return;
    }

    setNombre(formatSkillDisplayName(validation.cleanName));
    setError("");
    setConfirmar(true);
  };

  const handleFinalConfirm = () => {
    const validation = validateName(nombre);

    if (!validation.ok) {
      setError(validation.message);
      setConfirmar(false);
      return;
    }

    setError("");
    onSave({
      nombre: formatSkillDisplayName(validation.cleanName),
      tipo,
      descripcion: desc.trim(),
    });
  };

  return (
    <DashboardEdit
      title={t("skills.catalog.title", { type: typeLabel(tipo, t) })}
      subtitle={t("skills.catalog.subtitle")}
      onClose={onCancel}
      size="sm"
      className="dash-edit-modal--stacked"
      ariaLabel={t("skills.catalog.aria")}
    >
      {!confirmar ? (
        <form onSubmit={handleSubmit} style={{ display: "contents" }}>
          <DashboardEditBody>
            <DashboardEditSection label={t("skills.catalog.section")}>
              <div className="dash-edit-field mb-3">
                <label className="dash-edit-label">
                  {t("skills.catalog.name")}{" "}
                  <span className="dash-edit-required">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control dash-edit-input ${
                    error ? "dash-edit-input-error" : ""
                  }`}
                  placeholder={t("skills.catalog.placeholder.name")}
                  value={nombre}
                  onChange={(e) => {
                    const nextValue = e.target.value;
                    setNombre(nextValue);

                    const cleanValue = nextValue.trim().replace(/\s+/g, " ");

                    if (!cleanValue) {
                      setError("");
                      return;
                    }

                    if (normalizeSkillText(cleanValue).length < 2) {
                      setError("");
                      return;
                    }

                    const validation = validateName(cleanValue);
                    setError(validation.ok ? "" : validation.message);
                  }}
                  required
                  maxLength="40"
                />
                <span
                  className="dash-edit-char-count"
                  style={{ color: "var(--gris-texto)" }}
                >
                  {nombre.length}/40
                </span>
              </div>

              <div className="dash-edit-field">
                <label className="dash-edit-label">
                  {t("skills.catalog.description")}
                  <span
                    className="dash-edit-char-count"
                    style={{ color: "var(--gris-texto)" }}
                  >
                    {desc.length}/30
                  </span>
                </label>
                <textarea
                  className="form-control dash-edit-textarea"
                  rows="2"
                  maxLength="30"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder={t("skills.catalog.placeholder.description")}
                />
              </div>

              <DashboardEditFieldError msg={error} />
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
              {t("skills.catalog.create")}
            </button>
          </DashboardEditFooter>
        </form>
      ) : (
        <>
          <DashboardEditBody>
            <div className="dash-edit-confirm">
              <p>
                {t("skills.catalog.confirmMessage", { name: nombre })}
              </p>
              <DashboardEditFieldError msg={error} />
            </div>
          </DashboardEditBody>

          <DashboardEditFooter>
            <button
              type="button"
              className="dash-edit-btn dash-edit-btn--secondary"
              onClick={() => setConfirmar(false)}
            >
              {t("skills.common.back")}
            </button>
            <button
              type="button"
              className="dash-edit-btn dash-edit-btn--primary"
              onClick={handleFinalConfirm}
            >
              {t("skills.catalog.confirm")}
            </button>
          </DashboardEditFooter>
        </>
      )}
    </DashboardEdit>
  );
}
