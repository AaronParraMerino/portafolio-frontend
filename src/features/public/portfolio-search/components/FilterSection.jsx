import { useState } from 'react';

const FilterSection = ({ title, icon, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="ps-filter-card">
      <button
        type="button"
        className={`ps-filter-head ${open ? 'open' : ''}`}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span className="ps-filter-title">
          <span className="ps-filter-icon" aria-hidden="true">{icon}</span>
          {title}
        </span>
        <span className={`ps-chevron ${open ? 'open' : ''}`} aria-hidden="true">⌄</span>
      </button>

      {open && <div className="ps-filter-body">{children}</div>}
    </section>
  );
};

export default FilterSection;
