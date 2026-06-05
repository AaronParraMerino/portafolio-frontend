import {
  BsCheck2,
  BsEnvelope,
  BsPersonCheck,
  BsTelephone,
  BsX,
} from 'react-icons/bs';
import CachedUserAvatar from '../../users/components/CachedUserAvatar';
import EventsEmptyState from './EventsEmptyState';

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
  return (
    <div className="evt-view-body">
      <section className="evt-sheet">
        <div className="evt-view-toolbar">
          <div className="evt-view-toolbar-copy">
            <span className="evt-sheet-kicker">Solicitudes</span>
            <h2 className="evt-sheet-title">Usuarios que quieren publicar eventos</h2>
          </div>
        </div>

        {sourceReady && requests.length > 0 ? (
          <div className="evt-admin-request-grid">
            {requests.map((request) => {
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
                    <span className={`evt-admin-request-status evt-admin-request-status--${request.status}`}>
                      {request.status}
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
                      <strong>{request.status === 'aprobada' ? 'Solicitud aprobada' : 'Solicitud rechazada'}</strong>
                      <span>{reviewReason || 'Revision administrativa completada.'}</span>
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
                        Rechazar
                      </button>
                      <button
                        type="button"
                        className="evt-btn evt-btn--primary"
                        onClick={() => onReviewRequest(request, 'aceptar')}
                      >
                        <BsCheck2 />
                        Aceptar publicador
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
            title="Sin solicitudes pendientes"
            description="Aqui se revisaran los usuarios que pidan permiso para publicar eventos."
            hint="Aceptar una solicitud habilita el rol publicador; rechazarla deja registrado el motivo administrativo."
          />
        )}
      </section>
    </div>
  );
}
