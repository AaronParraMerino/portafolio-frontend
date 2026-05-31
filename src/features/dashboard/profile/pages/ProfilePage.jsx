import { useProfile }        from '../hooks/useProfile';
import ProfileHeader          from '../components/ProfileHeader';
import ProfileDataCard        from '../components/ProfileDataCard';
import ProfileInfo            from '../components/ProfileInfo';
import ProfileEdit            from '../components/ProfileEdit';
import ProfileCompletitud     from '../components/ProfileCompletitud';
import ProfileToast           from '../components/ProfileToast';
import Header                 from '../../layout/Header';
import '../styles/profile.css';
import { useLanguage } from '../../../../core/i18n';

export default function ProfilePage() {
  const { t } = useLanguage();
  const { perfil, loading, guardando, editando, setEditando, guardarPerfil, toggleVisibilidad, toast, subirImagen, eliminarImagen } = useProfile();

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
      <Header eyebrow={t('profile.header.eyebrow')} title={t('profile.header.title')} />

      <div className="prf-page">

      {/* ── Header: banner + avatar + stats strip ── */}
      <ProfileHeader
        perfil={perfil}
        onEditar={() => setEditando(true)}
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
        onEditar={() => setEditando(true)}
      />

      {/* ── Grid principal ── */}
      <div className="prf-grid">

        {/* Columna izquierda: visibilidad de campos */}
        <div>
          <ProfileInfo
            perfil={perfil}
            onToggleVisibilidad={toggleVisibilidad}
          />
        </div>

        {/* Columna derecha: completitud */}
        <div>
          <ProfileCompletitud perfil={perfil} />
        </div>

      </div>

      {/* ── Modal de edición ── */}
      {editando && (
        <ProfileEdit
          perfil={perfil}
          onGuardar={(data) => guardarPerfil(data)}
          onCancelar={() => setEditando(false)}
          guardando={guardando}
        />
      )}

      {/* ── Toast ── */}
      <ProfileToast toast={toast} />

      </div>
    </>
  );
}
