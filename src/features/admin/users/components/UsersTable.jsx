import { Fragment, useEffect, useRef, useState } from 'react';
import {
  getUserSessionCount,
  getUserRoleMeta,
  getUserStatusMeta,
  USER_TABLE_COLUMNS,
} from '../services/usersService';
import CachedUserAvatar from './CachedUserAvatar';
import UsersSessionsMenu from './UsersSessionsMenu';

function ColumnIcon({ id }) {
  const props = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  if (id === 'user') {
    return (
      <svg viewBox="0 0 20 20" {...props}>
        <circle cx="10" cy="6.5" r="3" />
        <path d="M4 16c0-3 2.7-5 6-5s6 2 6 5" />
      </svg>
    );
  }

  if (id === 'status') {
    return (
      <svg viewBox="0 0 20 20" {...props}>
        <path d="M10 2.5 4.5 5v4.2c0 3.1 2 6 5.5 8.3 3.5-2.3 5.5-5.2 5.5-8.3V5L10 2.5Z" />
        <path d="m7.8 9.9 1.5 1.5 3-3" />
      </svg>
    );
  }

  if (id === 'role') {
    return (
      <svg viewBox="0 0 20 20" {...props}>
        <path d="M10 2.5 15.5 5v4.5c0 3.3-2.1 6.1-5.5 8-3.4-1.9-5.5-4.7-5.5-8V5L10 2.5Z" />
        <path d="M7.5 10h5" />
        <path d="M10 7.5v5" />
      </svg>
    );
  }

  if (id === 'sessions') {
    return (
      <svg viewBox="0 0 20 20" {...props}>
        <rect x="2.5" y="3.5" width="15" height="10" rx="2" />
        <path d="M8 16.5h4" />
        <path d="M10 13.5v3" />
      </svg>
    );
  }

  if (id === 'lastAccess') {
    return (
      <svg viewBox="0 0 20 20" {...props}>
        <circle cx="10" cy="10" r="7" />
        <path d="M10 6.5v4l2.6 1.7" />
      </svg>
    );
  }

  if (id === 'registeredAt') {
    return (
      <svg viewBox="0 0 20 20" {...props}>
        <rect x="3" y="4.5" width="14" height="12" rx="2" />
        <path d="M6.5 2.5v4M13.5 2.5v4M3 8.5h14" />
      </svg>
    );
  }

  return null;
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="m6 3 5 5-5 5" />
    </svg>
  );
}

function UsersEmptyState({ emptyState }) {
  return (
    <div className="usr-empty-state">
      <div className="usr-empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </div>
      <strong>{emptyState.title}</strong>
      <p>{emptyState.description}</p>
    </div>
  );
}

export default function UsersTable({
  users,
  sourceReady,
  selectedIds,
  allVisibleSelected,
  someVisibleSelected,
  pageSummary,
  emptyState,
  currentPage,
  totalPages,
  paginationItems,
  onToggleUser,
  onToggleVisible,
  onGoToPage,
  onOpenUser,
  onSessionCountChange,
}) {
  const masterCheckboxRef = useRef(null);
  const [openSessionsUserId, setOpenSessionsUserId] = useState(null);

  useEffect(() => {
    if (!masterCheckboxRef.current) return;
    masterCheckboxRef.current.indeterminate = someVisibleSelected;
  }, [someVisibleSelected]);

  useEffect(() => {
    if (openSessionsUserId === null) return undefined;

    const handleOutsideClick = (event) => {
      if (!event.target.closest(`[data-session-menu-root="${openSessionsUserId}"]`)) {
        setOpenSessionsUserId(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [openSessionsUserId]);

  return (
    <>
      <div className="usr-table-wrap">
        <table className="usr-table">
          <thead>
            <tr>
              {USER_TABLE_COLUMNS.map((column) => (
                <th key={column.id}>
                  {column.id === 'selection' ? (
                    <input
                      ref={masterCheckboxRef}
                      type="checkbox"
                      className="usr-checkbox"
                      checked={allVisibleSelected}
                      onChange={onToggleVisible}
                      disabled={!users.length}
                      aria-label="Seleccionar pagina actual"
                    />
                  ) : (
                    <span className="usr-th-inner">
                      <ColumnIcon id={column.id} />
                      <span>{column.label}</span>
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          {users.length > 0 && (
            <tbody>
              {users.map((user) => {
                const isSelected = selectedIds.includes(String(user.id));
                const statusMeta = getUserStatusMeta(user.estado);
                const roleMeta = getUserRoleMeta(user);
                const sessionCount = getUserSessionCount(user);

                const isSessionsOpen = String(openSessionsUserId) === String(user.id);

                return (
                  <Fragment key={user.id}>
                  <tr className={isSelected ? 'selected' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        className="usr-checkbox"
                        checked={isSelected}
                        onChange={() => onToggleUser(user.id)}
                        aria-label={`Seleccionar a ${user.nombre || 'usuario'}`}
                      />
                    </td>

                    <td>
                      <div className="usr-user-cell">
                        <CachedUserAvatar user={user} />

                        <div className="usr-user-copy">
                          <strong>{user.nombre || 'Usuario sin nombre'}</strong>
                          <span>{user.email || 'Sin correo registrado'}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={`usr-role-badge usr-role-badge--${roleMeta.tone}`}>
                        {roleMeta.label}
                      </span>
                    </td>

                    <td>
                      <span className={`usr-status-badge usr-status-badge--${statusMeta.tone}`}>
                        <span className="usr-status-dot" />
                        {statusMeta.label}
                      </span>
                    </td>

                    <td data-session-menu-root={user.id}>
                      <button
                        type="button"
                        className={`usr-session-pill usr-session-trigger${sessionCount > 0 ? ' active' : ''}${isSessionsOpen ? ' open' : ''}`}
                        onClick={() => setOpenSessionsUserId(isSessionsOpen ? null : user.id)}
                        aria-expanded={isSessionsOpen}
                        aria-label={`Ver sesiones de ${user.nombre || 'usuario'}`}
                      >
                        {sessionCount > 0 ? sessionCount : 'Sin sesiones'}
                        <span aria-hidden="true" className="usr-session-chevron">v</span>
                      </button>
                    </td>

                    <td>
                      <span className="usr-time-chip">
                        {user.ultimoAcceso || '--'}
                      </span>
                    </td>

                    <td>
                      <span className="usr-time-chip">
                        {user.fechaRegistro || '--'}
                      </span>
                    </td>

                    <td className="usr-row-action-cell">
                      <button
                        type="button"
                        className="usr-row-action"
                        onClick={() => onOpenUser(user.id)}
                        title="Gestionar usuario"
                        aria-label={`Gestionar a ${user.nombre || 'usuario'}`}
                      >
                        <ChevronIcon />
                      </button>
                    </td>
                  </tr>
                  {isSessionsOpen ? (
                    <tr className="usr-session-expanded-row">
                      <td colSpan={USER_TABLE_COLUMNS.length} data-session-menu-root={user.id}>
                        <UsersSessionsMenu
                          user={user}
                          onCountChange={onSessionCountChange}
                        />
                      </td>
                    </tr>
                  ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          )}
        </table>

        {!users.length && <UsersEmptyState emptyState={emptyState} />}
      </div>

      <div className="usr-pagination">
        <div className="usr-pagination-info">{pageSummary}</div>

        <div className="usr-pagination-actions">
          <button
            type="button"
            className="usr-page-btn"
            onClick={() => onGoToPage(currentPage - 1)}
            disabled={currentPage <= 1 || !sourceReady}
          >
            Anterior
          </button>

          {paginationItems.map((page) => (
            <button
              key={page}
              type="button"
              className={`usr-page-btn${page === currentPage ? ' active' : ''}`}
              onClick={() => onGoToPage(page)}
              disabled={!sourceReady || totalPages <= 1}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            className="usr-page-btn"
            onClick={() => onGoToPage(currentPage + 1)}
            disabled={currentPage >= totalPages || !sourceReady}
          >
            Siguiente
          </button>
        </div>
      </div>
    </>
  );
}
