// src/features/dashboard/view/components/ViewEdit.jsx

import { useMemo, useState } from 'react';
import ConfirmModal from '../../../../shared/ui/ConfirmModal';
import { useLanguage } from '../../../../core/i18n';

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
  const { t } = useLanguage();
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
      nombre: t('view.edit.defaultNewSocial'),
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
      nombre: kind === 'tecnicas' ? t('view.edit.defaultNewTech') : t('view.edit.defaultNewSkill'),
      nivel: 'intermedio',
      porcentaje: 60,
      descripcion: t('view.edit.defaultSkillDescription'),
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
      cargo: tipo === 'academico' ? t('view.edit.defaultAcademicRole') : t('view.edit.defaultWorkRole'),
      organizacion: t('view.edit.defaultOrganization'),
      fechas: t('view.edit.defaultDates'),
      descripcion: t('view.edit.defaultExperienceDescription'),
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
      titulo: t('view.edit.defaultProjectTitle'),
      descripcion: t('view.edit.defaultProjectDescription'),
      estado: 'desarrollo',
      tipo: t('view.projects.defaultTitle'),
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
          {t('view.edit.tabs.profile')}
        </button>

        <button
          type="button"
          className={`edit-tab ${section === 'redes' ? 'active' : ''}`}
          onClick={() => setSection('redes')}
        >
          {t('view.edit.tabs.social')}
        </button>

        <button
          type="button"
          className={`edit-tab ${section === 'stats' ? 'active' : ''}`}
          onClick={() => setSection('stats')}
        >
          {t('view.edit.tabs.stats')}
        </button>

        <button
          type="button"
          className={`edit-tab ${section === 'habilidades' ? 'active' : ''}`}
          onClick={() => setSection('habilidades')}
        >
          {t('view.edit.tabs.skills')}
        </button>

        <button
          type="button"
          className={`edit-tab ${section === 'experiencia' ? 'active' : ''}`}
          onClick={() => setSection('experiencia')}
        >
          {t('view.edit.tabs.experience')}
        </button>

        <button
          type="button"
          className={`edit-tab ${section === 'proyectos' ? 'active' : ''}`}
          onClick={() => setSection('proyectos')}
        >
          {t('view.edit.tabs.projects')}
        </button>
      </div>

      <div className="edit-body">
        {section === 'perfil' && (
          <EditSection
            title={t('view.edit.profile.title')}
            subtitle={t('view.edit.profile.subtitle')}
          >
            <div className="edit-grid">
              <Field label={t('profile.field.firstName')}>
              
                <input
                  value={perfil.nombre || ''}
                  onChange={event => patchPerfil({ nombre: event.target.value })}
                />
              </Field>

              <Field label={t('profile.field.lastName')}>
              
                <input
                  value={perfil.apellido || ''}
                  onChange={event => patchPerfil({ apellido: event.target.value })}
                />
              </Field>

              <Field label={t('profile.field.profession')} full>
              
                <input
                  value={perfil.profesion || ''}
                  onChange={event => patchPerfil({ profesion: event.target.value })}
                />
              </Field>

              <Field label={t('profile.field.city')}>
              
                <input
                  value={perfil.ciudad || ''}
                  onChange={event => patchPerfil({ ciudad: event.target.value })}
                />
              </Field>

              <Field label={t('profile.field.country')}>
              
                <input
                  value={perfil.pais || ''}
                  onChange={event => patchPerfil({ pais: event.target.value })}
                />
              </Field>

              <Field label={t('profile.field.phone')}>
              
                <input
                  value={perfil.telefono || ''}
                  onChange={event => patchPerfil({ telefono: event.target.value })}
                />
              </Field>

              <Field label={t('profile.field.email')}>
              
                <input
                  type="email"
                  value={perfil.correo || ''}
                  onChange={event => patchPerfil({ correo: event.target.value })}
                />
              </Field>

              <Field label={t('profile.field.biography')} full>
              
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
            title={t('view.edit.social.title')}
            subtitle={t('view.edit.social.subtitle')}
          >
            <div className="edit-toolbar">
              <input
                type="search"
                className="edit-search"
                placeholder={t('view.edit.social.search')}
                value={search.redes}
                onChange={event => setSearch(prev => ({ ...prev, redes: event.target.value }))}
              />

              <button
                type="button"
                className="edit-btn edit-btn-primary"
                onClick={addRed}
              >
                {t('view.edit.social.add')}
              </button>
            </div>

            {!filteredRedes.length && (
              <EmptyState>{t('view.edit.social.empty')}</EmptyState>
            )}

            <div className="edit-list">
              {filteredRedes.map(red => (
                <article key={red.id} className="edit-card">
                  <div className="edit-card-head">
                    <strong>{red.nombre || t('view.edit.social.default')}</strong>

                    <button
                      type="button"
                      className="edit-icon-btn danger"
                      onClick={() => requestDelete({
                        type: 'red',
                        id: red.id,
                        label: red.nombre,
                      })}
                    >
                      {t('actions.delete')}
                    </button>
                  </div>

                  <div className="edit-grid">
                    <Field label={t('view.edit.name')}>
                      <input
                        value={red.nombre || ''}
                        onChange={event => patchRed(red.id, { nombre: event.target.value })}
                      />
                    </Field>

                    <Field label={t('view.projects.type')}>
                      
                      <select
                        value={red.tipo || 'web'}
                        onChange={event => patchRed(red.id, { tipo: event.target.value })}
                      >
                        {SOCIAL_TYPES.map(type => (
                          <option key={type.id} value={type.id}>
                            {t(`view.edit.social.type.${type.id}`, {}, type.label)}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label={t('view.edit.social.visibleText')}>
                      <input
                        value={red.url || ''}
                        onChange={event => patchRed(red.id, {
                          url: event.target.value,
                          href: ensureHref(event.target.value),
                        })}
                      />
                    </Field>

                    <Field label={t('view.edit.social.realUrl')}>
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
            title={t('view.edit.stats.title')}
            subtitle={t('view.edit.stats.subtitle')}
          >
            <div className="edit-list">
              {stats.map(stat => (
                <article key={stat.id} className="edit-card edit-card-compact">
                  <div className="edit-grid">
                    <Field label={t('view.edit.stats.value')}>
                    
                      <input
                        value={stat.valor || ''}
                        onChange={event => patchStat(stat.id, { valor: event.target.value })}
                      />
                    </Field>

                    <Field label={t('view.edit.stats.label')}>
                    
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
            title={t('view.edit.skills.title')}
            subtitle={t('view.edit.skills.subtitle')}
          >
            <div className="edit-toolbar">
              <input
                type="search"
                className="edit-search"
                placeholder={t('view.edit.skills.search')}
                value={search.habilidades}
                onChange={event => setSearch(prev => ({ ...prev, habilidades: event.target.value }))}
              />

              <button
                type="button"
                className="edit-btn edit-btn-soft"
                onClick={() => addSkill('tecnicas')}
              >
                {t('view.edit.skills.addTech')}
              </button>

              <button
                type="button"
                className="edit-btn edit-btn-primary"
                onClick={() => addSkill('blandas')}
              >
                {t('view.edit.skills.addSoft')}
              </button>
            </div>

            <div className="edit-subtitle-row">
              <span>{t('view.skills.technical')}</span>
            </div>

            {!filteredTecnicas.length && (
              <EmptyState>{t('view.edit.skills.emptyTech')}</EmptyState>
            )}

            <div className="edit-list">
              {filteredTecnicas.map(skill => (
                <SkillEditor
                  key={skill.id}
                  skill={skill}
                  onPatch={patch => patchSkill('tecnicas', skill.id, patch)}
                  t={t}
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
              <span>{t('view.skills.soft')}</span>
            </div>

            {!filteredBlandas.length && (
              <EmptyState>{t('view.edit.skills.emptySoft')}</EmptyState>
            )}

            <div className="edit-list">
              {filteredBlandas.map(skill => (
                <SkillEditor
                  key={skill.id}
                  skill={skill}
                  onPatch={patch => patchSkill('blandas', skill.id, patch)}
                  t={t}
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
            title={t('view.edit.experience.title')}
            subtitle={t('view.edit.experience.subtitle')}
          >
            <div className="edit-toolbar">
              <input
                type="search"
                className="edit-search"
                placeholder={t('view.edit.experience.search')}
                value={search.experiencias}
                onChange={event => setSearch(prev => ({ ...prev, experiencias: event.target.value }))}
              />

              <button
                type="button"
                className="edit-btn edit-btn-soft"
                onClick={() => addExperience('laboral')}
              >
                {t('view.edit.experience.addWork')}
              </button>

              <button
                type="button"
                className="edit-btn edit-btn-primary"
                onClick={() => addExperience('academico')}
              >
                {t('view.edit.experience.addAcademic')}
              </button>
            </div>

            {!filteredExperiencias.length && (
              <EmptyState>{t('view.edit.experience.empty')}</EmptyState>
            )}

            <div className="edit-list">
              {filteredExperiencias.map(exp => (
                <article key={exp.id} className="edit-card">
                  <div className="edit-card-head">
                    <strong>{exp.cargo || t('view.experience.title')}</strong>

                    <button
                      type="button"
                      className="edit-icon-btn danger"
                      onClick={() => requestDelete({
                        type: 'experience',
                        id: exp.id,
                        label: exp.cargo,
                      })}
                    >
                      {t('actions.delete')}
                    </button>
                  </div>

                  <div className="edit-grid">
                    <Field label={t('view.projects.type')}>
                      
                      <select
                        value={exp.tipo || 'laboral'}
                        onChange={event => patchExperience(exp.id, { tipo: event.target.value })}
                      >
                        {EXPERIENCE_TYPES.map(type => (
                          <option key={type.id} value={type.id}>
                            {t(`view.experience.${type.id === 'academico' ? 'academic' : 'work'}`, {}, type.label)}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label={t('view.projects.period')}>
                      
                      <input
                        value={exp.fechas || ''}
                        onChange={event => patchExperience(exp.id, { fechas: event.target.value })}
                      />
                    </Field>

                    <Field label={t('view.edit.experience.role')} full>
                      
                      <input
                        value={exp.cargo || ''}
                        onChange={event => patchExperience(exp.id, { cargo: event.target.value })}
                      />
                    </Field>

                    <Field label={t('view.edit.experience.organization')} full>
                      
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
                      <span>{t('view.edit.experience.markCurrent')}</span>
                    </label>

                    <Field label={t('view.edit.description')} full>
                      
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
            title={t('view.edit.projects.title')}
            subtitle={t('view.edit.projects.subtitle')}
          >
            <div className="edit-toolbar">
              <input
                type="search"
                className="edit-search"
                placeholder={t('view.edit.projects.search')}
                value={search.proyectos}
                onChange={event => setSearch(prev => ({ ...prev, proyectos: event.target.value }))}
              />

              <button
                type="button"
                className="edit-btn edit-btn-primary"
                onClick={addProject}
              >
                {t('view.edit.projects.add')}
              </button>
            </div>

            {!filteredProyectos.length && (
              <EmptyState>{t('view.edit.projects.empty')}</EmptyState>
            )}

            <div className="edit-list">
              {filteredProyectos.map(project => (
                <article key={project.id} className="edit-card">
                  <div className="edit-card-head">
                    <strong>{project.titulo || t('view.projects.defaultTitle')}</strong>

                    <button
                      type="button"
                      className="edit-icon-btn danger"
                      onClick={() => requestDelete({
                        type: 'project',
                        id: project.id,
                        label: project.titulo,
                      })}
                    >
                      {t('actions.delete')}
                    </button>
                  </div>

                  <div className="edit-grid">
                    <Field label={t('projects.field.title')} full>
                      
                      <input
                        value={project.titulo || ''}
                        onChange={event => patchProject(project.id, { titulo: event.target.value })}
                      />
                    </Field>

                    <Field label={t('view.projects.type')}>
                      
                      <input
                        value={project.tipo || ''}
                        onChange={event => patchProject(project.id, { tipo: event.target.value })}
                      />
                    </Field>

                    <Field label={t('view.edit.projects.year')}>
                      
                      <input
                        value={project.anio || ''}
                        onChange={event => patchProject(project.id, { anio: event.target.value })}
                      />
                    </Field>

                    <Field label={t('view.projects.status')}>
                      
                      <select
                        value={project.estado || 'desarrollo'}
                        onChange={event => patchProject(project.id, { estado: event.target.value })}
                      >
                        <option value="publicado">{t('projects.status.publicado')}</option>
                        <option value="desarrollo">{t('projects.status.en_desarrollo')}</option>
                      </select>
                    </Field>

                    <Field label={t('view.edit.projects.icon')}>
                      
                      <select
                        value={project.icono || 'portfolio'}
                        onChange={event => patchProject(project.id, { icono: event.target.value })}
                      >
                        {PROJECT_ICONS.map(icon => (
                          <option key={icon.id} value={icon.id}>
                            {t(`view.edit.projectIcon.${icon.id}`, {}, icon.label)}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label={t('view.edit.description')} full>
                      
                      <textarea
                        rows={4}
                        value={project.descripcion || ''}
                        onChange={event => patchProject(project.id, { descripcion: event.target.value })}
                      />
                    </Field>

                    <Field label={t('view.edit.projects.technologiesComma')} full>
                      
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

                    <Field label={t('view.projects.video')}>
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
        title={t('view.edit.delete.title')}
        subtitle={t('view.edit.delete.subtitle')}
        message={t('view.edit.delete.message', { item: deleteTarget?.label || t('view.edit.delete.thisItem') })}
        confirmLabel={t('actions.delete')}
        cancelLabel={t('actions.cancel')}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function SkillEditor({ skill, onPatch, onDelete, t }) {
  const percentage = Math.max(0, Math.min(Number(skill.porcentaje) || 0, 100));

  return (
    <article className="edit-card">
      <div className="edit-card-head">
        <strong>{skill.nombre || t('view.edit.skills.default')}</strong>

        <button
          type="button"
          className="edit-icon-btn danger"
          onClick={onDelete}
        >
          {t('actions.delete')}
        </button>
      </div>

      <div className="edit-grid">
        <Field label={t('skills.field.name')}>
          <input
            value={skill.nombre || ''}
            onChange={event => onPatch({ nombre: event.target.value })}
          />
        </Field>

        <Field label={t('skills.field.level')}>
          
          <select
            value={skill.nivel || 'intermedio'}
            onChange={event => onPatch({ nivel: event.target.value })}
          >
            {LEVELS.map(level => (
              <option key={level.id} value={level.id}>
                {t(`skills.level.${level.id}`, {}, level.label)}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t('view.edit.skills.percentage', { percentage })} full>
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

        <Field label={t('view.edit.description')} full>
                      
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
