import { useState, useRef, useCallback, useEffect } from 'react';
import '../styles/projects.css';
import ConfirmModal from '../../../../shared/ui/ConfirmModal';
import ProjectsTechPicker from './ProjectsTechPicker';
import { ESTADOS_PROYECTO, TIPOS_PROYECTO, DESARROLLADO_PARA } from '../model/projectsModel';
import {
  attachDetectedReposToProject,
  ensureTecnologia,
  getGithubDetectedRepos,
  getGithubRepoLanguages,
  getTecnologiasCatalogoCache,
  getTecnologiasCatalogo,
  refreshTecnologiasCatalogoCache,
  isGithubLinked,
  syncGithubRepos,
} from '../services/projectsService';

/* ════════════════════════════════════════
   Constantes
════════════════════════════════════════ */
const MAX_IMAGENES = 5;
const MAX_VIDEOS_YOUTUBE = 2;
const MAX_REPOSITORIOS_GITHUB = 3;
const MAX_DOCUMENTOS = 2;
const MAX_IMAGEN_MB = 2;
const MAX_DOCUMENTO_MB = 2;
const HOY = new Date().toISOString().split('T')[0];

const DOCUMENT_ACCEPT = '.pdf,.doc,.docx,.txt,.rtf,.md,.odt';
const DOCUMENT_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'md', 'odt'];
const MIN_DIAS_DURACION_PROYECTO = 7;

/* ════════════════════════════════════════
   Validaciones
════════════════════════════════════════ */
function validate(form) {
  const e = {};

  if (!form.titulo.trim()) {
    e.titulo = 'El título es obligatorio.';
  } else if (form.titulo.trim().length < 3) {
    e.titulo = 'Mínimo 3 caracteres.';
  } else if (form.titulo.length > 100) {
    e.titulo = 'Máximo 100 caracteres.';
  }

  if (!form.descripcion.trim()) {
    e.descripcion = 'La descripción es obligatoria.';
  } else if (form.descripcion.length > 600) {
    e.descripcion = `Máximo 600 caracteres (${form.descripcion.length}/600).`;
  }

  if (!form.estado) {
    e.estado = 'Selecciona un estado para el proyecto.';
  }

  if (!Array.isArray(form.etiquetas) || form.etiquetas.filter(Boolean).length === 0) {
    e.etiquetas = 'Selecciona al menos una tecnología.';
  }

  const repositoriosGithub = normalizarRepositoriosGithub(form.url_repositorios);

  if (repositoriosGithub.length > MAX_REPOSITORIOS_GITHUB) {
    e.url_repositorios = `Máximo ${MAX_REPOSITORIOS_GITHUB} repositorios de GitHub.`;
  }

  const repoInvalido = repositoriosGithub.find(url => !isGithubUrl(url));
  if (repoInvalido) {
    e.url_repositorios = 'Solo se aceptan enlaces de repositorios GitHub: https://github.com/usuario/repositorio';
  }

  if (form.url_demo && !/^https?:\/\/.+/.test(form.url_demo)) {
    e.url_demo = 'Debe ser una URL válida del sitio web (https://...)';
  }

  const videosYoutube = normalizarVideosYoutube(form.url_videos);

  if (videosYoutube.length > MAX_VIDEOS_YOUTUBE) {
    e.url_videos = `Máximo ${MAX_VIDEOS_YOUTUBE} videos de YouTube.`;
  }

  const videoInvalido = videosYoutube.find(url => !isYoutubeUrl(url));
  if (videoInvalido) {
    e.url_videos = 'Solo se aceptan enlaces de YouTube: youtube.com/watch?v=... o youtu.be/...';
  }

  if (!form.fecha_inicio) {
    e.fecha_inicio = 'La fecha de inicio es obligatoria.';
  } else if (form.fecha_inicio > HOY) {
    e.fecha_inicio = 'La fecha de inicio no puede ser posterior a hoy.';
  }

  if (!form.en_curso && !form.fecha_fin) {
    e.fecha_fin = 'La fecha de fin es obligatoria si el proyecto no está en curso.';
  } else if (!form.en_curso && form.fecha_fin) {
    const minFechaFin = getMinFechaFin(form.fecha_inicio);

    if (minFechaFin && form.fecha_fin < minFechaFin) {
      e.fecha_fin = `La fecha de fin debe ser al menos una semana posterior a la fecha de inicio (${minFechaFin}).`;
    }
  }

  return e;
}

/* ════════════════════════════════════════
   Helpers
════════════════════════════════════════ */
function FieldError({ msg }) {
  if (!msg) return null;

  return (
    <div className="prj-field-error" role="alert">
      <svg viewBox="0 0 12 12">
        <circle cx="6" cy="6" r="5" />
        <path d="M6 3.5v3M6 8.5v.5" />
      </svg>
      {msg}
    </div>
  );
}

function getMinFechaFin(fechaInicio) {
  if (!fechaInicio) return undefined;

  const [year, month, day] = fechaInicio.split('-').map(Number);
  if (!year || !month || !day) return undefined;

  const date = new Date(Date.UTC(year, month - 1, day + MIN_DIAS_DURACION_PROYECTO));
  return date.toISOString().split('T')[0];
}

function isYoutubeUrl(url) {
  return /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/.test(url.trim());
}

function normalizarVideosYoutube(videos) {
  return Array.isArray(videos)
    ? videos.map(v => String(v).trim()).filter(Boolean)
    : [];
}

function isGithubUrl(url) {
  return /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(url.trim());
}

function normalizarRepositoriosGithub(repositorios) {
  return Array.isArray(repositorios)
    ? repositorios.map(r => String(r).trim()).filter(Boolean)
    : [];
}

function normalizarGithubUrlParaComparar(url = '') {
  return String(url || '')
    .trim()
    .replace(/\/+$/, '')
    .toLowerCase();
}

function normalizarReposInicialesGithub(initialGithubRepos) {
  const selected = Array.isArray(initialGithubRepos?.detected_repos)
    ? initialGithubRepos.detected_repos
    : [];
  const urlsDirectas = Array.isArray(initialGithubRepos?.repositorios)
    ? initialGithubRepos.repositorios
    : [];
  const byUrl = new Map();

  selected.forEach((repo) => {
    const url = String(repo?.url || repo?.url_repositorio || '').trim();
    if (!url) return;
    byUrl.set(url, {
      url,
      id: Number(repo?.id || repo?.id_proyecto_repositorio) || null,
    });
  });

  urlsDirectas.forEach((urlValue, index) => {
    const url = String(urlValue || '').trim();
    if (!url) return;
    const id = Number(initialGithubRepos?.detected_repo_ids?.[index]) || null;
    byUrl.set(url, { url, id: byUrl.get(url)?.id || id });
  });

  return Array.from(byUrl.values()).slice(0, MAX_REPOSITORIOS_GITHUB);
}

function buildDetectedRepoIdsByUrl(reposIniciales = []) {
  return reposIniciales.reduce((acc, repo) => {
    if (!repo?.url || !repo?.id) return acc;
    acc[String(repo.url).trim()] = Number(repo.id);
    return acc;
  }, {});
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

function getFileExtension(filename = '') {
  return filename.split('.').pop()?.toLowerCase() || '';
}

function isDocumentoPermitido(file) {
  const ext = getFileExtension(file.name);
  return DOCUMENT_EXTENSIONS.includes(ext);
}

/* ════════════════════════════════════════
   MultiImageUpload
════════════════════════════════════════ */
function MultiImageUpload({
  imagenesExistentes,
  nuevasImagenes,
  onAgregar,
  onQuitarExistente,
  onQuitarNueva,
  cargando,
}) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState('');

  const total = imagenesExistentes.length + nuevasImagenes.length;
  const disponibles = MAX_IMAGENES - total;

  const procesarArchivos = useCallback((archivos) => {
    setError('');

    const lista = Array.from(archivos);
    const pesados = lista.filter(f => f.size > MAX_IMAGEN_MB * 1024 * 1024);
    const validos = lista.filter(f => (
      f.type.startsWith('image/') && f.size <= MAX_IMAGEN_MB * 1024 * 1024
    ));

    if (pesados.length > 0) {
      setError('No se puede subir archivos mayores a 2 MB.');
    }

    if (!validos.length) return;

    const cuantos = Math.min(validos.length, disponibles);

    if (validos.length > cuantos) {
      setError(`Solo se pueden agregar ${disponibles} imagen${disponibles !== 1 ? 'es' : ''} más.`);
    }

    onAgregar(validos.slice(0, cuantos));
  }, [disponibles, onAgregar]);

  return (
    <div className="prj-multi-upload">
      {(imagenesExistentes.length > 0 || nuevasImagenes.length > 0) && (
        <div className="prj-img-grid">
          {imagenesExistentes.map((url, i) => (
            <div key={`ex-${i}`} className="prj-img-thumb">
              {i === 0 && <span className="prj-img-portada-badge">Portada</span>}
              <img src={url} alt={`Imagen ${i + 1}`} />

              <button
                type="button"
                className="prj-img-remove"
                onClick={() => onQuitarExistente(i)}
                disabled={cargando}
                title="Quitar imagen"
              >
                <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M1 1l8 8M9 1L1 9" />
                </svg>
              </button>
            </div>
          ))}

          {nuevasImagenes.map((item, i) => (
            <div key={`nv-${i}`} className="prj-img-thumb prj-img-thumb-new">
              {imagenesExistentes.length === 0 && i === 0 && (
                <span className="prj-img-portada-badge">Portada</span>
              )}

              <img src={item.preview} alt={`Nueva imagen ${i + 1}`} />
              <span className="prj-img-new-badge">Nueva</span>

              <button
                type="button"
                className="prj-img-remove"
                onClick={() => onQuitarNueva(i)}
                disabled={cargando}
                title="Quitar imagen"
              >
                <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M1 1l8 8M9 1L1 9" />
                </svg>
              </button>
            </div>
          ))}

          {disponibles > 0 && (
            <button
              type="button"
              className="prj-img-add-slot"
              onClick={() => inputRef.current?.click()}
              disabled={cargando}
              title={`Agregar imagen (${total}/${MAX_IMAGENES})`}
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M10 4v12M4 10h12" strokeLinecap="round" />
              </svg>
              <span>{total}/{MAX_IMAGENES}</span>
            </button>
          )}
        </div>
      )}

      {total === 0 && (
        <div
          className={`prj-upload-zone${drag ? ' drag' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            procesarArchivos(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
          <div className="prj-upload-placeholder">
            <div className="prj-upload-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>

            <div className="prj-upload-text">Arrastrá las imágenes aquí</div>
            <div className="prj-upload-subtext">
              o hacé clic para seleccionar · JPG, PNG, WebP · máx. {MAX_IMAGENES} imágenes · {MAX_IMAGEN_MB} MB c/u
            </div>
          </div>
        </div>
      )}

      {total > 0 && disponibles > 0 && (
        <button
          type="button"
          className="prj-upload-add-more"
          onClick={() => inputRef.current?.click()}
          disabled={cargando}
        >
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M7 2v10M2 7h10" />
          </svg>
          Agregar más imágenes ({total}/{MAX_IMAGENES})
        </button>
      )}

      {disponibles === 0 && (
        <div className="prj-upload-limit-msg">
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="7" cy="7" r="6" />
            <path d="M7 4v4M7 9.5v.5" />
          </svg>
          Límite de {MAX_IMAGENES} imágenes alcanzado.
        </div>
      )}

      {error && <FieldError msg={error} />}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="d-none"
        disabled={cargando || disponibles === 0}
        onChange={(e) => {
          procesarArchivos(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}

/* ════════════════════════════════════════
   MultiDocumentUpload
════════════════════════════════════════ */
function MultiDocumentUpload({
  documentosExistentes,
  nuevosDocumentos,
  onAgregar,
  onQuitarExistente,
  onQuitarNuevo,
  cargando,
}) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState('');

  const total = documentosExistentes.length + nuevosDocumentos.length;
  const disponibles = MAX_DOCUMENTOS - total;

  const procesarArchivos = useCallback((archivos) => {
    setError('');

    const lista = Array.from(archivos);
    if (!lista.length) return;

    const pesados = lista.filter(file => file.size > MAX_DOCUMENTO_MB * 1024 * 1024);
    const permitidos = lista.filter(file => isDocumentoPermitido(file) && file.size <= MAX_DOCUMENTO_MB * 1024 * 1024);

    if (pesados.length > 0) {
      setError('No se puede subir archivos mayores a 2 MB.');
    }

    if (!permitidos.length) {
      setError(pesados.length > 0
        ? 'No se puede subir archivos mayores a 2 MB.'
        : 'Solo se aceptan PDF, DOC, DOCX, TXT, RTF, MD u ODT.'
      );
      return;
    }

    const cuantos = Math.min(permitidos.length, disponibles);

    if (permitidos.length > cuantos || lista.length > permitidos.length) {
      setError(`Se agregaron solo documentos válidos. Máximo ${MAX_DOCUMENTOS} documentos.`);
    }

    onAgregar(permitidos.slice(0, cuantos));
  }, [disponibles, onAgregar]);

  return (
    <div className="prj-doc-upload">
      {(documentosExistentes.length > 0 || nuevosDocumentos.length > 0) && (
        <div className="prj-doc-list">
          {documentosExistentes.map((doc, i) => (
            <div key={`doc-ex-${i}`} className="prj-doc-item">
              <div className="prj-doc-icon">
                <svg viewBox="0 0 18 22" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M4 1h7l5 5v15H4a2 2 0 01-2-2V3a2 2 0 012-2z" />
                  <path d="M11 1v6h5" />
                </svg>
              </div>

              <div className="prj-doc-info">
                <span className="prj-doc-title">{getDocumentoNombre(doc)}</span>

                {getDocumentoUrl(doc) && (
                  <a
                    className="prj-doc-url"
                    href={getDocumentoUrl(doc)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver documento
                  </a>
                )}
              </div>

              <button
                type="button"
                className="prj-doc-remove"
                onClick={() => onQuitarExistente(i)}
                disabled={cargando}
                title="Quitar documento"
              >
                <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M1 1l8 8M9 1L1 9" />
                </svg>
              </button>
            </div>
          ))}

          {nuevosDocumentos.map((item, i) => (
            <div key={`doc-nv-${i}`} className="prj-doc-item prj-doc-item-new">
              <div className="prj-doc-icon">
                <svg viewBox="0 0 18 22" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M4 1h7l5 5v15H4a2 2 0 01-2-2V3a2 2 0 012-2z" />
                  <path d="M11 1v6h5" />
                </svg>
              </div>

              <div className="prj-doc-info">
                <span className="prj-doc-title">{item.file.name}</span>
                <span className="prj-doc-url">Nuevo · pendiente de guardar</span>
              </div>

              <button
                type="button"
                className="prj-doc-remove"
                onClick={() => onQuitarNuevo(i)}
                disabled={cargando}
                title="Quitar documento"
              >
                <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M1 1l8 8M9 1L1 9" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {disponibles > 0 && (
        <div
          className={`prj-doc-drop${drag ? ' drag' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            procesarArchivos(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M12 3v12" />
            <path d="M7 8l5-5 5 5" />
            <path d="M4 15v4a2 2 0 002 2h12a2 2 0 002-2v-4" />
          </svg>

          <span>Agregar documentos ({total}/{MAX_DOCUMENTOS})</span>
          <small>PDF, DOC, DOCX, TXT, RTF, MD, ODT · máx. {MAX_DOCUMENTO_MB} MB c/u</small>
        </div>
      )}

      {disponibles === 0 && (
        <div className="prj-upload-limit-msg">
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="7" cy="7" r="6" />
            <path d="M7 4v4M7 9.5v.5" />
          </svg>
          Límite de {MAX_DOCUMENTOS} documentos alcanzado. Quitá uno para agregar otro.
        </div>
      )}

      {error && <FieldError msg={error} />}

      <input
        ref={inputRef}
        type="file"
        accept={DOCUMENT_ACCEPT}
        multiple
        className="d-none"
        disabled={cargando || disponibles === 0}
        onChange={(e) => {
          procesarArchivos(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}

/* ════════════════════════════════════════
   MultiYoutubeLinks
════════════════════════════════════════ */
function MultiYoutubeLinks({ videos, onChange, error, cargando }) {
  const [nuevoUrl, setNuevoUrl] = useState('');
  const [localError, setLocalError] = useState('');

  const total = videos.length;
  const disponibles = MAX_VIDEOS_YOUTUBE - total;

  const agregarVideo = () => {
    const url = nuevoUrl.trim();
    setLocalError('');

    if (!url) return;

    if (total >= MAX_VIDEOS_YOUTUBE) {
      setLocalError(`Solo puedes agregar hasta ${MAX_VIDEOS_YOUTUBE} videos de YouTube.`);
      return;
    }

    if (!isYoutubeUrl(url)) {
      setLocalError('Ingresa un enlace válido de YouTube.');
      return;
    }

    if (videos.includes(url)) {
      setLocalError('Este enlace ya fue agregado.');
      return;
    }

    onChange([...videos, url]);
    setNuevoUrl('');
  };

  const quitarVideo = (idx) => {
    onChange(videos.filter((_, i) => i !== idx));
    setLocalError('');
  };

  return (
    <div className="prj-video-links-box">
      {videos.length > 0 && (
        <div className="prj-video-list">
          {videos.map((url, i) => (
            <div key={`${url}-${i}`} className="prj-video-item">
              <div className="prj-video-icon">
                <svg viewBox="0 0 14 10">
                  <rect x=".5" y=".5" width="13" height="9" rx="2" fill="currentColor" />
                  <path d="M5.5 2.5l4 2.5-4 2.5V2.5z" fill="#fff" />
                </svg>
              </div>

              <div className="prj-video-info">
                <span className="prj-video-title">Video YouTube {i + 1}</span>
                <span className="prj-video-url">{url}</span>
              </div>

              <button
                type="button"
                className="prj-video-remove"
                onClick={() => quitarVideo(i)}
                disabled={cargando}
                title="Quitar video"
              >
                <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M1 1l8 8M9 1L1 9" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {disponibles > 0 && (
        <div className="prj-video-add-row">
          <input
            className="prj-input"
            value={nuevoUrl}
            onChange={(e) => setNuevoUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                agregarVideo();
              }
            }}
            disabled={cargando}
            placeholder="https://youtube.com/watch?v=... o https://youtu.be/..."
          />

          <button
            type="button"
            className="prj-video-add-btn"
            onClick={agregarVideo}
            disabled={cargando || !nuevoUrl.trim()}
          >
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M7 2v10M2 7h10" />
            </svg>
            Agregar
          </button>
        </div>
      )}

      <div className="prj-field-hint">
        Puedes agregar hasta {MAX_VIDEOS_YOUTUBE} videos.
      </div>

      {disponibles === 0 && (
        <div className="prj-upload-limit-msg">
          Límite de {MAX_VIDEOS_YOUTUBE} videos alcanzado.
        </div>
      )}

      {(localError || error) && <FieldError msg={localError || error} />}
    </div>
  );
}

/* ════════════════════════════════════════
   GitHub language detection
════════════════════════════════════════ */
async function fetchGithubLangsForUrl(repoUrl) {
  const languages = await getGithubRepoLanguages(repoUrl);

  return languages
    .map(lang => String(lang || '').trim())
    .filter(Boolean);
}

/* ════════════════════════════════════════
   MultiGithubLinks
════════════════════════════════════════ */
function MultiGithubLinks({ repositorios, onChange, error, cargando, onTechsDetected }) {
  const [nuevoUrl, setNuevoUrl] = useState('');
  const [localError, setLocalError] = useState('');
  const [detecting, setDetecting] = useState(false);

  const total = repositorios.length;
  const disponibles = MAX_REPOSITORIOS_GITHUB - total;

  const agregarRepositorio = async () => {
    const url = nuevoUrl.trim();
    setLocalError('');

    if (!url) return;

    if (total >= MAX_REPOSITORIOS_GITHUB) {
      setLocalError(`Solo puedes agregar hasta ${MAX_REPOSITORIOS_GITHUB} repositorios de GitHub.`);
      return;
    }

    if (!isGithubUrl(url)) {
      setLocalError('Ingresa un enlace válido de repositorio GitHub.');
      return;
    }

    if (repositorios.includes(url)) {
      setLocalError('Este repositorio ya fue agregado.');
      return;
    }

    onChange([...repositorios, url]);
    setNuevoUrl('');
    if (onTechsDetected) {
      setDetecting(true);
      fetchGithubLangsForUrl(url)
        .then(async (techs) => {
          if (techs.length > 0) await onTechsDetected(techs);
        })
        .catch((err) => {
          setLocalError(err.message || 'No se pudieron detectar las tecnologias del repositorio.');
        })
        .finally(() => setDetecting(false));
    }
  };

  const quitarRepositorio = (idx) => {
    onChange(repositorios.filter((_, i) => i !== idx));
    setLocalError('');
  };

  return (
    <div className="prj-link-list-box">
      {repositorios.length > 0 && (
        <div className="prj-link-list">
          {repositorios.map((url, i) => (
            <div key={`${url}-${i}`} className="prj-link-item">
              <div className="prj-link-icon prj-link-icon-gh">
                <svg viewBox="0 0 10 10">
                  <path
                    d="M5 0C2.2 0 0 2.3 0 5c0 2.2 1.4 4.1 3.4 4.8.3 0 .4-.1.4-.2v-.9c-1.4.3-1.7-.6-1.7-.6-.2-.6-.6-.7-.6-.7-.4-.3 0-.3 0-.3.5 0 .8.5.8.5.4.8 1.2.5 1.5.4 0-.3.2-.5.3-.7-1.1-.1-2.3-.6-2.3-2.5 0-.5.2-1 .5-1.3 0-.1-.2-.6 0-1.3 0 0 .4-.1 1.4.5.4-.1.8-.2 1.2-.2.4 0 .8.1 1.2.2 1-.7 1.4-.5 1.4-.5.2.7 0 1.2 0 1.3.3.4.5.8.5 1.3 0 1.9-1.1 2.3-2.3 2.5.2.1.3.4.3.9v1.4c0 .1.1.3.4.2C8.6 9.1 10 7.2 10 5c0-2.7-2.2-5-5-5z"
                    fill="currentColor"
                  />
                </svg>
              </div>

              <div className="prj-link-info">
                <span className="prj-link-title">Repositorio GitHub {i + 1}</span>
                <span className="prj-link-url">{url}</span>
              </div>

              <button
                type="button"
                className="prj-link-remove"
                onClick={() => quitarRepositorio(i)}
                disabled={cargando}
                title="Quitar repositorio"
              >
                <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M1 1l8 8M9 1L1 9" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {disponibles > 0 && (
        <div className="prj-link-add-row">
          <input
            className="prj-input"
            value={nuevoUrl}
            onChange={(e) => setNuevoUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                agregarRepositorio();
              }
            }}
            disabled={cargando}
            placeholder="https://github.com/usuario/repositorio"
          />

          <button
            type="button"
            className="prj-link-add-btn"
            onClick={agregarRepositorio}
            disabled={cargando || !nuevoUrl.trim()}
          >
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M7 2v10M2 7h10" />
            </svg>
            Agregar
          </button>
        </div>
      )}

      <div className="prj-field-hint">
        Puedes agregar hasta {MAX_REPOSITORIOS_GITHUB} repositorios de GitHub.
      </div>

      {disponibles === 0 && (
        <div className="prj-upload-limit-msg">
          Límite de {MAX_REPOSITORIOS_GITHUB} repositorios alcanzado.
        </div>
      )}

      {detecting && (
        <div className="prj-detected-muted prj-link-detecting">
          Detectando tecnologías del repositorio...
        </div>
      )}

      {(localError || error) && <FieldError msg={localError || error} />}
    </div>
  );
}

function ParticipacionModal({ onContinuar, onSaltar, loading, initialRol = '', initialDescripcion = '', proyectoInfo = null }) {
  const [rol, setRol] = useState(initialRol);
  const [descripcion, setDescripcion] = useState(initialDescripcion);

  return (
    <div className="dash-edit-overlay prj-modal-overlay" style={{ zIndex: 600 }}>
      <div className="dash-edit-modal dash-edit-modal--sm prj-modal prj-modal-sm" role="dialog" aria-modal="true">
        <div className="dash-edit-head prj-modal-head">
          <div>
            <div className="dash-edit-title prj-modal-title">Tu participación en el proyecto</div>
            <div className="dash-edit-subtitle prj-modal-sub">Indica tu rol y aporte (opcional)</div>
          </div>
        </div>

        <div className="dash-edit-body prj-modal-body">
          {proyectoInfo && (
            <div className="prj-detected-item" style={{ marginBottom: 14 }}>
              <div className="prj-detected-main">
                <div className="prj-detected-title">{proyectoInfo.titulo || 'Proyecto existente'}</div>
                {proyectoInfo.descripcion && (
                  <div className="prj-detected-url">{proyectoInfo.descripcion}</div>
                )}
              </div>
              <div className="prj-detected-side">
                <span className="prj-detected-pill warn">en uso</span>
              </div>
            </div>
          )}

          <div className="prj-form-section" style={{ paddingTop: 0 }}>
            <div className="row g-3">
              <div className="col-12">
                <label className="prj-label">Rol</label>
                <input
                  className="dash-edit-input prj-input"
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  placeholder="Ej: Desarrollador backend, Líder técnico, Diseñador UI..."
                  maxLength={100}
                  disabled={loading}
                  autoFocus
                />
                <div className="prj-field-hint">¿Cuál fue tu función principal en este proyecto?</div>
              </div>

              <div className="col-12">
                <label className="prj-label">
                  Descripción del aporte
                  <span
                    className="prj-char-count"
                    style={{ color: descripcion.length > 550 ? 'var(--rojo-soft)' : 'var(--gris-texto)' }}
                  >
                    {descripcion.length}/600
                  </span>
                </label>
                <textarea
                  className="dash-edit-textarea prj-input"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={3}
                  placeholder="Describe brevemente tus contribuciones, responsabilidades y logros..."
                  maxLength={601}
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="dash-edit-footer prj-modal-foot">
          <button type="button" className="dash-edit-btn dash-edit-btn--secondary prj-btn-cancel" onClick={onSaltar} disabled={loading}>
            Omitir
          </button>
          <button
            type="button"
            className="dash-edit-btn dash-edit-btn--primary prj-btn-save"
            onClick={() => onContinuar({ rol: rol.trim(), descripcion_aporte: descripcion.trim() })}
            disabled={loading}
          >
            <svg viewBox="0 0 14 14">
              <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" fill="none" strokeWidth="2.2" />
            </svg>
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   COMPONENTE PRINCIPAL — ProjectsEdit
════════════════════════════════════════ */
export default function ProjectsEdit({ proyecto, onGuardar, onCancelar, guardando, initialGithubRepos = null }) {
  const esNuevo = !proyecto;
  const reposInicialesGithub = normalizarReposInicialesGithub(initialGithubRepos);
  const detectedRepoIdsInicialesByUrl = buildDetectedRepoIdsByUrl(reposInicialesGithub);
  const repositoriosBase = Array.isArray(proyecto?.url_repositorios)
    ? proyecto.url_repositorios
    : proyecto?.url_repositorio
      ? [proyecto.url_repositorio]
      : [];
  const repositoriosIniciales = Array.from(new Set([
    ...repositoriosBase,
    ...reposInicialesGithub.map((repo) => repo.url),
  ])).slice(0, MAX_REPOSITORIOS_GITHUB);

  const [form, setForm] = useState({
    id: proyecto?.id || proyecto?.id_proyecto || null,
    id_proyecto: proyecto?.id_proyecto || proyecto?.id || null,
    id_tipo_proyecto: proyecto?.id_tipo_proyecto || proyecto?.idTipoProyecto || null,

    titulo: proyecto?.titulo || '',
    descripcion: proyecto?.descripcion || '',

    url_repositorio: proyecto?.url_repositorio || repositoriosIniciales[0] || '',
    url_repositorios: repositoriosIniciales,

    url_demo: proyecto?.url_demo || proyecto?.url_sitio_web || proyecto?.url_sitioweb || '',

    url_video: proyecto?.url_video || '',
    url_videos: Array.isArray(proyecto?.url_videos)
      ? proyecto.url_videos
      : proyecto?.url_video
        ? [proyecto.url_video]
        : [],

    estado: proyecto?.estado || 'borrador',
    tipo: proyecto?.tipo || '',
    desarrollado_para: proyecto?.desarrollado_para || '',

    fecha_inicio: proyecto?.fecha_inicio || '',
    fecha_fin: proyecto?.fecha_fin || '',
    en_curso: proyecto?.en_curso ?? false,
    es_publico: proyecto?.es_publico ?? true,
    etiquetas: proyecto?.etiquetas || [],
  });

  const [imagenesExistentes, setImagenesExistentes] = useState(() => {
    if (Array.isArray(proyecto?.imagenes) && proyecto.imagenes.length > 0) {
      return proyecto.imagenes;
    }

    const url = proyecto?.imagenUrl || proyecto?.imagen_portada || null;
    return url ? [url] : [];
  });

  const [nuevasImagenes, setNuevasImagenes] = useState([]);
  const [imagenesAEliminar, setImagenesAEliminar] = useState([]);

  const [documentosExistentes, setDocumentosExistentes] = useState(() => {
    if (Array.isArray(proyecto?.documentos)) return proyecto.documentos;

    if (proyecto?.documento_url) {
      return [{
        url: proyecto.documento_url,
        nombre: proyecto.documento_nombre || 'Documento',
      }];
    }

    return [];
  });

  const [nuevosDocumentos, setNuevosDocumentos] = useState([]);
  const [documentosAEliminar, setDocumentosAEliminar] = useState([]);

  const [catalogoExtra, setCatalogoExtra] = useState(() => getTecnologiasCatalogoCache());
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [confirmPending, setConfirmPending] = useState(null);
  const [preConfirmPending, setPreConfirmPending] = useState(null);
  const [repoEnUsoConfirmPending, setRepoEnUsoConfirmPending] = useState(null);
  const [checkingGithubLinked, setCheckingGithubLinked] = useState(true);
  const [githubLinked, setGithubLinked] = useState(false);
  const [detectedRepos, setDetectedRepos] = useState([]);
  const [busquedaDetectedRepos, setBusquedaDetectedRepos] = useState('');
  const [loadingDetectedRepos, setLoadingDetectedRepos] = useState(false);
  const [syncingDetectedRepos, setSyncingDetectedRepos] = useState(false);
  const [mostrarDetectedRepos, setMostrarDetectedRepos] = useState(false);
  const [detectedReposError, setDetectedReposError] = useState('');
  const [joinRepoPending, setJoinRepoPending] = useState(null);
  const [joiningRepo, setJoiningRepo] = useState(false);

  const errors = validate(form);
  const hasErrors = Object.keys(errors).length > 0;

  useEffect(() => {
    let mounted = true;

    getTecnologiasCatalogo()
      .then((tecnologias) => {
        if (!mounted || !tecnologias.length) return;
        setCatalogoExtra(tecnologias);
      })
      .catch(() => {});

    refreshTecnologiasCatalogoCache()
      .then((tecnologias) => {
        if (!mounted || !tecnologias.length) return;
        setCatalogoExtra(tecnologias);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const mergeCatalogoTecnologias = useCallback((tecnologias = []) => {
    const validas = tecnologias.filter(tech => tech?.nombre);

    if (!validas.length) return;

    setCatalogoExtra((prev) => {
      const map = new Map();

      [...prev, ...validas].forEach((tech) => {
        if (!tech?.nombre) return;
        map.set(tech.nombre.toLowerCase(), tech);
      });

      return Array.from(map.values());
    });
  }, []);

  const registrarTecnologias = useCallback(async (nombres = []) => {
    const lista = [...new Set(
      nombres
        .map(nombre => String(nombre || '').trim())
        .filter(Boolean)
    )];

    if (!lista.length) return [];

    const registradas = [];

    for (const nombre of lista) {
      const tech = await ensureTecnologia(nombre);
      if (tech?.nombre) {
        registradas.push(tech);
      }
    }

    mergeCatalogoTecnologias(registradas);
    return registradas.map(tech => tech.nombre);
  }, [mergeCatalogoTecnologias]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleBlur = (e) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  };

  const showErr = (f) => (touched[f] || submitAttempted) && errors[f];

  const handleAgregarImagenes = useCallback((archivos) => {
    const nuevas = archivos.map(f => ({
      file: f,
      preview: URL.createObjectURL(f),
    }));

    setNuevasImagenes(prev => [...prev, ...nuevas]);
  }, []);

  const handleQuitarExistente = useCallback((idx) => {
    setImagenesAEliminar(prev => [...prev, idx]);
    setImagenesExistentes(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const handleQuitarNueva = useCallback((idx) => {
    setNuevasImagenes(prev => {
      const copia = [...prev];

      if (copia[idx]?.preview) {
        URL.revokeObjectURL(copia[idx].preview);
      }

      copia.splice(idx, 1);
      return copia;
    });
  }, []);

  const handleAgregarDocumentos = useCallback((archivos) => {
    const nuevos = archivos.map(f => ({ file: f }));
    setNuevosDocumentos(prev => [...prev, ...nuevos]);
  }, []);

  const handleQuitarDocumentoExistente = useCallback((idx) => {
    setDocumentosAEliminar(prev => [...prev, idx]);
    setDocumentosExistentes(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const handleQuitarDocumentoNuevo = useCallback((idx) => {
    setNuevosDocumentos(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    setTouched({
      titulo: true,
      descripcion: true,
      estado: true,
      etiquetas: true,
      url_repositorios: true,
      url_demo: true,
      url_videos: true,
      fecha_inicio: true,
      fecha_fin: true,
    });

    if (hasErrors) return;

    const videosYoutube = normalizarVideosYoutube(form.url_videos);
    const repositoriosGithub = normalizarRepositoriosGithub(form.url_repositorios);
    const repoEnUso = detectedRepos.find((repo) => (
      repo?.estado_vinculacion === 'en_uso' &&
      repo?.puede_unirse &&
      repositoriosGithub.some((url) => (
        normalizarGithubUrlParaComparar(url) === normalizarGithubUrlParaComparar(repo.url_repositorio)
      ))
    ));

    if (repoEnUso) {
      setRepoEnUsoConfirmPending(repoEnUso);
      return;
    }

    const detectedByUrl = new Map(
      detectedRepos
        .filter((repo) => repo?.url_repositorio)
        .map((repo) => [String(repo.url_repositorio).trim(), Number(repo.id_proyecto_repositorio)]),
    );

    const detectedRepoIds = repositoriosGithub
      .map((url) => detectedByUrl.get(String(url).trim()) || detectedRepoIdsInicialesByUrl[String(url).trim()])
      .filter((id) => Number.isInteger(id) && id > 0);

    setPreConfirmPending({
      datos: {
        ...form,

        id: form.id,
        id_proyecto: form.id_proyecto,
        id_tipo_proyecto: form.id_tipo_proyecto,

        url_repositorios: repositoriosGithub,
        url_repositorio: repositoriosGithub[0] || '',

        url_demo: form.url_demo.trim(),
        url_sitio_web: form.url_demo.trim(),

        url_videos: videosYoutube,
        url_video: videosYoutube[0] || '',

        desarrollado_para: form.desarrollado_para,
        tipo: form.tipo,

        fecha_fin: form.en_curso ? null : form.fecha_fin,
        detected_repo_ids: detectedRepoIds,
      },

      archivos: nuevasImagenes.map(n => n.file),
      imagenesAEliminar,

      documentos: nuevosDocumentos.map(d => d.file),
      documentosAEliminar,
    });
  };

  const handleParticipacionContinuar = ({ rol, descripcion_aporte }) => {
    if (!preConfirmPending) return;
    const pending = preConfirmPending;
    setPreConfirmPending(null);
    setConfirmPending({
      ...pending,
      datos: {
        ...pending.datos,
        rol,
        descripcion_aporte,
        ...(pending.datos.detected_repo_ids?.length > 0 && {
          detected_participacion: { rol, descripcion_aporte },
        }),
      },
    });
  };

  const handleParticipacionSaltar = () => {
    if (!preConfirmPending) return;
    const pending = preConfirmPending;
    setPreConfirmPending(null);
    setConfirmPending(pending);
  };

  const handleConfirmar = () => {
    if (!confirmPending) return;

    const {
      datos,
      archivos,
      imagenesAEliminar: aElim,
      documentos,
      documentosAEliminar: dElim,
    } = confirmPending;

    onGuardar(datos, archivos, aElim, documentos, dElim);
    setConfirmPending(null);
  };

  const minFechaFin = getMinFechaFin(form.fecha_inicio);

  const loadDetectedRepos = useCallback(async (refresh = false) => {
    try {
      setLoadingDetectedRepos(true);
      setDetectedReposError('');

      const repos = await getGithubDetectedRepos({ refresh });
      const normalizedRepos = Array.isArray(repos) ? repos : [];
      setDetectedRepos(normalizedRepos);
      return normalizedRepos;
    } catch (e) {
      setDetectedReposError(e.message || 'No se pudieron cargar los repositorios detectados.');
      return [];
    } finally {
      setLoadingDetectedRepos(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const boot = async () => {
      try {
        const linked = await isGithubLinked();
        if (!mounted) return;

        setGithubLinked(linked);

        if (linked) {
          await loadDetectedRepos(false);
        }
      } catch {
        if (!mounted) return;
        setGithubLinked(false);
      } finally {
        if (mounted) {
          setCheckingGithubLinked(false);
        }
      }
    };

    boot();

    return () => {
      mounted = false;
    };
  }, [loadDetectedRepos]);

  const handleSyncDetectedRepos = useCallback(async () => {
    try {
      setSyncingDetectedRepos(true);
      setDetectedReposError('');
      await syncGithubRepos();
      const repos = await loadDetectedRepos(false);
      const proyectoId = Number(form.id_proyecto || form.id || 0);

      if (proyectoId > 0) {
        const selectedUrls = new Set(
          normalizarRepositoriosGithub(form.url_repositorios)
            .map((url) => String(url).trim())
            .filter(Boolean),
        );

        const repositoriosIds = repos
          .filter((repo) => selectedUrls.has(String(repo?.url_repositorio || '').trim()))
          .map((repo) => Number(repo?.id_proyecto_repositorio))
          .filter((id) => Number.isInteger(id) && id > 0);

        if (repositoriosIds.length > 0) {
          await attachDetectedReposToProject(proyectoId, repositoriosIds, {
            rol: form.rol || '',
            descripcion_aporte: form.descripcion_aporte || '',
          });

          await loadDetectedRepos(false);
        }
      }
    } catch (e) {
      setDetectedReposError(e.message || 'No se pudo sincronizar con GitHub.');
    } finally {
      setSyncingDetectedRepos(false);
    }
  }, [form, loadDetectedRepos]);

  const addDetectedRepoToForm = useCallback((url) => {
    const cleanUrl = String(url || '').trim();
    if (!cleanUrl) return;

    setForm((prev) => {
      const actual = normalizarRepositoriosGithub(prev.url_repositorios);

      if (actual.includes(cleanUrl)) return prev;
      if (actual.length >= MAX_REPOSITORIOS_GITHUB) return prev;

      return {
        ...prev,
        url_repositorios: [...actual, cleanUrl],
      };
    });
  }, []);

  const handleJoinRepoProject = useCallback((repo) => {
    if (!repo?.puede_unirse || !repo?.id_proyecto) return;
    setJoinRepoPending(repo);
  }, []);

  const handleJoinRepoContinuar = useCallback(async ({ rol, descripcion_aporte }) => {
    if (!joinRepoPending) return;

    try {
      setJoiningRepo(true);
      setDetectedReposError('');

      await attachDetectedReposToProject(
        joinRepoPending.id_proyecto,
        [joinRepoPending.id_proyecto_repositorio],
        { rol, descripcion_aporte },
      );

      setJoinRepoPending(null);
      await loadDetectedRepos(false);
    } catch (e) {
      setDetectedReposError(e.message || 'No se pudo vincular tu participacion al proyecto.');
    } finally {
      setJoiningRepo(false);
    }
  }, [joinRepoPending, loadDetectedRepos]);

  const handleJoinRepoSaltar = useCallback(() => {
    setJoinRepoPending(null);
  }, []);

  const handleConfirmRepoEnUso = useCallback(() => {
    if (!repoEnUsoConfirmPending) return;
    setJoinRepoPending(repoEnUsoConfirmPending);
    setRepoEnUsoConfirmPending(null);
  }, [repoEnUsoConfirmPending]);

  const handleCancelRepoEnUso = useCallback(() => {
    setRepoEnUsoConfirmPending(null);
  }, []);

  const repositoriosDetectadosFiltrados = detectedRepos.filter((repo) => {
    const q = busquedaDetectedRepos.trim().toLowerCase();

    if (!q) return true;

    const nombre = String(repo?.nombre || repo?.repo_github?.repo_name || '').toLowerCase();
    const url = String(repo?.url_repositorio || '').toLowerCase();
    const proyectoTitulo = String(repo?.proyecto?.titulo || '').toLowerCase();
    const estado = String(repo?.estado_vinculacion || '').toLowerCase();
    const validacion = String(repo?.validacion?.relacion_github || '').toLowerCase();

    return (
      nombre.includes(q) ||
      url.includes(q) ||
      proyectoTitulo.includes(q) ||
      estado.includes(q) ||
      validacion.includes(q)
    );
  });

  return (
    <>
      <div
        className="dash-edit-overlay prj-modal-overlay"
        onClick={(e) => e.target === e.currentTarget && !guardando && onCancelar()}
      >
        <div className="dash-edit-modal dash-edit-modal--xl prj-modal" role="dialog" aria-modal="true">
          <div className="dash-edit-head prj-modal-head">
            <div>
              <div className="dash-edit-title prj-modal-title">
                {esNuevo ? 'Nuevo proyecto' : 'Editar proyecto'}
              </div>
              <div className="dash-edit-subtitle prj-modal-sub">
                {esNuevo
                  ? 'Completa los datos para agregar un nuevo proyecto'
                  : 'Edita la información del proyecto'}
              </div>
            </div>

            <button
              type="button"
              className="dash-edit-close prj-modal-close"
              onClick={onCancelar}
              disabled={guardando}
              title="Cerrar"
            >
              <svg viewBox="0 0 12 12">
                <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" fill="none" strokeWidth="2.2" />
              </svg>
            </button>
          </div>

          {submitAttempted && hasErrors && (
            <div className="dash-edit-banner-error prj-banner-error">
              <svg viewBox="0 0 14 14" style={{ width: 14, height: 14, stroke: 'currentColor', fill: 'none', strokeWidth: 2, flexShrink: 0 }}>
                <path d="M7 1L1 12h12L7 1z" />
                <path d="M7 5.5v3M7 10v.5" />
              </svg>
              Revisa los campos marcados antes de guardar.
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'contents' }} autoComplete="off" noValidate>
            <div className="dash-edit-body prj-modal-body">
              <div className="prj-form-section">
                <span className="prj-section-label">
                  Imágenes del proyecto
                  <span className="prj-section-badge">
                    {imagenesExistentes.length + nuevasImagenes.length}/{MAX_IMAGENES}
                  </span>
                </span>

                <MultiImageUpload
                  imagenesExistentes={imagenesExistentes}
                  nuevasImagenes={nuevasImagenes}
                  onAgregar={handleAgregarImagenes}
                  onQuitarExistente={handleQuitarExistente}
                  onQuitarNueva={handleQuitarNueva}
                  cargando={guardando}
                />
              </div>

              <div className="prj-form-section">
                <span className="prj-section-label">Información básica</span>

                <div className="row g-3">
                  <div className="col-12">
                    <label className="prj-label">
                      Título del proyecto <span className="prj-required-star">*</span>
                      <span
                        className="prj-char-count"
                        style={{ color: form.titulo.length > 90 ? 'var(--rojo-soft)' : 'var(--gris-texto)' }}
                      >
                        {form.titulo.length}/100
                      </span>
                    </label>

                    <input
                      className={`prj-input${showErr('titulo') ? ' prj-input-error' : ''}`}
                      name="titulo"
                      value={form.titulo}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Ej: Sistema de Gestión Académica — UMSS"
                      maxLength={101}
                    />

                    <FieldError msg={showErr('titulo')} />
                  </div>

                  <div className="col-12">
                    <label className="prj-label">
                      Descripción
                      <span className="prj-required-star">*</span>
                      <span
                        className="prj-char-count"
                        style={{ color: form.descripcion.length > 550 ? 'var(--rojo-soft)' : 'var(--gris-texto)' }}
                      >
                        {form.descripcion.length}/600
                      </span>
                    </label>

                    <textarea
                      className={`prj-input${showErr('descripcion') ? ' prj-input-error' : ''}`}
                      name="descripcion"
                      value={form.descripcion}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      rows={3}
                      placeholder="Describe el proyecto, sus funcionalidades y objetivos..."
                      maxLength={601}
                      required
                    />

                    <FieldError msg={showErr('descripcion')} />
                  </div>

                  <div className="col-md-6">
                    <label className="prj-label">Estado <span className="prj-required-star">*</span></label>
                    <select
                      className={`prj-select${showErr('estado') ? ' prj-input-error' : ''}`}
                      name="estado"
                      value={form.estado}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    >
                      {ESTADOS_PROYECTO.map(e => (
                        <option key={e.value} value={e.value}>
                          {e.label}
                        </option>
                      ))}
                    </select>
                    <FieldError msg={showErr('estado')} />
                  </div>

                  <div className="col-md-6">
                    <label className="prj-label">Tipo de proyecto</label>
                    <select className="prj-select" name="tipo" value={form.tipo} onChange={handleChange}>
                      <option value="">Sin especificar</option>
                      {TIPOS_PROYECTO.map(t => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="prj-label">Desarrollado para</label>
                    <select
                      className="prj-select"
                      name="desarrollado_para"
                      value={form.desarrollado_para}
                      onChange={handleChange}
                    >
                      <option value="">Sin especificar</option>
                      {DESARROLLADO_PARA.map(op => (
                        <option key={op.value} value={op.value}>
                          {op.label}
                        </option>
                      ))}
                    </select>

                    <div className="prj-field-hint">
                      Indica la plataforma principal para la que fue desarrollado el proyecto.
                    </div>
                  </div>
                </div>
              </div>

              <div className="prj-form-section">
                <span className="prj-section-label">Tecnologías / Stack</span>
                <label className="prj-label">
                  Seleccionar tecnologías <span className="prj-required-star">*</span>
                </label>

                <div className={showErr('etiquetas') ? 'prj-tech-picker-error' : ''}>
                  <ProjectsTechPicker
                    selected={form.etiquetas}
                    onChange={(tags) => {
                      setForm(prev => ({ ...prev, etiquetas: tags }));
                      setTouched(prev => ({ ...prev, etiquetas: true }));
                    }}
                    catalogoExtra={catalogoExtra}
                    onAgregarExtra={async (tech) => {
                      const creada = await ensureTecnologia(tech.nombre);
                      mergeCatalogoTecnologias([creada]);
                      return creada;
                    }}
                  />
                </div>

                <FieldError msg={showErr('etiquetas')} />
              </div>

              <div className="prj-form-section">
                <span className="prj-section-label">Enlaces y documentos</span>

                <div className="row g-3">
                  <div className="col-12">
                    <label className="prj-label">
                      Repositorios de GitHub
                      <span className="prj-section-badge">
                        {form.url_repositorios.length}/{MAX_REPOSITORIOS_GITHUB}
                      </span>
                    </label>

                    {(checkingGithubLinked || githubLinked) && (
                      <div className="prj-detected-repos-box">
                        <div className="prj-detected-repos-head">
                          <div>
                            <span>
                              {checkingGithubLinked
                                ? 'Sincronizacion de GitHub'
                                : 'Repositorios detectados de tu cuenta vinculada'}
                            </span>

                            <div className="prj-field-hint" style={{ marginTop: 4 }}>
                              {checkingGithubLinked
                                ? 'Verificando si tu cuenta de GitHub esta vinculada...'
                                : loadingDetectedRepos
                                ? 'Cargando repositorios...'
                                : `${detectedRepos.length} repositorio${detectedRepos.length !== 1 ? 's' : ''} detectado${detectedRepos.length !== 1 ? 's' : ''}`}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <button
                              type="button"
                              className="prj-detected-sync-btn"
                              disabled={checkingGithubLinked || guardando || syncingDetectedRepos || loadingDetectedRepos}
                              onClick={handleSyncDetectedRepos}
                            >
                              {syncingDetectedRepos ? 'Sincronizando...' : 'Sincronizar'}
                            </button>

                            <button
                              type="button"
                              className="prj-detected-sync-btn"
                              onClick={() => setMostrarDetectedRepos(prev => !prev)}
                              disabled={checkingGithubLinked || guardando}
                            >
                              {mostrarDetectedRepos ? 'Ocultar' : 'Mostrar'}
                            </button>
                          </div>
                        </div>

                        {detectedReposError && (
                          <div className="prj-detected-error">{detectedReposError}</div>
                        )}

                        {checkingGithubLinked && (
                          <div className="prj-detected-muted">Preparando la sincronizacion con GitHub...</div>
                        )}

                        {!checkingGithubLinked && mostrarDetectedRepos && (
                          <>
                            {detectedRepos.length > 0 && (
                              <div className="prj-detected-search-wrap">
                                <input
                                  type="search"
                                  className="prj-input prj-detected-search-input"
                                  value={busquedaDetectedRepos}
                                  onChange={(e) => setBusquedaDetectedRepos(e.target.value)}
                                  placeholder="Buscar repositorio por nombre, URL, proyecto o estado..."
                                  disabled={guardando || loadingDetectedRepos}
                                />

                                {busquedaDetectedRepos && (
                                  <button
                                    type="button"
                                    className="prj-detected-search-clear"
                                    onClick={() => setBusquedaDetectedRepos('')}
                                    disabled={guardando || loadingDetectedRepos}
                                    title="Limpiar búsqueda"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            )}

                            {loadingDetectedRepos ? (
                              <div className="prj-detected-muted">Cargando repositorios detectados...</div>
                            ) : detectedRepos.length === 0 ? (
                              <div className="prj-detected-muted">No hay repositorios detectados sin proyecto.</div>
                            ) : repositoriosDetectadosFiltrados.length === 0 ? (
                              <div className="prj-detected-muted">
                                No se encontraron repositorios con “{busquedaDetectedRepos}”.
                              </div>
                            ) : (
                              <div className="prj-detected-list">
                                {repositoriosDetectadosFiltrados.map((repo) => {
                                  const url = repo?.url_repositorio || '';
                                  const yaAgregado = form.url_repositorios.includes(url);
                                  const enUso = repo?.estado_vinculacion === 'en_uso';

                                  return (
                                    <div key={repo.id_proyecto_repositorio || url} className="prj-detected-item">
                                      <div className="prj-detected-main">
                                        <div className="prj-detected-title">
                                          {repo.nombre || repo.repo_github?.repo_name || 'Repositorio GitHub'}
                                        </div>

                                        <div className="prj-detected-url">{url}</div>

                                        {enUso && repo?.proyecto?.titulo && (
                                          <div className="prj-detected-url">
                                            Proyecto: {repo.proyecto.titulo}
                                          </div>
                                        )}
                                      </div>

                                      <div className="prj-detected-side">
                                        <span className={`prj-detected-pill ${enUso ? 'warn' : repo?.validacion?.validado ? 'ok' : 'warn'}`}>
                                          {enUso
                                            ? 'en uso'
                                            : repo?.validacion?.validado
                                              ? (repo?.validacion?.relacion_github || 'validado')
                                              : 'sin validar'}
                                        </span>

                                        {enUso ? (
                                          <button
                                            type="button"
                                            className="prj-detected-add-btn"
                                            onClick={() => handleJoinRepoProject(repo)}
                                            disabled={!repo?.puede_unirse || guardando || joiningRepo}
                                          >
                                            Ser parte
                                          </button>
                                        ) : (
                                          <button
                                            type="button"
                                            className="prj-detected-add-btn"
                                            onClick={() => addDetectedRepoToForm(url)}
                                            disabled={yaAgregado || form.url_repositorios.length >= MAX_REPOSITORIOS_GITHUB || guardando}
                                          >
                                            {yaAgregado ? 'Agregado' : 'Usar en proyecto'}
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    <MultiGithubLinks
                      repositorios={form.url_repositorios}
                      onChange={(repositorios) => setForm(prev => ({ ...prev, url_repositorios: repositorios }))}
                      error={showErr('url_repositorios')}
                      cargando={guardando}
                      onTechsDetected={async (techs) => {
                        const registradas = await registrarTecnologias(techs);

                        setForm(prev => {
                          const existing = new Set(prev.etiquetas);
                          const nuevas = registradas.filter(t => !existing.has(t));
                          if (!nuevas.length) return prev;
                          return { ...prev, etiquetas: [...prev.etiquetas, ...nuevas].slice(0, 15) };
                        });
                      }}
                    />
                  </div>

                  <div className="col-12">
                    <label className="prj-label">URL del sitio web</label>
                    <input
                      className={`prj-input${showErr('url_demo') ? ' prj-input-error' : ''}`}
                      name="url_demo"
                      value={form.url_demo}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="https://mi-sitio-web.com"
                    />

                    {!showErr('url_demo') && (
                      <div className="prj-field-hint">Enlace principal del sitio web del proyecto.</div>
                    )}

                    <FieldError msg={showErr('url_demo')} />
                  </div>

                  <div className="col-12">
                    <label className="prj-label">
                      Videos demo de YouTube
                      <span className="prj-section-badge">
                        {form.url_videos.length}/{MAX_VIDEOS_YOUTUBE}
                      </span>
                    </label>

                    <MultiYoutubeLinks
                      videos={form.url_videos}
                      onChange={(videos) => setForm(prev => ({ ...prev, url_videos: videos }))}
                      error={showErr('url_videos')}
                      cargando={guardando}
                    />
                  </div>

                  <div className="col-12">
                    <label className="prj-label">
                      Documentos del proyecto
                      <span className="prj-section-badge">
                        {documentosExistentes.length + nuevosDocumentos.length}/{MAX_DOCUMENTOS}
                      </span>
                    </label>

                    <MultiDocumentUpload
                      documentosExistentes={documentosExistentes}
                      nuevosDocumentos={nuevosDocumentos}
                      onAgregar={handleAgregarDocumentos}
                      onQuitarExistente={handleQuitarDocumentoExistente}
                      onQuitarNuevo={handleQuitarDocumentoNuevo}
                      cargando={guardando}
                    />
                  </div>
                </div>
              </div>

              <div className="prj-form-section">
                <span className="prj-section-label">Período</span>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="prj-label">Fecha de inicio <span className="prj-required-star">*</span></label>
                    <input
                      type="date"
                      className={`prj-input${showErr('fecha_inicio') ? ' prj-input-error' : ''}`}
                      name="fecha_inicio"
                      value={form.fecha_inicio}
                      max={HOY}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />

                    {!showErr('fecha_inicio') && (
                      <div className="prj-field-hint">No puede ser posterior a hoy.</div>
                    )}

                    <FieldError msg={showErr('fecha_inicio')} />
                  </div>

                  <div className="col-md-6">
                    <label className="prj-label">
                      Fecha de fin {!form.en_curso && <span className="prj-required-star">*</span>}
                    </label>
                    <input
                      type="date"
                      className={`prj-input${showErr('fecha_fin') ? ' prj-input-error' : ''}`}
                      name="fecha_fin"
                      value={form.fecha_fin || ''}
                      min={minFechaFin}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={form.en_curso}
                      required={!form.en_curso}
                    />

                    {!showErr('fecha_fin') && form.fecha_inicio && !form.en_curso && (
                      <div className="prj-field-hint">
                        Debe ser igual o posterior al {minFechaFin}.
                      </div>
                    )}

                    <FieldError msg={showErr('fecha_fin')} />
                  </div>

                  <div className="col-12">
                    <label className="prj-checkbox-label">
                      <input
                        type="checkbox"
                        name="en_curso"
                        checked={form.en_curso}
                        onChange={handleChange}
                      />
                      Proyecto en curso, sin fecha de fin
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="dash-edit-footer prj-modal-foot">
              <button type="button" className="dash-edit-btn dash-edit-btn--secondary prj-btn-cancel" onClick={onCancelar} disabled={guardando}>
                Cancelar
              </button>

              <button type="submit" className="dash-edit-btn dash-edit-btn--primary prj-btn-save" disabled={guardando}>
                {guardando
                  ? <><span className="dash-edit-spinner prj-spinner" /> Guardando...</>
                  : <>
                    <svg viewBox="0 0 14 14">
                      <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" fill="none" strokeWidth="2.2" />
                    </svg>
                    {esNuevo ? 'Agregar proyecto' : 'Guardar cambios'}
                  </>
                }
              </button>
            </div>
          </form>
        </div>
      </div>

      {preConfirmPending !== null && (
        <ParticipacionModal
          onContinuar={handleParticipacionContinuar}
          onSaltar={handleParticipacionSaltar}
          loading={guardando}
          initialRol={proyecto?.participacion?.rol || ''}
          initialDescripcion={proyecto?.participacion?.descripcion_aporte || ''}
        />
      )}

      {repoEnUsoConfirmPending !== null && (
        <ConfirmModal
          open
          title="Repositorio en uso"
          message={`Este repositorio ya esta vinculado al proyecto "${repoEnUsoConfirmPending.proyecto?.titulo || 'Proyecto existente'}". ¿Quieres ser parte de este proyecto?`}
          confirmLabel="Si, ser parte"
          variant="blue"
          icon="check"
          loading={joiningRepo}
          onConfirm={handleConfirmRepoEnUso}
          onClose={handleCancelRepoEnUso}
        />
      )}

      {joinRepoPending !== null && (
        <ParticipacionModal
          onContinuar={handleJoinRepoContinuar}
          onSaltar={handleJoinRepoSaltar}
          loading={joiningRepo}
          initialRol={proyecto?.participacion?.rol || ''}
          initialDescripcion={proyecto?.participacion?.descripcion_aporte || ''}
          proyectoInfo={joinRepoPending.proyecto}
        />
      )}

      {confirmPending && (
        <ConfirmModal
          open
          title={esNuevo ? '¿Agregar proyecto?' : '¿Guardar cambios?'}
          message={esNuevo
            ? 'El proyecto se añadirá a tu portafolio. Podrás editarlo en cualquier momento.'
            : 'Los cambios se reflejarán en tu portafolio público de inmediato.'
          }
          confirmLabel={esNuevo ? 'Sí, agregar' : 'Sí, guardar'}
          variant="blue"
          icon="check"
          loading={guardando}
          onConfirm={handleConfirmar}
          onClose={() => !guardando && setConfirmPending(null)}
        />
      )}
    </>
  );
}
