import { useMemo, useState } from 'react';
import { useLanguage } from '../../../../core/i18n';

const EXPERIENCE_TYPES = ['laboral', 'academica'];

const normalizeText = (value) => String(value || '').trim().replace(/\s+/g, ' ');
const sameText = (a, b) => normalizeText(a).toLowerCase() === normalizeText(b).toLowerCase();

const ExperienceTagInput = ({
  label,
  placeholder,
  values = [],
  onChange,
  suggestions = [],
}) => {
  const { t } = useLanguage();
  const [inputValue, setInputValue] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState('');

  const typeLabel = (value) => t(`portfolioSearch.experience.${value}`);

  const filteredSuggestions = useMemo(() => {
    const query = inputValue.trim().toLowerCase();
    if (!query) return [];

    return suggestions
      .filter((item) => {
        const text = String(item || '');
        return text.toLowerCase().includes(query) && !values.some((value) => sameText(value.cargo, text));
      })
      .slice(0, 6);
  }, [inputValue, suggestions, values]);

  const toggleType = (type) => {
    setSelectedTypes((current) => {
      const exists = current.includes(type);
      return exists ? current.filter((item) => item !== type) : [...current, type];
    });
    if (error) setError('');
  };

  const addValue = (rawValue = inputValue) => {
    const cargo = normalizeText(rawValue);

    if (!cargo) {
      setError(t('portfolioSearch.experience.error.position'));
      return;
    }

    if (!selectedTypes.length) {
      setError(t('portfolioSearch.experience.error.type'));
      return;
    }

    const nextItem = { cargo, tipos: selectedTypes };
    const existingIndex = values.findIndex((value) => sameText(value.cargo, cargo));

    if (existingIndex >= 0) {
      const nextValues = [...values];
      nextValues[existingIndex] = nextItem;
      onChange(nextValues);
    } else {
      onChange([...values, nextItem]);
    }

    setInputValue('');
    setSelectedTypes([]);
    setError('');
  };

  const removeValue = (cargoToRemove) => {
    onChange(values.filter((value) => !sameText(value.cargo, cargoToRemove)));
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addValue(inputValue);
    }

    if (event.key === 'Backspace' && !inputValue && values.length) {
      removeValue(values[values.length - 1].cargo);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (!selectedTypes.length) {
      setInputValue(String(suggestion || ''));
      setError(t('portfolioSearch.experience.error.suggestionType'));
      return;
    }

    addValue(suggestion);
  };

  return (
    <div className="ps-field ps-tag-field">
      {label && <label className="ps-label">{label}</label>}

      <div className="ps-tags-box">
        {values.length > 0 && (
          <div className="ps-tags-list">
            {values.map((value) => (
              <span className="ps-tag ps-exp-tag" key={`${value.cargo}-${value.tipos.join('-')}`}>
                <span>{value.cargo}</span>
                <span className="ps-exp-mini-wrap">
                  {value.tipos.map((type) => (
                    <strong className={`ps-exp-mini ${type}`} key={type}>{typeLabel(type)}</strong>
                  ))}
                </span>
                <button
                  type="button"
                  onClick={() => removeValue(value.cargo)}
                  aria-label={t('portfolioSearch.filters.remove', { label: value.cargo })}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="ps-exp-entry">
          <div className="ps-tag-input-wrap">
            <input
              type="text"
              className="ps-input"
              value={inputValue}
              placeholder={placeholder}
              onChange={(event) => {
                setInputValue(event.target.value);
                if (error) setError('');
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => window.setTimeout(() => setFocused(false), 140)}
            />

            {focused && filteredSuggestions.length > 0 && (
              <div className="ps-suggestions ps-suggestions-inline">
                {filteredSuggestions.map((suggestion) => (
                  <button
                    type="button"
                    key={suggestion}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="ps-chip-group two-cols">
            {EXPERIENCE_TYPES.map((type) => (
              <button
                type="button"
                key={type}
                className={`ps-select-chip ${selectedTypes.includes(type) ? 'active' : ''} exp-${type}`}
                onClick={() => toggleType(type)}
              >
                {typeLabel(type)}
              </button>
            ))}
          </div>

          <button type="button" className="ps-add-exp" onClick={() => addValue(inputValue)}>
            {t('portfolioSearch.experience.add')}
          </button>
        </div>

        {error && <span className="ps-field-error">{error}</span>}
      </div>
    </div>
  );
};

export default ExperienceTagInput;
