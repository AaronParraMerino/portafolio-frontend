import VincularCuenta from '../components/VincularCuenta';
import Header from '../../layout/Header';
import { useLanguage } from '../../../../core/i18n';
import '../styles/configurate.css';

export default function VincularCuentaPage() {
  const { t } = useLanguage();

  return (
    <>
      <Header
        eyebrow={t("configurate.header.eyebrow")}
        title={t("configurate.link.pageTitle")}
        subtitle={t("configurate.header.title")}
      />
      <div className="cfg-subpage-shell">
        <VincularCuenta />
      </div>
    </>
  );
}
