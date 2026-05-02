import '../styles/projects.css';

/* ════════════════════════════════════════
   ProjectsToast
   src/features/dashboard/projects/components/ProjectsToast.jsx

   Notificación temporal de feedback (ok / error).
   Mismo patrón que ProfileToast.

   Props:
   ─ toast   { msg: string, tipo: 'ok' | 'error' } | null
════════════════════════════════════════ */
export default function ProjectsToast({ toast }) {
  if (!toast?.msg) return null;

  const tipo = toast.tipo === 'error' ? 'error' : 'ok';

  return (
    <div
      className={`prj-toast ${tipo}`}
      role={tipo === 'error' ? 'alert' : 'status'}
      aria-live={tipo === 'error' ? 'assertive' : 'polite'}
    >
      {tipo === 'ok' ? (
        <svg viewBox="0 0 14 14">
          <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" fill="none" strokeWidth="2.2" />
        </svg>
      ) : (
        <svg viewBox="0 0 14 14">
          <path d="M7 1L1 12h12L7 1z" stroke="currentColor" fill="none" strokeWidth="2" />
          <path d="M7 5.5v3M7 10v.5" stroke="currentColor" fill="none" strokeWidth="2" />
        </svg>
      )}

      {toast.msg}
    </div>
  );
}