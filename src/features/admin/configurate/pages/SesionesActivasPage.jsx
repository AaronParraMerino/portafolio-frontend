import SesionesActivas from '../components/SesionesActivas';
import AdminHeader from '../../layout/AdminHeader';
import { getAdminSectionConfig } from '../../layout/adminHeaderConfig';

export default function SesionesActivasPage() {
  const config = getAdminSectionConfig('sessions');

  return (
    <>
      <AdminHeader eyebrow={config.eyebrow} title={config.title} />
      <SesionesActivas />
    </>
  );
}
