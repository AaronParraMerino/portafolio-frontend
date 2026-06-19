import '../styles/profile.css';
import { useLanguage } from '../../../../core/i18n';
import {
  DashboardCheckIcon,
  DashboardStatusIcon,
} from '../../layout/DashboardIcons';

export default function ProfileCompletitud({ perfil }) {
  const { t } = useLanguage();
  const items = [
    { labelKey: 'profile.completion.name', done: !!(perfil.nombre && perfil.apellido) },
    { labelKey: 'profile.completion.avatar',     done: !!perfil.avatarUrl },
    { labelKey: 'profile.completion.banner',     done: !!perfil.bannerUrl },
    { labelKey: 'profile.completion.profession',          done: !!perfil.profesion },
    { labelKey: 'profile.completion.email', done: !!perfil.correo },
    { labelKey: 'profile.completion.phone',           done: !!perfil.telefono },
    { labelKey: 'profile.completion.about',       done: !!perfil.biografia },
    { labelKey: 'profile.completion.location',          done: !!(perfil.ciudad && perfil.pais) },
  ];

  const doneCount = items.filter(item => item.done).length;
  const pct = Math.round((doneCount / items.length) * 100);


  return (
    <div className="prf-card">
      <div className="prf-card-head">
        <span className="prf-card-title">{t('profile.completion.title')}</span>
        <span className="prf-card-sub">{t('profile.completion.subtitle')}</span>
      </div>
      <div className="prf-completitud">
        <div className="prf-comp-labels">
          <span>{t('profile.completion.progress')}</span>
          <strong>{pct}%</strong>
        </div>
        <div className="prf-comp-bar">
          <div className="prf-comp-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="prf-comp-items">
          {items.map(({ labelKey, done }) => (
            <div key={labelKey} className={`prf-comp-item${done ? ' done' : ''}`}>
              {done ? <DashboardCheckIcon /> : <DashboardStatusIcon />}
              {t(labelKey)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
