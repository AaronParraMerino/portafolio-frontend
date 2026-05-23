import { Outlet } from 'react-router-dom';
import { LanguageProvider } from '../../../core/i18n';
import Navbar from './Navbar';
import Footer from './Footer';

export default function MainLayout({ isBackendAvailable = true }) {
  return (
    <LanguageProvider>
      <Navbar />
      <main style={{ paddingTop: 'var(--nav-height)' }}>
        <Outlet />
      </main>
      <Footer isBackendAvailable={isBackendAvailable} />
    </LanguageProvider>
  );
}