import { createPortal } from 'react-dom';
import { FiFileText, FiImage, FiMonitor, FiX } from 'react-icons/fi';

const FORMAT_OPTIONS = [
  {
    id: 'png',
    label: 'Imagen PNG',
    meta: 'Imagen completa',
    icon: <FiImage />,
  },
  {
    id: 'jpg',
    label: 'Imagen JPG',
    meta: 'Imagen liviana',
    icon: <FiImage />,
  },
  {
    id: 'pdf',
    label: 'PDF',
    meta: 'Paginas automaticas',
    icon: <FiFileText />,
  },
  {
    id: 'pptx',
    label: 'PPTX',
    meta: 'Slides automaticos',
    icon: <FiMonitor />,
  },
];

export default function ViewDownloadModal({
  open,
  exporting = '',
  error = '',
  onClose,
  onExport,
}) {
  if (!open) return null;

  return createPortal(
    <div
      className="export-overlay"
      onClick={event => {
        if (event.target === event.currentTarget && !exporting) {
          onClose();
        }
      }}
    >
      <div
        className="export-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Descargar portafolio"
      >
        <div className="export-head">
          <div>
            <div className="export-title">Descargar portafolio</div>
            <div className="export-subtitle">Elige el formato de salida</div>
          </div>

          <button
            type="button"
            className="export-close"
            onClick={onClose}
            disabled={Boolean(exporting)}
            aria-label="Cerrar"
          >
            <FiX />
          </button>
        </div>

        <div className="export-options">
          {FORMAT_OPTIONS.map(option => {
            const active = exporting === option.id;

            return (
              <button
                key={option.id}
                type="button"
                className={`export-option ${active ? 'loading' : ''}`}
                onClick={() => onExport(option.id)}
                disabled={Boolean(exporting)}
              >
                <span className="export-option-icon">
                  {option.icon}
                </span>

                <span className="export-option-copy">
                  <span className="export-option-label">
                    {active ? 'Preparando...' : option.label}
                  </span>
                  <span className="export-option-meta">{option.meta}</span>
                </span>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="export-error" role="alert">
            {error}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
