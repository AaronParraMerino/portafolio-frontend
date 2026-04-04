import '../styles/profile.css';

export default function ProfileToast({ toast }) {
  if (!toast) return null;

  return (
    <div className={`prf-toast ${toast.tipo === 'error' ? 'error' : 'ok'}`}>
      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2">
        {toast.tipo === 'error'
          ? <path d="M2 2l10 10M12 2L2 12"/>
          : <path d="M2 7l3.5 3.5L12 3"/>
        }
      </svg>
      {toast.msg}
    </div>
  );
}