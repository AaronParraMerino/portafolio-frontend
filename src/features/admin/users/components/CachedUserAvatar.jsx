import { useEffect, useState } from 'react';
import { getCachedUserAvatarUrl } from '../services/userAvatarCache';
import { getUserAvatarPalette, getUserInitials } from '../services/usersService';

export default function CachedUserAvatar({ user, className = 'usr-user-avatar' }) {
  const [source, setSource] = useState(null);
  const [failed, setFailed] = useState(false);
  const avatarUrl = user?.fotoPerfilThumbUrl || '';
  const palette = getUserAvatarPalette(user?.id || user?.email || user?.nombre);

  useEffect(() => {
    let active = true;
    setFailed(false);
    setSource(null);

    if (!avatarUrl) return undefined;

    getCachedUserAvatarUrl(avatarUrl).then((resolvedUrl) => {
      if (active) setSource(resolvedUrl);
    });

    return () => {
      active = false;
    };
  }, [avatarUrl]);

  return (
    <div
      className={className}
      style={{
        background: palette.background,
        color: palette.color,
      }}
    >
      {source && !failed ? (
        <img
          src={source}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : getUserInitials(user?.nombre)}
    </div>
  );
}
