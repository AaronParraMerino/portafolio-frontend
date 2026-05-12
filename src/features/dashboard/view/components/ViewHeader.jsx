// src/features/dashboard/view/components/ViewHeader.jsx
import { FiCheck, FiSettings } from 'react-icons/fi';
import Header from '../../layout/Header';

export default function ViewHeader({
  guardando,
  onPersonalizar,
  onPublicar,
}) {
  return (
    <Header
      title="Vista Portafolio"
      actions={[
        {
          label: 'Personalizar',
          title: 'Personalizar vista',
          icon: <FiSettings />,
          variant: 'secondary',
          onClick: onPersonalizar,
        },
        {
          label: 'Publicar',
          loadingLabel: 'Publicando...',
          title: 'Publicar portafolio',
          icon: <FiCheck />,
          loading: guardando,
          onClick: onPublicar,
        },
      ]}
    />
  );
}
