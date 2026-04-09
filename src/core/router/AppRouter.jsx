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
import ContraseñaPage from '../../features/auth/pages/ContraseñaPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── CON Navbar y Footer ── */}
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
            <Route path="dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="experience" element={<ExperiencePage />} />
            </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        {/* ── SIN Navbar y Footer ── */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/cookies" element={<CookiesPage />} />
        <Route path="/auth/privacidad" element={<PrivacidadPage />} />
        <Route path="/auth/contraseña" element={<ContraseñaPage />} />
      </Routes>
    </BrowserRouter>
  );
}