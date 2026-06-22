import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MainLayout from '../../shared/components/layout/MainLayout';
import HomePage from '../../features/public/home/pages/HomePage';
import PortfolioSearchPage from '../../features/public/portfolio-search/pages/PortfolioSearchPage';
import DevelopersPage from '../../features/public/developers/pages/DevelopersPage';
import PublicEventsPage from '../../features/public/events/pages/PublicEventsPage';
import LoginPage from '../../features/auth/pages/LoginPage';
import RegisterPage from '../../features/auth/pages/RegisterPage';
import DashboardLayout from '../../features/dashboard/layout/DashboardLayout';
import DashboardPage from '../../features/dashboard/DashboardPage';
import AdminDashboardLayout from '../../features/admin/layout/AdminDashboardLayout';
import AdminDashboardPage from '../../features/admin/dashboard/AdminDashboardPage';
import UsersPage from '../../features/admin/users/pages/UsersPage';
import EventsPage from '../../features/admin/events/pages/EventsPage';
import AuditPage from '../../features/admin/audit/pages/AuditPage';
import ReportsPage from '../../features/admin/reports/pages/ReportsPage';
import BackupsPage from '../../features/admin/backups/pages/BackupsPage';
import DenunciasPage from '../../features/admin/denuncias/pages/DenunciasPage';
import DashboardEventsPage from '../../features/dashboard/events/pages/EventsPage';
import ProfilePage from '../../features/dashboard/profile/pages/ProfilePage';
import ExperiencePage from '../../features/dashboard/experience/pages/ExperiencePage';
import CookiesPage from '../../features/auth/pages/CookiesPage';
import PrivacidadPage from '../../features/auth/pages/PrivacidadPage';
import Contraseña from '../../features/auth/components/Contraseña';
import Codigo from '../../features/auth/components/Codigo';
import CambiarContra from '../../features/auth/components/CambiarContra';
import SkillsPage from '../../features/dashboard/skills/pages/SkillsPage';
import ConfiguratePage from '../../features/dashboard/configurate/pages/ConfiguratePage';
import VincularCuentaPage from '../../features/dashboard/configurate/pages/VincularCuenta';
import CambiarContraPage from '../../features/dashboard/configurate/pages/CambiarContraPage';
import SesionesActivasPage from '../../features/dashboard/configurate/pages/SesionesActivasPage';
import EliminarCuentaPage from '../../features/dashboard/configurate/pages/EliminarCuentaPage';
import EnlacePage from '../../features/dashboard/Links/pages/EnlacePage';
import OAuthCallbackPage from '../../features/auth/pages/OAuthCallbackPage';
import ProjectsPage from '../../features/dashboard/projects/pages/ProjectsPage';
import ViewPage from '../../features/dashboard/view/pages/ViewPage';
import PortfolioPage from '../../features/public/portfolio/pages/PortfolioPage';
import PublicProjectsPage from '../../features/public/projects/pages/PublicProjectsPage';
import { getStoredUser, isAdminUser } from '../../shared/utils/authStorage';
import { LanguageProvider } from '../i18n';

const SCROLLABLE_ROUTE_CONTAINERS = [
  '.dsh-main',
  '.dsh-paused-content',
  '.prj-content',
  '.dbe-content',
  '.usr-content',
  '.evt-content',
  '.aud-content',
  '.den-content',
  '.rpt-content',
  '.bkp-content',
  '.sk-view-content',
  '.exp-content',
];

const ROUTE_SCROLL_DURATION_MS = 620;

function easeInOutCubic(progress) {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - ((-2 * progress + 2) ** 3) / 2;
}

function animateValue(from, to, duration, onUpdate) {
  const start = performance.now();
  let frameId = 0;

  const tick = (now) => {
    const progress = Math.min(1, (now - start) / duration);
    const eased = easeInOutCubic(progress);
    onUpdate(from + ((to - from) * eased));

    if (progress < 1) {
      frameId = window.requestAnimationFrame(tick);
    }
  };

  frameId = window.requestAnimationFrame(tick);
  return () => window.cancelAnimationFrame(frameId);
}

function animateWindowToTop() {
  const startY = window.scrollY || window.pageYOffset || 0;
  if (startY <= 1) return () => {};

  return animateValue(startY, 0, ROUTE_SCROLL_DURATION_MS, (top) => {
    window.scrollTo(0, top);
  });
}

function animateElementToTop(element) {
  if (!element || element.scrollTop <= 1) return () => {};

  const startY = element.scrollTop;
  return animateValue(startY, 0, ROUTE_SCROLL_DURATION_MS, (top) => {
    if (element.isConnected) element.scrollTop = top;
  });
}

function jumpToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  SCROLLABLE_ROUTE_CONTAINERS.forEach((selector) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.scrollTop = 0;
      element.scrollLeft = 0;
    });
  });
}

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    let cleanupAnimations = [];
    let firstFrame = 0;
    let secondFrame = 0;

    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (reduceMotion) {
          jumpToTop();
          return;
        }

        cleanupAnimations = [animateWindowToTop()];

        SCROLLABLE_ROUTE_CONTAINERS.forEach((selector) => {
          document.querySelectorAll(selector).forEach((element) => {
            cleanupAnimations.push(animateElementToTop(element));
          });
        });
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      cleanupAnimations.forEach((cleanup) => cleanup());
    };
  }, [pathname, search]);

  return null;
}

function RoleGate({ children, adminOnly = false, userOnly = false }) {
  const user = getStoredUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/auth/login" replace state={{ from: `${location.pathname}${location.search}${location.hash}` }} />;
  }

  if (adminOnly && !isAdminUser(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (userOnly && isAdminUser(user)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export default function AppRouter({ isBackendAvailable = true }) {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>

        {/* ── CON Navbar y Footer ── */}
        <Route element={<MainLayout isBackendAvailable={isBackendAvailable} />}>
          <Route index element={<HomePage />} />
          <Route path="portafolios" element={<PortfolioSearchPage />} />
          <Route path="desarrolladores" element={<DevelopersPage />} />
          <Route path="eventos" element={<PublicEventsPage />} />
          <Route path="proyectos" element={<PublicProjectsPage />} />
          <Route path="portafolio/:userId" element={<RoleGate><PortfolioPage /></RoleGate>} />
          <Route path="dashboard" element={<RoleGate userOnly><DashboardLayout /></RoleGate>}>
            <Route index element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="experience" element={<ExperiencePage />} />
            <Route path="skills" element={<SkillsPage />} />
            <Route path="events" element={<DashboardEventsPage />} />
              <Route path="settings" element={<ConfiguratePage />} />
            <Route path="settings/vincular-cuenta" element={<VincularCuentaPage />} />
            <Route path="settings/cambiar-contraseña" element={<CambiarContraPage />} />
            <Route path="settings/sesiones-activas" element={<SesionesActivasPage />} />
            <Route path="settings/eliminar-cuenta" element={<EliminarCuentaPage />} />
            <Route path="enlaces" element={<EnlacePage />} />
            <Route path="projects" element={<ProjectsPage />} />
              <Route path="enlaces" element={<EnlacePage />} />
            <Route path="view" element={<ViewPage />} />
          </Route>
          <Route path="admin" element={<RoleGate adminOnly><AdminDashboardLayout /></RoleGate>}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="audit" element={<AuditPage />} />
            <Route path="denuncias" element={<DenunciasPage />} />
            <Route path="backups" element={<BackupsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        {/* ── SIN Navbar y Footer ── */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/cookies" element={<CookiesPage />} />
        <Route path="/auth/privacidad" element={<PrivacidadPage />} />
        <Route path="/auth/forgot-password" element={<Contraseña />} />
        <Route path="/auth/codigo" element={<Codigo />} />
        <Route path="/auth/cambiar-contraseña" element={<CambiarContra />} />
        <Route path="/auth/callback" element={<OAuthCallbackPage />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
