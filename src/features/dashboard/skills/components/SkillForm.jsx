import React, { useState, useEffect } from "react";
import { getCatalogSkills } from "../services/skillService";
import SkillCatalogModal from "./SkillCatalogModal";

export default function SkillForm({ onSave, onCancel, editData }) {
  const [formData, setFormData] = useState({
    tipo: "tecnica",
    catalogo_habilidad_id: "",
    nombre_habilidad: "",
    nivel: "basico",
    es_visible: true, // CAMBIO: es_publico -> es_visible
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
      /**
       * CAMBIO 3.1: Sincronización Inicial Robusta.
       * Usamos 'es_visible' para mapear desde el objeto de edición.
       */
      setFormData({
        tipo: editData.tipo || "tecnica",
        catalogo_habilidad_id: editData.catalogo_habilidad_id || "",
        nombre_habilidad: editData.nombre || editData.nombre_habilidad || "",
        nivel: editData.nivel || "basico",
        // MEJORA: Forzamos booleano para que el switch de React reconozca 0/1 como false/true
        es_visible: Boolean(editData.es_visible), // CAMBIO: es_publico -> es_visible
      });
    }
  }, [editData]);

  const levelStyles = {
    basico: { color: "#64748b", bg: "#f1f5f9" },
    intermedio: { color: "#16a34a", bg: "#f0fdf4" },
    avanzado: { color: "#2563eb", bg: "#eff6ff" },
    experto: { color: "#7c3aed", bg: "#f5f3ff" }
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
      nombre_habilidad: skill.nombre 
    });
    setSuggestions([]);
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
      <div className="prf-modal-overlay" style={{ position: 'fixed', top:0, left:0, width:'100%', height:'100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1100, display:'flex', justifyContent:'center', alignItems:'center', backdropFilter: 'blur(2px)' }}>
        <div className="prf-modal-content p-0 shadow-lg" style={{ width: "90%", maxWidth: "500px", borderRadius: "12px", backgroundColor: "white", overflow: 'hidden' }}>
          
          {/* Header estilo Dashboard */}
          <div className="p-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: "#111827", borderBottom: "4px solid var(--azul)" }}>
            <span className="fw-bold text-white" style={{ fontSize: '1.1rem' }}>
              {editData ? "✏️ Editar Habilidad" : "➕ Registrar Habilidad"}
            </span>
            <button className="btn-close btn-close-white" onClick={onCancel} aria-label="Close"></button>
          </div>

          <form onSubmit={handleSubmit} className="p-4">
            {/* Selector de Tipo (Solo en modo creación) */}
            {!editData && (
              <div className="mb-4">
                <label className="form-label fw-bold small text-muted text-uppercase">Tipo de Habilidad</label>
                <div className="btn-group w-100 shadow-sm">
                  <input type="radio" className="btn-check" id="t-tec" checked={formData.tipo === "tecnica"} onChange={() => setFormData({...formData, tipo: "tecnica", catalogo_habilidad_id: "", nombre_habilidad: ""})} />
                  <label className="btn btn-outline-primary fw-bold" htmlFor="t-tec">🛠️ Técnica</label>
                  <input type="radio" className="btn-check" id="t-bla" checked={formData.tipo === "blanda"} onChange={() => setFormData({...formData, tipo: "blanda", catalogo_habilidad_id: "", nombre_habilidad: ""})} />
                  <label className="btn btn-outline-primary fw-bold" htmlFor="t-bla">🧠 Blanda</label>
                </div>
              </div>
            )}

            {/* Búsqueda / Nombre */}
            <div className="mb-4 position-relative">
              <label className="form-label fw-bold">Nombre de Habilidad *</label>
              <div className="input-group">
                <input 
                  type="text" 
                  className={`form-control ${errors.habilidad ? 'is-invalid' : ''}`}
                  placeholder="Escribe para buscar..."
                  value={formData.nombre_habilidad}
                  onChange={handleSearch}
                  disabled={!!editData} 
                />
                {!editData && (
                  <button type="button" className="btn btn-light border fw-bold text-primary" onClick={() => setShowCatalogModal(true)}>
                    + Nueva
                  </button>
                )}
              </div>
              {errors.habilidad && <div className="text-danger small mt-1">{errors.habilidad}</div>}
              
              {suggestions.length > 0 && (
                <ul className="list-group position-absolute w-100 shadow-lg" style={{ zIndex: 100, top: '100%' }}>
                  {suggestions.map(s => (
                    <li key={s.id} className="list-group-item list-group-item-action py-2" style={{ cursor: 'pointer' }} onClick={() => selectSkill(s)}>
                      {s.nombre}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Selector de Niveles Ovalados */}
            <div className="mb-4">
              <label className="form-label fw-bold small">Nivel de dominio</label>
              <div className="row g-2">
                {Object.keys(levelStyles).map(lvl => (
                  <div className="col-6" key={lvl}>
                    <div 
                      onClick={() => setFormData({...formData, nivel: lvl})}
                      style={{
                        cursor: 'pointer', padding: '10px', borderRadius: '25px',
                        textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'capitalize', transition: '0.2s',
                        border: formData.nivel === lvl ? `2px solid ${levelStyles[lvl].color}` : '1px solid #e2e8f0',
                        backgroundColor: formData.nivel === lvl ? levelStyles[lvl].bg : 'white',
                        color: formData.nivel === lvl ? levelStyles[lvl].color : '#64748b'
                      }}
                    >
                      {lvl}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Switch de Visibilidad Vinculado */}
            <div className="form-check form-switch mb-4 p-3 border rounded" style={{ backgroundColor: '#f8fafc' }}>
              <div className="d-flex justify-content-between align-items-center">
                <label className="form-check-label fw-bold text-muted small" htmlFor="v-switch">
                  {formData.es_visible ? '● PUBLICAR EN PERFIL' : '○ GUARDAR COMO PRIVADO'}
                </label>
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  role="switch"
                  id="v-switch" 
                  checked={formData.es_visible} 
                  onChange={(e) => setFormData({...formData, es_visible: e.target.checked})} 
                  style={{ cursor: 'pointer', width: '2.5em' }}
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="d-flex gap-2 justify-content-end pt-3 border-top">
              <button type="button" className="btn btn-light border px-4 fw-bold" onClick={onCancel} disabled={isSubmitting}>Cancelar</button>
              <button type="submit" className="btn btn-primary px-4 fw-bold shadow-sm" disabled={isSubmitting} style={{ backgroundColor: 'var(--azul)', border: 'none' }}>
                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
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