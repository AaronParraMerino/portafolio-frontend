import { useState } from 'react';
import { useLanguage } from '../../../../core/i18n';
import {
  liberarRepositorioProyecto,
  restaurarProyecto,
  solicitarRestauracionProyecto,
} from '../services/projectsService';

function projectIdOf(repo = {}) {
  return Number(repo.id_proyecto || repo.proyecto?.id_proyecto || repo.proyecto?.id) || null;
}

export default function ProjectRecoveryActions({ repo, onChanged, onNotice, onError, disabled = false }) {
  const { t } = useLanguage();
  const recovery = repo?.recuperacion || {};
  const projectId = projectIdOf(repo);
  const repositoryId = Number(repo?.id_proyecto_repositorio) || null;
  const [busy, setBusy] = useState('');

  const run = async (action, task, successMessage) => {
    try {
      setBusy(action);
      onError?.('');
      await task();
      onNotice?.(successMessage);
      await onChanged?.();
    } catch (error) {
      onError?.(error.message || t('projects.recovery.error'));
    } finally {
      setBusy('');
    }
  };

  if (!projectId || repo?.estado_vinculacion !== 'proyecto_eliminado') return null;

  const requestDisabled = recovery.solicitud_pendiente || !recovery.puede_solicitar_restauracion;

  return (
    <div className="prj-recovery-actions">
      {recovery.puede_restaurar && (
        <button
          type="button"
          className="prj-detected-add-btn"
          disabled={disabled || Boolean(busy)}
          onClick={() => run('restore', () => restaurarProyecto(projectId), t('projects.recovery.restored'))}
        >
          {busy === 'restore' ? t('projects.recovery.restoring') : t('projects.recovery.restore')}
        </button>
      )}

      {!recovery.puede_restaurar && recovery.relacion_validada && (
        <button
          type="button"
          className="prj-detected-add-btn"
          disabled={disabled || Boolean(busy) || requestDisabled}
          title={recovery.solicitud_pendiente ? t('projects.recovery.pendingTitle') : ''}
          onClick={() => run('request', () => solicitarRestauracionProyecto(projectId), t('projects.recovery.requestSent'))}
        >
          {busy === 'request'
            ? t('projects.recovery.sending')
            : recovery.solicitud_pendiente
              ? t('projects.recovery.pending')
              : recovery.requiere_unirse_para_solicitar
                ? t('projects.recovery.joinAndRequest')
                : t('projects.recovery.request')}
        </button>
      )}

      {recovery.puede_liberar_repositorio && repositoryId && (
        <button
          type="button"
          className="prj-detected-add-btn danger"
          disabled={disabled || Boolean(busy)}
          onClick={() => {
            const last = Number(recovery.repositorios_vinculados_total) === 1;
            let confirmationTitle = '';

            if (last) {
              confirmationTitle = window.prompt(
                t('projects.recovery.lastRepositoryPrompt', { title: repo.proyecto?.titulo || '' })
              ) || '';
              if (!confirmationTitle) return;
            } else if (!window.confirm(t('projects.recovery.releaseConfirm'))) {
              return;
            }

            run(
              'release',
              () => liberarRepositorioProyecto(projectId, repositoryId, confirmationTitle),
              last ? t('projects.recovery.releasedPermanent') : t('projects.recovery.released')
            );
          }}
        >
          {busy === 'release' ? t('projects.recovery.releasing') : t('projects.recovery.release')}
        </button>
      )}
    </div>
  );
}
