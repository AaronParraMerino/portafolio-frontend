// src/features/dashboard/view/components/ViewIdentity.jsx

import { getFullName, isVisible } from '../model/viewModel';

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

function SocialIcon({ tipo }) {
  if (tipo === 'linkedin') {
    return (
      <svg fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
      </svg>
    );
  }

  if (tipo === 'github') {
    return (
      <svg fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.5 11.5 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.565 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
      </svg>
    );
  }

  if (tipo === 'twitter') {
    return (
      <svg fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.733-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63z" />
      </svg>
    );
  }

  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
    </svg>
  );
}

export default function ViewIdentity({ perfil, redes = [], visibilidad }) {
  const showNombre = isVisible(visibilidad, 'perfil', 'nombre');
  const showProfesion = isVisible(visibilidad, 'perfil', 'profesion');
  const showUbicacion = isVisible(visibilidad, 'perfil', 'ubicacion');
  const showTelefono = isVisible(visibilidad, 'perfil', 'telefono');
  const showCorreo = isVisible(visibilidad, 'perfil', 'correo');
  const showRedes = isVisible(visibilidad, 'perfil', 'redes');
  const showBiografia = isVisible(visibilidad, 'perfil', 'biografia');

  const showContact = showTelefono || showCorreo;

  return (
    <div className="pf-identity">
      <div className="pf-identity-header">
        {showNombre && (
          <div className="pf-name">{getFullName(perfil)}</div>
        )}

        {showProfesion && (
          <div className="pf-role">{perfil?.profesion}</div>
        )}

        {showUbicacion && (
          <div className="pf-location">
            <IconLocation />
            <span>{perfil?.ciudad}, {perfil?.pais}</span>
          </div>
        )}
      </div>

      {(showContact || showRedes || showBiografia) && (
        <div className="pf-identity-divider" />
      )}

      {showContact && (
        <div className="pf-contact-row">
          {showTelefono && (
            <a className="pf-contact-item" href={`tel:${perfil?.telefono || ''}`}>
              <IconPhone />
              {perfil?.telefono}
            </a>
          )}

          {showCorreo && (
            <a className="pf-contact-item" href={`mailto:${perfil?.correo || ''}`}>
              <IconMail />
              {perfil?.correo}
            </a>
          )}
        </div>
      )}

      {showRedes && !!redes.length && (
        <div className="pf-social">
          {redes.map(red => (
            <a
              key={red.id}
              className={`pf-soc-btn soc-${red.tipo}`}
              href={red.href}
              target="_blank"
              rel="noreferrer"
            >
              <div className="pf-soc-btn-top">
                <SocialIcon tipo={red.tipo} />
                <span className="pf-soc-name">{red.nombre}</span>
              </div>

              <span className="pf-soc-url">{red.url}</span>
            </a>
          ))}
        </div>
      )}

      {showBiografia && (
        <div className="pf-about-inline">
          <div className="pf-about-label">Acerca de mí</div>
          <p className="pf-about-text">{perfil?.biografia}</p>
        </div>
      )}
    </div>
  );
}