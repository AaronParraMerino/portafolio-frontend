import React from 'react';

export default function ExperienceToast({ toast }) {
  if (!toast) return null;

  return (
    <div 
      className={`prf-toast ${toast.tipo === 'error' ? 'error' : 'ok'}`} 
      style={{ 
        position: 'fixed', 
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        width: 'auto',
        minWidth: '280px',
        maxWidth: '90vw',
        wordBreak: 'break-word',
        overflowWrap: 'anywhere',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        borderRadius: '50px',
        backgroundColor: toast.tipo === 'error' ? 'var(--rojo-chip)' : 'var(--verde-chip)',
        border: `2px solid ${toast.tipo === 'error' ? 'var(--rojo-soft)' : 'var(--verde)'}`,
        color: toast.tipo === 'error' ? 'var(--rojo-mid)' : 'var(--verde-hover)',
        fontFamily: 'var(--font)',
        animation: 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '1.2rem' }}>
          {toast.tipo === 'error' ? '⚠️' : '✅'}
        </span>
        <span style={{ fontWeight: '700', fontSize: '14px' }}>
          {toast.msg}
        </span>
      </span>

      <style>{`
        @keyframes popIn {
          from { transform: translate(-50%, 20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}


