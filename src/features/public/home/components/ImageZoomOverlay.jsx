import { useEffect, useRef, useState } from 'react';
import { BsArrowsFullscreen, BsDash, BsPlus, BsX } from 'react-icons/bs';
import { useLanguage } from '../../../../core/i18n';
import './imageZoomOverlay.css';

const MIN_SCALE = 1;
const MAX_SCALE = 6;
const SCALE_STEP = .35;

function clampScale(value) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));
}

function touchDistance(touches) {
  const [first, second] = touches;
  return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
}

export default function ImageZoomOverlay({ src, alt = '', onClose }) {
  const { t } = useLanguage();
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const dialogRef = useRef(null);
  const dragRef = useRef(null);
  const pinchRef = useRef(null);

  useEffect(() => {
    setTransform({ scale: 1, x: 0, y: 0 });
    dragRef.current = null;
    pinchRef.current = null;
  }, [src]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !src) return undefined;

    const handleWheel = (event) => {
      event.preventDefault();
      setTransform((current) => {
        const scale = clampScale(current.scale + (event.deltaY < 0 ? SCALE_STEP : -SCALE_STEP));
        return scale === MIN_SCALE ? { scale, x: 0, y: 0 } : { ...current, scale };
      });
    };

    dialog.addEventListener('wheel', handleWheel, { passive: false });
    return () => dialog.removeEventListener('wheel', handleWheel);
  }, [src]);

  if (!src) return null;

  const setScale = (nextScale) => {
    setTransform((current) => {
      const scale = clampScale(nextScale);
      return scale === MIN_SCALE ? { scale, x: 0, y: 0 } : { ...current, scale };
    });
  };

  const reset = () => setTransform({ scale: 1, x: 0, y: 0 });

  const handlePointerDown = (event) => {
    if (event.pointerType === 'touch' || transform.scale <= 1 || event.target.closest?.('button')) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: transform.x,
      originY: transform.y,
    };
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    setTransform((current) => ({
      ...current,
      x: drag.originX + event.clientX - drag.startX,
      y: drag.originY + event.clientY - drag.startY,
    }));
  };

  const handleTouchStart = (event) => {
    if (event.touches.length === 2) {
      pinchRef.current = {
        distance: touchDistance(event.touches),
        scale: transform.scale,
      };
      dragRef.current = null;
      return;
    }

    if (event.touches.length === 1 && transform.scale > 1) {
      dragRef.current = {
        startX: event.touches[0].clientX,
        startY: event.touches[0].clientY,
        originX: transform.x,
        originY: transform.y,
      };
    }
  };

  const handleTouchMove = (event) => {
    const pinch = pinchRef.current;

    if (event.touches.length === 2 && pinch) {
      const distance = touchDistance(event.touches);
      setScale(pinch.scale * (distance / pinch.distance));
      return;
    }

    const drag = dragRef.current;
    const touch = event.touches[0];

    if (event.touches.length === 1 && drag && touch && transform.scale > 1) {
      const nextX = drag.originX + touch.clientX - drag.startX;
      const nextY = drag.originY + touch.clientY - drag.startY;

      setTransform((current) => ({
        ...current,
        x: nextX,
        y: nextY,
      }));
    }
  };

  const handleTouchEnd = (event) => {
    pinchRef.current = null;

    if (event.touches.length === 1 && transform.scale > 1) {
      dragRef.current = {
        startX: event.touches[0].clientX,
        startY: event.touches[0].clientY,
        originX: transform.x,
        originY: transform.y,
      };
      return;
    }

    dragRef.current = null;
  };

  return (
    <div
      className="izo-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        event.stopPropagation();
        onClose?.();
      }}
    >
      <div
        ref={dialogRef}
        className={`izo-dialog${transform.scale > 1 ? ' is-zoomed' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={`Imagen ampliada: ${alt}`}
        onMouseDown={(event) => event.stopPropagation()}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={() => { dragRef.current = null; }}
        onPointerCancel={() => { dragRef.current = null; }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onDoubleClick={reset}
      >
        <div className="izo-controls">
          <button type="button" onClick={() => setScale(transform.scale - SCALE_STEP)} aria-label={t('imageZoom.zoomOut')}><BsDash /></button>
          <span>{Math.round(transform.scale * 100)}%</span>
          <button type="button" onClick={() => setScale(transform.scale + SCALE_STEP)} aria-label={t('imageZoom.zoomIn')}><BsPlus /></button>
          <button type="button" onClick={reset} aria-label={t('imageZoom.reset')}><BsArrowsFullscreen /></button>
        </div>
        <button type="button" className="izo-close" onClick={onClose} aria-label={t('imageZoom.close')}>
          <BsX />
        </button>
        <img
          src={src}
          alt={alt}
          draggable="false"
          style={{ transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})` }}
        />
      </div>
    </div>
  );
}
