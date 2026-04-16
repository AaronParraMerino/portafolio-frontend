import { useRef, useState } from 'react';
import '../styles/profile.css';
import ConfirmModal from './ConfirmModal';

/* ══════════════════════════════════════════════
   MODAL: Subir imagen (banner o avatar)
══════════════════════════════════════════════ */
function UploadImageModal({ tipo, onConfirm, onClose, cargando }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [drag,    setDrag]    = useState(false);
  /* NUEVO: panel de confirmación antes de subir */
  const [confirmando, setConfirmando] = useState(false);

  const label = tipo === 'banner' ? 'Banner' : 'Foto de perfil';

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
                {tipo === 'banner' ? 'Cambiar banner' : 'Cambiar foto de perfil'}
              </div>
              <div className="prf-modal-sub">
                Seleccioná o arrastrá una imagen. JPG, PNG o JPEG — máx. 5 MB.
              </div>
            </div>
            <button className="prf-modal-close" onClick={onClose} disabled={cargando}>
              <svg viewBox="0 0 12 12"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" fill="none" strokeWidth="2.2"/></svg>
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
                  <img src={preview} alt="Vista previa"
                    className={`prf-upload-preview${tipo === "avatar" ? " round" : ""}`} />
                  <button className="prf-upload-remove"
                    onClick={(e) => { e.stopPropagation(); limpiar(); }} title="Quitar imagen">
                    <svg viewBox="0 0 12 12"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" fill="none" strokeWidth="2.2"/></svg>
                  </button>
                </div>
              ) : (
                <div className="prf-upload-placeholder">
                  <div className="prf-upload-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <div className="prf-upload-text">Arrastrá una imagen aquí</div>
                  <div className="prf-upload-subtext">o hacé clic para seleccionar</div>
                </div>
              )}
            </div>

            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
              className="d-none" onChange={(e) => handleFile(e.target.files?.[0])} />

            {preview && (
              <button className="prf-btn-outline" style={{ marginTop: 12, fontSize: 12 }}
                onClick={() => inputRef.current?.click()} disabled={cargando}>
                <svg viewBox="0 0 14 14"><path d="M2 11.5V13h1.5l5-5-1.5-1.5-5 5zM12.5 3.5a1 1 0 000-1.4L11.4 1a1 1 0 00-1.4 0L9 2 12 5z"/></svg>
                Elegir otra imagen
              </button>
            )}
          </div>

          <div className="prf-modal-foot">
            <button className="prf-btn-cancel" onClick={onClose} disabled={cargando}>Cancelar</button>
            <button className="prf-btn-save" onClick={handleGuardarClick} disabled={!archivo || cargando}>
              {cargando
                ? <><div className="prf-spinner" style={{ width: 13, height: 13, borderWidth: 2 }} /> Subiendo...</>
                : <><svg viewBox="0 0 12 12"><path d="M1 6l3.5 3.5L11 2" stroke="currentColor" fill="none" strokeWidth="2"/></svg>Guardar {label}</>
              }
            </button>
          </div>
        </div>
      </div>

      {/* Panel de confirmación antes de subir imagen */}
      {confirmando && (
        <ConfirmModal
          title={`¿Guardar ${tipo === "banner" ? "el banner" : "la foto de perfil"}?`}
          message={`Estás por subir una nueva imagen como ${tipo === "banner" ? "banner de tu perfil" : "foto de perfil"}. La imagen anterior se reemplazará.`}
          confirmLabel="Sí, guardar"
          variant="blue"
          icon="check"
          loading={cargando}
          onConfirm={handleConfirmarSubida}
          onClose={() => !cargando && setConfirmando(false)}
        />
      )}
    </>
  );
}

/* ══════════════════════════════════════════════
   MODAL: Confirmar eliminación (sin cambios)
══════════════════════════════════════════════ */
function ConfirmDeleteModal({ tipo, onConfirm, onClose, cargando }) {
  const label = tipo === 'banner' ? 'el banner' : 'la foto de perfil';
  return (
    <div className="prf-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="prf-modal" style={{ maxWidth: 400 }}>
        <div className="prf-modal-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--rojo-bg)', border: '1.5px solid var(--rojo-borde)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--rojo-soft)" strokeWidth="1.8">
                <path d="M8 1.5L14.5 13H1.5L8 1.5z"/>
                <path d="M8 6v3.5"/>
                <circle cx="8" cy="11.5" r=".5" fill="var(--rojo-soft)"/>
              </svg>
            </div>
            <div>
              <div className="prf-modal-title">¿Eliminar {label}?</div>
              <div className="prf-modal-sub">Esta acción no se puede deshacer.</div>
            </div>
          </div>
          <button className="prf-modal-close" onClick={onClose} disabled={cargando}>
            <svg viewBox="0 0 12 12"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" fill="none" strokeWidth="2.2"/></svg>
          </button>
        </div>
        <div className="prf-modal-body" style={{ padding: '18px 22px' }}>
          <p style={{ fontSize: 13, color: 'var(--gris-oscuro)', lineHeight: 1.6, margin: 0 }}>
            Estás por eliminar {label} de tu perfil.
            {tipo === 'banner' ? ' El banner volverá al gradiente por defecto.' : ' Tu foto de perfil se reemplazará por tus iniciales.'}
          </p>
        </div>
        <div className="prf-modal-foot">
          <button className="prf-btn-cancel" onClick={onClose} disabled={cargando}>Cancelar</button>
          <button className="prf-btn-save" style={{ background: 'var(--rojo-soft)' }} onClick={onConfirm} disabled={cargando}>
            {cargando
              ? <><div className="prf-spinner" style={{ width: 13, height: 13, borderWidth: 2 }} /> Eliminando...</>
              : <><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1,3 11,3"/><path d="M4.5 3V1.5h3V3M2 3v7a1.5 1.5 0 001.5 1.5h5A1.5 1.5 0 0010 10V3"/><line x1="4.5" y1="5.5" x2="4.5" y2="9"/><line x1="7.5" y1="5.5" x2="7.5" y2="9"/></svg>Sí, eliminar</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   PROFILE HEADER (sin cambios en la estructura)
══════════════════════════════════════════════ */
export default function ProfileHeader({ perfil, onEditar, onSubirBanner, onEliminarBanner, onSubirAvatar, onEliminarAvatar }) {
  const iniciales = perfil.nombre.split(' ').slice(0, 2).map(n => n[0]).join('');
  const [modal,    setModal]    = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleSubir = async (tipo, archivo) => {
    const fn = tipo === 'banner' ? onSubirBanner : onSubirAvatar;
    if (!fn) return;
    setCargando(true);
    try { await fn(archivo); setModal(null); }
    finally { setCargando(false); }
  };

  const handleEliminar = async (tipo) => {
    const fn = tipo === 'banner' ? onEliminarBanner : onEliminarAvatar;
    if (!fn) return;
    setCargando(true);
    try { await fn(); setModal(null); }
    finally { setCargando(false); }
  };

  return (
    <>
      <div className="prf-header">

        <div className={`prf-banner${perfil.bannerUrl ? ' has-img' : ''}`}
          style={perfil.bannerUrl ? { backgroundImage: `url(${perfil.bannerUrl})` } : undefined}>
          <div className="prf-img-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button className="prf-avatar-btn" style={{ position: 'static', transform: 'none', margin: 0 }}
              title="Cambiar banner" onClick={() => setModal({ tipo: 'upload-banner' })}>
              <svg viewBox="0 0 14 14"><path d="M2 11.5V13h1.5l5-5-1.5-1.5-5 5zM12.5 3.5a1 1 0 000-1.4L11.4 1a1 1 0 00-1.4 0L9 2 12 5z"/></svg>
            </button>
            {perfil.bannerUrl && (
              <button className="prf-avatar-delete-btn" style={{ position: 'static', transform: 'none', margin: 0 }}
                title="Eliminar banner" onClick={() => setModal({ tipo: 'delete-banner' })}>
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <polyline points="1,2.5 11,2.5"/>
                  <path d="M4 2.5V1.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V2.5M2 2.5v7A1.5 1.5 0 003.5 11h5A1.5 1.5 0 0010 9.5v-7"/>
                  <line x1="4.5" y1="5" x2="4.5" y2="9"/>
                  <line x1="7.5" y1="5" x2="7.5" y2="9"/>
                </svg>
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
          <button className="prf-avatar-btn" title="Cambiar foto"
            onClick={() => setModal({ tipo: 'upload-avatar' })}>
            <svg viewBox="0 0 14 14"><path d="M2 11.5V13h1.5l5-5-1.5-1.5-5 5zM12.5 3.5a1 1 0 000-1.4L11.4 1a1 1 0 00-1.4 0L9 2 12 5z"/></svg>
          </button>
          {perfil.avatarUrl && (
            <button className="prf-avatar-delete-btn" title="Eliminar foto de perfil"
              onClick={() => setModal({ tipo: 'delete-avatar' })}>
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
                <polyline points="1,2.5 11,2.5"/>
                <path d="M4 2.5V1.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V2.5M2 2.5v7A1.5 1.5 0 003.5 11h5A1.5 1.5 0 0010 9.5v-7"/>
                <line x1="4.5" y1="5" x2="4.5" y2="9"/>
                <line x1="7.5" y1="5" x2="7.5" y2="9"/>
              </svg>
            </button>
          )}
        </div>

        <div className="prf-info-row">
          <div className="prf-info">
            <div className="prf-nombre">{perfil.nombre && `${perfil.nombre} ${perfil.apellido}`}</div>
          </div>
          <div className="prf-acciones">
            <button className="prf-btn-primary" onClick={onEditar}>
              <svg viewBox="0 0 14 14"><path d="M2 11.5V13h1.5l5-5-1.5-1.5-5 5zM12.5 3.5a1 1 0 000-1.4L11.4 1a1 1 0 00-1.4 0L9 2 12 5z"/></svg>
              Editar perfil
            </button>
          </div>
        </div>
      </div>

      {modal?.tipo === 'upload-banner' && (
        <UploadImageModal tipo="banner" cargando={cargando}
          onConfirm={(a) => handleSubir('banner', a)}
          onClose={() => !cargando && setModal(null)} />
      )}
      {modal?.tipo === 'upload-avatar' && (
        <UploadImageModal tipo="avatar" cargando={cargando}
          onConfirm={(a) => handleSubir('avatar', a)}
          onClose={() => !cargando && setModal(null)} />
      )}
      {modal?.tipo === 'delete-banner' && (
        <ConfirmDeleteModal tipo="banner" cargando={cargando}
          onConfirm={() => handleEliminar('banner')}
          onClose={() => !cargando && setModal(null)} />
      )}
      {modal?.tipo === 'delete-avatar' && (
        <ConfirmDeleteModal tipo="avatar" cargando={cargando}
          onConfirm={() => handleEliminar('avatar')}
          onClose={() => !cargando && setModal(null)} />
      )}
    </>
  );
}