import { cx, getEventVisualMeta } from './eventUiHelpers';

export default function EventMedia({
  event,
  className = '',
  overlay = false,
  children,
}) {
  const visual = getEventVisualMeta(event);
  const style = event?.imageUrl
    ? { backgroundImage: `url("${event.imageUrl}")` }
    : undefined;

  return (
    <div
      className={cx(
        'evh-media',
        visual.toneClass,
        event?.imageUrl ? 'has-image' : 'has-fallback',
        overlay && 'has-overlay',
        className,
      )}
      style={style}
    >
      {!event?.imageUrl && (
        <div className="evh-media-fallback" aria-hidden="true">
          <visual.Icon />
        </div>
      )}
      {children}
    </div>
  );
}
