import { useEffect, useState } from 'react';
import '../styles/projects.css';

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

export default function ProjectsConfigModal({ proyecto, guardando = false, onGuardar, onCancelar }) {
  const [form, setForm] = useState(DEFAULT_CONFIG);

  useEffect(() => {
    setForm({
      ...DEFAULT_CONFIG,
      ...(proyecto?.configuracion || {}),
    });
  }, [proyecto]);

  if (!proyecto) return null;

  const setValue = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar?.(form);
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
