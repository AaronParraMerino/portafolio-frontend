import { useEffect, useState } from 'react';

const FilterSection = ({
  title,
  icon,
  defaultOpen = false,
  children,
  sectionId,
  accordion = false,
  openSectionId = null,
  onAccordionToggle,
}) => {
  const [independentOpen, setIndependentOpen] = useState(defaultOpen);
  const open = accordion ? openSectionId === sectionId : independentOpen;

  useEffect(() => {
    if (!accordion && openSectionId === sectionId) {
      setIndependentOpen(true);
    }
  }, [accordion, openSectionId, sectionId]);

  const toggle = () => {
    if (accordion) {
      onAccordionToggle?.(open ? null : sectionId);
      return;
    }

    setIndependentOpen((value) => !value);
  };

  return (
    <section className="ps-filter-card">
      <button
        type="button"
        className={`ps-filter-head ${open ? 'open' : ''}`}
        onClick={toggle}
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
