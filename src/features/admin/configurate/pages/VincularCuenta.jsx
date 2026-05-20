import VincularCuenta from '../components/VincularCuenta';
import AdminHeader from '../../layout/AdminHeader';
import { getAdminSectionConfig } from '../../layout/adminHeaderConfig';

export default function VincularCuentaPage() {
  const config = getAdminSectionConfig('linkAccount');

  return (
    <>
      <AdminHeader eyebrow={config.eyebrow} title={config.title} />
      <VincularCuenta />
    </>
  );
}
