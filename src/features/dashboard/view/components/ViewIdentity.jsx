// src/features/dashboard/view/components/ViewIdentity.jsx

import { getFullName, isVisible } from '../model/viewModel';
import { useLanguage } from '../../../../core/i18n';
import {
  getLinkPlatform,
  LinkPlatformIcon,
} from '../../Links/model/linkPlatforms';

function IconLocation() {
  return (
    <svg viewBox="0 0 14 14">
      <path d="M7 1C4.8 1 3 2.8 3 5c0 3.3 4 8 4 8s4-4.7 4-8c0-2.2-1.8-4-4-4z" />
      <circle cx="7" cy="5" r="1.4" fill="currentColor" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg viewBox="0 0 14 14">
      <path d="M10.5 9c-.5.5-1 1-1.5 1C7 10 4 7 4 5c0-.5.5-1 1-1.5L4.5 2 2 2.5C2 8.5 5.5 12 11.5 12L12 9.5l-1.5-.5z" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 14 14">
      <rect x="1" y="3" width="12" height="9" rx="1.5" />
      <path d="M1 4l6 5 6-5" />
    </svg>
  );
}

function SocialIcon({ red }) {
  const platform = getLinkPlatform(red);

  return <LinkPlatformIcon platform={platform} url={red?.url} className="pf-social-platform-icon" />;
}

export default function ViewIdentity({ perfil, redes = [], disponible = false, visibilidad }) {
  const { t } = useLanguage();
  const showNombre = isVisible(visibilidad, 'perfil', 'nombre');
  const showProfesion = isVisible(visibilidad, 'perfil', 'profesion');
  const showUbicacion = isVisible(visibilidad, 'perfil', 'ubicacion');
  const showTelefono = isVisible(visibilidad, 'perfil', 'telefono');
  const showCorreo = isVisible(visibilidad, 'perfil', 'correo');
  const showRedes = isVisible(visibilidad, 'perfil', 'redes');
  const showBiografia = isVisible(visibilidad, 'perfil', 'biografia');

  const ubicacion = [perfil?.ciudad, perfil?.pais].filter(Boolean).join(', ');
  const redesVisibles = redes.filter(red => red?.visible !== false);
  const showContact = (showTelefono && perfil?.telefono) || (showCorreo && perfil?.correo);

  return (
    <div className="pf-identity">
      <div className="pf-identity-header">
        {(showNombre || disponible) && (
          <div className="pf-name-row">
            {showNombre && (
              <div className="pf-name">{getFullName(perfil)}</div>
            )}

            {disponible && (
              <div className="pf-available">
                {t('view.identity.available')}
              </div>
            )}
          </div>
        )}

        {showProfesion && perfil?.profesion && (
          <div className="pf-role">{perfil?.profesion}</div>
        )}

        {showUbicacion && ubicacion && (
          <div className="pf-location">
            <IconLocation />
            <span>{ubicacion}</span>
          </div>
        )}
      </div>

      {(showContact || showRedes || showBiografia) && (
        <div className="pf-identity-divider" />
      )}

      {showContact && (
        <div className="pf-contact-row">
          {showTelefono && perfil?.telefono && (
            <a className="pf-contact-item" href={`tel:${perfil?.telefono || ''}`}>
              <IconPhone />
              {perfil?.telefono}
            </a>
          )}

          {showCorreo && perfil?.correo && (
            <a className="pf-contact-item" href={`mailto:${perfil?.correo || ''}`}>
              <IconMail />
              {perfil?.correo}
            </a>
          )}
        </div>
      )}

      {showRedes && !!redesVisibles.length && (
        <div className="pf-social">
          {redesVisibles.map(red => (
            <a
              key={red.id}
              className={`pf-soc-btn soc-${red.tipo}`}
              href={red.href}
              target="_blank"
              rel="noreferrer"
            >
              <div className="pf-soc-btn-top">
                <SocialIcon red={red} />
                <span className="pf-soc-name">{red.nombre}</span>
              </div>

              <span className="pf-soc-url">{red.url}</span>
            </a>
          ))}
        </div>
      )}

      {showBiografia && perfil?.biografia && (
        <div className="pf-about-inline">
          <div className="pf-about-label">{t('view.identity.about')}</div>
          <p className="pf-about-text">{perfil?.biografia}</p>
        </div>
      )}
    </div>
  );
}
