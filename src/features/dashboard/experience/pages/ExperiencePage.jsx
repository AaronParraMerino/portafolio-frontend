import React, { useCallback, useEffect, useState } from "react";
// QA: Header eliminado para limpiar el warning no-unused-vars
import ExperienceForm from "../components/ExperienceForm";
import ExperienceDetailModal from "../components/ExperienceDetailModal";
import ExperienceToast from "../components/ExperienceToast";
import {
  getExperiencias,
  createExperiencia,
  updateExperiencia,
  deleteExperiencia,
} from "../services/experienceService";

// Componente local para la Ventanita de Confirmación
const ConfirmModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  type = "primary",
}) => {
  if (!isOpen) return null;
  const btnClass = type === "danger" ? "btn-danger" : "btn-primary";
  return (
    <div className="confirm-overlay">
      <div className="confirm-card">
        <div className="confirm-icon">{type === "danger" ? "⚠️" : "❓"}</div>
        <h5 className="confirm-title">{title}</h5>
        <p className="confirm-text">{message}</p>
        <div className="confirm-buttons">
          <button className="btn-confirm-cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button className={`btn ${btnClass} px-4`} onClick={onConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
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
    message: "",
    onConfirm: null,
    type: "primary",
  });

  // QA: breadcrumb eliminado para limpiar el warning no-unused-vars

  const showToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

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

  const handleSaveRequest = (data) => {
    setConfirmData({
      isOpen: true,
      title: selectedExp ? "Confirmar Edición" : "Confirmar Registro",
      message: `¿Estás seguro de que deseas ${selectedExp ? "actualizar" : "guardar"} esta información?`,
      type: "primary",
      onConfirm: () => {
        executeSave(data);
        closeConfirm();
      },
    });
  };

  const executeSave = async (data) => {
    try {
      if (modalMode === "edit" && selectedExp) {
        const updated = await updateExperiencia(selectedExp.id, data);
        setExperiencias((prev) =>
          prev.map((exp) => (exp.id === selectedExp.id ? updated : exp)),
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
        error.response?.data?.message ||
        error.message ||
        "Error en la operación";
      showToast(errorMsg, "error");
    }
  };

  const handleDeleteRequest = (id) => {
    setConfirmData({
      isOpen: true,
      title: "¿Eliminar Experiencia?",
      message: "Esta acción no se puede deshacer. ¿Deseas continuar?",
      type: "danger",
      onConfirm: () => {
        executeDelete(id);
        closeConfirm();
      },
    });
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

  const closeConfirm = () => setConfirmData({ ...confirmData, isOpen: false });
  
  const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '';
  const [year, month] = fechaStr.split('-');
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${meses[parseInt(month) - 1]} ${year}`;
};

  return (
    <>
      <style>{`
        /* Estilos de la Barra Superior */
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
        
        /* Estilos de la Ventana de Confirmación (Arreglo del cuadro transparente) */
        .confirm-overlay {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0, 0, 0, 0.7);
          display: flex; justify-content: center; align-items: center;
          z-index: 2000;
          backdrop-filter: blur(2px);
        }
        .confirm-card {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          width: 90%;
          max-width: 400px;
          text-align: center;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
        }
        .confirm-icon { font-size: 3rem; margin-bottom: 1rem; }
        .confirm-title { font-weight: 800; color: #1f2937; margin-bottom: 0.5rem; }
        .confirm-text { color: #6b7280; font-size: 0.95rem; margin-bottom: 1.5rem; }
        .confirm-buttons { display: flex; gap: 10px; justify-content: center; }
        .btn-confirm-cancel {
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          padding: 0.5rem 1.5rem;
          border-radius: 6px;
          font-weight: 600;
          transition: 0.2s;
        }
        .btn-confirm-cancel:hover { background: #e5e7eb; }

        /* Estilos de las Tarjetas */
        .exp-card {
          transition: all 0.3s ease;
          border-left: 5px solid var(--azul) !important;
          border-radius: 4px !important;
          background-color: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
        }
        .exp-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        }

        .badge-laboral { background-color: #fff7ed !important; color: #ea580c !important; border: 1px solid #fdba74 !important; }
        .badge-academica { background-color: #f3e8ff !important; color: #6b21a8 !important; border: 1px solid #b878fd !important; }

        @media (max-width: 768px) {
          .custom-breadcrumb-bar { flex-direction: column; gap: 15px; text-align: center; }
        }
      `}</style>

      <div className="custom-breadcrumb-bar shadow">
        <div>
          <p className="bc-text">Portafolio</p>
          <h2 className="bc-active">EXPERIENCIA</h2>
        </div>
        <button
          className="btn btn-primary px-4 py-2 fw-bold shadow-sm"
          style={{
            backgroundColor: "var(--azul)",
            border: "none",
            borderRadius: "6px",
          }}
          onClick={() => {
            setModalMode("add");
            setSelectedExp(null);
          }}
        >
          ➕ Agregar Nueva
        </button>
      </div>

      <div
        className="container-fluid p-4"
        style={{ minHeight: "100vh", background: "#f1f5f9" }}
      >
        <div className="row justify-content-center">
          <div className="col-12 col-xl-11">
            {loading ? (
              <div className="text-center py-5">
                <div
                  className="spinner-border text-primary"
                  role="status"
                ></div>
                <h5 className="text-muted mt-3">Cargando tus datos...</h5>
              </div>
            ) : experiencias.length === 0 ? (
              <div className="text-center py-5 bg-white rounded shadow-sm">
                <h5 className="text-muted">No hay experiencias registradas.</h5>
              </div>
            ) : (
              <div className="row g-4">
                {experiencias.map((exp) => (
                  <div key={exp.id} className="col-12 col-md-6 col-lg-4">
                    <div className="card h-100 exp-card p-3 border-0">
                      <div className="d-flex justify-content-between mb-3">
                        <span
                          className={`badge px-3 py-2 ${exp.tipo_experiencia === "Laboral" ? "badge-laboral" : "badge-academica"}`}
                        >
                          {exp.tipo_experiencia.toUpperCase()}
                        </span>
                        <button
                          className="btn btn-light btn-sm rounded-circle shadow-sm"
                          onClick={() => {
                            setSelectedExp(exp);
                            setModalMode("view");
                          }}
                        >
                          👁️
                        </button>
                      </div>

                      <h5 className="fw-bold mb-1">{exp.puesto}</h5>
                      <p className="text-primary small mb-3 fw-bold">
                        {exp.empresa}
                      </p>

                      <div className="mt-auto d-flex justify-content-between align-items-center pt-3 border-top">
                        <small className="text-muted fw-bold">
                          {formatearFecha(exp.fecha_inicio)} —{" "}
                          {exp.actual
                            ? "Actual"
                            : formatearFecha(exp.fecha_fin)}
                        </small>
                        <div className="d-flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedExp(exp);
                              setModalMode("edit");
                            }}
                            className="btn btn-sm btn-outline-primary"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(exp.id)}
                            className="btn btn-sm btn-outline-danger"
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
        isOpen={confirmData.isOpen}
        title={confirmData.title}
        message={confirmData.message}
        type={confirmData.type}
        onConfirm={confirmData.onConfirm}
        onCancel={closeConfirm}
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
