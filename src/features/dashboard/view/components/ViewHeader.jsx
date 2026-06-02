// src/features/dashboard/view/components/ViewHeader.jsx
import { FiCheck, FiSettings } from 'react-icons/fi';
import Header from '../../layout/Header';
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
          icon: <FiSettings />,
          variant: 'secondary',
          onClick: onPersonalizar,
        },
        {
          label: t('view.action.publish'),
          loadingLabel: t('view.action.publishing'),
          title: t('view.action.publishTitle'),
          icon: <FiCheck />,
          loading: guardando,
          onClick: onPublicar,
        },
      ]}
    />
  );
}
