import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../../shared/components/layout/MainLayout';
import HomePage from '../../features/public/home/pages/HomePage';
import PortfolioSearchPage from '../../features/public/portfolio-search/pages/PortfolioSearchPage';
import DevelopersPage from '../../features/public/developers/pages/DevelopersPage';
import LoginPage from '../../features/auth/pages/LoginPage';
import RegisterPage from '../../features/auth/pages/RegisterPage';
import DashboardLayout from '../../features/dashboard/layout/DashboardLayout';
import DashboardPage from '../../features/dashboard/DashboardPage';
import AdminDashboardLayout from '../../features/admin/layout/AdminDashboardLayout';
import AdminDashboardPage from '../../features/admin/dashboard/AdminDashboardPage';
import UsersPage from '../../features/admin/users/pages/UsersPage';
import EventsPage from '../../features/admin/events/pages/EventsPage';
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
import { getStoredUser, isAdminUser } from '../../shared/utils/authStorage';

function RoleGate({ children, adminOnly = false, userOnly = false }) {
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/auth/login" replace />;
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
    <BrowserRouter>
      <Routes>

        {/* ── CON Navbar y Footer ── */}
        <Route element={<MainLayout isBackendAvailable={isBackendAvailable} />}>
          <Route index element={<HomePage />} />
          <Route path="portafolios" element={<PortfolioSearchPage />} />
          <Route path="desarrolladores" element={<DevelopersPage />} />
          <Route path="portafolio/:userId" element={<PortfolioPage />} />
          <Route path="dashboard" element={<RoleGate userOnly><DashboardLayout /></RoleGate>}>
            <Route index element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="experience" element={<ExperiencePage />} />
            <Route path="skills" element={<SkillsPage />} />
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
            <Route path="profile" element={<AdminDashboardPage section="profile" />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="notices" element={<AdminDashboardPage section="notices" />} />
            <Route path="reports" element={<AdminDashboardPage section="reports" />} />
            <Route path="audit" element={<AdminDashboardPage section="audit" />} />
            <Route path="backups" element={<AdminDashboardPage section="backups" />} />
            <Route path="settings" element={<AdminDashboardPage section="settings" />} />
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
  );
}
