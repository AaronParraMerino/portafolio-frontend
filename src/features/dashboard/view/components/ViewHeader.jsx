// src/features/dashboard/view/components/ViewHeader.jsx
import Header from '../../layout/Header';
import {
  DashboardCheckIcon,
  DashboardSettingsIcon,
} from '../../layout/DashboardIcons';
import { useLanguage } from '../../../../core/i18n';

export default function ViewHeader({
  guardando,
  onPersonalizar,
  onPublicar,
}) {
  const { t } = useLanguage();

  return (
    <Header
      title={t('view.header.title')}
      actions={[
        {
          label: t('view.action.customize'),
          title: t('view.action.customizeTitle'),
          icon: <DashboardSettingsIcon />,
          variant: 'secondary',
          onClick: onPersonalizar,
        },
        {
          label: t('view.action.publish'),
          loadingLabel: t('view.action.publishing'),
          title: t('view.action.publishTitle'),
          icon: <DashboardCheckIcon />,
          loading: guardando,
          onClick: onPublicar,
        },
      ]}
    />
  );
}
