// src/features/dashboard/view/components/ViewHero.jsx

import { getInitial } from '../model/viewModel';

export default function ViewHero({ perfil, config }) {
  const useHeroPhoto = config?.heroBgSource === 'foto' && perfil?.bannerUrl;
  const useAvatarPhoto = config?.avatarBgSource === 'foto' && perfil?.avatarUrl;

  return (
    <div className={`pf-hero pattern-${config?.heroPattern || 'dots'}`}>
      <div
        className="pf-hero-bg"
        style={useHeroPhoto
          ? {
              backgroundImage: `url(${perfil.bannerUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined}
      />

      <div className="pf-hero-pattern" />
      <div className="pf-hero-glow" />

      <div className="pf-hero-banner">
        {config?.disponible && (
          <div className="pf-available">
            Disponible para proyectos
          </div>
        )}

        <div className="pf-avatar">
          {useAvatarPhoto ? (
            <img
              src={perfil.avatarUrl}
              alt="Foto de perfil"
              className="pf-avatar-img"
            />
          ) : (
            getInitial(perfil)
          )}
        </div>
      </div>
    </div>
  );
}