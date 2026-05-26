import { BsSearch, BsX } from 'react-icons/bs';
import {
  EVENT_STATUS_FILTERS,
  EVENT_TYPES,
} from '../services/eventsService';

export default function EventsFilters({
  query,
  statusFilter,
  typeFilter,
  statusCounts,
  sourceReady,
  onQueryChange,
  onStatusFilterChange,
  onTypeFilterChange,
}) {
  return (
    <div className="evt-toolbar">
      <div className="evt-search-box">
        <span className="evt-search-icon">
          <BsSearch />
        </span>
        <input
          type="text"
          className="evt-search-input"
          placeholder="Buscar evento, lugar o tipo..."
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          aria-label="Buscar eventos"
        />
        {query ? (
          <button
            type="button"
            className="evt-search-clear"
            onClick={() => onQueryChange('')}
            aria-label="Limpiar busqueda"
            title="Limpiar busqueda"
          >
            <BsX />
          </button>
        ) : null}
      </div>

      <div className="evt-filter-group" aria-label="Filtrar eventos por estado">
        {EVENT_STATUS_FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className={`evt-filter-chip${statusFilter === filter.id ? ' active' : ''}`}
            onClick={() => onStatusFilterChange(filter.id)}
          >
            <span>{filter.label}</span>
            {sourceReady ? <small>{statusCounts?.[filter.id] ?? 0}</small> : null}
          </button>
        ))}
      </div>

      <div className="evt-filter-group evt-filter-group--types" aria-label="Filtrar eventos por tipo">
        {EVENT_TYPES.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className={`evt-filter-chip${typeFilter === filter.id ? ' active' : ''}`}
            onClick={() => onTypeFilterChange(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="evt-toolbar-side">
        <span className={`evt-sync-pill ${sourceReady ? 'ready' : 'pending'}`}>
          {sourceReady ? 'Datos actualizados' : 'Sin registros'}
        </span>
      </div>
    </div>
  );
}
