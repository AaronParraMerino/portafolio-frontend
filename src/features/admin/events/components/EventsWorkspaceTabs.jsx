import {
  BsCalendar3,
  BsClockHistory,
  BsFileEarmarkText,
  BsMegaphone,
  BsStars,
} from 'react-icons/bs';
import { EVENT_WORKSPACE_VIEWS } from '../services/eventsService';

const VIEW_ICONS = {
  events: BsStars,
  communications: BsMegaphone,
  calendar: BsCalendar3,
  history: BsClockHistory,
  templates: BsFileEarmarkText,
};

export default function EventsWorkspaceTabs({
  activeView,
  counts,
  onViewChange,
}) {
  return (
    <div className="evt-tabs-wrap">
      <div className="evt-tabs" role="tablist" aria-label="Vistas del modulo de eventos">
        {EVENT_WORKSPACE_VIEWS.map((view) => {
          const Icon = VIEW_ICONS[view.id] || BsStars;

          return (
            <button
              key={view.id}
              type="button"
              className={`evt-tab${activeView === view.id ? ' active' : ''}`}
              role="tab"
              aria-selected={activeView === view.id}
              onClick={() => onViewChange(view.id)}
            >
              <Icon />
              <span>{view.label}</span>
              <small>{counts?.[view.id] ?? '--'}</small>
            </button>
          );
        })}
      </div>
    </div>
  );
}
