// src/features/dashboard/view/components/ViewStats.jsx

import { isVisible } from '../model/viewModel';
import { useLanguage } from '../../../../core/i18n';

export default function ViewStats({ stats = [], visibilidad }) {
  const { t } = useLanguage();
  const visibles = stats.filter(stat => (
    isVisible(visibilidad, 'stats', stat.id)
  ));

  if (!visibles.length) return null;

  return (
    <div className="pf-body">
      <div className="pf-stats">
        {visibles.map(stat => (
          <div key={stat.id} className="pf-stat">
            <div className="pf-stat-num">{stat.valor}</div>
            <div className="pf-stat-label">{t(`view.stats.${stat.id}`, {}, stat.label)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
