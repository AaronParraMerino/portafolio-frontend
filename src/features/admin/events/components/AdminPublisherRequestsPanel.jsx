import { useEffect, useState } from 'react';
import {
  BsCheck2,
  BsEnvelope,
  BsPersonCheck,
  BsTelephone,
  BsX,
} from 'react-icons/bs';
import { useLanguage } from '../../../../core/i18n';
import CachedUserAvatar from '../../users/components/CachedUserAvatar';
import EventsEmptyState from './EventsEmptyState';
import AdminPagination, { getAdminPageSlice } from '../../shared/AdminPagination';

const REQUESTS_PAGE_SIZE = 6;

function getRequestReviewReason(request) {
  return request.revisionReason
    || request.motivo_revision
    || request.raw?.revisionReason
    || request.raw?.motivo_revision
    || '';
}

export default function AdminPublisherRequestsPanel({
  sourceReady,
  requests,
  onReviewRequest,
}) {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const {
    currentPage: safeCurrentPage,
    pageItems: pagedRequests,
    totalPages,
    paginationItems,
  } = getAdminPageSlice(requests, currentPage, REQUESTS_PAGE_SIZE);
  const pageSummary = sourceReady && requests.length
    ? t('adminEvents.pagination.showingRequests', {
      start: (safeCurrentPage - 1) * REQUESTS_PAGE_SIZE + 1,
      end: Math.min(safeCurrentPage * REQUESTS_PAGE_SIZE, requests.length),
      count: requests.length,
    })
    : sourceReady ? t('adminEvents.pagination.noResults') : t('adminEvents.pagination.noRecords');

  useEffect(() => {
    setCurrentPage(1);
  }, [requests.length]);

  return (
    <div className="evt-view-body">
      <section className="evt-sheet">
        <div className="evt-view-toolbar">
          <div className="evt-view-toolbar-copy">
            <span className="evt-sheet-kicker">{t('adminEvents.adminRequests.kicker')}</span>
            <h2 className="evt-sheet-title">{t('adminEvents.adminRequests.title')}</h2>
          </div>
        </div>

        {sourceReady && requests.length > 0 ? (
          <div className="evt-admin-request-grid">
            {pagedRequests.map((request) => {
              const isPending = request.status === 'pendiente';
              const reviewReason = getRequestReviewReason(request);

              return (
                <article key={request.id || request.email} className={`evt-admin-request-card${isPending ? '' : ' is-reviewed'}`}>
                  <div className="evt-admin-request-head">
                    <CachedUserAvatar user={request.user} className="evt-admin-request-avatar" />
                    <div>
                      <strong>{request.name}</strong>
                      <span>{request.organization} - {request.role}</span>
                    </div>
                    <span className={`evt-admin-request-status evt-admin-request-status--${t(`adminEvents.status.${request.status}`)}`}>
                      {t(`adminEvents.status.${request.status}`)}
                    </span>
                  </div>

                  <div className="evt-mini-meta">
                    <span>
                      <BsEnvelope />
                      {request.email}
                    </span>
                    <span>
                      <BsTelephone />
                      {request.phone}
                    </span>
                    <span>{request.documentId}</span>
                  </div>

                  <p className="evt-card-desc">{request.reason}</p>
                  {request.experience ? <p className="evt-admin-request-note">{request.experience}</p> : null}
                  {request.links ? <span className="evt-admin-request-link">{request.links}</span> : null}

                  {!isPending ? (
                    <div className="evt-admin-request-review">
                      <strong>{request.status === 'aprobada' ? t('adminEvents.adminRequests.approved') : t('adminEvents.adminRequests.rejected')}</strong>
                      <span>{reviewReason || t('adminEvents.adminRequests.reviewCompleted')}</span>
                    </div>
                  ) : null}

                  {isPending ? (
                    <div className="evt-card-actions">
                      <button
                        type="button"
                        className="evt-btn evt-btn--ghost"
                        onClick={() => onReviewRequest(request, 'rechazar')}
                      >
                        <BsX />
                        {t('adminEvents.action.rechazar')}
                      </button>
                      <button
                        type="button"
                        className="evt-btn evt-btn--primary"
                        onClick={() => onReviewRequest(request, 'aceptar')}
                      >
                        <BsCheck2 />
                        {t('adminEvents.adminRequests.acceptPublisher')}
                      </button>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <EventsEmptyState
            icon={BsPersonCheck}
            title={t('adminEvents.adminRequests.emptyTitle')}
            description={t('adminEvents.adminRequests.emptyDescription')}
            hint={t('adminEvents.adminRequests.emptyHint')}
          />
        )}

        <AdminPagination
          summary={pageSummary}
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          paginationItems={paginationItems}
          previousLabel={t('adminEvents.common.previous')}
          nextLabel={t('adminEvents.common.next')}
          disabled={!sourceReady}
          onPageChange={setCurrentPage}
        />
      </section>
    </div>
  );
}
