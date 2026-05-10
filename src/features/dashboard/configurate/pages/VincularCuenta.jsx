import VincularCuenta from '../components/VincularCuenta';
import Header from '../../layout/Header';

export default function VincularCuentaPage() {
  return (
    <>
      <Header eyebrow="CUENTA" title="Vincular Cuenta" subtitle="Configuracion" />
      <VincularCuenta />
    </>
  );
}
