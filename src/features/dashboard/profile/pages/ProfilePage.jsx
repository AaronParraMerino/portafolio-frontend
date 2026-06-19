import { useProfile }        from '../hooks/useProfile';
import ProfileHeader          from '../components/ProfileHeader';
import ProfileDataCard        from '../components/ProfileDataCard';
import ProfileEdit            from '../components/ProfileEdit';
import ProfileToast           from '../components/ProfileToast';
import Header                 from '../../layout/Header';
import BackgroundSaveIndicator from '../../../../shared/ui/BackgroundSaveIndicator';
import '../styles/profile.css';
import { useLanguage } from '../../../../core/i18n';
import { DashboardEditIcon } from '../../layout/DashboardIcons';

export default function ProfilePage() {
  const { t } = useLanguage();
  const { perfil, loading, guardando, editando, setEditando, guardarPerfil, toast, subirImagen, eliminarImagen } = useProfile();

  if (loading) {
    return (
      <>
        <Header eyebrow={t('profile.header.eyebrow')} title={t('profile.header.title')} />
        <div className="prf-page">
          <div className="dash-loading">
            <span className="dash-loading-spinner" />
            <span>{t('profile.loading')}</span>
          </div>
        </div>
      </>
    );
  }

  if (!perfil) {
    return (
      <>
        <Header eyebrow={t('profile.header.eyebrow')} title={t('profile.header.title')} />
        <div className="prf-page">
          <div className="prf-error">
            {t('profile.error.load')}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        eyebrow={t('profile.header.eyebrow')}
        title={t('profile.header.title')}
        actions={[
          {
            key: 'edit-profile',
            label: t('profile.action.edit'),
            icon: <DashboardEditIcon />,
            onClick: () => {
              if (!guardando) setEditando(true);
            },
          },
        ]}
      />

      <div className="prf-page">

      {/* ── Header: banner + avatar + stats strip ── */}
      <ProfileHeader
        perfil={perfil}
        onVistaPublica={() => window.open(`/u/${perfil.id}`, '_blank')}
        onSubirAvatar={(archivo) => subirImagen('avatar', archivo)}
        onEliminarAvatar={() => eliminarImagen('avatar')}
        onSubirBanner={(archivo) => subirImagen('banner', archivo)}
        onEliminarBanner={() => eliminarImagen('banner')}
      />

      {/* ── Nombre + profesión + datos de contacto ──
           Aparece directamente debajo del header,
           fuera del grid para que ocupe todo el ancho */}
      <ProfileDataCard
        perfil={perfil}
      />

      {/* ── Grid principal ── */}
      {/* ── Modal de edición ── */}
      {editando && (
        <ProfileEdit
          perfil={perfil}
          onGuardar={(data) => {
            setEditando(false);
            guardarPerfil(data);
          }}
          onCancelar={() => setEditando(false)}
          guardando={false}
        />
      )}

      {/* ── Toast ── */}
      <ProfileToast toast={toast} />
      <BackgroundSaveIndicator active={guardando} label={t('profile.action.saving')} />

      </div>
    </>
  );
}
