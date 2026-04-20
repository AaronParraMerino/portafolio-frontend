import React, { useState } from "react";

export default function SkillCatalogModal({ tipo, onSave, onCancel }) {
  const [nombre, setNombre] = useState("");
  const [desc, setDesc] = useState("");
  const [confirmar, setConfirmar] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setConfirmar(true); // Activamos el paso de confirmación
  };

  const handleFinalConfirm = () => {
    onSave({ nombre, descripcion: desc, tipo });
  };

  return (
    <div className="prf-modal-overlay" style={{ zIndex: 1200, backgroundColor: "rgba(0,0,0,0.6)", position: 'fixed', top:0, left:0, width:'100%', height:'100%', display:'flex', justifyContent:'center', alignItems:'center' }}>
      <div className="bg-white rounded-3 shadow-lg p-0" style={{ width: "350px", overflow: "hidden" }}>
        
        <div className="p-3 border-bottom bg-light d-flex justify-content-between align-items-center">
          <span className="fw-bold text-dark">✨ Nueva Habilidad {tipo === 'tecnica' ? 'Técnica' : 'Blanda'}</span>
          <button className="btn-close" onClick={onCancel}></button>
        </div>

        <div className="p-4">
          {!confirmar ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-bold">Nombre de la habilidad:</label>
                <input 
                  type="text" 
                  className="form-control form-control-sm"
                  placeholder="Ej: AWS, Scrum..."
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Pequeña descripción (Máx 30 carac.):</label>
                <textarea 
                  className="form-control form-control-sm"
                  rows="2"
                  maxLength="30"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Ej: Dominio de servicios cloud"
                />
                <div className="text-end small text-muted" style={{ fontSize: '10px' }}>
                  {desc.length}/30
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-100 fw-bold shadow-sm">Crear en catálogo</button>
            </form>
          ) : (
            <div className="text-center py-2">
              <p className="mb-4 fw-semibold">¿Estás seguro de crear <span className="text-primary">"{nombre}"</span> en el catálogo general?</p>
              <div className="d-flex gap-2">
                <button className="btn btn-light border w-100" onClick={() => setConfirmar(false)}>Atrás</button>
                <button className="btn btn-primary w-100 fw-bold" onClick={handleFinalConfirm}>Sí, crear</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}