import React, { useState, useEffect } from 'react';

export default function ExperienceForm({ onSave, onCancel, editData }) {
  const [formData, setFormData] = useState({
    tipo_experiencia: 'Laboral',
    empresa: '', puesto: '', fecha_inicio: '', fecha_fin: '',
    actual: false, descripcion: ''
  });

  useEffect(() => {
    if (editData) setFormData(editData);
  }, [editData]);

  return (
    <div className="prf-modal-overlay" style={{ zIndex: 1050, backgroundColor: 'rgba(0,0,0,0.5)' }}>
      {/* background-color blanco forzado, shadow-lg, border-radius reducido a 4px (sin puntas redondas) */}
      <div className="prf-modal-content bg-white shadow-lg p-0" style={{ maxWidth: '600px', border: 'none', borderRadius: '4px', overflow: 'visible' }}>
        <div className="prf-modal-head border-bottom p-3">
          <span className="prf-modal-title fw-bold text-dark">
            {editData ? '✏️ Editar Experiencia' : '➕ Agregar Nueva Experiencia'}
          </span>
          {/* QA: X de cerrar con efecto hover rojo */}
          <button 
            className="btn-close" 
            onClick={onCancel}
            style={{ transition: '0.2s' }}
            onMouseEnter={(e) => e.target.style.filter = 'invert(14%) sepia(91%) saturate(6594%) hue-rotate(358deg) brightness(95%) contrast(112%)'}
            onMouseLeave={(e) => e.target.style.filter = 'none'}
          ></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-4">
          <div className="row g-3">
            
            {/* Tiquear Tipo de Experiencia (Radios) - CONSERVADO EXACTAMENTE IGUAL */}
            <div className="col-12 mb-2">
              <label className="form-label d-block fw-bold small text-muted text-uppercase">Tipo:</label>
              <div className="d-flex gap-4">
                <div className="form-check">
                  <input className="form-check-input" type="radio" name="tipo_experiencia" id="lab" 
                    checked={formData.tipo_experiencia === 'Laboral'} 
                    onChange={() => setFormData({...formData, tipo_experiencia: 'Laboral'})} />
                  <label className="form-check-label" htmlFor="lab">💼 Laboral</label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" type="radio" name="tipo_experiencia" id="acad" 
                    checked={formData.tipo_experiencia === 'Académica'} 
                    onChange={() => setFormData({...formData, tipo_experiencia: 'Académica'})} />
                  <label className="form-check-label" htmlFor="acad">🎓 Académica</label>
                </div>
              </div>
            </div>

            {/* LETRAS Y PLACEHOLDERS CONSERVADOS EXACTAMENTE IGUAL */}
            <div className="col-md-6">
              <label className="form-label fw-bold small">Empresa / Institución *</label>
              <input type="text" className="form-control" required placeholder="Ej: Google, UPB, Freelance..."
                value={formData.empresa} onChange={e => setFormData({...formData, empresa: e.target.value})} />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold small">Puesto / Cargo *</label>
              <input type="text" className="form-control" required placeholder="Ej: Desarrollador, Docente..."
                value={formData.puesto} onChange={e => setFormData({...formData, puesto: e.target.value})} />
            </div>

            <div className="col-12">
              <label className="form-label fw-bold small">Descripción de tareas</label>
              <textarea className="form-control" rows="3" placeholder="Describe qué hiciste..."
                value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold small">Fecha Inicio</label>
              <input type="date" className="form-control" value={formData.fecha_inicio} 
                onChange={e => setFormData({...formData, fecha_inicio: e.target.value})} />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold small">Fecha Fin</label>
              <input type="date" className="form-control" disabled={formData.actual} value={formData.fecha_fin} 
                onChange={e => setFormData({...formData, fecha_fin: e.target.value})} />
            </div>
            
            <div className="col-12 mt-0">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" checked={formData.actual} id="checkAct"
                  onChange={e => setFormData({...formData, actual: e.target.checked, fecha_fin: ''})} />
                <label className="form-check-label small" htmlFor="checkAct">Sigo trabajando/estudiando aquí</label>
              </div>
            </div>
          </div>

          <div className="d-flex gap-2 mt-4 pt-3 border-top justify-content-end bg-light p-3">
            {/* QA: Botón Cancelar con efecto hover rojo */}
            <button 
              type="button" 
              className="btn px-4" 
              onClick={onCancel}
              style={{ 
                color: '#6c757d', 
                transition: '0.3s',
                border: '1px solid #dee2e6',
                backgroundColor: 'white'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#dc3545';
                e.target.style.color = 'white';
                e.target.style.borderColor = '#dc3545';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.color = '#6c757d';
                e.target.style.borderColor = '#dee2e6';
              }}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary px-4" style={{ backgroundColor: 'var(--azul)', borderRadius: '4px' }}>
              {editData ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}