import ProjectsDotsMenu from './ProjectsDotsMenu';
import '../styles/projects.css';
import { TIPOS_PROYECTO } from '../model/projectsModel';

/* ════════════════════════════════════════
   ProjectCard
   src/features/dashboard/projects/components/ProjectCard.jsx

   Props:
   ─ proyecto     object
   ─ onEditar     fn(proyecto)
   ─ onToggleVis  fn(proyecto)
   ─ onEliminar   fn(proyecto)
════════════════════════════════════════ */

function getStatusClass(estado) {
  return { publicado: 'prj-s-green', desarrollo: 'prj-s-amber', borrador: 'prj-s-gray', archivado: 'prj-s-blue' }[estado] || 'prj-s-gray';
}
function getStatusLabel(p) {
  if (p.estadoLabel) return p.estadoLabel;
  return { publicado: 'Publicado', desarrollo: 'En desarrollo', borrador: 'Borrador', archivado: 'Archivado' }[p.estado] || p.estado;
}

export default function ProjectCard({ proyecto, onEditar, onToggleVis, onEliminar }) {
  const statusClass = getStatusClass(proyecto.estado);
  const statusLabel = getStatusLabel(proyecto);
  const tipoObj     = TIPOS_PROYECTO.find(t => t.value === proyecto.tipo);

  const imgSrc = proyecto.imagenUrl || proyecto.imagen_portada || null;

  return (
    <div className={`prj-card${!proyecto.es_publico ? ' hidden-card' : ''}`}>

      {/* ── Cover ── */}
      <div className="prj-card-cover">
        {imgSrc ? (
          <img className="prj-cover-img" src={imgSrc} alt={proyecto.titulo} loading="lazy" />
        ) : (
          /* Placeholder azul con ícono y texto en blanco */
          <div className="prj-cover-placeholder-blue">
            <svg viewBox="0 0 40 40" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="1.4">
              <rect x="4" y="8" width="32" height="24" rx="3"/>
              <path d="M4 14h32M14 8v6"/>
              <circle cx="20" cy="26" r="4"/>
              <path d="M12 34c0-4.4 3.6-8 8-8s8 3.6 8 8"/>
            </svg>
            <span>{proyecto.titulo}</span>
          </div>
        )}
        {imgSrc && <div className="prj-cover-overlay" />}

        {/* Badges */}
        <div className="prj-cover-badges">
          {proyecto.badges?.map(b => (
            <span key={b.label} className={`prj-badge prj-badge-${b.variant}`}>{b.label}</span>
          ))}
          {tipoObj && !proyecto.badges?.find(b => b.label === tipoObj.label) && (
            <span className="prj-badge prj-badge-purple">{tipoObj.label}</span>
          )}
        </div>

        {/* Menú 3 puntos */}
        <ProjectsDotsMenu
          proyecto={proyecto}
          onEditar={onEditar}
          onToggleVis={onToggleVis}
          onEliminar={onEliminar}
        />

        {/* Pill visibilidad */}
        <div className={`prj-vis-pill ${proyecto.es_publico ? 'prj-vpill-pub' : 'prj-vpill-priv'}`}>
          {proyecto.es_publico ? (
            <><svg viewBox="0 0 9 9"><path d="M.5 4.5S2 2 4.5 2 8.5 4.5 8.5 4.5 7 7 4.5 7 .5 4.5.5 4.5z"/><circle cx="4.5" cy="4.5" r="1.2"/></svg>Público</>
          ) : (
            <><svg viewBox="0 0 9 9"><path d="M1 1l7 7M3.5 2a3.5 3.5 0 011 0C6.5 2 8.5 4.5 8.5 4.5S8 5.3 7 6M2 3.3C1.2 4 .5 4.5.5 4.5S2.5 8 5 8"/></svg>Privado</>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="prj-card-body">
        <div className="prj-card-title">{proyecto.titulo}</div>
        <div className="prj-card-desc">{proyecto.descripcion}</div>

        {proyecto.etiquetas?.length > 0 && (
          <div className="prj-stack-tags">
            {proyecto.etiquetas.map(tag => (
              <span key={tag} className="prj-stack-tag">{tag}</span>
            ))}
          </div>
        )}

        <div className="prj-card-footer">
          {proyecto.url_repositorio && (
            <a href={proyecto.url_repositorio} className="prj-card-link" target="_blank" rel="noreferrer">
              <svg viewBox="0 0 11 11"><circle cx="5.5" cy="5.5" r="5"/><path d="M5.5 1a6.5 6.5 0 010 9M1 5.5h9"/></svg>
              Repositorio
            </a>
          )}
          {proyecto.url_demo && (
            <a href={proyecto.url_demo} className="prj-card-link" target="_blank" rel="noreferrer">
              <svg viewBox="0 0 11 11"><path d="M2 2h7v7M2 9l7-7"/></svg>
              Sitio web
            </a>
          )}
          {proyecto.url_video && (
            <a href={proyecto.url_video} className="prj-card-link prj-card-link-yt" target="_blank" rel="noreferrer">
              <svg viewBox="0 0 11 11"><rect x="1" y="2" width="9" height="7" rx="1.5"/><path d="M4.5 4.5l3 1.5-3 1.5z" fill="currentColor" stroke="none"/></svg>
              Demo
            </a>
          )}
          {proyecto.fecha_inicio && (
            <span className="prj-card-year">{new Date(proyecto.fecha_inicio).getFullYear()}</span>
          )}
        </div>
      </div>

      {/* ── Status bar ── */}
      <div className={`prj-card-status ${statusClass}`}>
        <div className="prj-s-dot" />
        {statusLabel}
      </div>
    </div>
  );
}