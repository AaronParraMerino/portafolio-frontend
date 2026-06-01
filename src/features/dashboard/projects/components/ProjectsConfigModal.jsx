import { useEffect, useState } from 'react';
import { useLanguage } from '../../../../core/i18n';
import '../styles/projects.css';
import {
  getProyectoParticipantes,
  removerParticipanteSinValidacion,
} from '../services/projectsService';

const DEFAULT_CONFIG = {
  permitir_participantes_sin_validacion: false,
  puede_editar_proyecto: 'participantes_validados',
  puede_administrar_proyecto: 'propietarios',
  github_nivel_autoridad: 'maintainer',
  github_prevalece_sobre_creador: true,
  visibilidad_usuario_sin_validacion: 'visible',
  permitir_remover_participantes_sin_validacion: false,
};

function CheckRow({ name, checked, label, onChange }) {
  return (
    <label className="prj-config-check">
      <input
        type="checkbox"
        name={name}
        checked={Boolean(checked)}
        onChange={(e) => onChange(name, e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}

function getProjectId(project = {}) {
  return project.id || project.id_proyecto || project.idProyecto || null;
}

function getInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts.slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('');
}

function isUnvalidatedParticipant(participante = {}) {
  return participante.tipo_participante === 'usuario_sin_validacion_github'
    || (participante.id_usuario && !participante.validacion_github);
}

export default function ProjectsConfigModal({ proyecto, guardando = false, onGuardar, onCancelar }) {
  const { t } = useLanguage();
  const [form, setForm] = useState(DEFAULT_CONFIG);
  const [participantesSinValidacion, setParticipantesSinValidacion] = useState([]);
  const [loadingParticipantes, setLoadingParticipantes] = useState(false);
  const [participantesError, setParticipantesError] = useState('');
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    setForm({
      ...DEFAULT_CONFIG,
      ...(proyecto?.configuracion || {}),
    });
  }, [proyecto, t]);

  useEffect(() => {
    const projectId = getProjectId(proyecto);

    if (!projectId) {
      setParticipantesSinValidacion([]);
      return undefined;
    }

    let active = true;
    setLoadingParticipantes(true);
    setParticipantesError('');

    getProyectoParticipantes(projectId)
      .then((items) => {
        if (!active) return;
        setParticipantesSinValidacion((items || []).filter(isUnvalidatedParticipant));
      })
      .catch((error) => {
        if (!active) return;
        setParticipantesError(error.message || t('projects.config.loadParticipantsError'));
        setParticipantesSinValidacion([]);
      })
      .finally(() => {
        if (active) setLoadingParticipantes(false);
      });

    return () => {
      active = false;
    };
  }, [proyecto, t]);

  if (!proyecto) return null;

  const setValue = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar?.(form);
  };

  const puedeRemoverSinValidacion = Boolean(
    proyecto?.permisos?.puede_remover_participantes_sin_validacion
    ?? proyecto?.puede_remover_participantes_sin_validacion
  );

  const handleRemoveParticipant = async (participante) => {
    const projectId = getProjectId(proyecto);
    const idParticipacion = participante?.id_participacion || participante?.id;
    if (!projectId || !idParticipacion) return;

    const nombre = participante.nombre || participante.github_username || t('projects.participation.defaultName');
    const confirmed = window.confirm(t('projects.confirm.unlinkMessage', { title: nombre }));
    if (!confirmed) return;

    try {
      setParticipantesError('');
      setRemovingId(idParticipacion);
      await removerParticipanteSinValidacion(projectId, idParticipacion);
      setParticipantesSinValidacion(prev => prev.filter(item => String(item.id_participacion || item.id) !== String(idParticipacion)));
    } catch (error) {
      setParticipantesError(error.message || t('projects.config.removeParticipantError'));
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="prj-modal-overlay" onMouseDown={onCancelar}>
      <form
        className="prj-modal prj-config-modal"
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="prj-modal-head">
          <div>
            <div className="prj-modal-title">{t('projects.config.title')}</div>
            <div className="prj-modal-sub">{proyecto.titulo}</div>
          </div>
          <button type="button" className="prj-modal-close" onClick={onCancelar} disabled={guardando}>
            <svg viewBox="0 0 12 12">
              <path d="M2 2l8 8M10 2L2 10" />
            </svg>
          </button>
        </div>

        <div className="prj-modal-body">
          <div className="prj-form-section">
            <div className="prj-section-label">{t('projects.config.subtitle')}</div>
            <div className="prj-config-grid">
              <label>
                <span className="prj-label">{t('projects.config.editPermission')}</span>
                <select
                  className="prj-select"
                  value={form.puede_editar_proyecto}
                  onChange={(e) => setValue('puede_editar_proyecto', e.target.value)}
                >
                  <option value="propietarios">{t('projects.config.owners')}</option>
                  <option value="autoridad_github">{t('projects.config.githubAuthority')}</option>
                  <option value="participantes_validados">{t('projects.config.participantsValidated')}</option>
                  <option value="participantes">{t('projects.config.participants')}</option>
                </select>
              </label>

              <label>
                <span className="prj-label">{t('projects.config.adminPermission')}</span>
                <select
                  className="prj-select"
                  value={form.puede_administrar_proyecto}
                  onChange={(e) => setValue('puede_administrar_proyecto', e.target.value)}
                >
                  <option value="propietarios">Propietarios del proyecto</option>
                  <option value="autoridad_github">{t('projects.config.githubAuthority')}</option>
                </select>
              </label>

              <label>
                <span className="prj-label">{t('projects.config.githubAuthority')}</span>
                <select
                  className="prj-select"
                  value={form.github_nivel_autoridad}
                  onChange={(e) => setValue('github_nivel_autoridad', e.target.value)}
                >
                  <option value="owner">{t('projects.card.owner')}</option>
                  <option value="maintainer">{t('projects.config.maintainer')}</option>
                  <option value="admin_push">Admin / push</option>
                </select>
              </label>

              <label>
                <span className="prj-label">{t('projects.config.unvalidatedParticipants')}</span>
                <select
                  className="prj-select"
                  value={form.visibilidad_usuario_sin_validacion}
                  onChange={(e) => setValue('visibilidad_usuario_sin_validacion', e.target.value)}
                >
                  <option value="visible">{t('projects.config.visible')}</option>
                  <option value="oculto">{t('projects.config.hidden')}</option>
                </select>
              </label>
            </div>
          </div>

          <div className="prj-form-section">
            <div className="prj-section-label">{t('projects.config.subtitle')}</div>
            <div className="prj-config-checks">
              <CheckRow
                name="permitir_participantes_sin_validacion"
                checked={form.permitir_participantes_sin_validacion}
                label={t('projects.config.allowUnvalidated')}
                onChange={setValue}
              />
              <CheckRow
                name="permitir_remover_participantes_sin_validacion"
                checked={form.permitir_remover_participantes_sin_validacion}
                label={t('projects.config.allowRemoveUnvalidated')}
                onChange={setValue}
              />
            </div>
          </div>

          <div className="prj-form-section">
            <div className="prj-section-label">{t('projects.config.unvalidatedParticipants')}</div>

            {participantesError && (
              <div className="prj-config-error">{participantesError}</div>
            )}

            {loadingParticipantes ? (
              <div className="prj-config-muted">{t('projects.config.loadingParticipants')}</div>
            ) : participantesSinValidacion.length === 0 ? (
              <div className="prj-config-muted">{t('projects.config.unvalidatedParticipants')}</div>
            ) : (
              <div className="prj-config-participants">
                {participantesSinValidacion.map((participante) => {
                  const idParticipacion = participante.id_participacion || participante.id;
                  const nombre = participante.nombre || participante.github_username || t('projects.participation.defaultName');
                  const esPropietario = Boolean(participante.es_propietario || participante.tipo_rol === 'owner');
                  const puedeQuitarParticipante = puedeRemoverSinValidacion && !esPropietario;

                  return (
                    <div key={idParticipacion || nombre} className="prj-config-participant">
                      <div className="prj-config-participant-avatar">
                        {(participante.avatar_thumb_url || participante.avatar_url) ? (
                          <img
                            src={participante.avatar_thumb_url || participante.avatar_url}
                            alt=""
                            onError={(event) => {
                              if (participante.avatar_url && event.currentTarget.src !== participante.avatar_url) {
                                event.currentTarget.src = participante.avatar_url;
                              }
                            }}
                          />
                        ) : (
                          <span>{getInitials(nombre)}</span>
                        )}
                      </div>

                      <div className="prj-config-participant-main">
                        <div className="prj-config-participant-name">{nombre}</div>
                        <div className="prj-config-participant-meta">
                          {participante.email || participante.github_username || t('projects.participation.unvalidatedGithub')}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="prj-config-remove-btn"
                        disabled={!puedeQuitarParticipante || removingId === idParticipacion || guardando}
                        onClick={() => handleRemoveParticipant(participante)}
                        title={
                          esPropietario
                            ? t('projects.config.cannotRemoveOwner')
                            : puedeRemoverSinValidacion
                              ? t('projects.config.remove')
                              : t('projects.config.allowRemoveUnvalidated')
                        }
                      >
                        {removingId === idParticipacion ? t('projects.form.saving') : t('projects.config.remove')}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="prj-modal-foot">
          <button type="button" className="prj-btn-cancel" onClick={onCancelar} disabled={guardando}>
            {t('projects.config.cancel')}
          </button>
          <button type="submit" className="prj-btn-save" disabled={guardando}>
            {guardando ? <span className="prj-spinner" /> : null}
            {t('projects.config.save')}
          </button>
        </div>
      </form>
    </div>
  );
}
