import React, { useState, useEffect, useCallback } from "react";
import SkillForm from "../components/SkillForm";
import {
  getUserSkills,
  addUserSkill,
  updateUserSkill,
  deleteUserSkill,
  createCatalogSkill,
} from "../services/skillService";
import ExperienceToast from "../../experience/components/ExperienceToast";
import ConfirmModal from "../../../../shared/ui/ConfirmModal";

export default function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [toast, setToast] = useState(null);

  const [confirmConfig, setConfirmConfig] = useState({
    open: false,
    title: "",
    message: "",
    variant: "blue",
    icon: "check",
    onConfirm: () => {},
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

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  const handleSaveRequest = async (formData) => {
    try {
      let skillIdFromCatalog = formData.catalogo_habilidad_id;

      if (!skillIdFromCatalog) {
        const newCatalogSkill = await createCatalogSkill(
          formData.nombre_habilidad,
          formData.tipo,
          formData.descripcion_nueva || ""
        );
        skillIdFromCatalog = newCatalogSkill.id;
      }

      if (modalMode === "edit") {
        console.log('🔄 EDIT MODE: enviando a updateUserSkill:', {
          id: selectedSkill.id,
          nivel: formData.nivel,
          es_visible: formData.es_visible,
          tipo: typeof formData.es_visible,
        });

        const updated = await updateUserSkill(
          selectedSkill.id,
          formData.nivel,
          formData.es_visible
        );

        console.log('✅ Respuesta del backend:', updated);

        /**
         * FIX 3: Comparamos ambos ids como Number para evitar fallos string vs number.
         * Si el back devuelve un id distinto al esperado, caemos en fallback:
         * actualizamos igualmente con los campos del formData para que la UI
         * refleje el cambio aunque el id tuviera alguna inconsistencia.
         */
        setSkills((prev) => {
          const selectedId = Number(selectedSkill.id);
          const updatedId = Number(updated?.id);

          console.log('🔍 Comparando IDs:', { selectedId, updatedId, match: selectedId === updatedId });

          // Caso normal: el back devolvió el objeto actualizado con id correcto
          if (updatedId && updatedId === selectedId) {
            console.log('✓ Usando respuesta del backend directamente');
            return prev.map((s) => (Number(s.id) === selectedId ? updated : s));
          }

          // Fallback: actualizamos manualmente con los campos que conocemos
          // Esto cubre el caso en que el back devuelva estructura inesperada
          console.log('⚠️ Usando fallback con formData');
          return prev.map((s) => {
            if (Number(s.id) !== selectedId) return s;
            return {
              ...s,
              nivel: formData.nivel,
              es_visible: Boolean(formData.es_visible),
            };
          });
        });

        showToast("Habilidad actualizada", "ok");
      } else {
        const created = await addUserSkill(
          skillIdFromCatalog,
          formData.nivel,
          formData.es_visible
        );
        setSkills((prev) => [created, ...prev]);
        showToast("Habilidad añadida", "ok");
      }

      setModalMode(null);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteRequest = (id) => {
    setConfirmConfig({
      open: true,
      title: "¿Eliminar Habilidad?",
      message: "Esta acción quitará la habilidad de tu perfil. ¿Deseas continuar?",
      variant: "red",
      icon: "warning",
      onConfirm: async () => {
        try {
          await deleteUserSkill(id);
          setSkills((prev) => prev.filter((s) => Number(s.id) !== Number(id)));
          showToast("Habilidad eliminada", "ok");
        } catch (err) {
          showToast("Error al eliminar", "error");
        }
        setConfirmConfig((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const tecnicas = skills.filter((s) => s.tipo === "tecnica");
  const blandas = skills.filter((s) => s.tipo === "blanda");

  return (
    <>
      <style>{`
        .custom-breadcrumb-bar {
          background-color: #111827;
          padding: 1.2rem 2.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 4px solid var(--azul);
        }
        .bc-text { color: #6b7280; font-size: 0.85rem; margin: 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
        .bc-active { color: #ffffff; font-weight: 800; font-size: 1.4rem; margin: 0; }
        
        .skill-long-card {
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          border-left: 6px solid var(--azul);
          padding: 1.2rem;
          margin-bottom: 1rem;
          transition: all 0.2s ease;
        }
        .skill-long-card:hover { transform: translateX(4px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        
        .section-divider {
          font-weight: 800; color: #1e293b; text-transform: uppercase;
          letter-spacing: 1px; margin: 2rem 0 1rem 0; display: flex; align-items: center; gap: 10px;
        }
        .section-divider::after { content: ""; flex: 1; height: 1px; background: #cbd5e1; }

        .level-circle-badge {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: white;
          font-weight: 800;
          font-size: 0.7rem;
          text-transform: uppercase;
        }

        .visibility-tag {
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 2px 8px;
          border-radius: 4px;
        }
        .tag-public { color: #16a34a; background: #f0fdf4; }
        .tag-private { color: #64748b; background: #f8fafc; }

        .btn-action-dash {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          transition: all 0.2s;
          color: #475569;
          border-radius: 8px;
        }
        .btn-edit:hover { color: #2563eb; border-color: #2563eb; background: #eff6ff; }
        .btn-delete:hover { color: #dc2626; border-color: #dc2626; background: #fef2f2; }
      `}</style>

      <div className="custom-breadcrumb-bar shadow">
        <div>
          <p className="bc-text">Portafolio</p>
          <h2 className="bc-active">HABILIDADES</h2>
        </div>
        <button
          className="btn btn-primary px-4 py-2 fw-bold shadow-sm"
          style={{ backgroundColor: "var(--azul)", border: "none", borderRadius: "8px" }}
          onClick={() => {
            setSelectedSkill(null);
            setModalMode("add");
          }}
        >
          ➕ Agregar Habilidad
        </button>
      </div>

      <div className="container-fluid p-4" style={{ minHeight: "100vh", background: "#f8fafc" }}>
        <div className="row justify-content-center">
          <div className="col-12 col-xl-10">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary"></div>
              </div>
            ) : (
              <>
                <h5 className="section-divider">🛠️ Habilidades Técnicas</h5>
                {tecnicas.length === 0 ? (
                  <p className="text-muted small ms-2">No has registrado habilidades técnicas aún.</p>
                ) : (
                  tecnicas.map((s) => (
                    <SkillLongRow
                      key={s.id}
                      skill={s}
                      onEdit={(sk) => { setSelectedSkill(sk); setModalMode("edit"); }}
                      onDelete={handleDeleteRequest}
                    />
                  ))
                )}

                <h5 className="section-divider">🧠 Habilidades Blandas</h5>
                {blandas.length === 0 ? (
                  <p className="text-muted small ms-2">No hay registros de habilidades blandas.</p>
                ) : (
                  blandas.map((s) => (
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

      <ConfirmModal
        {...confirmConfig}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, open: false }))}
      />

      {modalMode && (
        <SkillForm
          onSave={handleSaveRequest}
          onCancel={() => setModalMode(null)}
          editData={selectedSkill}
        />
      )}

      <ExperienceToast toast={toast} />
    </>
  );
}

function SkillLongRow({ skill, onEdit, onDelete }) {
  const levels = {
    basico: { p: 30, c: "#64748b", n: "BAS" },
    intermedio: { p: 60, c: "#16a34a", n: "INT" },
    avanzado: { p: 85, c: "#2563eb", n: "AVZ" },
    experto: { p: 100, c: "#7c3aed", n: "EXP" },
  };
  const current = levels[skill.nivel] || { p: 0, c: "#ccc", n: "---" };

  return (
    <div className="skill-long-card d-flex align-items-center justify-content-between flex-wrap gap-3">
      {/* INFO PRINCIPAL */}
      <div className="d-flex align-items-center gap-3" style={{ minWidth: "250px", flex: "1" }}>
        <div className="level-circle-badge" style={{ backgroundColor: current.c }}>
          {current.n}
        </div>
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h6 className="fw-bold mb-0" style={{ color: "#1e293b" }}>
              {skill.nombre}
            </h6>
            <span className={`visibility-tag ${skill.es_visible ? "tag-public" : "tag-private"}`}>
              {skill.es_visible ? "● Público" : "○ Privado"}
            </span>
          </div>
          <p className="text-muted mb-0 small">
            {skill.descripcion || "Sin descripción adicional."}
          </p>
        </div>
      </div>

      {/* BARRA DE PROGRESO */}
      <div className="flex-grow-1 mx-md-4" style={{ minWidth: "200px", maxWidth: "400px" }}>
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span className="text-muted fw-bold" style={{ fontSize: "10px" }}>DOMINIO</span>
          <span className="small fw-bold" style={{ color: "#475569" }}>{current.p}%</span>
        </div>
        <div className="progress" style={{ height: "8px", backgroundColor: "#e2e8f0", borderRadius: "10px" }}>
          <div
            className="progress-bar"
            style={{
              width: `${current.p}%`,
              backgroundColor: current.c,
              borderRadius: "10px",
              transition: "width 1s ease",
            }}
          ></div>
        </div>
      </div>

      {/* ACCIONES */}
      <div className="d-flex gap-2">
        <button onClick={() => onEdit(skill)} className="btn-action-dash btn-edit" title="Editar">
          ✎
        </button>
        <button onClick={() => onDelete(skill.id)} className="btn-action-dash btn-delete" title="Eliminar">
          🗑️
        </button>
      </div>
    </div>
  );
}

