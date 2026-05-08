import { useMemo, useState } from 'react';

const normalizeTag = (value) => String(value || '').trim();

const TagInput = ({
  label,
  placeholder,
  values = [],
  onChange,
  suggestions = [],
}) => {
  const [inputValue, setInputValue] = useState('');
  const [focused, setFocused] = useState(false);

  const filteredSuggestions = useMemo(() => {
    const query = inputValue.trim().toLowerCase();
    if (!query) return [];

    return suggestions
      .filter((item) => {
        const text = String(item || '');
        return text.toLowerCase().includes(query) && !values.some((value) => value.toLowerCase() === text.toLowerCase());
      })
      .slice(0, 6);
  }, [inputValue, suggestions, values]);

  const addValues = (rawValue) => {
    const nextValues = String(rawValue || '')
      .split(',')
      .map(normalizeTag)
      .filter(Boolean);

    if (!nextValues.length) return;

    const merged = [...values];
    nextValues.forEach((item) => {
      const exists = merged.some((current) => current.toLowerCase() === item.toLowerCase());
      if (!exists) merged.push(item);
    });

    onChange(merged);
    setInputValue('');
  };

  const removeValue = (valueToRemove) => {
    onChange(values.filter((value) => value !== valueToRemove));
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addValues(inputValue);
    }

    if (event.key === 'Backspace' && !inputValue && values.length) {
      removeValue(values[values.length - 1]);
    }
  };

  return (
    <div className="ps-field ps-tag-field">
      {label && <label className="ps-label">{label}</label>}

      <div className="ps-tags-box">
        {values.length > 0 && (
          <div className="ps-tags-list">
            {values.map((value) => (
              <span className="ps-tag" key={value}>
                {value}
                <button type="button" onClick={() => removeValue(value)} aria-label={`Quitar ${value}`}>×</button>
              </span>
            ))}
          </div>
        )}

        <div className="ps-tag-row">
          <div className="ps-tag-input-wrap">
            <input
              type="text"
              className="ps-input"
              value={inputValue}
              placeholder={placeholder}
              onChange={(event) => setInputValue(event.target.value)}
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
                    onClick={() => addValues(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button type="button" className="ps-add-tag" onClick={() => addValues(inputValue)}>+</button>
        </div>
      </div>
    </div>
  );
};

export default TagInput;
