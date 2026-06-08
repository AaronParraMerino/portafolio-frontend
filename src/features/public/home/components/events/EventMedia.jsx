import { cx, getEventVisualMeta } from './eventUiHelpers';

export default function EventMedia({
  event,
  className = '',
  overlay = false,
  containImage = false,
  children,
}) {
  const visual = getEventVisualMeta(event);
  const style = event?.imageUrl && !containImage
    ? { backgroundImage: `url("${event.imageUrl}")` }
    : undefined;

  return (
    <div
      className={cx(
        'evh-media',
        visual.toneClass,
        event?.imageUrl ? 'has-image' : 'has-fallback',
        containImage && event?.imageUrl && 'has-contained-image',
        overlay && 'has-overlay',
        className,
      )}
      style={style}
    >
      {event?.imageUrl && containImage && (
        <div className="evh-contained-media" aria-hidden="true">
          <img className="evh-contained-backdrop" src={event.imageUrl} alt="" />
          <div className="evh-contained-canvas">
            <img className="evh-contained-image" src={event.imageUrl} alt="" />
          </div>
        </div>
      )}
      {!event?.imageUrl && (
        <div className="evh-media-fallback" aria-hidden="true">
          <visual.Icon />
        </div>
      )}
      {children}
    </div>
  );
}
