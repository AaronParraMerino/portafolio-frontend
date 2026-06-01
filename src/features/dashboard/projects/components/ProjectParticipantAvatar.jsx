import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../../../core/i18n';

function getInitials(name = '') {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return '?';

  return parts
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
}

function cleanText(value = '') {
  return String(value || '').trim();
}

function formatRole(value = '') {
  const clean = cleanText(value).replace(/_/g, ' ').replace(/\s+/g, ' ');

  if (!clean) return '';

  return clean === clean.toLowerCase()
    ? clean.replace(/\b\w/g, letter => letter.toUpperCase())
    : clean;
}

function isOwner(participante = {}) {
  return Boolean(
    participante.es_propietario ||
    participante.tipo_rol === 'owner' ||
    participante.github_role === 'owner' ||
    participante.relacion_github === 'owner'
  );
}

function getParticipantName(participante = {}) {
  return cleanText(
    participante.nombre ||
    participante.nombre_completo ||
    participante.nombreCompleto ||
    participante.github_username ||
    participante.login ||
    participante.email ||
    participante.correo ||
    participante.__defaultName || 'Participante'
  );
}

function getParticipantRole(participante = {}) {
  const rawRole =
    participante.rol ||
    participante.role ||
    participante.cargo ||
    participante.titulo_rol ||
    participante.tituloRol ||
    '';
  const rawRoleLabel = participante.rol_label === 'Colaborador' || isOwner(participante)
    ? ''
    : participante.rol_label || '';

  return formatRole(rawRole || rawRoleLabel);
}

function getParticipantContribution(participante = {}) {
  return cleanText(
    participante.descripcion_aporte ||
    participante.descripcionAporte ||
    participante.aporte ||
    ''
  );
}

export default function ProjectParticipantAvatar({ participante = {} }) {
  const { t } = useLanguage();
  const participanteTraducido = { ...participante, __defaultName: t('projects.participation.defaultName') };
  const originalAvatar = participante.avatar_url || '';
  const preferredAvatar = participante.avatar_thumb_url || originalAvatar;
  const [imageFailed, setImageFailed] = useState(false);
  const [imageSource, setImageSource] = useState(preferredAvatar);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const nombre = getParticipantName(participanteTraducido);
  const github = cleanText(participante.github_username || participante.login);
  const owner = isOwner(participanteTraducido);
  const rol = getParticipantRole(participanteTraducido);
  const aporte = getParticipantContribution(participanteTraducido);
  const roleDetail = rol ? ` - ${rol}` : '';
  const githubDetail = github ? ` (@${github})` : '';
  const label = `${nombre}${githubDetail}${roleDetail}`;

  useEffect(() => {
    setImageFailed(false);
    setImageSource(preferredAvatar);
  }, [preferredAvatar]);

  useEffect(() => {
    if (!open) return undefined;

    const handleOutside = (event) => {
      if (!wrapRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className={`prj-collab-avatar-wrap${open ? ' open' : ''}`}
    >
      <button
        type="button"
        className="prj-collab-avatar-btn"
        title={label}
        aria-label={label}
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation();
          setOpen(value => !value);
        }}
      >
        {imageSource && !imageFailed ? (
          <img
            src={imageSource}
            alt=""
            loading="lazy"
            onError={() => {
              if (imageSource !== originalAvatar && originalAvatar) {
                setImageSource(originalAvatar);
                return;
              }

              setImageFailed(true);
            }}
          />
        ) : (
          <span className="prj-collab-initials">{getInitials(nombre)}</span>
        )}
      </button>

      {open && (
        <div
          className="prj-collab-popover"
          role="dialog"
          aria-label={`${t('projects.participation.defaultName')}: ${nombre}`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="prj-collab-popover-head">
            <div className="prj-collab-popover-title">
              <strong>{nombre}</strong>
              {github && <span>@{github}</span>}
            </div>

            {owner && (
              <span className="prj-collab-owner-badge">
                {t('projects.card.owner')}
              </span>
            )}

            <button
              type="button"
              className="prj-collab-popover-close"
              aria-label={t('projects.participation.closeDetails')}
              onClick={(event) => {
                event.stopPropagation();
                setOpen(false);
              }}
            >
              x
            </button>
          </div>

          <div className="prj-collab-popover-info">
            <span>{t('projects.participation.roleLabel')}</span>
            <strong>{rol || '-'}</strong>

            <span>{t('projects.participation.descriptionLabel')}</span>
            <p>{aporte || '-'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
