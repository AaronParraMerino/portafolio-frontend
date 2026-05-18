// src/features/dashboard/view/components/ViewProjects.jsx

import { useState } from 'react';
import ProjectParticipantAvatar from '../../projects/components/ProjectParticipantAvatar';
import { DESARROLLADO_PARA, TIPOS_PROYECTO } from '../../projects/model/projectsModel';
import { normalizeProyectoParticipantes } from '../../projects/services/projectsService';
import '../../projects/styles/projects.css';
import { isVisible } from '../model/viewModel';

function detailVisible(visibilidad, id) {
  return isVisible(visibilidad, 'proyecto_detalles', id);
}

function uniqueNonEmpty(values = []) {
  return [...new Set(values.map(value => String(value || '').trim()).filter(Boolean))];
}

function getTechName(tech) {
  if (typeof tech === 'string') return tech.trim();
  return tech?.nombre || tech?.name || tech?.label || '';
}

function normalizeText(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function getStatusLabel(proyecto = {}) {
  if (proyecto.estadoLabel) return proyecto.estadoLabel;

  return {
    publicado: 'Publicado',
    borrador: 'Borrador',
    archivado: 'Archivado',
    sin_especificar: 'Sin especificar',
    desarrollo: 'En desarrollo',
    en_desarrollo: 'En desarrollo',
    pausado: 'Pausado',
    terminado: 'Terminado',
    mantenimiento: 'Mantenimiento',
    versionado: 'Versionado',
    cancelado: 'Cancelado',
  }[proyecto.estado] || proyecto.estado || 'Borrador';
}

function getStatusPillClass(estado) {
  return {
    publicado: 'prj-pill prj-pill-pub',
    borrador: 'prj-pill prj-pill-draft',
    archivado: 'prj-pill prj-pill-arch',
    sin_especificar: 'prj-pill prj-pill-draft',
    desarrollo: 'prj-pill prj-pill-dev',
    en_desarrollo: 'prj-pill prj-pill-dev',
    pausado: 'prj-pill prj-pill-dev',
    terminado: 'prj-pill prj-pill-draft',
    mantenimiento: 'prj-pill prj-pill-dev',
    versionado: 'prj-pill prj-pill-dev',
    cancelado: 'prj-pill prj-pill-arch',
  }[estado] || 'prj-pill prj-pill-draft';
}

function getTipoLabel(proyecto = {}) {
  const tipoObj = TIPOS_PROYECTO.find(tipo => tipo.value === proyecto.tipo);

  return (
    tipoObj?.label ||
    proyecto.tipoLabel ||
    proyecto.tipo_label ||
    proyecto.tipo ||
    ''
  );
}

function getDesarrolladoLabel(proyecto = {}) {
  const item = DESARROLLADO_PARA.find(op => op.value === proyecto.desarrollado_para);

  return (
    item?.label ||
    proyecto.desarrolladoParaLabel ||
    proyecto.desarrollado_para_label ||
    ''
  );
}

function formatParticipationRole(value = '') {
  const clean = String(value || '').trim().replace(/_/g, ' ').replace(/\s+/g, ' ');

  if (!clean) return '';

  return clean === clean.toLowerCase()
    ? clean.replace(/\b\w/g, letter => letter.toUpperCase())
    : clean;
}

function getMiParticipacion(proyecto = {}) {
  const source =
    proyecto.mi_participacion ||
    proyecto.participacion_usuario ||
    proyecto.participacionUsuario ||
    proyecto.participacion ||
    {};
  const rawRol = source.rol || source.role || source.cargo || proyecto.rol || '';
  const rawRolLabel = source.es_propietario || source.tipo_rol === 'owner'
    ? source.rol_label || 'Owner'
    : source.rol_label === 'Colaborador'
      ? ''
      : source.rol_label || '';
  const rol = formatParticipationRole(rawRol || rawRolLabel);
  const descripcionAporte = String(
    source.descripcion_aporte ||
    source.descripcionAporte ||
    proyecto.descripcion_aporte ||
    ''
  ).trim();

  if (!rol && !descripcionAporte) return null;

  return {
    ...source,
    rol,
    descripcion_aporte: descripcionAporte,
  };
}

function getYearSafe(date) {
  if (!date) return null;

  const d = new Date(date);
  const year = d.getFullYear();

  return Number.isNaN(year) ? null : year;
}

function getPeriodoLabel(proyecto = {}) {
  const inicioYear = getYearSafe(proyecto.fecha_inicio);

  if (!inicioYear) return proyecto.anio || '';

  if (!proyecto.fecha_fin || proyecto.en_curso) {
    return `${inicioYear}`;
  }

  const finYear = getYearSafe(proyecto.fecha_fin);

  if (!finYear || inicioYear === finYear) {
    return `${inicioYear}`;
  }

  return `${inicioYear}-${finYear}`;
}

function formatFecha(date) {
  if (!date) return '';

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';

  return d.toLocaleDateString('es-BO', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

function getYoutubeId(url) {
  if (!url) return null;

  const cleanUrl = String(url).trim();
  const patterns = [
    /youtube\.com\/watch\?v=([\w-]+)/,
    /youtu\.be\/([\w-]+)/,
    /youtube\.com\/embed\/([\w-]+)/,
  ];

  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

function toYoutubeEmbedUrl(url) {
  const id = getYoutubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : '';
}

function getDocumentoUrl(doc) {
  if (!doc) return '';
  if (typeof doc === 'string') return doc;

  return (
    doc.url ||
    doc.ruta ||
    doc.path ||
    doc.archivo_url ||
    doc.archivoUrl ||
    doc.archivo_path ||
    doc.archivoPath ||
    ''
  );
}

function getDocumentoNombre(doc) {
  if (!doc) return 'Documento';

  if (typeof doc === 'string') {
    const clean = doc.split('?')[0];
    return clean.split('/').pop() || 'Documento';
  }

  return (
    doc.nombre ||
    doc.name ||
    doc.filename ||
    doc.nombre_original ||
    doc.titulo ||
    getDocumentoNombre(getDocumentoUrl(doc))
  );
}

function getProjectImages(proyecto = {}) {
  return uniqueNonEmpty([
    ...(Array.isArray(proyecto.imagenes) ? proyecto.imagenes : []),
    proyecto.imagenUrl,
    proyecto.imagen_portada,
  ]);
}

function getProjectVideos(proyecto = {}) {
  return uniqueNonEmpty([
    ...(Array.isArray(proyecto.url_videos) ? proyecto.url_videos : []),
    proyecto.videoUrl,
    proyecto.url_video,
  ]).filter(url => toYoutubeEmbedUrl(url));
}

function getProjectRepos(proyecto = {}) {
  return uniqueNonEmpty([
    ...(Array.isArray(proyecto.repositoriosGithub) ? proyecto.repositoriosGithub : []),
    ...(Array.isArray(proyecto.url_repositorios) ? proyecto.url_repositorios : []),
    proyecto.githubUrl,
    proyecto.url_repositorio,
  ]);
}

function getProjectDocuments(proyecto = {}) {
  if (Array.isArray(proyecto.documentos) && proyecto.documentos.length > 0) {
    return proyecto.documentos
      .map(doc => {
        const url = getDocumentoUrl(doc);
        return url
          ? {
              ...(doc && typeof doc === 'object' ? doc : {}),
              url,
              nombre: getDocumentoNombre(doc),
            }
          : null;
      })
      .filter(Boolean);
  }

  if (proyecto.documento_url) {
    return [{
      url: proyecto.documento_url,
      nombre: proyecto.documento_nombre || 'Documento',
    }];
  }

  return [];
}

function getSitioWebUrl(proyecto = {}) {
  return proyecto.demoUrl || proyecto.url_demo || proyecto.url_sitio_web || proyecto.url_sitioweb || '';
}

function isDarkColor(color = '') {
  const hex = String(color || '').trim().replace('#', '');

  if (!/^[0-9a-f]{6}$/i.test(hex)) {
    return false;
  }

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  return ((r * 299 + g * 587 + b * 114) / 1000) < 96;
}

function colorWithAlpha(color = '', alphaHex = '24') {
  const hex = String(color || '').trim();

  if (/^#[0-9a-f]{6}$/i.test(hex)) {
    return `${hex}${alphaHex}`;
  }

  return '';
}

function getTecnologiaDetalle(proyecto = {}, nombre = '') {
  const detalles = Array.isArray(proyecto.tecnologias_detalle)
    ? proyecto.tecnologias_detalle
    : [];

  return detalles.find(tech => normalizeText(tech.nombre) === normalizeText(nombre)) || {
    nombre,
    icono_url: '',
    color: '',
  };
}

function getExpectedCount(project = {}, fallback = 0) {
  const raw =
    project.participantes_count ??
    project.participants_count ??
    project.colaboradores_count ??
    project.collaborators_count;
  const count = Number(raw);

  return Number.isFinite(count) && count > 0 ? count : fallback;
}

const PARTICIPANT_GROUPS = [
  {
    key: 'usuario_github_validado',
    label: 'Validados',
    match: (participante) => participante.tipo_participante === 'usuario_github_validado'
      || (participante.tiene_cuenta && participante.validacion_github),
  },
  {
    key: 'usuario_sin_validacion_github',
    label: 'Sin validacion',
    match: (participante) => participante.tipo_participante === 'usuario_sin_validacion_github'
      || (participante.id_usuario && !participante.validacion_github),
  },
];

function groupParticipants(participantes = []) {
  const assigned = new Set();

  const groups = PARTICIPANT_GROUPS.map((group) => {
    const items = participantes.filter((participante, index) => {
      if (assigned.has(index) || !group.match(participante)) return false;
      assigned.add(index);
      return true;
    });

    return { ...group, items };
  }).filter(group => group.items.length > 0);

  const unassigned = participantes.filter((_, index) => !assigned.has(index));

  if (unassigned.length > 0) {
    const sinValidacion = groups.find(group => group.key === 'usuario_sin_validacion_github');

    if (sinValidacion) {
      sinValidacion.items = [...sinValidacion.items, ...unassigned];
    } else {
      groups.push({
        key: 'usuario_sin_validacion_github',
        label: 'Sin validacion',
        items: unassigned,
      });
    }
  }

  return groups;
}

function getVisibleParticipants(proyecto = {}) {
  return normalizeProyectoParticipantes(proyecto, { includeCurrentUserFallback: false });
}

function TechChip({ proyecto, tag, detail = false }) {
  const tech = getTecnologiaDetalle(proyecto, tag);
  const dark = isDarkColor(tech.color);
  const style = tech.color
    ? {
        '--tech-color': tech.color,
        '--tech-bg': dark ? '#111827' : colorWithAlpha(tech.color, '24'),
        '--tech-text': dark ? '#ffffff' : '#111827',
      }
    : undefined;

  return (
    <span className={`prj-tag-chip prj-tech-chip prj-project-tech-chip${detail ? ' detail' : ''}${dark ? ' dark' : ''}`} style={style}>
      <span className="prj-tech-chip-icon" aria-hidden="true">
        {tech.icono_url ? (
          <img src={tech.icono_url} alt="" />
        ) : (
          tag.slice(0, 1).toUpperCase()
        )}
      </span>
      <span className="prj-tech-chip-label">{tag}</span>
    </span>
  );
}

function CoverIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="1.6">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M7 8l-3 3 3 3M17 8l3 3-3 3M13 6l-2 12" />
    </svg>
  );
}

const IconGitHub = () => (
  <svg viewBox="0 0 10 10" width="10" height="10">
    <path
      d="M5 0C2.2 0 0 2.3 0 5c0 2.2 1.4 4.1 3.4 4.8.3 0 .4-.1.4-.2v-.9
         c-1.4.3-1.7-.6-1.7-.6-.2-.6-.6-.7-.6-.7-.4-.3 0-.3 0-.3
         .5 0 .8.5.8.5.4.8 1.2.5 1.5.4 0-.3.2-.5.3-.7
         -1.1-.1-2.3-.6-2.3-2.5 0-.5.2-1 .5-1.3
         0-.1-.2-.6 0-1.3 0 0 .4-.1 1.4.5
         .4-.1.8-.2 1.2-.2.4 0 .8.1 1.2.2
         1-.7 1.4-.5 1.4-.5.2.7 0 1.2 0 1.3
         .3.4.5.8.5 1.3 0 1.9-1.1 2.3-2.3 2.5
         .2.1.3.4.3.9v1.4c0 .1.1.3.4.2
         C8.6 9.1 10 7.2 10 5c0-2.7-2.2-5-5-5z"
      fill="currentColor"
    />
  </svg>
);

const IconSite = () => (
  <svg viewBox="0 0 10 10" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M2 2h6v6M2 8l6-6" />
  </svg>
);

const IconYouTube = () => (
  <svg viewBox="0 0 12 9" width="12" height="9">
    <rect x="0" y="0" width="12" height="9" rx="2" fill="currentColor" />
    <polygon points="4.5,2 9,4.5 4.5,7" fill="#fff" />
  </svg>
);

const IconDocument = () => (
  <svg viewBox="0 0 12 14" width="10" height="12" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M3 1h4l3 3v9H3a1 1 0 01-1-1V2a1 1 0 011-1z" />
    <path d="M7 1v4h3" />
  </svg>
);

const IconChevron = ({ open }) => (
  <svg
    viewBox="0 0 12 8"
    width="11"
    height="8"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    style={{ transform: open ? 'rotate(180deg)' : 'none' }}
  >
    <path d="M1 1l5 5 5-5" />
  </svg>
);

function DetailRow({ label, children }) {
  if (!children) return null;

  return (
    <div className="prj-detail-row">
      <span className="prj-detail-label">{label}</span>
      <div className="prj-detail-value">{children}</div>
    </div>
  );
}

function DetailLink({ href, children, className = '' }) {
  if (!href) return null;

  return (
    <a
      href={href}
      className={`prj-detail-link ${className}`}
      target="_blank"
      rel="noreferrer"
      title={href}
    >
      {children}
    </a>
  );
}

function ParticipantsList({ participantes = [] }) {
  if (participantes.length === 0) return null;

  return (
    <div className="prj-collab-avatar-stack">
      {participantes.map((participante, index) => (
        <ProjectParticipantAvatar
          key={`${participante.id || participante.id_usuario || participante.github_username || index}`}
          participante={participante}
        />
      ))}
    </div>
  );
}

function ParticipantGroup({ label, participantes = [] }) {
  if (participantes.length === 0) return null;

  return (
    <div className="prj-collab-row">
      <div className="prj-collab-label">
        <span>{label}</span>
        <span>{participantes.length}</span>
      </div>
      <ParticipantsList participantes={participantes} />
    </div>
  );
}

function ViewProjectParticipants({ proyecto = {}, participantes = [], detail = false }) {
  if (participantes.length === 0) return null;

  const groupedParticipants = groupParticipants(participantes);

  return (
    <div className={`prj-collaborators${detail ? ' detail' : ''}`}>
      <div className="prj-collab-head">
        <span>Participantes</span>
        <span>{Math.max(getExpectedCount(proyecto, participantes.length), participantes.length)}</span>
      </div>

      <div className="prj-collab-groups">
        {groupedParticipants.map((group) => (
          <ParticipantGroup
            key={group.key}
            label={group.label}
            participantes={group.items}
          />
        ))}
      </div>
    </div>
  );
}

function useProjectMedia({ proyecto, showMedia, showVideos }) {
  const [idx, setIdx] = useState(0);
  const [mediaExpandida, setMediaExpandida] = useState(false);
  const images = getProjectImages(proyecto);
  const videos = showVideos ? getProjectVideos(proyecto) : [];
  const media = showMedia
    ? [
        ...images.map(url => ({ tipo: 'imagen', url })),
        ...videos.map(url => ({ tipo: 'youtube', url, embedUrl: toYoutubeEmbedUrl(url) })),
      ]
    : [];
  const safeIdx = media.length ? Math.min(idx, media.length - 1) : 0;
  const hasMedia = media.length > 0;
  const hasMultiple = media.length > 1;

  const goTo = (nextIdx, event) => {
    event?.stopPropagation();
    if (!media.length) return;
    setIdx((nextIdx + media.length) % media.length);
  };

  return {
    mediaExpandida,
    cover: (
      <div className="prj-card-cover-wrap">
        <div className="prj-card-cover">
          {hasMedia ? (
            <div className="prj-carousel">
              <div
                className="prj-carousel-track"
                style={{ transform: `translateX(-${safeIdx * 100}%)` }}
              >
                {media.map((item, i) => (
                  <div key={`${item.tipo}-${item.url}-${i}`} className="prj-carousel-slide">
                    {item.tipo === 'imagen' ? (
                      <img
                        src={item.url}
                        alt={`${proyecto.titulo || 'Proyecto'} imagen ${i + 1}`}
                        className="prj-carousel-img"
                        loading={i === 0 ? 'eager' : 'lazy'}
                        draggable={false}
                      />
                    ) : (
                      <div className="prj-carousel-video-wrap">
                        {i === safeIdx ? (
                          <iframe
                            className="prj-carousel-video"
                            src={item.embedUrl}
                            title={`${proyecto.titulo || 'Proyecto'} video ${i + 1}`}
                            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="strict-origin-when-cross-origin"
                          />
                        ) : (
                          <div className="prj-carousel-video-placeholder" aria-hidden="true">
                            <IconYouTube />
                            <span>Video</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {media[safeIdx]?.tipo === 'imagen' && <div className="prj-cover-overlay" />}

              {media[safeIdx]?.tipo === 'youtube' && (
                <span className="prj-carousel-video-badge">
                  <IconYouTube /> Video
                </span>
              )}

              {hasMultiple && (
                <>
                  <button
                    type="button"
                    className="prj-carousel-arrow prj-carousel-prev"
                    onClick={(event) => goTo(safeIdx - 1, event)}
                    title="Anterior"
                    aria-label="Medio anterior"
                  >
                    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 3L5 8l5 5" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="prj-carousel-arrow prj-carousel-next"
                    onClick={(event) => goTo(safeIdx + 1, event)}
                    title="Siguiente"
                    aria-label="Medio siguiente"
                  >
                    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 3l5 5-5 5" />
                    </svg>
                  </button>

                  <div className="prj-carousel-dots">
                    {media.map((item, i) => (
                      <button
                        key={`dot-${item.tipo}-${item.url}-${i}`}
                        type="button"
                        className={`prj-carousel-dot${i === safeIdx ? ' active' : ''}${item.tipo === 'youtube' ? ' video' : ''}`}
                        onClick={(event) => goTo(i, event)}
                        title={`Ir a ${item.tipo === 'youtube' ? 'video' : 'imagen'} ${i + 1}`}
                        aria-label={`Ir a ${item.tipo === 'youtube' ? 'video' : 'imagen'} ${i + 1}`}
                      />
                    ))}
                  </div>

                  <span className="prj-carousel-counter">
                    {safeIdx + 1}&thinsp;/&thinsp;{media.length}
                  </span>
                </>
              )}
            </div>
          ) : (
            <div className="prj-cover-solid">
              <div className="prj-cover-glow" />
              <div className="prj-cover-icon-box">
                <CoverIcon />
              </div>
            </div>
          )}
        </div>

        {hasMedia && (
          <button
            type="button"
            className="prj-cover-expand-btn"
            onClick={(event) => {
              event.stopPropagation();
              setMediaExpandida(value => !value);
            }}
            aria-pressed={mediaExpandida}
            aria-label={mediaExpandida ? 'Reducir galeria del proyecto' : 'Ampliar galeria del proyecto'}
            title={mediaExpandida ? 'Reducir galeria' : 'Ampliar galeria'}
          >
            {mediaExpandida ? 'Reducir galeria' : 'Ampliar galeria'}
            <IconChevron open={mediaExpandida} />
          </button>
        )}
      </div>
    ),
  };
}

function ViewProjectCard({ proyecto, visibilidad }) {
  const [detallesExpandidos, setDetallesExpandidos] = useState(false);
  const showMedia = detailVisible(visibilidad, 'media');
  const showEstado = detailVisible(visibilidad, 'estado');
  const showTipo = detailVisible(visibilidad, 'tipo');
  const showDescripcion = detailVisible(visibilidad, 'descripcion');
  const showTecnologias = detailVisible(visibilidad, 'tecnologias');
  const showRepositorios = detailVisible(visibilidad, 'repositorios');
  const showDemo = detailVisible(visibilidad, 'demo');
  const showVideos = detailVisible(visibilidad, 'videos');
  const showDocumentos = detailVisible(visibilidad, 'documentos');
  const showFechas = detailVisible(visibilidad, 'fechas');
  const showRol = detailVisible(visibilidad, 'rol');
  const showAporte = detailVisible(visibilidad, 'aporte');
  const showParticipantes = detailVisible(visibilidad, 'participantes');

  const media = useProjectMedia({ proyecto, showMedia, showVideos });
  const statusLabel = getStatusLabel(proyecto);
  const pillClass = getStatusPillClass(proyecto.estado);
  const tipoLabel = getTipoLabel(proyecto);
  const desarrolladoLabel = getDesarrolladoLabel(proyecto);
  const periodoLabel = getPeriodoLabel(proyecto);
  const repositorios = getProjectRepos(proyecto);
  const videos = getProjectVideos(proyecto);
  const documentos = getProjectDocuments(proyecto);
  const sitioWebUrl = getSitioWebUrl(proyecto);
  const techs = uniqueNonEmpty([
    ...(Array.isArray(proyecto.tecnologias) ? proyecto.tecnologias.map(getTechName) : []),
    ...(Array.isArray(proyecto.etiquetas) ? proyecto.etiquetas.map(getTechName) : []),
  ]);
  const miParticipacion = getMiParticipacion(proyecto);
  const miRol = miParticipacion?.rol || '';
  const miAporte = miParticipacion?.descripcion_aporte || '';
  const participantes = getVisibleParticipants(proyecto);

  const hasBadges = showEstado || showTipo || (showRol && miRol);
  const hasFooter = (showRepositorios && repositorios.length > 0)
    || (showDemo && sitioWebUrl)
    || (showVideos && videos.length > 0)
    || (showDocumentos && documentos.length > 0)
    || (showFechas && periodoLabel);
  const hasParticipants = showParticipantes && participantes.length > 0;
  const hasDetails = (showDescripcion && proyecto.descripcion)
    || (showAporte && miAporte)
    || (showEstado && statusLabel)
    || (showTipo && (tipoLabel || desarrolladoLabel))
    || (showFechas && periodoLabel)
    || (showRol && miRol)
    || (showTecnologias && techs.length > 0)
    || (showRepositorios && repositorios.length > 0)
    || (showDemo && sitioWebUrl)
    || (showVideos && videos.length > 0)
    || (showDocumentos && documentos.length > 0)
    || hasParticipants;

  return (
    <article
      className={[
        'prj-card',
        'prj-view-card',
        media.mediaExpandida ? 'media-open' : '',
        detallesExpandidos ? 'details-open' : '',
      ].filter(Boolean).join(' ')}
    >
      {media.cover}

      <div className="prj-card-body">
        {hasBadges && (
          <div className="prj-proj-badges">
            {showEstado && <span className={pillClass}>{statusLabel}</span>}

            {showTipo && tipoLabel && (
              <span className="prj-pill prj-pill-type">
                {tipoLabel}
              </span>
            )}

            {showTipo && desarrolladoLabel && (
              <span className="prj-pill prj-pill-device">
                Para: {desarrolladoLabel}
              </span>
            )}

            {showRol && miRol && (
              <span className="prj-pill prj-pill-role">
                Rol: {miRol}
              </span>
            )}
          </div>
        )}

        <div className="prj-card-title">{proyecto.titulo || 'Proyecto'}</div>

        {!detallesExpandidos && showDescripcion && proyecto.descripcion && (
          <div className="prj-card-desc">{proyecto.descripcion}</div>
        )}

        {!detallesExpandidos && showAporte && miAporte && (
          <div className="prj-card-contribution">
            <span>Mi aporte</span>
            <p>{miAporte}</p>
          </div>
        )}

        {!detallesExpandidos && showTecnologias && techs.length > 0 && (
          <div className="prj-stack-tags">
            {techs.map(tag => (
              <TechChip key={tag} proyecto={proyecto} tag={tag} />
            ))}
          </div>
        )}

        {!detallesExpandidos && hasFooter && (
          <div className="prj-card-footer">
            <div className="prj-proj-links">
              {showRepositorios && repositorios.map((url, i) => (
                <a key={`repo-${url}-${i}`} href={url} className="prj-proj-link prj-proj-link-gh" target="_blank" rel="noreferrer" title={url}>
                  <IconGitHub /> GitHub {repositorios.length > 1 ? i + 1 : ''}
                </a>
              ))}

              {showDemo && sitioWebUrl && (
                <a href={sitioWebUrl} className="prj-proj-link prj-proj-link-demo" target="_blank" rel="noreferrer">
                  <IconSite /> Sitio web
                </a>
              )}

              {showVideos && videos.map((url, i) => (
                <a key={`video-${url}-${i}`} href={url} className="prj-proj-link prj-proj-link-yt" target="_blank" rel="noreferrer" title={url}>
                  <IconYouTube /> Video {videos.length > 1 ? i + 1 : ''}
                </a>
              ))}

              {showDocumentos && documentos.map((doc, i) => (
                <a key={`doc-${doc.url}-${i}`} href={doc.url} className="prj-proj-link prj-proj-link-doc" target="_blank" rel="noreferrer" title={doc.nombre}>
                  <IconDocument /> Doc {documentos.length > 1 ? i + 1 : ''}
                </a>
              ))}
            </div>

            {showFechas && periodoLabel && (
              <span className="prj-year-pill">
                {periodoLabel}
              </span>
            )}
          </div>
        )}

        {!detallesExpandidos && hasParticipants && (
          <ViewProjectParticipants proyecto={proyecto} participantes={participantes} />
        )}

        {hasDetails && (
          <div className="prj-card-actions">
            <button
              type="button"
              className="prj-card-toggle-details"
              onClick={(event) => {
                event.stopPropagation();
                setDetallesExpandidos(value => !value);
              }}
            >
              {detallesExpandidos ? 'Ocultar detalles' : 'Ver detalles'}
              <IconChevron open={detallesExpandidos} />
            </button>
          </div>
        )}

        {detallesExpandidos && (
          <div className="prj-details-panel">
            {showDescripcion && proyecto.descripcion && (
              <div className="prj-detail-description">
                {proyecto.descripcion}
              </div>
            )}

            {showAporte && miAporte && (
              <div className="prj-card-contribution">
                <span>Mi aporte</span>
                <p>{miAporte}</p>
              </div>
            )}

            <div className="prj-detail-grid">
              {showEstado && (
                <DetailRow label="Estado">
                  <span className={pillClass}>{statusLabel}</span>
                </DetailRow>
              )}

              {showRol && (
                <DetailRow label="Mi rol">
                  {miRol}
                </DetailRow>
              )}

              {showTipo && (
                <DetailRow label="Tipo">
                  {tipoLabel}
                </DetailRow>
              )}

              {showTipo && (
                <DetailRow label="Desarrollado para">
                  {desarrolladoLabel}
                </DetailRow>
              )}

              {showFechas && (
                <DetailRow label="Periodo">
                  {periodoLabel}
                  {proyecto.fecha_inicio && (
                    <span className="prj-detail-muted">
                      Inicio: {formatFecha(proyecto.fecha_inicio)}
                      {proyecto.en_curso
                        ? ' - En curso'
                        : proyecto.fecha_fin
                          ? ` - Fin: ${formatFecha(proyecto.fecha_fin)}`
                          : ''}
                    </span>
                  )}
                </DetailRow>
              )}
            </div>

            {showTecnologias && techs.length > 0 && (
              <div className="prj-detail-section">
                <div className="prj-detail-section-title">Tecnologias</div>
                <div className="prj-detail-tags">
                  {techs.map(tag => (
                    <TechChip key={`detail-${tag}`} proyecto={proyecto} tag={tag} detail />
                  ))}
                </div>
              </div>
            )}

            {(showRepositorios && repositorios.length > 0)
              || (showDemo && sitioWebUrl)
              || (showVideos && videos.length > 0)
              || (showDocumentos && documentos.length > 0) ? (
                <div className="prj-detail-section">
                  <div className="prj-detail-section-title">Enlaces</div>

                  <div className="prj-detail-links">
                    {showRepositorios && repositorios.map((url, i) => (
                      <DetailLink key={`detail-repo-${url}-${i}`} href={url} className="gh">
                        <IconGitHub /> Repositorio GitHub {repositorios.length > 1 ? i + 1 : ''}
                      </DetailLink>
                    ))}

                    {showDemo && (
                      <DetailLink href={sitioWebUrl} className="site">
                        <IconSite /> Sitio web
                      </DetailLink>
                    )}

                    {showVideos && videos.map((url, i) => (
                      <DetailLink key={`detail-video-${url}-${i}`} href={url} className="yt">
                        <IconYouTube /> Video YouTube {videos.length > 1 ? i + 1 : ''}
                      </DetailLink>
                    ))}

                    {showDocumentos && documentos.map((doc, i) => (
                      <DetailLink key={`detail-doc-${doc.url}-${i}`} href={doc.url} className="doc">
                        <IconDocument /> {doc.nombre || `Documento ${i + 1}`}
                      </DetailLink>
                    ))}
                  </div>
                </div>
              ) : null}

            {hasParticipants && (
              <ViewProjectParticipants proyecto={proyecto} participantes={participantes} detail />
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default function ViewProjects({ proyectos = [], visibilidad }) {
  const visibles = proyectos.filter(proyecto =>
    isVisible(visibilidad, 'proyectos', proyecto.id)
  );

  if (!visibles.length) return null;

  return (
    <section className="pf-sec">
      <div className="pf-sec-top">
        <div>
          <h2 className="pf-sec-title">Proyectos</h2>
          <div className="pf-sec-subtitle">Portafolio destacado</div>
        </div>
      </div>

      <div className="prj-grid prj-view-grid">
        {visibles.map((proyecto, index) => (
          <ViewProjectCard
            key={proyecto.id || proyecto.backendId || index}
            proyecto={proyecto}
            visibilidad={visibilidad}
          />
        ))}
      </div>
    </section>
  );
}
