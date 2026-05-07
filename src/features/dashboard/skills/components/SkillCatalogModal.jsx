import React, { useState } from "react";
import { createCatalogSkill, formatSkillDisplayName } from "../services/skillService";

const normalizeSkillName = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

const getSkillName = (skill) =>
  skill?.nombre ?? skill?.nombre_habilidad ?? skill?.habilidad?.nombre ?? "";

const getSkillType = (skill) =>
  String(skill?.tipo ?? skill?.habilidad?.tipo ?? "").toLowerCase();

const typeLabel = (tipo) => (tipo === "tecnica" ? "técnica" : "blanda");

const duplicateMessage = (duplicate, requestedTipo, typedName) => {
  const duplicateTipo = getSkillType(duplicate);
  const duplicateName = getSkillName(duplicate) || typedName;

  if (duplicateTipo === requestedTipo) {
    return `La habilidad "${duplicateName}" ya existe como habilidad ${typeLabel(duplicateTipo)}. Selecciónala desde el catálogo en lugar de crearla nuevamente.`;
  }

  return `La habilidad "${duplicateName}" ya está registrada como habilidad ${typeLabel(duplicateTipo)}. No puedes crearla como habilidad ${typeLabel(requestedTipo)}.`;
};

export default function SkillCatalogModal({ tipo, catalog = [], initialName = "", onSave, onCancel }) {
  const [nombre, setNombre] = useState(
    initialName ? formatSkillDisplayName(initialName.trim().replace(/\s+/g, " ")) : ""
  );
  const [desc, setDesc] = useState("");
  const [confirmar, setConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const findDuplicate = (value) => {
    const normalized = normalizeSkillName(value);
    if (!normalized) return null;
    return catalog.find((skill) => normalizeSkillName(getSkillName(skill)) === normalized) || null;
  };

  const validateName = (rawValue) => {
    const cleanName = rawValue.trim().replace(/\s+/g, " ");

    if (!cleanName) {
      return { ok: false, cleanName, message: "Escribe el nombre de la habilidad." };
    }

    if (normalizeSkillName(cleanName).length < 2) {
      return { ok: false, cleanName, message: "La habilidad debe tener al menos 2 caracteres." };
    }

    if (cleanName.length > 40) {
      return { ok: false, cleanName, message: "La habilidad no puede superar los 40 caracteres." };
    }

    const duplicate = findDuplicate(cleanName);
    if (duplicate) {
      return { ok: false, cleanName, message: duplicateMessage(duplicate, tipo, cleanName) };
    }

    return { ok: true, cleanName, message: "" };
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

      const duplicate = findDuplicate(getSkillName(nuevaHabilidad));
      if (duplicate && getSkillName(duplicate) !== getSkillName(nuevaHabilidad)) {
        setError(duplicateMessage(duplicate, tipo, validation.cleanName));
        setConfirmar(false);
        return;
      }

      onSave(nuevaHabilidad);
    } catch (err) {
      const message = String(err?.message || "");
      const normalizedMessage = message.toLowerCase();
      if (
        normalizedMessage.includes("existe") ||
        normalizedMessage.includes("duplic") ||
        normalizedMessage.includes("unique")
      ) {
        setError(`No se pudo crear "${validation.cleanName}" porque ya existe en el catálogo. Actualiza el catálogo o selecciónala desde la búsqueda.`);
      } else {
        setError(message || "Error al crear habilidad en catálogo");
      }
      setConfirmar(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="skill-catalog-overlay">
      <style>{`
        .skill-catalog-overlay {
          position: fixed;
          inset: 0;
          z-index: 1200;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,.6);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 16px;
          font-family: var(--font);
        }
        .skill-catalog-card {
          width: 370px;
          max-width: 100%;
          overflow: hidden;
          background: var(--blanco);
          border: 1.5px solid var(--gris-borde);
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0,0,0,.18);
        }
        .skill-catalog-head {
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--negro-texto);
          border-bottom: 4px solid var(--azul);
        }
        .skill-catalog-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--gris-oscuro);
          text-transform: uppercase;
          letter-spacing: .05em;
          margin-bottom: 6px;
        }
        .skill-catalog-input {
          font-family: var(--font) !important;
          font-size: 13px !important;
          border: 1.5px solid var(--gris-borde) !important;
          border-radius: 7px !important;
          color: var(--negro-texto) !important;
          background: var(--blanco) !important;
          transition: border-color .15s, box-shadow .15s !important;
        }
        .skill-catalog-input:focus {
          outline: none !important;
          border-color: var(--azul) !important;
          box-shadow: 0 0 0 3px var(--azul-glow) !important;
        }
        .skill-catalog-input.is-invalid {
          border-color: var(--rojo-soft) !important;
          background: var(--rojo-bg) !important;
        }
        .skill-catalog-hint {
          margin-top: 5px;
          font-size: 11px;
          color: var(--gris-texto);
          line-height: 1.35;
        }
        .skill-catalog-alert {
          padding: 9px 12px;
          border-radius: 8px;
          background: var(--rojo-bg);
          border: 1px solid var(--rojo-borde);
          color: var(--rojo-soft);
          font-size: 12px;
          font-weight: 600;
          line-height: 1.35;
        }
        .skill-catalog-cancel,
        .skill-catalog-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 7px;
          font-family: var(--font);
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all .15s ease;
          white-space: nowrap;
        }
        .skill-catalog-cancel {
          border: 1.5px solid var(--gris-borde);
          background: var(--blanco);
          color: var(--gris-oscuro);
        }
        .skill-catalog-cancel:hover {
          border-color: var(--rojo-soft);
          color: var(--rojo-soft);
          background: var(--rojo-bg);
        }
        .skill-catalog-primary {
          border: none;
          background: var(--azul);
          color: var(--blanco);
          box-shadow: 0 2px 8px rgba(0,119,183,.18);
        }
        .skill-catalog-primary:hover {
          background: var(--azul-hover);
          color: var(--blanco);
          box-shadow: 0 4px 12px rgba(0,119,183,.3);
          transform: translateY(-1px);
        }
        .skill-catalog-cancel:disabled,
        .skill-catalog-primary:disabled {
          opacity: .55;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
      `}</style>

      <div className="skill-catalog-card">
        <div className="skill-catalog-head">
          <span className="fw-bold text-white">
            Nueva Habilidad {tipo === "tecnica" ? "Técnica" : "Blanda"}
          </span>
          <button
            className="btn-close btn-close-white"
            onClick={onCancel}
            disabled={loading}
            aria-label="Cerrar modal"
          ></button>
        </div>

        <div className="p-4">
          {!confirmar ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="skill-catalog-label">
                  Nombre de la habilidad:
                </label>
                <input
                  type="text"
                  className={`form-control form-control-sm skill-catalog-input ${error ? "is-invalid" : ""}`}
                  placeholder="Ej: Inglés, AWS, Scrum..."
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    if (error) setError("");
                  }}
                  required
                  maxLength="40"
                  disabled={loading}
                />
                <div className="skill-catalog-hint">
                  No puede repetirse entre habilidades técnicas y blandas. {nombre.length}/40
                </div>
              </div>

              <div className="mb-3">
                <label className="skill-catalog-label">
                  Pequeña descripción (Máx 30 carac.):
                </label>
                <textarea
                  className="form-control form-control-sm skill-catalog-input"
                  rows="2"
                  maxLength="30"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Ej: Dominio de servicios cloud"
                  disabled={loading}
                />
                <div
                  className="text-end small text-muted"
                  style={{ fontSize: "10px" }}
                >
                  {desc.length}/30
                </div>
              </div>

              {error && <div className="skill-catalog-alert mb-3">{error}</div>}

              <div className="d-flex gap-2 justify-content-end pt-3 border-top">
                <button
                  type="button"
                  className="skill-catalog-cancel"
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="skill-catalog-primary"
                  disabled={loading}
                >
                  Crear en catálogo
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-2">
              <p className="mb-4 fw-semibold" style={{ color: "var(--gris-oscuro)" }}>
                ¿Estás seguro de crear{" "}
                <span className="text-azul">"{nombre}"</span> como habilidad {typeLabel(tipo)}?
              </p>

              {error && <div className="skill-catalog-alert mb-3 text-start">{error}</div>}

              <div className="d-flex gap-2">
                <button
                  className="skill-catalog-cancel w-100"
                  onClick={() => setConfirmar(false)}
                  disabled={loading}
                >
                  Atrás
                </button>
                <button
                  className="skill-catalog-primary w-100"
                  onClick={handleFinalConfirm}
                  disabled={loading}
                >
                  {loading ? "Creando..." : "Sí, crear"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
