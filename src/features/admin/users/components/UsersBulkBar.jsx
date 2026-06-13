import { useLanguage } from '../../../../core/i18n';
import { USER_BULK_ACTIONS } from '../services/usersService';

export default function UsersBulkBar({
  selectedCount,
  supportsMutations,
  onClearSelection,
  onNotifySelection,
}) {
  const { t } = useLanguage();

  if (!selectedCount) return null;

  return (
    <div className="usr-bulk-bar" role="status" aria-live="polite">
      <span className="usr-bulk-count">
        {t('admin.users.bulk.selected', { count: selectedCount })}
      </span>

      <div className="usr-bulk-separator" />

      {USER_BULK_ACTIONS.map((action) => (
        <button
          key={action.id}
          type="button"
          className={`usr-bulk-action usr-bulk-action--${action.tone}`}
          disabled={!supportsMutations}
          title={t(`admin.users.bulk.action.${action.id}`)}
        >
          {t(`admin.users.bulk.action.${action.id}`)}
        </button>
      ))}

      <div className="usr-bulk-separator" />

      <button
        type="button"
        className="usr-bulk-action usr-bulk-action--notice"
        onClick={onNotifySelection}
      >
        {t('admin.users.bulk.sendNotice')}
      </button>

      <div className="usr-bulk-separator" />

      <button
        type="button"
        className="usr-bulk-action"
        onClick={onClearSelection}
      >
        {t('admin.users.bulk.clearSelection')}
      </button>
    </div>
  );
}
