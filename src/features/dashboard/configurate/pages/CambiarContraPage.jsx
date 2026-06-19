import CambiarContrasena from '../components/CambiarContraseña';
import Header from '../../layout/Header';
import { useLanguage } from '../../../../core/i18n';
import '../styles/configurate.css';

export default function CambiarContrasenaPage() {
  const { t } = useLanguage();

  return (
    <>
      <Header
        eyebrow={t("configurate.header.eyebrow")}
        title={t("configurate.password.pageTitle")}
        subtitle={t("configurate.header.title")}
      />
      <div className="cfg-subpage-shell">
        <CambiarContrasena />
      </div>
    </>
  );
}
