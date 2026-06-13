import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../../../core/i18n';
import ActiveFilters from '../components/ActiveFilters';
import ExperienceTagInput from '../components/ExperienceTagInput';
import FilterSection from '../components/FilterSection';
import GlobalSearchInput from '../components/GlobalSearchInput';
import PortfolioResultCard from '../components/PortfolioResultCard';
import SearchEmptyState from '../components/SearchEmptyState';
import SkillLevelTagInput from '../components/SkillLevelTagInput';
import TagInput from '../components/TagInput';
import TextSuggestionInput from '../components/TextSuggestionInput';
import {
  SEARCH_AUTH_REQUIRED_MESSAGE,
  getCachedSearchCatalogs,
  getCachedSearchResults,
  getSearchCatalogs,
  searchPortfolios,
} from '../services/portfolioSearchService';
import { applyGlobalSuggestion } from '../services/globalSuggestionFilters';
import { consumeNavSearchSelection } from '../services/navSearchTransfer';
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

const PROJECT_STATES = ['publicado', 'en_desarrollo', 'borrador', 'archivado'];
const PRIORITY_VALUES = ['', 'proyectos', 'experiencia', 'habilidades'];
/*const LEVEL_VALUES = ['basico', 'intermedio', 'avanzado', 'experto'];
const TYPE_VALUES = ['laboral', 'academica'];*/

const cloneFilters = (filters) => JSON.parse(JSON.stringify(filters));
const FILTER_ACCORDION_QUERY = '(max-width: 1020px)';

const emptyCatalogs = () => ({
  nombresUsuarios: [],
  ciudades: [],
  paises: [],
  profesiones: [],
  habilidadesBlandas: [],
  habilidadesTecnicas: [],
  cargos: [],
  tecnologias: [],
  tiposProyecto: [],
});

const PortfolioSearchPage = () => {
  const { t } = useLanguage();
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
  const [filterAccordion, setFilterAccordion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(FILTER_ACCORDION_QUERY).matches
  );
  const [openFilterSection, setOpenFilterSection] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(FILTER_ACCORDION_QUERY).matches
      ? null
      : 'user'
  );
  const [filtersVisible, setFiltersVisible] = useState(
    () => typeof window === 'undefined' || !window.matchMedia(FILTER_ACCORDION_QUERY).matches
  );

  const levelLabel = (value) => t(`portfolioSearch.level.${value}`);
  const typeLabel = (value) => t(`portfolioSearch.experience.${value}`);
  const projectStateLabel = (value) => t(`portfolioSearch.projectState.${value}`);
  const priorityLabel = (value) => (
    value ? t(`portfolioSearch.priority.${value}`) : t('portfolioSearch.priority.none')
  );

  const translateSearchError = (message) => {
    if (message === SEARCH_AUTH_REQUIRED_MESSAGE) return t('portfolioSearch.error.authRequired');
    if (!message) return t('portfolioSearch.error.search');
    return message;
  };

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
          setError(t('portfolioSearch.error.authRequired'));
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
  }, [t]);

  useEffect(() => {
    const media = window.matchMedia(FILTER_ACCORDION_QUERY);
    const update = (event) => {
      setFilterAccordion(event.matches);
      setFiltersVisible(!event.matches);
      if (event.matches) setOpenFilterSection(null);
    };

    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const navSelection = consumeNavSearchSelection();
    if (!navSelection) return;

    const nextFilters = applyGlobalSuggestion(cloneFilters(BASE_FILTERS), navSelection);
    setFilters(nextFilters);
    executeSearch(1, nextFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const selectGlobalSuggestion = (suggestion) => {
    setFilters((current) => applyGlobalSuggestion(current, suggestion));
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
      const rawMessage = err.message || '';
      const message = translateSearchError(rawMessage);
      if (!cached || rawMessage === SEARCH_AUTH_REQUIRED_MESSAGE) {
        setResults([]);
        setMeta({ current_page: page, last_page: 1, total: 0, per_page: 12 });
      }
      setError(message);
      setHasSearched(true);
      if (rawMessage === SEARCH_AUTH_REQUIRED_MESSAGE) {
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

    const pushArray = (section, key, labelKey = '') => {
      filters[section][key].forEach((value) => {
        chips.push({
          id: `${section}-${key}-${value}`,
          label: t(labelKey, { value }),
          onRemove: () => removeArrayChip(section, key, value),
        });
      });
    };

    pushText('query', filters.query, () => setRoot('query', ''));
    pushText('nombre', filters.usuario.nombre && t('portfolioSearch.chip.name', { value: filters.usuario.nombre }), () => setSectionValue('usuario', 'nombre', ''));
    pushArray('usuario', 'ciudad', 'portfolioSearch.chip.city');
    pushArray('usuario', 'pais', 'portfolioSearch.chip.country');
    pushArray('usuario', 'profesion', 'portfolioSearch.chip.profession');

    filters.habilidades.tecnicas.forEach((skill) => {
      chips.push({
        id: `tec-${skill.item}-${skill.nivel}`,
        label: t('portfolioSearch.chip.technical', { skill: skill.item, level: levelLabel(skill.nivel) || skill.nivel }),
        className: `level-${skill.nivel}`,
        onRemove: () => removeSkillChip('tecnicas', skill.item),
      });
    });

    filters.habilidades.blandas.forEach((skill) => {
      chips.push({
        id: `bla-${skill.item}-${skill.nivel}`,
        label: t('portfolioSearch.chip.soft', { skill: skill.item, level: levelLabel(skill.nivel) || skill.nivel }),
        className: `level-${skill.nivel}`,
        onRemove: () => removeSkillChip('blandas', skill.item),
      });
    });

    filters.experiencia.forEach((experience) => {
      chips.push({
        id: `exp-${experience.cargo}-${experience.tipos.join('-')}`,
        label: `${experience.cargo} / ${experience.tipos.map((type) => typeLabel(type) || type).join(' + ')}`,
        className: 'exp-chip',
        onRemove: () => removeExperienceChip(experience.cargo),
      });
    });

    pushArray('proyectos', 'tecnologias', 'portfolioSearch.chip.technology');
    pushArray('proyectos', 'tipo', 'portfolioSearch.chip.projectType');
    pushArray('proyectos', 'estado', 'portfolioSearch.chip.status');

    if (filters.orden.fecha_desde) {
      chips.push({
        id: 'fecha-desde',
        label: t('portfolioSearch.chip.from', { date: filters.orden.fecha_desde }),
        onRemove: () => setOrderValue('fecha_desde', ''),
      });
    }

    if (filters.orden.prioridad) {
      chips.push({
        id: 'prioridad',
        label: t('portfolioSearch.chip.priority', { value: priorityLabel(filters.orden.prioridad) }),
        onRemove: () => setOrderValue('prioridad', ''),
      });
    }

    return chips;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, t]);

  const currentPage = Number(meta?.current_page || 1);
  const lastPage = Number(meta?.last_page || 1);
  const total = Number(meta?.total ?? results.length);
  const showFilterSections = !filterAccordion || filtersVisible;
  const resultsSummary = (compact = false) => (
    <div>
      <span className="ps-results-count">
        {loading
          ? t('portfolioSearch.results.loading')
          : hasSearched
            ? t('portfolioSearch.results.count', { shown: results.length, total })
            : t('portfolioSearch.results.ready')}
      </span>
      {!compact && (
        <small>
          {hasSearched
            ? t('portfolioSearch.results.direction', { direction: filters.orden.direccion.toUpperCase() })
            : t('portfolioSearch.results.helper')}
        </small>
      )}
    </div>
  );

  return (
    <main className="ps-page">
      <section className="ps-shell">
        <ActiveFilters chips={activeChips} onClear={resetFilters} className="ps-active-mobile" />
        <form
          className="ps-searchbar"
          onSubmit={(event) => {
            event.preventDefault();
            executeSearch(1);
          }}
        >
          <GlobalSearchInput
            value={filters.query}
            onChange={(value) => setRoot('query', value)}
            onSelect={selectGlobalSuggestion}
            catalogs={catalogs}
            placeholder={t('portfolioSearch.search.placeholder')}
          />
          <button type="submit" className="ps-btn-primary" disabled={loading || catalogLoading}>
            {loading ? t('portfolioSearch.search.loading') : t('portfolioSearch.search.submit')}
          </button>
          <button type="button" className="ps-btn-secondary danger-hover" onClick={resetFilters} disabled={loading}>
            {t('portfolioSearch.search.clear')}
          </button>
        </form>

        <div className={`ps-filter-controls ${!showFilterSections ? 'is-collapsed' : ''}`}>
          <ActiveFilters chips={activeChips} onClear={resetFilters} className="ps-active-desktop" />
          {!showFilterSections && (
            <div className="ps-results-head ps-results-head-inline">
              {resultsSummary(true)}
            </div>
          )}
          <button
            type="button"
            className="ps-filter-visibility-toggle"
            onClick={() => {
              if (showFilterSections) {
                setOpenFilterSection(null);
                setFiltersVisible(false);
                return;
              }

              setFiltersVisible(true);
            }}
            aria-expanded={showFilterSections}
          >
            {showFilterSections
              ? t('portfolioSearch.filters.hide')
              : t('portfolioSearch.filters.show')}
          </button>
        </div>

        <div className="ps-layout">
          {showFilterSections && <aside className="ps-filters" aria-label={t('portfolioSearch.filters.aria')}>
            <FilterSection
              title={t('portfolioSearch.sections.user')}
              icon="US"
              sectionId="user"
              defaultOpen
              accordion={filterAccordion}
              openSectionId={openFilterSection}
              onAccordionToggle={setOpenFilterSection}
            >
              <TextSuggestionInput
                label={t('portfolioSearch.user.name')}
                placeholder={t('portfolioSearch.user.namePlaceholder')}
                value={filters.usuario.nombre}
                suggestions={catalogs.nombresUsuarios}
                onChange={(value) => setSectionValue('usuario', 'nombre', value)}
              />

              <TagInput
                label={t('portfolioSearch.user.city')}
                placeholder={t('portfolioSearch.user.cityPlaceholder')}
                values={filters.usuario.ciudad}
                suggestions={catalogs.ciudades}
                onChange={(values) => setSectionValue('usuario', 'ciudad', values)}
              />

              <TagInput
                label={t('portfolioSearch.user.country')}
                placeholder={t('portfolioSearch.user.countryPlaceholder')}
                values={filters.usuario.pais}
                suggestions={catalogs.paises}
                onChange={(values) => setSectionValue('usuario', 'pais', values)}
              />

              <TagInput
                label={t('portfolioSearch.user.profession')}
                placeholder={t('portfolioSearch.user.professionPlaceholder')}
                values={filters.usuario.profesion}
                suggestions={catalogs.profesiones}
                onChange={(values) => setSectionValue('usuario', 'profesion', values)}
              />
            </FilterSection>

            <FilterSection
              title={t('portfolioSearch.sections.skills')}
              icon="HB"
              sectionId="skills"
              defaultOpen
              accordion={filterAccordion}
              openSectionId={openFilterSection}
              onAccordionToggle={setOpenFilterSection}
            >
              <SkillLevelTagInput
                label={t('portfolioSearch.skills.technical')}
                placeholder={t('portfolioSearch.skills.technicalPlaceholder')}
                values={filters.habilidades.tecnicas}
                suggestions={catalogs.habilidadesTecnicas}
                onChange={(values) => setSectionValue('habilidades', 'tecnicas', values)}
              />

              <SkillLevelTagInput
                label={t('portfolioSearch.skills.soft')}
                placeholder={t('portfolioSearch.skills.softPlaceholder')}
                values={filters.habilidades.blandas}
                suggestions={catalogs.habilidadesBlandas}
                onChange={(values) => setSectionValue('habilidades', 'blandas', values)}
              />
            </FilterSection>

            <FilterSection
              title={t('portfolioSearch.sections.experience')}
              icon="EX"
              sectionId="experience"
              accordion={filterAccordion}
              openSectionId={openFilterSection}
              onAccordionToggle={setOpenFilterSection}
            >
              <ExperienceTagInput
                label={t('portfolioSearch.experience.position')}
                placeholder={t('portfolioSearch.experience.positionPlaceholder')}
                values={filters.experiencia}
                suggestions={catalogs.cargos}
                onChange={(values) => setRoot('experiencia', values)}
              />
            </FilterSection>

            <FilterSection
              title={t('portfolioSearch.sections.projects')}
              icon="PR"
              sectionId="projects"
              accordion={filterAccordion}
              openSectionId={openFilterSection}
              onAccordionToggle={setOpenFilterSection}
            >
              <TagInput
                label={t('portfolioSearch.projects.technologies')}
                placeholder={t('portfolioSearch.projects.technologiesPlaceholder')}
                values={filters.proyectos.tecnologias}
                suggestions={catalogs.tecnologias}
                onChange={(values) => setSectionValue('proyectos', 'tecnologias', values)}
              />

              <TagInput
                label={t('portfolioSearch.projects.type')}
                placeholder={t('portfolioSearch.projects.typePlaceholder')}
                values={filters.proyectos.tipo}
                suggestions={catalogs.tiposProyecto}
                onChange={(values) => setSectionValue('proyectos', 'tipo', values)}
              />

              <div className="ps-field">
                <span className="ps-label">{t('portfolioSearch.projects.status')}</span>
                <div className="ps-chip-group two-cols">
                  {PROJECT_STATES.map((state) => (
                    <button
                      type="button"
                      key={state}
                      className={`ps-select-chip ${filters.proyectos.estado.includes(state) ? 'active' : ''}`}
                      onClick={() => toggleProjectState(state)}
                    >
                      {projectStateLabel(state)}
                    </button>
                  ))}
                </div>
              </div>
            </FilterSection>

            <FilterSection
              title={t('portfolioSearch.sections.order')}
              icon="OR"
              sectionId="order"
              accordion={filterAccordion}
              openSectionId={openFilterSection}
              onAccordionToggle={setOpenFilterSection}
            >
              <div className="ps-field">
                <span className="ps-label">{t('portfolioSearch.order.direction')}</span>
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
                <label className="ps-label">{t('portfolioSearch.order.dateFrom')}</label>
                <input
                  type="date"
                  className="ps-input"
                  value={filters.orden.fecha_desde}
                  onChange={(event) => setOrderValue('fecha_desde', event.target.value)}
                />
              </div>

              <div className="ps-field">
                <span className="ps-label">{t('portfolioSearch.order.priority')}</span>
                <div className="ps-priority-list">
                  {PRIORITY_VALUES.map((priority) => (
                    <label className={`ps-radio-row ${filters.orden.prioridad === priority ? 'active' : ''}`} key={priority || 'none'}>
                      <input
                        type="radio"
                        name="portfolio-priority"
                        value={priority}
                        checked={filters.orden.prioridad === priority}
                        onChange={() => setOrderValue('prioridad', priority)}
                      />
                      <span>{priorityLabel(priority)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </FilterSection>
          </aside>}

          <section className="ps-results" aria-live="polite">
            {showFilterSections && <div className="ps-results-head">{resultsSummary()}</div>}

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
                      {t('portfolioSearch.pagination.previous')}
                    </button>
                    <span>{t('portfolioSearch.pagination.page', { current: currentPage, last: lastPage })}</span>
                    <button
                      type="button"
                      className="ps-btn-secondary"
                      disabled={currentPage >= lastPage || loading}
                      onClick={() => executeSearch(currentPage + 1)}
                    >
                      {t('portfolioSearch.pagination.next')}
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
