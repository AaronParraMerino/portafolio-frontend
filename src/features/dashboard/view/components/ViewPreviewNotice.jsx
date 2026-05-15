// src/features/dashboard/view/components/ViewPreviewNotice.jsx

export default function ViewPreviewNotice({
  loading = false,
  dataSource = 'backend',
  error = null,
}) {
  const isPartial = dataSource === 'partial';
  const isCache = dataSource === 'cache';
  const isError = dataSource === 'error';

  if (!loading && dataSource === 'backend') return null;
  if (!loading && isCache && !error) return null;

  const message = loading
    ? isCache
      ? 'Mostrando datos en cache mientras se actualiza el perfil.'
      : 'Cargando datos reales del portafolio...'
    : isCache
      ? 'No se pudo actualizar desde backend. Se mantiene la informacion en cache.'
      : isError
        ? 'No se pudo cargar la vista del portafolio desde backend.'
        : 'Algunas secciones no respondieron y se muestran solo los datos disponibles.';

  return (
    <div
      className={`preview-notice ${loading ? 'loading' : ''} ${isError ? 'error' : ''} ${isPartial ? 'partial' : ''} ${isCache ? 'cache' : ''}`}
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
          {loading ? 'Sincronizando:' : isError ? 'Error:' : 'Vista previa:'}
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
