import '../styles/profile.css';
import { useLanguage } from '../../../../core/i18n';

// Íconos por campo — dan identidad visual sin emojis
const IconMail = () => (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 13, height: 13, flexShrink: 0 }}>
    <rect x="1" y="3" width="12" height="8" rx="1.5"/>
    <path d="M1 3l6 5 6-5"/>
  </svg>
);
const IconGlobe = () => (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 13, height: 13, flexShrink: 0 }}>
    <circle cx="7" cy="7" r="5.5"/>
    <path d="M7 1.5c-2 2-2 9 0 11M7 1.5c2 2 2 9 0 11M1.5 7h11"/>
  </svg>
);
const IconPin = () => (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 13, height: 13, flexShrink: 0 }}>
    <path d="M7 1C4.8 1 3 2.8 3 5c0 3 4 8 4 8s4-5 4-8c0-2.2-1.8-4-4-4z"/>
    <circle cx="7" cy="5" r="1.3"/>
  </svg>
);
const IconBriefcase = () => (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 13, height: 13, flexShrink: 0 }}>
    <rect x="1" y="4.5" width="12" height="8" rx="1.5"/>
    <path d="M5 4.5V3a1 1 0 011-1h2a1 1 0 011 1v1.5"/>
    <line x1="1" y1="8" x2="13" y2="8"/>
  </svg>
);
const IconPhone = () => (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 13, height: 13, flexShrink: 0 }}>
    <path d="M2 2.5A1.5 1.5 0 013.5 1h.5a1 1 0 011 1v2a1 1 0 01-1 1H3C3 9 5 11 8.5 11v-1a1 1 0 011-1h2a1 1 0 011 1v.5A1.5 1.5 0 0111 13C6 13 1 8 1 3V2.5z"/>
  </svg>
);
const IconUser = () => (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 13, height: 13, flexShrink: 0 }}>
    <circle cx="7" cy="4.5" r="2.5"/>
    <path d="M1.5 13c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/>
  </svg>
);

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

export default function ProfileDataCard({ perfil, onEditar }) {
  const { t } = useLanguage();
  const empty = (key = 'profile.empty.default') => <span className="prf-datacard-empty">{t(key)}</span>;

  return (
    <div className="prf-datacard">

      <div className="prf-card-head">
        <span className="prf-card-title">{t('profile.data.title')}</span>
      </div>

      <div className="prf-datacard-divider" />

      <div className="prf-datacard-fields">

        <Campo label={t('profile.field.email')} icon={<IconMail />} isEmpty={!perfil.correo}>
          {perfil.correo || empty()}
        </Campo>

        <Campo label={t('profile.field.country')} icon={<IconGlobe />} isEmpty={!perfil.pais}>
          {perfil.pais || empty('profile.empty.dash')}
        </Campo>

        <Campo label={t('profile.field.city')} icon={<IconPin />} isEmpty={!perfil.ciudad}>
          {perfil.ciudad || empty('profile.empty.dash')}
        </Campo>

        <Campo label={t('profile.field.profession')} icon={<IconBriefcase />} isEmpty={!perfil.profesion}>
          {perfil.profesion || empty()}
        </Campo>

        <Campo label={t('profile.field.phone')} icon={<IconPhone />} isEmpty={!perfil.telefono}>
          {perfil.telefono || empty()}
        </Campo>

        <Campo label={t('profile.field.about')} icon={<IconUser />} full isEmpty={!perfil.biografia}>
          {perfil.biografia || empty()}
        </Campo>

      </div>
    </div>
  );
}