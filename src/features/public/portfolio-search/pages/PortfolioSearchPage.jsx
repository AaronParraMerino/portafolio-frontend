import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ActiveFilters from '../components/ActiveFilters';
import ExperienceTagInput from '../components/ExperienceTagInput';
import FilterSection from '../components/FilterSection';
import PortfolioResultCard from '../components/PortfolioResultCard';
import SearchEmptyState from '../components/SearchEmptyState';
import SkillLevelTagInput from '../components/SkillLevelTagInput';
import TagInput from '../components/TagInput';
import {
  SEARCH_AUTH_REQUIRED_MESSAGE,
  getCachedSearchCatalogs,
  getCachedSearchResults,
  getSearchCatalogs,
  searchPortfolios,
} from '../services/portfolioSearchService';
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
  },
  experiencia: [],
  proyectos: {
    tecnologias: [],
    tipo: [],
    estado: [],
  },
  orden: {
    direccion: 'desc',
    fecha_desde: '',
    prioridad: '',
  },
  per_page: 12,
};

const PROJECT_STATES = [
  { value: 'publicado', label: 'Publicado' },
  { value: 'en_desarrollo', label: 'En desarrollo' },
  { value: 'borrador', label: 'Borrador' },
  { value: 'archivado', label: 'Archivado' },
];

const PRIORITIES = [
  { value: '', label: 'Sin prioridad' },
  { value: 'proyectos', label: 'Proyectos' },
  { value: 'experiencia', label: 'Experiencia' },
  { value: 'habilidades', label: 'Habilidades' },
];

const LEVEL_LABELS = {
  basico: 'Básico',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
  experto: 'Experto',
};

const TYPE_LABELS = {
  laboral: 'Laboral',
  academica: 'Académica',
};

const cloneFilters = (filters) => JSON.parse(JSON.stringify(filters));

const emptyCatalogs = () => ({
  profesiones: [],
  habilidadesBlandas: [],
  habilidadesTecnicas: [],
  cargos: [],
  tecnologias: [],
  tiposProyecto: [],
});

const PortfolioSearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get('q') || '';
  const cachedCatalogs = getCachedSearchCatalogs();

  const [filters, setFilters] = useState(() => ({
    ...cloneFilters(BASE_FILTERS),
    query: queryFromUrl,
  }));
  const [catalogs, setCatalogs] = useState(() => cachedCatalogs || emptyCatalogs());
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 12 });
  const [loading, setLoading] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(() => !cachedCatalogs);
  const [error, setError] = useState('');
  const [authRequired, setAuthRequired] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    let mounted = true;
    const cached = getCachedSearchCatalogs();

    if (cached) {
      setCatalogs(cached);
      setCatalogLoading(false);
    } else {
      setCatalogLoading(true);
    }

    getSearchCatalogs({ force: false })
      .then((data) => {
        if (!mounted) return;
        setCatalogs(data);
        setAuthRequired(false);
      })
      .catch((err) => {
        if (!mounted) return;
        if (err.message === SEARCH_AUTH_REQUIRED_MESSAGE) {
          setAuthRequired(true);
          setError(err.message);
          setCatalogs(emptyCatalogs());
          return;
        }
        if (!cached) {
          setCatalogs(emptyCatalogs());
        }
      })
      .finally(() => {
        if (mounted) setCatalogLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!queryFromUrl.trim()) return;

    const nextFilters = {
      ...cloneFilters(BASE_FILTERS),
      query: queryFromUrl,
    };

    setFilters(nextFilters);
    executeSearch(1, nextFilters);
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

  const setOrderValue = (key, value) => {
    setFilters((current) => ({
      ...current,
      orden: {
        ...current.orden,
        [key]: value,
      },
    }));
  };

  const toggleProjectState = (value) => {
    setFilters((current) => {
      const currentArray = current.proyectos.estado || [];
      const exists = currentArray.includes(value);
      return {
        ...current,
        proyectos: {
          ...current.proyectos,
          estado: exists ? currentArray.filter((item) => item !== value) : [...currentArray, value],
        },
      };
    });
  };

  const executeSearch = async (page = 1, nextFilters = filters) => {
    const cached = getCachedSearchResults(nextFilters, page);

    if (cached) {
      setResults(cached.items || []);
      setMeta(cached.meta || { current_page: page, last_page: 1, total: cached.items?.length || 0, per_page: 12 });
      setHasSearched(true);
      setLoading(false);
    } else {
      setLoading(true);
    }
    setError('');
    setAuthRequired(false);

    try {
      const response = await searchPortfolios(nextFilters, page, { force: false });
      setResults(response.items);
      setMeta(response.meta || { current_page: page, last_page: 1, total: response.items.length, per_page: 12 });
      setHasSearched(true);

      const nextQuery = nextFilters.query?.trim();
      if (nextQuery) {
        setSearchParams({ q: nextQuery });
      } else {
        setSearchParams({});
      }
    } catch (err) {
      const message = err.message || 'No se pudo realizar la búsqueda.';
      if (!cached || message === SEARCH_AUTH_REQUIRED_MESSAGE) {
        setResults([]);
        setMeta({ current_page: page, last_page: 1, total: 0, per_page: 12 });
      }
      setError(message);
      setHasSearched(true);
      if (message === SEARCH_AUTH_REQUIRED_MESSAGE) {
        setAuthRequired(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    const nextFilters = cloneFilters(BASE_FILTERS);
    setFilters(nextFilters);
    setResults([]);
    setMeta({ current_page: 1, last_page: 1, total: 0, per_page: 12 });
    setError('');
    setHasSearched(false);
    setSearchParams({});
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

  const removeSkillChip = (type, item) => {
    setFilters((current) => ({
      ...current,
      habilidades: {
        ...current.habilidades,
        [type]: current.habilidades[type].filter((skill) => skill.item !== item),
      },
    }));
  };

  const removeExperienceChip = (cargo) => {
    setFilters((current) => ({
      ...current,
      experiencia: current.experiencia.filter((experience) => experience.cargo !== cargo),
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

    filters.habilidades.tecnicas.forEach((skill) => {
      chips.push({
        id: `tec-${skill.item}-${skill.nivel}`,
        label: `Tec: ${skill.item} / ${LEVEL_LABELS[skill.nivel] || skill.nivel}`,
        className: `level-${skill.nivel}`,
        onRemove: () => removeSkillChip('tecnicas', skill.item),
      });
    });

    filters.habilidades.blandas.forEach((skill) => {
      chips.push({
        id: `bla-${skill.item}-${skill.nivel}`,
        label: `Blanda: ${skill.item} / ${LEVEL_LABELS[skill.nivel] || skill.nivel}`,
        className: `level-${skill.nivel}`,
        onRemove: () => removeSkillChip('blandas', skill.item),
      });
    });

    filters.experiencia.forEach((experience) => {
      chips.push({
        id: `exp-${experience.cargo}-${experience.tipos.join('-')}`,
        label: `${experience.cargo} / ${experience.tipos.map((type) => TYPE_LABELS[type] || type).join(' + ')}`,
        className: 'exp-chip',
        onRemove: () => removeExperienceChip(experience.cargo),
      });
    });

    pushArray('proyectos', 'tecnologias', 'Tecnología: ');
    pushArray('proyectos', 'tipo', 'Tipo proyecto: ');
    pushArray('proyectos', 'estado', 'Estado: ');

    if (filters.orden.fecha_desde) {
      chips.push({
        id: 'fecha-desde',
        label: `Desde: ${filters.orden.fecha_desde}`,
        onRemove: () => setOrderValue('fecha_desde', ''),
      });
    }

    if (filters.orden.prioridad) {
      const priority = PRIORITIES.find((item) => item.value === filters.orden.prioridad)?.label || filters.orden.prioridad;
      chips.push({
        id: 'prioridad',
        label: `Prioridad: ${priority}`,
        onRemove: () => setOrderValue('prioridad', ''),
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
          <button type="submit" className="ps-btn-primary" disabled={loading || catalogLoading}>
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
              <SkillLevelTagInput
                label="Habilidades técnicas"
                placeholder="ej. React, Laravel, Docker..."
                values={filters.habilidades.tecnicas}
                suggestions={catalogs.habilidadesTecnicas}
                onChange={(values) => setSectionValue('habilidades', 'tecnicas', values)}
              />

              <SkillLevelTagInput
                label="Habilidades blandas"
                placeholder="ej. Liderazgo, Comunicación..."
                values={filters.habilidades.blandas}
                suggestions={catalogs.habilidadesBlandas}
                onChange={(values) => setSectionValue('habilidades', 'blandas', values)}
              />
            </FilterSection>

            <FilterSection title="Experiencia" icon="EX">
              <ExperienceTagInput
                label="Cargo o puesto"
                placeholder="ej. Backend Developer, Analista..."
                values={filters.experiencia}
                suggestions={catalogs.cargos}
                onChange={(values) => setRoot('experiencia', values)}
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

              <TagInput
                label="Tipo de proyecto"
                placeholder="ej. Web, API, móvil..."
                values={filters.proyectos.tipo}
                suggestions={catalogs.tiposProyecto}
                onChange={(values) => setSectionValue('proyectos', 'tipo', values)}
              />

              <div className="ps-field">
                <span className="ps-label">Estado del proyecto</span>
                <div className="ps-chip-group two-cols">
                  {PROJECT_STATES.map((state) => (
                    <button
                      type="button"
                      key={state.value}
                      className={`ps-select-chip ${filters.proyectos.estado.includes(state.value) ? 'active' : ''}`}
                      onClick={() => toggleProjectState(state.value)}
                    >
                      {state.label}
                    </button>
                  ))}
                </div>
              </div>
            </FilterSection>

            <FilterSection title="Ordenamiento y relevancia" icon="OR">
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
                <div className="ps-priority-list">
                  {PRIORITIES.map((priority) => (
                    <label className={`ps-radio-row ${filters.orden.prioridad === priority.value ? 'active' : ''}`} key={priority.value}>
                      <input
                        type="radio"
                        name="portfolio-priority"
                        value={priority.value}
                        checked={filters.orden.prioridad === priority.value}
                        onChange={() => setOrderValue('prioridad', priority.value)}
                      />
                      <span>{priority.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </FilterSection>
          </aside>

          <section className="ps-results" aria-live="polite">
            <div className="ps-results-head">
              <div>
                <span className="ps-results-count">
                  {loading
                    ? 'Buscando portafolios...'
                    : hasSearched
                      ? `Mostrando ${results.length} de ${total} portafolios`
                      : 'Configura filtros y ejecuta una búsqueda'}
                </span>
                <small>
                  {hasSearched
                    ? `Dirección ${filters.orden.direccion.toUpperCase()}`
                    : 'La búsqueda avanzada no se ejecuta hasta presionar Buscar portafolios'}
                </small>
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
                      key={portfolio.id_usuario || portfolio.id || index}
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
              <SearchEmptyState hasSearched={hasSearched} authRequired={authRequired} onClear={resetFilters} />
            )}
          </section>
        </div>
      </section>
    </main>
  );
};

export default PortfolioSearchPage;
