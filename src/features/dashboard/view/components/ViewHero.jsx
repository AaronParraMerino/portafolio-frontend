// src/features/dashboard/view/components/ViewHero.jsx

import { useEffect, useState } from 'react';
import { getInitial } from '../model/viewModel';
import { useLanguage } from '../../../../core/i18n';

function resolveImage(primary, fallback) {
  return primary || fallback || null;
}

export default function ViewHero({ perfil, config }) {
  const { t } = useLanguage();
  const preferredBannerUrl = resolveImage(perfil?.bannerUrl, perfil?.foto_fondo);
  const originalBannerUrl = resolveImage(perfil?.bannerOriginalUrl, perfil?.foto_fondo);
  const [bannerUrl, setBannerUrl] = useState(preferredBannerUrl);
  const avatarUrl = resolveImage(perfil?.avatarUrl, perfil?.foto_perfil);
  const useHeroPhoto = config?.heroBgSource === 'foto' && bannerUrl;
  const useAvatarPhoto = config?.avatarBgSource === 'foto' && avatarUrl;

  useEffect(() => {
    setBannerUrl(preferredBannerUrl);
    if (!preferredBannerUrl || preferredBannerUrl === originalBannerUrl) return undefined;

    const image = new Image();
    image.src = preferredBannerUrl;
    image.onerror = () => setBannerUrl(originalBannerUrl);

    return () => {
      image.onerror = null;
    };
  }, [preferredBannerUrl, originalBannerUrl]);

  return (
    <div className={`pf-hero pattern-${config?.heroPattern || 'none'}`}>
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
              alt={t('view.hero.profilePhotoAlt')}
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
