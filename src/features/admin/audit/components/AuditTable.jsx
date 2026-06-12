import {
  BsClockHistory,
  BsPersonCircle,
} from 'react-icons/bs';
import { useLanguage } from '../../../../core/i18n';
import { getAuditActionTone } from '../services/auditService';
import AdminPagination, { buildAdminPaginationItems } from '../../shared/AdminPagination';

const AUDIT_COLUMNS = [
  { id: 'action', labelKey: 'adminAudit.table.action' },
  { id: 'actor', labelKey: 'adminAudit.table.actor' },
  { id: 'affected', labelKey: 'adminAudit.table.affected' },
  { id: 'module', labelKey: 'adminAudit.table.module' },
  { id: 'device', labelKey: 'adminAudit.table.device' },
  { id: 'date', labelKey: 'adminAudit.table.date' },
  { id: 'detail', labelKey: '' },
];

function ColumnIcon({ id }) {
  const props = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  if (id === 'action') {
    return (
      <svg viewBox="0 0 20 20" {...props}>
        <path d="M5 4.5h10" />
        <path d="M5 9.5h10" />
        <path d="M5 14.5h7" />
        <path d="M3 4.5h.01M3 9.5h.01M3 14.5h.01" />
      </svg>
    );
  }

  if (id === 'actor' || id === 'affected') {
    return (
      <svg viewBox="0 0 20 20" {...props}>
        <circle cx="10" cy="6.5" r="3" />
        <path d="M4 16c0-3 2.7-5 6-5s6 2 6 5" />
      </svg>
    );
  }

  if (id === 'module') {
    return (
      <svg viewBox="0 0 20 20" {...props}>
        <path d="M4 4.5h12v11H4z" />
        <path d="M7 8h6M7 11h4" />
      </svg>
    );
  }

  if (id === 'device') {
    return (
      <svg viewBox="0 0 20 20" {...props}>
        <rect x="2.5" y="4" width="15" height="10" rx="2" />
        <path d="M8 16h4M10 14v2" />
      </svg>
    );
  }

  if (id === 'date') {
    return (
      <svg viewBox="0 0 20 20" {...props}>
        <circle cx="10" cy="10" r="7" />
        <path d="M10 6.5v4l2.6 1.7" />
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

export default function AuditTable({
  items,
  loading,
  meta,
  onPageChange,
  onOpenDetail,
}) {
  const { t } = useLanguage();
  const currentPage = meta.currentPage || 1;
  const lastPage = meta.lastPage || 1;

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
              {AUDIT_COLUMNS.map((column) => (
                <th key={column.id}>
                  <span className="aud-th-inner">
                    <ColumnIcon id={column.id} />
                    <span>{column.labelKey ? t(column.labelKey) : ''}</span>
                  </span>
                </th>
              ))}
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
                    <span className="aud-time-chip">{item.ipAddress || t('adminAudit.table.noIp')}</span>
                  </td>
                  <td>
                    <span className="aud-time-chip">{item.dateHuman}</span>
                  </td>
                  <td className="aud-row-action-cell">
                    <button
                      type="button"
                      className="aud-row-action"
                      onClick={() => onOpenDetail(item)}
                      title={t('adminAudit.table.view')}
                      aria-label={t('adminAudit.table.view')}
                    >
                      <ChevronIcon />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AdminPagination
        summary={t('adminAudit.pagination.summary', {
          from: meta.from || 0,
          to: meta.to || 0,
          total: meta.total || 0,
        })}
        currentPage={currentPage}
        totalPages={lastPage}
        paginationItems={buildAdminPaginationItems(currentPage, lastPage)}
        previousLabel={t('adminAudit.pagination.previous')}
        nextLabel={t('adminAudit.pagination.next')}
        onPageChange={onPageChange}
      />
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
