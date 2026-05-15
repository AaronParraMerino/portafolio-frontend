import { useState } from 'react';
import ProjectsDotsMenu from './ProjectsDotsMenu';
import ProjectsGithubCollaborators from './ProjectsGithubCollaborators';
import '../styles/projects.css';
import { TIPOS_PROYECTO, DESARROLLADO_PARA } from '../model/projectsModel';

/* ════════════════════════════════════════
   Helpers de estado
════════════════════════════════════════ */
function getStatusLabel(p = {}) {
  if (p.estadoLabel) return p.estadoLabel;

  return {
    publicado: 'Publicado',
    borrador: 'Borrador',
    archivado: 'Archivado',
    sin_especificar: 'Sin especificar',
    en_desarrollo: 'En desarrollo',
    pausado: 'Pausado',
    terminado: 'Terminado',
    mantenimiento: 'Mantenimiento',
    versionado: 'Versionado',
    cancelado: 'Cancelado',
  }[p.estado] || p.estado || 'Borrador';
}

function getStatusPillClass(estado) {
  return {
    publicado: 'prj-pill prj-pill-pub',
    borrador: 'prj-pill prj-pill-draft',
    archivado: 'prj-pill prj-pill-arch',
    sin_especificar: 'prj-pill prj-pill-draft',
    en_desarrollo: 'prj-pill prj-pill-dev',
    pausado: 'prj-pill prj-pill-dev',
    terminado: 'prj-pill prj-pill-draft',
    mantenimiento: 'prj-pill prj-pill-dev',
    versionado: 'prj-pill prj-pill-dev',
    cancelado: 'prj-pill prj-pill-arch',
  }[estado] || 'prj-pill prj-pill-draft';
}

function getYearSafe(date) {
  if (!date) return null;

  const d = new Date(date);
  const year = d.getFullYear();

  return Number.isNaN(year) ? null : year;
}

function getPeriodoLabel(proyecto = {}) {
  const inicioYear = getYearSafe(proyecto.fecha_inicio);

  if (!inicioYear) return '';

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

/* ════════════════════════════════════════
   Helpers YouTube
════════════════════════════════════════ */
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

/* ════════════════════════════════════════
   Helpers documentos
════════════════════════════════════════ */
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

/* ════════════════════════════════════════
   Helpers enlaces
════════════════════════════════════════ */
function normalizarRepositorios(proyecto = {}) {
  if (Array.isArray(proyecto.url_repositorios) && proyecto.url_repositorios.length > 0) {
    return proyecto.url_repositorios
      .filter(Boolean)
      .map(url => String(url).trim());
  }

  return proyecto.url_repositorio
    ? [proyecto.url_repositorio]
    : [];
}

function normalizarVideos(proyecto = {}) {
  if (Array.isArray(proyecto.url_videos) && proyecto.url_videos.length > 0) {
    return proyecto.url_videos
      .filter(Boolean)
      .map(url => String(url).trim())
      .filter(url => toYoutubeEmbedUrl(url));
  }

  return proyecto.url_video && toYoutubeEmbedUrl(proyecto.url_video)
    ? [proyecto.url_video]
    : [];
}

function normalizarDocumentos(proyecto = {}) {
  if (Array.isArray(proyecto.documentos) && proyecto.documentos.length > 0) {
    return proyecto.documentos.filter(doc => getDocumentoUrl(doc));
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
  return (
    proyecto.url_demo ||
    proyecto.url_sitio_web ||
    proyecto.url_sitioweb ||
    ''
  );
}

function getTipoLabel(proyecto = {}) {
  const tipoObj = TIPOS_PROYECTO.find(t => t.value === proyecto.tipo);

  return (
    tipoObj?.label ||
    proyecto.tipoLabel ||
    proyecto.tipo_label ||
    proyecto.tipo ||
    ''
  );
}

function getDesarrolladoLabel(proyecto = {}) {
  const desarrolladoObj = DESARROLLADO_PARA.find(d => d.value === proyecto.desarrollado_para);

  return (
    desarrolladoObj?.label ||
    proyecto.desarrolladoParaLabel ||
    proyecto.desarrollado_para_label ||
    ''
  );
}

function normalizarTexto(value) {
  return String(value || '').trim().toLowerCase();
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

  return detalles.find(tech => normalizarTexto(tech.nombre) === normalizarTexto(nombre)) || {
    nombre,
    icono_url: '',
    color: '',
  };
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

/* ════════════════════════════════════════
   Íconos
════════════════════════════════════════ */
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

/* ════════════════════════════════════════
   Subcomponentes
════════════════════════════════════════ */
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

/* ════════════════════════════════════════
   ProjectCard
════════════════════════════════════════ */
export default function ProjectCard({
  proyecto = {},
  onEditar,
  onEliminar,
  onDesvincular,
  onConfigurar,
  onEstadoProyecto,
}) {
  const [idx, setIdx] = useState(0);
  const [mediaExpandida, setMediaExpandida] = useState(false);
  const [detallesExpandidos, setDetallesExpandidos] = useState(false);

  const statusLabel = getStatusLabel(proyecto);
  const pillClass = getStatusPillClass(proyecto.estado);
  const periodoLabel = getPeriodoLabel(proyecto);

  const tipoLabel = getTipoLabel(proyecto);
  const desarrolladoLabel = getDesarrolladoLabel(proyecto);
  const sitioWebUrl = getSitioWebUrl(proyecto);

  const imagenes = (() => {
    if (Array.isArray(proyecto.imagenes) && proyecto.imagenes.length > 0) {
      return proyecto.imagenes.filter(Boolean);
    }

    const url = proyecto.imagenUrl || proyecto.imagen_portada || null;
    return url ? [url] : [];
  })();

  const videosYoutube = normalizarVideos(proyecto);
  const repositoriosGithub = normalizarRepositorios(proyecto);
  const documentos = normalizarDocumentos(proyecto);

  const media = [
    ...imagenes.map((url) => ({
      tipo: 'imagen',
      url,
    })),
    ...videosYoutube.map((url) => ({
      tipo: 'youtube',
      url,
      embedUrl: toYoutubeEmbedUrl(url),
    })),
  ];

  const hayMedia = media.length > 0;
  const hayMultiples = media.length > 1;

  const hayDetallesExtra =
    proyecto.descripcion ||
    proyecto.etiquetas?.length > 0 ||
    tipoLabel ||
    desarrolladoLabel ||
    periodoLabel ||
    repositoriosGithub.length > 0 ||
    sitioWebUrl ||
    videosYoutube.length > 0 ||
    documentos.length > 0;

  const irA = (nuevoIdx, e) => {
    e?.stopPropagation();
    if (!media.length) return;
    setIdx((nuevoIdx + media.length) % media.length);
  };

  const toggleMedia = (e) => {
    e.stopPropagation();
    setMediaExpandida(v => !v);
  };

  const toggleDetalles = (e) => {
    e.stopPropagation();
    setDetallesExpandidos(v => !v);
  };

  return (
    <div
      className={[
        'prj-card',
        mediaExpandida ? 'media-open' : '',
        detallesExpandidos ? 'details-open' : '',
      ].filter(Boolean).join(' ')}
    >
      <div className="prj-card-cover-wrap">
        <div className="prj-card-cover">
          {hayMedia ? (
            <div className="prj-carousel">
              <div
                className="prj-carousel-track"
                style={{ transform: `translateX(-${idx * 100}%)` }}
              >
                {media.map((item, i) => (
                  <div key={`${item.tipo}-${i}`} className="prj-carousel-slide">
                    {item.tipo === 'imagen' ? (
                      <img
                        src={item.url}
                        alt={`${proyecto.titulo || 'Proyecto'} – imagen ${i + 1}`}
                        className="prj-carousel-img"
                        loading={i === 0 ? 'eager' : 'lazy'}
                        draggable={false}
                      />
                    ) : (
                      <div className="prj-carousel-video-wrap">
                        <iframe
                          className="prj-carousel-video"
                          src={item.embedUrl}
                          title={`${proyecto.titulo || 'Proyecto'} – video ${i + 1}`}
                          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {media[idx]?.tipo === 'imagen' && <div className="prj-cover-overlay" />}

              {media[idx]?.tipo === 'youtube' && (
                <span className="prj-carousel-video-badge">
                  <IconYouTube /> Video
                </span>
              )}

              {hayMultiples && (
                <>
                  <button
                    type="button"
                    className="prj-carousel-arrow prj-carousel-prev"
                    onClick={(e) => irA(idx - 1, e)}
                    title="Anterior"
                  >
                    <svg
                      viewBox="0 0 16 16"
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M10 3L5 8l5 5" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="prj-carousel-arrow prj-carousel-next"
                    onClick={(e) => irA(idx + 1, e)}
                    title="Siguiente"
                  >
                    <svg
                      viewBox="0 0 16 16"
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 3l5 5-5 5" />
                    </svg>
                  </button>

                  <div className="prj-carousel-dots">
                    {media.map((item, i) => (
                      <button
                        key={`dot-${item.tipo}-${i}`}
                        type="button"
                        className={`prj-carousel-dot${i === idx ? ' active' : ''}${item.tipo === 'youtube' ? ' video' : ''}`}
                        onClick={(e) => irA(i, e)}
                        title={`Ir a ${item.tipo === 'youtube' ? 'video' : 'imagen'} ${i + 1}`}
                      />
                    ))}
                  </div>

                  <span className="prj-carousel-counter">
                    {idx + 1}&thinsp;/&thinsp;{media.length}
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

        {hayMedia && (
          <button
            type="button"
            className="prj-cover-expand-btn"
            onClick={toggleMedia}
            aria-pressed={mediaExpandida}
            aria-label={mediaExpandida ? 'Reducir galeria del proyecto' : 'Ampliar galeria del proyecto'}
            title={mediaExpandida ? 'Reducir galería' : 'Ampliar galería'}
          >
            {mediaExpandida ? 'Reducir galería' : 'Ampliar galería'}
            <IconChevron open={mediaExpandida} />
          </button>
        )}

        <div className="prj-dots-anchor">
          <ProjectsDotsMenu
            proyecto={proyecto}
            onEditar={onEditar}
            onEliminar={onEliminar}
            onDesvincular={onDesvincular}
            onConfigurar={onConfigurar}
            onEstadoProyecto={onEstadoProyecto}
          />
        </div>
      </div>

      <div className="prj-card-body">
        <div className="prj-proj-badges">
          <span className={pillClass}>{statusLabel}</span>

          {tipoLabel && (
            <span className="prj-pill prj-pill-type">
              {tipoLabel}
            </span>
          )}

          {desarrolladoLabel && (
            <span className="prj-pill prj-pill-device">
              Para: {desarrolladoLabel}
            </span>
          )}

          {proyecto.badges?.filter(b => b.variant === 'purple').map(b => (
            <span key={b.label} className="prj-pill prj-pill-type">{b.label}</span>
          ))}
        </div>

        <div className="prj-card-title">{proyecto.titulo || 'Sin título'}</div>

        {!detallesExpandidos && proyecto.descripcion && (
          <div className="prj-card-desc">{proyecto.descripcion}</div>
        )}

        {!detallesExpandidos && proyecto.etiquetas?.length > 0 && (
          <div className="prj-stack-tags">
            {proyecto.etiquetas.map(tag => (
              <TechChip key={tag} proyecto={proyecto} tag={tag} />
            ))}
          </div>
        )}

        {!detallesExpandidos && (
          <div className="prj-card-footer">
            <div className="prj-proj-links">
              {repositoriosGithub.map((url, i) => (
                <a
                  key={`repo-${i}`}
                  href={url}
                  className="prj-proj-link prj-proj-link-gh"
                  target="_blank"
                  rel="noreferrer"
                  title={url}
                >
                  <IconGitHub /> GitHub {repositoriosGithub.length > 1 ? i + 1 : ''}
                </a>
              ))}

              {sitioWebUrl && (
                <a
                  href={sitioWebUrl}
                  className="prj-proj-link prj-proj-link-demo"
                  target="_blank"
                  rel="noreferrer"
                >
                  <IconSite /> Sitio web
                </a>
              )}

              {videosYoutube.map((url, i) => (
                <a
                  key={`video-${i}`}
                  href={url}
                  className="prj-proj-link prj-proj-link-yt"
                  target="_blank"
                  rel="noreferrer"
                  title={url}
                >
                  <IconYouTube /> Video {videosYoutube.length > 1 ? i + 1 : ''}
                </a>
              ))}

              {documentos.map((doc, i) => {
                const url = getDocumentoUrl(doc);
                const nombre = getDocumentoNombre(doc);

                return (
                  <a
                    key={`doc-${i}`}
                    href={url}
                    className="prj-proj-link prj-proj-link-doc"
                    target="_blank"
                    rel="noreferrer"
                    title={nombre}
                  >
                    <IconDocument /> Doc {documentos.length > 1 ? i + 1 : ''}
                  </a>
                );
              })}
            </div>

            {periodoLabel && (
              <span className="prj-year-pill">
                {periodoLabel}
              </span>
            )}
          </div>
        )}

        {!detallesExpandidos && (
          <ProjectsGithubCollaborators proyecto={proyecto} />
        )}

        {hayDetallesExtra && (
          <div className="prj-card-actions">
            <button
              type="button"
              className="prj-card-toggle-details"
              onClick={toggleDetalles}
            >
              {detallesExpandidos ? 'Ocultar detalles' : 'Ver detalles'}
              <IconChevron open={detallesExpandidos} />
            </button>
          </div>
        )}

        {detallesExpandidos && (
          <div className="prj-details-panel">
            {proyecto.descripcion && (
              <div className="prj-detail-description">
                {proyecto.descripcion}
              </div>
            )}

            <div className="prj-detail-grid">
              <DetailRow label="Estado">
                <span className={pillClass}>{statusLabel}</span>
              </DetailRow>

              <DetailRow label="Tipo">
                {tipoLabel}
              </DetailRow>

              <DetailRow label="Desarrollado para">
                {desarrolladoLabel}
              </DetailRow>

              <DetailRow label="Período">
                {periodoLabel}
                {proyecto.fecha_inicio && (
                  <span className="prj-detail-muted">
                    Inicio: {formatFecha(proyecto.fecha_inicio)}
                    {proyecto.en_curso
                      ? ' · En curso'
                      : proyecto.fecha_fin
                        ? ` · Fin: ${formatFecha(proyecto.fecha_fin)}`
                        : ''}
                  </span>
                )}
              </DetailRow>
            </div>

            {proyecto.etiquetas?.length > 0 && (
              <div className="prj-detail-section">
                <div className="prj-detail-section-title">Tecnologías</div>
                <div className="prj-detail-tags">
                  {proyecto.etiquetas.map(tag => (
                    <TechChip key={`detail-${tag}`} proyecto={proyecto} tag={tag} detail />
                  ))}
                </div>
              </div>
            )}

            {(repositoriosGithub.length > 0 || sitioWebUrl || videosYoutube.length > 0 || documentos.length > 0) && (
              <div className="prj-detail-section">
                <div className="prj-detail-section-title">Enlaces</div>

                <div className="prj-detail-links">
                  {repositoriosGithub.map((url, i) => (
                    <DetailLink
                      key={`detail-repo-${i}`}
                      href={url}
                      className="gh"
                    >
                      <IconGitHub /> Repositorio GitHub {repositoriosGithub.length > 1 ? i + 1 : ''}
                    </DetailLink>
                  ))}

                  <DetailLink href={sitioWebUrl} className="site">
                    <IconSite /> Sitio web
                  </DetailLink>

                  {videosYoutube.map((url, i) => (
                    <DetailLink
                      key={`detail-video-${i}`}
                      href={url}
                      className="yt"
                    >
                      <IconYouTube /> Video YouTube {videosYoutube.length > 1 ? i + 1 : ''}
                    </DetailLink>
                  ))}

                  {documentos.map((doc, i) => {
                    const url = getDocumentoUrl(doc);
                    const nombre = getDocumentoNombre(doc);

                    return (
                      <DetailLink
                        key={`detail-doc-${i}`}
                        href={url}
                        className="doc"
                      >
                        <IconDocument /> {nombre || `Documento ${i + 1}`}
                      </DetailLink>
                    );
                  })}
                </div>
              </div>
            )}

            <ProjectsGithubCollaborators proyecto={proyecto} detail />
          </div>
        )}
      </div>
    </div>
  );
}
