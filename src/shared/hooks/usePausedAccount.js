import { useEffect, useState } from 'react';
import { getStoredUser, onStoredUserUpdated } from '../utils/authStorage';

function accountIsPaused(user = getStoredUser()) {
  return user?.estado === 'pausado';
}

export default function usePausedAccount() {
  const [paused, setPaused] = useState(accountIsPaused);

  useEffect(() => {
    const refresh = (event) => {
      setPaused(accountIsPaused(event?.detail));
    };

    const unsubscribe = onStoredUserUpdated(refresh);
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  return paused;
}
