import React, { useState } from 'react';
import Header from '../../layout/Header';
import ExperienceForm from '../components/ExperienceForm';

export default function ExperiencePage() {
  const [showForm, setShowForm] = useState(false);
  const [editingExp, setEditingExp] = useState(null);
  const [experiencias, setExperiencias] = useState([]);

  const breadcrumb = [{ label: 'Portafolio' }, { label: 'Experiencia', active: true }];

  const handleSave = (data) => {
    if (editingExp) {
      setExperiencias(experiencias.map(exp => exp.id === editingExp.id ? { ...data, id: exp.id } : exp));
    } else {
      setExperiencias([...experiencias, { ...data, id: Date.now().toString() }]);
    }
    setShowForm(false);
    setEditingExp(null);
  };

  return (
    <>
      <Header 
        breadcrumb={breadcrumb} 
        actionLabel={showForm ? "Regresar" : "Agregar experiencia"}
        onAction={() => { setShowForm(!showForm); setEditingExp(null); }}
      />

      {/* QA: Ajuste de layout eliminando espacio blanco excesivo arriba */}
      <div className="container-fluid p-4" style={{ marginTop: '-20px' }}> 
        <div className="row justify-content-center">
          <div className="col-12 col-xl-10">
            
            {showForm ? (
              <ExperienceForm onSave={handleSave} onCancel={() => setShowForm(false)} editData={editingExp} />
            ) : (
              <div className="card shadow-sm border-0 p-4">
                <h4 className="fw-bold mb-4" style={{ color: 'var(--azul)' }}>Mi Historial</h4>

                {experiencias.length === 0 ? (
                  <p className="text-muted text-center py-5 border rounded">
                    No has registrado ninguna experiencia laboral o académica aún.
                  </p>
                ) : (
                  experiencias.map(exp => (
                    <div key={exp.id} className="p-3 mb-3 border rounded-3 bg-white d-flex justify-content-between align-items-center">
                      <div>
                        <span className={`badge mb-2 bg-light text-dark border`}>
                          {exp.tipo_experiencia}
                        </span>
                        <h5 className="fw-bold mb-1">{exp.puesto}</h5>
                        <p className="text-azul mb-1" style={{ fontSize: '14px', fontWeight: '500' }}>{exp.empresa}</p>
                        <small className="text-muted">
                          {exp.fecha_inicio} — {exp.actual ? 'Actual' : exp.fecha_fin}
                        </small>
                      </div>
                      <div className="d-flex gap-2 ms-3">
                        <button onClick={() => {setEditingExp(exp); setShowForm(true);}} className="btn btn-outline-primary btn-sm">Editar</button>
                        <button onClick={() => setExperiencias(experiencias.filter(e => e.id !== exp.id))} className="btn btn-outline-danger btn-sm">Borrar</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            
          </div>
        </div>
      </div>
    </>
  );
}