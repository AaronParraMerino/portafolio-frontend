import { useEffect, useState } from 'react';
import { useLanguage } from '../../../../core/i18n';
import {
  closeAllUserSessions,
  closeUserSession,
  fetchUserSessions,
} from '../services/usersService';

function relativeTime(input, language, t) {
  const timestamp = new Date(input).getTime();

  if (!input || Number.isNaN(timestamp)) return t('admin.users.sessions.noActivity');

  const seconds = Math.round((timestamp - Date.now()) / 1000);
  const absolute = Math.abs(seconds);
  const formatter = new Intl.RelativeTimeFormat(language || 'es', { numeric: 'auto' });

  if (absolute < 60) return formatter.format(seconds, 'second');
  if (absolute < 3600) return formatter.format(Math.round(seconds / 60), 'minute');
  if (absolute < 86400) return formatter.format(Math.round(seconds / 3600), 'hour');
  return formatter.format(Math.round(seconds / 86400), 'day');
}

function sessionLabel(session, t) {
  return [
    session.sistema_operativo || t('admin.users.sessions.unknownSystem'),
    session.navegador_nombre || t('admin.users.sessions.unknownBrowser'),
    session.navegador_version,
  ].filter(Boolean).join(' - ');
}

export default function UsersSessionsMenu({ user, onCountChange }) {
  const { language, t } = useLanguage();
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
        if (active) setError(requestError.message || t('admin.users.sessions.loadError'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [onCountChange, t, user.id]);

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
      setError(requestError.message || t('admin.users.sessions.closeError'));
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
      setError(requestError.message || t('admin.users.sessions.closeAllError'));
    } finally {
      setClosingAll(false);
    }
  };

  return (
    <div className="usr-session-menu">
      <section className="usr-session-menu-list">
        <div className="usr-session-menu-head">
          <strong>{t('admin.users.sessions.devices')}</strong>
          <span>{t('admin.users.sessions.active', { count: sessions.length })}</span>
        </div>

        {loading ? <p className="usr-session-menu-state">{t('admin.users.sessions.loading')}</p> : null}
        {!loading && error ? <p className="usr-session-menu-error">{error}</p> : null}
        {!loading && !error && sessions.length === 0 ? (
          <p className="usr-session-menu-state">{t('admin.users.sessions.empty')}</p>
        ) : null}

        {!loading && sessions.length > 0 ? (
          <div className="usr-session-menu-scroll">
            {sessions.map((session) => {
              const id = session.id_rastreo_interno;
              const busy = busyId === id;

              return (
                <article className="usr-session-menu-device" key={id}>
                  <div>
                    <strong>{sessionLabel(session, t)}</strong>
                    <span>
                      {[session.pais_codigo, session.ip_address].filter(Boolean).join(' - ') || t('admin.users.sessions.locationUnavailable')}
                    </span>
                    <span>{relativeTime(session.ultima_actividad, language, t)}</span>
                  </div>
                  <button
                    className="usr-session-close-btn"
                    disabled={busy || closingAll}
                    onClick={() => handleCloseSession(id)}
                    type="button"
                  >
                    {busy ? t('admin.users.sessions.closing') : t('admin.users.sessions.closeSession')}
                  </button>
                </article>
              );
            })}
          </div>
        ) : null}
      </section>

      <section className="usr-session-menu-all">
        <strong>{t('admin.users.sessions.closeAllTitle')}</strong>
        <p>{t('admin.users.sessions.closeAllDescription', { name: user.nombre })}</p>
        <button
          className="usr-session-close-all"
          disabled={loading || sessions.length === 0 || closingAll}
          onClick={handleCloseAll}
          type="button"
        >
          {closingAll ? t('admin.users.sessions.closingAll') : t('admin.users.sessions.closeAll')}
        </button>
      </section>
    </div>
  );
}
