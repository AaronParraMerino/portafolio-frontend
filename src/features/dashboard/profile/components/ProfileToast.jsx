import '../styles/profile.css';
import {
  DashboardCheckIcon,
  DashboardCloseIcon,
} from '../../layout/DashboardIcons';

export default function ProfileToast({ toast }) {
  if (!toast) return null;

  return (
    <div className={`prf-toast ${toast.tipo === 'error' ? 'error' : 'ok'}`}>
      {toast.tipo === 'error' ? <DashboardCloseIcon /> : <DashboardCheckIcon />}
      {toast.msg}
    </div>
  );
}
