import React from "react";

export default function ExperienceToast({ toast }) {
  if (!toast) return null;

  const isError = toast.tipo === "error";
  const isWarning = toast.tipo === "warning";

  const typeClass = isError
    ? "is-error"
    : isWarning
      ? "is-warning"
      : "is-ok";

  const icon = isError ? "!" : isWarning ? "!" : "✓";
  const title = isError
    ? "Ocurrió un problema"
    : isWarning
      ? "Atención"
      : "Operación exitosa";

  return (
    <>
      <style>{`
        .experience-toast-wrap {
          position: fixed;
          right: 22px;
          bottom: 22px;
          z-index: 1300;
          width: min(390px, calc(100vw - 32px));
          pointer-events: none;
        }

        .experience-toast {
          pointer-events: auto;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 15px;
          border-radius: 14px;
          border: 1.5px solid var(--gris-borde);
          background: var(--blanco);
          box-shadow: 0 14px 38px rgba(0, 0, 0, .16);
          font-family: var(--font);
          overflow: hidden;
          position: relative;
          animation: experience-toast-in .22s ease-out;
        }

        .experience-toast::before {
          content: "";
          position: absolute;
          inset: 0 auto 0 0;
          width: 6px;
          background: var(--azul);
        }

        .experience-toast.is-ok::before {
          background: var(--verde);
        }

        .experience-toast.is-error::before {
          background: var(--rojo-soft);
        }

        .experience-toast.is-warning::before {
          background: var(--amarillo);
        }

        @keyframes experience-toast-in {
          from {
            opacity: 0;
            transform: translateY(12px) scale(.985);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .experience-toast-icon {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          margin-left: 4px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: .9rem;
          font-weight: 900;
          line-height: 1;
          font-family: var(--font);
        }

        .experience-toast.is-ok .experience-toast-icon {
          color: #059669;
          background: var(--verde-bg);
          border: 1px solid var(--verde-borde);
        }

        .experience-toast.is-error .experience-toast-icon {
          color: var(--rojo-soft);
          background: var(--rojo-chip);
          border: 1px solid var(--rojo-borde);
        }

        .experience-toast.is-warning .experience-toast-icon {
          color: #b7791f;
          background: var(--amarillo-chip);
          border: 1px solid var(--amarillo-borde);
        }

        .experience-toast-content {
          min-width: 0;
          flex: 1;
          padding-top: 1px;
        }

        .experience-toast-title {
          margin: 0 0 3px;
          color: var(--negro-texto);
          font-size: .88rem;
          font-weight: 800;
          line-height: 1.25;
        }

        .experience-toast-message {
          margin: 0;
          color: var(--gris-texto);
          font-size: .8rem;
          font-weight: 500;
          line-height: 1.45;
          word-break: break-word;
          overflow-wrap: anywhere;
        }

        .experience-toast-meta {
          margin-top: 8px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: var(--gris-texto);
          font-family: var(--mono);
          font-size: 9px;
          font-weight: 500;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .experience-toast-meta::before {
          content: "●";
          font-size: 7px;
        }

        .experience-toast.is-ok .experience-toast-meta::before {
          color: #059669;
        }

        .experience-toast.is-error .experience-toast-meta::before {
          color: var(--rojo-soft);
        }

        .experience-toast.is-warning .experience-toast-meta::before {
          color: var(--amarillo);
        }

        @media (max-width: 560px) {
          .experience-toast-wrap {
            right: 16px;
            left: 16px;
            bottom: 16px;
            width: auto;
          }

          .experience-toast {
            padding: 13px 14px;
            border-radius: 13px;
          }

          .experience-toast-icon {
            width: 30px;
            height: 30px;
          }
        }
      `}</style>

      <div className="experience-toast-wrap">
        <div
          className={`experience-toast ${typeClass}`}
          role="status"
          aria-live="polite"
        >
          <div className="experience-toast-icon">
            {icon}
          </div>

          <div className="experience-toast-content">
            <p className="experience-toast-title">
              {title}
            </p>

            <p className="experience-toast-message">
              {toast.msg}
            </p>

            <div className="experience-toast-meta">
              Experiencia
            </div>
          </div>
        </div>
      </div>
    </>
  );
}