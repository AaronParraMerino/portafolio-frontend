import React, { useState, useEffect } from "react";
import { getCatalogSkills } from "../services/skillService";
import SkillCatalogModal from "./SkillCatalogModal";

export default function SkillForm({ onSave, onCancel, editData }) {
  const [formData, setFormData] = useState({
    tipo: "tecnica",
    catalogo_habilidad_id: "",
    nombre_habilidad: "",
    nivel: "basico",
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
        setCatalog(data);
      } catch (err) {
        console.error("Error cargando catálogo", err);
      }
    };
    loadCatalog();

    if (editData) {
      setFormData({
        tipo: editData.tipo || "tecnica",
        catalogo_habilidad_id: editData.catalogo_habilidad_id || "",
        nombre_habilidad: editData.nombre || editData.nombre_habilidad || "",
        nivel: editData.nivel || "basico",
      });
    }
  }, [editData]);

  const levelStyles = {
    basico: { color: "var(--gris-texto)", bg: "var(--fondo)" },
    intermedio: { color: "var(--verde-hover)", bg: "var(--verde-chip)" },
    avanzado: { color: "var(--azul)", bg: "var(--azul-light)" },
    experto: { color: "var(--violeta-hover)", bg: "var(--violeta-chip)" },
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, nombre_habilidad: value, catalogo_habilidad_id: "" });

    if (value.trim().length > 0) {
      const filtered = catalog.filter(s =>
        s.tipo === formData.tipo &&
        s.nombre.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const selectSkill = (skill) => {
    setFormData({
      ...formData,
      catalogo_habilidad_id: skill.id,
      nombre_habilidad: skill.nombre,
    });
    setSuggestions([]);
    setErrors({});
  };

  const handleCreatedInCatalog = (newSkill) => {
    setCatalog([...catalog, newSkill]);
    selectSkill(newSkill);
    setShowCatalogModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.catalogo_habilidad_id && !editData) {
      setErrors({ habilidad: "Debes seleccionar una habilidad del catálogo o crear una nueva." });
      return;
    }
    setIsSubmitting(true);
    await onSave(formData);
    setIsSubmitting(false);
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
                    onChange={() => setFormData({ ...formData, tipo: "tecnica", catalogo_habilidad_id: "", nombre_habilidad: "" })}
                  />
                  <label className="btn btn-outline-primary skill-type-label" htmlFor="t-tec">Técnica</label>
                  <input
                    type="radio"
                    className="btn-check"
                    id="t-bla"
                    checked={formData.tipo === "blanda"}
                    onChange={() => setFormData({ ...formData, tipo: "blanda", catalogo_habilidad_id: "", nombre_habilidad: "" })}
                  />
                  <label className="btn btn-outline-primary skill-type-label" htmlFor="t-bla">Blanda</label>
                </div>
              </div>
            )}

            <div className="mb-4 position-relative">
              <label className="form-label fw-bold">Nombre de Habilidad *</label>
              <div className="input-group">
                <input
                  type="text"
                  className={`form-control skill-input ${errors.habilidad ? "is-invalid" : ""}`}
                  placeholder="Escribe para buscar..."
                  value={formData.nombre_habilidad}
                  onChange={handleSearch}
                  disabled={!!editData}
                />
                {!editData && (
                  <button
                    type="button"
                    className="btn skill-new-btn"
                    onClick={() => setShowCatalogModal(true)}
                  >
                    + Nueva
                  </button>
                )}
              </div>
              {errors.habilidad && <div className="text-danger small mt-1">{errors.habilidad}</div>}

              {suggestions.length > 0 && (
                <ul className="list-group position-absolute w-100 shadow-lg" style={{ zIndex: 100, top: "100%" }}>
                  {suggestions.map(s => (
                    <li
                      key={s.id}
                      className="list-group-item list-group-item-action py-2"
                      style={{ cursor: "pointer" }}
                      onClick={() => selectSkill(s)}
                    >
                      {s.nombre}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold small">Nivel de dominio</label>
              <div className="row g-2">
                {Object.keys(levelStyles).map(lvl => (
                  <div className="col-6" key={lvl}>
                    <div
                      onClick={() => setFormData({ ...formData, nivel: lvl })}
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
          onSave={handleCreatedInCatalog}
          onCancel={() => setShowCatalogModal(false)}
        />
      )}
    </>
  );
}

