import { BsInfoCircle } from 'react-icons/bs';
import { useLanguage } from '../../../../../core/i18n';
import EventActionButton from './EventActionButton';
import EventMedia from './EventMedia';
import {
  cx,
  formatActiveDays,
  formatEventDateRange,
  formatEventTimeRange,
  getCapacityLabel,
  getEventStatusLabel,
  getEventTypeLabel,
  getShortDescription,
} from './eventUiHelpers';
import './eventsHome.css';

export default function EventCard({
  event,
  onRegister,
  onViewDetails,
  registering = false,
  containImage = false,
  className = '',
}) {
  const { language, t } = useLanguage();
  const dateRange = formatEventDateRange(event.startsAt, event.endsAt, language, t);
  const timeRange = formatEventTimeRange(event.startsAt, event.endsAt, language);
  const activeDays = formatActiveDays(event.activeDays, language);
  const handleViewDetails = (clickEvent) => {
    clickEvent.stopPropagation();
    onViewDetails?.(event);
  };

  return (
    <article className={cx('evh-card', containImage && 'evh-card-contain-image', className)}>
      <button
        type="button"
        className="evh-card-media-button"
        onClick={handleViewDetails}
        aria-label={t('home.events.detailsAria', { title: event.title })}
      >
        <EventMedia event={event} className="evh-card-media" containImage={containImage}>
          <span className="evh-badge">{getEventTypeLabel(event, t)}</span>
          <span className={cx('evh-status', event.soldOut && 'is-soldout')}>
            {getEventStatusLabel(event, t)}
          </span>
        </EventMedia>
      </button>

      <div className="evh-card-body">
        <div className="evh-card-title-row">
          <h3>{event.title}</h3>
        </div>

        <p className="evh-card-summary">{getShortDescription(event.description, 92)}</p>

        <div className="evh-card-meta">
          <span>{dateRange}</span>
          {timeRange && <span>{timeRange}</span>}
          {activeDays && <span>{activeDays}</span>}
          <span>{getCapacityLabel(event, t)}</span>
        </div>

        <div className="evh-card-actions">
          <button
            type="button"
            className="evh-ghost-button"
            onClick={handleViewDetails}
          >
            <BsInfoCircle />
            {t('home.events.details')}
          </button>

          <EventActionButton
            event={event}
            loading={registering}
            onRegister={onRegister}
          />
        </div>
      </div>
    </article>
  );
}
