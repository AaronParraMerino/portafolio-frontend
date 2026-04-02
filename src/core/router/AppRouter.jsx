import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../../shared/components/layout/MainLayout';
import HomePage from '../../features/public/home/pages/HomePage';
import DashboardLayout from '../../features/dashboard/layout/DashboardLayout';
import DashboardPage from '../../features/dashboard/DashboardPage';
import ProfilePage from '../../features/dashboard/profile/pages/ProfilePage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />

          <Route path="dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}