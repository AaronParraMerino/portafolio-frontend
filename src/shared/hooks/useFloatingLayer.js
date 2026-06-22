import { useCallback, useEffect, useState } from 'react';

const FLOATING_LAYER_EVENT = 'folio:floating-layer-activate';
const BASE_LAYER = 11000;
let layerSequence = BASE_LAYER;

export default function useFloatingLayer(id, open) {
  const [zIndex, setZIndex] = useState(BASE_LAYER);

  const bringToFront = useCallback(() => {
    layerSequence += 1;
    const nextZIndex = layerSequence;

    window.dispatchEvent(new CustomEvent(FLOATING_LAYER_EVENT, {
      detail: { id, zIndex: nextZIndex },
    }));
  }, [id]);

  useEffect(() => {
    const handleActivation = (event) => {
      if (event.detail?.id === id) {
        setZIndex(event.detail.zIndex);
      } else if (open) {
        setZIndex(BASE_LAYER);
      }
    };

    window.addEventListener(FLOATING_LAYER_EVENT, handleActivation);
    return () => window.removeEventListener(FLOATING_LAYER_EVENT, handleActivation);
  }, [id, open]);

  useEffect(() => {
    if (open) bringToFront();
  }, [open, bringToFront]);

  return { zIndex, bringToFront };
}
