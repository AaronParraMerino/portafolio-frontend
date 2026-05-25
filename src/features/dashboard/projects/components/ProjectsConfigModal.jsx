import { useEffect, useState } from 'react';
import '../styles/projects.css';
import {
  getProyectoParticipantes,
  removerParticipanteSinValidacion,
} from '../services/projectsService';

const DEFAULT_CONFIG = {
  modo_union: 'github_validado',
  requiere_aprobacion_union: true,
  permitir_participantes_sin_validacion: false,
  puede_editar_proyecto: 'participantes_validados',
  puede_administrar_proyecto: 'propietarios',
  github_nivel_autoridad: 'maintainer',
  github_prevalece_sobre_creador: true,
  enlace_union_activo: false,
  visibilidad_github_validado_usuario: 'visible',
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
  }, [proyecto]);

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
        setParticipantesError(error.message || 'No se pudieron cargar participantes sin validacion.');
        setParticipantesSinValidacion([]);
      })
      .finally(() => {
        if (active) setLoadingParticipantes(false);
      });

    return () => {
      active = false;
    };
  }, [proyecto]);

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

    const nombre = participante.nombre || participante.github_username || 'este participante';
    const confirmed = window.confirm(`Vas a quitar la participacion sin validacion de ${nombre}.`);
    if (!confirmed) return;

    try {
      setParticipantesError('');
      setRemovingId(idParticipacion);
      await removerParticipanteSinValidacion(projectId, idParticipacion);
      setParticipantesSinValidacion(prev => prev.filter(item => String(item.id_participacion || item.id) !== String(idParticipacion)));
    } catch (error) {
      setParticipantesError(error.message || 'No se pudo quitar la participacion.');
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
            <div className="prj-modal-title">Configuracion del proyecto</div>
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
            <div className="prj-section-label">Permisos</div>
            <div className="prj-config-grid">
              <label>
                <span className="prj-label">Quienes pueden editar</span>
                <select
                  className="prj-select"
                  value={form.puede_editar_proyecto}
                  onChange={(e) => setValue('puede_editar_proyecto', e.target.value)}
                >
                  <option value="propietarios">Solo propietarios</option>
                  <option value="autoridad_github">Duenios del repositorio</option>
                  <option value="participantes_validados">Participantes validados</option>
                  <option value="participantes">Todos los participantes</option>
                </select>
              </label>

              <label>
                <span className="prj-label">Quienes administran</span>
                <select
                  className="prj-select"
                  value={form.puede_administrar_proyecto}
                  onChange={(e) => setValue('puede_administrar_proyecto', e.target.value)}
                >
                  <option value="propietarios">Propietarios del proyecto</option>
                  <option value="autoridad_github">Duenios del repositorio</option>
                </select>
              </label>

              <label>
                <span className="prj-label">Nivel GitHub requerido</span>
                <select
                  className="prj-select"
                  value={form.github_nivel_autoridad}
                  onChange={(e) => setValue('github_nivel_autoridad', e.target.value)}
                >
                  <option value="owner">Owner</option>
                  <option value="maintainer">Maintainer/Admin</option>
                  <option value="admin_push">Admin o push</option>
                </select>
              </label>

              <label>
                <span className="prj-label">Modo de union</span>
                <select
                  className="prj-select"
                  value={form.modo_union}
                  onChange={(e) => setValue('modo_union', e.target.value)}
                >
                  <option value="cerrado">Cerrado</option>
                  <option value="por_solicitud">Por solicitud</option>
                  <option value="enlace_autenticado">Enlace autenticado</option>
                  <option value="github_validado">GitHub validado</option>
                </select>
              </label>

              <label>
                <span className="prj-label">Participantes sin validacion</span>
                <select
                  className="prj-select"
                  value={form.visibilidad_usuario_sin_validacion}
                  onChange={(e) => setValue('visibilidad_usuario_sin_validacion', e.target.value)}
                >
                  <option value="visible">Mostrar en participantes</option>
                  <option value="oculto">Ocultar en participantes</option>
                </select>
              </label>
            </div>
          </div>

          <div className="prj-form-section">
            <div className="prj-section-label">Reglas</div>
            <div className="prj-config-checks">
              <CheckRow
                name="requiere_aprobacion_union"
                checked={form.requiere_aprobacion_union}
                label="Requerir aprobacion para unirse"
                onChange={setValue}
              />
              <CheckRow
                name="permitir_participantes_sin_validacion"
                checked={form.permitir_participantes_sin_validacion}
                label="Permitir participantes sin validacion GitHub"
                onChange={setValue}
              />
              <CheckRow
                name="permitir_remover_participantes_sin_validacion"
                checked={form.permitir_remover_participantes_sin_validacion}
                label="Permitir remover participantes sin validacion"
                onChange={setValue}
              />
            </div>
          </div>

          <div className="prj-form-section">
            <div className="prj-section-label">Participantes sin validacion</div>

            {participantesError && (
              <div className="prj-config-error">{participantesError}</div>
            )}

            {loadingParticipantes ? (
              <div className="prj-config-muted">Cargando participantes...</div>
            ) : participantesSinValidacion.length === 0 ? (
              <div className="prj-config-muted">No hay participantes sin validacion.</div>
            ) : (
              <div className="prj-config-participants">
                {participantesSinValidacion.map((participante) => {
                  const idParticipacion = participante.id_participacion || participante.id;
                  const nombre = participante.nombre || participante.github_username || 'Participante';
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
                          {participante.email || participante.github_username || 'Sin validacion GitHub'}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="prj-config-remove-btn"
                        disabled={!puedeQuitarParticipante || removingId === idParticipacion || guardando}
                        onClick={() => handleRemoveParticipant(participante)}
                        title={
                          esPropietario
                            ? 'No se puede quitar al propietario del proyecto'
                            : puedeRemoverSinValidacion
                              ? 'Quitar participacion'
                              : 'Activa y guarda la regla para remover participantes sin validacion'
                        }
                      >
                        {removingId === idParticipacion ? 'Quitando...' : 'Quitar'}
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
            Cancelar
          </button>
          <button type="submit" className="prj-btn-save" disabled={guardando}>
            {guardando ? <span className="prj-spinner" /> : null}
            Guardar configuracion
          </button>
        </div>
      </form>
    </div>
  );
}
