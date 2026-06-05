import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../../core/i18n';
import {
  fetchNotificationGroupMessages,
  fetchNotificationModuleDetail,
  fetchNotificationModules,
  fetchReadNotificationGroupMessages,
  fetchReadNotificationModuleDetail,
  fetchReadNotificationModules,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  markNotificationAsUnread,
  markNotificationGroupAsRead,
  markNotificationModuleAsRead,
} from '../../services/notificationService';

const READ_PAGE_SIZE = 20;
const MODULE_TITLES = {
  proyectos: 'Proyectos',
  eventos: 'Eventos',
  administracion: 'Administracion',
};

function formatRelativeTime(value, language = 'es') {
  if (!value) return '';

  const created = new Date(value);
  const seconds = Math.round((created.getTime() - Date.now()) / 1000);

  if (Number.isNaN(seconds)) return '';

  const locale = language === 'en' ? 'en' : language === 'pt' ? 'pt-BR' : 'es';
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(seconds) < 60) return formatter.format(seconds, 'second');

  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return formatter.format(minutes, 'minute');

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return formatter.format(hours, 'hour');

  return formatter.format(Math.round(hours / 24), 'day');
}

function formatDateTime(value, language = 'es') {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const locale = language === 'en' ? 'en' : language === 'pt' ? 'pt-BR' : 'es';
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function moduleTitle(modulo) {
  return MODULE_TITLES[modulo] || modulo || 'Notificaciones';
}

function notificationTitle(notification) {
  return notification?.grupo_titulo
    || notification?.titulo
    || moduleTitle(notification?.modulo);
}

function notificationMessage(notification) {
  return notification?.contenido || notification?.mensaje || '';
}

function EmptyState({ children }) {
  return <div className="ncm-empty">{children}</div>;
}

function LoadingState({ label }) {
  return <div className="ncm-empty">{label}</div>;
}

function DetailField({ label, value }) {
  if (!value) return null;

  return (
    <div className="ncm-detail-field">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const STYLES = `
.ncm-overlay {
  position: fixed;
  inset: 0;
  z-index: 2147483500;
  background: rgba(17, 24, 39, .56);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
}
.ncm-modal {
  width: min(1240px, 100%);
  height: min(720px, calc(100vh - 36px));
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, .22);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: #111827;
}
.ncm-head {
  height: 56px;
  flex-shrink: 0;
  border-bottom: 1px solid #d1d5db;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  gap: 12px;
}
.ncm-title {
  min-width: 0;
}
.ncm-title strong {
  display: block;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.2;
}
.ncm-title span {
  display: block;
  color: #6b7280;
  font-size: 11px;
  margin-top: 2px;
}
.ncm-head-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ncm-tabs {
  display: inline-flex;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 2px;
}
.ncm-tab {
  border: none;
  background: transparent;
  color: #374151;
  font-size: 12px;
  font-weight: 700;
  padding: 7px 11px;
  border-radius: 6px;
  cursor: pointer;
}
.ncm-tab.active {
  background: #ffffff;
  color: #005f95;
  box-shadow: 0 1px 4px rgba(0, 0, 0, .08);
}
.ncm-icon-btn,
.ncm-close {
  width: 32px;
  height: 32px;
  border-radius: 7px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  color: #374151;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.ncm-icon-btn:hover,
.ncm-close:hover {
  background: #f3f4f6;
  color: #111827;
}
.ncm-icon-btn svg,
.ncm-close svg {
  width: 15px;
  height: 15px;
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.ncm-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.ncm-error {
  flex-shrink: 0;
  padding: 9px 14px;
  border-bottom: 1px solid rgba(201, 64, 64, .22);
  color: #c94040;
  background: rgba(232, 85, 85, .08);
  font-size: 12px;
  font-weight: 600;
}
.ncm-browser {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(170px, .75fr) minmax(220px, 1fr) minmax(260px, 1.1fr) minmax(300px, 1.2fr);
}
.ncm-browser.read {
  grid-template-columns: minmax(170px, .75fr) minmax(220px, 1fr) minmax(260px, 1.1fr) minmax(300px, 1.2fr);
}
.ncm-col {
  min-width: 0;
  min-height: 0;
  border-right: 1px solid #d1d5db;
  display: flex;
  flex-direction: column;
}
.ncm-col:last-child {
  border-right: none;
}
.ncm-col-head {
  height: 40px;
  flex-shrink: 0;
  border-bottom: 1px solid #f0ede8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 12px;
}
.ncm-col-head strong {
  font-size: 11px;
  color: #111827;
  text-transform: uppercase;
  letter-spacing: .04em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ncm-col-head button,
.ncm-link-btn {
  border: none;
  background: transparent;
  color: #0077b7;
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
  padding: 0;
  white-space: nowrap;
}
.ncm-col-head button:disabled,
.ncm-link-btn:disabled {
  color: #9ca3af;
  cursor: default;
}
.ncm-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.ncm-row {
  width: 100%;
  border: none;
  border-bottom: 1px solid #f0ede8;
  background: #ffffff;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 12px;
  text-align: left;
  cursor: pointer;
}
.ncm-row:hover,
.ncm-row.active {
  background: #e8f4fb;
}
.ncm-row:disabled {
  opacity: .58;
  cursor: default;
}
.ncm-row:disabled:hover {
  background: #ffffff;
}
.ncm-row-main {
  flex: 1;
  min-width: 0;
}
.ncm-row-main strong {
  display: block;
  color: #111827;
  font-size: 12px;
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ncm-row-main span {
  display: block;
  color: #6b7280;
  font-size: 11px;
  line-height: 1.4;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ncm-count {
  min-width: 25px;
  height: 22px;
  padding: 0 7px;
  border-radius: 999px;
  background: #e8f4fb;
  color: #005f95;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
}
.ncm-message-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #0077b7;
  flex-shrink: 0;
}
.ncm-empty {
  padding: 22px 16px;
  color: #6b7280;
  font-size: 12px;
  text-align: center;
}
.ncm-detail {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px;
}
.ncm-detail-title {
  font-size: 16px;
  font-weight: 800;
  color: #111827;
  line-height: 1.25;
}
.ncm-detail-message {
  color: #374151;
  font-size: 13px;
  line-height: 1.65;
  margin-top: 12px;
  white-space: pre-wrap;
}
.ncm-detail-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
.ncm-detail-field {
  border: 1px solid #f0ede8;
  border-radius: 7px;
  padding: 9px 10px;
  background: #fafafa;
  min-width: 0;
}
.ncm-detail-field span {
  display: block;
  color: #6b7280;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: .04em;
  margin-bottom: 4px;
}
.ncm-detail-field strong {
  display: block;
  color: #111827;
  font-size: 12px;
  overflow-wrap: anywhere;
}
.ncm-detail-actions {
  margin-top: 18px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.ncm-primary,
.ncm-secondary {
  border-radius: 7px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}
.ncm-primary {
  border: 1px solid #0077b7;
  background: #0077b7;
  color: #ffffff;
}
.ncm-primary:hover {
  background: #005f95;
}
.ncm-secondary {
  border: 1px solid #d1d5db;
  background: #ffffff;
  color: #374151;
}
.ncm-secondary:hover {
  background: #f3f4f6;
}
.ncm-load-more {
  flex-shrink: 0;
  padding: 10px;
  border-top: 1px solid #f0ede8;
  text-align: center;
}
@media (max-width: 980px) {
  .ncm-modal {
    height: calc(100vh - 24px);
  }
  .ncm-browser,
  .ncm-browser.read {
    grid-template-columns: 1fr;
    overflow-y: auto;
  }
  .ncm-col {
    min-height: 220px;
    border-right: none;
    border-bottom: 1px solid #d1d5db;
  }
  .ncm-col:last-child {
    border-bottom: none;
  }
  .ncm-detail {
    min-height: 260px;
  }
}
`;

export default function NotificationCenterModal({
  open,
  onClose,
  onChanged,
}) {
  const { t, language } = useLanguage();
  const [tab, setTab] = useState('new');
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleDetail, setModuleDetail] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [readModules, setReadModules] = useState([]);
  const [selectedReadModule, setSelectedReadModule] = useState(null);
  const [readModuleDetail, setReadModuleDetail] = useState(null);
  const [selectedReadGroup, setSelectedReadGroup] = useState(null);
  const [readMessages, setReadMessages] = useState([]);
  const [readMeta, setReadMeta] = useState(null);
  const [readPage, setReadPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [readLoading, setReadLoading] = useState(false);
  const [error, setError] = useState('');

  const detailItems = Array.isArray(moduleDetail?.data) ? moduleDetail.data : [];
  const directMessages = moduleDetail?.tipo_vista === 'mensajes_directos';
  const readDetailItems = Array.isArray(readModuleDetail?.data) ? readModuleDetail.data : [];
  const readDirectMessages = readModuleDetail?.tipo_vista === 'mensajes_directos';
  const selectedDetailNotification = selectedNotification;

  const selectedModuleTitle = useMemo(
    () => selectedModule?.titulo || moduleTitle(selectedModule?.modulo),
    [selectedModule]
  );
  const selectedReadModuleTitle = useMemo(
    () => selectedReadModule?.titulo || moduleTitle(selectedReadModule?.modulo),
    [selectedReadModule]
  );

  const loadModules = useCallback(async ({ force = false } = {}) => {
    setLoading(true);
    setError('');

    try {
      const payload = await fetchNotificationModules({ force });
      const data = Array.isArray(payload.data) ? payload.data : [];
      setModules(data);
      onChanged?.(payload);
      return data;
    } catch (err) {
      setError(err.message || t('nav.notificationsLoadError'));
      return [];
    } finally {
      setLoading(false);
    }
  }, [onChanged, t]);

  const loadReadModules = useCallback(async ({ force = false } = {}) => {
    setReadLoading(true);
    setError('');

    try {
      const payload = await fetchReadNotificationModules({ force });
      const data = Array.isArray(payload.data) ? payload.data : [];
      setReadModules(data);
      onChanged?.({ total: payload?.resumen?.pendientes });
      return payload;
    } catch (err) {
      setError(err.message || t('nav.notificationsLoadError'));
      return null;
    } finally {
      setReadLoading(false);
    }
  }, [onChanged, t]);

  useEffect(() => {
    if (!open) return undefined;

    loadModules();

    const handler = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [loadModules, onClose, open]);

  useEffect(() => {
    if (!open || tab !== 'read') return;

    loadReadModules();
  }, [loadReadModules, open, tab]);

  const handleRefresh = async () => {
    if (tab === 'read') {
      await loadReadModules({ force: true });

      if (selectedReadModule) {
        const detail = await fetchReadNotificationModuleDetail(selectedReadModule.modulo, {
          page: 1,
          perPage: READ_PAGE_SIZE,
          force: true,
        });
        setReadModuleDetail(detail);
        setReadPage(1);
        setReadMeta(detail.meta || null);

        if (detail.tipo_vista === 'mensajes_directos') {
          const data = Array.isArray(detail.data) ? detail.data : [];
          setSelectedNotification(data[0] || null);
        }
      }

      if (selectedReadModule && selectedReadGroup) {
        const payload = await fetchReadNotificationGroupMessages(
          selectedReadModule.modulo,
          selectedReadGroup.contexto_referencia,
          {
            page: 1,
            perPage: READ_PAGE_SIZE,
            force: true,
          }
        );
        const data = Array.isArray(payload.data) ? payload.data : [];
        setReadMessages(data);
        setSelectedNotification(data[0] || null);
        setReadMeta(payload.meta || null);
        setReadPage(1);
      }
      return;
    }

    await loadModules({ force: true });

    if (selectedModule) {
      const detail = await fetchNotificationModuleDetail(selectedModule.modulo, { force: true });
      setModuleDetail(detail);
    }

    if (selectedModule && selectedGroup) {
      const payload = await fetchNotificationGroupMessages(
        selectedModule.modulo,
        selectedGroup.contexto_referencia,
        { force: true }
      );
      setMessages(Array.isArray(payload.data) ? payload.data : []);
    }
  };

  const handleModuleSelect = async (moduleItem) => {
    setSelectedModule(moduleItem);
    setSelectedGroup(null);
    setMessages([]);
    setSelectedNotification(null);
    setLoading(true);
    setError('');

    try {
      const detail = await fetchNotificationModuleDetail(moduleItem.modulo);
      setModuleDetail(detail);
      if (detail.tipo_vista === 'mensajes_directos') {
        const first = Array.isArray(detail.data) ? detail.data[0] : null;
        setSelectedNotification(first || null);
      }
    } catch (err) {
      setError(err.message || t('nav.notificationsLoadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleReadModuleSelect = async (moduleItem) => {
    setSelectedReadModule(moduleItem);
    setSelectedReadGroup(null);
    setReadMessages([]);
    setSelectedNotification(null);
    setReadMeta(null);
    setReadPage(1);
    setReadLoading(true);
    setError('');

    try {
      const detail = await fetchReadNotificationModuleDetail(moduleItem.modulo, {
        page: 1,
        perPage: READ_PAGE_SIZE,
      });
      setReadModuleDetail(detail);

      if (detail.tipo_vista === 'mensajes_directos') {
        const data = Array.isArray(detail.data) ? detail.data : [];
        setSelectedNotification(data[0] || null);
        setReadMeta(detail.meta || null);
      }
    } catch (err) {
      setError(err.message || t('nav.notificationsLoadError'));
    } finally {
      setReadLoading(false);
    }
  };

  const handleGroupSelect = async (group) => {
    if (!selectedModule) return;

    setSelectedGroup(group);
    setSelectedNotification(null);
    setLoading(true);
    setError('');

    try {
      const payload = await fetchNotificationGroupMessages(
        selectedModule.modulo,
        group.contexto_referencia
      );
      const data = Array.isArray(payload.data) ? payload.data : [];
      setMessages(data);
      setSelectedNotification(data[0] || null);
    } catch (err) {
      setError(err.message || t('nav.notificationsLoadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleReadGroupSelect = async (group) => {
    if (!selectedReadModule) return;

    setSelectedReadGroup(group);
    setSelectedNotification(null);
    setReadMessages([]);
    setReadMeta(null);
    setReadPage(1);
    setReadLoading(true);
    setError('');

    try {
      const payload = await fetchReadNotificationGroupMessages(
        selectedReadModule.modulo,
        group.contexto_referencia,
        {
          page: 1,
          perPage: READ_PAGE_SIZE,
        }
      );
      const data = Array.isArray(payload.data) ? payload.data : [];
      setReadMessages(data);
      setSelectedNotification(data[0] || null);
      setReadMeta(payload.meta || null);
    } catch (err) {
      setError(err.message || t('nav.notificationsLoadError'));
    } finally {
      setReadLoading(false);
    }
  };

  const handleReadLoadMore = async () => {
    if (!selectedReadModule) return;

    setReadLoading(true);
    setError('');

    try {
      const nextPage = readPage + 1;
      const payload = readDirectMessages
        ? await fetchReadNotificationModuleDetail(selectedReadModule.modulo, {
            page: nextPage,
            perPage: READ_PAGE_SIZE,
          })
        : await fetchReadNotificationGroupMessages(
            selectedReadModule.modulo,
            selectedReadGroup?.contexto_referencia,
            {
              page: nextPage,
              perPage: READ_PAGE_SIZE,
            }
          );

      const data = Array.isArray(payload.data) ? payload.data : [];

      if (readDirectMessages) {
        setReadModuleDetail((current) => ({
          ...(current || {}),
          ...payload,
          data: [...(Array.isArray(current?.data) ? current.data : []), ...data],
        }));
      } else {
        setReadMessages((current) => [...current, ...data]);
      }

      setReadMeta(payload.meta || null);
      setReadPage(nextPage);
    } catch (err) {
      setError(err.message || t('nav.notificationsLoadError'));
    } finally {
      setReadLoading(false);
    }
  };

  const afterMutation = async () => {
    await loadModules({ force: true });

    if (tab === 'read') {
      await loadReadModules({ force: true });

      if (selectedReadModule) {
        const detail = await fetchReadNotificationModuleDetail(selectedReadModule.modulo, {
          page: 1,
          perPage: READ_PAGE_SIZE,
          force: true,
        });
        setReadModuleDetail(detail);
        setReadPage(1);
        setReadMeta(detail.meta || null);

        if (detail.tipo_vista === 'mensajes_directos') {
          const data = Array.isArray(detail.data) ? detail.data : [];
          setSelectedNotification(data[0] || null);
        }
      }

      if (selectedReadModule && selectedReadGroup) {
        const payload = await fetchReadNotificationGroupMessages(
          selectedReadModule.modulo,
          selectedReadGroup.contexto_referencia,
          {
            page: 1,
            perPage: READ_PAGE_SIZE,
            force: true,
          }
        );
        const data = Array.isArray(payload.data) ? payload.data : [];
        setReadMessages(data);
        setSelectedNotification(data[0] || null);
        setReadMeta(payload.meta || null);
        setReadPage(1);
      }
      return;
    }

    if (selectedModule) {
      const detail = await fetchNotificationModuleDetail(selectedModule.modulo, { force: true });
      setModuleDetail(detail);

      if (detail.tipo_vista === 'mensajes_directos') {
        const data = Array.isArray(detail.data) ? detail.data : [];
        setSelectedNotification(data[0] || null);
      }
    }

    if (selectedModule && selectedGroup) {
      const payload = await fetchNotificationGroupMessages(
        selectedModule.modulo,
        selectedGroup.contexto_referencia,
        { force: true }
      );
      const data = Array.isArray(payload.data) ? payload.data : [];
      setMessages(data);
      setSelectedNotification(data[0] || null);
    }
  };

  const handleReadOne = async (notification) => {
    if (!notification) return;

    try {
      await markNotificationAsRead(notification.id_notificacion);
      await afterMutation();
    } catch (err) {
      setError(err.message || t('nav.notificationReadError'));
    }
  };

  const handleUnreadOne = async (notification) => {
    if (!notification) return;

    try {
      await markNotificationAsUnread(notification.id_notificacion);
      await afterMutation();
    } catch (err) {
      setError(err.message || t('nav.notificationUnreadError'));
    }
  };

  const handleModuleRead = async () => {
    if (!selectedModule) return;

    try {
      await markNotificationModuleAsRead(selectedModule.modulo);
      await loadModules({ force: true });
      setSelectedModule(null);
      setModuleDetail(null);
      setSelectedGroup(null);
      setMessages([]);
      setSelectedNotification(null);
    } catch (err) {
      setError(err.message || t('nav.notificationsMarkError'));
    }
  };

  const handleGroupRead = async () => {
    if (!selectedModule || !selectedGroup) return;

    try {
      await markNotificationGroupAsRead(
        selectedModule.modulo,
        selectedGroup.contexto_referencia
      );
      setSelectedGroup(null);
      setMessages([]);
      setSelectedNotification(null);
      await afterMutation();
    } catch (err) {
      setError(err.message || t('nav.notificationsMarkError'));
    }
  };

  const handleAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      await loadModules({ force: true });
      setSelectedModule(null);
      setModuleDetail(null);
      setSelectedGroup(null);
      setMessages([]);
      setSelectedNotification(null);
    } catch (err) {
      setError(err.message || t('nav.notificationsMarkError'));
    }
  };

  const renderDetail = (notification, isReadView = false) => {
    if (!notification) {
      return <EmptyState>{t('nav.selectNotification')}</EmptyState>;
    }

    const actorName = notification.actor?.nombre || notification.actor?.correo || '';

    return (
      <div className="ncm-detail">
        <div className="ncm-detail-title">
          {notificationTitle(notification)}
        </div>
        <div className="ncm-detail-message">
          {notificationMessage(notification) || t('nav.noNotificationMessage')}
        </div>

        <div className="ncm-detail-grid">
          <DetailField label={t('nav.module')} value={moduleTitle(notification.modulo)} />
          <DetailField label={t('nav.type')} value={notification.tipo} />
          <DetailField label={t('nav.group')} value={notification.contexto_referencia} />
          <DetailField label={t('nav.actor')} value={actorName} />
          <DetailField label={t('nav.createdAt')} value={formatDateTime(notification.created_at, language)} />
          <DetailField label={t('nav.readAt')} value={formatDateTime(notification.leido_en, language)} />
        </div>

        <div className="ncm-detail-actions">
          {isReadView ? (
            <button
              className="ncm-primary"
              type="button"
              onClick={() => handleUnreadOne(notification)}
            >
              {t('nav.markUnread')}
            </button>
          ) : (
            <button
              className="ncm-primary"
              type="button"
              onClick={() => handleReadOne(notification)}
            >
              {t('nav.markReadSingle')}
            </button>
          )}
        </div>
      </div>
    );
  };

  if (!open) return null;

  return (
    <>
      <style>{STYLES}</style>
      <div className="ncm-overlay" role="presentation">
        <div
          className="ncm-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ncm-title"
        >
          <div className="ncm-head">
            <div className="ncm-title">
              <strong id="ncm-title">{t('nav.notificationCenter')}</strong>
              <span>{t('nav.notificationCenterSubtitle')}</span>
            </div>

            <div className="ncm-head-actions">
              <div className="ncm-tabs" role="tablist">
                <button
                  className={`ncm-tab${tab === 'new' ? ' active' : ''}`}
                  type="button"
                  onClick={() => {
                    setTab('new');
                    setSelectedNotification(null);
                  }}
                >
                  {t('nav.newNotifications')}
                </button>
                <button
                  className={`ncm-tab${tab === 'read' ? ' active' : ''}`}
                  type="button"
                  onClick={() => {
                    setTab('read');
                    setSelectedNotification(null);
                  }}
                >
                  {t('nav.readNotifications')}
                </button>
              </div>

              <button className="ncm-icon-btn" type="button" onClick={handleRefresh} title={t('nav.refresh')}>
                <svg viewBox="0 0 24 24">
                  <path d="M21 12a9 9 0 0 1-15 6.7" />
                  <path d="M3 12a9 9 0 0 1 15-6.7" />
                  <path d="M18 3v5h-5" />
                  <path d="M6 21v-5h5" />
                </svg>
              </button>

              <button className="ncm-close" type="button" onClick={onClose} title={t('nav.close')}>
                <svg viewBox="0 0 24 24">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="ncm-body">
            {error && <div className="ncm-error">{error}</div>}

            {tab === 'new' ? (
              <div className="ncm-browser">
                <div className="ncm-col">
                  <div className="ncm-col-head">
                    <strong>{t('nav.modules')}</strong>
                    <button type="button" onClick={handleAllRead} disabled={!modules.some((item) => Number(item.cantidad))}>
                      {t('nav.markRead')}
                    </button>
                  </div>
                  <div className="ncm-list">
                    {loading && modules.length === 0 && <LoadingState label={t('nav.loadingNotifications')} />}
                    {!loading && modules.length === 0 && <EmptyState>{t('nav.noNotifications')}</EmptyState>}
                    {modules.map((moduleItem) => (
                      <button
                        className={`ncm-row${selectedModule?.modulo === moduleItem.modulo ? ' active' : ''}`}
                        key={moduleItem.modulo}
                        type="button"
                        disabled={!Number(moduleItem.cantidad)}
                        onClick={() => handleModuleSelect(moduleItem)}
                      >
                        <div className="ncm-row-main">
                          <strong>{moduleItem.titulo || moduleTitle(moduleItem.modulo)}</strong>
                          <span>{Number(moduleItem.cantidad || 0)} {t('nav.pendingNotifications')}</span>
                        </div>
                        <span className="ncm-count">{Number(moduleItem.cantidad || 0)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ncm-col">
                  <div className="ncm-col-head">
                    <strong>{selectedModuleTitle}</strong>
                    <button type="button" onClick={handleModuleRead} disabled={!selectedModule}>
                      {t('nav.markModuleRead')}
                    </button>
                  </div>
                  <div className="ncm-list">
                    {!selectedModule && <EmptyState>{t('nav.selectModule')}</EmptyState>}
                    {selectedModule && loading && !moduleDetail && <LoadingState label={t('nav.loadingNotifications')} />}
                    {selectedModule && moduleDetail && detailItems.length === 0 && <EmptyState>{t('nav.noNotifications')}</EmptyState>}
                    {selectedModule && moduleDetail && directMessages && detailItems.map((notification) => (
                      <button
                        className={`ncm-row${selectedNotification?.id_notificacion === notification.id_notificacion ? ' active' : ''}`}
                        key={notification.id_notificacion}
                        type="button"
                        onClick={() => setSelectedNotification(notification)}
                      >
                        <span className="ncm-message-dot" />
                        <div className="ncm-row-main">
                          <strong>{notificationTitle(notification)}</strong>
                          <span>{notificationMessage(notification)}</span>
                        </div>
                      </button>
                    ))}
                    {selectedModule && moduleDetail && !directMessages && detailItems.map((group) => (
                      <button
                        className={`ncm-row${selectedGroup?.contexto_referencia === group.contexto_referencia ? ' active' : ''}`}
                        key={group.contexto_referencia}
                        type="button"
                        onClick={() => handleGroupSelect(group)}
                      >
                        <div className="ncm-row-main">
                          <strong>{group.titulo || t('nav.ungroupedNotifications')}</strong>
                          <span>{Number(group.cantidad || 0)} {t('nav.pendingNotifications')}</span>
                        </div>
                        <span className="ncm-count">{Number(group.cantidad || 0)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ncm-col">
                  <div className="ncm-col-head">
                    <strong>{selectedGroup?.titulo || t('nav.messages')}</strong>
                    <button type="button" onClick={handleGroupRead} disabled={!selectedGroup}>
                      {t('nav.markGroupRead')}
                    </button>
                  </div>
                  <div className="ncm-list">
                    {directMessages && <EmptyState>{t('nav.directMessagesInPreviousColumn')}</EmptyState>}
                    {!directMessages && !selectedGroup && <EmptyState>{t('nav.selectGroup')}</EmptyState>}
                    {!directMessages && selectedGroup && loading && messages.length === 0 && <LoadingState label={t('nav.loadingNotifications')} />}
                    {!directMessages && selectedGroup && !loading && messages.length === 0 && <EmptyState>{t('nav.noNotifications')}</EmptyState>}
                    {!directMessages && messages.map((notification) => (
                      <button
                        className={`ncm-row${selectedNotification?.id_notificacion === notification.id_notificacion ? ' active' : ''}`}
                        key={notification.id_notificacion}
                        type="button"
                        onClick={() => setSelectedNotification(notification)}
                      >
                        <span className="ncm-message-dot" />
                        <div className="ncm-row-main">
                          <strong>{notificationTitle(notification)}</strong>
                          <span>{notificationMessage(notification)}</span>
                          <span>{formatRelativeTime(notification.created_at, language)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ncm-col">
                  <div className="ncm-col-head">
                    <strong>{t('nav.detail')}</strong>
                  </div>
                  {renderDetail(selectedDetailNotification, false)}
                </div>
              </div>
            ) : (
              <div className="ncm-browser read">
                <div className="ncm-col">
                  <div className="ncm-col-head">
                    <strong>{t('nav.modules')}</strong>
                  </div>
                  <div className="ncm-list">
                    {readLoading && readModules.length === 0 && <LoadingState label={t('nav.loadingNotifications')} />}
                    {!readLoading && readModules.length === 0 && <EmptyState>{t('nav.noReadNotifications')}</EmptyState>}
                    {readModules.map((moduleItem) => (
                      <button
                        className={`ncm-row${selectedReadModule?.modulo === moduleItem.modulo ? ' active' : ''}`}
                        key={moduleItem.modulo}
                        type="button"
                        disabled={!Number(moduleItem.cantidad)}
                        onClick={() => handleReadModuleSelect(moduleItem)}
                      >
                        <div className="ncm-row-main">
                          <strong>{moduleItem.titulo || moduleTitle(moduleItem.modulo)}</strong>
                          <span>{Number(moduleItem.cantidad || 0)} {t('nav.readNotifications')}</span>
                        </div>
                        <span className="ncm-count">{Number(moduleItem.cantidad || 0)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ncm-col">
                  <div className="ncm-col-head">
                    <strong>{selectedReadModuleTitle}</strong>
                  </div>
                  <div className="ncm-list">
                    {!selectedReadModule && <EmptyState>{t('nav.selectModule')}</EmptyState>}
                    {selectedReadModule && readLoading && !readModuleDetail && <LoadingState label={t('nav.loadingNotifications')} />}
                    {selectedReadModule && readModuleDetail && readDetailItems.length === 0 && <EmptyState>{t('nav.noReadNotifications')}</EmptyState>}
                    {selectedReadModule && readModuleDetail && readDirectMessages && readDetailItems.map((notification) => (
                      <button
                        className={`ncm-row${selectedNotification?.id_notificacion === notification.id_notificacion ? ' active' : ''}`}
                        key={`${notification.id_notificacion}-${notification.leido_en}`}
                        type="button"
                        onClick={() => setSelectedNotification(notification)}
                      >
                        <span className="ncm-message-dot" />
                        <div className="ncm-row-main">
                          <strong>{notificationTitle(notification)}</strong>
                          <span>{notificationMessage(notification)}</span>
                          <span>{formatRelativeTime(notification.leido_en || notification.created_at, language)}</span>
                        </div>
                      </button>
                    ))}
                    {selectedReadModule && readModuleDetail && !readDirectMessages && readDetailItems.map((group) => (
                      <button
                        className={`ncm-row${selectedReadGroup?.contexto_referencia === group.contexto_referencia ? ' active' : ''}`}
                        key={group.contexto_referencia}
                        type="button"
                        onClick={() => handleReadGroupSelect(group)}
                      >
                        <div className="ncm-row-main">
                          <strong>{group.titulo || t('nav.ungroupedNotifications')}</strong>
                          <span>{Number(group.cantidad || 0)} {t('nav.readNotifications')}</span>
                        </div>
                        <span className="ncm-count">{Number(group.cantidad || 0)}</span>
                      </button>
                    ))}
                  </div>
                  {readDirectMessages && readMeta?.has_more_pages && (
                    <div className="ncm-load-more">
                      <button
                        className="ncm-secondary"
                        type="button"
                        onClick={handleReadLoadMore}
                        disabled={readLoading}
                      >
                        {t('nav.loadMore')}
                      </button>
                    </div>
                  )}
                </div>

                <div className="ncm-col">
                  <div className="ncm-col-head">
                    <strong>{selectedReadGroup?.titulo || t('nav.messages')}</strong>
                  </div>
                  <div className="ncm-list">
                    {readDirectMessages && <EmptyState>{t('nav.directMessagesInPreviousColumn')}</EmptyState>}
                    {!readDirectMessages && !selectedReadGroup && <EmptyState>{t('nav.selectGroup')}</EmptyState>}
                    {!readDirectMessages && selectedReadGroup && readLoading && readMessages.length === 0 && <LoadingState label={t('nav.loadingNotifications')} />}
                    {!readDirectMessages && selectedReadGroup && !readLoading && readMessages.length === 0 && <EmptyState>{t('nav.noReadNotifications')}</EmptyState>}
                    {!readDirectMessages && readMessages.map((notification) => (
                      <button
                        className={`ncm-row${selectedNotification?.id_notificacion === notification.id_notificacion ? ' active' : ''}`}
                        key={`${notification.id_notificacion}-${notification.leido_en}`}
                        type="button"
                        onClick={() => setSelectedNotification(notification)}
                      >
                        <span className="ncm-message-dot" />
                        <div className="ncm-row-main">
                          <strong>{notificationTitle(notification)}</strong>
                          <span>{notificationMessage(notification)}</span>
                          <span>{formatRelativeTime(notification.leido_en || notification.created_at, language)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  {!readDirectMessages && readMeta?.has_more_pages && (
                    <div className="ncm-load-more">
                      <button
                        className="ncm-secondary"
                        type="button"
                        onClick={handleReadLoadMore}
                        disabled={readLoading}
                      >
                        {t('nav.loadMore')}
                      </button>
                    </div>
                  )}
                </div>

                <div className="ncm-col">
                  <div className="ncm-col-head">
                    <strong>{t('nav.detail')}</strong>
                  </div>
                  {renderDetail(selectedNotification, true)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
