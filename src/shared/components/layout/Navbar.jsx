// src/shared/components/layout/Navbar.jsx

import { useState, useEffect, useRef, useCallback } from 'react';
import ConfirmModal from '../../ui/ConfirmModal';
import CalendarPanel from '../../../features/calendar/components/CalendarPanel';
import LanguageSelector from '../language/LanguageSelector';
import NotificationCenterModal from '../notifications/NotificationCenterModal';
import { useLanguage } from '../../../core/i18n';
import {
  clearAuthStorage,
  getDashboardHomePath,
  getStoredUser,
  isAdminUser,
} from '../../utils/authStorage';
import {
  clearNotificationsCache,
  fetchNotificationGroupMessages,
  fetchNotificationModuleDetail,
  fetchNotificationModules,
  getCachedNotificationModules,
  markAllNotificationsAsRead,
  markNotificationGroupAsRead,
  markNotificationModuleAsRead,
  markNotificationAsRead,
} from '../../services/notificationService';

const NOTIFICATIONS_REFRESH_MS = 30000;

const ICON_PROPS = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

/* ── Links de navegación pública ── */
const NAV_LINKS = [
  {
    labelKey: 'nav.home',
    href: '/',
    icon: (
      <>
        <path d="M3 10.8 12 3l9 7.8" />
        <path d="M5 10v10h5v-6h4v6h5V10" />
      </>
    ),
  },
  {
    labelKey: 'nav.howItWorks',
    href: '/eventos',
  },
  {
    labelKey: 'nav.projects',
    href: '/proyectos',
    icon: (
      <>
        <path d="M3 7.5V6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1.5" />
        <path d="M3 9h18l-1.3 9.2A2 2 0 0 1 17.7 20H6.3a2 2 0 0 1-2-1.8L3 9Z" />
      </>
    ),
  },
  {
    labelKey: 'nav.developers',
    href: '/desarrolladores',
    icon: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
        <path d="M16 3.1a4 4 0 0 1 0 7.8" />
      </>
    ),
  },
];

function getNavIcon(href) {
  if (href === '/eventos') {
    return (
      <>
        <circle cx="6" cy="7" r="3" />
        <circle cx="18" cy="17" r="3" />
        <path d="M9 8.5c3.6.8 5.7 2.9 6.5 5.5" />
        <path d="M14 4h5v5" />
      </>
    );
  }

  return null;
}

function getLocale(language) {
  if (language === 'en') return 'en';
  if (language === 'pt') return 'pt-BR';
  return 'es';
}

function notificationTime(value, language = 'es') {
  if (!value) return '';

  const created = new Date(value);
  const seconds = Math.round((created.getTime() - Date.now()) / 1000);

  if (Number.isNaN(seconds)) return '';

  const formatter = new Intl.RelativeTimeFormat(getLocale(language), {
    numeric: 'auto',
  });

  if (Math.abs(seconds) < 60) return formatter.format(seconds, 'second');

  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return formatter.format(minutes, 'minute');

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return formatter.format(hours, 'hour');

  return formatter.format(Math.round(hours / 24), 'day');
}

function moduleFallbackTitle(modulo) {
  return {
    proyectos: 'Proyectos',
    eventos: 'Eventos',
    administracion: 'Administracion',
  }[modulo] || modulo || 'Notificaciones';
}

function getNotificationTitle(notification) {
  return notification?.grupo_titulo
    || notification?.titulo
    || moduleFallbackTitle(notification?.modulo);
}

export default function Navbar() {
  const { t, language } = useLanguage();
  const BASE_URL = process.env.REACT_APP_API_URL;

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [logoutModal, setLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [notificationModules, setNotificationModules] = useState([]);
  const [notificationDetail, setNotificationDetail] = useState(null);
  const [notificationMessages, setNotificationMessages] = useState([]);
  const [notifLevel, setNotifLevel] = useState('modules');
  const [selectedNotificationModule, setSelectedNotificationModule] = useState(null);
  const [selectedNotificationGroup, setSelectedNotificationGroup] = useState(null);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  const userId = user?.id_usuario || user?.id || user?.idUsuario;
  const dashboardHomePath = getDashboardHomePath();
  const adminUser = isAdminUser(user);

  const applyModulesPayload = useCallback((payload) => {
    const modules = Array.isArray(payload?.data) ? payload.data : [];

    setNotificationModules(modules);
    setUnreadNotifications(Number(payload?.total) || modules.reduce(
      (total, item) => total + Number(item.cantidad || 0),
      0
    ));
  }, []);

  const loadNotifications = useCallback(async ({ silent = false } = {}) => {
    if (!userId) {
      setNotificationModules([]);
      setNotificationDetail(null);
      setNotificationMessages([]);
      setUnreadNotifications(0);
      setNotificationsError('');
      setNotifLevel('modules');
      return;
    }

    if (!silent) {
      setNotificationsLoading(true);
      setNotificationsError('');
    }

    try {
      const data = await fetchNotificationModules();
      applyModulesPayload(data);
      setNotificationsError('');
    } catch (err) {
      if (!silent) {
        setNotificationsError(err.message || t('nav.notificationsLoadError'));
      }
    } finally {
      if (!silent) {
        setNotificationsLoading(false);
      }
    }
  }, [applyModulesPayload, userId, t]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 1100) setMobileOpen(false);
    };

    window.addEventListener('resize', onResize);

    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const onClick = (event) => {
      if (!notificationCenterOpen && notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }

      if (userRef.current && !userRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', onClick);

    return () => document.removeEventListener('mousedown', onClick);
  }, [notificationCenterOpen]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setUser(getStoredUser());
  }, []);

  useEffect(() => {
    if (!userId) {
      loadNotifications();
      return;
    }

    const cached = getCachedNotificationModules();

    if (cached) {
      applyModulesPayload(cached);
      setNotificationsLoading(false);
      setNotificationsError('');
    }

    loadNotifications({ silent: Boolean(cached) });
  }, [applyModulesPayload, userId, loadNotifications]);

  useEffect(() => {
    if (!userId) return undefined;

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') {
        loadNotifications({ silent: true });
      }
    };

    const intervalId = window.setInterval(
      refreshWhenVisible,
      NOTIFICATIONS_REFRESH_MS
    );

    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [userId, loadNotifications]);

  const handleNotificationToggle = () => {
    if (!notifOpen) loadNotifications({ silent: notificationModules.length > 0 });
    setNotifOpen((open) => !open);
  };

  const handleNotificationCenterOpen = () => {
    setNotificationsError('');
    setNotifOpen(false);
    setNotificationCenterOpen(true);
  };

  const refreshNotificationModules = useCallback(async () => {
    const data = await fetchNotificationModules({ force: true });
    applyModulesPayload(data);
    return data;
  }, [applyModulesPayload]);

  const handleNotificationBack = () => {
    setNotificationsError('');

    if (notifLevel === 'messages') {
      setNotificationMessages([]);
      setSelectedNotificationGroup(null);
      setNotifLevel('detail');
      return;
    }

    setNotificationDetail(null);
    setSelectedNotificationModule(null);
    setNotifLevel('modules');
  };

  const handleNotificationModuleOpen = async (moduleItem) => {
    setSelectedNotificationModule(moduleItem);
    setSelectedNotificationGroup(null);
    setNotificationMessages([]);
    setNotificationsError('');
    setNotificationsLoading(true);

    try {
      const detail = await fetchNotificationModuleDetail(moduleItem.modulo);
      setNotificationDetail(detail);
      setNotifLevel('detail');
    } catch (err) {
      setNotificationsError(err.message || t('nav.notificationsLoadError'));
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleNotificationGroupOpen = async (group) => {
    if (!selectedNotificationModule) return;

    setSelectedNotificationGroup(group);
    setNotificationsError('');
    setNotificationsLoading(true);

    try {
      const payload = await fetchNotificationGroupMessages(
        selectedNotificationModule.modulo,
        group.contexto_referencia
      );

      setNotificationMessages(Array.isArray(payload.data) ? payload.data : []);
      setNotifLevel('messages');
    } catch (err) {
      setNotificationsError(err.message || t('nav.notificationsLoadError'));
    } finally {
      setNotificationsLoading(false);
    }
  };

  const refreshCurrentNotificationPanel = async () => {
    await refreshNotificationModules();

    if (!selectedNotificationModule) return;

    const detail = await fetchNotificationModuleDetail(
      selectedNotificationModule.modulo,
      { force: true }
    );

    setNotificationDetail(detail);

    if (notifLevel === 'messages' && selectedNotificationGroup) {
      const payload = await fetchNotificationGroupMessages(
        selectedNotificationModule.modulo,
        selectedNotificationGroup.contexto_referencia,
        { force: true }
      );

      setNotificationMessages(Array.isArray(payload.data) ? payload.data : []);
    }
  };

  const handleNotificationRead = async (notification) => {
    if (notification.leida_en || notification.leido_en) return;

    try {
      const response = await markNotificationAsRead(notification.id_notificacion);
      setUnreadNotifications(Number(response?.resumen?.pendientes) || 0);
      await refreshCurrentNotificationPanel();
    } catch (err) {
      setNotificationsError(err.message || t('nav.notificationReadError'));
    }
  };

  const handleModuleNotificationsRead = async () => {
    if (!selectedNotificationModule) return;

    try {
      const response = await markNotificationModuleAsRead(selectedNotificationModule.modulo);
      setUnreadNotifications(Number(response?.resumen?.pendientes) || 0);
      await refreshNotificationModules();
      setNotificationDetail(null);
      setNotificationMessages([]);
      setSelectedNotificationModule(null);
      setSelectedNotificationGroup(null);
      setNotifLevel('modules');
    } catch (err) {
      setNotificationsError(err.message || t('nav.notificationsMarkError'));
    }
  };

  const handleGroupNotificationsRead = async () => {
    if (!selectedNotificationModule || !selectedNotificationGroup) return;

    try {
      const response = await markNotificationGroupAsRead(
        selectedNotificationModule.modulo,
        selectedNotificationGroup.contexto_referencia
      );
      setUnreadNotifications(Number(response?.resumen?.pendientes) || 0);
      await refreshCurrentNotificationPanel();
      setNotifLevel('detail');
      setNotificationMessages([]);
      setSelectedNotificationGroup(null);
    } catch (err) {
      setNotificationsError(err.message || t('nav.notificationsMarkError'));
    }
  };

  const handleAllNotificationsRead = async () => {
    if (!unreadNotifications) return;

    try {
      await markAllNotificationsAsRead();
      setNotificationModules((current) => current.map((item) => ({ ...item, cantidad: 0 })));
      setNotificationDetail(null);
      setNotificationMessages([]);
      setSelectedNotificationModule(null);
      setSelectedNotificationGroup(null);
      setNotifLevel('modules');
      setUnreadNotifications(0);
    } catch (err) {
      setNotificationsError(err.message || t('nav.notificationsMarkError'));
    }
  };

  const doLogout = async () => {
    setLoggingOut(true);

    const token = localStorage.getItem('tokenPORT');

    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error('Error al intentar cerrar sesión:', err);
    }

    clearNotificationsCache();
    clearAuthStorage();

    window.location.href = '/';
  };

  const handleLogoutClick = () => {
    setUserMenuOpen(false);
    setMobileOpen(false);
    setLogoutModal(true);
  };

  const userName = user
    ? `${user.nombre || user.name || t('nav.user')} ${user.apellido || ''}`.trim()
    : '';

  const initials = user
    ? [user.nombre || user.name || 'U', user.apellido || user.lastName || '']
        .map((name) => String(name || ' ').trim().slice(0, 1).toUpperCase())
        .join('')
        .padEnd(2, 'U')
    : 'U';

  const userRole = user?.rol || user?.role || t('nav.user');
  const notifLevelIndex = {
    modules: 0,
    detail: 1,
    messages: 2,
  }[notifLevel] || 0;
  const detailItems = Array.isArray(notificationDetail?.data) ? notificationDetail.data : [];
  const detailIsDirectMessages = notificationDetail?.tipo_vista === 'mensajes_directos';
  const notificationPanelTitle = notifLevel === 'messages'
    ? (selectedNotificationGroup?.titulo || t('nav.notifications'))
    : notifLevel === 'detail'
      ? (selectedNotificationModule?.titulo || moduleFallbackTitle(selectedNotificationModule?.modulo))
      : t('nav.notifications');

  return (
    <>
      <style>{`
        .spk-nav {
          position: fixed; top: 0; left: 0; right: 0;
          z-index: 200; height: var(--nav-height, 60px);
          display: flex; align-items: center;
          padding: 0 24px; padding-bottom: 3px;
          background: linear-gradient(90deg, var(--azul-deep, #004f7c) 0%, var(--azul, #0077b7) 100%);
          border-bottom: 3px solid rgba(255,255,255,.12);
          box-shadow: 0 2px 18px rgba(0,77,124,.25);
          transition: box-shadow .2s;
        }
        .spk-nav.scrolled { box-shadow: 0 4px 28px rgba(0,77,124,.38); }
        .spk-nav-logo,
        .spk-nav-tagline { display: flex; align-items: center; text-decoration: none; flex: 0 0 auto; min-width: max-content; }
        .spk-nav-logo img,
        .spk-nav-tagline img { display: block; object-fit: contain; flex: 0 0 auto; max-width: none; }
        .spk-logo-umss-full { width: 130px; height: 38px; filter: brightness(0) invert(1); opacity: .92; }
        .spk-logo-creafolio-full { width: 110px; height: 25px; }
        .spk-logo-mobile-icon { display: none !important; width: 38px; height: 38px; object-fit: contain; }
        .spk-logo-umss-icon { filter: brightness(0) invert(1); opacity: .92; }
        .spk-nav-sep { width: 1px; height: 22px; background: rgba(255,255,255,.15); margin: 0 18px 0 12px; flex-shrink: 0; }
        .spk-nav-links { display: flex; align-items: center; gap: 2px; list-style: none; margin: 0; padding: 0; margin-left: auto; }
        .spk-nav-links li { display: flex; align-items: center; }
        .spk-nav-links a { font-size: 13px; font-weight: 500; color: rgba(255,255,255,.65); text-decoration: none; padding: 6px 13px; border-radius: 5px; transition: color .15s, background .15s, transform .15s; white-space: nowrap; letter-spacing: .01em; display: inline-flex; align-items: center; gap: 7px; }
        .spk-nav-links a:hover { color: rgba(255,255,255,.97); background: rgba(255,255,255,.1); transform: translateY(-1px); }
        .spk-nav-link-icon { width: 15px; height: 15px; flex-shrink: 0; opacity: .82; stroke-linecap: round; stroke-linejoin: round; transition: transform .15s, opacity .15s; }
        .spk-nav-links a:hover .spk-nav-link-icon { opacity: 1; transform: translateY(-1px); }
        .spk-nav-right { display: flex; align-items: center; gap: 8px; margin-left: 20px; }
        .spk-nav-user { position: relative; }
        .spk-user-toggle { all: unset; display: flex; align-items: center; gap: 9px; padding: 5px 10px 5px 5px; border-radius: 8px; border: 1px solid rgba(255,255,255,.15); cursor: pointer; transition: all .15s; user-select: none; box-sizing: border-box; }
        .spk-user-toggle:hover { background: rgba(255,255,255,.1); }
        .spk-nav-user.open .spk-user-toggle { background: rgba(255,255,255,.12); }
        .spk-user-avatar { width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, #b8ddf0, #ffffff); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #004f7c; flex-shrink: 0; border: 1.5px solid rgba(255,255,255,.3); }
        .spk-user-info { display: flex; flex-direction: column; align-items: flex-start; line-height: 1.2; }
        .spk-user-name { font-size: 12px; font-weight: 600; color: rgba(255,255,255,.9); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100px; display: block; }
        .spk-user-role { font-size: 10px; color: rgba(255,255,255,.38); font-family: var(--mono, monospace); letter-spacing: .04em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100px; display: block; }
        .spk-user-chevron { width: 12px; height: 12px; stroke: rgba(255,255,255,.45); fill: none; stroke-width: 2; transition: transform .2s; }
        .spk-nav-user.open .spk-user-chevron { transform: rotate(180deg); }
        .spk-user-dropdown { position: absolute; top: calc(100% + 8px); right: 0; width: 220px; background: #ffffff; border: 1.5px solid #d1d5db; border-radius: 10px; box-shadow: 0 12px 36px rgba(0,0,0,.14); z-index: 350; animation: fadeUp .18s ease both; overflow: hidden; }
        .spk-dd-header { padding: 14px 16px 12px; border-bottom: 1px solid #f0ede8; display: flex; align-items: center; gap: 10px; }
        .spk-dd-avatar { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #e8f4fb, #b8ddf0); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #004f7c; border: 2px solid #b8ddf0; flex-shrink: 0; }
        .spk-dd-name { font-size: 13px; font-weight: 600; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; display: block; }
        .spk-dd-email { font-size: 11px; color: #6b7280; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; display: block; }
        .spk-dd-status { font-size: 10px; color: #10b981; display: flex; align-items: center; gap: 4px; margin-top: 3px; }
        .spk-dd-status-dot { width: 5px; height: 5px; border-radius: 50%; background: #10b981; }
        .spk-dd-section { padding: 6px 8px; border-bottom: 1px solid #f0ede8; }
        .spk-dd-section:last-child { border-bottom: none; }
        .spk-dd-label { font-size: 10px; font-weight: 600; color: #d1d5db; text-transform: uppercase; letter-spacing: .08em; padding: 4px 8px 2px; }
        .spk-dd-item { display: flex; align-items: center; gap: 9px; padding: 7px 8px; border-radius: 6px; font-size: 13px; color: #374151; cursor: pointer; transition: all .12s; text-decoration: none; background: none; border: none; width: 100%; text-align: left; }
        .spk-dd-item:hover { background: #f0ede8; color: #111827; }
        .spk-dd-item svg { width: 15px; height: 15px; stroke: currentColor; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; flex-shrink: 0; }
        .spk-dd-item.highlight { color: #0077b7; font-weight: 600; }
        .spk-dd-item.highlight:hover { background: #e8f4fb; }
        .spk-dd-item.highlight svg { stroke: #0077b7; }
        .spk-dd-item.danger { color: #c94040; }
        .spk-dd-item.danger:hover { background: rgba(232,85,85,.08); }
        .spk-dd-item.danger svg { stroke: #c94040; }
        .spk-bell-wrap { position: relative; }
        .spk-bell { width: 34px; height: 34px; border-radius: 7px; border: 1px solid rgba(255,255,255,.18); background: rgba(255,255,255,.08); display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all .15s; }
        .spk-bell:hover { background: rgba(255,255,255,.18); border-color: rgba(255,255,255,.35); }
        .spk-bell svg { width: 16px; height: 16px; stroke: rgba(255,255,255,.86); fill: none; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }
        .spk-bell-dot { position: absolute; top: 6px; right: 6px; width: 7px; height: 7px; border-radius: 50%; background: var(--rojo-soft, #ef4444); border: 1.5px solid var(--azul, #0077b7); pointer-events: none; }
        .spk-notif-dropdown { position: absolute; top: calc(100% + 10px); right: 0; width: 340px; max-width: calc(100vw - 28px); background: #ffffff; border: 1.5px solid #d1d5db; border-radius: 10px; box-shadow: 0 8px 32px rgba(0,0,0,.13); overflow: hidden; animation: fadeUp .18s ease both; z-index: 300; }
        .spk-notif-header { min-height: 46px; padding: 10px 12px; border-bottom: 1px solid #d1d5db; display: flex; justify-content: space-between; align-items: center; gap: 8px; }
        .spk-notif-titlebar { display: flex; align-items: center; gap: 7px; min-width: 0; }
        .spk-notif-heading { font-size: 12px; font-weight: 700; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .spk-notif-back { width: 25px; height: 25px; border-radius: 6px; border: 1px solid #d1d5db; background: #ffffff; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #374151; }
        .spk-notif-back:hover { background: #f3f4f6; color: #111827; }
        .spk-notif-back svg { width: 14px; height: 14px; stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
        .spk-notif-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .spk-notif-clear { font-size: 10px; color: #0077b7; font-weight: 600; cursor: pointer; background: none; border: none; padding: 0; transition: color .12s; white-space: nowrap; }
        .spk-notif-clear:hover { color: #005f95; }
        .spk-notif-clear:disabled { color: #9ca3af; cursor: default; }
        .spk-notif-frame { overflow: hidden; }
        .spk-notif-slider { display: flex; width: 300%; transform: translateX(calc(var(--notif-level, 0) * -33.333%)); transition: transform .22s ease; }
        .spk-notif-panel { width: 33.333%; flex-shrink: 0; display: flex; flex-direction: column; min-height: 210px; max-height: min(390px, calc(100vh - 96px)); }
        .spk-notif-list { overflow-y: auto; flex: 1; }
        .spk-notif-row { width: 100%; padding: 11px 13px; border: none; border-bottom: 1px solid #f0ede8; background: #ffffff; display: flex; gap: 10px; align-items: center; cursor: pointer; transition: background .12s; text-align: left; }
        .spk-notif-row:hover { background: #e8f4fb; }
        .spk-notif-row:disabled { cursor: default; opacity: .62; }
        .spk-notif-row:disabled:hover { background: #ffffff; }
        .spk-notif-row-main { min-width: 0; flex: 1; }
        .spk-notif-row-title { font-size: 12px; color: #111827; font-weight: 700; line-height: 1.35; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .spk-notif-row-meta { font-size: 10px; color: #6b7280; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .spk-notif-count { min-width: 24px; height: 22px; border-radius: 999px; background: #e8f4fb; color: #005f95; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; padding: 0 7px; }
        .spk-notif-chevron { width: 14px; height: 14px; stroke: #9ca3af; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; flex-shrink: 0; }
        .spk-notif-item { width: 100%; padding: 11px 13px; border: none; border-bottom: 1px solid #f0ede8; background: #ffffff; display: flex; gap: 10px; align-items: flex-start; cursor: pointer; transition: background .12s; text-align: left; }
        .spk-notif-item:last-child { border-bottom: none; }
        .spk-notif-item:hover { background: #e8f4fb; }
        .spk-notif-item.unread { background: #f8fcff; }
        .spk-notif-item.unread:hover { background: #e8f4fb; }
        .spk-notif-ico { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; background: #0077b7; }
        .spk-notif-ico.read { background: #d1d5db; }
        .spk-notif-title { font-size: 12px; color: #111827; font-weight: 600; line-height: 1.35; margin-bottom: 2px; }
        .spk-notif-text { font-size: 12px; color: #374151; line-height: 1.5; text-align: left; }
        .spk-notif-time { font-size: 10px; color: #6b7280; font-family: var(--mono, monospace); margin-top: 2px; }
        .spk-notif-empty { padding: 22px 16px; color: #6b7280; font-size: 12px; text-align: center; }
        .spk-notif-empty.error { color: #c94040; }
        .spk-notif-footer { padding: 9px 12px; border-top: 1px solid #f0ede8; display: flex; justify-content: space-between; align-items: center; gap: 10px; background: #fafafa; }
        .spk-notif-footnote { font-size: 10px; color: #6b7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .spk-nav-divider { width: 1px; height: 18px; background: rgba(255,255,255,.15); }
        .spk-btn-login { font-size: 13px; font-weight: 500; color: rgba(255,255,255,.82); background: transparent; border: 1px solid rgba(255,255,255,.22); padding: 7px 16px; border-radius: 6px; cursor: pointer; transition: all .15s; white-space: nowrap; }
        .spk-btn-login:hover { border-color: rgba(255,255,255,.55); color: #ffffff; background: rgba(255,255,255,.08); }
        .spk-btn-register { font-size: 13px; font-weight: 600; color: #0077b7; background: #ffffff; border: 1px solid #ffffff; padding: 7px 16px; border-radius: 6px; cursor: pointer; transition: all .15s; white-space: nowrap; }
        .spk-btn-register:hover { background: #e8f4fb; border-color: #e8f4fb; }
        .spk-hamburger { display: none; flex-direction: column; gap: 4px; padding: 7px; border-radius: 6px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15); cursor: pointer; transition: background .15s; margin-left: auto; }
        .spk-hamburger:hover { background: rgba(255,255,255,.18); }
        .spk-hamburger span { display: block; width: 18px; height: 2px; background: rgba(255,255,255,.85); border-radius: 2px; transition: all .22s; }
        .spk-hamburger.open span:nth-child(1) { transform: rotate(45deg) translateY(6px); }
        .spk-hamburger.open span:nth-child(2) { opacity: 0; width: 0; }
        .spk-hamburger.open span:nth-child(3) { transform: rotate(-45deg) translateY(-6px); }
        .spk-mobile-menu { position: fixed; top: var(--nav-height, 60px); left: 0; right: 0; background: #004f7c; border-bottom: 2px solid rgba(255,255,255,.1); padding: 14px 24px 22px; box-shadow: 0 8px 24px rgba(0,0,0,.22); z-index: 199; animation: fadeDown .2s ease both; }
        .spk-mobile-links { display: flex; flex-direction: column; gap: 2px; margin-bottom: 14px; }
        .spk-mobile-links a { font-size: 14px; font-weight: 500; color: rgba(255,255,255,.72); text-decoration: none; padding: 10px 12px; border-radius: 6px; transition: all .12s; display: flex; align-items: center; gap: 9px; }
        .spk-mobile-link-icon { width: 17px; height: 17px; flex-shrink: 0; stroke-linecap: round; stroke-linejoin: round; }
        .spk-mobile-links a:hover { color: #ffffff; background: rgba(255,255,255,.1); }
        .spk-mobile-actions { display: flex; gap: 8px; flex-wrap: wrap; padding-top: 12px; border-top: 1px solid rgba(255,255,255,.1); }
        .spk-mobile-actions .spk-btn-login,
        .spk-mobile-actions .spk-btn-register {
          flex: 1;
          justify-content: center;
        }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeUpCentered { from { opacity: 0; transform: translate(-50%, -6px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes fadeDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 1100px) {
          .spk-nav { padding: 0 16px; padding-bottom: 3px; }

          .spk-logo-umss-full,
          .spk-logo-creafolio-full {
            display: none !important;
          }

          .spk-logo-mobile-icon {
            display: block !important;
          }

          .spk-nav-sep {
            height: 26px;
            margin: 0 10px;
          }

          .spk-nav-links {
            display: none;
          }

          .spk-nav-right {
            display: flex;
            margin-left: auto;
            margin-right: 12px;
          }

          .spk-nav-right > :not(.spk-bell-wrap) {
            display: none;
          }

          .spk-hamburger {
            display: flex;
            margin-left: 0;
          }

          .spk-notif-dropdown {
            position: fixed;
            left: 50vw;
            right: auto;
            top: calc(var(--nav-height, 60px) + 8px);
            width: min(390px, calc(100vw - 24px));
            max-width: calc(100vw - 24px);
            transform: translateX(-50%);
            animation: fadeUpCentered .18s ease both;
          }

          .spk-notif-header {
            align-items: center;
            flex-direction: row;
          }

          .spk-notif-actions {
            justify-content: flex-end;
            width: auto;
          }

          .spk-notif-panel {
            max-height: min(420px, calc(100vh - 116px));
          }
        }

        @media (max-width: 420px) {
          .spk-nav { padding: 0 12px; padding-bottom: 3px; }
          .spk-logo-mobile-icon { width: 34px; height: 34px; }
          .spk-nav-sep { margin: 0 8px; }
          .spk-nav-right { margin-right: 10px; }
          .spk-notif-header {
            align-items: flex-start;
            flex-direction: column;
          }
          .spk-notif-actions {
            justify-content: space-between;
            width: 100%;
          }
        }
      `}</style>

      <nav className={`spk-nav${scrolled ? ' scrolled' : ''}`}>
        <a href="/" className="spk-nav-logo">
          <img className="spk-logo-umss-full" src="/img/logo.png" width="130" height="38" alt="UMSS" />
          <img className="spk-logo-mobile-icon spk-logo-umss-icon" src="/img/iconoUMSS.png" width="38" height="38" alt="UMSS" />
        </a>

        <div className="spk-nav-sep" />

        <a href="/" className="spk-nav-tagline">
          <img className="spk-logo-creafolio-full" src="/img/logoNavbarCreaFolio.png" width="110" height="25" alt="CreaFolio" />
          <img className="spk-logo-mobile-icon" src="/img/iconoCreaFolio.png" width="38" height="38" alt="CreaFolio" />
        </a>

        <ul className="spk-nav-links">
          {NAV_LINKS.map(({ labelKey, href, icon }) => (
            <li key={href}>
              <a href={href}>
                <svg className="spk-nav-link-icon" viewBox="0 0 24 24" {...ICON_PROPS}>
                  {icon || getNavIcon(href)}
                </svg>
                <span>{t(labelKey)}</span>
              </a>
            </li>
          ))}
        </ul>

        <div className="spk-nav-right">
          {user && (
            <>
              <div className="spk-bell-wrap" ref={notifRef}>
                <button
                  className="spk-bell"
                  type="button"
                  title={t('nav.notifications')}
                  onClick={handleNotificationToggle}
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
                    <path d="M10 20a2.3 2.3 0 0 0 4 0" />
                  </svg>

                  {unreadNotifications > 0 && <div className="spk-bell-dot" />}
                </button>

                {notifOpen && (
                  <div className="spk-notif-dropdown">
                    <div className="spk-notif-header">
                      <div className="spk-notif-titlebar">
                        {notifLevel !== 'modules' && (
                          <button
                            className="spk-notif-back"
                            type="button"
                            onClick={handleNotificationBack}
                            aria-label={t('nav.back')}
                          >
                            <svg viewBox="0 0 24 24">
                              <path d="m15 18-6-6 6-6" />
                            </svg>
                          </button>
                        )}

                        <span className="spk-notif-heading">
                          {notificationPanelTitle}
                        </span>
                      </div>

                      <div className="spk-notif-actions">
                        <button
                          className="spk-notif-clear"
                          type="button"
                          onClick={handleNotificationCenterOpen}
                        >
                          {t('nav.viewAll')}
                        </button>

                        <button
                          className="spk-notif-clear"
                          type="button"
                          disabled={notificationsLoading || unreadNotifications === 0}
                          onClick={handleAllNotificationsRead}
                        >
                          {t('nav.markRead')}
                        </button>
                      </div>
                    </div>

                    {notificationsError && (
                      <div className="spk-notif-empty error">
                        {notificationsError}
                      </div>
                    )}

                    <div className="spk-notif-frame">
                      <div
                        className="spk-notif-slider"
                        style={{ '--notif-level': notifLevelIndex }}
                      >
                        <div className="spk-notif-panel">
                          {notificationsLoading && notifLevel === 'modules' && (
                            <div className="spk-notif-empty">
                              {t('nav.loadingNotifications')}
                            </div>
                          )}

                          {!notificationsLoading && notificationModules.length === 0 && (
                            <div className="spk-notif-empty">
                              {t('nav.noNotifications')}
                            </div>
                          )}

                          {!notificationsLoading && notificationModules.length > 0 && (
                            <div className="spk-notif-list">
                              {notificationModules.map((moduleItem) => (
                                <button
                                  className="spk-notif-row"
                                  key={moduleItem.modulo}
                                  type="button"
                                  disabled={!Number(moduleItem.cantidad)}
                                  onClick={() => handleNotificationModuleOpen(moduleItem)}
                                >
                                  <div className="spk-notif-row-main">
                                    <div className="spk-notif-row-title">
                                      {moduleItem.titulo || moduleFallbackTitle(moduleItem.modulo)}
                                    </div>
                                    <div className="spk-notif-row-meta">
                                      {Number(moduleItem.cantidad || 0)} {t('nav.pendingNotifications')}
                                    </div>
                                  </div>

                                  <span className="spk-notif-count">
                                    {Number(moduleItem.cantidad || 0)}
                                  </span>

                                  <svg className="spk-notif-chevron" viewBox="0 0 24 24">
                                    <path d="m9 18 6-6-6-6" />
                                  </svg>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="spk-notif-panel">
                          {notificationsLoading && notifLevel === 'detail' && (
                            <div className="spk-notif-empty">
                              {t('nav.loadingNotifications')}
                            </div>
                          )}

                          {!notificationsLoading && detailItems.length === 0 && (
                            <div className="spk-notif-empty">
                              {t('nav.noNotifications')}
                            </div>
                          )}

                          {!notificationsLoading && detailItems.length > 0 && (
                            <div className="spk-notif-list">
                              {detailIsDirectMessages ? detailItems.map((notification) => (
                                <button
                                  className="spk-notif-item unread"
                                  key={notification.id_notificacion}
                                  type="button"
                                  onClick={() => handleNotificationRead(notification)}
                                >
                                  <div className="spk-notif-ico" />

                                  <div>
                                    <div className="spk-notif-title">
                                      {getNotificationTitle(notification)}
                                    </div>

                                    {notification.contenido && (
                                      <div className="spk-notif-text">
                                        {notification.contenido}
                                      </div>
                                    )}

                                    <div className="spk-notif-time">
                                      {notificationTime(notification.created_at, language)}
                                    </div>
                                  </div>
                                </button>
                              )) : detailItems.map((group) => (
                                <button
                                  className="spk-notif-row"
                                  key={group.contexto_referencia}
                                  type="button"
                                  onClick={() => handleNotificationGroupOpen(group)}
                                >
                                  <div className="spk-notif-row-main">
                                    <div className="spk-notif-row-title">
                                      {group.titulo || t('nav.ungroupedNotifications')}
                                    </div>
                                    <div className="spk-notif-row-meta">
                                      {Number(group.cantidad || 0)} {t('nav.pendingNotifications')}
                                    </div>
                                  </div>

                                  <span className="spk-notif-count">
                                    {Number(group.cantidad || 0)}
                                  </span>

                                  <svg className="spk-notif-chevron" viewBox="0 0 24 24">
                                    <path d="m9 18 6-6-6-6" />
                                  </svg>
                                </button>
                              ))}
                            </div>
                          )}

                          {selectedNotificationModule && Number(selectedNotificationModule.cantidad || 0) > 0 && (
                            <div className="spk-notif-footer">
                              <span className="spk-notif-footnote">
                                {selectedNotificationModule.titulo || moduleFallbackTitle(selectedNotificationModule.modulo)}
                              </span>
                              <button
                                className="spk-notif-clear"
                                type="button"
                                onClick={handleModuleNotificationsRead}
                              >
                                {t('nav.markModuleRead')}
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="spk-notif-panel">
                          {notificationsLoading && notifLevel === 'messages' && (
                            <div className="spk-notif-empty">
                              {t('nav.loadingNotifications')}
                            </div>
                          )}

                          {!notificationsLoading && notificationMessages.length === 0 && (
                            <div className="spk-notif-empty">
                              {t('nav.noNotifications')}
                            </div>
                          )}

                          {!notificationsLoading && notificationMessages.length > 0 && (
                            <div className="spk-notif-list">
                              {notificationMessages.map((notification) => (
                                <button
                                  className="spk-notif-item unread"
                                  key={notification.id_notificacion}
                                  type="button"
                                  onClick={() => handleNotificationRead(notification)}
                                >
                                  <div className="spk-notif-ico" />

                                  <div>
                                    <div className="spk-notif-title">
                                      {getNotificationTitle(notification)}
                                    </div>

                                    {notification.contenido && (
                                      <div className="spk-notif-text">
                                        {notification.contenido}
                                      </div>
                                    )}

                                    <div className="spk-notif-time">
                                      {notificationTime(notification.created_at, language)}
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}

                          {selectedNotificationGroup && (
                            <div className="spk-notif-footer">
                              <span className="spk-notif-footnote">
                                {selectedNotificationGroup.titulo || t('nav.ungroupedNotifications')}
                              </span>
                              <button
                                className="spk-notif-clear"
                                type="button"
                                onClick={handleGroupNotificationsRead}
                              >
                                {t('nav.markGroupRead')}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <LanguageSelector />

          <div className="spk-nav-divider" />

          {user ? (
            <div className={`spk-nav-user${userMenuOpen ? ' open' : ''}`} ref={userRef}>
              <button
                className="spk-user-toggle"
                type="button"
                onClick={() => setUserMenuOpen((open) => !open)}
              >
                <div className="spk-user-avatar">{initials}</div>

                <div className="spk-user-info">
                  <div className="spk-user-name">{userName}</div>
                  <div className="spk-user-role">{userRole}</div>
                </div>

                <svg className="spk-user-chevron" viewBox="0 0 14 14">
                  <path d="m3 5 4 4 4-4" />
                </svg>
              </button>

              {userMenuOpen && (
                <div className="spk-user-dropdown" onClick={(event) => event.stopPropagation()}>
                  <div className="spk-dd-header">
                    <div className="spk-dd-avatar">{initials}</div>

                    <div>
                      <div className="spk-dd-name">
                        {userName || t('nav.user')}
                      </div>

                      <div className="spk-dd-email">
                        {user?.correo || user?.email || '---'}
                      </div>

                      <div className="spk-dd-status">
                        <span className="spk-dd-status-dot" />
                        {t('nav.activeProfile')}
                      </div>
                    </div>
                  </div>

                  <div className="spk-dd-section">
                    <div className="spk-dd-label">{t('nav.account')}</div>

                    <button
                      className="spk-dd-item"
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        window.location.href = adminUser ? '/admin/users' : '/dashboard/profile';
                      }}
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M19 21a7 7 0 0 0-14 0" />
                        <circle cx="12" cy="8" r="4" />
                      </svg>
                      {t('nav.viewProfile')}
                    </button>

                    <button
                      className="spk-dd-item"
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        window.location.href = adminUser ? '/admin' : '/dashboard/settings';
                      }}
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
                        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 0 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.3 7A2 2 0 0 1 7.1 4.2l.1.1a1.7 1.7 0 0 0 1.9.3h.1A1.7 1.7 0 0 0 10 3V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 0 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1A1.7 1.7 0 0 0 21 10h.1a2 2 0 0 1 0 4H21a1.7 1.7 0 0 0-1.6 1Z" />
                      </svg>
                      {t('nav.settings')}
                    </button>
                  </div>

                  <div className="spk-dd-section">
                    <div className="spk-dd-label">{t('nav.portfolio')}</div>

                    <button
                      className="spk-dd-item highlight"
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        window.location.href = dashboardHomePath || '/dashboard';
                      }}
                    >
                      <svg viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="14" rx="2" />
                        <path d="M8 21h8" />
                        <path d="M12 18v3" />
                        <path d="M8 11s1.4-3 4-3 4 3 4 3-1.4 3-4 3-4-3-4-3Z" />
                        <circle cx="12" cy="11" r="1" />
                      </svg>
                      {adminUser ? t('nav.adminPanel') : t('nav.managePortfolio')}
                    </button>
                  </div>

                  <div className="spk-dd-section">
                    <button
                      className="spk-dd-item danger"
                      type="button"
                      onClick={handleLogoutClick}
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M10 17 15 12 10 7" />
                        <path d="M15 12H3" />
                        <path d="M21 19V5a2 2 0 0 0-2-2h-5" />
                      </svg>
                      {t('nav.logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                className="spk-btn-login"
                type="button"
                onClick={() => {
                  window.location.href = '/auth/login';
                }}
              >
                {t('nav.login')}
              </button>

              <button
                className="spk-btn-register"
                type="button"
                onClick={() => {
                  window.location.href = '/auth/register';
                }}
              >
                {t('nav.register')}
              </button>
            </>
          )}
        </div>

        <button
          className={`spk-hamburger${mobileOpen ? ' open' : ''}`}
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label={t('nav.openMenu')}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {mobileOpen && (
        <div className="spk-mobile-menu">
          <div className="spk-mobile-links">
            {NAV_LINKS.map(({ labelKey, href, icon }) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
              >
                <svg className="spk-mobile-link-icon" viewBox="0 0 24 24" {...ICON_PROPS}>
                  {icon || getNavIcon(href)}
                </svg>
                <span>{t(labelKey)}</span>
              </a>
            ))}
          </div>

          <div style={{ marginBottom: '12px' }}>
            <LanguageSelector mobile />
          </div>

          <div className="spk-mobile-actions">
            {user ? (
              <>
                <button
                  className="spk-btn-login"
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    window.location.href = dashboardHomePath || '/dashboard';
                  }}
                >
                  {adminUser ? t('nav.adminPanel') : t('nav.myPortfolio')}
                </button>

                <button
                  className="spk-btn-register"
                  type="button"
                  onClick={handleLogoutClick}
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <button
                  className="spk-btn-login"
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    window.location.href = '/auth/login';
                  }}
                >
                  {t('nav.login')}
                </button>

                <button
                  className="spk-btn-register"
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    window.location.href = '/auth/register';
                  }}
                >
                  {t('nav.register')}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <CalendarPanel enabled={!!user} />

      <NotificationCenterModal
        open={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
        onChanged={() => loadNotifications({ silent: true })}
      />

      <ConfirmModal
        open={logoutModal}
        title={t('nav.logoutTitle')}
        message={t('nav.logoutMessage')}
        confirmLabel={t('nav.logoutConfirm')}
        cancelLabel={t('nav.cancel')}
        variant="red"
        icon="logout"
        loading={loggingOut}
        onConfirm={doLogout}
        onClose={() => !loggingOut && setLogoutModal(false)}
      />
    </>
  );
}
