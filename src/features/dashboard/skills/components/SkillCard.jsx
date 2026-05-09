import React from "react";
import { getSkillLevelColor, getSkillProgress } from "../model/skillLevel";

export default function SkillCard({ skill, onEdit, onDelete }) {
  const progress = getSkillProgress(skill.nivel);
  const color = getSkillLevelColor(skill.nivel);
  // Lógica de porcentajes basada en nivel
  const getProgress = (nivel) => {
    const levels = { basico: 25, intermedio: 50, avanzado: 75, experto: 100 };
    return levels[nivel.toLowerCase()] || 0;
  };

  const getLevelColor = (nivel) => {
    const colors = { basico: "#64748b", intermedio: "#16a34a", avanzado: "#2563eb", experto: "#7c3aed" };
    return colors[nivel.toLowerCase()] || "#var(--azul)";
  };

  const progress = getProgress(skill.nivel);
  const color = getLevelColor(skill.nivel);

  return (
    <div className="card border-0 shadow-sm mb-3 p-3" style={{ borderRadius: "12px", borderLeft: `5px solid ${color}` }}>
      <div className="d-flex justify-content-between align-items-start">
        <div className="flex-grow-1">
          <div className="d-flex align-items-center gap-2 mb-1">
            <h6 className="fw-bold mb-0" style={{ color: "#1e293b" }}>{skill.nombre_habilidad || skill.nombre}</h6>
          </div>
          
          <div className="d-flex justify-content-between mb-1 mt-2">
            <span className="text-muted text-capitalize small fw-semibold">{skill.nivel}</span>
            <span className="fw-bold small" style={{ color }}>{progress}%</span>
          </div>

          <div className="progress" style={{ height: "6px", backgroundColor: "#f1f5f9" }}>
            <div 
              className="progress-bar" 
              style={{ width: `${progress}%`, backgroundColor: color, borderRadius: "10px", transition: "width 1s ease-in-out" }}
            ></div>
          </div>
        </div>

        <div className="ms-3 d-flex gap-1">
          <button className="btn btn-sm btn-outline-primary border-0" onClick={() => onEdit(skill)}>Editar</button>
          <button className="btn btn-sm btn-outline-danger border-0" onClick={() => onDelete(skill.id)}>Borrar</button>
        </div>
      </div>
    </div>
  );
}
