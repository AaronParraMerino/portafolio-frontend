import { useState } from 'react';
import {
  liberarRepositorioProyecto,
  restaurarProyecto,
  solicitarRestauracionProyecto,
} from '../services/projectsService';

function projectIdOf(repo = {}) {
  return Number(repo.id_proyecto || repo.proyecto?.id_proyecto || repo.proyecto?.id) || null;
}

export default function ProjectRecoveryActions({ repo, onChanged, onNotice, onError, disabled = false }) {
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
      onError?.(error.message || 'No se pudo completar la accion.');
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
          onClick={() => run('restore', () => restaurarProyecto(projectId), 'Proyecto restablecido correctamente.')}
        >
          {busy === 'restore' ? 'Restableciendo...' : 'Restablecer proyecto'}
        </button>
      )}

      {!recovery.puede_restaurar && recovery.relacion_validada && (
        <button
          type="button"
          className="prj-detected-add-btn"
          disabled={disabled || Boolean(busy) || requestDisabled}
          title={recovery.solicitud_pendiente ? 'Ya existe una solicitud pendiente.' : ''}
          onClick={() => run('request', () => solicitarRestauracionProyecto(projectId), 'Solicitud enviada a los propietarios.')}
        >
          {busy === 'request'
            ? 'Enviando...'
            : recovery.solicitud_pendiente
              ? 'Solicitud pendiente'
              : recovery.requiere_unirse_para_solicitar
                ? 'Unirme y solicitar restauracion'
                : 'Solicitar restauracion'}
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
                `Este es el ultimo repositorio. El proyecto se eliminara permanentemente.\nEscribe "${repo.proyecto?.titulo || ''}" para confirmar.`
              ) || '';
              if (!confirmationTitle) return;
            } else if (!window.confirm('¿Liberar este repositorio del proyecto eliminado?')) {
              return;
            }

            run(
              'release',
              () => liberarRepositorioProyecto(projectId, repositoryId, confirmationTitle),
              last ? 'Repositorio liberado y proyecto eliminado permanentemente.' : 'Repositorio liberado correctamente.'
            );
          }}
        >
          {busy === 'release' ? 'Liberando...' : 'Liberar repositorio'}
        </button>
      )}
    </div>
  );
}
