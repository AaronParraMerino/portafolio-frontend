export default function CalendarToggle({ open, onClick }) {
  return (
    <button
      type="button"
      className={`cal-side-toggle${open ? ' is-open' : ''}`}
      onClick={onClick}
      title={open ? 'Cerrar calendario' : 'Abrir calendario'}
      aria-label={open ? 'Cerrar calendario personal' : 'Abrir calendario personal'}
      aria-expanded={open}
    >
      <span className="cal-side-toggle-label">Calendario</span>
    </button>
  );
}
