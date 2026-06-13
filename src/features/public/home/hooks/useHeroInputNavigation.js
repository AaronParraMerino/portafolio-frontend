import { useCallback, useEffect, useRef } from 'react';

const WHEEL_LOCK_MS = 320;
const INTERACTIVE_SELECTOR = 'a, button, input, select, textarea, [contenteditable="true"]';

export default function useHeroInputNavigation({ enabled, onMove }) {
  const wheelLocked = useRef(false);
  const wheelTimer = useRef(null);

  useEffect(() => () => {
    window.clearTimeout(wheelTimer.current);
  }, []);

  const onKeyDown = useCallback((event) => {
    if (!enabled || event.target.closest?.(INTERACTIVE_SELECTOR)) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

    event.preventDefault();
    onMove(event.key === 'ArrowLeft' ? -1 : 1);
  }, [enabled, onMove]);

  const onWheel = useCallback((event) => {
    if (!enabled || !event.shiftKey || wheelLocked.current) return;

    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX
      : event.deltaY;

    if (!delta) return;

    event.preventDefault();
    wheelLocked.current = true;
    onMove(delta > 0 ? 1 : -1);

    window.clearTimeout(wheelTimer.current);
    wheelTimer.current = window.setTimeout(() => {
      wheelLocked.current = false;
    }, WHEEL_LOCK_MS);
  }, [enabled, onMove]);

  return {
    onKeyDown,
    onWheel,
    tabIndex: enabled ? 0 : undefined,
  };
}
