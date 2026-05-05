import React from 'react';

const formatDateFull = (fechaStr) => {
  if (!fechaStr) return '';
  const [year, month, day] = String(fechaStr).slice(0, 10).split('-');
  if (!year || !month || !day) return fechaStr;
  return `${day}/${month}/${year}`;
};

export default function ExperienceDetailModal({ exp, onClose }) {
  if (!exp) return null;

  return (
    <>
      <style>{`
        .edm-overlay {
          position: fixed;
          inset: 0;
          z-index: 1100;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          overflow-y: auto;
        }

        .edm-modal {
          width: 100%;
          max-width: 550px;
          max-height: calc(100dvh - 24px);
          border-radius: 14px;
          overflow: hidden;
          border: 1.5px solid var(--gris-borde);
          font-family: var(--font);
          background: var(--blanco);
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 50px rgba(0,0,0,0.25);
        }

        .edm-header {
          flex-shrink: 0;
          padding: 18px 20px;
          background: linear-gradient(135deg, var(--azul) 0%, var(--azul-deep) 100%);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          color: white;
        }

        .edm-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: var(--blanco);
        }

        .edm-footer {
          flex-shrink: 0;
          padding: 12px 16px;
          border-top: 1px solid var(--gris-borde);
          background: var(--fondo);
          text-align: right;
        }

        @media (max-width: 480px) {
          .edm-overlay {
            padding: 8px;
            align-items: flex-end;
          }
          .edm-modal {
            border-radius: 12px 12px 0 0;
            max-height: calc(100dvh - 8px);
          }
          .edm-header {
            padding: 14px 16px;
          }
          .edm-body {
            padding: 16px;
          }
        }
      `}</style>

      <div className="edm-overlay">
        <div className="edm-modal">

          {/* Cabecera */}
          <div className="edm-header">
            <div>
              <span
                className="badge bg-white fw-bold mb-2 d-inline-block"
                style={{ fontSize: '10px', color: 'var(--azul)' }}
              >
                {exp.tipo_experiencia}
              </span>
              <h4 className="fw-bold mb-0" style={{ fontSize: 'clamp(1rem, 4vw, 1.25rem)' }}>
                {exp.puesto}
              </h4>
            </div>
            <button
              className="btn-close btn-close-white ms-3"
              onClick={onClose}
              style={{ flexShrink: 0, transition: '0.2s' }}
              onMouseEnter={(e) => e.target.style.filter = 'invert(14%) sepia(91%) saturate(6594%) hue-rotate(358deg) brightness(95%) contrast(112%)'}
              onMouseLeave={(e) => e.target.style.filter = 'none'}
            />
          </div>

          {/* Cuerpo */}
          <div className="edm-body">
            <div className="mb-4">
              <p className="mb-1 small fw-bold" style={{ color: 'var(--gris-texto)' }}>
                EMPRESA / INSTITUCIÓN
              </p>
              <p className="fw-medium mb-0" style={{ color: 'var(--negro-texto)' }}>
                {exp.empresa}
              </p>

              <p className="mb-1 small fw-bold mt-3" style={{ color: 'var(--gris-texto)' }}>PERIODO</p>
              <p className="mb-0" style={{ color: 'var(--negro-texto)' }}>
                📅 {formatDateFull(exp.fecha_inicio)} — {exp.actual ? 'Actualidad' : formatDateFull(exp.fecha_fin)}
              </p>
            </div>

            <div
              className="p-3"
              style={{
                background: 'var(--azul-light)',
                borderLeft: '4px solid var(--azul)',
                borderRadius: '6px',
              }}
            >
              <p className="mb-1 small fw-bold" style={{ color: 'var(--gris-texto)' }}>DESCRIPCIÓN</p>
              <p
                className="mb-0"
                style={{
                  color: 'var(--negro-texto)',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6',
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere',
                  fontFamily: 'var(--font)',
                }}
              >
                {exp.descripcion || 'Sin descripción detallada.'}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="edm-footer">
            <button
              className="btn px-4 fw-bold"
              style={{
                backgroundColor: 'var(--gris-oscuro)',
                color: 'var(--blanco)',
                borderRadius: '4px',
                transition: '0.3s',
                border: 'none',
                fontFamily: 'var(--font)',
              }}
              onClick={onClose}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--rojo-soft)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--gris-oscuro)'}
            >
              Cerrar detalle
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
