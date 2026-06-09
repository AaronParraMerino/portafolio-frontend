import { getEventActionState } from './eventUiHelpers';
import { useLanguage } from '../../../../../core/i18n';

export default function EventActionButton({
  event,
  loading = false,
  onRegister,
  className = '',
}) {
  const { t } = useLanguage();
  const action = getEventActionState(event, loading, t);

  const handleClick = (clickEvent) => {
    clickEvent.stopPropagation();
    if (!action.disabled) {
      onRegister?.(event);
    }
  };

  return (
    <button
      type="button"
      className={`evh-action evh-action-${action.tone}${className ? ` ${className}` : ''}`}
      disabled={action.disabled}
      onClick={handleClick}
    >
      {action.label}
    </button>
  );
}
