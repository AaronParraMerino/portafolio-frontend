import React, { useState, useEffect } from 'react';

export default function ExperienceForm({ onSave, onCancel, editData }) {
  const [formData, setFormData] = useState({
    tipo_experiencia: 'Laboral',
    empresa: '',
    puesto: '',
    fecha_inicio: '',
    fecha_fin: '',
    actual: false,
    descripcion: ''
  });
  const [error, setError] = useState('');

  // QA: Función para obtener la fecha de hoy y limitar los calendarios
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  useEffect(() => {
    if (editData) setFormData(editData);
  }, [editData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.empresa || !formData.puesto || !formData.fecha_inicio) {
      setError('Por favor, completa los campos obligatorios (*).');
      return;
    }
    // Validación sistémica de fechas
    if (!formData.actual && formData.fecha_fin && formData.fecha_inicio > formData.fecha_fin) {
      setError('La fecha de inicio no puede ser posterior a la fecha de fin.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="card shadow-sm border-0 p-4 mb-4" style={{ backgroundColor: 'var(--blanco)' }}>
      <h4 className="fw-bold mb-4" style={{ color: 'var(--azul)' }}>
        {editData ? '✏️ Actualizar Registro' : '➕ Nueva Experiencia'}
      </h4>
      
      {error && <div className="alert alert-danger py-2 small">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-12 mb-2">
            <label className="form-label fw-bold d-block small">Tipo de Experiencia</label>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" name="tipoExp" id="lab" value="Laboral" 
                checked={formData.tipo_experiencia === 'Laboral'} 
                onChange={e => setFormData({...formData, tipo_experiencia: e.target.value})} />
              <label className="form-check-label small" htmlFor="lab">Trabajo</label>
            </div>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" name="tipoExp" id="acad" value="Académica" 
                checked={formData.tipo_experiencia === 'Académica'} 
                onChange={e => setFormData({...formData, tipo_experiencia: e.target.value})} />
              <label className="form-check-label small" htmlFor="acad">Académico</label>
            </div>
          </div>

          <div className="col-md-6 mb-2">
            <label className="form-label fw-bold small">Empresa / Institución *</label>
            <input type="text" className="form-control" value={formData.empresa}
              onChange={e => setFormData({...formData, empresa: e.target.value})} placeholder="Ej: Universidad Mayor de San Simon" />
          </div>

          <div className="col-md-6 mb-2">
            <label className="form-label fw-bold small">Cargo / Rol *</label>
            <input type="text" className="form-control" value={formData.puesto}
              onChange={e => setFormData({...formData, puesto: e.target.value})} placeholder="Ej: Analista de Sistemas/ Docente" />
          </div>
          
          <div className="col-md-6 mb-2">
            <label className="form-label fw-bold small">Fecha Inicio *</label>
            <input type="date" className="form-control" 
              max={getTodayDate()} // QA: Límite al día de hoy
              value={formData.fecha_inicio}
              onChange={e => setFormData({...formData, fecha_inicio: e.target.value})} />
          </div>
          
          <div className="col-md-6 mb-2">
            <label className="form-label fw-bold small">Fecha Fin</label>
            <input type="date" className="form-control" 
              max={getTodayDate()} // QA: Límite al día de hoy
              value={formData.fecha_fin} 
              disabled={formData.actual}
              onChange={e => setFormData({...formData, fecha_fin: e.target.value})} />
          </div>

          <div className="col-12 mb-3">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" checked={formData.actual} id="checkActual"
                onChange={e => setFormData({...formData, actual: e.target.checked, fecha_fin: e.target.checked ? '' : formData.fecha_fin})} />
              <label className="form-check-label small" htmlFor="checkActual">Es mi ocupación actual</label>
            </div>
          </div>

          <div className="col-12 mb-3">
            <label className="form-label fw-bold small">Descripción (Cursos, logros, tareas)</label>
            <textarea className="form-control" rows="3" value={formData.descripcion}
              onChange={e => setFormData({...formData, descripcion: e.target.value})}></textarea>
          </div>
        </div>

        <div className="d-flex gap-3 mt-3">
          <button type="button" className="btn btn-light w-50" onClick={onCancel}>Cancelar</button>
          <button type="submit" className="btn text-white w-50" style={{ backgroundColor: 'var(--azul)' }}>
            {editData ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}