import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BsArrowClockwise, BsArrowLeft, BsCalendarEvent } from 'react-icons/bs';
import { useLanguage } from '../../../../core/i18n';
import {
  EventCard,
  EventDetailModal,
} from '../../home/components/events';
import useEventsPage from '../hooks/useEventsPage';
import EventsPagination from '../components/EventsPagination';
import PublicCatalogSkeleton from '../../shared/PublicCatalogSkeleton';
import { hasActiveStoredSession } from '../../../../shared/utils/authStorage';
import '../styles/publicEvents.css';
import '../../shared/publicCatalog.css';

export default function PublicEventsPage() {
  const { t } = useLanguage();
  const {
    authRequired,
    error,
    events,
    goToPage,
    loading,
    notice,
    page,
    pagination,
    refresh,
    register,
    registeringId,
    setNotice,
  } = useEventsPage();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();

  const currentPage = pagination.pagina_actual || page;
  const lastPage = pagination.ultima_pagina || 1;
  const hasEvents = events.length > 0;
  const countLabel = loading
    ? t('public.events.loading')
    : pagination.total > 0
      ? t('public.events.showing', {
        from: pagination.desde || 1,
        to: pagination.hasta || events.length,
        total: pagination.total,
      })
      : t('public.events.noneVisible');

  const redirectToLogin = () => {
    sessionStorage.setItem('auth:return-to', '/eventos');
    navigate('/auth/login', { state: { from: '/eventos' } });
  };

  const handleRegister = async (event) => {
    if (event?.requiresLogin || !hasActiveStoredSession()) {
      redirectToLogin();
      return;
    }

    const result = await register(event);

    if (result?.refreshed && selectedEvent) {
      const updated = result.refreshed.events.find((item) => String(item.id) === String(selectedEvent.id));
      if (updated) setSelectedEvent(updated);
    }
  };
  const handleViewDetails = (event) => {
    if (!hasActiveStoredSession()) {
      redirectToLogin();
      return;
    }

    setSelectedEvent(event);
  };

  return (
    <main className="evtpub-page pubcat-page">
      <section className="evtpub-shell pubcat-shell">
        <header className="evtpub-header pubcat-header">
          <div>
            <div className="evtpub-kicker pubcat-kicker">
              <BsCalendarEvent aria-hidden="true" />
              {t('public.events.kicker')}
            </div>
            <h1>{t('public.events.title')}</h1>
            <p>{t('public.events.description')}</p>
          </div>

          <div className="evtpub-header-actions pubcat-actions">
            <button type="button" onClick={refresh} disabled={loading}>
              <BsArrowClockwise />
              {t('public.events.refresh')}
            </button>
            <Link to="/">
              <BsArrowLeft />
              {t('public.events.backHome')}
            </Link>
          </div>
        </header>

        <div className="evtpub-summary pubcat-summary" aria-live="polite">
          <span>{countLabel}</span>
          <strong>{t('public.events.page', { current: currentPage, last: lastPage })}</strong>
        </div>

        {authRequired && (
          <div className="evtpub-state pubcat-state">
            <BsCalendarEvent aria-hidden="true" />
            <div>
              <strong>{t('public.events.authTitle')}</strong>
              <span>{t('public.events.authText')}</span>
            </div>
          </div>
        )}

        {(notice || error) && !authRequired && (
          <div className={`evtpub-message${error ? ' is-error' : ''}`} role={error ? 'alert' : 'status'}>
            <span>{error || notice}</span>
            {notice && (
              <button type="button" onClick={() => setNotice('')} aria-label={t('public.events.closeMessage')}>
                {t('public.events.close')}
              </button>
            )}
          </div>
        )}

        <section className="evtpub-grid pubcat-grid" aria-live="polite">
          {loading && <PublicCatalogSkeleton count={9} />}

          {!loading && !authRequired && !error && hasEvents && events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onRegister={handleRegister}
              onViewDetails={handleViewDetails}
              registering={String(registeringId || '') === String(event.id)}
              containImage
            />
          ))}
        </section>

        {!loading && !authRequired && !error && !hasEvents && (
          <div className="evtpub-state pubcat-state">
            <BsCalendarEvent aria-hidden="true" />
            <div>
              <strong>{t('public.events.emptyTitle')}</strong>
              <span>{t('public.events.emptyText')}</span>
            </div>
          </div>
        )}

        {!authRequired && !error && (
          <EventsPagination
            currentPage={currentPage}
            lastPage={lastPage}
            loading={loading}
            onPageChange={goToPage}
          />
        )}
      </section>

      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onRegister={handleRegister}
        registering={String(registeringId || '') === String(selectedEvent?.id || '')}
      />
    </main>
  );
}
