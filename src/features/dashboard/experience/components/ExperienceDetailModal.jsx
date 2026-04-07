import React from 'react';

export default function ExperienceDetailModal({ exp, onClose }) {
  if (!exp) return null;

  return (
    <div className="prf-modal-overlay" style={{ zIndex: 1100, backgroundColor: 'rgba(0,0,0,0.6)' }}>
      {/* QA: border-radius: 4px para que sea igual al perfil (sin puntas redondas) */}
      <div className="prf-modal-content p-0 bg-white shadow-lg" style={{ maxWidth: '550px', borderRadius: '4px', overflow: 'hidden', border: 'none' }}>
        
        {/* Cabecera con degradado y X dinámica */}
        <div className="p-4 text-white d-flex justify-content-between align-items-start" style={{ background: 'linear-gradient(135deg, var(--azul) 0%, #004a74 100%)' }}>
          <div>
            <span className="badge bg-white text-primary mb-2 fw-bold" style={{ fontSize: '10px' }}>{exp.tipo_experiencia}</span>
            <h4 className="fw-bold mb-0">{exp.puesto}</h4>
          </div>
          <button 
            className="btn-close btn-close-white" 
            onClick={onClose}
            style={{ transition: '0.2s' }}
            onMouseEnter={(e) => e.target.style.filter = 'invert(14%) sepia(91%) saturate(6594%) hue-rotate(358deg) brightness(95%) contrast(112%)'}
            onMouseLeave={(e) => e.target.style.filter = 'none'}
          ></button>
        </div>

        {/* Cuerpo con Scroll vertical y fijación de texto (word-break) */}
        <div className="p-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <div className="mb-4">
            <p className="mb-1 text-muted small fw-bold">EMPRESA / INSTITUCIÓN</p>
            <p className="text-dark fw-medium">{exp.empresa}</p>
            
            <p className="mb-1 text-muted small fw-bold mt-3">PERIODO</p>
            <p className="text-dark">📅 {exp.fecha_inicio} — {exp.actual ? 'Actualidad' : exp.fecha_fin}</p>
          </div>

          <div className="p-3 bg-light" style={{ borderLeft: '4px solid var(--azul)', borderRadius: '2px' }}>
            <p className="mb-1 text-muted small fw-bold">DESCRIPCIÓN</p>
            {/* QA Fix: wordBreak forzado para que el texto no se salga del cuadro */}
            <p className="text-dark mb-0" style={{ 
              whiteSpace: 'pre-wrap', 
              lineHeight: '1.6', 
              wordBreak: 'break-word', 
              overflowWrap: 'anywhere' 
            }}>
              {exp.descripcion || "Sin descripción detallada."}
            </p>
          </div>
        </div>

        {/* Footer con botón que cambia de Gris a Rojo */}
        <div className="p-3 border-top text-end bg-light">
          <button 
            className="btn px-4 fw-bold" 
            style={{ 
              backgroundColor: '#6c757d', 
              color: 'white', 
              borderRadius: '4px',
              transition: '0.3s',
              border: 'none'
            }} 
            onClick={onClose}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#dc3545'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#6c757d'}
          >
            Cerrar detalle
          </button>
        </div>
      </div>
    </div>
  );
}