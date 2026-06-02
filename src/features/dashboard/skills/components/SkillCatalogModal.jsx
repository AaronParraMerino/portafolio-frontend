import { useState } from "react";
import { useLanguage } from "../../../../core/i18n";
import DashboardEdit, {
  DashboardEditBody,
  DashboardEditFieldError,
  DashboardEditFooter,
  DashboardEditSection,
  DashboardEditSpinner,
} from "../../layout/DashboardEdit";
import {
  createCatalogSkill,
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
  const [loading, setLoading] = useState(false);
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

  const handleFinalConfirm = async () => {
    const validation = validateName(nombre);

    if (!validation.ok) {
      setError(validation.message);
      setConfirmar(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const nuevaHabilidad = await createCatalogSkill(
        formatSkillDisplayName(validation.cleanName),
        tipo,
        desc.trim()
      );

      onSave(nuevaHabilidad);
    } catch (err) {
      const message = String(err?.message || "");

      if (
        message.toLowerCase().includes("existe") ||
        message.toLowerCase().includes("duplic") ||
        message.toLowerCase().includes("unique")
      ) {
        setError(
          t("skills.catalog.error.exists", { name: validation.cleanName })
        );
      } else {
        setError(message || t("skills.catalog.error.create"));
      }

      setConfirmar(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardEdit
      title={t("skills.catalog.title", { type: typeLabel(tipo, t) })}
      subtitle={t("skills.catalog.subtitle")}
      onClose={onCancel}
      closeDisabled={loading}
      closeOnOverlay={!loading}
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
                  disabled={loading}
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
                  disabled={loading}
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
              disabled={loading}
            >
              {t("skills.common.cancel")}
            </button>
            <button
              type="submit"
              className="dash-edit-btn dash-edit-btn--primary"
              disabled={loading}
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
              disabled={loading}
            >
              {t("skills.common.back")}
            </button>
            <button
              type="button"
              className="dash-edit-btn dash-edit-btn--primary"
              onClick={handleFinalConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <DashboardEditSpinner />
                  {t("skills.catalog.creating")}
                </>
              ) : (
                t("skills.catalog.confirm")
              )}
            </button>
          </DashboardEditFooter>
        </>
      )}
    </DashboardEdit>
  );
}
