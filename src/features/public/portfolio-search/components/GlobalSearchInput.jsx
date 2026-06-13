import { useMemo, useState } from 'react';
import { useLanguage } from '../../../../core/i18n';

const LEVELS = ['basico', 'intermedio', 'avanzado', 'experto'];
const EXPERIENCE_TYPES = ['laboral', 'academica', 'ambos'];

const normalizeSearchText = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim();

const TYPE_LABEL_KEYS = {
  name: 'portfolioSearch.user.name',
  city: 'portfolioSearch.user.city',
  country: 'portfolioSearch.user.country',
  profession: 'portfolioSearch.user.profession',
  technicalSkill: 'portfolioSearch.skills.technical',
  softSkill: 'portfolioSearch.skills.soft',
  experience: 'portfolioSearch.experience.position',
  technology: 'portfolioSearch.projects.technologies',
  projectType: 'portfolioSearch.projects.type',
};

const CATALOG_TYPES = [
  ['nombresUsuarios', 'name'],
  ['ciudades', 'city'],
  ['paises', 'country'],
  ['profesiones', 'profession'],
  ['habilidadesTecnicas', 'technicalSkill'],
  ['habilidadesBlandas', 'softSkill'],
  ['cargos', 'experience'],
  ['tecnologias', 'technology'],
  ['tiposProyecto', 'projectType'],
];

export const buildGlobalSuggestions = (catalogs, rawQuery, limit = 10) => {
  const query = normalizeSearchText(rawQuery);
  if (query.length < 1) return [];

  return CATALOG_TYPES.flatMap(([catalogKey, type]) => (
    (catalogs?.[catalogKey] || []).map((value) => ({ type, value: String(value) }))
  ))
    .filter((suggestion) => normalizeSearchText(suggestion.value).startsWith(query))
    .sort((a, b) => a.value.localeCompare(b.value) || a.type.localeCompare(b.type))
    .slice(0, limit);
};

const GlobalSearchInput = ({
  value,
  onChange,
  onSelect,
  catalogs,
  placeholder,
}) => {
  const { t } = useLanguage();
  const [focused, setFocused] = useState(false);
  const [pending, setPending] = useState(null);

  const suggestions = useMemo(
    () => buildGlobalSuggestions(catalogs, value),
    [catalogs, value]
  );

  const typeLabel = (type) => t(TYPE_LABEL_KEYS[type]);

  const chooseSuggestion = (suggestion) => {
    if (['technicalSkill', 'softSkill', 'experience'].includes(suggestion.type)) {
      setPending(suggestion);
      setFocused(false);
      return;
    }

    onSelect(suggestion);
  };

  const chooseQualifier = (qualifier) => {
    onSelect({ ...pending, qualifier });
    setPending(null);
  };

  return (
    <div className="ps-global-search">
      <input
        type="search"
        className="ps-search-input"
        value={value}
        disabled={Boolean(pending)}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => window.setTimeout(() => setFocused(false), 140)}
        placeholder={placeholder}
        autoComplete="off"
      />

      {focused && suggestions.length > 0 && (
        <div className="ps-suggestions ps-global-suggestions">
          {suggestions.map((suggestion) => (
            <button
              type="button"
              key={`${suggestion.type}-${suggestion.value}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => chooseSuggestion(suggestion)}
            >
              <span>{suggestion.value}</span>
              <strong>{typeLabel(suggestion.type)}</strong>
            </button>
          ))}
        </div>
      )}

      {pending && (
        <div className="ps-global-qualifier">
          <span>
            {pending.value} · {typeLabel(pending.type)}
          </span>
          <div>
            {(pending.type === 'experience' ? EXPERIENCE_TYPES : LEVELS).map((qualifier) => (
              <button
                type="button"
                key={qualifier}
                onClick={() => chooseQualifier(qualifier)}
              >
                {pending.type === 'experience'
                  ? t(`portfolioSearch.experience.${qualifier}`)
                  : t(`portfolioSearch.level.${qualifier}`)}
              </button>
            ))}
            <button type="button" className="cancel" onClick={() => setPending(null)}>
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearchInput;
