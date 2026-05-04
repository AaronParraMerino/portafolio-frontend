import React, { useState } from "react";
import { createCatalogSkill } from "../services/skillService";

export default function SkillCatalogModal({ tipo, onSave, onCancel }) {
  const [nombre, setNombre] = useState("");
  const [desc, setDesc] = useState("");
  const [confirmar, setConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setError("");
    setConfirmar(true);
  };

  const handleFinalConfirm = async () => {
    try {
      setLoading(true);
      setError("");

      const nuevaHabilidad = await createCatalogSkill(
        nombre.trim(),
        tipo,
        desc.trim()
      );

      onSave(nuevaHabilidad);
    } catch (err) {
      setError(err.message || "Error al crear habilidad en catálogo");
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
          width: 350px;
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
                <label className="form-label small fw-bold">
                  Nombre de la habilidad:
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm skill-catalog-input"
                  placeholder="Ej: AWS, Scrum..."
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">
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

              {error && (
                <div className="alert alert-danger py-2 small">
                  {error}
                </div>
              )}

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
                <span className="text-azul">"{nombre}"</span> en el catálogo general?
              </p>

              {error && (
                <div className="alert alert-danger py-2 small text-start">
                  {error}
                </div>
              )}

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

