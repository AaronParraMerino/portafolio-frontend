import React, { useCallback, useEffect, useState } from "react";
import ExperienceForm from "../components/ExperienceForm";
import ExperienceDetailModal from "../components/ExperienceDetailModal";
import ExperienceToast from "../components/ExperienceToast";
import ConfirmModal from "../../../../shared/ui/ConfirmModal";
import {
  getExperiencias,
  createExperiencia,
  updateExperiencia,
  deleteExperiencia,
} from "../services/experienceService";

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return "";
  const [year, month] = fechaStr.split("-");
  const meses = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
  ];
  return `${meses[parseInt(month) - 1]} ${year}`;
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
          prev.map((exp) => (exp.id === selectedExp.id ? updated : exp))
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

  return (
    <>
      <style>{`
        /* BARRA NEGRA MANTENIDA */
        .custom-breadcrumb-bar {
          background-color: var(--negro-texto);
          padding: 1.2rem 2.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 4px solid var(--azul);
          font-family: var(--font);
        }
        .bc-text { color: var(--gris-texto); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; }
        .bc-active { color: var(--blanco); font-weight: 800; font-size: 1.4rem; margin: 0; }

        .exp-card {
          transition: all 0.3s ease;
          border-left: 5px solid var(--azul) !important;
          border-radius: 12px !important; /* Más redondeado estilo Dashboard */
          background: white !important;
          border: 1px solid #e5e7eb !important;
        }
        .exp-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }

        /* BADGES MANTENIDOS */
        .badge-laboral { background: var(--amarillo-chip) !important; color: var(--amarillo-hover) !important; border: 1px solid var(--amarillo-borde) !important; }
        .badge-academica { background: var(--violeta-chip) !important; color: var(--violeta-hover) !important; border: 1px solid var(--violeta-borde) !important; }

        /* ESTILO BOTONES DASHBOARD (Glassmorphism suave) */
        .btn-action-dash {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid transparent;
          transition: all 0.2s;
          font-size: 1.1rem;
        }
        .btn-view { 
          border-radius: 50%; /* CIRCULAR para visualizar */
          background: var(--azul-light); 
          color: var(--azul); 
          border-color: rgba(59, 130, 246, 0.2); 
        }
        .btn-edit { 
          border-radius: 8px; /* CUADRADO SUAVE para editar */
          background: #fff7ed; 
          color: #f59e0b; 
          border-color: rgba(245, 158, 11, 0.2); 
        }
        .btn-delete { 
          border-radius: 8px; /* CUADRADO SUAVE para borrar */
          background: var(--rojo-bg); 
          color: var(--rojo-mid); 
          border-color: rgba(239, 68, 68, 0.2); 
        }
        .btn-action-dash:hover { transform: scale(1.1); filter: brightness(0.9); }

        .visibility-tag {
          font-size: 10px;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 20px;
          text-transform: uppercase;
        }
        .tag-public { background: #ecfdf5; color: #10b981; border: 1px solid #d1fae5; }
        .tag-private { background: #f3f4f6; color: #6b7280; border: 1px solid #e5e7eb; }
      `}</style>

      <div className="custom-breadcrumb-bar shadow">
        <div>
          <p className="bc-text m-0">Portafolio</p>
          <h2 className="bc-active">EXPERIENCIA</h2>
        </div>
        <button
          className="btn btn-primary px-4 py-2 fw-bold shadow-sm"
          style={{ backgroundColor: "var(--azul)", border: "none", borderRadius: "8px" }}
          onClick={() => { setModalMode("add"); setSelectedExp(null); }}
        >
          ➕ Agregar Nueva
        </button>
      </div>

      <div className="container-fluid p-4" style={{ minHeight: "100vh", background: "#f8fafc" }}>
        <div className="row justify-content-center">
          <div className="col-12 col-xl-11">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
              </div>
            ) : experiencias.length === 0 ? (
              <div className="text-center py-5 bg-white rounded shadow-sm border">
                <h5 className="text-muted">No hay experiencias registradas.</h5>
              </div>
            ) : (
              <div className="row g-4">
                {experiencias.map((exp) => (
                  <div key={exp.id} className="col-12 col-md-6 col-lg-4">
                    <div className="card h-100 exp-card p-3 border-0">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex flex-column gap-2">
                          <span className={`badge px-3 py-2 ${exp.tipo_experiencia === "Laboral" ? "badge-laboral" : "badge-academica"}`}>
                            {exp.tipo_experiencia.toUpperCase()}
                          </span>
                          {/* INDICADOR DE PÚBLICO/PRIVADO */}
                          <span className={`visibility-tag ${exp.es_publico ? 'tag-public' : 'tag-private'}`}>
                            {exp.es_publico ? '● Público' : '○ Privado'}
                          </span>
                        </div>
                        
                        {/* BOTÓN VISUALIZAR (CIRCULAR) */}
                        <button
                          className="btn-action-dash btn-view shadow-sm"
                          title="Ver detalles"
                          onClick={() => { setSelectedExp(exp); setModalMode("view"); }}
                        >
                          👁️
                        </button>
                      </div>

                      <h5 className="fw-bold mb-1" style={{ color: '#1e293b' }}>{exp.puesto}</h5>
                      <p className="text-primary small mb-3 fw-bold">{exp.empresa}</p>

                      <div className="mt-auto d-flex justify-content-between align-items-center pt-3 border-top">
                        <small className="text-muted fw-bold" style={{ fontSize: '11px' }}>
                          📅 {formatearFecha(exp.fecha_inicio)} — {exp.actual ? "Actual" : formatearFecha(exp.fecha_fin)}
                        </small>
                        <div className="d-flex gap-2">
                          {/* BOTONES EDITAR Y BORRAR (CUADRADOS SUAVES) */}
                          <button
                            onClick={() => { setSelectedExp(exp); setModalMode("edit"); }}
                            className="btn-action-dash btn-edit"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(exp.id)}
                            className="btn-action-dash btn-delete"
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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

      {modalMode === "view" && (
        <ExperienceDetailModal
          exp={selectedExp}
          onClose={() => setModalMode(null)}
        />
      )}

      <ExperienceToast toast={toast} />
    </>
  );
}