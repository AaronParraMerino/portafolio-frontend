// src/features/dashboard/view/components/ViewProjects.jsx

import { useState } from 'react';
import { isVisible } from '../model/viewModel';

function ProjectIcon({ type }) {
  if (type === 'school') {
    return (
      <svg viewBox="0 0 24 24">
        <path d="M3 10l9-5 9 5-9 5-9-5z" />
        <path d="M7 12v5c2.8 2 7.2 2 10 0v-5" />
      </svg>
    );
  }

  if (type === 'box') {
    return (
      <svg viewBox="0 0 24 24">
        <path d="M4 7l8-4 8 4-8 4-8-4z" />
        <path d="M4 7v10l8 4 8-4V7" />
        <path d="M12 11v10" />
      </svg>
    );
  }

  if (type === 'api') {
    return (
      <svg viewBox="0 0 24 24">
        <path d="M8 9l-4 3 4 3" />
        <path d="M16 9l4 3-4 3" />
        <path d="M13 5l-2 14" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M4 9h16" />
      <path d="M8 13h4M8 16h8" />
    </svg>
  );
}

function LinkIcon({ type }) {
  if (type === 'github') {
    return (
      <svg viewBox="0 0 14 14">
        <path d="M7 1.2a5.8 5.8 0 00-1.8 11.3c.3.1.4-.1.4-.3v-1.1c-1.6.4-2-.7-2-.7-.3-.7-.7-.9-.7-.9-.6-.4 0-.4 0-.4.6 0 1 .7 1 .7.6 1 1.5.7 1.8.5.1-.4.2-.7.4-.9-1.3-.1-2.7-.6-2.7-2.8 0-.6.2-1.1.6-1.5-.1-.1-.3-.8.1-1.5 0 0 .5-.2 1.6.6A5.5 5.5 0 017 4a5.5 5.5 0 011.4.2c1.1-.8 1.6-.6 1.6-.6.4.7.2 1.4.1 1.5.4.4.6.9.6 1.5 0 2.2-1.4 2.7-2.7 2.8.2.2.4.5.4 1.1v1.7c0 .2.1.4.4.3A5.8 5.8 0 007 1.2z" />
      </svg>
    );
  }

  if (type === 'youtube') {
    return (
      <svg viewBox="0 0 14 14">
        <path d="M12.4 4.2s-.1-.9-.5-1.3c-.5-.5-1-.5-1.3-.5C8.8 2.3 7 2.3 7 2.3s-1.8 0-3.6.1c-.3 0-.8 0-1.3.5-.4.4-.5 1.3-.5 1.3S1.5 5.3 1.5 6.4v1.1c0 1.1.1 2.2.1 2.2s.1.9.5 1.3c.5.5 1.2.5 1.5.5 1.1.1 3.4.1 3.4.1s1.8 0 3.6-.1c.3 0 .8 0 1.3-.5.4-.4.5-1.3.5-1.3s.1-1.1.1-2.2V6.4c0-1.1-.1-2.2-.1-2.2z" />
        <path d="M5.8 5.3v3.6L9 7.1z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 14 14">
      <path d="M5 3H3.5A2.5 2.5 0 001 5.5v5A2.5 2.5 0 003.5 13h5A2.5 2.5 0 0011 10.5V9" />
      <path d="M8 1h5v5" />
      <path d="M13 1L6 8" />
    </svg>
  );
}

function ProjectLink({ href, type, children }) {
  if (!href) return null;

  const className = [
    'proj-link',
    type === 'github' ? 'proj-link-gh' : '',
    type === 'youtube' ? 'proj-link-yt' : '',
    type === 'demo' ? 'proj-link-demo' : '',
    type === 'doc' ? 'proj-link-doc' : '',
  ].filter(Boolean).join(' ');

  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noreferrer"
      title={href}
    >
      <LinkIcon type={type} />
      {children}
    </a>
  );
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

function uniqueNonEmpty(values = []) {
  return [...new Set(values.map(value => String(value || '').trim()).filter(Boolean))];
}

function getTechName(tech) {
  if (typeof tech === 'string') return tech.trim();
  return tech?.nombre || tech?.name || tech?.label || '';
}

function getProjectMedia(proyecto = {}) {
  const imagenes = uniqueNonEmpty([
    ...(Array.isArray(proyecto.imagenes) ? proyecto.imagenes : []),
    proyecto.imagenUrl,
    proyecto.imagen_portada,
  ]);

  const videos = uniqueNonEmpty([
    ...(Array.isArray(proyecto.url_videos) ? proyecto.url_videos : []),
    proyecto.videoUrl,
    proyecto.url_video,
  ])
    .map(url => ({
      tipo: 'youtube',
      url,
      embedUrl: toYoutubeEmbedUrl(url),
    }))
    .filter(item => item.embedUrl);

  return [
    ...imagenes.map(url => ({ tipo: 'imagen', url })),
    ...videos,
  ];
}

function getProjectDocuments(proyecto = {}) {
  return (Array.isArray(proyecto.documentos) ? proyecto.documentos : [])
    .map((doc) => {
      if (typeof doc === 'string') {
        return { url: doc, nombre: 'Documento' };
      }

      return {
        url: doc?.url || doc?.archivo_url || doc?.archivo_path || '',
        nombre: doc?.nombre || doc?.titulo || 'Documento',
      };
    })
    .filter(doc => doc.url);
}

function getProjectRepos(proyecto = {}) {
  return uniqueNonEmpty([
    ...(Array.isArray(proyecto.repositoriosGithub) ? proyecto.repositoriosGithub : []),
    ...(Array.isArray(proyecto.url_repositorios) ? proyecto.url_repositorios : []),
    proyecto.githubUrl,
    proyecto.url_repositorio,
  ]);
}

function getProjectVideos(proyecto = {}) {
  return uniqueNonEmpty([
    ...(Array.isArray(proyecto.url_videos) ? proyecto.url_videos : []),
    proyecto.videoUrl,
    proyecto.url_video,
  ]);
}

function getStatusClass(estado) {
  return {
    publicado: 'pb-pub',
    desarrollo: 'pb-dev',
    borrador: 'pb-draft',
    archivado: 'pb-arch',
  }[estado] || 'pb-dev';
}

function ProjectMedia({ proyecto, showMedia = true, showVideos = true }) {
  const [idx, setIdx] = useState(0);
  const media = showMedia
    ? getProjectMedia(proyecto).filter(item => showVideos || item.tipo !== 'youtube')
    : [];
  const safeIdx = media.length ? Math.min(idx, media.length - 1) : 0;
  const current = media[safeIdx] || media[0];
  const hasMedia = media.length > 0;
  const hasMultiple = media.length > 1;

  const goTo = (nextIdx) => {
    if (!media.length) return;
    setIdx((nextIdx + media.length) % media.length);
  };

  if (!hasMedia) {
    return (
      <div className="proj-cover">
        <div className="proj-cover-icon">
          <ProjectIcon type={proyecto.icono} />
        </div>
      </div>
    );
  }

  return (
    <div className={`proj-cover proj-cover-media ${current?.tipo === 'youtube' ? 'has-video' : 'has-image'}`}>
      <div
        className="proj-carousel-track"
        style={{ transform: `translateX(-${safeIdx * 100}%)` }}
      >
        {media.map((item, i) => (
          <div key={`${item.tipo}-${item.url}-${i}`} className="proj-carousel-slide">
            {item.tipo === 'imagen' ? (
              <img
                src={item.url}
                alt={`${proyecto.titulo || 'Proyecto'} imagen ${i + 1}`}
                className="proj-cover-img"
                loading={i === 0 ? 'eager' : 'lazy'}
                draggable={false}
              />
            ) : (
              <div className="proj-video-wrap">
                <iframe
                  className="proj-video-frame"
                  src={item.embedUrl}
                  title={`${proyecto.titulo || 'Proyecto'} video ${i + 1}`}
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {current?.tipo === 'imagen' && <div className="proj-cover-overlay" />}

      {current?.tipo === 'youtube' && (
        <span className="proj-video-badge">
          <LinkIcon type="youtube" />
          Video
        </span>
      )}

      {hasMultiple && (
        <>
          <button
            type="button"
            className="proj-carousel-arrow proj-carousel-prev"
            onClick={() => goTo(safeIdx - 1)}
            title="Anterior"
            aria-label="Proyecto anterior"
          >
            <svg viewBox="0 0 16 16">
              <path d="M10 3L5 8l5 5" />
            </svg>
          </button>

          <button
            type="button"
            className="proj-carousel-arrow proj-carousel-next"
            onClick={() => goTo(safeIdx + 1)}
            title="Siguiente"
            aria-label="Proyecto siguiente"
          >
            <svg viewBox="0 0 16 16">
              <path d="M6 3l5 5-5 5" />
            </svg>
          </button>

          <div className="proj-carousel-dots">
            {media.map((item, i) => (
              <button
                key={`dot-${item.tipo}-${i}`}
                type="button"
                className={`proj-carousel-dot${i === safeIdx ? ' active' : ''}${item.tipo === 'youtube' ? ' video' : ''}`}
                onClick={() => goTo(i)}
                title={`Ir a ${item.tipo === 'youtube' ? 'video' : 'imagen'} ${i + 1}`}
                aria-label={`Ir a ${item.tipo === 'youtube' ? 'video' : 'imagen'} ${i + 1}`}
              />
            ))}
          </div>

          <span className="proj-carousel-counter">
            {safeIdx + 1}/{media.length}
          </span>
        </>
      )}
    </div>
  );
}

function detailVisible(visibilidad, id) {
  return isVisible(visibilidad, 'proyecto_detalles', id);
}

function ViewProjectCard({ proyecto, visibilidad }) {
  const isPublished = proyecto.estado === 'publicado';
  const statusClass = getStatusClass(proyecto.estado);
  const techs = (proyecto.tecnologias || proyecto.etiquetas || [])
    .map(getTechName)
    .filter(Boolean);
  const repos = getProjectRepos(proyecto);
  const videos = getProjectVideos(proyecto);
  const documents = getProjectDocuments(proyecto);
  const demoUrl = proyecto.demoUrl || proyecto.url_demo || '';
  const participacion = proyecto.participacion || {};
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
  const hasBadges = showEstado || showTipo;
  const hasMeta = (showRol && participacion.rol)
    || (showParticipantes && proyecto.participantes_count)
    || (showFechas && (proyecto.fecha_inicio || proyecto.fecha_fin));
  const aporte = participacion.descripcion_aporte || proyecto.descripcion_aporte;
  const hasFooter = (showRepositorios && repos.length > 0)
    || (showDemo && demoUrl)
    || (showVideos && videos.length > 0)
    || (showDocumentos && documents.length > 0)
    || (showFechas && proyecto.anio);

  return (
    <article className="proj-card">
      <ProjectMedia
        proyecto={proyecto}
        showMedia={showMedia}
        showVideos={showVideos}
      />

      <div className="proj-body">
        {hasBadges && (
          <div className="proj-badges">
            {showEstado && (
              <span className={`pb ${statusClass}`}>
                {proyecto.estadoLabel || (isPublished ? 'Publicado' : 'Desarrollo')}
              </span>
            )}

            {showTipo && (
              <span className="pb pb-type">
                {proyecto.tipo || 'Proyecto'}
              </span>
            )}
          </div>
        )}

        <h3 className="proj-name">
          {proyecto.titulo || 'Proyecto'}
        </h3>

        {hasMeta && (
          <div className="proj-meta">
            {showRol && participacion.rol && (
              <span>{participacion.rol}</span>
            )}

            {showParticipantes && proyecto.participantes_count > 0 && (
              <span>{proyecto.participantes_count} participantes</span>
            )}

            {showFechas && (proyecto.fecha_inicio || proyecto.fecha_fin) && (
              <span>
                {[proyecto.fecha_inicio, proyecto.fecha_fin || 'Actualidad']
                  .filter(Boolean)
                  .map(value => String(value).slice(0, 4))
                  .join(' - ')}
              </span>
            )}
          </div>
        )}

        {showDescripcion && proyecto.descripcion && (
          <p className="proj-desc">
            {proyecto.descripcion}
          </p>
        )}

        {showAporte && aporte && (
          <p className="proj-contribution">
            {aporte}
          </p>
        )}

        {showTecnologias && techs.length > 0 && (
          <div className="proj-stack">
            {techs.map(tech => (
              <span key={tech} className="chip">
                {tech}
              </span>
            ))}
          </div>
        )}

        {hasFooter && (
          <div className="proj-footer">
            <div className="proj-links">
              {showRepositorios && repos.map((url, index) => (
                <ProjectLink key={`repo-${url}`} href={url} type="github">
                  GitHub{repos.length > 1 ? ` ${index + 1}` : ''}
                </ProjectLink>
              ))}

              {showDemo && (
                <ProjectLink href={demoUrl} type="demo">
                  Sitio web
                </ProjectLink>
              )}

              {showVideos && videos.map((url, index) => (
                <ProjectLink key={`video-${url}`} href={url} type="youtube">
                  Video{videos.length > 1 ? ` ${index + 1}` : ''}
                </ProjectLink>
              ))}

              {showDocumentos && documents.map((doc, index) => (
                <ProjectLink key={`doc-${doc.url}`} href={doc.url} type="doc">
                  {documents.length > 1 ? `Doc ${index + 1}` : doc.nombre}
                </ProjectLink>
              ))}
            </div>

            {showFechas && proyecto.anio && (
              <span className="proj-year">
                {proyecto.anio}
              </span>
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

      <div className="proj-grid">
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
