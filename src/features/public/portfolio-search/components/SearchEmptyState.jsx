const SearchEmptyState = ({ hasSearched = false, onClear }) => (
  <div className="ps-empty-state">
    <div className="ps-empty-icon" aria-hidden="true">PF</div>
    <h3>{hasSearched ? 'No se encontraron portafolios relacionados' : 'Busca portafolios profesionales'}</h3>
    <p>
      {hasSearched
        ? 'Intenta ajustar los filtros, cambiar el término de búsqueda o limpiar la búsqueda.'
        : 'Usa el buscador o aplica filtros por ubicación, habilidades, experiencia y proyectos.'}
    </p>
    {hasSearched && onClear && (
      <button type="button" className="ps-btn-secondary danger-hover" onClick={onClear}>
        Limpiar filtros
      </button>
    )}
  </div>
);

export default SearchEmptyState;
