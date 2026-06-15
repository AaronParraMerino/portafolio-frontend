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

// Íconos por campo — dan identidad visual sin emojis

// Campo con ícono
// isEmpty: controla borde izquierdo y fondo del value
function Campo({ label, icon, children, full = false, isEmpty = false }) {
  return (
    <div
      className={`prf-datacard-field${full ? ' prf-datacard-field--full' : ''}`}
      style={{
        borderLeft: isEmpty
          ? '3px solid var(--gris-borde)'       // vacío → gris discreto
          : '3px solid var(--azul)',             // lleno → azul institucional
        transition: 'border-color .15s',
      }}
    >
      <label className="prf-datacard-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ color: isEmpty ? 'var(--gris-texto)' : 'var(--azul)', opacity: .8, display: 'flex' }}>{icon}</span>
        {label}
      </label>
      <div
        className={`prf-datacard-value${full ? ' prf-datacard-value--bio' : ''}`}
        style={isEmpty ? { background: 'var(--fondo)', borderColor: 'var(--gris-borde)' } : { background: '#f0f8ff', borderColor: 'var(--azul-mid)' }}
      >
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

      <div className="prf-datacard-divider" />

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
