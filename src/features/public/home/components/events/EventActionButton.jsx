import { getEventActionState } from './eventUiHelpers';
import { useLanguage } from '../../../../../core/i18n';
import usePausedAccount from '../../../../../shared/hooks/usePausedAccount';

export default function EventActionButton({
  event,
  loading = false,
  onRegister,
  className = '',
}) {
  const { t } = useLanguage();
  const paused = usePausedAccount();
  const action = getEventActionState(event, loading, t);
  const disabled = paused || action.disabled;

  const handleClick = (clickEvent) => {
    clickEvent.stopPropagation();
    if (!disabled) {
      onRegister?.(event);
    }
  };

  return (
    <button
      type="button"
      className={`evh-action evh-action-${paused ? 'paused' : action.tone}${className ? ` ${className}` : ''}`}
      disabled={disabled}
      onClick={handleClick}
    >
      {action.label}
    </button>
  );
}
