// src/features/dashboard/view/components/ViewPreviewNotice.jsx
import { useLanguage } from '../../../../core/i18n';

export default function ViewPreviewNotice({
  loading = false,
  dataSource = 'backend',
  error = null,
}) {
  const { t } = useLanguage();
  const isPartial = dataSource === 'partial';
  const isCache = dataSource === 'cache';
  const isError = dataSource === 'error';

  if (!loading && dataSource === 'backend') return null;
  if (!loading && isCache && !error) return null;

  const message = loading
    ? isCache
      ? t('view.preview.cacheUpdating')
      : t('view.preview.loading')
    : isCache
      ? t('view.preview.cache')
      : isError
        ? t('view.preview.error')
        : t('view.preview.partial');

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
          {loading ? t('view.preview.syncing') : isError ? t('view.preview.errorLabel') : t('view.preview.previewLabel')}
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
