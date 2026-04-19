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
  if (!toast) return null;

  return (
    <div className={`prj-toast ${toast.tipo}`} role="status" aria-live="polite">
      {toast.tipo === 'ok' ? (
        <svg viewBox="0 0 14 14">
          <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" fill="none" strokeWidth="2.2"/>
        </svg>
      ) : (
        <svg viewBox="0 0 14 14">
          <path d="M7 1L1 12h12L7 1z" stroke="currentColor" fill="none" strokeWidth="2"/>
          <path d="M7 5.5v3M7 10v.5" stroke="currentColor" fill="none" strokeWidth="2"/>
        </svg>
      )}
      {toast.msg}
    </div>
  );
}