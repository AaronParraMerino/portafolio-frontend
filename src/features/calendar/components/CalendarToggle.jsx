import { useLanguage } from '../../../core/i18n';

export default function CalendarToggle({ open, onClick }) {
  const { t } = useLanguage();

  return (
    <button
      type="button"
      className={`cal-side-toggle${open ? ' is-open' : ''}`}
      onClick={onClick}
      title={open ? t('calendar.toggle.closeTitle') : t('calendar.toggle.openTitle')}
      aria-label={open ? t('calendar.toggle.closeAria') : t('calendar.toggle.openAria')}
      aria-expanded={open}
    >
      <span className="cal-side-toggle-label">{t('calendar.toggle.label')}</span>
    </button>
  );
}
