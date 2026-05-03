import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../../shared/components/layout/MainLayout';
import HomePage from '../../features/public/home/pages/HomePage';
import LoginPage from '../../features/auth/pages/LoginPage';
import RegisterPage from '../../features/auth/pages/RegisterPage';
import DashboardLayout from '../../features/dashboard/layout/DashboardLayout';
import DashboardPage from '../../features/dashboard/DashboardPage';
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

export default function AppRouter({ isBackendAvailable = true }) {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── CON Navbar y Footer ── */}
        <Route element={<MainLayout isBackendAvailable={isBackendAvailable} />}>
          <Route index element={<HomePage />} />
            <Route path="dashboard/*" element={<DashboardLayout />}>
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
      </Routes>
    </BrowserRouter>
  );
}