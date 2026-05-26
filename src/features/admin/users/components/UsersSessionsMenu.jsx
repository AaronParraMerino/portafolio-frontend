import { useEffect, useState } from 'react';
import {
  closeAllUserSessions,
  closeUserSession,
  fetchUserSessions,
} from '../services/usersService';

function relativeTime(input) {
  const timestamp = new Date(input).getTime();

  if (!input || Number.isNaN(timestamp)) return 'Sin actividad reciente';

  const seconds = Math.round((timestamp - Date.now()) / 1000);
  const absolute = Math.abs(seconds);
  const formatter = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

  if (absolute < 60) return formatter.format(seconds, 'second');
  if (absolute < 3600) return formatter.format(Math.round(seconds / 60), 'minute');
  if (absolute < 86400) return formatter.format(Math.round(seconds / 3600), 'hour');
  return formatter.format(Math.round(seconds / 86400), 'day');
}

function sessionLabel(session) {
  return [
    session.sistema_operativo || 'Sistema desconocido',
    session.navegador_nombre || 'Navegador desconocido',
    session.navegador_version,
  ].filter(Boolean).join(' - ');
}

export default function UsersSessionsMenu({ user, onCountChange }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [closingAll, setClosingAll] = useState(false);

  useEffect(() => {
    let active = true;

    fetchUserSessions(user.id)
      .then((items) => {
        if (!active) return;
        setSessions(items);
        onCountChange(user.id, items.length);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'No se pudieron cargar las sesiones.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [onCountChange, user.id]);

  const handleCloseSession = async (sessionId) => {
    setBusyId(sessionId);
    setError('');

    try {
      await closeUserSession(user.id, sessionId);
      setSessions((current) => {
        const next = current.filter((session) => session.id_rastreo_interno !== sessionId);
        onCountChange(user.id, next.length);
        return next;
      });
    } catch (requestError) {
      setError(requestError.message || 'No se pudo cerrar la sesion.');
    } finally {
      setBusyId(null);
    }
  };

  const handleCloseAll = async () => {
    setClosingAll(true);
    setError('');

    try {
      await closeAllUserSessions(user.id);
      setSessions([]);
      onCountChange(user.id, 0);
    } catch (requestError) {
      setError(requestError.message || 'No se pudieron cerrar las sesiones.');
    } finally {
      setClosingAll(false);
    }
  };

  return (
    <div className="usr-session-menu">
      <section className="usr-session-menu-list">
        <div className="usr-session-menu-head">
          <strong>Dispositivos vinculados</strong>
          <span>{sessions.length} sesiones activas</span>
        </div>

        {loading ? <p className="usr-session-menu-state">Cargando sesiones...</p> : null}
        {!loading && error ? <p className="usr-session-menu-error">{error}</p> : null}
        {!loading && !error && sessions.length === 0 ? (
          <p className="usr-session-menu-state">No existen sesiones activas para este usuario.</p>
        ) : null}

        {!loading && sessions.length > 0 ? (
          <div className="usr-session-menu-scroll">
            {sessions.map((session) => {
              const id = session.id_rastreo_interno;
              const busy = busyId === id;

              return (
                <article className="usr-session-menu-device" key={id}>
                  <div>
                    <strong>{sessionLabel(session)}</strong>
                    <span>
                      {[session.pais_codigo, session.ip_address].filter(Boolean).join(' - ') || 'Ubicacion no disponible'}
                    </span>
                    <span>{relativeTime(session.ultima_actividad)}</span>
                  </div>
                  <button
                    className="usr-session-close-btn"
                    disabled={busy || closingAll}
                    onClick={() => handleCloseSession(id)}
                    type="button"
                  >
                    {busy ? 'Cerrando...' : 'Cerrar sesion'}
                  </button>
                </article>
              );
            })}
          </div>
        ) : null}
      </section>

      <section className="usr-session-menu-all">
        <strong>Cerrar en todos los dispositivos</strong>
        <p>Finaliza todas las sesiones activas registradas para {user.nombre}.</p>
        <button
          className="usr-session-close-all"
          disabled={loading || sessions.length === 0 || closingAll}
          onClick={handleCloseAll}
          type="button"
        >
          {closingAll ? 'Cerrando sesiones...' : 'Cerrar todas'}
        </button>
      </section>
    </div>
  );
}
