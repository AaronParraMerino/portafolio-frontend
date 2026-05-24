import {
  BsClockHistory,
  BsFileEarmarkText,
  BsMegaphone,
  BsPeople,
} from 'react-icons/bs';
import { USER_MANAGEMENT_VIEWS } from '../services/usersService';

const VIEW_ICONS = {
  users: BsPeople,
  communications: BsMegaphone,
  history: BsClockHistory,
  templates: BsFileEarmarkText,
};

export default function UsersModuleTabs({
  activeView,
  counts,
  onViewChange,
}) {
  return (
    <div className="usr-view-tabs-wrap">
      <div className="usr-view-tabs" role="tablist" aria-label="Vistas del modulo de usuarios">
        {USER_MANAGEMENT_VIEWS.map((view) => {
          const Icon = VIEW_ICONS[view.id];
          const countValue = counts?.[view.id] ?? '--';

          return (
            <button
              key={view.id}
              type="button"
              role="tab"
              aria-selected={activeView === view.id}
              className={`usr-view-tab${activeView === view.id ? ' active' : ''}`}
              onClick={() => onViewChange(view.id)}
            >
              <span className="usr-view-tab-icon">
                {Icon ? <Icon /> : null}
              </span>
              <span className="usr-view-tab-label">{view.label}</span>
              <span className="usr-view-tab-count">{countValue}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
