// src/features/dashboard/view/components/ViewEdit.jsx

import { useMemo, useState } from 'react';
import ConfirmModal from '../../../../shared/ui/ConfirmModal';

const SOCIAL_TYPES = [
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'github', label: 'GitHub' },
  { id: 'twitter', label: 'Twitter / X' },
  { id: 'web', label: 'Web' },
];

const LEVELS = [
  { id: 'experto', label: 'Experto' },
  { id: 'avanzado', label: 'Avanzado' },
  { id: 'intermedio', label: 'Intermedio' },
];

const EXPERIENCE_TYPES = [
  { id: 'laboral', label: 'Laboral' },
  { id: 'academico', label: 'Académico' },
];

const PROJECT_ICONS = [
  { id: 'school', label: 'Académico' },
  { id: 'box', label: 'Inventario' },
  { id: 'api', label: 'API / Código' },
  { id: 'portfolio', label: 'Portafolio' },
];

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function normalizeText(value = '') {
  return value
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function ensureHref(value = '') {
  const raw = value.trim();

  if (!raw) return '';
  if (/^(https?:\/\/|mailto:|tel:)/i.test(raw)) return raw;

  return `https://${raw.replace(/^\/+/, '')}`;
}

function splitTags(value = '') {
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

function Field({ label, children, full = false }) {
  return (
    <label className={`edit-field ${full ? 'full' : ''}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function EditSection({ title, subtitle, children }) {
  return (
    <section className="edit-section">
      <div className="edit-section-head">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>

      {children}
    </section>
  );
}

function EmptyState({ children }) {
  return (
    <div className="edit-empty">
      {children}
    </div>
  );
}

export default function ViewEdit({
  data,
  onDataChange,
}) {
  const [section, setSection] = useState('perfil');
  const [search, setSearch] = useState({
    redes: '',
    habilidades: '',
    experiencias: '',
    proyectos: '',
  });

  const [deleteTarget, setDeleteTarget] = useState(null);

  const perfil = data?.perfil || {};
  const redes = data?.redes || [];
  const stats = data?.stats || [];
  const habilidades = data?.habilidades || { tecnicas: [], blandas: [] };
  const experiencias = data?.experiencias || [];
  const proyectos = data?.proyectos || [];

  const tecnicas = habilidades.tecnicas || [];
  const blandas = habilidades.blandas || [];

  const filteredRedes = useMemo(() => {
    const term = normalizeText(search.redes);

    if (!term) return redes;

    return redes.filter(red =>
      normalizeText(`${red.nombre} ${red.url} ${red.tipo}`).includes(term)
    );
  }, [redes, search.redes]);

  const filteredTecnicas = useMemo(() => {
    const term = normalizeText(search.habilidades);

    if (!term) return tecnicas;

    return tecnicas.filter(skill =>
      normalizeText(`${skill.nombre} ${skill.descripcion} ${skill.nivel}`).includes(term)
    );
  }, [tecnicas, search.habilidades]);

  const filteredBlandas = useMemo(() => {
    const term = normalizeText(search.habilidades);

    if (!term) return blandas;

    return blandas.filter(skill =>
      normalizeText(`${skill.nombre} ${skill.descripcion} ${skill.nivel}`).includes(term)
    );
  }, [blandas, search.habilidades]);

  const filteredExperiencias = useMemo(() => {
    const term = normalizeText(search.experiencias);

    if (!term) return experiencias;

    return experiencias.filter(exp =>
      normalizeText(`${exp.cargo} ${exp.organizacion} ${exp.descripcion} ${exp.tipo}`).includes(term)
    );
  }, [experiencias, search.experiencias]);

  const filteredProyectos = useMemo(() => {
    const term = normalizeText(search.proyectos);

    if (!term) return proyectos;

    return proyectos.filter(project =>
      normalizeText(`${project.titulo} ${project.tipo} ${project.descripcion} ${(project.tecnologias || []).join(' ')}`).includes(term)
    );
  }, [proyectos, search.proyectos]);

  const patchPerfil = (patch) => {
    onDataChange({
      perfil: {
        ...perfil,
        ...patch,
      },
    });
  };

  const patchRed = (id, patch) => {
    onDataChange({
      redes: redes.map(red =>
        red.id === id ? { ...red, ...patch } : red
      ),
    });
  };

  const addRed = () => {
    const newRed = {
      id: uid('red'),
      nombre: 'Nueva red',
      url: 'mi-enlace.com',
      href: 'https://mi-enlace.com',
      tipo: 'web',
    };

    onDataChange({
      redes: [...redes, newRed],
    });
  };

  const patchStat = (id, patch) => {
    onDataChange({
      stats: stats.map(stat =>
        stat.id === id ? { ...stat, ...patch } : stat
      ),
    });
  };

  const patchSkill = (kind, id, patch) => {
    const list = habilidades[kind] || [];

    onDataChange({
      habilidades: {
        ...habilidades,
        [kind]: list.map(skill =>
          skill.id === id ? { ...skill, ...patch } : skill
        ),
      },
    });
  };

  const addSkill = (kind) => {
    const newSkill = {
      id: uid(kind === 'tecnicas' ? 'tec' : 'soft'),
      nombre: kind === 'tecnicas' ? 'Nueva tecnología' : 'Nueva habilidad',
      nivel: 'intermedio',
      porcentaje: 60,
      descripcion: 'Descripción breve de la habilidad.',
    };

    onDataChange({
      habilidades: {
        ...habilidades,
        [kind]: [...(habilidades[kind] || []), newSkill],
      },
    });
  };

  const patchExperience = (id, patch) => {
    onDataChange({
      experiencias: experiencias.map(exp =>
        exp.id === id ? { ...exp, ...patch } : exp
      ),
    });
  };

  const addExperience = (tipo = 'laboral') => {
    const newExperience = {
      id: uid('exp'),
      tipo,
      actual: false,
      cargo: tipo === 'academico' ? 'Nueva formación académica' : 'Nuevo cargo',
      organizacion: 'Organización',
      fechas: '2024 → Presente',
      descripcion: 'Descripción breve de la experiencia.',
    };

    onDataChange({
      experiencias: [newExperience, ...experiencias],
    });
  };

  const patchProject = (id, patch) => {
    onDataChange({
      proyectos: proyectos.map(project =>
        project.id === id ? { ...project, ...patch } : project
      ),
    });
  };

  const addProject = () => {
    const newProject = {
      id: uid('proy'),
      titulo: 'Nuevo proyecto',
      descripcion: 'Descripción breve del proyecto.',
      estado: 'desarrollo',
      tipo: 'Proyecto',
      anio: new Date().getFullYear().toString(),
      icono: 'portfolio',
      tecnologias: ['React', 'PHP'],
      githubUrl: '',
      demoUrl: '',
      videoUrl: '',
    };

    onDataChange({
      proyectos: [newProject, ...proyectos],
    });
  };

  const requestDelete = (target) => {
    setDeleteTarget(target);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'red') {
      onDataChange({
        redes: redes.filter(red => red.id !== deleteTarget.id),
      });
    }

    if (deleteTarget.type === 'skill') {
      const list = habilidades[deleteTarget.kind] || [];

      onDataChange({
        habilidades: {
          ...habilidades,
          [deleteTarget.kind]: list.filter(skill => skill.id !== deleteTarget.id),
        },
      });
    }

    if (deleteTarget.type === 'experience') {
      onDataChange({
        experiencias: experiencias.filter(exp => exp.id !== deleteTarget.id),
      });
    }

    if (deleteTarget.type === 'project') {
      onDataChange({
        proyectos: proyectos.filter(project => project.id !== deleteTarget.id),
      });
    }

    setDeleteTarget(null);
  };

  return (
    <div className="edit-panel">
      <div className="edit-tabs">
        <button
          type="button"
          className={`edit-tab ${section === 'perfil' ? 'active' : ''}`}
          onClick={() => setSection('perfil')}
        >
          Perfil
        </button>

        <button
          type="button"
          className={`edit-tab ${section === 'redes' ? 'active' : ''}`}
          onClick={() => setSection('redes')}
        >
          Redes
        </button>

        <button
          type="button"
          className={`edit-tab ${section === 'stats' ? 'active' : ''}`}
          onClick={() => setSection('stats')}
        >
          Stats
        </button>

        <button
          type="button"
          className={`edit-tab ${section === 'habilidades' ? 'active' : ''}`}
          onClick={() => setSection('habilidades')}
        >
          Habilidades
        </button>

        <button
          type="button"
          className={`edit-tab ${section === 'experiencia' ? 'active' : ''}`}
          onClick={() => setSection('experiencia')}
        >
          Experiencia
        </button>

        <button
          type="button"
          className={`edit-tab ${section === 'proyectos' ? 'active' : ''}`}
          onClick={() => setSection('proyectos')}
        >
          Proyectos
        </button>
      </div>

      <div className="edit-body">
        {section === 'perfil' && (
          <EditSection
            title="Editar perfil"
            subtitle="Datos principales que se muestran en la cabecera del portafolio."
          >
            <div className="edit-grid">
              <Field label="Nombre">
                <input
                  value={perfil.nombre || ''}
                  onChange={event => patchPerfil({ nombre: event.target.value })}
                />
              </Field>

              <Field label="Apellido">
                <input
                  value={perfil.apellido || ''}
                  onChange={event => patchPerfil({ apellido: event.target.value })}
                />
              </Field>

              <Field label="Profesión" full>
                <input
                  value={perfil.profesion || ''}
                  onChange={event => patchPerfil({ profesion: event.target.value })}
                />
              </Field>

              <Field label="Ciudad">
                <input
                  value={perfil.ciudad || ''}
                  onChange={event => patchPerfil({ ciudad: event.target.value })}
                />
              </Field>

              <Field label="País">
                <input
                  value={perfil.pais || ''}
                  onChange={event => patchPerfil({ pais: event.target.value })}
                />
              </Field>

              <Field label="Teléfono">
                <input
                  value={perfil.telefono || ''}
                  onChange={event => patchPerfil({ telefono: event.target.value })}
                />
              </Field>

              <Field label="Correo">
                <input
                  type="email"
                  value={perfil.correo || ''}
                  onChange={event => patchPerfil({ correo: event.target.value })}
                />
              </Field>

              <Field label="Biografía" full>
                <textarea
                  rows={6}
                  value={perfil.biografia || ''}
                  onChange={event => patchPerfil({ biografia: event.target.value })}
                />
              </Field>
            </div>
          </EditSection>
        )}

        {section === 'redes' && (
          <EditSection
            title="Editar redes sociales"
            subtitle="Gestiona los enlaces públicos que aparecen en tu perfil."
          >
            <div className="edit-toolbar">
              <input
                type="search"
                className="edit-search"
                placeholder="Buscar red social..."
                value={search.redes}
                onChange={event => setSearch(prev => ({ ...prev, redes: event.target.value }))}
              />

              <button
                type="button"
                className="edit-btn edit-btn-primary"
                onClick={addRed}
              >
                + Agregar red
              </button>
            </div>

            {!filteredRedes.length && (
              <EmptyState>No hay redes que coincidan con la búsqueda.</EmptyState>
            )}

            <div className="edit-list">
              {filteredRedes.map(red => (
                <article key={red.id} className="edit-card">
                  <div className="edit-card-head">
                    <strong>{red.nombre || 'Red social'}</strong>

                    <button
                      type="button"
                      className="edit-icon-btn danger"
                      onClick={() => requestDelete({
                        type: 'red',
                        id: red.id,
                        label: red.nombre,
                      })}
                    >
                      Eliminar
                    </button>
                  </div>

                  <div className="edit-grid">
                    <Field label="Nombre">
                      <input
                        value={red.nombre || ''}
                        onChange={event => patchRed(red.id, { nombre: event.target.value })}
                      />
                    </Field>

                    <Field label="Tipo">
                      <select
                        value={red.tipo || 'web'}
                        onChange={event => patchRed(red.id, { tipo: event.target.value })}
                      >
                        {SOCIAL_TYPES.map(type => (
                          <option key={type.id} value={type.id}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Texto visible">
                      <input
                        value={red.url || ''}
                        onChange={event => patchRed(red.id, {
                          url: event.target.value,
                          href: ensureHref(event.target.value),
                        })}
                      />
                    </Field>

                    <Field label="URL real">
                      <input
                        value={red.href || ''}
                        onChange={event => patchRed(red.id, { href: event.target.value })}
                      />
                    </Field>
                  </div>
                </article>
              ))}
            </div>
          </EditSection>
        )}

        {section === 'stats' && (
          <EditSection
            title="Editar estadísticas"
            subtitle="Modifica los indicadores principales de la vista pública."
          >
            <div className="edit-list">
              {stats.map(stat => (
                <article key={stat.id} className="edit-card edit-card-compact">
                  <div className="edit-grid">
                    <Field label="Valor">
                      <input
                        value={stat.valor || ''}
                        onChange={event => patchStat(stat.id, { valor: event.target.value })}
                      />
                    </Field>

                    <Field label="Etiqueta">
                      <input
                        value={stat.label || ''}
                        onChange={event => patchStat(stat.id, { label: event.target.value })}
                      />
                    </Field>
                  </div>
                </article>
              ))}
            </div>
          </EditSection>
        )}

        {section === 'habilidades' && (
          <EditSection
            title="Editar habilidades"
            subtitle="Agrega, modifica o elimina habilidades técnicas y blandas."
          >
            <div className="edit-toolbar">
              <input
                type="search"
                className="edit-search"
                placeholder="Buscar habilidad..."
                value={search.habilidades}
                onChange={event => setSearch(prev => ({ ...prev, habilidades: event.target.value }))}
              />

              <button
                type="button"
                className="edit-btn edit-btn-soft"
                onClick={() => addSkill('tecnicas')}
              >
                + Técnica
              </button>

              <button
                type="button"
                className="edit-btn edit-btn-primary"
                onClick={() => addSkill('blandas')}
              >
                + Blanda
              </button>
            </div>

            <div className="edit-subtitle-row">
              <span>Técnicas</span>
            </div>

            {!filteredTecnicas.length && (
              <EmptyState>No hay habilidades técnicas visibles.</EmptyState>
            )}

            <div className="edit-list">
              {filteredTecnicas.map(skill => (
                <SkillEditor
                  key={skill.id}
                  skill={skill}
                  onPatch={patch => patchSkill('tecnicas', skill.id, patch)}
                  onDelete={() => requestDelete({
                    type: 'skill',
                    kind: 'tecnicas',
                    id: skill.id,
                    label: skill.nombre,
                  })}
                />
              ))}
            </div>

            <div className="edit-subtitle-row">
              <span>Blandas</span>
            </div>

            {!filteredBlandas.length && (
              <EmptyState>No hay habilidades blandas visibles.</EmptyState>
            )}

            <div className="edit-list">
              {filteredBlandas.map(skill => (
                <SkillEditor
                  key={skill.id}
                  skill={skill}
                  onPatch={patch => patchSkill('blandas', skill.id, patch)}
                  onDelete={() => requestDelete({
                    type: 'skill',
                    kind: 'blandas',
                    id: skill.id,
                    label: skill.nombre,
                  })}
                />
              ))}
            </div>
          </EditSection>
        )}

        {section === 'experiencia' && (
          <EditSection
            title="Editar experiencia"
            subtitle="Administra experiencia laboral y formación académica."
          >
            <div className="edit-toolbar">
              <input
                type="search"
                className="edit-search"
                placeholder="Buscar experiencia..."
                value={search.experiencias}
                onChange={event => setSearch(prev => ({ ...prev, experiencias: event.target.value }))}
              />

              <button
                type="button"
                className="edit-btn edit-btn-soft"
                onClick={() => addExperience('laboral')}
              >
                + Laboral
              </button>

              <button
                type="button"
                className="edit-btn edit-btn-primary"
                onClick={() => addExperience('academico')}
              >
                + Académica
              </button>
            </div>

            {!filteredExperiencias.length && (
              <EmptyState>No hay experiencias que coincidan con la búsqueda.</EmptyState>
            )}

            <div className="edit-list">
              {filteredExperiencias.map(exp => (
                <article key={exp.id} className="edit-card">
                  <div className="edit-card-head">
                    <strong>{exp.cargo || 'Experiencia'}</strong>

                    <button
                      type="button"
                      className="edit-icon-btn danger"
                      onClick={() => requestDelete({
                        type: 'experience',
                        id: exp.id,
                        label: exp.cargo,
                      })}
                    >
                      Eliminar
                    </button>
                  </div>

                  <div className="edit-grid">
                    <Field label="Tipo">
                      <select
                        value={exp.tipo || 'laboral'}
                        onChange={event => patchExperience(exp.id, { tipo: event.target.value })}
                      >
                        {EXPERIENCE_TYPES.map(type => (
                          <option key={type.id} value={type.id}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Fechas">
                      <input
                        value={exp.fechas || ''}
                        onChange={event => patchExperience(exp.id, { fechas: event.target.value })}
                      />
                    </Field>

                    <Field label="Cargo / Formación" full>
                      <input
                        value={exp.cargo || ''}
                        onChange={event => patchExperience(exp.id, { cargo: event.target.value })}
                      />
                    </Field>

                    <Field label="Organización" full>
                      <input
                        value={exp.organizacion || ''}
                        onChange={event => patchExperience(exp.id, { organizacion: event.target.value })}
                      />
                    </Field>

                    <label className="edit-check full">
                      <input
                        type="checkbox"
                        checked={Boolean(exp.actual)}
                        onChange={event => patchExperience(exp.id, { actual: event.target.checked })}
                      />
                      <span>Marcar como actual</span>
                    </label>

                    <Field label="Descripción" full>
                      <textarea
                        rows={4}
                        value={exp.descripcion || ''}
                        onChange={event => patchExperience(exp.id, { descripcion: event.target.value })}
                      />
                    </Field>
                  </div>
                </article>
              ))}
            </div>
          </EditSection>
        )}

        {section === 'proyectos' && (
          <EditSection
            title="Editar proyectos"
            subtitle="Administra proyectos destacados, enlaces y tecnologías."
          >
            <div className="edit-toolbar">
              <input
                type="search"
                className="edit-search"
                placeholder="Buscar proyecto..."
                value={search.proyectos}
                onChange={event => setSearch(prev => ({ ...prev, proyectos: event.target.value }))}
              />

              <button
                type="button"
                className="edit-btn edit-btn-primary"
                onClick={addProject}
              >
                + Agregar proyecto
              </button>
            </div>

            {!filteredProyectos.length && (
              <EmptyState>No hay proyectos que coincidan con la búsqueda.</EmptyState>
            )}

            <div className="edit-list">
              {filteredProyectos.map(project => (
                <article key={project.id} className="edit-card">
                  <div className="edit-card-head">
                    <strong>{project.titulo || 'Proyecto'}</strong>

                    <button
                      type="button"
                      className="edit-icon-btn danger"
                      onClick={() => requestDelete({
                        type: 'project',
                        id: project.id,
                        label: project.titulo,
                      })}
                    >
                      Eliminar
                    </button>
                  </div>

                  <div className="edit-grid">
                    <Field label="Título" full>
                      <input
                        value={project.titulo || ''}
                        onChange={event => patchProject(project.id, { titulo: event.target.value })}
                      />
                    </Field>

                    <Field label="Tipo">
                      <input
                        value={project.tipo || ''}
                        onChange={event => patchProject(project.id, { tipo: event.target.value })}
                      />
                    </Field>

                    <Field label="Año">
                      <input
                        value={project.anio || ''}
                        onChange={event => patchProject(project.id, { anio: event.target.value })}
                      />
                    </Field>

                    <Field label="Estado">
                      <select
                        value={project.estado || 'desarrollo'}
                        onChange={event => patchProject(project.id, { estado: event.target.value })}
                      >
                        <option value="publicado">Publicado</option>
                        <option value="desarrollo">Desarrollo</option>
                      </select>
                    </Field>

                    <Field label="Icono">
                      <select
                        value={project.icono || 'portfolio'}
                        onChange={event => patchProject(project.id, { icono: event.target.value })}
                      >
                        {PROJECT_ICONS.map(icon => (
                          <option key={icon.id} value={icon.id}>
                            {icon.label}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Descripción" full>
                      <textarea
                        rows={4}
                        value={project.descripcion || ''}
                        onChange={event => patchProject(project.id, { descripcion: event.target.value })}
                      />
                    </Field>

                    <Field label="Tecnologías separadas por coma" full>
                      <input
                        value={(project.tecnologias || []).join(', ')}
                        onChange={event => patchProject(project.id, {
                          tecnologias: splitTags(event.target.value),
                        })}
                      />
                    </Field>

                    <Field label="GitHub">
                      <input
                        value={project.githubUrl || ''}
                        onChange={event => patchProject(project.id, { githubUrl: event.target.value })}
                      />
                    </Field>

                    <Field label="Demo">
                      <input
                        value={project.demoUrl || ''}
                        onChange={event => patchProject(project.id, { demoUrl: event.target.value })}
                      />
                    </Field>

                    <Field label="Video">
                      <input
                        value={project.videoUrl || ''}
                        onChange={event => patchProject(project.id, { videoUrl: event.target.value })}
                      />
                    </Field>
                  </div>
                </article>
              ))}
            </div>
          </EditSection>
        )}
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        variant="red"
        icon="warning"
        title="Eliminar elemento"
        subtitle="Esta acción solo afecta los datos mock"
        message={`¿Deseas eliminar "${deleteTarget?.label || 'este elemento'}"?`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function SkillEditor({ skill, onPatch, onDelete }) {
  const percentage = Math.max(0, Math.min(Number(skill.porcentaje) || 0, 100));

  return (
    <article className="edit-card">
      <div className="edit-card-head">
        <strong>{skill.nombre || 'Habilidad'}</strong>

        <button
          type="button"
          className="edit-icon-btn danger"
          onClick={onDelete}
        >
          Eliminar
        </button>
      </div>

      <div className="edit-grid">
        <Field label="Nombre">
          <input
            value={skill.nombre || ''}
            onChange={event => onPatch({ nombre: event.target.value })}
          />
        </Field>

        <Field label="Nivel">
          <select
            value={skill.nivel || 'intermedio'}
            onChange={event => onPatch({ nivel: event.target.value })}
          >
            {LEVELS.map(level => (
              <option key={level.id} value={level.id}>
                {level.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label={`Porcentaje: ${percentage}%`} full>
          <div className="edit-range-row">
            <input
              type="range"
              min="0"
              max="100"
              value={percentage}
              onChange={event => onPatch({ porcentaje: Number(event.target.value) })}
            />

            <input
              type="number"
              min="0"
              max="100"
              value={percentage}
              onChange={event => onPatch({ porcentaje: Number(event.target.value) })}
            />
          </div>
        </Field>

        <Field label="Descripción" full>
          <textarea
            rows={3}
            value={skill.descripcion || ''}
            onChange={event => onPatch({ descripcion: event.target.value })}
          />
        </Field>
      </div>
    </article>
  );
}