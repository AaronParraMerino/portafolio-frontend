import DotsMenu from './DotsMenu';
import '../styles/projects.css';
import { TIPOS_PROYECTO } from '../model/projectsModel';

/* ════════════════════════════════════════
   ProjectCard
   src/features/dashboard/projects/components/ProjectCard.jsx
════════════════════════════════════════ */

function getStatusClass(estado) {
  return { publicado: 'prj-s-green', desarrollo: 'prj-s-amber', borrador: 'prj-s-gray', archivado: 'prj-s-blue' }[estado] || 'prj-s-gray';
}
function getStatusLabel(p) {
  if (p.estadoLabel) return p.estadoLabel;
  return { publicado: 'Publicado', desarrollo: 'En desarrollo', borrador: 'Borrador', archivado: 'Archivado' }[p.estado] || p.estado;
}
function getTipoLabel(tipo) {
  return TIPOS_PROYECTO.find(t => t.value === tipo)?.label || null;
}

export default function ProjectCard({ proyecto, onEditar, onToggleVis, onEliminar }) {
  const statusClass = getStatusClass(proyecto.estado);
  const statusLabel = getStatusLabel(proyecto);
  const tipoLabel   = getTipoLabel(proyecto.tipo);

  return (
    <div className={`prj-card${!proyecto.es_publico ? ' hidden-card' : ''}`}>

      {/* ── Cover ── */}
      <div className="prj-card-cover">
        {proyecto.imagenUrl || proyecto.imagen_portada ? (
          <img
            className="prj-cover-img"
            src={proyecto.imagenUrl || proyecto.imagen_portada}
            alt={proyecto.titulo}
            loading="lazy"
          />
        ) : (
          <div className="prj-cover-placeholder">
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            <span>Sin imagen de portada</span>
          </div>
        )}
        <div className="prj-cover-overlay" />

        {/* Badges (estado + tipo si existe) */}
        <div className="prj-cover-badges">
          {proyecto.badges?.map(b => (
            <span key={b.label} className={`prj-badge prj-badge-${b.variant}`}>{b.label}</span>
          ))}
          {tipoLabel && !proyecto.badges?.find(b => b.label === tipoLabel) && (
            <span className="prj-badge prj-badge-purple">{tipoLabel}</span>
          )}
        </div>

        {/* Menú 3 puntos */}
        <DotsMenu
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