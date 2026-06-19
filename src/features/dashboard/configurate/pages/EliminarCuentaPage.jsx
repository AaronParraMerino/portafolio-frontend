import EliminarCuenta from '../components/EliminarCuenta';
import Header from '../../layout/Header';
import { useLanguage } from '../../../../core/i18n';
import '../styles/configurate.css';

export default function EliminarCuentaPage() {
  const { t } = useLanguage();

  return (
    <>
      <Header
        eyebrow={t("configurate.header.eyebrow")}
        title={t("configurate.inactive.title")}
        subtitle={t("configurate.header.title")}
      />
      <div className="cfg-subpage-shell">
        <EliminarCuenta />
      </div>
    </>
  );
}
