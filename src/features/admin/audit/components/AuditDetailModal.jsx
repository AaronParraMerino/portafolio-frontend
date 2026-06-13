import {
  BsCalendar3,
  BsDisplay,
  BsFileEarmarkText,
  BsPersonCircle,
  BsShieldCheck,
} from 'react-icons/bs';
import { useLanguage } from '../../../../core/i18n';
import AdminEdit, { AdminEditBody, AdminEditFooter, AdminEditSection } from '../../layout/AdminEdit';

export default function AuditDetailModal({ item, onClose }) {
  const { t } = useLanguage();

  if (!item) return null;

  return (
    <AdminEdit
      title={item.actionLabel}
      subtitle={`${item.moduleLabel} ${item.recordId ? `#${item.recordId}` : ''}`}
      icon={<BsShieldCheck />}
      onClose={onClose}
      ariaLabel={t('adminAudit.detail.title')}
      size="lg"
    >
        <AdminEditBody>
          <AdminEditSection label={t('adminAudit.detail.description')} className="aud-modal-section--summary">
            <p>{item.description || t('adminAudit.table.noDescription')}</p>
          </AdminEditSection>

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

          <AdminEditSection>
            <div className="aud-modal-section-head">
              <span className="aud-modal-section-kicker">{t('adminAudit.table.device')}</span>
              <h3>{item.ipAddress || t('adminAudit.table.noIp')}</h3>
            </div>
            <div className="aud-device-detail">
              <BsDisplay />
              <span>{item.userAgent || t('adminAudit.detail.noUserAgent')}</span>
            </div>
          </AdminEditSection>
        </AdminEditBody>

        <AdminEditFooter>
          <span>{t('adminAudit.detail.footer')}</span>
          <button type="button" className="aud-reason-btn aud-reason-btn--primary" onClick={onClose}>
            {t('adminAudit.detail.understood')}
          </button>
        </AdminEditFooter>
    </AdminEdit>
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
