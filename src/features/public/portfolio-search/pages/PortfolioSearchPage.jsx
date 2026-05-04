import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ActiveFilters from '../components/ActiveFilters';
import FilterSection from '../components/FilterSection';
import PortfolioResultCard from '../components/PortfolioResultCard';
import SearchEmptyState from '../components/SearchEmptyState';
import TagInput from '../components/TagInput';
import { getSearchCatalogs, searchPortfolios } from '../services/portfolioSearchService';
import '../styles/portfolio-search.css';

const BASE_FILTERS = {
  query: '',
  usuario: {
    nombre: '',
    ciudad: [],
    pais: [],
    profesion: [],
  },
  habilidades: {
    tecnicas: [],
    blandas: [],
    niveles: [],
  },
  experiencia: {
    tipo: ['laboral', 'academica'],
    cargo: [],
  },
  proyectos: {
    tecnologias: [],
    tipo: [],
    estado: [],
  },
  orden: {
    campo: 'relevancia',
    direccion: 'desc',
    fecha_desde: '',
    priorizar_proyectos: false,
    priorizar_experiencia: false,
    priorizar_habilidades: false,
  },
  per_page: 12,
};

const LEVELS = [
  { value: 'basico', label: 'Básico' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'avanzado', label: 'Avanzado' },
  { value: 'experto', label: 'Experto' },
];

const EXPERIENCE_TYPES = [
  { value: 'laboral', label: 'Laboral' },
  { value: 'academica', label: 'Académica' },
];

const PROJECT_TYPES = [
  { value: 'web', label: 'Aplicación web' },
  { value: 'movil', label: 'Aplicación móvil' },
  { value: 'api', label: 'API / Backend' },
  { value: 'sistema', label: 'Sistema de información' },
  { value: 'ia', label: 'Machine Learning / IA' },
  { value: 'devops', label: 'DevOps / Infraestructura' },
];

const PROJECT_STATES = [
  { value: 'publicado', label: 'Publicado' },
  { value: 'en-desarrollo', label: 'En desarrollo' },
];

const cloneFilters = (filters) => JSON.parse(JSON.stringify(filters));

const PortfolioSearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get('q') || '';

  const [filters, setFilters] = useState(() => ({
    ...cloneFilters(BASE_FILTERS),
    query: queryFromUrl,
  }));
  const [catalogs, setCatalogs] = useState({
    profesiones: [],
    habilidadesBlandas: [],
    habilidadesTecnicas: [],
    cargos: [],
    tecnologias: [],
  });
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    let mounted = true;

    getSearchCatalogs()
      .then((data) => {
        if (mounted) setCatalogs(data);
      })
      .catch(() => {
        if (mounted) setCatalogs({
          profesiones: [],
          habilidadesBlandas: [],
          habilidadesTecnicas: [],
          cargos: [],
          tecnologias: [],
        });
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    executeSearch(1, {
      ...cloneFilters(BASE_FILTERS),
      query: queryFromUrl,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setRoot = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const setSectionValue = (section, key, value) => {
    setFilters((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [key]: value,
      },
    }));
  };

  const toggleArrayValue = (section, key, value) => {
    setFilters((current) => {
      const currentArray = current[section][key] || [];
      const exists = currentArray.includes(value);
      const nextArray = exists
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value];

      return {
        ...current,
        [section]: {
          ...current[section],
          [key]: nextArray,
        },
      };
    });
  };

  const setOrderValue = (key, value) => {
    setFilters((current) => ({
      ...current,
      orden: {
        ...current.orden,
        [key]: value,
      },
    }));
  };

  const executeSearch = async (page = 1, nextFilters = filters) => {
    setLoading(true);
    setError('');

    try {
      const response = await searchPortfolios(nextFilters, page);
      setResults(response.items);
      setMeta(response.meta || { current_page: page, last_page: 1, total: response.items.length });
      setHasSearched(true);

      const nextQuery = nextFilters.query?.trim();
      if (nextQuery) {
        setSearchParams({ q: nextQuery });
      } else {
        setSearchParams({});
      }
    } catch (err) {
      setResults([]);
      setError(err.message || 'No se pudo realizar la búsqueda.');
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    const nextFilters = cloneFilters(BASE_FILTERS);
    setFilters(nextFilters);
    executeSearch(1, nextFilters);
  };

  const removeArrayChip = (section, key, value) => {
    setFilters((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [key]: current[section][key].filter((item) => item !== value),
      },
    }));
  };

  const activeChips = useMemo(() => {
    const chips = [];

    const pushText = (id, label, clear) => {
      if (label) chips.push({ id, label, onRemove: clear });
    };

    const pushArray = (section, key, prefix = '') => {
      filters[section][key].forEach((value) => {
        chips.push({
          id: `${section}-${key}-${value}`,
          label: `${prefix}${value}`,
          onRemove: () => removeArrayChip(section, key, value),
        });
      });
    };

    pushText('query', filters.query, () => setRoot('query', ''));
    pushText('nombre', filters.usuario.nombre && `Nombre: ${filters.usuario.nombre}`, () => setSectionValue('usuario', 'nombre', ''));
    pushArray('usuario', 'ciudad', 'Ciudad: ');
    pushArray('usuario', 'pais', 'País: ');
    pushArray('usuario', 'profesion', 'Profesión: ');
    pushArray('habilidades', 'tecnicas', 'Tec: ');
    pushArray('habilidades', 'blandas', 'Blanda: ');
    pushArray('habilidades', 'niveles', 'Nivel: ');
    pushArray('experiencia', 'cargo', 'Cargo: ');
    pushArray('proyectos', 'tecnologias', 'Proyecto: ');
    pushArray('proyectos', 'tipo', 'Tipo proyecto: ');
    pushArray('proyectos', 'estado', 'Estado: ');

    if (filters.experiencia.tipo.length === 1) {
      const typeLabel = filters.experiencia.tipo[0] === 'laboral' ? 'Laboral' : 'Académica';
      chips.push({
        id: 'tipo-experiencia',
        label: `Experiencia: ${typeLabel}`,
        onRemove: () => setSectionValue('experiencia', 'tipo', ['laboral', 'academica']),
      });
    }

    if (filters.orden.fecha_desde) {
      chips.push({
        id: 'fecha-desde',
        label: `Desde: ${filters.orden.fecha_desde}`,
        onRemove: () => setOrderValue('fecha_desde', ''),
      });
    }

    return chips;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const currentPage = Number(meta?.current_page || 1);
  const lastPage = Number(meta?.last_page || 1);
  const total = Number(meta?.total ?? results.length);

  return (
    <main className="ps-page">
      <section className="ps-shell">
        <form
          className="ps-searchbar"
          onSubmit={(event) => {
            event.preventDefault();
            executeSearch(1);
          }}
        >
          <input
            type="search"
            className="ps-search-input"
            value={filters.query}
            onChange={(event) => setRoot('query', event.target.value)}
            placeholder="Buscar por habilidad, profesión, tecnología, nombre o palabra clave..."
          />
          <button type="submit" className="ps-btn-primary" disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar portafolios'}
          </button>
          <button type="button" className="ps-btn-secondary danger-hover" onClick={resetFilters} disabled={loading}>
            Limpiar
          </button>
        </form>

        <ActiveFilters chips={activeChips} onClear={resetFilters} />

        <div className="ps-layout">
          <aside className="ps-filters" aria-label="Filtros de búsqueda">
            <FilterSection title="Características del usuario" icon="US" defaultOpen>
              <div className="ps-field">
                <label className="ps-label">Nombre</label>
                <input
                  type="text"
                  className="ps-input"
                  value={filters.usuario.nombre}
                  onChange={(event) => setSectionValue('usuario', 'nombre', event.target.value)}
                  placeholder="ej. Juan Pérez"
                />
              </div>

              <TagInput
                label="Ciudad"
                placeholder="ej. Cochabamba, La Paz..."
                values={filters.usuario.ciudad}
                onChange={(values) => setSectionValue('usuario', 'ciudad', values)}
              />

              <TagInput
                label="País"
                placeholder="ej. Bolivia, Argentina..."
                values={filters.usuario.pais}
                onChange={(values) => setSectionValue('usuario', 'pais', values)}
              />

              <TagInput
                label="Profesión o rol"
                placeholder="ej. Backend Developer..."
                values={filters.usuario.profesion}
                suggestions={catalogs.profesiones}
                onChange={(values) => setSectionValue('usuario', 'profesion', values)}
              />
            </FilterSection>

            <FilterSection title="Habilidades" icon="HB" defaultOpen>
              <TagInput
                label="Habilidades técnicas"
                placeholder="ej. React, Laravel, Docker..."
                values={filters.habilidades.tecnicas}
                suggestions={catalogs.habilidadesTecnicas}
                onChange={(values) => setSectionValue('habilidades', 'tecnicas', values)}
              />

              <TagInput
                label="Habilidades blandas"
                placeholder="ej. Liderazgo, Comunicación..."
                values={filters.habilidades.blandas}
                suggestions={catalogs.habilidadesBlandas}
                onChange={(values) => setSectionValue('habilidades', 'blandas', values)}
              />

              <div className="ps-field">
                <span className="ps-label">Nivel de dominio</span>
                <div className="ps-chip-group">
                  {LEVELS.map((level) => (
                    <button
                      type="button"
                      key={level.value}
                      className={`ps-select-chip ${filters.habilidades.niveles.includes(level.value) ? 'active' : ''}`}
                      onClick={() => toggleArrayValue('habilidades', 'niveles', level.value)}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>
            </FilterSection>

            <FilterSection title="Experiencia" icon="EX">
              <div className="ps-field">
                <span className="ps-label">Tipo de experiencia</span>
                <div className="ps-chip-group two-cols">
                  {EXPERIENCE_TYPES.map((type) => (
                    <button
                      type="button"
                      key={type.value}
                      className={`ps-select-chip ${filters.experiencia.tipo.includes(type.value) ? 'active' : ''}`}
                      onClick={() => toggleArrayValue('experiencia', 'tipo', type.value)}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <TagInput
                label="Cargo o puesto"
                placeholder="ej. Backend Developer, Analista..."
                values={filters.experiencia.cargo}
                suggestions={catalogs.cargos}
                onChange={(values) => setSectionValue('experiencia', 'cargo', values)}
              />
            </FilterSection>

            <FilterSection title="Proyectos" icon="PR">
              <TagInput
                label="Tecnologías usadas"
                placeholder="ej. PHP, PostgreSQL, Vue..."
                values={filters.proyectos.tecnologias}
                suggestions={catalogs.tecnologias}
                onChange={(values) => setSectionValue('proyectos', 'tecnologias', values)}
              />

              <div className="ps-field">
                <span className="ps-label">Tipo de proyecto</span>
                <div className="ps-chip-group">
                  {PROJECT_TYPES.map((type) => (
                    <button
                      type="button"
                      key={type.value}
                      className={`ps-select-chip ${filters.proyectos.tipo.includes(type.value) ? 'active' : ''}`}
                      onClick={() => toggleArrayValue('proyectos', 'tipo', type.value)}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ps-field">
                <span className="ps-label">Estado del proyecto</span>
                <div className="ps-chip-group two-cols">
                  {PROJECT_STATES.map((state) => (
                    <button
                      type="button"
                      key={state.value}
                      className={`ps-select-chip ${filters.proyectos.estado.includes(state.value) ? 'active' : ''}`}
                      onClick={() => toggleArrayValue('proyectos', 'estado', state.value)}
                    >
                      {state.label}
                    </button>
                  ))}
                </div>
              </div>
            </FilterSection>

            <FilterSection title="Ordenamiento y relevancia" icon="OR">
              <div className="ps-field">
                <label className="ps-label">Ordenar por</label>
                <select
                  className="ps-input"
                  value={filters.orden.campo}
                  onChange={(event) => setOrderValue('campo', event.target.value)}
                >
                  <option value="relevancia">Relevancia</option>
                  <option value="fecha">Fecha</option>
                  <option value="proyectos">Más proyectos</option>
                  <option value="experiencia">Más experiencia</option>
                  <option value="habilidades">Más habilidades</option>
                </select>
              </div>

              <div className="ps-field">
                <span className="ps-label">Dirección</span>
                <div className="ps-chip-group two-cols">
                  <button
                    type="button"
                    className={`ps-select-chip ${filters.orden.direccion === 'asc' ? 'active' : ''}`}
                    onClick={() => setOrderValue('direccion', 'asc')}
                  >
                    ASC
                  </button>
                  <button
                    type="button"
                    className={`ps-select-chip ${filters.orden.direccion === 'desc' ? 'active' : ''}`}
                    onClick={() => setOrderValue('direccion', 'desc')}
                  >
                    DESC
                  </button>
                </div>
              </div>

              <div className="ps-field">
                <label className="ps-label">Fecha desde</label>
                <input
                  type="date"
                  className="ps-input"
                  value={filters.orden.fecha_desde}
                  onChange={(event) => setOrderValue('fecha_desde', event.target.value)}
                />
              </div>

              <div className="ps-field">
                <span className="ps-label">Priorizar por</span>
                <label className="ps-toggle-row">
                  <span>Proyectos</span>
                  <input
                    type="checkbox"
                    checked={filters.orden.priorizar_proyectos}
                    onChange={(event) => setOrderValue('priorizar_proyectos', event.target.checked)}
                  />
                </label>
                <label className="ps-toggle-row">
                  <span>Experiencia</span>
                  <input
                    type="checkbox"
                    checked={filters.orden.priorizar_experiencia}
                    onChange={(event) => setOrderValue('priorizar_experiencia', event.target.checked)}
                  />
                </label>
                <label className="ps-toggle-row">
                  <span>Habilidades</span>
                  <input
                    type="checkbox"
                    checked={filters.orden.priorizar_habilidades}
                    onChange={(event) => setOrderValue('priorizar_habilidades', event.target.checked)}
                  />
                </label>
              </div>
            </FilterSection>
          </aside>

          <section className="ps-results" aria-live="polite">
            <div className="ps-results-head">
              <div>
                <span className="ps-results-count">
                  {loading ? 'Buscando portafolios...' : `Mostrando ${results.length} de ${total} portafolios`}
                </span>
                <small>Ordenado por {filters.orden.campo}</small>
              </div>
            </div>

            {error && <div className="ps-error-box">{error}</div>}

            {loading ? (
              <div className="ps-loading-list">
                {[1, 2, 3].map((item) => <div className="ps-card-skeleton" key={item} />)}
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="ps-results-list">
                  {results.map((portfolio, index) => (
                    <PortfolioResultCard
                      key={portfolio.id || portfolio.id_usuario || portfolio.id_portafolio || index}
                      portfolio={portfolio}
                    />
                  ))}
                </div>

                {lastPage > 1 && (
                  <div className="ps-pagination">
                    <button
                      type="button"
                      className="ps-btn-secondary"
                      disabled={currentPage <= 1 || loading}
                      onClick={() => executeSearch(currentPage - 1)}
                    >
                      Anterior
                    </button>
                    <span>Página {currentPage} de {lastPage}</span>
                    <button
                      type="button"
                      className="ps-btn-secondary"
                      disabled={currentPage >= lastPage || loading}
                      onClick={() => executeSearch(currentPage + 1)}
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </>
            ) : (
              <SearchEmptyState hasSearched={hasSearched} onClear={resetFilters} />
            )}
          </section>
        </div>
      </section>
    </main>
  );
};

export default PortfolioSearchPage;
