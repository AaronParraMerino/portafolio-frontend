import MainLayout from '../../../../shared/components/layout/MainLayout';
import Hero from '../components/Hero';

export default function HomePage() {
  return (
    <MainLayout>
      <Hero />
      {/* Aquí irán las demás secciones: Features, HowItWorks, DevsPreview, etc. */}
    </MainLayout>
  );
}