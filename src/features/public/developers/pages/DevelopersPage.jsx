import { FiRefreshCw, FiUsers } from 'react-icons/fi';
import DeveloperCard from '../components/DeveloperCard';
import DeveloperSearch from '../components/DeveloperSearch';
import DevelopersPagination from '../components/DevelopersPagination';
import useDevelopers from '../hooks/useDevelopers';
import '../styles/developers.css';

const skeletonItems = Array.from({ length: 8 }, (_, index) => index + 1);

export default function DevelopersPage() {
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
  } = useDevelopers();

  const hasDevelopers = developers.length > 0;
  const countLabel = loading
    ? 'Cargando desarrolladores...'
    : summary.total > 0
      ? `Mostrando ${summary.from}-${summary.to} de ${summary.total}`
      : 'Sin resultados';

  return (
    <main className="dev-page">
      <section className="dev-shell">
        <header className="dev-header">
          <div>
            <div className="dev-kicker">
              <FiUsers aria-hidden="true" />
              Comunidad publica
            </div>
            <h1>Desarrolladores activos</h1>
            <p>
              Perfiles ordenados por actividad reciente en sus portafolios.
            </p>
          </div>

          <div className="dev-count-card" aria-live="polite">
            <span>{countLabel}</span>
            <strong>Pagina {summary.currentPage} de {meta.last_page || 1}</strong>
          </div>
        </header>

        <div className="dev-toolbar">
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
          <div className="dev-state dev-state-error" role="alert">
            <FiRefreshCw aria-hidden="true" />
            <div>
              <strong>No se pudo cargar la lista</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        <section className="dev-grid" aria-live="polite">
          {loading && skeletonItems.map((item) => (
            <div className="dev-card dev-card-skeleton" key={item}>
              <span />
              <span />
              <span />
            </div>
          ))}

          {!loading && !error && hasDevelopers && developers.map((developer, index) => (
            <DeveloperCard
              key={developer.id_usuario || developer.usuario_id || developer.id || index}
              developer={developer}
            />
          ))}
        </section>

        {!loading && !error && !hasDevelopers && (
          <div className="dev-state">
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
