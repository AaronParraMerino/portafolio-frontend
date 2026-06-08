import {
  BsCalendar3,
  BsDisplay,
  BsFileEarmarkText,
  BsPersonCircle,
  BsShieldCheck,
  BsX,
} from 'react-icons/bs';
import { useLanguage } from '../../../../core/i18n';

export default function AuditDetailModal({ item, onClose }) {
  const { t } = useLanguage();

  if (!item) return null;

  return (
    <div className="aud-modal-backdrop" onClick={onClose} aria-hidden="true">
      <div
        className="aud-modal"
        role="dialog"
        aria-modal="true"
        aria-label={t('adminAudit.detail.title')}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="aud-modal-head">
          <span className="aud-modal-icon">
            <BsShieldCheck />
          </span>
          <div className="aud-modal-copy">
            <strong>{item.actionLabel}</strong>
            <span>{item.moduleLabel} {item.recordId ? `#${item.recordId}` : ''}</span>
          </div>
          <button
            type="button"
            className="aud-modal-close"
            onClick={onClose}
            aria-label={t('actions.close')}
          >
            <BsX />
          </button>
        </div>

        <div className="aud-modal-body">
          <section className="aud-modal-section aud-modal-section--summary">
            <span className="aud-modal-section-kicker">{t('adminAudit.detail.description')}</span>
            <p>{item.description || t('adminAudit.table.noDescription')}</p>
          </section>

          <div className="aud-detail-card-grid">
            <DetailCard
              icon={BsPersonCircle}
              label={t('adminAudit.detail.actor')}
              title={formatUserName(item.actorName)}
              description={item.actorEmail || t('adminAudit.table.systemActor')}
            />
            <DetailCard
              icon={BsPersonCircle}
              label={t('adminAudit.detail.affected')}
              title={formatUserName(item.affectedUserName) || t('adminAudit.table.noAffected')}
              description={item.affectedUserEmail || t('adminAudit.detail.noRecord')}
            />
            <DetailCard
              icon={BsFileEarmarkText}
              label={t('adminAudit.detail.record')}
              title={item.recordId ? `#${item.recordId}` : t('adminAudit.detail.noRecord')}
              description={item.moduleLabel}
            />
            <DetailCard
              icon={BsCalendar3}
              label={t('adminAudit.detail.date')}
              title={item.dateHuman}
              description={item.date || t('adminAudit.detail.noRecord')}
            />
          </div>

          <section className="aud-modal-section">
            <div className="aud-modal-section-head">
              <span className="aud-modal-section-kicker">{t('adminAudit.table.device')}</span>
              <h3>{item.ipAddress || t('adminAudit.table.noIp')}</h3>
            </div>
            <div className="aud-device-detail">
              <BsDisplay />
              <span>{item.userAgent || t('adminAudit.detail.noUserAgent')}</span>
            </div>
          </section>
        </div>

        <div className="aud-modal-foot">
          <span>{t('adminAudit.detail.footer')}</span>
          <button type="button" className="aud-reason-btn aud-reason-btn--primary" onClick={onClose}>
            {t('adminAudit.detail.understood')}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailCard({ icon: Icon, label, title, description }) {
  return (
    <article className="aud-detail-card">
      <span className="aud-detail-card-icon">
        <Icon />
      </span>
      <div>
        <span>{label}</span>
        <strong>{title}</strong>
        <small>{description}</small>
      </div>
    </article>
  );
}

function formatUserName(name) {
  return String(name || '').trim();
}
