import { useProfile }        from '../hooks/useProfile';
import ProfileHeader          from '../components/ProfileHeader';
import ProfileInfo            from '../components/ProfileInfo';
import ProfileEdit            from '../components/ProfileEdit';
import ProfileCompletitud     from '../components/ProfileCompletitud';
import ProfileToast           from '../components/ProfileToast';
import '../styles/profile.css';

export default function ProfilePage() {
  const {
    perfil, loading, guardando, editando,
    setEditando, guardarPerfil, toggleVisibilidad, toast,
  } = useProfile();

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="prf-loading">
        <span className="prf-spinner" />
        <span>Cargando perfil...</span>
      </div>
    );
  }

  /* ── Error ── */
  if (!perfil) {
    return (
      <div className="prf-error">
        No se pudo cargar el perfil.
      </div>
    );
  }

  return (
    <div className="prf-page">

      {/* ── Header: banner + avatar + nombre + stats ── */}
      <ProfileHeader
        perfil={perfil}
        onEditar={() => setEditando(true)}
        onVistaPublica={() => window.open(`/u/${perfil.id}`, '_blank')}
      />

      {/* ── Grid principal ── */}
      <div className="prf-grid">

        {/* Columna izquierda: datos + visibilidad */}
        <div>
          <ProfileInfo
            perfil={perfil}
            onToggleVisibilidad={toggleVisibilidad}
          />
        </div>

        {/* Columna derecha: sidebar cards */}
        <div>
          <ProfileCompletitud perfil={perfil} />
        </div>

      </div>

      {/* ── Modal de edición (se abre encima, no reemplaza nada) ── */}
      {editando && (
        <ProfileEdit
          perfil={perfil}
          onGuardar={(data) => {
            guardarPerfil(data);
          }}
          onCancelar={() => setEditando(false)}
          guardando={guardando}
        />
      )}

      {/* ── Toast ── */}
      <ProfileToast toast={toast} />

    </div>
  );
}