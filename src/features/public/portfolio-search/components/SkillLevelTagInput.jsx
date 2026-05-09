import { useMemo, useState } from 'react';

const LEVELS = [
  { value: 'basico', label: 'Básico' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'avanzado', label: 'Avanzado' },
  { value: 'experto', label: 'Experto' },
];

const normalizeText = (value) => String(value || '').trim().replace(/\s+/g, ' ');
const sameText = (a, b) => normalizeText(a).toLowerCase() === normalizeText(b).toLowerCase();
const levelLabel = (value) => LEVELS.find((level) => level.value === value)?.label || value;

const SkillLevelTagInput = ({
  label,
  placeholder,
  values = [],
  onChange,
  suggestions = [],
}) => {
  const [inputValue, setInputValue] = useState('');
  const [levelValue, setLevelValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState('');

  const filteredSuggestions = useMemo(() => {
    const query = inputValue.trim().toLowerCase();
    if (!query) return [];

    return suggestions
      .filter((item) => {
        const text = String(item || '');
        return text.toLowerCase().includes(query) && !values.some((value) => sameText(value.item, text));
      })
      .slice(0, 6);
  }, [inputValue, suggestions, values]);

  const addValue = (rawValue = inputValue) => {
    const item = normalizeText(rawValue);

    if (!item) {
      setError('Escribe una habilidad.');
      return;
    }

    if (!levelValue) {
      setError('Selecciona el nivel para esta habilidad.');
      return;
    }

    const existingIndex = values.findIndex((value) => sameText(value.item, item));
    const nextItem = { item, nivel: levelValue };

    if (existingIndex >= 0) {
      const nextValues = [...values];
      nextValues[existingIndex] = nextItem;
      onChange(nextValues);
    } else {
      onChange([...values, nextItem]);
    }

    setInputValue('');
    setLevelValue('');
    setError('');
  };

  const removeValue = (itemToRemove) => {
    onChange(values.filter((value) => !sameText(value.item, itemToRemove)));
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addValue(inputValue);
    }

    if (event.key === 'Backspace' && !inputValue && values.length) {
      removeValue(values[values.length - 1].item);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (!levelValue) {
      setInputValue(String(suggestion || ''));
      setError('Selecciona el nivel para agregar esta habilidad.');
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
              <span className={`ps-tag ps-level-tag level-${value.nivel}`} key={`${value.item}-${value.nivel}`}>
                <span>{value.item}</span>
                <strong>{levelLabel(value.nivel)}</strong>
                <button type="button" onClick={() => removeValue(value.item)} aria-label={`Quitar ${value.item}`}>×</button>
              </span>
            ))}
          </div>
        )}

        <div className="ps-tag-row ps-tag-row-with-select">
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

          <select
            className="ps-input ps-level-select"
            value={levelValue}
            onChange={(event) => {
              setLevelValue(event.target.value);
              if (error) setError('');
            }}
            aria-label="Nivel"
          >
            <option value="">Nivel</option>
            {LEVELS.map((level) => (
              <option key={level.value} value={level.value}>{level.label}</option>
            ))}
          </select>
          <button type="button" className="ps-add-tag" onClick={() => addValue(inputValue)}>+</button>
        </div>

        {error && <span className="ps-field-error">{error}</span>}
      </div>
    </div>
  );
};

export default SkillLevelTagInput;
