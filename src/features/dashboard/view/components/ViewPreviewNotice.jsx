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
        ? 'No se pudo actualizar desde backend. Se mantiene la informacion en cache.'
        : 'Algunas secciones usan datos locales porque no respondieron todos los endpoints.';

  return (
    <div className={`preview-notice ${isMock ? 'mock' : ''} ${isPartial ? 'partial' : ''} ${isCache ? 'cache' : ''}`}>
      <svg viewBox="0 0 14 14">
        <circle cx="7" cy="7" r="6" />
        <path d="M7 6v4M7 3.8v.2" />
      </svg>

      <span>
        <strong>{loading ? 'Sincronizando:' : 'Vista previa:'}</strong> {message}
        {error && <small>{error}</small>}
      </span>
    </div>
  );
}
