import CambiarContraseña from '../components/CambiarContraseña';
import Header from '../../layout/Header';
import { useLanguage } from '../../../../core/i18n';

export default function CambiarContraseñaPage() {
  const { t } = useLanguage();

  return (
    <>
      <Header
        eyebrow={t("configurate.header.eyebrow")}
        title={t("configurate.password.pageTitle")}
        subtitle={t("configurate.header.title")}
      />
      <CambiarContraseña />
    </>
  );
}
