import { useMemo, useState } from 'react';
import { useLanguage } from '../../../core/i18n';
import { buildGlobalSuggestions } from '../../../features/public/portfolio-search/components/GlobalSearchInput';

const LEVELS = ['basico', 'intermedio', 'avanzado', 'experto'];
const EXPERIENCE_TYPES = ['laboral', 'academica', 'ambos'];

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

export default function NavCatalogSearch({
  value,
  onChange,
  onSelect,
  catalogs,
  inputRef,
  placeholder,
}) {
  const { t } = useLanguage();
  const [focused, setFocused] = useState(false);
  const [pending, setPending] = useState(null);
  const suggestions = useMemo(
    () => buildGlobalSuggestions(catalogs, value, 6),
    [catalogs, value]
  );

  const choose = (suggestion) => {
    if (['technicalSkill', 'softSkill', 'experience'].includes(suggestion.type)) {
      setPending(suggestion);
      setFocused(false);
      return;
    }
    onSelect(suggestion);
  };

  return (
    <div className="spk-nav-catalog-search">
      <input
        ref={inputRef}
        className="spk-nav-search-input"
        type="text"
        value={value}
        disabled={Boolean(pending)}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => window.setTimeout(() => setFocused(false), 140)}
        placeholder={placeholder}
        autoComplete="off"
      />

      {focused && suggestions.length > 0 && (
        <div className="spk-nav-search-suggestions">
          {suggestions.map((suggestion) => (
            <button
              type="button"
              key={`${suggestion.type}-${suggestion.value}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(suggestion)}
            >
              <span>{suggestion.value}</span>
              <strong>{t(TYPE_LABEL_KEYS[suggestion.type])}</strong>
            </button>
          ))}
        </div>
      )}

      {pending && (
        <div className="spk-nav-search-qualifier">
          {(pending.type === 'experience' ? EXPERIENCE_TYPES : LEVELS).map((qualifier) => (
            <button
              type="button"
              key={qualifier}
              onClick={() => {
                onSelect({ ...pending, qualifier });
                setPending(null);
              }}
            >
              {pending.type === 'experience'
                ? t(`portfolioSearch.experience.${qualifier}`)
                : t(`portfolioSearch.level.${qualifier}`)}
            </button>
          ))}
          <button type="button" onClick={() => setPending(null)}>×</button>
        </div>
      )}
    </div>
  );
}
