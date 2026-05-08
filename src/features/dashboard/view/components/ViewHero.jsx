// src/features/dashboard/view/components/ViewHero.jsx

import { getInitial } from '../model/viewModel';

function resolveImage(primary, fallback) {
  return primary || fallback || null;
}

export default function ViewHero({ perfil, config }) {
  const bannerUrl = resolveImage(perfil?.bannerUrl, perfil?.foto_fondo);
  const avatarUrl = resolveImage(perfil?.avatarUrl, perfil?.foto_perfil);
  const useHeroPhoto = config?.heroBgSource === 'foto' && bannerUrl;
  const useAvatarPhoto = config?.avatarBgSource === 'foto' && avatarUrl;

  return (
    <div className={`pf-hero pattern-${config?.heroPattern || 'dots'}`}>
      <div
        className="pf-hero-bg"
        style={useHeroPhoto
          ? {
              backgroundImage: `url(${bannerUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined}
      />

      <div className="pf-hero-pattern" />
      <div className="pf-hero-glow" />

      <div className="pf-hero-banner">
        <div className="pf-avatar">
          {useAvatarPhoto ? (
            <img
              src={avatarUrl}
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
