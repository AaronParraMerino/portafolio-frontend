import {
  BsBoxArrowUpRight,
  BsClockHistory,
  BsDisplay,
  BsPersonCircle,
} from 'react-icons/bs';
import { useLanguage } from '../../../../core/i18n';
import { getAuditActionTone } from '../services/auditService';

export default function AuditTable({
  items,
  loading,
  meta,
  onPageChange,
  onOpenDetail,
}) {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="aud-empty-state">
        <BsClockHistory />
        <strong>{t('adminAudit.loading.title')}</strong>
        <p>{t('adminAudit.loading.description')}</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="aud-empty-state">
        <BsClockHistory />
        <strong>{t('adminAudit.empty.title')}</strong>
        <p>{t('adminAudit.empty.description')}</p>
      </div>
    );
  }

  return (
    <>
      <div className="aud-table-wrap">
        <table className="aud-table">
          <thead>
            <tr>
              <th>{t('adminAudit.table.action')}</th>
              <th>{t('adminAudit.table.actor')}</th>
              <th>{t('adminAudit.table.affected')}</th>
              <th>{t('adminAudit.table.module')}</th>
              <th>{t('adminAudit.table.device')}</th>
              <th>{t('adminAudit.table.date')}</th>
              <th>{t('adminAudit.table.detail')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const tone = getAuditActionTone(item.action);

              return (
                <tr key={item.id}>
                  <td>
                    <div className="aud-action-cell">
                      <span className={`aud-action-icon aud-action-icon--${tone}`}>
                        <BsClockHistory />
                      </span>
                      <span>
                        <strong>{item.actionLabel}</strong>
                        <small>{item.description || t('adminAudit.table.noDescription')}</small>
                      </span>
                    </div>
                  </td>
                  <td>
                    <UserCell
                      icon={BsPersonCircle}
                      name={item.actorName}
                      email={item.actorEmail}
                      fallback={t('adminAudit.table.systemActor')}
                    />
                  </td>
                  <td>
                    <UserCell
                      icon={BsPersonCircle}
                      name={item.affectedUserName}
                      email={item.affectedUserEmail}
                      fallback={t('adminAudit.table.noAffected')}
                    />
                  </td>
                  <td>
                    <span className="aud-module-pill">
                      {item.moduleLabel}
                    </span>
                    {item.recordId ? <small className="aud-record-id">#{item.recordId}</small> : null}
                  </td>
                  <td>
                    <div className="aud-device-cell">
                      <BsDisplay />
                      <span>{item.ipAddress || t('adminAudit.table.noIp')}</span>
                    </div>
                  </td>
                  <td>{item.dateHuman}</td>
                  <td>
                    <button
                      type="button"
                      className="aud-detail-btn"
                      onClick={() => onOpenDetail(item)}
                    >
                      <BsBoxArrowUpRight />
                      {t('adminAudit.table.view')}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="aud-pagination">
        <div className="aud-pagination-info">
          {t('adminAudit.pagination.summary', {
            from: meta.from || 0,
            to: meta.to || 0,
            total: meta.total || 0,
          })}
        </div>
        <div className="aud-pagination-actions">
          <button
            type="button"
            className="aud-page-btn"
            disabled={(meta.currentPage || 1) <= 1}
            onClick={() => onPageChange((meta.currentPage || 1) - 1)}
          >
            {t('adminAudit.pagination.previous')}
          </button>
          <button
            type="button"
            className="aud-page-btn active"
            disabled={(meta.lastPage || 1) <= 1}
          >
            {meta.currentPage || 1}
          </button>
          <button
            type="button"
            className="aud-page-btn"
            disabled={(meta.currentPage || 1) >= (meta.lastPage || 1)}
            onClick={() => onPageChange((meta.currentPage || 1) + 1)}
          >
            {t('adminAudit.pagination.next')}
          </button>
        </div>
      </div>
    </>
  );
}

function UserCell({ icon: Icon, name, email, fallback }) {
  return (
    <div className="aud-user-cell">
      <Icon />
      <span>
        <strong>{name || fallback}</strong>
        {email ? <small>{email}</small> : null}
      </span>
    </div>
  );
}
