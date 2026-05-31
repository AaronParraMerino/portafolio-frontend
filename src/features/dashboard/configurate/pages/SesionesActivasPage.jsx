import SesionesActivas from '../components/SesionesActivas';
import Header from '../../layout/Header';
import { useLanguage } from '../../../../core/i18n';

export default function SesionesActivasPage() {
  const { t } = useLanguage();

  return (
    <>
      <Header
        eyebrow={t("configurate.header.eyebrow")}
        title={t("configurate.sessions.pageTitle")}
        subtitle={t("configurate.header.title")}
      />
      <SesionesActivas />
    </>
  );
}
