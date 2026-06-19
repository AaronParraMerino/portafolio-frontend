import '../styles/profile.css';
import { useLanguage } from '../../../../core/i18n';
import {
  DashboardGlobeIcon,
  DashboardLocationIcon,
  DashboardMailIcon,
  DashboardPhoneIcon,
  DashboardUserIcon,
  DashboardWorkIcon,
} from '../../layout/DashboardIcons';

function Campo({ label, icon, children, full = false, isEmpty = false }) {
  return (
    <div className={`prf-datacard-field${full ? ' prf-datacard-field--full' : ''}`}>
      <label className="prf-datacard-label">
        <span className={`prf-datacard-field-icon${isEmpty ? ' is-empty' : ''}`}>{icon}</span>
        {label}
      </label>
      <div className={`prf-datacard-value${full ? ' prf-datacard-value--bio' : ''}${isEmpty ? ' is-empty' : ''}`}>
        {children}
      </div>
    </div>
  );
}

export default function ProfileDataCard({ perfil }) {
  const { t } = useLanguage();
  const empty = (key = 'profile.empty.default') => <span className="prf-datacard-empty">{t(key)}</span>;

  return (
    <div className="prf-datacard">
      <div className="prf-card-head">
        <span className="prf-card-title">{t('profile.data.title')}</span>
      </div>

      <div className="prf-datacard-fields">
        <Campo label={t('profile.field.email')} icon={<DashboardMailIcon />} isEmpty={!perfil.correo}>
          {perfil.correo || empty()}
        </Campo>

        <Campo label={t('profile.field.country')} icon={<DashboardGlobeIcon />} isEmpty={!perfil.pais}>
          {perfil.pais || empty('profile.empty.dash')}
        </Campo>

        <Campo label={t('profile.field.city')} icon={<DashboardLocationIcon />} isEmpty={!perfil.ciudad}>
          {perfil.ciudad || empty('profile.empty.dash')}
        </Campo>

        <Campo label={t('profile.field.profession')} icon={<DashboardWorkIcon />} isEmpty={!perfil.profesion}>
          {perfil.profesion || empty()}
        </Campo>

        <Campo label={t('profile.field.phone')} icon={<DashboardPhoneIcon />} isEmpty={!perfil.telefono}>
          {perfil.telefono || empty()}
        </Campo>

        <Campo label={t('profile.field.about')} icon={<DashboardUserIcon />} full isEmpty={!perfil.biografia}>
          {perfil.biografia || empty()}
        </Campo>
      </div>
    </div>
  );
}
