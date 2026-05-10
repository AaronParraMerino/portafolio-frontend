import React from "react";

const formatDateFull = (fechaStr) => {
  if (!fechaStr) return "Sin fecha";

  const [year, month, day] = String(fechaStr).slice(0, 10).split("-");
  if (!year || !month || !day) return fechaStr;

  return `${day}/${month}/${year}`;
};

export default function ExperienceDetailModal({ exp, onClose }) {
  if (!exp) return null;

  const isAcademica = exp.tipo_experiencia === "Académica";

  const fechaInicio = formatDateFull(exp.fecha_inicio);
  const fechaFin = exp.actual
    ? "Actualidad"
    : formatDateFull(exp.fecha_fin);

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <style>{`
        .edm-overlay {
          position: fixed;
          inset: 0;
          z-index: 1100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
          background: rgba(17, 24, 39, .58);
          backdrop-filter: blur(5px);
          overflow-y: auto;
        }

        .edm-modal {
          width: 100%;
          max-width: 620px;
          max-height: calc(100dvh - 36px);
          background: var(--blanco);
          border: 1.5px solid var(--gris-borde);
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          font-family: var(--font);
          box-shadow: 0 24px 70px rgba(0, 0, 0, .26);
          animation: edm-pop .18s ease-out;
        }

        @keyframes edm-pop {
          from {
            opacity: 0;
            transform: translateY(12px) scale(.985);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .edm-card-shell {
          display: flex;
          min-height: 100%;
          overflow: hidden;
        }

        .edm-left-panel {
          width: 7px;
          flex-shrink: 0;
          background: var(--azul);
        }

        .edm-modal.is-academica .edm-left-panel {
          background: var(--azul-deep);
        }

        .edm-main {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .edm-header {
          flex-shrink: 0;
          padding: 20px 22px 16px;
          border-bottom: 1px solid var(--gris-borde);
          background: var(--blanco);
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .edm-title-zone {
          min-width: 0;
          flex: 1;
        }

        .edm-top-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 10px;
        }

        .edm-badges {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
        }

        .edm-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: var(--mono);
          font-size: 9px;
          font-weight: 500;
          letter-spacing: .08em;
          text-transform: uppercase;
          padding: 2px 9px;
          border-radius: 20px;
          line-height: 1.45;
        }

        .edm-badge.is-laboral {
          color: var(--azul);
          background: var(--azul-light);
          border: 1px solid var(--azul-mid);
        }

        .edm-badge.is-academica {
          color: var(--azul-deep);
          background: #ddeaf8;
          border: 1px solid #b8d0ec;
        }

        .edm-current {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-family: var(--mono);
          font-size: 9px;
          font-weight: 500;
          color: #059669;
          background: var(--verde-bg);
          border: 1px solid var(--verde-borde);
          padding: 2px 9px;
          border-radius: 20px;
          line-height: 1.45;
        }

        .edm-current::before {
          content: "●";
          font-size: 7px;
          animation: edm-blink 2s infinite;
        }

        @keyframes edm-blink {
          0%, 100% {
            opacity: .35;
          }

          50% {
            opacity: 1;
          }
        }

        .edm-dates {
          font-family: var(--mono);
          font-size: 10px;
          color: var(--gris-texto);
          white-space: nowrap;
          padding-top: 2px;
        }

        .edm-title {
          margin: 0;
          color: var(--negro-texto);
          font-size: clamp(1.08rem, 2vw, 1.35rem);
          font-weight: 800;
          line-height: 1.22;
          letter-spacing: -.02em;
          word-break: break-word;
          overflow-wrap: anywhere;
        }

        .edm-org {
          margin-top: 7px;
          color: var(--azul);
          font-size: .9rem;
          font-weight: 700;
          line-height: 1.35;
          word-break: break-word;
          overflow-wrap: anywhere;
        }

        .edm-modal.is-academica .edm-org {
          color: var(--azul-deep);
        }

        .edm-close {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          border: 1.5px solid var(--gris-borde);
          border-radius: 10px;
          background: var(--blanco);
          color: var(--gris-oscuro);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          line-height: 1;
          cursor: pointer;
          transition: transform .16s ease, background .16s ease, color .16s ease, border-color .16s ease;
        }

        .edm-close:hover {
          transform: translateY(-1px);
          color: var(--rojo-soft);
          background: var(--rojo-chip);
          border-color: var(--rojo-soft);
        }

        .edm-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px 22px 22px;
          background: var(--blanco);
        }

        .edm-info-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }

        .edm-info-box {
          border: 1.5px solid var(--gris-borde);
          border-radius: 12px;
          background: var(--fondo);
          padding: 13px 14px;
          min-width: 0;
        }

        .edm-label {
          margin: 0 0 5px;
          color: var(--gris-texto);
          font-family: var(--mono);
          font-size: 10px;
          font-weight: 500;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .edm-value {
          margin: 0;
          color: var(--negro-texto);
          font-size: .9rem;
          font-weight: 700;
          line-height: 1.4;
          word-break: break-word;
          overflow-wrap: anywhere;
        }

        .edm-description {
          border: 1.5px solid var(--gris-borde);
          border-radius: 12px;
          background: var(--blanco);
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, .035);
        }

        .edm-description-head {
          padding: 12px 15px;
          border-bottom: 1px solid var(--gris-borde);
          background: var(--fondo);
        }

        .edm-description-body {
          padding: 15px;
          border-left: 4px solid var(--azul);
        }

        .edm-modal.is-academica .edm-description-body {
          border-left-color: var(--azul-deep);
        }

        .edm-description-text {
          margin: 0;
          color: var(--gris-texto);
          font-size: .88rem;
          line-height: 1.75;
          white-space: pre-wrap;
          word-break: break-word;
          overflow-wrap: anywhere;
        }

        .edm-footer {
          flex-shrink: 0;
          padding: 13px 18px;
          border-top: 1px solid var(--gris-borde);
          background: var(--fondo);
          display: flex;
          justify-content: flex-end;
        }

        .edm-footer-btn {
          min-height: 36px;
          border: none;
          border-radius: 9px;
          background: var(--gris-oscuro);
          color: var(--blanco);
          padding: 8px 18px;
          font-family: var(--font);
          font-size: .84rem;
          font-weight: 800;
          cursor: pointer;
          transition: transform .16s ease, background .16s ease, box-shadow .16s ease;
        }

        .edm-footer-btn:hover {
          transform: translateY(-1px);
          background: var(--rojo-soft);
          box-shadow: 0 5px 14px rgba(232, 85, 85, .22);
        }

        @media (max-width: 560px) {
          .edm-overlay {
            padding: 8px;
            align-items: flex-end;
          }

          .edm-modal {
            max-height: calc(100dvh - 8px);
            border-radius: 16px 16px 0 0;
          }

          .edm-header {
            padding: 17px 16px 14px;
          }

          .edm-body {
            padding: 16px;
          }

          .edm-info-grid {
            grid-template-columns: 1fr;
          }

          .edm-dates {
            white-space: normal;
          }

          .edm-footer {
            padding: 12px 16px;
          }

          .edm-footer-btn {
            width: 100%;
          }
        }
      `}</style>

      <div
        className="edm-overlay"
        onClick={handleOverlayClick}
        role="presentation"
      >
        <section
          className={`edm-modal ${isAcademica ? "is-academica" : "is-laboral"}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edm-title"
        >
          <div className="edm-card-shell">
            <div className="edm-left-panel" />

            <div className="edm-main">
              <header className="edm-header">
                <div className="edm-title-zone">
                  <div className="edm-top-row">
                    <div className="edm-badges">
                      <span
                        className={`edm-badge ${
                          isAcademica ? "is-academica" : "is-laboral"
                        }`}
                      >
                        {isAcademica ? "Académico" : "Laboral"}
                      </span>

                      {exp.actual && (
                        <span className="edm-current">
                          Actual
                        </span>
                      )}
                    </div>

                    <span className="edm-dates">
                      {fechaInicio} — {fechaFin}
                    </span>
                  </div>

                  <h2 id="edm-title" className="edm-title">
                    {exp.puesto}
                  </h2>

                  <div className="edm-org">
                    {exp.empresa}
                  </div>
                </div>

                <button
                  type="button"
                  className="edm-close"
                  onClick={onClose}
                  aria-label="Cerrar detalle"
                  title="Cerrar"
                >
                  ×
                </button>
              </header>

              <div className="edm-body">
                <div className="edm-info-grid">
                  <div className="edm-info-box">
                    <p className="edm-label">Tipo</p>
                    <p className="edm-value">
                      {isAcademica ? "Experiencia académica" : "Experiencia laboral"}
                    </p>
                  </div>

                  <div className="edm-info-box">
                    <p className="edm-label">Periodo</p>
                    <p className="edm-value">
                      {fechaInicio} — {fechaFin}
                    </p>
                  </div>
                </div>

                <div className="edm-description">
                  <div className="edm-description-head">
                    <p className="edm-label">
                      Descripción
                    </p>
                  </div>

                  <div className="edm-description-body">
                    <p className="edm-description-text">
                      {exp.descripcion || "Sin descripción detallada."}
                    </p>
                  </div>
                </div>
              </div>

              <footer className="edm-footer">
                <button
                  type="button"
                  className="edm-footer-btn"
                  onClick={onClose}
                >
                  Cerrar detalle
                </button>
              </footer>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}