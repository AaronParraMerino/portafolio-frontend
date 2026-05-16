import React from "react";

export default function SkillCard({ skill, onEdit, onDelete }) {
  const getProgress = (nivel = "") => {
    const levels = { basico: 25, intermedio: 50, avanzado: 75, experto: 100 };
    return levels[String(nivel).toLowerCase()] || 0;
  };

  const getLevelColor = (nivel = "") => {
    const colors = {
      basico: "var(--gris-texto)",
      intermedio: "var(--verde-hover)",
      avanzado: "var(--azul)",
      experto: "var(--violeta-hover)",
    };
    return colors[String(nivel).toLowerCase()] || "var(--azul)";
  };

  const getLevelLabel = (nivel = "") => {
    const labels = {
      basico: "Básico",
      intermedio: "Intermedio",
      avanzado: "Avanzado",
      experto: "Experto",
    };
    return labels[String(nivel).toLowerCase()] || nivel || "Sin nivel";
  };

  const progress = getProgress(skill.nivel);
  const color = getLevelColor(skill.nivel);

  return (
    <>
      <style>{`
        .skill-card-action {
          padding: 6px 12px;
          border-radius: 6px;
          border: 1.5px solid var(--gris-borde);
          background: var(--blanco);
          color: var(--gris-oscuro);
          font-family: var(--font);
          font-size: .82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all .15s ease;
          white-space: nowrap;
        }
        .skill-card-action:hover {
          transform: translateY(-1px);
        }
        .skill-card-edit:hover {
          color: var(--amarillo-hover);
          border-color: var(--amarillo);
          background: var(--amarillo-chip);
          box-shadow: 0 3px 10px rgba(251,191,36,.18);
        }
        .skill-card-delete:hover {
          color: var(--rojo-soft);
          border-color: var(--rojo-soft);
          background: var(--rojo-chip);
          box-shadow: 0 3px 10px rgba(232,85,85,.14);
        }
      `}</style>

      <div
        className="card shadow-sm mb-3 p-3"
        style={{
          borderRadius: "12px",
          border: "1px solid var(--gris-borde)",
          borderLeft: `5px solid ${color}`,
          background: "var(--blanco)",
        }}
      >
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2 mb-1">
              <h6 className="fw-bold mb-0" style={{ color: "var(--negro-texto)" }}>
                {skill.nombre_habilidad || skill.nombre}
              </h6>
            </div>

            <div className="d-flex justify-content-between mb-1 mt-2">
              <span className="text-muted small fw-semibold">{getLevelLabel(skill.nivel)}</span>
              <span className="fw-bold small" style={{ color }}>{progress}%</span>
            </div>

            <div className="progress" style={{ height: "6px", backgroundColor: "var(--fondo)" }}>
              <div
                className="progress-bar"
                style={{ width: `${progress}%`, backgroundColor: color, borderRadius: "10px", transition: "width 1s ease-in-out" }}
              ></div>
            </div>
          </div>

          <div className="ms-3 d-flex gap-2">
            <button
              className="skill-card-action skill-card-edit"
              onClick={() => onEdit(skill)}
              title="Editar"
              aria-label="Editar habilidad"
            >
              Editar
            </button>
            <button
              className="skill-card-action skill-card-delete"
              onClick={() => onDelete(skill.id)}
              title="Eliminar"
              aria-label="Eliminar habilidad"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

