import { createPortal } from 'react-dom';
import { useLanguage } from '../../../../core/i18n';
import {
  DashboardCloseIcon,
  DashboardFileIcon,
  DashboardImageIcon,
  DashboardScreenIcon,
} from '../../layout/DashboardIcons';

const FORMAT_OPTIONS = [
  {
    id: 'png',
    labelKey: 'view.download.format.png.label',
    metaKey: 'view.download.format.png.meta',
    icon: <DashboardImageIcon />,
  },
  {
    id: 'jpg',
    labelKey: 'view.download.format.jpg.label',
    metaKey: 'view.download.format.jpg.meta',
    icon: <DashboardImageIcon />,
  },
  {
    id: 'pdf',
    labelKey: 'view.download.format.pdf.label',
    metaKey: 'view.download.format.pdf.meta',
    icon: <DashboardFileIcon />,
  },
  {
    id: 'pptx',
    labelKey: 'view.download.format.pptx.label',
    metaKey: 'view.download.format.pptx.meta',
    icon: <DashboardScreenIcon />,
  },
];

export default function ViewDownloadModal({
  open,
  exporting = '',
  error = '',
  onClose,
  onExport,
}) {
  const { t } = useLanguage();

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
        aria-label={t('view.download.title')}
      >
        <div className="export-head">
          <div>
            <div className="export-title">{t('view.download.title')}</div>
            <div className="export-subtitle">{t('view.download.subtitle')}</div>
          </div>

          <button
            type="button"
            className="export-close"
            onClick={onClose}
            disabled={Boolean(exporting)}
            aria-label={t('actions.close')}
          >
            <DashboardCloseIcon />
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
                    {active ? t('view.download.preparing') : t(option.labelKey)}
                  </span>
                  <span className="export-option-meta">{t(option.metaKey)}</span>
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
