import SesionesActivas from '../components/SesionesActivas';
import Header from '../../layout/Header';

export default function SesionesActivasPage() {
  return (
    <>
      <Header eyebrow="CUENTA" title="Sesiones Activas" subtitle="Configuracion" />
      <SesionesActivas />
    </>
  );
}
