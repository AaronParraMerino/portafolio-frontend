// src/features/dashboard/view/components/ViewPreviewNotice.jsx

export default function ViewPreviewNotice({
  loading = false,
  dataSource = 'backend',
  error = null,
}) {
  const isMock = dataSource === 'mock';
  const isPartial = dataSource === 'partial';
  const isCache = dataSource === 'cache';

  if (!loading && dataSource === 'backend') return null;
  if (!loading && isCache && !error) return null;

  const message = loading
    ? isCache
      ? 'Mostrando datos en cache mientras se actualiza el perfil.'
      : 'Cargando datos reales del portafolio...'
    : isMock
      ? 'No se pudo conectar con backend. Se muestran datos mock para mantener la vista editable.'
      : isCache
        ? 'No se pudo actualizar desde backend. Se mantiene la información en cache.'
        : 'Algunas secciones usan datos locales porque no respondieron todos los endpoints.';

  return (
    <div
      className={`preview-notice ${loading ? 'loading' : ''} ${isMock ? 'mock' : ''} ${isPartial ? 'partial' : ''} ${isCache ? 'cache' : ''}`}
      role="status"
      aria-live="polite"
    >
      <span className="preview-notice-icon" aria-hidden="true">
        {loading ? (
          <span className="preview-notice-spinner" />
        ) : (
          <svg
            viewBox="0 0 14 14"
            width="14"
            height="14"
            focusable="false"
          >
            <circle cx="7" cy="7" r="6" />
            <path d="M7 6v4M7 3.8v.2" />
          </svg>
        )}
      </span>

      <span className="preview-notice-text">
        <strong>
          {loading ? 'Sincronizando:' : 'Vista previa:'}
        </strong>{' '}
        {message}

        {error && (
          <small>
            {error}
          </small>
        )}
      </span>
    </div>
  );
}