import React, { useState, useEffect } from "react";
import { getCatalogSkills } from "../services/skillService";
import SkillCatalogModal from "./SkillCatalogModal";

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

const typeLabel = (tipo) => (tipo === "tecnica" ? "técnica" : "blanda");

const getCatalogDuplicateMessage = (duplicate, requestedTipo, typedName) => {
  const duplicateTipo = getSkillType(duplicate);
  const duplicateName = getSkillName(duplicate) || typedName;

  if (duplicateTipo === requestedTipo) {
    return `La habilidad "${duplicateName}" ya existe como habilidad ${typeLabel(duplicateTipo)}. Selecciónala desde el catálogo en lugar de crearla nuevamente.`;
  }

  return `La habilidad "${duplicateName}" ya está registrada como habilidad ${typeLabel(duplicateTipo)}. No puedes crearla como habilidad ${typeLabel(requestedTipo)}.`;
};

export default function SkillForm({ onSave, onCancel, editData, userSkills = [] }) {
  const [formData, setFormData] = useState({
    tipo: "",
    catalogo_habilidad_id: "",
    nombre_habilidad: "",
    nivel: "",
  });

  const [catalog, setCatalog] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        tipo: editData.tipo || "tecnica",
        catalogo_habilidad_id: editData.catalogo_habilidad_id || getSkillId(editData) || "",
        nombre_habilidad: editData.nombre || editData.nombre_habilidad || "",
        nivel: editData.nivel || "",
      });
    }
  }, [editData]);

  const levelStyles = {
    basico: { color: "var(--gris-texto)", bg: "var(--fondo)" },
    intermedio: { color: "var(--verde-hover)", bg: "var(--verde-chip)" },
    avanzado: { color: "var(--azul)", bg: "var(--azul-light)" },
    experto: { color: "var(--violeta-hover)", bg: "var(--violeta-chip)" },
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

    return userSkills.some((skill) => normalizeSkillName(getSkillName(skill)) === normalized);
  };

  const clearSkillError = () => {
    if (errors.habilidad) {
      setErrors((prev) => ({ ...prev, habilidad: "" }));
    }
  };

  const clearTypeError = () => {
    if (errors.tipo) {
      setErrors((prev) => ({ ...prev, tipo: "" }));
    }
  };

  const clearLevelError = () => {
    if (errors.nivel) {
      setErrors((prev) => ({ ...prev, nivel: "" }));
    }
  };

  const validateTypedName = (value, tipoActual) => {
    const cleanValue = value.trim().replace(/\s+/g, " ");
    const normalized = normalizeSkillName(cleanValue);

    if (!normalized) {
      return { ok: true, duplicate: null, message: "" };
    }

    if (normalized.length < 2) {
      return {
        ok: false,
        duplicate: null,
        message: "La habilidad debe tener al menos 2 caracteres.",
      };
    }

    if (cleanValue.length > 40) {
      return {
        ok: false,
        duplicate: null,
        message: "La habilidad no puede superar los 40 caracteres.",
      };
    }

    const duplicate = findCatalogExact(cleanValue);
    if (duplicate) {
      return {
        ok: false,
        duplicate,
        message: getCatalogDuplicateMessage(duplicate, tipoActual, cleanValue),
      };
    }

    return { ok: true, duplicate: null, message: "" };
  };

  const handleTypeChange = (tipo) => {
    setFormData({
      ...formData,
      tipo,
      catalogo_habilidad_id: "",
      nombre_habilidad: "",
    });
    setSuggestions([]);
    clearTypeError();
    if (errors.habilidad) clearSkillError();
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    const selectedTipo = formData.tipo;

    setFormData({ ...formData, nombre_habilidad: value, catalogo_habilidad_id: "" });

    const normalizedValue = normalizeSkillName(value);
    if (!selectedTipo) {
      setSuggestions([]);
      setErrors((prev) => ({
        ...prev,
        tipo: "Selecciona el tipo de habilidad antes de buscar o crear una habilidad.",
      }));
      return;
    }

    if (!normalizedValue) {
      setSuggestions([]);
      clearSkillError();
      return;
    }

    const filtered = catalog.filter((skill) => {
      const sameType = getSkillType(skill) === selectedTipo;
      const skillName = normalizeSkillName(getSkillName(skill));
      return sameType && skillName.includes(normalizedValue);
    });
    setSuggestions(filtered);

    const duplicate = findCatalogExact(value);
    if (duplicate) {
      setErrors({
        habilidad: getCatalogDuplicateMessage(duplicate, selectedTipo, value.trim()),
      });
      return;
    }

    clearSkillError();
  };

  const selectSkill = (skill) => {
    if (userAlreadyHasSkill(skill)) {
      setFormData({
        ...formData,
        catalogo_habilidad_id: "",
        nombre_habilidad: getSkillName(skill),
      });
      setSuggestions([]);
      setErrors({ habilidad: `Ya tienes "${getSkillName(skill)}" registrada en tu perfil.` });
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
      setErrors((prev) => ({
        ...prev,
        tipo: "Selecciona si la habilidad será técnica o blanda.",
      }));
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
        setErrors({ habilidad: `Ya tienes "${cleanName}" registrada en tu perfil.` });
        return;
      }
    }

    setErrors({});
    setShowCatalogModal(true);
  };

  const handleCreatedInCatalog = (newSkill) => {
    if (userAlreadyHasSkill(newSkill)) {
      setShowCatalogModal(false);
      setErrors({ habilidad: `Ya tienes "${getSkillName(newSkill)}" registrada en tu perfil.` });
      return;
    }

    setCatalog((prev) => {
      const newSkillId = String(getSkillId(newSkill));
      const exists = prev.some((skill) => String(getSkillId(skill)) === newSkillId);
      return exists ? prev : [...prev, newSkill];
    });
    selectSkill(newSkill);
    setShowCatalogModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editData) {
      if (!formData.nivel) {
        setErrors({ nivel: "Selecciona un nivel para la habilidad." });
        return;
      }

      try {
        setIsSubmitting(true);
        await onSave(formData);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!formData.tipo) {
      setErrors({ tipo: "Selecciona si la habilidad será técnica o blanda." });
      return;
    }

    if (!formData.nombre_habilidad.trim()) {
      setErrors({ habilidad: "Debes buscar o crear una habilidad antes de guardar." });
      return;
    }

    if (!formData.nivel) {
      setErrors({ nivel: "Selecciona un nivel para la habilidad." });
      return;
    }

    if (!formData.catalogo_habilidad_id) {
      const duplicate = findCatalogExact(formData.nombre_habilidad);
      if (duplicate) {
        setErrors({
          habilidad: getCatalogDuplicateMessage(duplicate, formData.tipo, formData.nombre_habilidad.trim()),
        });
        return;
      }

      setErrors({
        habilidad: "Esta habilidad no está seleccionada del catálogo. Presiona + Nueva para crearla primero.",
      });
      return;
    }

    if (userAlreadyHasSkill(formData.nombre_habilidad)) {
      setErrors({ habilidad: `Ya tienes "${formData.nombre_habilidad}" registrada en tu perfil.` });
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        .skill-modal-overlay {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,.65);
          z-index: 1100;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 16px;
          backdrop-filter: blur(2px);
          font-family: var(--font);
        }
        .skill-modal-card {
          width: 90%;
          max-width: 500px;
          border-radius: 12px;
          background: var(--blanco);
          border: 1.5px solid var(--gris-borde);
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,.18);
        }
        .skill-modal-head {
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--negro-texto);
          border-bottom: 4px solid var(--azul);
        }
        .skill-form-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--gris-oscuro);
          text-transform: uppercase;
          letter-spacing: .05em;
          margin-bottom: 6px;
        }
        .skill-input {
          font-family: var(--font) !important;
          font-size: 13px !important;
          border: 1.5px solid var(--gris-borde) !important;
          border-radius: 7px !important;
          color: var(--negro-texto) !important;
          background: var(--blanco) !important;
          transition: border-color .15s, box-shadow .15s !important;
        }
        .skill-input:focus {
          outline: none !important;
          border-color: var(--azul) !important;
          box-shadow: 0 0 0 3px var(--azul-glow) !important;
        }
        .skill-input.is-invalid {
          border-color: var(--rojo-soft) !important;
          background: var(--rojo-bg) !important;
        }
        .skill-field-message {
          margin-top: 6px;
          font-size: 12px;
          font-weight: 600;
          color: var(--rojo-soft);
          line-height: 1.35;
        }
        .skill-field-hint {
          margin-top: 6px;
          font-size: 11.5px;
          color: var(--gris-texto);
          line-height: 1.35;
        }
        .skill-new-btn {
          border: 1.5px solid var(--azul) !important;
          background: var(--azul-light) !important;
          color: var(--azul) !important;
          font-family: var(--font);
          font-weight: 700;
          transition: all .15s ease;
        }
        .skill-new-btn:hover {
          background: var(--azul) !important;
          color: var(--blanco) !important;
          box-shadow: 0 3px 10px rgba(0,119,183,.22);
        }
        .skill-suggestion-meta {
          color: var(--gris-texto);
          font-size: 11px;
          margin-left: 8px;
        }
        .skill-btn-cancel,
        .skill-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 18px;
          border-radius: 7px;
          font-family: var(--font);
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all .15s ease;
          white-space: nowrap;
        }
        .skill-btn-cancel {
          border: 1.5px solid var(--gris-borde);
          background: var(--blanco);
          color: var(--gris-oscuro);
        }
        .skill-btn-cancel:hover {
          border-color: var(--rojo-soft);
          color: var(--rojo-soft);
          background: var(--rojo-bg);
        }
        .skill-btn-primary {
          border: none;
          background: var(--azul);
          color: var(--blanco);
          box-shadow: 0 2px 8px rgba(0,119,183,.18);
        }
        .skill-btn-primary:hover {
          background: var(--azul-hover);
          color: var(--blanco);
          box-shadow: 0 4px 12px rgba(0,119,183,.3);
          transform: translateY(-1px);
        }
        .skill-btn-primary:disabled,
        .skill-btn-cancel:disabled {
          opacity: .55;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        .skill-type-label {
          border-color: var(--azul) !important;
          color: var(--azul) !important;
          font-weight: 700;
        }
        .btn-check:checked + .skill-type-label {
          background: var(--azul) !important;
          color: var(--blanco) !important;
          border-color: var(--azul) !important;
        }
      `}</style>

      <div className="skill-modal-overlay">
        <div className="skill-modal-card">
          <div className="skill-modal-head">
            <span className="fw-bold text-white" style={{ fontSize: "1.1rem" }}>
              {editData ? "Editar Habilidad" : "Registrar Habilidad"}
            </span>
            <button
              className="btn-close btn-close-white"
              onClick={onCancel}
              aria-label="Cerrar modal"
              disabled={isSubmitting}
            ></button>
          </div>

          <form onSubmit={handleSubmit} className="p-4">
            {!editData && (
              <div className="mb-4">
                <label className="skill-form-label">Tipo de Habilidad</label>
                <div className="btn-group w-100 shadow-sm">
                  <input
                    type="radio"
                    className="btn-check"
                    id="t-tec"
                    checked={formData.tipo === "tecnica"}
                    onChange={() => handleTypeChange("tecnica")}
                  />
                  <label className="btn btn-outline-primary skill-type-label" htmlFor="t-tec">Técnica</label>
                  <input
                    type="radio"
                    className="btn-check"
                    id="t-bla"
                    checked={formData.tipo === "blanda"}
                    onChange={() => handleTypeChange("blanda")}
                  />
                  <label className="btn btn-outline-primary skill-type-label" htmlFor="t-bla">Blanda</label>
                </div>
                {errors.tipo && <div className="skill-field-message">{errors.tipo}</div>}
              </div>
            )}

            <div className="mb-4 position-relative">
              <label className="form-label fw-bold">Nombre de Habilidad *</label>
              <div className="input-group">
                <input
                  type="text"
                  className={`form-control skill-input ${errors.habilidad ? "is-invalid" : ""}`}
                  placeholder={!editData && !formData.tipo ? "Primero selecciona técnica o blanda" : "Escribe para buscar..."}
                  value={formData.nombre_habilidad}
                  onChange={handleSearch}
                  disabled={!!editData || (!editData && !formData.tipo)}
                  maxLength="40"
                />
                {!editData && (
                  <button
                    type="button"
                    className="btn skill-new-btn"
                    onClick={handleOpenCatalogModal}
                    disabled={!formData.tipo}
                  >
                    + Nueva
                  </button>
                )}
              </div>
              {errors.habilidad ? (
                <div className="skill-field-message">{errors.habilidad}</div>
              ) : !editData ? (
                <div className="skill-field-hint">
                  Busca una habilidad existente. Si no existe, créala con + Nueva.
                </div>
              ) : null}

              {suggestions.length > 0 && (
                <ul className="list-group position-absolute w-100 shadow-lg" style={{ zIndex: 100, top: "100%" }}>
                  {suggestions.map((skill) => (
                    <li
                      key={getSkillId(skill)}
                      className="list-group-item list-group-item-action py-2"
                      style={{ cursor: "pointer" }}
                      onClick={() => selectSkill(skill)}
                    >
                      <span>{getSkillName(skill)}</span>
                      <span className="skill-suggestion-meta">habilidad {typeLabel(getSkillType(skill))}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold small">Nivel de dominio</label>
              <div className="row g-2">
                {Object.keys(levelStyles).map((lvl) => (
                  <div className="col-6" key={lvl}>
                    <div
                      onClick={() => {
                        setFormData({ ...formData, nivel: lvl });
                        clearLevelError();
                      }}
                      style={{
                        cursor: "pointer",
                        padding: "10px",
                        borderRadius: "25px",
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: "0.85rem",
                        textTransform: "capitalize",
                        transition: "0.2s",
                        border: formData.nivel === lvl ? `2px solid ${levelStyles[lvl].color}` : "1px solid var(--gris-borde)",
                        backgroundColor: formData.nivel === lvl ? levelStyles[lvl].bg : "var(--blanco)",
                        color: formData.nivel === lvl ? levelStyles[lvl].color : "var(--gris-texto)",
                      }}
                    >
                      {lvl}
                    </div>
                  </div>
                ))}
              </div>
              {errors.nivel && <div className="skill-field-message">{errors.nivel}</div>}
            </div>

            <div className="d-flex gap-2 justify-content-end pt-3 border-top">
              <button
                type="button"
                className="skill-btn-cancel"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="skill-btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Guardando..." : editData ? "Guardar Cambios" : "Guardar Habilidad"}
              </button>
            </div>
          </form>
        </div>
      </div>

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
