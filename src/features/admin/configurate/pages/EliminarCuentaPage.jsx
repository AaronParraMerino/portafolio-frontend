import EliminarCuenta from '../components/EliminarCuenta';
import AdminHeader from '../../layout/AdminHeader';
import { getAdminSectionConfig } from '../../layout/adminHeaderConfig';

export default function EliminarCuentaPage() {
  const config = getAdminSectionConfig('deleteAccount');

  return (
    <>
      <AdminHeader eyebrow={config.eyebrow} title={config.title} />
      <EliminarCuenta />
    </>
  );
}
