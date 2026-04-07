import React, { useCallback, useEffect, useState } from 'react';
import Header from '../../layout/Header';
import ExperienceForm from '../components/ExperienceForm';
import ExperienceDetailModal from '../components/ExperienceDetailModal';
import ExperienceToast from '../components/ExperienceToast';
import {
  getExperiencias,
  createExperiencia,
  updateExperiencia,
  deleteExperiencia,
} from '../services/experienceService';

export default function ExperiencePage() {
  const [experiencias, setExperiencias] = useState([]);
  const [modalMode, setModalMode] = useState(null);
  const [selectedExp, setSelectedExp] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const breadcrumb = [{ label: 'Portafolio' }, { label: 'Experiencia', active: true }];

  const showToast = (msg, tipo = 'ok') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const loadExperiencias = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getExperiencias();
      setExperiencias(data);
    } catch (error) {
      console.error(error);
      showToast(error.message || 'No se pudieron cargar las experiencias', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExperiencias();
  }, [loadExperiencias]);

  const handleSave = async (data) => {
    try {
      if (modalMode === 'edit' && selectedExp) {
        const updated = await updateExperiencia(selectedExp.id, data);
        setExperiencias((prev) =>
          prev.map((exp) => (exp.id === selectedExp.id ? updated : exp))
        );
        showToast('Experiencia actualizada');
      } else {
        const created = await createExperiencia(data);
        setExperiencias((prev) => [created, ...prev]);
        showToast('Experiencia guardada correctamente');
      }

      setModalMode(null);
      setSelectedExp(null);
    } catch (error) {
      console.error(error);
      showToast(error.message || 'No se pudo guardar la experiencia', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('🗑️ ¿Seguro que deseas eliminar esta experiencia?')) {
      try {
        await deleteExperiencia(id);
        setExperiencias((prev) => prev.filter((e) => e.id !== id));
        showToast('Eliminado con éxito', 'error');
      } catch (error) {
        console.error(error);
        showToast(error.message || 'No se pudo eliminar la experiencia', 'error');
      }
    }
  };

  return (
    <>
      <style>{`
  .dsh-header {
    background-color: #111827 !important;
    color: white !important;
  }

  .dsh-header-bc,
  .dsh-header-bc span {
    color: #ffffff !important;
    opacity: 1 !important;
  }

  .exp-card {
    transition: all 0.3s ease;
    border-left: 5px solid var(--azul) !important;
    border-radius: 4px !important;
    background-color: #f1f5f9 !important;
    border: 1px solid #e2e8f0 !important;
  }
  .exp-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
  }

  .badge-laboral {
     background-color: #fff7ed !important;
     color: #ea580c !important;
     border: 1px solid #fdba74 !important;
  }

  .badge-academica {
      background-color: #f3e8ff !important;
      color: #6b21a8 !important;
      border: 1px solid #b878fd !important;
  }

  .btn-edit-custom { transition: 0.3s; color: #0d6efd; border-color: #0d6efd; }
  .btn-edit-custom:hover {
    background-color: #0d6efd !important;
    color: white !important;
  }

  .btn-delete-custom { transition: 0.3s; color: #dc3545; border-color: #dc3545; }
  .btn-delete-custom:hover {
    background-color: #dc3545 !important;
    color: white !important;
  }

  input[type="date"] {
    background-color: #f1f5f9 !important;
    border: 1px solid #0077b7 !important;
    border-radius: 4px;
    padding: 8px !important;
  }

  ::-webkit-datetime-edit { padding: 1px; }
  ::-webkit-calendar-picker-indicator {
    background-color: #0077b7;
    color: white;
    padding: 5px;
    border-radius: 3px;
    cursor: pointer;
    filter: invert(0);
  }

  @media (max-width: 768px) {
    .prf-modal-overlay {
      display: flex !important;
      align-items: flex-start !important;
      padding-top: 50px !important;
      overflow-y: auto !important;
    }

    .prf-modal-content {
      overflow: visible !important;
      margin-bottom: 200px !important;
    }

    form {
      padding-bottom: 80px !important;
    }
  }
`}</style>

      <Header
        breadcrumb={breadcrumb}
        actionLabel="Agregar experiencia"
        onAction={() => {
          setModalMode('add');
          setSelectedExp(null);
        }}
      />

      <div className="container-fluid p-4" style={{ marginTop: '-20px', minHeight: '100vh', background: 'var(--fondo)' }}>
        <div className="row justify-content-center">
          <div className="col-12 col-xl-10">
            <div className="card shadow-sm border-0 p-4" style={{ borderRadius: '4px', backgroundColor: 'white' }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold m-0" style={{ color: 'var(--azul)' }}>Mis Experiencias</h4>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <h5 className="text-muted">Cargando experiencias...</h5>
                </div>
              ) : experiencias.length === 0 ? (
                <div className="text-center py-5">
                  <h5 className="text-muted">No tienes experiencias registradas aún.</h5>
                </div>
              ) : (
                <div className="row g-3">
                  {experiencias.map(exp => (
                    <div key={exp.id} className="col-12 col-md-6 col-lg-4">
                      <div className="card h-100 exp-card p-3">
                        <div className="d-flex justify-content-between mb-2">
                          <span className={`badge ${exp.tipo_experiencia === 'Laboral' ? 'badge-laboral' : 'badge-academica'}`}>
                            {exp.tipo_experiencia.toUpperCase()}
                          </span>
                          <button
                            className="btn btn-link p-0 text-muted"
                            style={{ textDecoration: 'none', fontSize: '1.2rem' }}
                            onClick={() => { setSelectedExp(exp); setModalMode('view'); }}
                          >
                            👁️
                          </button>
                        </div>

                        <h6 className="fw-bold mb-1 text-dark">{exp.puesto}</h6>
                        <p className="text-primary small mb-3 fw-medium">{exp.empresa}</p>

                        <div className="mt-auto d-flex justify-content-between align-items-center pt-2 border-top border-secondary-subtle">
                          <small className="text-muted fw-bold">
                            {exp.fecha_inicio?.split('-')[0]} - {exp.actual ? 'Actual' : exp.fecha_fin?.split('-')[0]}
                          </small>
                          <div className="d-flex gap-2">
                            <button
                              onClick={() => { setSelectedExp(exp); setModalMode('edit'); }}
                              className="btn btn-sm btn-outline-primary btn-edit-custom"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(exp.id)}
                              className="btn btn-sm btn-outline-danger btn-delete-custom"
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
      </div>

      {(modalMode === 'add' || modalMode === 'edit') && (
        <ExperienceForm onSave={handleSave} onCancel={() => setModalMode(null)} editData={selectedExp} />
      )}

      {modalMode === 'view' && (
        <ExperienceDetailModal exp={selectedExp} onClose={() => setModalMode(null)} />
      )}

      <ExperienceToast toast={toast} />
    </>
  );
}