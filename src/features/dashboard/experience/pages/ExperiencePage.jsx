import React, { useCallback, useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import ExperienceForm from "../components/ExperienceForm";
import ExperienceDetailModal from "../components/ExperienceDetailModal";
import ExperienceToast from "../components/ExperienceToast";
import ConfirmModal from "../../../../shared/ui/ConfirmModal";
import Header from "../../layout/Header";
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
  const [modalMode, setModalMode]       = useState(null);
  const [selectedExp, setSelectedExp]   = useState(null);
  const [toast, setToast]               = useState(null);
  const [loading, setLoading]           = useState(true);

  const [confirmData, setConfirmData] = useState({
    isOpen:   false,
    title:    "",
    subtitle: "",
    message:  "",
    confirmLabel: "Confirmar",
    onConfirm: null,
    variant:  "blue",
    icon:     "check",
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
      // Editar → azul (cambio de información).  Crear → verde (acción positiva nueva).
      variant:      isEdit ? "blue"              : "green",
      icon:         "check",
      title:        isEdit ? "Actualizar experiencia" : "Guardar experiencia",
      subtitle:     isEdit
        ? "Se sobreescribirán los datos actuales."
        : "Se añadirá al listado de experiencias.",
      message: isEdit
        ? `¿Confirmas los cambios realizados en "${data.puesto}" en ${data.empresa}?`
        : `¿Deseas guardar "${data.puesto}" en ${data.empresa} como nueva experiencia?`,
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
      variant:      "red",
      icon:         "warning",
      title:        "Eliminar experiencia",
      subtitle:     "Esta acción no se puede deshacer.",
      message:      exp
        ? `Estás por eliminar "${exp.puesto}" en ${exp.empresa}. ¿Deseas continuar?`
        : "Esta acción es permanente. ¿Deseas continuar?",
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
        .exp-card {
          transition: all 0.3s ease;
          border-left: 5px solid var(--azul) !important;
          border-radius: 4px !important;
          background-color: var(--blanco) !important;
          border: 1px solid var(--gris-borde) !important;
          font-family: var(--font);
        }
        .exp-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        }
        .badge-laboral {
          background-color: var(--amarillo-chip) !important;
          color: var(--amarillo-hover) !important;
          border: 1px solid var(--amarillo-borde) !important;
          font-family: var(--font);
        }
        .badge-academica {
          background-color: var(--violeta-chip) !important;
          color: var(--violeta-hover) !important;
          border: 1px solid var(--violeta-borde) !important;
          font-family: var(--font);
        }
      `}</style>

      {/* Barra superior */}
      <Header
        title="Experiencia"
        actions={[
          {
            label: "Agregar nueva",
            title: "Agregar nueva experiencia",
            icon: <FiPlus />,
            onClick: () => { setModalMode("add"); setSelectedExp(null); },
          },
        ]}
      />

      {/* Lista de experiencias */}
      <div
        className="container-fluid p-4"
        style={{ minHeight: "100vh", background: "var(--fondo)", fontFamily: "var(--font)" }}
      >
        <div className="row justify-content-center">
          <div className="col-12 col-xl-11">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
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
                          className={`badge px-3 py-2 ${
                            exp.tipo_experiencia === "Laboral"
                              ? "badge-laboral"
                              : "badge-academica"
                          }`}
                        >
                          {exp.tipo_experiencia.toUpperCase()}
                        </span>
                        <button
                          className="btn btn-light btn-sm rounded-circle shadow-sm"
                          onClick={() => { setSelectedExp(exp); setModalMode("view"); }}
                        >
                          👁️
                        </button>
                      </div>

                      <h5 className="fw-bold mb-1">{exp.puesto}</h5>
                      <p className="text-primary small mb-3 fw-bold">{exp.empresa}</p>

                      <div className="mt-auto d-flex justify-content-between align-items-center pt-3 border-top">
                        <small className="text-muted fw-bold">
                          {formatearFecha(exp.fecha_inicio)} —{" "}
                          {exp.actual ? "Actual" : formatearFecha(exp.fecha_fin)}
                        </small>
                        <div className="d-flex gap-2">
                          <button
                            onClick={() => { setSelectedExp(exp); setModalMode("edit"); }}
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

      {/* ConfirmModal unificado */}
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

      {/* Modales de formulario y detalle */}
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
