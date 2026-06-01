import { FiPlus } from 'react-icons/fi';
import Header from '../../layout/Header';
import { useLanguage } from '../../../../core/i18n';

/* ════════════════════════════════════════
   ProjectsHeader
   src/features/dashboard/projects/components/ProjectsHeader.jsx

   Props:
   ─ onAgregar  fn()   abre el modal de nuevo proyecto
════════════════════════════════════════ */
export default function ProjectsHeader({ onAgregar }) {
  const { t } = useLanguage();

  return (
    <Header
      title={t('projects.header.title')}
      actions={[
        {
          label: t('projects.header.add'),
          title: t('projects.header.addProject'),
          ariaLabel: t('projects.header.addProject'),
          icon: <FiPlus />,
          onClick: onAgregar,
        },
      ]}
    />
  );
}
