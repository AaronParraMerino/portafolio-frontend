import EliminarCuenta from '../components/EliminarCuenta';
import Header from '../../layout/Header';

export default function EliminarCuentaPage() {
  return (
    <>
      <Header eyebrow="CUENTA" title="Eliminar Cuenta" subtitle="Configuracion" />
      <EliminarCuenta />
    </>
  );
}
