import { useState, useRef, useCallback, useEffect } from 'react';
import { useLanguage } from '../../../../core/i18n';
import '../styles/projects.css';
import ConfirmModal from '../../../../shared/ui/ConfirmModal';
import ProjectsTechPicker from './ProjectsTechPicker';
import RepositoryProviderIcon from './RepositoryProviderIcon';
import ProjectRecoveryActions from './ProjectRecoveryActions';
import { ESTADOS_PROYECTO, TIPOS_PROYECTO, DESARROLLADO_PARA, getProjectOptionLabel } from '../model/projectsModel';
import {
  attachDetectedReposToProject,
  ensureTecnologia,
  ensureTecnologiasDetectadas,
  getGithubDetectedRepos,
  getGithubRepoLanguages,
  getTecnologiasCatalogoCache,
  getTecnologiasCatalogo,
  refreshTecnologiasCatalogoCache,
  repararVariantesImagen,
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

function normalizarEstadoFormulario(value) {
  const clean = String(value || '').trim();
  return ESTADOS_PROYECTO.some(estado => estado.value === clean) ? clean : '';
}

/* ════════════════════════════════════════
   Validaciones
════════════════════════════════════════ */
function validate(form, t) {
  const e = {};

  if (!form.titulo.trim()) {
    e.titulo = t('projects.validation.titleRequired');
  } else if (form.titulo.trim().length < 3) {
    e.titulo = t('projects.validation.titleMin');
  } else if (form.titulo.length > 100) {
    e.titulo = t('projects.validation.titleMax');
  }

  if (!form.descripcion.trim()) {
    e.descripcion = t('projects.validation.descriptionRequired');
  } else if (form.descripcion.length > 600) {
    e.descripcion = t('projects.validation.descriptionMax', { count: form.descripcion.length });
  }

  if (!normalizarEstadoFormulario(form.estado)) {
    e.estado = t('projects.validation.statusRequired');
  }

  if (!Array.isArray(form.etiquetas) || form.etiquetas.filter(Boolean).length === 0) {
    e.etiquetas = t('projects.validation.techRequired');
  }

  const repositoriosGithub = normalizarRepositoriosGithub(form.url_repositorios);

  if (repositoriosGithub.length > MAX_REPOSITORIOS_GITHUB) {
    e.url_repositorios = t('projects.validation.maxRepos', { count: MAX_REPOSITORIOS_GITHUB });
  }

  const repoInvalido = repositoriosGithub.find(url => !isGithubUrl(url) && !isGitlabUrl(url));
  if (repoInvalido) {
    e.url_repositorios = t('projects.validation.onlyGitRepos');
  }

  if (form.url_demo && !/^https?:\/\/.+/.test(form.url_demo)) {
    e.url_demo = t('projects.validation.websiteUrl');
  }

  const videosYoutube = normalizarVideosYoutube(form.url_videos);

  if (videosYoutube.length > MAX_VIDEOS_YOUTUBE) {
    e.url_videos = t('projects.validation.maxYoutube', { count: MAX_VIDEOS_YOUTUBE });
  }

  const videoInvalido = videosYoutube.find(url => !isYoutubeUrl(url));
  if (videoInvalido) {
    e.url_videos = t('projects.validation.onlyYoutube');
  }

  if (!form.fecha_inicio) {
    e.fecha_inicio = t('projects.validation.startRequired');
  } else if (form.fecha_inicio > HOY) {
    e.fecha_inicio = t('projects.validation.startFuture');
  }

  if (!form.en_curso && !form.fecha_fin) {
    e.fecha_fin = t('projects.validation.endRequired');
  } else if (!form.en_curso && form.fecha_fin) {
    const minFechaFin = getMinFechaFin(form.fecha_inicio);

    if (minFechaFin && form.fecha_fin < minFechaFin) {
      e.fecha_fin = t('projects.validation.endMin', { date: minFechaFin });
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

function isGitlabUrl(url) {
  return /^https?:\/\/(www\.)?gitlab\.com\/[\w.-]+(?:\/[\w.-]+)+\/?$/.test(url.trim());
}

function getRepoProviderFromUrl(url = '') {
  if (isGitlabUrl(url)) return 'gitlab';
  if (isGithubUrl(url)) return 'github';
  return 'manual';
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
      provider: repo?.provider || repo?.proveedor || getRepoProviderFromUrl(url),
    });
  });

  urlsDirectas.forEach((urlValue, index) => {
    const url = String(urlValue || '').trim();
    if (!url) return;
    const id = Number(initialGithubRepos?.detected_repo_ids?.[index]) || null;
    byUrl.set(url, {
      url,
      id: byUrl.get(url)?.id || id,
      provider: byUrl.get(url)?.provider || getRepoProviderFromUrl(url),
    });
  });

  return Array.from(byUrl.values()).slice(0, MAX_REPOSITORIOS_GITHUB);
}

function buildDetectedRepoIdsByUrl(reposIniciales = []) {
  return reposIniciales.reduce((acc, repo) => {
    if (!repo?.url || !repo?.id) return acc;
    acc[String(repo.url).trim()] = {
      id: Number(repo.id),
      provider: repo.provider || getRepoProviderFromUrl(repo.url),
    };
    return acc;
  }, {});
}

function normalizarTecnologiasInicialesGithub(initialGithubRepos) {
  return [
    ...(Array.isArray(initialGithubRepos?.tecnologias) ? initialGithubRepos.tecnologias : []),
    ...(Array.isArray(initialGithubRepos?.etiquetas) ? initialGithubRepos.etiquetas : []),
  ].map(value => String(value || '').trim()).filter(Boolean);
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
  imagenesOriginales,
  nuevasImagenes,
  onAgregar,
  onQuitarExistente,
  onQuitarNueva,
  onRepararExistente,
  cargando,
}) {
  const { t } = useLanguage();
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState('');
  const [imagenesConFallo, setImagenesConFallo] = useState({});
  const [versionesReparadas, setVersionesReparadas] = useState({});
  const [reparando, setReparando] = useState(null);

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
      setError(t('projects.validation.imageTooLarge', { size: MAX_IMAGEN_MB }));
    }

    if (!validos.length) return;

    const cuantos = Math.min(validos.length, disponibles);

    if (validos.length > cuantos) {
      setError(t('projects.validation.imageLimit', { count: disponibles, plural: disponibles !== 1 ? 'es' : '' }));
    }

    onAgregar(validos.slice(0, cuantos));
  }, [disponibles, onAgregar, t]);

  return (
    <div className="prj-multi-upload">
      {(imagenesExistentes.length > 0 || nuevasImagenes.length > 0) && (
        <div className="prj-img-grid">
          {imagenesExistentes.map((url, i) => (
            <div key={`ex-${i}`} className="prj-img-thumb">
              {i === 0 && <span className="prj-img-portada-badge">{t('projects.upload.cover')}</span>}
              <img
                src={versionesReparadas[i] ? `${url}${url.includes('?') ? '&' : '?'}v=${versionesReparadas[i]}` : url}
                alt={`Imagen ${i + 1}`}
                onError={(event) => {
                  const originalUrl = imagenesOriginales[i];
                  setImagenesConFallo(prev => ({ ...prev, [i]: true }));
                  if (originalUrl && event.currentTarget.src !== originalUrl) {
                    event.currentTarget.src = originalUrl;
                  }
                }}
              />

              {imagenesConFallo[i] && (
                <div className="prj-img-repair">
                  <span>{t('projects.upload.usingOriginal')}</span>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        setReparando(i);
                        setError('');
                        const result = await onRepararExistente(i);
                        if (result?.status === 'repaired') {
                          setImagenesConFallo(prev => ({ ...prev, [i]: false }));
                          setVersionesReparadas(prev => ({ ...prev, [i]: Date.now() }));
                        }
                      } catch (repairError) {
                        setError(repairError.message || t('projects.upload.repairError'));
                      } finally {
                        setReparando(null);
                      }
                    }}
                    disabled={cargando || reparando !== null}
                  >
                    {reparando === i ? t('projects.upload.repairing') : t('projects.upload.generateVariants')}
                  </button>
                </div>
              )}

              <button
                type="button"
                className="prj-img-remove"
                onClick={() => onQuitarExistente(i)}
                disabled={cargando}
                title={t('projects.upload.removeImage')}
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
                <span className="prj-img-portada-badge">{t('projects.upload.cover')}</span>
              )}

              <img src={item.preview} alt={`Nueva imagen ${i + 1}`} />
              <span className="prj-img-new-badge">{t('projects.upload.new')}</span>

              <button
                type="button"
                className="prj-img-remove"
                onClick={() => onQuitarNueva(i)}
                disabled={cargando}
                title={t('projects.upload.removeImage')}
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
              title={t('projects.upload.addImage', { current: total, max: MAX_IMAGENES })}
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

            <div className="prj-upload-text">{t('projects.upload.dragImages')}</div>
            <div className="prj-upload-subtext">
              {t('projects.upload.clickImages', { max: MAX_IMAGENES, size: MAX_IMAGEN_MB })}
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
          {t('projects.upload.addMoreImages', { current: total, max: MAX_IMAGENES })}
        </button>
      )}

      {disponibles === 0 && (
        <div className="prj-upload-limit-msg">
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="7" cy="7" r="6" />
            <path d="M7 4v4M7 9.5v.5" />
          </svg>
          {t('projects.upload.imageLimitReached', { max: MAX_IMAGENES })}
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
  const { t } = useLanguage();
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
      setError(t('projects.validation.documentTooLarge', { size: MAX_DOCUMENTO_MB }));
    }

    if (!permitidos.length) {
      setError(pesados.length > 0
        ? t('projects.validation.documentTooLarge', { size: MAX_DOCUMENTO_MB })
        : t('projects.validation.documentType')
      );
      return;
    }

    const cuantos = Math.min(permitidos.length, disponibles);

    if (permitidos.length > cuantos || lista.length > permitidos.length) {
      setError(t('projects.validation.documentsPartial', { count: MAX_DOCUMENTOS }));
    }

    onAgregar(permitidos.slice(0, cuantos));
  }, [disponibles, onAgregar, t]);

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
                    {t('projects.upload.viewDocument')}
                  </a>
                )}
              </div>

              <button
                type="button"
                className="prj-doc-remove"
                onClick={() => onQuitarExistente(i)}
                disabled={cargando}
                title={t('projects.upload.removeDocument')}
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
                <span className="prj-doc-url">{t('projects.upload.newPending')}</span>
              </div>

              <button
                type="button"
                className="prj-doc-remove"
                onClick={() => onQuitarNuevo(i)}
                disabled={cargando}
                title={t('projects.upload.removeDocument')}
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

          <span>{t('projects.upload.addDocuments', { current: total, max: MAX_DOCUMENTOS })}</span>
          <small>{t('projects.upload.documentHelp', { size: MAX_DOCUMENTO_MB })}</small>
        </div>
      )}

      {disponibles === 0 && (
        <div className="prj-upload-limit-msg">
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="7" cy="7" r="6" />
            <path d="M7 4v4M7 9.5v.5" />
          </svg>
          {t('projects.upload.documentLimitReached', { max: MAX_DOCUMENTOS })}
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
  const { t } = useLanguage();
  const [nuevoUrl, setNuevoUrl] = useState('');
  const [localError, setLocalError] = useState('');

  const total = videos.length;
  const disponibles = MAX_VIDEOS_YOUTUBE - total;

  const agregarVideo = () => {
    const url = nuevoUrl.trim();
    setLocalError('');

    if (!url) return;

    if (total >= MAX_VIDEOS_YOUTUBE) {
      setLocalError(t('projects.validation.youtubeLimit', { count: MAX_VIDEOS_YOUTUBE }));
      return;
    }

    if (!isYoutubeUrl(url)) {
      setLocalError(t('projects.validation.onlyYoutube'));
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
                title={t('projects.form.removeVideo')}
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
            {t('projects.form.add')}
          </button>
        </div>
      )}

      <div className="prj-field-hint">
        {t('projects.form.videoLimitHelp', { count: MAX_VIDEOS_YOUTUBE })}
      </div>

      {disponibles === 0 && (
        <div className="prj-upload-limit-msg">
          {t('projects.validation.youtubeLimit', { count: MAX_VIDEOS_YOUTUBE })}
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
  const languages = await getGithubRepoLanguages(repoUrl, {
    provider: getRepoProviderFromUrl(repoUrl),
  });

  return languages
    .map(lang => String(lang || '').trim())
    .filter(Boolean);
}

/* ════════════════════════════════════════
   MultiGithubLinks
════════════════════════════════════════ */
function MultiGithubLinks({ repositorios, onChange, error, cargando, onTechsDetected }) {
  const { t } = useLanguage();
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
      setLocalError(t('projects.validation.repoLimit', { count: MAX_REPOSITORIOS_GITHUB }));
      return;
    }

    if (!isGithubUrl(url) && !isGitlabUrl(url)) {
      setLocalError(t('projects.validation.invalidRepoUrl'));
      return;
    }

    if (repositorios.includes(url)) {
      setLocalError(t('projects.validation.repoDuplicated'));
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
          setLocalError(err.message || t('projects.github.detectTechError'));
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
              <div className={`prj-link-icon prj-link-icon-${getRepoProviderFromUrl(url) === 'gitlab' ? 'gl' : 'gh'}`}>
                <RepositoryProviderIcon provider={getRepoProviderFromUrl(url)} />
              </div>

              <div className="prj-link-info">
                <span className="prj-link-title">
                  {t('projects.form.repoTitle', { provider: getRepoProviderFromUrl(url) === 'gitlab' ? 'GitLab' : 'GitHub', count: i + 1 })}
                </span>
                <span className="prj-link-url">{url}</span>
              </div>

              <button
                type="button"
                className="prj-link-remove"
                onClick={() => quitarRepositorio(i)}
                disabled={cargando}
                title={t('projects.form.removeRepository')}
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
            placeholder="https://github.com/usuario/repositorio o https://gitlab.com/grupo/repositorio"
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
            {t('projects.form.add')}
          </button>
        </div>
      )}

      <div className="prj-field-hint">
        {t('projects.form.repoLimitHelp', { count: MAX_REPOSITORIOS_GITHUB })}
      </div>

      {disponibles === 0 && (
        <div className="prj-upload-limit-msg">
          {t('projects.validation.repoLimit', { count: MAX_REPOSITORIOS_GITHUB })}
        </div>
      )}

      {detecting && (
        <div className="prj-detected-muted prj-link-detecting">
          {t('projects.github.detectingTech')}
        </div>
      )}

      {(localError || error) && <FieldError msg={localError || error} />}
    </div>
  );
}

function ParticipacionModal({ onContinuar, onSaltar, loading, initialRol = '', initialDescripcion = '', proyectoInfo = null }) {
  const { t } = useLanguage();
  const [rol, setRol] = useState(initialRol);
  const [descripcion, setDescripcion] = useState(initialDescripcion);

  return (
    <div className="dash-edit-overlay prj-modal-overlay" style={{ zIndex: 600 }}>
      <div className="dash-edit-modal dash-edit-modal--sm prj-modal prj-modal-sm" role="dialog" aria-modal="true">
        <div className="dash-edit-head prj-modal-head">
          <div>
            <div className="dash-edit-title prj-modal-title">{t('projects.participation.title')}</div>
            <div className="dash-edit-subtitle prj-modal-sub">{t('projects.participation.subtitle')}</div>
          </div>
        </div>

        <div className="dash-edit-body prj-modal-body">
          {proyectoInfo && (
            <div className="prj-detected-item" style={{ marginBottom: 14 }}>
              <div className="prj-detected-main">
                <div className="prj-detected-title">{proyectoInfo.titulo || t('projects.form.existingProject')}</div>
                {proyectoInfo.descripcion && (
                  <div className="prj-detected-url">{proyectoInfo.descripcion}</div>
                )}
              </div>
              <div className="prj-detected-side">
                <span className="prj-detected-pill warn">{t('projects.github.inUse')}</span>
              </div>
            </div>
          )}

          <div className="prj-form-section" style={{ paddingTop: 0 }}>
            <div className="row g-3">
              <div className="col-12">
                <label className="prj-label">{t('projects.participation.roleLabel')}</label>
                <input
                  className="dash-edit-input prj-input"
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  placeholder={t('projects.participation.rolePlaceholder')}
                  maxLength={100}
                  disabled={loading}
                  autoFocus
                />
                <div className="prj-field-hint">{t('projects.participation.roleHint')}</div>
              </div>

              <div className="col-12">
                <label className="prj-label">
                  {t('projects.form.contributionDescription')}
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
                  placeholder={t('projects.participation.descriptionPlaceholder')}
                  maxLength={601}
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="dash-edit-footer prj-modal-foot">
          <button type="button" className="dash-edit-btn dash-edit-btn--secondary prj-btn-cancel" onClick={onSaltar} disabled={loading}>
            {t('projects.participation.skip')}
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
            {t('projects.participation.continue')}
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
  const { t } = useLanguage();
  const esNuevo = !proyecto;
  const reposInicialesGithub = normalizarReposInicialesGithub(initialGithubRepos);
  const tecnologiasInicialesGithub = normalizarTecnologiasInicialesGithub(initialGithubRepos);
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

    estado: normalizarEstadoFormulario(proyecto?.estado),
    tipo: proyecto?.tipo || 'sin_especificar',
    desarrollado_para: proyecto?.desarrollado_para || 'sin_especificar',

    fecha_inicio: proyecto?.fecha_inicio || '',
    fecha_fin: proyecto?.fecha_fin || '',
    en_curso: proyecto?.en_curso ?? false,
    es_publico: proyecto?.es_publico ?? true,
    etiquetas: Array.from(new Set([
      ...(Array.isArray(proyecto?.etiquetas) ? proyecto.etiquetas : []),
      ...tecnologiasInicialesGithub,
    ])),
  });

  const [imagenesExistentes, setImagenesExistentes] = useState(() => {
    if (Array.isArray(proyecto?.imagenes) && proyecto.imagenes.length > 0) {
      return proyecto.imagenes;
    }

    const url = proyecto?.imagenUrl || proyecto?.imagen_portada || null;
    return url ? [url] : [];
  });
  const [imagenesOriginalesExistentes, setImagenesOriginalesExistentes] = useState(() => {
    if (Array.isArray(proyecto?.imagenes_originales) && proyecto.imagenes_originales.length > 0) {
      return proyecto.imagenes_originales;
    }

    return Array.isArray(proyecto?.imagenes) ? proyecto.imagenes : [];
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
  const [gitlabLinked, setGitlabLinked] = useState(false);
  const [detectedRepos, setDetectedRepos] = useState([]);
  const [busquedaDetectedRepos, setBusquedaDetectedRepos] = useState('');
  const [loadingDetectedRepos, setLoadingDetectedRepos] = useState(false);
  const [syncingDetectedRepos, setSyncingDetectedRepos] = useState(false);
  const [detectingRepoUrl, setDetectingRepoUrl] = useState('');
  const [mostrarDetectedRepos, setMostrarDetectedRepos] = useState(false);
  const [detectedReposError, setDetectedReposError] = useState('');
  const [detectedReposNotice, setDetectedReposNotice] = useState('');
  const [joinRepoPending, setJoinRepoPending] = useState(null);
  const [joiningRepo, setJoiningRepo] = useState(false);
  const initialReposTechDetectionKeyRef = useRef('');

  const errors = validate(form, t);
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

  useEffect(() => {
    if (Array.isArray(initialGithubRepos?.tecnologias_detalle) && initialGithubRepos.tecnologias_detalle.length > 0) {
      mergeCatalogoTecnologias(initialGithubRepos.tecnologias_detalle);
    }
  }, [initialGithubRepos, mergeCatalogoTecnologias]);

  const registrarTecnologias = useCallback(async (nombres = []) => {
    const lista = [...new Set(
      nombres
        .map(nombre => String(nombre || '').trim())
        .filter(Boolean)
    )];

    if (!lista.length) return [];

    try {
      const registradas = await ensureTecnologiasDetectadas(lista, 'lenguaje');

      if (registradas.length > 0) {
        mergeCatalogoTecnologias(registradas);
        return registradas.map(tech => tech.nombre);
      }
    } catch {}

    const fallback = lista.map(nombre => ({
      nombre,
      categoria: 'Lenguaje',
      tipo: 'lenguaje',
    }));

    mergeCatalogoTecnologias(fallback);

    return fallback.map(tech => tech.nombre);
  }, [mergeCatalogoTecnologias]);

  const aplicarTecnologiasDetectadas = useCallback(async (techs = []) => {
    const registradas = await registrarTecnologias(techs);

    if (registradas.length === 0) {
      return registradas;
    }

    setForm(prev => {
      const existing = new Set(prev.etiquetas);
      const nuevas = registradas.filter(t => !existing.has(t));
      if (!nuevas.length) return prev;
      return { ...prev, etiquetas: [...prev.etiquetas, ...nuevas].slice(0, 15) };
    });

    setTouched(prev => ({ ...prev, etiquetas: true }));

    return registradas;
  }, [registrarTecnologias]);

  useEffect(() => {
    if (!esNuevo || !initialGithubRepos || tecnologiasInicialesGithub.length > 0) return undefined;

    const urls = normalizarReposInicialesGithub(initialGithubRepos)
      .map(repo => repo.url)
      .filter(Boolean);
    const key = urls.map(normalizarGithubUrlParaComparar).join('|');

    if (!key || initialReposTechDetectionKeyRef.current === key) {
      return undefined;
    }

    initialReposTechDetectionKeyRef.current = key;
    let active = true;

    const detectarTecnologiasIniciales = async () => {
      try {
        setDetectingRepoUrl('initial-github-repos');
        setDetectedReposError('');

        const groups = await Promise.all(
          urls.map(url => fetchGithubLangsForUrl(url).catch(() => []))
        );

        if (!active) return;
        await aplicarTecnologiasDetectadas(groups.flat());
      } catch (e) {
        if (active) {
          setDetectedReposError(e.message || t('projects.github.detectTechError'));
        }
      } finally {
        if (active) {
          setDetectingRepoUrl('');
        }
      }
    };

    detectarTecnologiasIniciales();

    return () => {
      active = false;
    };
  }, [aplicarTecnologiasDetectadas, esNuevo, initialGithubRepos, tecnologiasInicialesGithub.length, t]);

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
    const originalUrl = imagenesOriginalesExistentes[idx] || imagenesExistentes[idx];

    if (originalUrl) {
      setImagenesAEliminar(prev => (
        prev.includes(originalUrl) ? prev : [...prev, originalUrl]
      ));
    }

    setImagenesExistentes(prev => prev.filter((_, i) => i !== idx));
    setImagenesOriginalesExistentes(prev => prev.filter((_, i) => i !== idx));
  }, [imagenesExistentes, imagenesOriginalesExistentes]);

  const handleRepararExistente = useCallback(async (idx) => {
    const proyectoId = proyecto?.id || proyecto?.id_proyecto;
    const originalUrl = imagenesOriginalesExistentes[idx];

    if (!proyectoId || !originalUrl) {
      throw new Error(t('projects.upload.originalMissing'));
    }

    const result = await repararVariantesImagen(proyectoId, originalUrl);
    if (result?.status === 'original_missing') {
      setImagenesExistentes(prev => prev.filter((_, i) => i !== idx));
      setImagenesOriginalesExistentes(prev => prev.filter((_, i) => i !== idx));
    }

    return result;
  }, [imagenesOriginalesExistentes, proyecto, t]);

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
    const documento = documentosExistentes[idx];

    if (documento) {
      setDocumentosAEliminar(prev => [...prev, documento]);
    }

    setDocumentosExistentes(prev => prev.filter((_, i) => i !== idx));
  }, [documentosExistentes]);

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
        .map((repo) => [String(repo.url_repositorio).trim(), {
          id: Number(repo.id_proyecto_repositorio),
          provider: repo.proveedor || getRepoProviderFromUrl(repo.url_repositorio),
        }]),
    );

    const detectedReposPayload = repositoriosGithub
      .map((url) => {
        const detected = detectedByUrl.get(String(url).trim()) || detectedRepoIdsInicialesByUrl[String(url).trim()];
        const id = Number(typeof detected === 'object' ? detected.id : detected);

        if (!Number.isInteger(id) || id <= 0) return null;

        return {
          id,
          url,
          provider: detected?.provider || getRepoProviderFromUrl(url),
        };
      })
      .filter(Boolean);

    const detectedRepoIds = detectedReposPayload.map((repo) => repo.id);

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
        detected_repos: detectedReposPayload,
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

  const loadDetectedRepos = useCallback(async (refresh = false, providersOverride = null) => {
    try {
      setLoadingDetectedRepos(true);
      setDetectedReposError('');

      const providers = Array.isArray(providersOverride) ? providersOverride : [
        ...(githubLinked ? ['github'] : []),
        ...(gitlabLinked ? ['gitlab'] : []),
      ];
      const responses = await Promise.all(
        providers.map(async (provider) => {
          const repos = await getGithubDetectedRepos({ refresh, provider });
          return (Array.isArray(repos) ? repos : []).map((repo) => ({
            ...repo,
            proveedor: repo.proveedor || provider,
          }));
        }),
      );
      const normalizedRepos = responses.flat();
      setDetectedRepos(normalizedRepos);
      return normalizedRepos;
    } catch (e) {
      setDetectedReposError(e.message || t('projects.github.loadError'));
      return [];
    } finally {
      setLoadingDetectedRepos(false);
    }
  }, [githubLinked, gitlabLinked, t]);

  useEffect(() => {
    let mounted = true;

    const boot = async () => {
      try {
        const github = await isGithubLinked({ provider: 'github', force: true });
        const gitlab = await isGithubLinked({ provider: 'gitlab' });
        if (!mounted) return;

        setGithubLinked(github);
        setGitlabLinked(gitlab);

        const providers = [
          ...(github ? ['github'] : []),
          ...(gitlab ? ['gitlab'] : []),
        ];

        if (providers.length > 0) {
          await loadDetectedRepos(false, providers);
        }
      } catch {
        if (!mounted) return;
        setGithubLinked(false);
        setGitlabLinked(false);
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

  const handleSyncDetectedRepos = useCallback(async (provider = 'github') => {
    try {
      setSyncingDetectedRepos(true);
      setDetectedReposError('');
      await syncGithubRepos({ provider });
      const repos = await loadDetectedRepos(false);
      const proyectoId = Number(form.id_proyecto || form.id || 0);

      if (proyectoId > 0) {
        const selectedUrls = new Set(
          normalizarRepositoriosGithub(form.url_repositorios)
            .map((url) => String(url).trim())
            .filter(Boolean),
        );

        const repositoriosIds = repos
          .filter((repo) => (repo?.proveedor || 'github') === provider && selectedUrls.has(String(repo?.url_repositorio || '').trim()))
          .map((repo) => Number(repo?.id_proyecto_repositorio))
          .filter((id) => Number.isInteger(id) && id > 0);

        if (repositoriosIds.length > 0) {
          await attachDetectedReposToProject(proyectoId, repositoriosIds, {
            rol: form.rol || '',
            descripcion_aporte: form.descripcion_aporte || '',
          }, { provider });

          await loadDetectedRepos(false);
        }
      }
    } catch (e) {
      setDetectedReposError(e.message || t('projects.github.syncError', { provider: provider === 'gitlab' ? 'GitLab' : 'GitHub' }));
    } finally {
      setSyncingDetectedRepos(false);
    }
  }, [form, loadDetectedRepos, t]);

  const addDetectedRepoToForm = useCallback(async (url) => {
    const cleanUrl = String(url || '').trim();
    if (!cleanUrl) return;

    const actual = normalizarRepositoriosGithub(form.url_repositorios);

    if (actual.includes(cleanUrl) || actual.length >= MAX_REPOSITORIOS_GITHUB) {
      return;
    }

    setForm((prev) => {
      return {
        ...prev,
        url_repositorios: [...actual, cleanUrl],
      };
    });

    try {
      setDetectingRepoUrl(cleanUrl);
      setDetectedReposError('');
      const techs = await fetchGithubLangsForUrl(cleanUrl);
      await aplicarTecnologiasDetectadas(techs);
    } catch (e) {
      setDetectedReposError(e.message || t('projects.github.detectTechError'));
    } finally {
      setDetectingRepoUrl('');
    }
  }, [aplicarTecnologiasDetectadas, form.url_repositorios, t]);

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
        { provider: joinRepoPending.proveedor || 'github' },
      );

      setJoinRepoPending(null);
      await loadDetectedRepos(false);
    } catch (e) {
      setDetectedReposError(e.message || t('projects.github.joinError'));
    } finally {
      setJoiningRepo(false);
    }
  }, [joinRepoPending, loadDetectedRepos, t]);

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
      >
        <div className="dash-edit-modal dash-edit-modal--xl prj-modal" role="dialog" aria-modal="true">
          <div className="dash-edit-head prj-modal-head">
            <div>
              <div className="dash-edit-title prj-modal-title">
                {esNuevo ? t('projects.modal.newTitle') : t('projects.modal.editTitle')}
              </div>
              <div className="dash-edit-subtitle prj-modal-sub">
                {esNuevo
                  ? t('projects.modal.newSubtitle')
                  : t('projects.modal.editSubtitle')}
              </div>
            </div>

            <button
              type="button"
              className="dash-edit-close prj-modal-close"
              onClick={onCancelar}
              disabled={guardando}
              title={t('projects.modal.close')}
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
              {t('projects.modal.reviewErrors')}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'contents' }} autoComplete="off" noValidate>
            <div className="dash-edit-body prj-modal-body">
              <div className="prj-form-section">
                <span className="prj-section-label">
                  {t('projects.modal.images')}
                  <span className="prj-section-badge">
                    {imagenesExistentes.length + nuevasImagenes.length}/{MAX_IMAGENES}
                  </span>
                </span>

                <MultiImageUpload
                  imagenesExistentes={imagenesExistentes}
                  imagenesOriginales={imagenesOriginalesExistentes}
                  nuevasImagenes={nuevasImagenes}
                  onAgregar={handleAgregarImagenes}
                  onQuitarExistente={handleQuitarExistente}
                  onQuitarNueva={handleQuitarNueva}
                  onRepararExistente={handleRepararExistente}
                  cargando={guardando}
                />
              </div>

              <div className="prj-form-section">
                <span className="prj-section-label">{t('projects.modal.basicInfo')}</span>

                <div className="row g-3">
                  <div className="col-12">
                    <label className="prj-label">
                      {t('projects.form.title')} <span className="prj-required-star">*</span>
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
                      placeholder={t('projects.form.titlePlaceholder')}
                      maxLength={101}
                    />

                    <FieldError msg={showErr('titulo')} />
                  </div>

                  <div className="col-12">
                    <label className="prj-label">
                      {t('projects.form.description')}
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
                      placeholder={t('projects.form.descriptionPlaceholder')}
                      maxLength={601}
                      required
                    />

                    <FieldError msg={showErr('descripcion')} />
                  </div>

                  <div className="col-md-6">
                    <label className="prj-label">{t('projects.form.state')} <span className="prj-required-star">*</span></label>
                    <select
                      className={`prj-select${showErr('estado') ? ' prj-input-error' : ''}`}
                      name="estado"
                      value={form.estado}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    >
                      <option value="" disabled>
                        {t('projects.statusModal.select')}
                      </option>
                      {ESTADOS_PROYECTO.map(e => (
                        <option key={e.value} value={e.value}>
                          {getProjectOptionLabel(e, t)}
                        </option>
                      ))}
                    </select>
                    <FieldError msg={showErr('estado')} />
                  </div>

                  <div className="col-md-6">
                    <label className="prj-label">{t('projects.form.projectType')}</label>
                    <select className="prj-select" name="tipo" value={form.tipo} onChange={handleChange}>
                      {TIPOS_PROYECTO.map(tipo => (
                        <option key={tipo.value} value={tipo.value}>
                          {getProjectOptionLabel(tipo, t)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="prj-label">{t('projects.form.platform')}</label>
                    <select
                      className="prj-select"
                      name="desarrollado_para"
                      value={form.desarrollado_para}
                      onChange={handleChange}
                    >
                      {DESARROLLADO_PARA.map(op => (
                        <option key={op.value} value={op.value}>
                          {getProjectOptionLabel(op, t)}
                        </option>
                      ))}
                    </select>

                    <div className="prj-field-hint">
                      {t('projects.form.platformHint')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="prj-form-section">
                <span className="prj-section-label">{t('projects.form.techStack')}</span>
                <label className="prj-label">
                  {t('projects.tech.select')} <span className="prj-required-star">*</span>
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
                <span className="prj-section-label">{t('projects.modal.linksEvidence')}</span>

                <div className="row g-3">
                  <div className="col-12">
                    <label className="prj-label">
                      {t('projects.form.repositories')}
                      <span className="prj-section-badge">
                        {form.url_repositorios.length}/{MAX_REPOSITORIOS_GITHUB}
                      </span>
                    </label>

                    {(checkingGithubLinked || githubLinked || gitlabLinked) && (
                      <div className="prj-detected-repos-box">
                        <div className="prj-detected-repos-head">
                          <div>
                            <span>
                              {checkingGithubLinked
                                ? t('projects.github.syncTitle')
                                : t('projects.github.detectedTitle')}
                            </span>

                            <div className="prj-field-hint" style={{ marginTop: 4 }}>
                              {checkingGithubLinked
                                ? t('projects.github.checking')
                                : loadingDetectedRepos
                                ? t('projects.github.loading')
                                : t('projects.github.detectedCount', { count: detectedRepos.length, plural: detectedRepos.length !== 1 ? 's' : '' })}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <button
                              type="button"
                              className="prj-detected-sync-btn"
                              disabled={checkingGithubLinked || guardando || syncingDetectedRepos || loadingDetectedRepos || !githubLinked}
                              onClick={() => handleSyncDetectedRepos('github')}
                            >
                              {syncingDetectedRepos ? t('projects.github.syncing') : t('projects.github.syncGithub')}
                            </button>

                            <button
                              type="button"
                              className="prj-detected-sync-btn"
                              disabled={checkingGithubLinked || guardando || syncingDetectedRepos || loadingDetectedRepos || !gitlabLinked}
                              onClick={() => handleSyncDetectedRepos('gitlab')}
                            >
                              {syncingDetectedRepos ? t('projects.github.syncing') : t('projects.github.syncGitlab')}
                            </button>

                            <button
                              type="button"
                              className="prj-detected-sync-btn"
                              onClick={() => setMostrarDetectedRepos(prev => !prev)}
                              disabled={checkingGithubLinked || guardando}
                            >
                              {mostrarDetectedRepos ? t('projects.github.hide') : t('projects.github.show')}
                            </button>
                          </div>
                        </div>

                        {detectedReposError && (
                          <div className="prj-detected-error">{detectedReposError}</div>
                        )}
                        {detectedReposNotice && (
                          <div className="prj-detected-notice">{detectedReposNotice}</div>
                        )}

                        {checkingGithubLinked && (
                          <div className="prj-detected-muted">{t('projects.github.preparing')}</div>
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
                                  placeholder={t('projects.github.searchPlaceholder')}
                                  disabled={guardando || loadingDetectedRepos}
                                />

                                {busquedaDetectedRepos && (
                                  <button
                                    type="button"
                                    className="prj-detected-search-clear"
                                    onClick={() => setBusquedaDetectedRepos('')}
                                    disabled={guardando || loadingDetectedRepos}
                                    title={t('projects.github.clearSearch')}
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            )}

                            {loadingDetectedRepos ? (
                              <div className="prj-detected-muted">{t('projects.github.loadingDetected')}</div>
                            ) : detectedRepos.length === 0 ? (
                              <div className="prj-detected-muted">{t('projects.github.empty')}</div>
                            ) : repositoriosDetectadosFiltrados.length === 0 ? (
                              <div className="prj-detected-muted">
                                {t('projects.github.noResults', { query: busquedaDetectedRepos })}
                              </div>
                            ) : (
                              <div className="prj-detected-list">
                                {repositoriosDetectadosFiltrados.map((repo) => {
                                  const url = repo?.url_repositorio || '';
                                  const yaAgregado = form.url_repositorios.includes(url);
                                  const enUso = repo?.estado_vinculacion === 'en_uso';
                                  const proyectoEliminado = repo?.estado_vinculacion === 'proyecto_eliminado';

                                  return (
                                    <div key={repo.id_proyecto_repositorio || url} className="prj-detected-item">
                                      <div className="prj-detected-main">
                                        <div className="prj-detected-title">
                                          {repo.nombre || repo.repo_github?.repo_name || t('projects.github.repository')}
                                        </div>

                                        <div className="prj-detected-url">{url}</div>

                                        {(enUso || proyectoEliminado) && repo?.proyecto?.titulo && (
                                          <div className="prj-detected-url">
                                            {t('projects.github.project')}: {repo.proyecto.titulo}
                                          </div>
                                        )}
                                      </div>

                                      <div className="prj-detected-side">
                                        <span className="prj-detected-pill">
                                          <RepositoryProviderIcon provider={repo?.proveedor || getRepoProviderFromUrl(url)} />
                                          {repo?.proveedor === 'gitlab' ? 'GitLab' : 'GitHub'}
                                        </span>

                                        <span className={`prj-detected-pill ${(enUso || proyectoEliminado) ? 'warn' : repo?.validacion?.validado ? 'ok' : 'warn'}`}>
                                          {proyectoEliminado
                                            ? t('projects.github.deletedProject')
                                            : enUso
                                            ? t('projects.github.inUse')
                                            : repo?.validacion?.validado
                                              ? (repo?.validacion?.relacion_github || t('projects.github.validated'))
                                              : t('projects.github.unvalidated')}
                                        </span>

                                        {proyectoEliminado ? (
                                          <ProjectRecoveryActions
                                            repo={repo}
                                            disabled={guardando || joiningRepo}
                                            onNotice={setDetectedReposNotice}
                                            onError={setDetectedReposError}
                                            onChanged={() => loadDetectedRepos(false)}
                                          />
                                        ) : enUso ? (
                                          <button
                                            type="button"
                                            className="prj-detected-add-btn"
                                            onClick={() => handleJoinRepoProject(repo)}
                                            disabled={!repo?.puede_unirse || guardando || joiningRepo}
                                          >
                                            {t('projects.github.bePart')}
                                          </button>
                                        ) : (
                                          <button
                                            type="button"
                                            className="prj-detected-add-btn"
                                            onClick={() => addDetectedRepoToForm(url)}
                                            disabled={yaAgregado || form.url_repositorios.length >= MAX_REPOSITORIOS_GITHUB || guardando || detectingRepoUrl === url}
                                          >
                                            {detectingRepoUrl === url ? t('projects.github.detecting') : yaAgregado ? t('projects.github.added') : t('projects.github.useInProject')}
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
                        await aplicarTecnologiasDetectadas(techs);
                      }}
                    />
                  </div>

                  <div className="col-12">
                    <label className="prj-label">{t('projects.form.websiteUrl')}</label>
                    <input
                      className={`prj-input${showErr('url_demo') ? ' prj-input-error' : ''}`}
                      name="url_demo"
                      value={form.url_demo}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="https://mi-sitio-web.com"
                    />

                    {!showErr('url_demo') && (
                      <div className="prj-field-hint">{t('projects.form.websiteHint')}</div>
                    )}

                    <FieldError msg={showErr('url_demo')} />
                  </div>

                  <div className="col-12">
                    <label className="prj-label">
                      {t('projects.form.youtubeVideos')}
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
                      {t('projects.form.documents')}
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
                <span className="prj-section-label">{t('projects.modal.period')}</span>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="prj-label">{t('projects.form.startDate')} <span className="prj-required-star">*</span></label>
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
                      <div className="prj-field-hint">{t('projects.form.startDateHint')}</div>
                    )}

                    <FieldError msg={showErr('fecha_inicio')} />
                  </div>

                  <div className="col-md-6">
                    <label className="prj-label">
                      {t('projects.form.endDate')} {!form.en_curso && <span className="prj-required-star">*</span>}
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
                        {t('projects.form.endDateHint', { date: minFechaFin })}
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
                      {t('projects.form.currentProject')}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="dash-edit-footer prj-modal-foot">
              <button type="button" className="dash-edit-btn dash-edit-btn--secondary prj-btn-cancel" onClick={onCancelar} disabled={guardando}>
                {t('projects.form.cancel')}
              </button>

              <button type="submit" className="dash-edit-btn dash-edit-btn--primary prj-btn-save" disabled={guardando}>
                {guardando
                  ? <><span className="dash-edit-spinner prj-spinner" /> {t('projects.form.saving')}</>
                  : <>
                    <svg viewBox="0 0 14 14">
                      <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" fill="none" strokeWidth="2.2" />
                    </svg>
                    {esNuevo ? t('projects.form.addProject') : t('projects.form.saveChanges')}
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
          title={t('projects.confirm.repoInUseTitle')}
          message={t('projects.confirm.repoInUseMessage', { title: repoEnUsoConfirmPending.proyecto?.titulo || t('projects.card.defaultTitle') })}
          confirmLabel={t('projects.confirm.bePart')}
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
          title={esNuevo ? t('projects.confirm.addTitle') : t('projects.confirm.saveTitle')}
          message={esNuevo
            ? t('projects.confirm.addMessage')
            : t('projects.confirm.saveMessage')
          }
          confirmLabel={esNuevo ? t('projects.confirm.add') : t('projects.confirm.save')}
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
