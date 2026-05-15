import { FiSearch, FiX } from 'react-icons/fi';

export default function DeveloperSearch({
  value,
  loading,
  onChange,
  onSearch,
  onClear,
}) {
  return (
    <form
      className="dev-search"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch();
      }}
    >
      <label className="dev-search-field">
        <FiSearch aria-hidden="true" />
        <span className="dev-sr-only">Buscar desarrollador por nombre</span>
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Buscar por nombre..."
          aria-label="Buscar desarrollador por nombre"
        />
        {value && (
          <button
            type="button"
            className="dev-search-clear"
            onClick={onClear}
            aria-label="Limpiar busqueda"
            disabled={loading}
          >
            <FiX aria-hidden="true" />
          </button>
        )}
      </label>

      <button type="submit" className="dev-search-submit" disabled={loading}>
        {loading ? 'Buscando...' : 'Buscar'}
      </button>
    </form>
  );
}
