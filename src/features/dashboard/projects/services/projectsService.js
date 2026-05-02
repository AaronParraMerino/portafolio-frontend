// ═══════════════════════════════════════════
// projectsService.js
// src/features/dashboard/projects/services/projectsService.js
//
// Capa de adaptación Frontend <-> Backend Laravel.
//
// El frontend trabaja con:
// id, titulo, descripcion, estado, tipo, desarrollado_para,
// url_repositorios, url_demo, url_videos, imagenes, documentos,
// fecha_inicio, fecha_fin, en_curso, es_publico, etiquetas.
//
// El backend puede trabajar con:
// id_proyecto, id_tipo_proyecto, estado_publicacion, estado_desarrollo,
// participaciones, proyecto_evidencias/evidencias, tipos_proyecto, etc.
// ═══════════════════════════════════════════

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const STORAGE_URL = process.env.REACT_APP_STORAGE_URL || 'http://localhost:8000/storage';

// ═══════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════

export const PROJECT_LIMITS = {
  images: 5,
  videosYoutube: 2,
  repositoriosGithub: 3,
  documentos: 2,
  imageMaxMb: 5,
  documentMaxMb: 10,
};

export const DOCUMENT_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'md', 'odt'];

// ═══════════════════════════════════════════
// SESIÓN / FETCH
// ═══════════════════════════════════════════

function getSession() {
  const raw = sessionStorage.getItem('usuario');

  if (!raw) throw new Error('No hay sesión activa');

  const user = JSON.parse(raw);
  const userId = user.id || user.id_usuario || user.idUsuario;

  if (!userId) throw new Error('ID de usuario no encontrado');

  const token = localStorage.getItem('tokenPORT') || sessionStorage.getItem('tokenPORT');

  if (!token) throw new Error('Token no encontrado');

  return { userId, token };
}

async function apiFetch(url, options = {}) {
  const { token } = getSession();

  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    let msg = `Error ${res.status}`;

    try {
      const d = await res.json();
      msg = d.message || d.error || msg;
    } catch {}

    throw new Error(msg);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

async function apiFetchFormData(url, formData, options = {}) {
  const { token } = getSession();

  const res = await fetch(url, {
    ...options,
    method: options.method || 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    body: formData,
  });

  if (!res.ok) {
    let msg = `Error ${res.status}`;

    try {
      const d = await res.json();
      msg = d.message || d.error || msg;
    } catch {}

    throw new Error(msg);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

// ═══════════════════════════════════════════
// HELPERS GENERALES
// ═══════════════════════════════════════════

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function cleanArray(values) {
  return Array.isArray(values)
    ? values.map(v => cleanString(v)).filter(Boolean)
    : [];
}

function normalizeBoolean(value) {
  return Boolean(value);
}

function normalizeNullableDate(value) {
  const clean = cleanString(value);
  return clean || null;
}

function normalizeEtiquetas(etiquetas) {
  if (!Array.isArray(etiquetas)) return [];

  return etiquetas
    .map(item => {
      if (typeof item === 'string') return item.trim();
      return item.nombre || item.name || item.label || '';
    })
    .filter(Boolean);
}

function formatUrl(path) {
  if (!path) return '';

  const value = String(path).trim();

  if (!value) return '';
  if (value.startsWith('http://')) return value;
  if (value.startsWith('https://')) return value;
  if (value.startsWith('blob:')) return value;
  if (value.startsWith('data:')) return value;

  return `${STORAGE_URL}/${value.replace(/^\/+/, '')}`;
}

function getFileExtension(filename = '') {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function isDocumentoPermitido(file) {
  if (!file?.name) return false;

  const ext = getFileExtension(file.name);
  return DOCUMENT_EXTENSIONS.includes(ext);
}

function getDocumentoUrl(doc) {
  if (!doc) return '';

  if (typeof doc === 'string') return doc;

  return doc.url || doc.ruta || doc.path || doc.archivo_url || doc.archivoPath || '';
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

function normalizeRepositorios(datos) {
  const nuevos = cleanArray(datos?.url_repositorios);

  if (nuevos.length > 0) return nuevos;

  const legacy = cleanString(datos?.url_repositorio);
  return legacy ? [legacy] : [];
}

function normalizeVideos(datos) {
  const nuevos = cleanArray(datos?.url_videos);

  if (nuevos.length > 0) return nuevos;

  const legacy = cleanString(datos?.url_video);
  return legacy ? [legacy] : [];
}

// ═══════════════════════════════════════════
// HELPERS PARA BACKEND EXISTENTE
// ═══════════════════════════════════════════

function getProjectId(project = {}) {
  return project.id || project.id_proyecto || project.idProyecto || null;
}

function getTipoValue(project = {}) {
  if (project.tipo) return project.tipo;

  if (typeof project.tipo_proyecto === 'string') return project.tipo_proyecto;

  if (project.tipo_proyecto?.slug) return project.tipo_proyecto.slug;
  if (project.tipoProyecto?.slug) return project.tipoProyecto.slug;

  if (project.tipo_proyecto?.value) return project.tipo_proyecto.value;
  if (project.tipoProyecto?.value) return project.tipoProyecto.value;

  if (project.tipo_proyecto?.nombre) return project.tipo_proyecto.nombre;
  if (project.tipoProyecto?.nombre) return project.tipoProyecto.nombre;

  return '';
}

function getTipoLabel(project = {}) {
  if (project.tipoLabel) return project.tipoLabel;
  if (project.tipo_label) return project.tipo_label;

  if (project.tipo_proyecto?.nombre) return project.tipo_proyecto.nombre;
  if (project.tipoProyecto?.nombre) return project.tipoProyecto.nombre;

  return '';
}

function getParticipacionUsuario(project = {}) {
  if (project.participacion) return project.participacion;

  if (Array.isArray(project.participaciones) && project.participaciones.length > 0) {
    return project.participaciones[0];
  }

  return null;
}

function mapEstadoToFront(project = {}) {
  if (project.estado) return project.estado;

  const publicacion = project.estado_publicacion;
  const desarrollo = project.estado_desarrollo;

  if (publicacion === 'archivado') return 'archivado';
  if (publicacion === 'publicado') return 'publicado';

  if (
    desarrollo === 'en_desarrollo' ||
    desarrollo === 'mantenimiento' ||
    desarrollo === 'versionado'
  ) {
    return 'desarrollo';
  }

  return 'borrador';
}

function mapEstadoToBackend(estado) {
  switch (estado) {
    case 'publicado':
      return {
        estado_publicacion: 'publicado',
        estado_desarrollo: 'terminado',
      };

    case 'desarrollo':
      return {
        estado_publicacion: 'borrador',
        estado_desarrollo: 'en_desarrollo',
      };

    case 'archivado':
      return {
        estado_publicacion: 'archivado',
        estado_desarrollo: 'sin_especificar',
      };

    case 'borrador':
    default:
      return {
        estado_publicacion: 'borrador',
        estado_desarrollo: 'sin_especificar',
      };
  }
}

function getEvidencias(project = {}) {
  if (Array.isArray(project.evidencias)) return project.evidencias;
  if (Array.isArray(project.proyecto_evidencias)) return project.proyecto_evidencias;
  if (Array.isArray(project.proyectoEvidencias)) return project.proyectoEvidencias;

  return [];
}

function evidenciaUrl(ev = {}) {
  return ev.url || ev.archivo_url || ev.archivoUrl || ev.archivo_path || ev.archivoPath || '';
}

function evidenciaTipo(ev = {}) {
  return cleanString(ev.tipo).toLowerCase();
}

function isVisible(ev = {}) {
  return ev.es_visible === undefined || ev.es_visible === null || ev.es_visible === true || ev.es_visible === 1;
}

function sortByOrden(a, b) {
  return (a.orden ?? 0) - (b.orden ?? 0);
}

function getImagenesFromEvidencias(evidencias = []) {
  return evidencias
    .filter(isVisible)
    .filter(ev => ['imagen', 'captura'].includes(evidenciaTipo(ev)))
    .sort(sortByOrden)
    .map(ev => formatUrl(evidenciaUrl(ev)))
    .filter(Boolean);
}

function getPortadaFromEvidencias(evidencias = [], imagenes = []) {
  const portada = evidencias
    .filter(isVisible)
    .find(ev => ['imagen', 'captura'].includes(evidenciaTipo(ev)) && (ev.es_portada === true || ev.es_portada === 1));

  return formatUrl(evidenciaUrl(portada)) || imagenes[0] || '';
}

function getRepositoriosFromEvidencias(evidencias = []) {
  return evidencias
    .filter(isVisible)
    .filter(ev => evidenciaTipo(ev) === 'repositorio')
    .sort(sortByOrden)
    .map(ev => cleanString(ev.url))
    .filter(Boolean);
}

function getVideosFromEvidencias(evidencias = []) {
  return evidencias
    .filter(isVisible)
    .filter(ev => evidenciaTipo(ev) === 'video')
    .sort(sortByOrden)
    .map(ev => cleanString(ev.url))
    .filter(Boolean);
}

function getSitioFromEvidencias(evidencias = []) {
  const sitio = evidencias
    .filter(isVisible)
    .find(ev => ['demo', 'sitio', 'sitio_web', 'web'].includes(evidenciaTipo(ev)));

  return cleanString(sitio?.url);
}

function getDocumentosFromEvidencias(evidencias = []) {
  return evidencias
    .filter(isVisible)
    .filter(ev => ['documento', 'pdf', 'documentacion', 'presentacion'].includes(evidenciaTipo(ev)))
    .sort(sortByOrden)
    .map(ev => {
      const url = formatUrl(evidenciaUrl(ev));

      if (!url) return null;

      return {
        id: ev.id || ev.id_evidencia || ev.id_proyecto_evidencia || null,
        url,
        nombre: ev.nombre || ev.nombre_original || ev.titulo || getDocumentoNombre(url),
        mime: ev.mime || ev.mime_type || null,
        size: ev.size || ev.tamanio_bytes || null,
        tipo: evidenciaTipo(ev) || 'documento',
      };
    })
    .filter(Boolean);
}

function getEtiquetasFromProject(project = {}) {
  if (Array.isArray(project.etiquetas)) {
    return normalizeEtiquetas(project.etiquetas);
  }

  if (Array.isArray(project.tecnologias)) {
    return normalizeEtiquetas(project.tecnologias);
  }

  if (Array.isArray(project.tags)) {
    return normalizeEtiquetas(project.tags);
  }

  return [];
}

// ═══════════════════════════════════════════
// NORMALIZACIÓN FRONT <-> API
// ═══════════════════════════════════════════

export function normalizeProyectoFromApi(project = {}) {
  const evidencias = getEvidencias(project);

  const imagenesDirectas = Array.isArray(project.imagenes)
    ? project.imagenes.map(formatUrl).filter(Boolean)
    : [];

  const imagenesDesdeEvidencias = getImagenesFromEvidencias(evidencias);

  const imagenes = imagenesDirectas.length > 0
    ? imagenesDirectas
    : imagenesDesdeEvidencias.length > 0
      ? imagenesDesdeEvidencias
      : project.imagen_portada
        ? [formatUrl(project.imagen_portada)]
        : project.imagenUrl
          ? [formatUrl(project.imagenUrl)]
          : [];

  const portada = project.imagen_portada
    ? formatUrl(project.imagen_portada)
    : getPortadaFromEvidencias(evidencias, imagenes);

  const reposFromEvidencias = getRepositoriosFromEvidencias(evidencias);
  const repositorios = Array.isArray(project.url_repositorios) && project.url_repositorios.length > 0
    ? cleanArray(project.url_repositorios)
    : reposFromEvidencias.length > 0
      ? reposFromEvidencias
      : project.url_repositorio
        ? [project.url_repositorio]
        : [];

  const videosFromEvidencias = getVideosFromEvidencias(evidencias);
  const videos = Array.isArray(project.url_videos) && project.url_videos.length > 0
    ? cleanArray(project.url_videos)
    : videosFromEvidencias.length > 0
      ? videosFromEvidencias
      : project.url_video
        ? [project.url_video]
        : [];

  const sitioWeb = project.url_demo || project.url_sitio_web || project.url_sitioweb || getSitioFromEvidencias(evidencias) || '';

  const documentosDirectos = Array.isArray(project.documentos)
    ? project.documentos
        .map(doc => {
          const url = formatUrl(getDocumentoUrl(doc));

          if (!url) return null;

          return {
            ...(typeof doc === 'object' ? doc : {}),
            url,
            nombre: getDocumentoNombre(doc),
          };
        })
        .filter(Boolean)
    : [];

  const documentos = documentosDirectos.length > 0
    ? documentosDirectos
    : getDocumentosFromEvidencias(evidencias);

  const participacion = getParticipacionUsuario(project);

  const esPublico = project.es_publico !== undefined
    ? Boolean(project.es_publico)
    : participacion?.visibilidad
      ? participacion.visibilidad === 'publico'
      : project.estado_publicacion
        ? project.estado_publicacion === 'publicado'
        : true;

  const id = getProjectId(project);

  return {
    ...project,

    id,
    id_proyecto: project.id_proyecto || id,

    titulo: project.titulo || '',
    descripcion: project.descripcion || '',

    estado: mapEstadoToFront(project),
    estado_publicacion: project.estado_publicacion,
    estado_desarrollo: project.estado_desarrollo,

    tipo: getTipoValue(project),
    tipoLabel: getTipoLabel(project),

    id_tipo_proyecto: project.id_tipo_proyecto || project.tipo_proyecto?.id_tipo_proyecto || project.tipoProyecto?.id_tipo_proyecto || null,

    desarrollado_para: project.desarrollado_para || '',

    url_repositorios: repositorios,
    url_repositorio: project.url_repositorio || repositorios[0] || '',

    url_demo: sitioWeb,

    url_videos: videos,
    url_video: project.url_video || videos[0] || '',

    imagenes,
    imagenUrl: imagenes[0] || null,
    imagen_portada: portada || imagenes[0] || null,

    documentos,

    fecha_inicio: project.fecha_inicio || participacion?.fecha_inicio || '',
    fecha_fin: project.fecha_fin || participacion?.fecha_fin || null,
    en_curso: project.en_curso !== undefined
      ? Boolean(project.en_curso)
      : !(project.fecha_fin || participacion?.fecha_fin),

    es_publico: esPublico,

    etiquetas: getEtiquetasFromProject(project),
  };
}

/**
 * Payload que el front envía al backend.
 *
 * Incluye:
 * - nombres cómodos del front
 * - nombres probables del backend existente
 * - evidencias para que el backend pueda sincronizar enlaces si decide hacerlo así
 */
export function normalizeProyectoPayload(datos = {}) {
  const repositorios = normalizeRepositorios(datos).slice(0, PROJECT_LIMITS.repositoriosGithub);
  const videos = normalizeVideos(datos).slice(0, PROJECT_LIMITS.videosYoutube);
  const estadoBackend = mapEstadoToBackend(datos.estado || 'borrador');

  const sitioWeb = cleanString(datos.url_demo);

  const evidencias = [
    ...repositorios.map((url, index) => ({
      tipo: 'repositorio',
      url,
      orden: index,
      es_visible: true,
    })),

    ...(sitioWeb
      ? [{
        tipo: 'demo',
        url: sitioWeb,
        orden: 0,
        es_visible: true,
      }]
      : []),

    ...videos.map((url, index) => ({
      tipo: 'video',
      url,
      orden: index,
      es_visible: true,
    })),
  ];

  return {
    titulo: cleanString(datos.titulo),
    descripcion: cleanString(datos.descripcion),

    estado: datos.estado || 'borrador',
    ...estadoBackend,

    tipo: cleanString(datos.tipo),
    tipo_slug: cleanString(datos.tipo),
    id_tipo_proyecto: datos.id_tipo_proyecto || datos.idTipoProyecto || null,

    desarrollado_para: cleanString(datos.desarrollado_para),

    url_repositorios: repositorios,
    url_repositorio: repositorios[0] || '',

    url_demo: sitioWeb,
    url_sitio_web: sitioWeb,

    url_videos: videos,
    url_video: videos[0] || '',

    fecha_inicio: normalizeNullableDate(datos.fecha_inicio),
    fecha_fin: datos.en_curso ? null : normalizeNullableDate(datos.fecha_fin),
    en_curso: normalizeBoolean(datos.en_curso),

    es_publico: datos.es_publico ?? true,
    visibilidad: datos.es_publico === false ? 'privado' : 'publico',

    etiquetas: normalizeEtiquetas(datos.etiquetas),
    tecnologias: normalizeEtiquetas(datos.etiquetas),

    evidencias,
    proyecto_evidencias: evidencias,
  };
}

// ═══════════════════════════════════════════
// PROYECTOS
// ═══════════════════════════════════════════

export async function getProyectos() {
  const { userId } = getSession();

  const data = await apiFetch(`${API_URL}/projects/usuario/${userId}`);

  const lista = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.proyectos)
        ? data.proyectos
        : [];

  return lista.map(normalizeProyectoFromApi);
}

export async function getProyecto(id) {
  const data = await apiFetch(`${API_URL}/projects/${id}`);

  const project = data?.data || data?.proyecto || data;

  return normalizeProyectoFromApi(project);
}

export async function crearProyecto(datos) {
  const payload = normalizeProyectoPayload(datos);

  const data = await apiFetch(`${API_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const project = data?.data || data?.proyecto || data;

  return normalizeProyectoFromApi(project);
}

export async function actualizarProyecto(id, datos) {
  const payload = normalizeProyectoPayload(datos);

  const data = await apiFetch(`${API_URL}/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const project = data?.data || data?.proyecto || data;

  return normalizeProyectoFromApi(project);
}

export async function eliminarProyecto(id) {
  return apiFetch(`${API_URL}/projects/${id}`, {
    method: 'DELETE',
  });
}

// ═══════════════════════════════════════════
// IMÁGENES
// ═══════════════════════════════════════════

export async function uploadImagenes(id, archivos = []) {
  if (!archivos.length) return { urls: [] };

  const formData = new FormData();

  archivos.forEach(file => {
    formData.append('images[]', file);
    formData.append('imagenes[]', file);
  });

  return apiFetchFormData(`${API_URL}/projects/${id}/images`, formData, {
    method: 'POST',
  });
}

export async function eliminarImagenes(id, urls = []) {
  return apiFetch(`${API_URL}/projects/${id}/images`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      urls,
      imagenes: urls,
    }),
  });
}

export async function reordenarImagenes(id, urls = []) {
  return apiFetch(`${API_URL}/projects/${id}/images/reorder`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      urls,
      imagenes: urls,
    }),
  });
}

// ═══════════════════════════════════════════
// DOCUMENTOS
// ═══════════════════════════════════════════

export async function uploadDocumentos(id, archivos = []) {
  if (!archivos.length) return { documents: [], documentos: [], urls: [] };

  const invalidos = archivos.filter(file => !isDocumentoPermitido(file));

  if (invalidos.length > 0) {
    throw new Error('Solo se aceptan documentos PDF, DOC, DOCX, TXT, RTF, MD u ODT.');
  }

  const formData = new FormData();

  archivos.forEach(file => {
    formData.append('documents[]', file);
    formData.append('documentos[]', file);
  });

  return apiFetchFormData(`${API_URL}/projects/${id}/documents`, formData, {
    method: 'POST',
  });
}

export async function eliminarDocumentos(id, urls = []) {
  return apiFetch(`${API_URL}/projects/${id}/documents`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      urls,
      documentos: urls,
    }),
  });
}

export async function reordenarDocumentos(id, urls = []) {
  return apiFetch(`${API_URL}/projects/${id}/documents/reorder`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      urls,
      documentos: urls,
    }),
  });
}

// ═══════════════════════════════════════════
// ENLACES
// ═══════════════════════════════════════════

export async function actualizarEnlacesProyecto(id, datos = {}) {
  const payload = normalizeProyectoPayload(datos);

  const data = await apiFetch(`${API_URL}/projects/${id}/links`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url_repositorios: payload.url_repositorios,
      url_repositorio: payload.url_repositorio,

      url_demo: payload.url_demo,
      url_sitio_web: payload.url_sitio_web,

      url_videos: payload.url_videos,
      url_video: payload.url_video,

      evidencias: payload.evidencias,
      proyecto_evidencias: payload.proyecto_evidencias,
    }),
  });

  const project = data?.data || data?.proyecto || data;

  return normalizeProyectoFromApi(project);
}

// ═══════════════════════════════════════════
// LEGACY
// ═══════════════════════════════════════════

export async function uploadImagenPortada(id, archivo, _tieneImagen = false) {
  const resultado = await uploadImagenes(id, [archivo]);
  const url = resultado?.urls?.[0] || resultado?.imagenes?.[0] || null;

  return { url };
}

export async function eliminarImagenPortada(id) {
  return apiFetch(`${API_URL}/projects/${id}/images`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      urls: [],
      imagenes: [],
    }),
  });
}

export async function uploadDocumentoProyecto(id, archivo) {
  const resultado = await uploadDocumentos(id, [archivo]);

  const doc = resultado?.documents?.[0] || resultado?.documentos?.[0] || null;
  const url = doc?.url || resultado?.urls?.[0] || null;

  return { url, documento: doc };
}

export async function eliminarDocumentoProyecto(id) {
  return apiFetch(`${API_URL}/projects/${id}/documents`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      urls: [],
      documentos: [],
    }),
  });
}