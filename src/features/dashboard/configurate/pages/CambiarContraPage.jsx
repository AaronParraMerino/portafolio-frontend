import CambiarContraseña from '../components/CambiarContraseña';
import Header from '../../layout/Header';

export default function CambiarContraPage() {
  return (
    <>
      <Header eyebrow="CUENTA" title="Cambiar Contrasena" subtitle="Configuracion" />
      <CambiarContraseña />
    </>
  );
}
