import { useState } from 'react';
import '../styles/profile.css';
import { useLanguage } from '../../../../core/i18n';
import ConfirmModal from '../../../../shared/ui/ConfirmModal';
import {
  DashboardGlobeIcon,
  DashboardHiddenIcon,
  DashboardLocationIcon,
  DashboardMailIcon,
  DashboardPhoneIcon,
  DashboardUserIcon,
  DashboardVisibleIcon,
  DashboardWorkIcon,
} from '../../layout/DashboardIcons';

const ICONS = {
  correo: DashboardMailIcon,
  pais: DashboardGlobeIcon,
  ciudad: DashboardLocationIcon,
  profesion: DashboardWorkIcon,
  telefono: DashboardPhoneIcon,
  biografia: DashboardUserIcon,
};

const CAMPOS = [
  { key: 'correo',    labelKey: 'profile.field.email' },
  { key: 'pais',      labelKey: 'profile.field.country' },
  { key: 'ciudad',    labelKey: 'profile.field.city' },
  { key: 'profesion', labelKey: 'profile.field.profession' },
  { key: 'telefono',  labelKey: 'profile.field.phone' },
  { key: 'biografia', labelKey: 'profile.field.about' },
];

const SIEMPRE_VISIBLE = ['nombre'];

export default function ProfileInfo({ perfil, onToggleVisibilidad }) {
  const { t } = useLanguage();
  /* NUEVO: estado del panel de confirmación de visibilidad */
  const [confirm, setConfirm] = useState(null); // null | { key, label, nextVisible }

  /* En vez de llamar onToggleVisibilidad directo → abrir confirmación */
  const handleToggleClick = (key, label, currentlyVisible) => {
    setConfirm({ key, label, nextVisible: !currentlyVisible });
  };

  /* Al confirmar en el panel */
  const handleConfirmar = () => {
    if (confirm) {
      onToggleVisibilidad(confirm.key);
      setConfirm(null);
    }
  };

  return (
    <>
      <div className="prf-card">
        <div className="prf-card-head">
          <span className="prf-card-title">{t('profile.visibility.title')}</span>
        </div>

        <div className="prf-lista">
          {CAMPOS.map(({ key, labelKey }) => {
            const label = t(labelKey);
            const valor   = perfil[key] || null;
            const visible = perfil.visibilidad?.[key] ?? true;
            const siempre = SIEMPRE_VISIBLE.includes(key);
            const Icon    = ICONS[key];

            return (
              <div key={key} className="prf-fila">
                <div className="prf-fila-left" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: 7,
                    background: 'var(--azul-light)', border: '1px solid var(--azul-mid)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, color: 'var(--azul)',
                  }}>
                    {Icon && <span style={{ width: 14, height: 14, display: 'flex' }}><Icon /></span>}
                  </span>
                  <div>
                    <span className="prf-campo-label">{label}</span>
                    <span className={`prf-campo-valor${!valor ? ' empty' : ''}`}>
                      {valor || t('profile.empty.default')}
                    </span>
                  </div>
                </div>

                <div className="prf-fila-right">
                  {siempre ? (
                    <span className="prf-pill prf-pill-siempre">
                      <DashboardVisibleIcon /> {t('profile.visibility.alwaysVisible')}
                    </span>
                  ) : (
                    <>
                      <span className={`prf-pill ${visible ? 'prf-pill-visible' : 'prf-pill-oculto'}`}>
                        {visible ? <><DashboardVisibleIcon /> {t('profile.visibility.visible')}</> : <><DashboardHiddenIcon /> {t('profile.visibility.hidden')}</>}
                      </span>
                      {/* Toggle → abre panel de confirmación */}
                      <button
                        className={`prf-toggle ${visible ? 'on' : 'off'}`}
                        onClick={() => handleToggleClick(key, label, visible)}
                        title={visible ? t('profile.visibility.hide') : t('profile.visibility.show')}
                        aria-label={visible ? `${t('profile.visibility.hide')} ${label}` : `${t('profile.visibility.show')} ${label}`}
                      >
                        <span className="prf-toggle-thumb" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Panel de confirmación de visibilidad */}
      <ConfirmModal
        open={!!confirm}
        title={confirm?.nextVisible ? t('profile.visibility.makeVisibleTitle', { field: confirm.label }) : t('profile.visibility.hideTitle', { field: confirm?.label || '' })}
        message={
          confirm?.nextVisible
            ? t('profile.visibility.makeVisibleMessage', { field: confirm.label })
            : t('profile.visibility.hideMessage', { field: confirm?.label || '' })
        }
        confirmLabel={confirm?.nextVisible ? t('profile.visibility.confirmShow') : t('profile.visibility.confirmHide')}
        variant="blue"
        icon="check"
        loading={false}
        onConfirm={handleConfirmar}
        onClose={() => setConfirm(null)}
      />
    </>
  );
}
