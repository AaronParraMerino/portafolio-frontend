const ActiveFilters = ({ chips = [], onClear }) => {
  if (!chips.length) return null;

  return (
    <div className="ps-active-wrap">
      <div className="ps-active-filters">
        {chips.map((chip) => (
          <span className="ps-active-chip" key={chip.id}>
            {chip.label}
            <button type="button" onClick={chip.onRemove} aria-label={`Quitar filtro ${chip.label}`}>×</button>
          </span>
        ))}
      </div>

      {onClear && (
        <button type="button" className="ps-clear-inline" onClick={onClear}>
          Quitar todos
        </button>
      )}
    </div>
  );
};

export default ActiveFilters;
