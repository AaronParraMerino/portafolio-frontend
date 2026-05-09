// src/features/dashboard/view/components/ViewOsFrame.jsx

export default function ViewOsFrame({
  frameId = 'mac',
  title = 'Mi Portafolio',
  children,
}) {
  const cardClass = [
    'pf-card',
        frameId === 'thick' ? 'has-thick-border' : '',
        frameId === 'mac' ? 'has-mac-bar' : '',
        frameId === 'linux' ? 'has-linux-bar' : '',
        frameId === 'windows' ? 'has-win-bar' : '',
        frameId === 'none' ? 'has-no-frame' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClass}>
      <div className={`mac-bar ${frameId === 'mac' ? 'visible' : ''}`}>
        <div className="mac-dots">
          <div className="mac-dot mac-dot-red" />
          <div className="mac-dot mac-dot-yellow" />
          <div className="mac-dot mac-dot-green" />
        </div>

        <div className="mac-title">{title}</div>

        <div className="mac-toolbar-icons">
          <div className="mac-toolbar-icon">
            <svg viewBox="0 0 10 10">
              <path d="M2 5h6" />
            </svg>
          </div>

          <div className="mac-toolbar-icon">
            <svg viewBox="0 0 10 10">
              <rect x="2" y="2" width="6" height="6" rx="1" />
            </svg>
          </div>

          <div className="mac-toolbar-icon">
            <svg viewBox="0 0 10 10">
              <path d="M2 2l6 6M8 2l-6 6" />
            </svg>
          </div>
        </div>
      </div>

      <div className={`linux-bar ${frameId === 'linux' ? 'visible' : ''}`}>
        <div className="linux-title">{title}</div>

        <div className="linux-dots">
          <div className="linux-dot">
            <svg viewBox="0 0 10 10">
              <path d="M2 5h6" />
            </svg>
          </div>

          <div className="linux-dot">
            <svg viewBox="0 0 10 10">
              <rect x="2" y="2" width="6" height="6" rx="1" />
            </svg>
          </div>

          <div className="linux-dot linux-dot-cls">
            <svg viewBox="0 0 10 10">
              <path d="M2.5 2.5l5 5M7.5 2.5l-5 5" />
            </svg>
          </div>
        </div>
      </div>

      <div className={`win-bar ${frameId === 'windows' ? 'visible' : ''}`}>
        <div className="win-icon">
          <svg viewBox="0 0 12 12" fill="currentColor">
            <path d="M0 1.5L5.5 0v5.5H0zM6.5 0L12 1.5V5.5H6.5zM0 6.5h5.5V12L0 10.5zM6.5 6.5H12V10.5L6.5 12z" />
          </svg>
        </div>

        <div className="win-title">{title}</div>

        <div className="win-dots">
          <div className="win-btn">
            <svg viewBox="0 0 10 10">
              <path d="M2 5h6" />
            </svg>
          </div>

          <div className="win-btn">
            <svg viewBox="0 0 10 10">
              <rect x="2" y="2" width="6" height="6" />
            </svg>
          </div>

          <div className="win-btn win-btn-cls">
            <svg viewBox="0 0 10 10">
              <path d="M2.5 2.5l5 5M7.5 2.5l-5 5" />
            </svg>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}