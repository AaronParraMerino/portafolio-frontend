import Navbar from './Navbar';
import Footer from './Footer';

export default function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 'var(--nav-height)' }}>
        {children}
      </main>
      <Footer />
    </>
  );
}