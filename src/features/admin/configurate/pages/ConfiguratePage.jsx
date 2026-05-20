import Configurate from '../components/Configurate';
import AdminHeader from '../../layout/AdminHeader';
import { getAdminSectionConfig } from '../../layout/adminHeaderConfig';

export default function ConfiguratePage() {
  const config = getAdminSectionConfig('settings');

  return (
    <>
      <AdminHeader eyebrow={config.eyebrow} title={config.title} />
      <div style={{ minHeight: '100vh', background: '#effaff' }}>
        <Configurate />
      </div>
    </>
  );
}
