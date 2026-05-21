import { USER_BULK_ACTIONS } from '../services/profileService';

export default function UsersBulkBar({
  selectedCount,
  supportsMutations,
  onClearSelection,
}) {
  if (!selectedCount) return null;

  return (
    <div className="usr-bulk-bar" role="status" aria-live="polite">
      <span className="usr-bulk-count">
        {selectedCount} seleccionado{selectedCount !== 1 ? 's' : ''}
      </span>

      <div className="usr-bulk-separator" />

      {USER_BULK_ACTIONS.map((action) => (
        <button
          key={action.id}
          type="button"
          className={`usr-bulk-action usr-bulk-action--${action.tone}`}
          disabled={!supportsMutations}
          title={supportsMutations ? action.label : 'Disponible al integrar backend'}
        >
          {action.label}
        </button>
      ))}

      <div className="usr-bulk-separator" />

      <button
        type="button"
        className="usr-bulk-action"
        onClick={onClearSelection}
      >
        Limpiar seleccion
      </button>
    </div>
  );
}
