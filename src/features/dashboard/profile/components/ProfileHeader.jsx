import { useEffect, useRef, useState } from 'react';
import '../styles/profile.css';
import ConfirmModal from '../../../../shared/ui/ConfirmModal';
import { useLanguage } from '../../../../core/i18n';
import {
  DashboardCheckIcon,
  DashboardCloseIcon,
  DashboardDeleteIcon,
  DashboardEditIcon,
  DashboardUploadIcon,
  DashboardWarningIcon,
} from '../../layout/DashboardIcons';

/* ══════════════════════════════════════════════
   MODAL: Subir imagen (banner o avatar)
══════════════════════════════════════════════ */
function UploadImageModal({ tipo, onConfirm, onClose }) {
  const { t } = useLanguage();
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [drag,    setDrag]    = useState(false);
  /* NUEVO: panel de confirmación antes de subir */
  const [confirmando, setConfirmando] = useState(false);

  const label = tipo === 'banner' ? t('profile.image.banner') : t('profile.image.avatar');

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setArchivo(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  /* Al pulsar "Guardar X" → abrir panel de confirmación */
  const handleGuardarClick = () => {
    if (archivo) setConfirmando(true);
  };

  /* Al confirmar en el panel → ejecutar el upload real */
  const handleConfirmarSubida = () => {
    setConfirmando(false);
    onConfirm(archivo);
  };

  const limpiar = () => {
    setPreview(null);
    setArchivo(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <>
      <div className="prf-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="prf-modal" style={{ maxWidth: 480 }}>

          <div className="prf-modal-head">
            <div>
              <div className="prf-modal-title">
                {tipo === 'banner' ? t('profile.image.changeBanner') : t('profile.image.changeAvatar')}
              </div>
              <div className="prf-modal-sub">
                {t('profile.image.uploadInfo')}
              </div>
            </div>
            <button className="prf-modal-close" onClick={onClose}>
              <DashboardCloseIcon />
            </button>
          </div>

          <div className="prf-modal-body" style={{ padding: "20px 22px" }}>
            <div
              className={`prf-upload-zone${drag ? " drag" : ""}${preview ? " has-preview" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={handleDrop}
              onClick={() => !preview && inputRef.current?.click()}
            >
              {preview ? (
                <div className="prf-upload-preview-wrap">
                  <img src={preview} alt={t('profile.image.previewAlt')}
                    className={`prf-upload-preview${tipo === "avatar" ? " round" : ""}`} />
                  <button className="prf-upload-remove"
                    onClick={(e) => { e.stopPropagation(); limpiar(); }} title={t('profile.image.removePreview')}>
                    <DashboardCloseIcon />
                  </button>
                </div>
              ) : (
                <div className="prf-upload-placeholder">
                  <div className="prf-upload-icon">
                    <DashboardUploadIcon />
                  </div>
                  <div className="prf-upload-text">{t('profile.image.dropHere')}</div>
                  <div className="prf-upload-subtext">{t('profile.image.clickSelect')}</div>
                </div>
              )}
            </div>

            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
              className="d-none" onChange={(e) => handleFile(e.target.files?.[0])} />

            {preview && (
              <button className="prf-btn-outline" style={{ marginTop: 12, fontSize: 12 }}
                onClick={() => inputRef.current?.click()}>
                <DashboardEditIcon />
                {t('profile.image.chooseAnother')}
              </button>
            )}
          </div>

          <div className="prf-modal-foot">
            <button className="prf-btn-cancel" onClick={onClose}>{t('profile.action.cancel')}</button>
            <button className="prf-btn-save" onClick={handleGuardarClick} disabled={!archivo}>
              <DashboardCheckIcon />{t('profile.image.saveLabel', { label })}
            </button>
          </div>
        </div>
      </div>

      {/* Panel de confirmación antes de subir imagen */}
      <ConfirmModal
        open={!!confirmando}
        title={tipo === 'banner' ? t('profile.image.saveBannerTitle') : t('profile.image.saveAvatarTitle')}
        message={tipo === 'banner' ? t('profile.image.saveBannerMessage') : t('profile.image.saveAvatarMessage')}
        confirmLabel={t('profile.image.confirmSave')}
        variant="blue"
        icon="check"
        onConfirm={handleConfirmarSubida}
        onClose={() => setConfirmando(false)}
      />
    </>
  );
}

/* ══════════════════════════════════════════════
   MODAL: Confirmar eliminación (sin cambios)
══════════════════════════════════════════════ */
function ConfirmDeleteModal({ tipo, onConfirm, onClose }) {
  const { t } = useLanguage();
  return (
    <div className="prf-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="prf-modal" style={{ maxWidth: 400 }}>
        <div className="prf-modal-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--rojo-bg)', border: '1.5px solid var(--rojo-borde)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <DashboardWarningIcon />
            </div>
            <div>
              <div className="prf-modal-title">{tipo === 'banner' ? t('profile.image.deleteBannerTitle') : t('profile.image.deleteAvatarTitle')}</div>
              <div className="prf-modal-sub">{t('profile.image.deleteSubtitle')}</div>
            </div>
          </div>
          <button className="prf-modal-close" onClick={onClose}>
            <DashboardCloseIcon />
          </button>
        </div>
        <div className="prf-modal-body" style={{ padding: '18px 22px' }}>
          <p style={{ fontSize: 13, color: 'var(--gris-oscuro)', lineHeight: 1.6, margin: 0 }}>
            {tipo === 'banner' ? t('profile.image.deleteBannerMessage') : t('profile.image.deleteAvatarMessage')}
          </p>
        </div>
        <div className="prf-modal-foot">
          <button className="prf-btn-cancel" onClick={onClose}>{t('profile.action.cancel')}</button>
          <button className="prf-btn-save" style={{ background: 'var(--rojo-soft)' }} onClick={onConfirm}>
            <DashboardDeleteIcon />{t('profile.image.confirmDelete')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   PROFILE HEADER (sin cambios en la estructura)
══════════════════════════════════════════════ */
export default function ProfileHeader({ perfil, onSubirBanner, onEliminarBanner, onSubirAvatar, onEliminarAvatar }) {
  const { t } = useLanguage();
  const iniciales = perfil.nombre.split(' ').slice(0, 2).map(n => n[0]).join('');
  const [modal,    setModal]    = useState(null);
  const [bannerUrl, setBannerUrl] = useState(perfil.bannerUrl);

  useEffect(() => {
    setBannerUrl(perfil.bannerUrl);
    if (!perfil.bannerUrl || !perfil.bannerOriginalUrl || perfil.bannerUrl === perfil.bannerOriginalUrl) return undefined;

    const image = new Image();
    image.src = perfil.bannerUrl;
    image.onerror = () => setBannerUrl(perfil.bannerOriginalUrl);

    return () => {
      image.onerror = null;
    };
  }, [perfil.bannerUrl, perfil.bannerOriginalUrl]);

  const handleSubir = (tipo, archivo) => {
    const fn = tipo === 'banner' ? onSubirBanner : onSubirAvatar;
    if (!fn) return;
    setModal(null);
    fn(archivo).catch(() => {});
  };

  const handleEliminar = (tipo) => {
    const fn = tipo === 'banner' ? onEliminarBanner : onEliminarAvatar;
    if (!fn) return;
    setModal(null);
    fn().catch(() => {});
  };

  return (
    <>
      <div className="prf-header">

        <div className={`prf-banner${bannerUrl ? ' has-img' : ''}`}
          style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : undefined}>
          <div className="prf-img-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button className="prf-avatar-btn" style={{ position: 'static', transform: 'none', margin: 0 }}
              title={t('profile.image.changeBanner')} onClick={() => setModal({ tipo: 'upload-banner' })}>
              <DashboardEditIcon />
            </button>
            {perfil.bannerUrl && (
              <button className="prf-avatar-delete-btn" style={{ position: 'static', transform: 'none', margin: 0 }}
                title={t('profile.image.deleteBannerTitle')} onClick={() => setModal({ tipo: 'delete-banner' })}>
                <DashboardDeleteIcon />
              </button>
            )}
          </div>
        </div>

        <div className="prf-avatar-zone">
          <div className="prf-avatar">
            {perfil.avatarUrl
              ? <img src={perfil.avatarUrl} alt={perfil.nombre && `${perfil.nombre} ${perfil.apellido}`} />
              : iniciales}
          </div>
          <button className="prf-avatar-btn" title={t('profile.image.changeAvatar')}
            onClick={() => setModal({ tipo: 'upload-avatar' })}>
            <DashboardEditIcon />
          </button>
          {perfil.avatarUrl && (
            <button className="prf-avatar-delete-btn" title={t('profile.image.deleteAvatarTitle')}
              onClick={() => setModal({ tipo: 'delete-avatar' })}>
              <DashboardDeleteIcon />
            </button>
          )}
        </div>

        <div className="prf-info-row prf-info-row--compact">
          <div className="prf-info">
            <div className="prf-nombre">{perfil.nombre && `${perfil.nombre} ${perfil.apellido}`}</div>
          </div>
        </div>
      </div>

      {modal?.tipo === 'upload-banner' && (
        <UploadImageModal tipo="banner"
          onConfirm={(a) => handleSubir('banner', a)}
          onClose={() => setModal(null)} />
      )}
      {modal?.tipo === 'upload-avatar' && (
        <UploadImageModal tipo="avatar"
          onConfirm={(a) => handleSubir('avatar', a)}
          onClose={() => setModal(null)} />
      )}
      {modal?.tipo === 'delete-banner' && (
        <ConfirmDeleteModal tipo="banner"
          onConfirm={() => handleEliminar('banner')}
          onClose={() => setModal(null)} />
      )}
      {modal?.tipo === 'delete-avatar' && (
        <ConfirmDeleteModal tipo="avatar"
          onConfirm={() => handleEliminar('avatar')}
          onClose={() => setModal(null)} />
      )}
    </>
  );
}
