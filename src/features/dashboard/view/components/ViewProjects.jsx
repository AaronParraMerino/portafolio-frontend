// src/features/dashboard/view/components/ViewProjects.jsx

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
  ].filter(Boolean).join(' ');

  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      <LinkIcon type={type} />
      {children}
    </a>
  );
}

export default function ViewProjects({ proyectos = [], visibilidad }) {
    const visibles = proyectos.filter(proyecto =>
    isVisible(visibilidad, 'proyectos', proyecto.id)
    );

    if (!visibles.length) return null;
  if (!proyectos.length) return null;

  return (
    <section className="pf-sec">
      <div className="pf-sec-top">
        <div>
          <h2 className="pf-sec-title">Proyectos</h2>
          <div className="pf-sec-subtitle">Portafolio destacado</div>
        </div>
      </div>

      <div className="proj-grid">
        {visibles.map(proyecto => {
          const isPublished = proyecto.estado === 'publicado';

          return (
            <article key={proyecto.id} className="proj-card">
              <div className="proj-cover">
                <div className="proj-cover-icon">
                  <ProjectIcon type={proyecto.icono} />
                </div>
              </div>

              <div className="proj-body">
                <div className="proj-badges">
                  <span className={`pb ${isPublished ? 'pb-pub' : 'pb-dev'}`}>
                    {isPublished ? 'Publicado' : 'Desarrollo'}
                  </span>

                  <span className="pb pb-type">
                    {proyecto.tipo}
                  </span>
                </div>

                <h3 className="proj-name">
                  {proyecto.titulo}
                </h3>

                <p className="proj-desc">
                  {proyecto.descripcion}
                </p>

                <div className="proj-stack">
                  {(proyecto.tecnologias || []).map(tech => (
                    <span key={tech} className="chip">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="proj-footer">
                  <div className="proj-links">
                    <ProjectLink href={proyecto.githubUrl} type="github">
                      GitHub
                    </ProjectLink>

                    <ProjectLink href={proyecto.demoUrl} type="demo">
                      Demo
                    </ProjectLink>

                    <ProjectLink href={proyecto.videoUrl} type="youtube">
                      Video
                    </ProjectLink>
                  </div>

                  <span className="proj-year">
                    {proyecto.anio}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}