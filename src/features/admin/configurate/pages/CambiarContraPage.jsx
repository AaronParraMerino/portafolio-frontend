import CambiarContraseÃƒÂ±a from '../components/CambiarContraseÃƒÂ±a';
import AdminHeader from '../../layout/AdminHeader';
import { getAdminSectionConfig } from '../../layout/adminHeaderConfig';

export default function CambiarContraPage() {
  const config = getAdminSectionConfig('password');

  return (
    <>
      <AdminHeader eyebrow={config.eyebrow} title={config.title} />
      <CambiarContraseÃƒÂ±a />
    </>
  );
}
