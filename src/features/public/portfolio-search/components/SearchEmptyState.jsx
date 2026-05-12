const SearchEmptyState = ({ hasSearched = false, authRequired = false, onClear }) => {
  let title = 'Busca portafolios profesionales';
  let description = 'Usa el buscador o aplica filtros por ubicación, habilidades, experiencia y proyectos.';
  let code = 'BF';

  if (authRequired) {
    title = 'Inicia sesión para buscar portafolios';
    description = 'La búsqueda está disponible fuera del dashboard, pero el backend requiere una sesión activa para devolver resultados.';
    code = 'AU';
  } else if (hasSearched) {
    title = 'No se encontraron portafolios relacionados';
    description = 'Intenta ajustar los filtros, cambiar el término de búsqueda o limpiar la búsqueda.';
    code = 'SR';
  }

  return (
    <div className="ps-empty-state">
      <div className="ps-empty-icon" aria-hidden="true">{code}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {hasSearched && onClear && !authRequired && (
        <button type="button" className="ps-btn-secondary danger-hover" onClick={onClear}>
          Limpiar filtros
        </button>
      )}
    </div>
  );
};

export default SearchEmptyState;
