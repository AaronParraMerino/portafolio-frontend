import {
  BsCheck2,
  BsEnvelope,
  BsPersonCheck,
  BsTelephone,
  BsX,
} from 'react-icons/bs';
import EventsEmptyState from './EventsEmptyState';

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
            {requests.map((request) => (
              <article key={request.id || request.email} className="evt-admin-request-card">
                <div className="evt-admin-request-head">
                  <span className="evt-admin-request-avatar">
                    <BsPersonCheck />
                  </span>
                  <div>
                    <strong>{request.name}</strong>
                    <span>{request.organization} · {request.role}</span>
                  </div>
                  <span className={`evt-admin-request-status ${request.status}`}>
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
              </article>
            ))}
          </div>
        ) : (
          <EventsEmptyState
            icon={BsPersonCheck}
            title="Sin solicitudes pendientes"
            description="Aqui se revisaran los usuarios que pidan permiso para publicar eventos."
            hint="Aceptar una solicitud cambia el criterio administrativo para habilitar el rol publicador."
          />
        )}
      </section>
    </div>
  );
}
