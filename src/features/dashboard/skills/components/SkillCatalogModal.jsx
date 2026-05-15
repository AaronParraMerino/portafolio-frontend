import { useState } from "react";
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

const typeLabel = (tipo) => (tipo === "tecnica" ? "técnica" : "blanda");

const duplicateMessage = (duplicate, requestedTipo, typedName) => {
  const duplicateTipo = getSkillType(duplicate);
  const duplicateName = getSkillName(duplicate) || typedName;

  if (duplicateTipo === requestedTipo) {
    return `La habilidad "${duplicateName}" ya existe como habilidad ${typeLabel(
      duplicateTipo
    )}. Selecciónala desde el catálogo en lugar de crearla nuevamente.`;
  }

  return `La habilidad "${duplicateName}" ya está registrada como habilidad ${typeLabel(
    duplicateTipo
  )}. No puedes crearla como habilidad ${typeLabel(requestedTipo)}.`;
};

export default function SkillCatalogModal({
  tipo,
  catalog = [],
  initialName = "",
  onSave,
  onCancel,
}) {
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
        message: "Escribe el nombre de la habilidad.",
      };
    }

    if (normalizeSkillText(cleanName).length < 2) {
      return {
        ok: false,
        cleanName,
        message: "La habilidad debe tener al menos 2 caracteres.",
      };
    }

    if (cleanName.length > 40) {
      return {
        ok: false,
        cleanName,
        message: "La habilidad no puede superar los 40 caracteres.",
      };
    }

    const duplicate = findDuplicate(cleanName);

    if (duplicate) {
      return {
        ok: false,
        cleanName,
        message: duplicateMessage(duplicate, tipo, cleanName),
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
          `No se pudo crear "${validation.cleanName}" porque ya existe en el catálogo. Selecciónala desde la búsqueda.`
        );
      } else {
        setError(message || "Error al crear habilidad en catálogo");
      }

      setConfirmar(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardEdit
      title={`Nueva habilidad ${tipo === "tecnica" ? "técnica" : "blanda"}`}
      subtitle="Se agregará al catálogo general para poder seleccionarla."
      onClose={onCancel}
      closeDisabled={loading}
      closeOnOverlay={!loading}
      size="sm"
      className="dash-edit-modal--stacked"
      ariaLabel="Nueva habilidad"
    >
      {!confirmar ? (
        <form onSubmit={handleSubmit} style={{ display: "contents" }}>
          <DashboardEditBody>
            <DashboardEditSection label="Datos del catálogo">
              <div className="dash-edit-field mb-3">
                <label className="dash-edit-label">
                  Nombre de la habilidad{" "}
                  <span className="dash-edit-required">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control dash-edit-input ${
                    error ? "dash-edit-input-error" : ""
                  }`}
                  placeholder="Ej: Inglés, AWS, Scrum..."
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
                  Pequeña descripción
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
                  placeholder="Ej: Servicios cloud"
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
              Cancelar
            </button>
            <button
              type="submit"
              className="dash-edit-btn dash-edit-btn--primary"
              disabled={loading}
            >
              Crear en catálogo
            </button>
          </DashboardEditFooter>
        </form>
      ) : (
        <>
          <DashboardEditBody>
            <div className="dash-edit-confirm">
              <p>
                Estás por crear <strong>{nombre}</strong> en el catálogo general.
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
              Atrás
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
                  Creando...
                </>
              ) : (
                "Sí, crear"
              )}
            </button>
          </DashboardEditFooter>
        </>
      )}
    </DashboardEdit>
  );
}
