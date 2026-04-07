export default function ExperienceToast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`prf-toast ${toast.tipo === 'error' ? 'error' : 'ok'}`} 
         style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
      <span>{toast.tipo === 'error' ? '⚠️' : '✅'} {toast.msg}</span>
    </div>
  );
}