import React, { useState, useEffect, useCallback } from "react";
import { FiPlus } from "react-icons/fi";
import SkillForm from "../components/SkillForm";
import { 
  getUserSkills, 
  addUserSkill, 
  updateUserSkill, 
  deleteUserSkill,
  createCatalogSkill 
} from "../services/skillService";
import ExperienceToast from "../../experience/components/ExperienceToast";
// Importamos el modal compartido sugerido por tu compañero
import ConfirmModal from "../../../../shared/ui/ConfirmModal";
import Header from "../../layout/Header";

export default function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState(null); // 'add' o 'edit'
  const [selectedSkill, setSelectedSkill] = useState(null);
  
  // Estado para el Toast (Notificaciones)
  const [toast, setToast] = useState(null);
  
  // Estado para el ConfirmModal compartido
  const [confirmConfig, setConfirmConfig] = useState({
    open: false,
    title: "",
    message: "",
    variant: "blue",
    icon: "check",
    onConfirm: () => {}
  });

  const showToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const loadSkills = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUserSkills();
      setSkills(data);
    } catch (err) {
      showToast("Error al cargar las habilidades", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSkills(); }, [loadSkills]);

  const handleSaveRequest = async (formData) => {
    try {
      let skillIdFromCatalog = formData.catalogo_habilidad_id;

      // Si es una habilidad nueva (no está en el catálogo), se crea primero
      if (!skillIdFromCatalog) {
        const newCatalogSkill = await createCatalogSkill(
          formData.nombre_habilidad, 
          formData.tipo,
          formData.descripcion_nueva // Usamos la descripción del form
        );
        skillIdFromCatalog = newCatalogSkill.id;
      }

      if (modalMode === "edit") {
        await updateUserSkill(selectedSkill.id, formData.nivel, formData.es_publico);
        showToast("Habilidad actualizada con éxito", "ok");
      } else {
        await addUserSkill(skillIdFromCatalog, formData.nivel, formData.es_publico);
        showToast("Habilidad añadida a tu perfil", "ok");
      }

      setModalMode(null);
      loadSkills();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteRequest = (id) => {
    setConfirmConfig({
      open: true,
      title: "¿Eliminar Habilidad?",
      message: "Esta acción quitará la habilidad de tu perfil público y privado. ¿Deseas continuar?",
      variant: "red",
      icon: "warning",
      onConfirm: async () => {
        try {
          await deleteUserSkill(id);
          showToast("Habilidad eliminada", "ok");
          loadSkills();
        } catch (err) {
          showToast("Error al eliminar", "error");
        }
        setConfirmConfig(prev => ({ ...prev, open: false }));
      }
    });
  };

  const tecnicas = skills.filter(s => s.tipo === 'tecnica');
  const blandas = skills.filter(s => s.tipo === 'blanda');

  return (
    <>
      <style>{`
        .skill-long-card {
          background: white;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          border-left: 5px solid var(--azul);
          padding: 1.2rem;
          margin-bottom: 1rem;
          transition: 0.2s;
        }
        .skill-long-card:hover { transform: translateX(5px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        
        .section-divider {
          font-weight: 800; color: #1e293b; text-transform: uppercase;
          letter-spacing: 1px; margin: 2rem 0 1rem 0; display: flex; align-items: center; gap: 10px;
        }
        .section-divider::after { content: ""; flex: 1; height: 1px; background: #cbd5e1; }

        .level-square-badge {
          padding: 4px 10px;
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          border-radius: 0px !important; /* Cuadrado sin puntas */
          color: white;
          display: inline-block;
          letter-spacing: 0.5px;
        }

        .btn-action-outline {
          border: 1.5px solid #e2e8f0;
          background: white;
          transition: all 0.2s;
        }
        .btn-action-outline:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }
      `}</style>

      <Header
        title="Habilidades"
        actions={[
          {
            label: "Agregar habilidad",
            title: "Agregar habilidad",
            icon: <FiPlus />,
            onClick: () => { setSelectedSkill(null); setModalMode("add"); },
          },
        ]}
      />
      <div className="container-fluid p-4" style={{ minHeight: "100vh", background: "#f1f5f9" }}>
        <div className="row justify-content-center">
          <div className="col-12 col-xl-10">
            {loading ? (
              <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
            ) : (
              <>
                <h5 className="section-divider">🛠️ Habilidades Técnicas</h5>
                {tecnicas.length === 0 ? <p className="text-muted small">No hay registros.</p> : (
                  tecnicas.map(s => (
                    <SkillLongRow 
                      key={s.id} 
                      skill={s} 
                      onEdit={(sk) => { setSelectedSkill(sk); setModalMode("edit"); }} 
                      onDelete={handleDeleteRequest} 
                    />
                  ))
                )}

                <h5 className="section-divider">🧠 Habilidades Blandas</h5>
                {blandas.length === 0 ? <p className="text-muted small">No hay registros.</p> : (
                  blandas.map(s => (
                    <SkillLongRow 
                      key={s.id} 
                      skill={s} 
                      onEdit={(sk) => { setSelectedSkill(sk); setModalMode("edit"); }} 
                      onDelete={handleDeleteRequest} 
                    />
                  ))
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Confirmación Compartido */}
      <ConfirmModal 
        {...confirmConfig}
        onClose={() => setConfirmConfig(prev => ({ ...prev, open: false }))}
      />

      {/* Formulario Modal */}
      {modalMode && (
        <SkillForm 
          onSave={handleSaveRequest} 
          onCancel={() => setModalMode(null)} 
          editData={selectedSkill} 
        />
      )}

      {/* Toast de Experiencia para notificaciones */}
      <ExperienceToast toast={toast} />
    </>
  );
}

function SkillLongRow({ skill, onEdit, onDelete }) {
  const levels = { 
    basico: { p: 30, c: "#64748b" }, 
    intermedio: { p: 60, c: "#16a34a" }, 
    avanzado: { p: 85, c: "#2563eb" }, 
    experto: { p: 100, c: "#7c3aed" } 
  };
  const current = levels[skill.nivel] || { p: 0, c: "#ccc" };

  return (
    <div className="skill-long-card d-flex align-items-center justify-content-between flex-wrap gap-3">
      {/* Nombre y Descripción extraída del Service */}
      <div style={{ minWidth: "220px", flex: "1 0 200px" }}>
        <div className="d-flex align-items-center gap-2 mb-1">
          <h6 className="fw-bold mb-0" style={{ color: "#1e293b", fontSize: '1.05rem' }}>{skill.nombre}</h6>
          <span className={`badge ${skill.es_publico ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`} style={{ fontSize: '9px' }}>
            {skill.es_publico ? 'PÚBLICO' : 'PRIVADO'}
          </span>
        </div>
        <p className="text-muted mb-0" style={{ fontSize: '0.82rem', lineHeight: '1.2' }}>
          {skill.descripcion || "Sin descripción disponible."}
        </p>
      </div>

      {/* Barra de Progreso y Nivel Cuadrado */}
      <div className="flex-grow-1 mx-md-4" style={{ minWidth: "280px" }}>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="d-flex align-items-center gap-2">
            <div className="level-square-badge" style={{ backgroundColor: current.c }}>
              {skill.nivel}
            </div>
            <span className="small fw-bold" style={{ color: "#475569" }}>{current.p}%</span>
          </div>
          <span className="small text-muted fw-bold" style={{ fontSize: '10px', textTransform: 'uppercase' }}>Dominio</span>
        </div>
        <div className="progress" style={{ height: "8px", backgroundColor: "#e2e8f0", borderRadius: "20px" }}>
          <div 
            className="progress-bar" 
            style={{ 
                width: `${current.p}%`, 
                backgroundColor: current.c, 
                borderRadius: "20px",
                transition: 'width 1s ease'
            }}
          ></div>
        </div>
      </div>

      {/* Botones con Bordes Visibles */}
      <div className="d-flex gap-2">
        <button 
          onClick={() => onEdit(skill)} 
          className="btn btn-sm btn-action-outline text-primary shadow-sm" 
          title="Editar habilidad"
        >
          ✏️ <span className="d-none d-xxl-inline ms-1">Editar</span>
        </button>
        <button 
          onClick={() => onDelete(skill.id)} 
          className="btn btn-sm btn-action-outline text-danger shadow-sm" 
          title="Eliminar habilidad"
        >
          🗑️ <span className="d-none d-xxl-inline ms-1">Borrar</span>
        </button>
      </div>
    </div>
  );
}
