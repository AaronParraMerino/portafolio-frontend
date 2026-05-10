// src/features/dashboard/view/components/ViewToast.jsx

export default function ViewToast({ toast }) {
  if (!toast) return null;

  return (
    <div className={`toast show ${toast.tipo || 'ok'}`}>
      <svg viewBox="0 0 14 14">
        <path d="M2 7l3 3 7-5" />
      </svg>
      {toast.msg}
    </div>
  );
}