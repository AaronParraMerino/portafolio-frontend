import React, { useCallback, useEffect, useState } from "react";
import ExperienceForm from "../components/ExperienceForm";
import ExperienceToast from "../components/ExperienceToast";
import ConfirmModal from "../../../../shared/ui/ConfirmModal";
import Header from "../../layout/Header";
import {
  getExperiencias,
  createExperiencia,
  updateExperiencia,
  deleteExperiencia,
} from "../services/experienceService";

const formatearFechaCompleta = (fechaStr) => {
  if (!fechaStr) return "Sin fecha";

  const [year, month, day] = String(fechaStr).slice(0, 10).split("-");
  if (!year || !month || !day) return fechaStr;

  return `${day}/${month}/${year}`;
};

export default function ExperiencePage() {
  const [experiencias, setExperiencias] = useState([]);
  const [modalMode, setModalMode] = useState(null);
  const [selectedExp, setSelectedExp] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const [confirmData, setConfirmData] = useState({
    isOpen: false,
    title: "",
    subtitle: "",
    message: "",
    confirmLabel: "Confirmar",
    onConfirm: null,
    variant: "blue",
    icon: "check",
  });

  const openAddModal = () => {
    setSelectedExp(null);
    setModalMode("add");
  };

  const showToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const closeConfirm = () =>
    setConfirmData((prev) => ({ ...prev, isOpen: false }));

  const loadExperiencias = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getExperiencias();
      setExperiencias(data);
    } catch (error) {
      showToast(error.message || "Error al conectar con el servidor", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExperiencias();
  }, [loadExperiencias]);

  const executeSave = async (data) => {
    try {
      if (modalMode === "edit" && selectedExp) {
        const updated = await updateExperiencia(selectedExp.id, data);
        setExperiencias((prev) =>
          prev.map((exp) => (exp.id === selectedExp.id ? { ...exp, ...updated } : exp))
        );
        showToast("Experiencia actualizada correctamente");
      } else {
        const created = await createExperiencia(data);
        setExperiencias((prev) => [created, ...prev]);
        showToast("Experiencia guardada con éxito");
      }
      setModalMode(null);
      setSelectedExp(null);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Error en la operación";
      showToast(errorMsg, "error");
    }
  };

  const executeDelete = async (id) => {
    try {
      await deleteExperiencia(id);
      setExperiencias((prev) => prev.filter((e) => e.id !== id));
      showToast("Registro eliminado", "ok");
    } catch (error) {
      showToast(error.message || "No se pudo eliminar", "error");
    }
  };

  const handleSaveRequest = (data) => {
    const isEdit = !!selectedExp;
    setConfirmData({
      isOpen: true,
      variant: isEdit ? "blue" : "green",
      icon: "check",
      title: isEdit ? "Actualizar experiencia" : "Guardar experiencia",
      subtitle: isEdit ? "Se sobreescribirán los datos actuales." : "Se añadirá al listado de experiencias.",
      message: isEdit
        ? `¿Confirmas los cambios en "${data.puesto}"?`
        : `¿Deseas guardar "${data.puesto}"?`,
      confirmLabel: isEdit ? "Sí, actualizar" : "Sí, guardar",
      onConfirm: () => {
        executeSave(data);
        closeConfirm();
      },
    });
  };

  const handleDeleteRequest = (id) => {
    const exp = experiencias.find((e) => e.id === id);
    setConfirmData({
      isOpen: true,
      variant: "red",
      icon: "warning",
      title: "Eliminar experiencia",
      subtitle: "Esta acción no se puede deshacer.",
      message: `Estás por eliminar "${exp?.puesto}". ¿Deseas continuar?`,
      confirmLabel: "Sí, eliminar",
      onConfirm: () => {
        executeDelete(id);
        closeConfirm();
      },
    });
  };

  const laborales = experiencias.filter((e) => e.tipo_experiencia === "Laboral");
  const academicas = experiencias.filter((e) => e.tipo_experiencia === "Académica");

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
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 0;
        }
        .bc-active {
          color: var(--blanco);
          font-weight: 800;
          font-size: 1.4rem;
          margin: 0;
        }

        .exp-page-body {
          min-height: 100vh;
          background: var(--fondo);
        }

        .exp-add-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 9px 18px;
          border-radius: 8px;
          border: none;
          background: var(--azul);
          color: var(--blanco);
          font-family: var(--font);
          font-size: .92rem;
          font-weight: 800;
          cursor: pointer;
          transition: all .15s ease;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,119,183,.18);
        }
        .exp-add-btn:hover {
          background: var(--azul-hover);
          box-shadow: 0 4px 14px rgba(0,119,183,.3);
          transform: translateY(-1px);
        }

        .exp-card {
          transition: all 0.22s ease;
          border-left: 5px solid var(--azul) !important;
          border-radius: 12px !important;
          background: var(--blanco) !important;
          border: 1.5px solid var(--gris-borde) !important;
          box-shadow: 0 1px 4px rgba(0,0,0,.04);
        }
        .exp-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 18px rgba(0,0,0,.06);
        }

        .exp-card-title {
          color: var(--negro-texto);
          font-size: 1.02rem;
          line-height: 1.25;
        }
        .exp-card-company {
          color: var(--azul);
          font-size: .83rem;
          font-weight: 800;
        }
        .exp-card-date {
          color: var(--gris-texto);
          font-size: .78rem;
          margin-bottom: 0;
        }
        .exp-card-desc {
          background: var(--azul-light);
          border-left: 4px solid var(--azul);
          border-radius: 6px;
          margin-top: 10px;
          padding: 10px 12px;
        }

        .section-divider {
          font-weight: 800;
          color: var(--negro-texto);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 1.55rem 0 .85rem 0;
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

        .badge-laboral {
          background: var(--amarillo-chip) !important;
          color: var(--amarillo-hover) !important;
          border: 1px solid var(--amarillo-borde) !important;
        }
        .badge-academica {
          background: var(--violeta-chip) !important;
          color: var(--violeta-hover) !important;
          border: 1px solid var(--violeta-borde) !important;
        }

        .btn-action-exp {
          padding: 6px 12px;
          border-radius: 6px;
          border: 1.5px solid var(--gris-borde);
          background: var(--blanco);
          color: var(--gris-oscuro);
          font-size: .82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all .18s ease;
        }
        .btn-action-exp:hover {
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

        .exp-category-empty {
          background: var(--blanco);
          border: 1.5px dashed var(--gris-borde);
          border-radius: 12px;
          color: var(--gris-texto);
          font-size: .86rem;
          padding: 18px;
          text-align: center;
        }

        .exp-empty-state {
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
        .exp-empty-state::before {
          content: "";
          position: absolute;
          inset: 0 0 auto 0;
          height: 5px;
          background: linear-gradient(90deg, var(--azul), var(--azul-mid));
        }
        .exp-empty-icon {
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
        .exp-empty-title {
          margin: 0;
          color: var(--negro-texto);
          font-size: clamp(1.15rem, 2vw, 1.45rem);
          font-weight: 800;
          letter-spacing: -.02em;
        }
        .exp-empty-text {
          max-width: 500px;
          margin: .55rem auto 1.35rem;
          color: var(--gris-texto);
          font-size: .95rem;
          line-height: 1.55;
        }
        .exp-empty-chips {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 1.45rem;
        }
        .exp-empty-chip {
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
          .exp-add-btn {
            width: 100%;
          }
          .exp-empty-state {
            margin-top: 1rem;
            padding: 1.7rem 1.2rem;
          }
          .exp-card-actions {
            width: 100%;
            justify-content: flex-start;
          }
        }
      `}</style>

      <Header
        title="Experiencia"
        actionLabel="Agregar nueva"
        onAction={openAddModal}
      />

      <div className="container-fluid p-4 exp-page-body">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-10">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
              </div>
            ) : experiencias.length === 0 ? (
              <ExperienceEmptyState onAdd={openAddModal} />
            ) : (
              <>
                <h5 className="section-divider">Experiencia Laboral</h5>
                {laborales.length === 0 ? (
                  <div className="exp-category-empty mb-4">
                    No hay experiencia laboral registrada.
                  </div>
                ) : (
                  <div className="row g-3 mb-4">
                    {laborales.map((exp) => (
                      <div key={exp.id} className="col-12">
                        <ExperienceCard
                          exp={exp}
                          onEdit={() => { setSelectedExp(exp); setModalMode("edit"); }}
                          onDelete={() => handleDeleteRequest(exp.id)}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <h5 className="section-divider">Experiencia Académica</h5>
                {academicas.length === 0 ? (
                  <div className="exp-category-empty">
                    No hay experiencia académica registrada.
                  </div>
                ) : (
                  <div className="row g-3">
                    {academicas.map((exp) => (
                      <div key={exp.id} className="col-12">
                        <ExperienceCard
                          exp={exp}
                          onEdit={() => { setSelectedExp(exp); setModalMode("edit"); }}
                          onDelete={() => handleDeleteRequest(exp.id)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmData.isOpen}
        title={confirmData.title}
        subtitle={confirmData.subtitle}
        message={confirmData.message}
        confirmLabel={confirmData.confirmLabel}
        cancelLabel="Cancelar"
        variant={confirmData.variant}
        icon={confirmData.icon}
        onConfirm={confirmData.onConfirm}
        onClose={closeConfirm}
      />

      {(modalMode === "add" || modalMode === "edit") && (
        <ExperienceForm
          onSave={handleSaveRequest}
          onCancel={() => setModalMode(null)}
          editData={selectedExp}
        />
      )}

      <ExperienceToast toast={toast} />
    </>
  );
}

function ExperienceEmptyState({ onAdd }) {
  return (
    <div className="exp-empty-state">
      <div className="exp-empty-icon">✦</div>
      <h3 className="exp-empty-title">Aún no tienes experiencias registradas</h3>
      <p className="exp-empty-text">
        Agrega experiencias laborales o académicas para mostrar tu trayectoria y fortalecer tu perfil profesional.
      </p>
      <div className="exp-empty-chips" aria-hidden="true">
        <span className="exp-empty-chip">Laboral</span>
        <span className="exp-empty-chip">Académica</span>
        <span className="exp-empty-chip">Fechas y descripción</span>
      </div>
      <button type="button" className="exp-add-btn" onClick={onAdd}>
        + Agregar Experiencia
      </button>
    </div>
  );
}

function ExperienceCard({ exp, onEdit, onDelete }) {
  return (
    <div className="card h-100 exp-card p-3 border-0">
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
        <span
          className={`badge px-3 py-2 ${
            exp.tipo_experiencia === "Laboral" ? "badge-laboral" : "badge-academica"
          }`}
        >
          {exp.tipo_experiencia.toUpperCase()}
        </span>

        <div className="d-flex gap-2 exp-card-actions">
          <button
            onClick={onEdit}
            className="btn-action-exp btn-edit"
            title="Editar"
            aria-label="Editar experiencia"
          >
            Editar
          </button>
          <button
            onClick={onDelete}
            className="btn-action-exp btn-delete"
            title="Eliminar"
            aria-label="Eliminar experiencia"
          >
            Eliminar
          </button>
        </div>
      </div>

      <h5 className="fw-bold mb-1 exp-card-title">{exp.puesto}</h5>
      <p className="mb-1 exp-card-company">{exp.empresa}</p>
      <p className="exp-card-date">
        {formatearFechaCompleta(exp.fecha_inicio)} — {exp.actual ? "Actualidad" : formatearFechaCompleta(exp.fecha_fin)}
      </p>

      {exp.descripcion && (
        <div className="exp-card-desc">
          <p
            className="mb-0 small"
            style={{
              color: "var(--negro-texto)",
              whiteSpace: "pre-wrap",
              lineHeight: "1.45",
              wordBreak: "break-word",
              overflowWrap: "anywhere",
            }}
          >
            {exp.descripcion}
          </p>
        </div>
      )}
    </div>
  );
}

