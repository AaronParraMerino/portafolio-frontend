import { FiPlus } from 'react-icons/fi';
import Header from '../../layout/Header';

/* ════════════════════════════════════════
   ProjectsHeader
   src/features/dashboard/projects/components/ProjectsHeader.jsx

   Props:
   ─ onAgregar  fn()   abre el modal de nuevo proyecto
════════════════════════════════════════ */
export default function ProjectsHeader({ onAgregar }) {
  return (
    <Header
      title="Mis Proyectos"
      actions={[
        {
          label: 'Agregar nuevo',
          title: 'Agregar nuevo proyecto',
          ariaLabel: 'Agregar nuevo proyecto',
          icon: <FiPlus />,
          onClick: onAgregar,
        },
      ]}
    />
  );
}
