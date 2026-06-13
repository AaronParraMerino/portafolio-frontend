import { useId, useMemo, useState } from 'react';

const normalizeSearchText = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

const currentWord = (value) => normalizeSearchText(
  String(value || '').trimEnd().split(/\s+/).pop() || ''
);

const TextSuggestionInput = ({
  label,
  placeholder,
  value = '',
  onChange,
  suggestions = [],
}) => {
  const inputId = useId();
  const [focused, setFocused] = useState(false);

  const filteredSuggestions = useMemo(() => {
    const query = currentWord(value);
    if (!query) return [];

    return suggestions
      .filter((item) => normalizeSearchText(item).includes(query))
      .slice(0, 6);
  }, [suggestions, value]);

  const selectSuggestion = (suggestion) => {
    const prefix = String(value || '').replace(/\S+\s*$/, '');
    onChange(`${prefix}${suggestion}`);
  };

  return (
    <div className="ps-field">
      {label && <label className="ps-label" htmlFor={inputId}>{label}</label>}
      <div className="ps-tag-input-wrap">
        <input
          id={inputId}
          type="text"
          className="ps-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 140)}
          placeholder={placeholder}
        />

        {focused && filteredSuggestions.length > 0 && (
          <div className="ps-suggestions ps-suggestions-inline">
            {filteredSuggestions.map((suggestion) => (
              <button
                type="button"
                key={suggestion}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectSuggestion(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TextSuggestionInput;
