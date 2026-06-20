import { FiArrowLeft, FiRefreshCw, FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../../../core/i18n';
import DeveloperCard from '../components/DeveloperCard';
import DeveloperSearch from '../components/DeveloperSearch';
import DevelopersPagination from '../components/DevelopersPagination';
import useDevelopers from '../hooks/useDevelopers';
import PublicCatalogSkeleton from '../../shared/PublicCatalogSkeleton';
import '../styles/developers.css';
import '../../shared/publicCatalog.css';

export default function DevelopersPage() {
  const { t } = useLanguage();
  const {
    developers,
    meta,
    summary,
    loading,
    error,
    query,
    submittedQuery,
    setQuery,
    search,
    clearSearch,
    goToPage,
    refresh,
  } = useDevelopers();

  const hasDevelopers = developers.length > 0;
  const countLabel = loading
    ? 'Cargando desarrolladores...'
    : summary.total > 0
      ? `Mostrando ${summary.from}-${summary.to} de ${summary.total}`
      : 'Sin resultados';

  return (
    <main className="dev-page pubcat-page">
      <section className="dev-shell pubcat-shell">
        <header className="dev-header pubcat-header">
          <div>
            <div className="dev-kicker pubcat-kicker">
              <FiUsers aria-hidden="true" />
              Comunidad publica
            </div>
            <h1>Desarrolladores activos</h1>
            <p>
              Perfiles ordenados por actividad reciente en sus portafolios.
            </p>
          </div>

          <div className="pubcat-actions">
            <button type="button" onClick={refresh} disabled={loading}>
              <FiRefreshCw />
              {t('public.developers.refresh')}
            </button>
            <Link to="/">
              <FiArrowLeft />
              {t('public.developers.backHome')}
            </Link>
          </div>
        </header>

        <div className="dev-count-card pubcat-summary" aria-live="polite">
          <span>{countLabel}</span>
          <strong>{t('public.developers.page', { current: summary.currentPage, last: meta.last_page || 1 })}</strong>
        </div>

        <div className="dev-toolbar pubcat-toolbar">
          <DeveloperSearch
            value={query}
            loading={loading}
            onChange={setQuery}
            onSearch={search}
            onClear={clearSearch}
          />

          {submittedQuery && (
            <div className="dev-active-search">
              Nombre: <strong>{submittedQuery}</strong>
            </div>
          )}
        </div>

        {error && (
          <div className="dev-state dev-state-error pubcat-state is-error" role="alert">
            <FiRefreshCw aria-hidden="true" />
            <div>
              <strong>No se pudo cargar la lista</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        <section className="dev-grid pubcat-grid" aria-live="polite">
          {loading && <PublicCatalogSkeleton count={9} />}

          {!loading && !error && hasDevelopers && developers.map((developer, index) => (
            <DeveloperCard
              key={developer.id_usuario || developer.usuario_id || developer.id || index}
              developer={developer}
            />
          ))}
        </section>

        {!loading && !error && !hasDevelopers && (
          <div className="dev-state pubcat-state">
            <FiUsers aria-hidden="true" />
            <div>
              <strong>No encontramos desarrolladores</strong>
              <span>Prueba con otro nombre o limpia la busqueda.</span>
            </div>
          </div>
        )}

        {!error && (
          <DevelopersPagination
            currentPage={meta.current_page || summary.currentPage}
            lastPage={meta.last_page || 1}
            loading={loading}
            onPageChange={goToPage}
          />
        )}
      </section>
    </main>
  );
}
