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

const normalizeSkillName = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

const getSkillName = (skill) =>
  skill?.nombre ?? skill?.nombre_habilidad ?? skill?.habilidad?.nombre ?? "";

export default function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [toast, setToast] = useState(null);

  const [confirmConfig, setConfirmConfig] = useState({
    open: false,
    title: "",
    subtitle: "",
    message: "",
    confirmLabel: "Confirmar",
    cancelLabel: "Cancelar",
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

      if (modalMode !== "edit") {
        const duplicateOwned = skills.some(
          (skill) => normalizeSkillName(getSkillName(skill)) === normalizeSkillName(formData.nombre_habilidad)
        );

        if (duplicateOwned) {
          showToast(`Ya tienes "${formData.nombre_habilidad}" registrada en tu perfil.`, "error");
          return;
        }
      }

      if (modalMode === "edit") {
        const updated = await updateUserSkill(
          selectedSkill.id,
          formData.nivel
        );

        setSkills((prev) => {
          const selectedId = Number(selectedSkill.id);
          const updatedId = Number(updated?.id);

          if (updatedId && updatedId === selectedId) {
            return prev.map((s) => (Number(s.id) === selectedId ? updated : s));
          }

          return prev.map((s) => {
            if (Number(s.id) !== selectedId) return s;
            return {
              ...s,
              nivel: formData.nivel,
            };
          });
        });

        showToast("Habilidad actualizada", "ok");
      } else {
        const created = await addUserSkill(
          skillIdFromCatalog,
          formData.nivel
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
    const skill = skills.find((s) => Number(s.id) === Number(id));

    setConfirmConfig({
      open: true,
      title: "Eliminar habilidad",
      subtitle: "Esta acción no se puede deshacer.",
      message: `Estás por quitar "${skill?.nombre || skill?.nombre_habilidad || "esta habilidad"}" de tu perfil. ¿Deseas continuar?`,
      confirmLabel: "Sí, eliminar",
      cancelLabel: "Cancelar",
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

  const openAddModal = () => {
    setSelectedSkill(null);
    setModalMode("add");
  };

  const tecnicas = skills.filter((s) => s.tipo === "tecnica");
  const blandas = skills.filter((s) => s.tipo === "blanda");

  return (
    <>
      <style>{`
        .custom-breadcrumb-bar {
          background-color: var(--negro-texto);
          padding: 1.2rem 2.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 4px solid var(--azul);
          font-family: var(--font);
        }
        .bc-text {
          color: var(--gris-texto);
          font-size: 0.85rem;
          margin: 0;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .bc-active {
          color: var(--blanco);
          font-weight: 800;
          font-size: 1.4rem;
          margin: 0;
        }

        .skill-page-body {
          min-height: calc(100vh - var(--nav-height, 60px));
          background: var(--fondo);
          font-family: var(--font);
        }

        .skill-add-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 18px;
          border-radius: 8px;
          border: none;
          background: var(--azul);
          color: var(--blanco);
          font-family: var(--font);
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          transition: all .15s ease;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0, 119, 183, .18);
        }
        .skill-add-btn:hover {
          background: var(--azul-hover);
          color: var(--blanco);
          box-shadow: 0 4px 12px rgba(0, 119, 183, .3);
          transform: translateY(-1px);
        }
        .skill-add-btn:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px var(--azul-glow), 0 4px 12px rgba(0, 119, 183, .25);
        }

        .skill-long-card {
          background: var(--blanco);
          border-radius: 16px;
          border: 1px solid var(--gris-borde);
          border-left: 6px solid var(--azul);
          padding: 1.2rem;
          margin-bottom: 1rem;
          transition: all 0.2s ease;
          box-shadow: 0 1px 4px rgba(0,0,0,.04);
        }
        .skill-long-card:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .section-divider {
          font-weight: 800;
          color: var(--negro-texto);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 2rem 0 1rem 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .section-divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: var(--gris-borde);
        }

        .level-circle-badge {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: var(--blanco);
          font-weight: 800;
          font-size: 0.7rem;
          text-transform: uppercase;
          flex-shrink: 0;
        }

        .btn-action-skill {
          padding: 6px 12px;
          border-radius: 6px;
          border: 1.5px solid var(--gris-borde);
          background: var(--blanco);
          color: var(--gris-oscuro);
          font-family: var(--font);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .btn-action-skill:hover {
          transform: translateY(-1px);
        }
        .btn-edit:hover {
          color: var(--amarillo-hover);
          border-color: var(--amarillo);
          background: var(--amarillo-chip);
          box-shadow: 0 3px 10px rgba(251,191,36,.18);
        }
        .btn-delete:hover {
          color: var(--rojo-soft);
          border-color: var(--rojo-soft);
          background: var(--rojo-chip);
          box-shadow: 0 3px 10px rgba(232,85,85,.14);
        }

        .skill-empty-state {
          margin: 2.2rem auto 0;
          max-width: 680px;
          background: var(--blanco);
          border: 1.5px solid var(--gris-borde);
          border-radius: 18px;
          padding: 2.2rem 2rem;
          text-align: center;
          box-shadow: 0 8px 24px rgba(0,0,0,.05);
          position: relative;
          overflow: hidden;
        }
        .skill-empty-state::before {
          content: "";
          position: absolute;
          inset: 0 0 auto 0;
          height: 5px;
          background: linear-gradient(90deg, var(--azul), var(--azul-mid));
        }
        .skill-empty-icon {
          width: 56px;
          height: 56px;
          margin: 0 auto 14px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--azul-light);
          border: 1.5px solid var(--azul-mid);
          color: var(--azul);
          font-size: 1.45rem;
          font-weight: 800;
        }
        .skill-empty-title {
          margin: 0;
          color: var(--negro-texto);
          font-size: clamp(1.15rem, 2vw, 1.45rem);
          font-weight: 800;
          letter-spacing: -.02em;
        }
        .skill-empty-text {
          max-width: 480px;
          margin: .55rem auto 1.35rem;
          color: var(--gris-texto);
          font-size: .95rem;
          line-height: 1.55;
        }
        .skill-empty-chips {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 1.45rem;
        }
        .skill-empty-chip {
          padding: 5px 10px;
          border-radius: 999px;
          border: 1px solid var(--gris-borde);
          background: var(--fondo);
          color: var(--gris-oscuro);
          font-size: .75rem;
          font-weight: 700;
        }

        @media (max-width: 640px) {
          .custom-breadcrumb-bar {
            padding: 1rem;
            align-items: flex-start;
            flex-direction: column;
            gap: 12px;
          }
          .skill-add-btn {
            width: 100%;
          }
        }
      `}</style>

      <div className="custom-breadcrumb-bar shadow">
        <div>
          <p className="bc-text">Portafolio</p>
          <h2 className="bc-active">HABILIDADES</h2>
        </div>
        <button
          className="skill-add-btn"
          onClick={openAddModal}
        >
          + Agregar Habilidad
        </button>
      </div>

      <div className="container-fluid p-4 skill-page-body">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-10">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary"></div>
              </div>
            ) : skills.length === 0 ? (
              <SkillEmptyState onAdd={openAddModal} />
            ) : (
              <>
                <h5 className="section-divider">Habilidades Técnicas</h5>
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

                <h5 className="section-divider">Habilidades Blandas</h5>
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
          userSkills={skills}
        />
      )}

      <ExperienceToast toast={toast} />
    </>
  );
}

function SkillEmptyState({ onAdd }) {
  return (
    <div className="skill-empty-state">
      <div className="skill-empty-icon">✦</div>
      <h3 className="skill-empty-title">Aún no tienes habilidades registradas</h3>
      <p className="skill-empty-text">
        Agrega habilidades técnicas o blandas para completar tu perfil profesional y mostrar tus fortalezas.
      </p>
      <div className="skill-empty-chips" aria-hidden="true">
        <span className="skill-empty-chip">Técnicas</span>
        <span className="skill-empty-chip">Blandas</span>
        <span className="skill-empty-chip">Nivel de dominio</span>
      </div>
      <button type="button" className="skill-add-btn" onClick={onAdd}>
        + Agregar Habilidad
      </button>
    </div>
  );
}

function SkillLongRow({ skill, onEdit, onDelete }) {
  const levels = {
    basico: { p: 25, c: "var(--gris-texto)", n: "BAS" },
    intermedio: { p: 50, c: "var(--verde-hover)", n: "INT" },
    avanzado: { p: 75, c: "var(--azul)", n: "AVZ" },
    experto: { p: 100, c: "var(--violeta-hover)", n: "EXP" },
  };
  const current = levels[skill.nivel] || { p: 0, c: "var(--gris-borde)", n: "---" };

  return (
    <div className="skill-long-card d-flex align-items-center justify-content-between flex-wrap gap-3">
      <div className="d-flex align-items-center gap-3" style={{ minWidth: "250px", flex: "1" }}>
        <div className="level-circle-badge" style={{ backgroundColor: current.c }}>
          {current.n}
        </div>
        <div>
          <h6 className="fw-bold mb-0" style={{ color: "var(--negro-texto)" }}>
            {skill.nombre || skill.nombre_habilidad}
          </h6>
          <p className="text-muted mb-0 small">
            {skill.descripcion || "Sin descripción adicional."}
          </p>
        </div>
      </div>

      <div className="flex-grow-1 mx-md-4" style={{ minWidth: "200px", maxWidth: "400px" }}>
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span className="text-muted fw-bold" style={{ fontSize: "10px" }}>DOMINIO</span>
          <span className="small fw-bold" style={{ color: "var(--gris-oscuro)" }}>{current.p}%</span>
        </div>
        <div className="progress" style={{ height: "8px", backgroundColor: "var(--gris-borde)", borderRadius: "10px" }}>
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

      <div className="d-flex gap-2">
        <button
          onClick={() => onEdit(skill)}
          className="btn-action-skill btn-edit"
          title="Editar"
          aria-label="Editar habilidad"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(skill.id)}
          className="btn-action-skill btn-delete"
          title="Eliminar"
          aria-label="Eliminar habilidad"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
