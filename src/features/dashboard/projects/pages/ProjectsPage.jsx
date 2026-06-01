import { useEffect, useState } from 'react';
import { useLanguage } from '../../../../core/i18n';
import { FiPlus } from 'react-icons/fi';
import '../styles/projects.css';
import { useProjects } from '../hooks/useProjects';
import Header from '../../layout/Header';
import ProjectsFilters     from '../components/ProjectsFilters';
import ProjectsGrid        from '../components/ProjectsGrid';
import ProjectsEdit        from '../components/ProjectsEdit';
import ProjectsConfigModal from '../components/ProjectsConfigModal';
import ProjectsToast       from '../components/ProjectsToast';
import ConfirmModal from '../../../../shared/ui/ConfirmModal';
import { ESTADOS_PROYECTO, getProjectOptionLabel } from '../model/projectsModel';

const ESTADO_DETALLE = {
  publicado: 'projects.statusDetail.publicado',
  borrador: 'projects.statusDetail.borrador',
  archivado: 'projects.statusDetail.archivado',
  en_desarrollo: 'projects.statusDetail.en_desarrollo',
  pausado: 'projects.statusDetail.pausado',
  terminado: 'projects.statusDetail.terminado',
  mantenimiento: 'projects.statusDetail.mantenimiento',
  versionado: 'projects.statusDetail.versionado',
  cancelado: 'projects.statusDetail.cancelado',
};

const ESTADO_SECCIONES = [
  {
    labelKey: 'projects.statusSection.publication',
    estados: ['borrador', 'publicado', 'archivado'],
  },
  {
    labelKey: 'projects.statusSection.development',
    estados: ['en_desarrollo', 'pausado', 'terminado', 'mantenimiento', 'versionado', 'cancelado'],
  },
];

function getEstadoLabel(value, t = null) {
  const option = ESTADOS_PROYECTO.find((estado) => estado.value === value);
  return option ? getProjectOptionLabel(option, t) : (value || 'Pendiente');
}

function normalizarEstadoSeleccionable(value) {
  const clean = String(value || '').trim();
  return ESTADOS_PROYECTO.some((estado) => estado.value === clean) ? clean : '';
}

function isEstadoEnDesarrollo(estado) {
  return ['en_desarrollo', 'pausado', 'mantenimiento', 'versionado'].includes(estado);
}

/* ════════════════════════════════════════
   ProjectsPage
   src/features/dashboard/projects/pages/ProjectsPage.jsx

   Solo orquesta: estado UI + callbacks.
   Toda la lógica de datos vive en useProjects.
   Toda la lógica de presentación vive en sus componentes.
════════════════════════════════════════ */
function ProjectsBackgroundActivity({ active, label }) {
  if (!active) return null;

  return (
    <div className="prj-bg-activity" role="status" aria-live="polite">
      <span className="prj-bg-activity-spinner" />
      <span>{label}</span>
    </div>
  );
}

export default function ProjectsPage() {
  const { t } = useLanguage();
  const {
    proyectos, loading, guardando, toast,
    crearNuevo, editarExistente, eliminar, desvincularParticipacion, actualizarConfiguracion, refrescar,
  } = useProjects();

  // ── Estado UI puro ──
  const [editando,   setEditando]   = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [confirmDetach, setConfirmDetach] = useState(null);
  const [configurando, setConfigurando] = useState(null);
  const [estadoProyecto, setEstadoProyecto] = useState(null);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');
  const [estadoError, setEstadoError] = useState('');
  const [filtro,     setFiltro]     = useState('todos');
  const [busqueda,   setBusqueda]   = useState('');
  const [orden,      setOrden]      = useState('recientes');
  const [reposIniciales, setReposIniciales] = useState(null);
  const [cargaInicialTerminada, setCargaInicialTerminada] = useState(false);

  const headerActions = [
    {
      label: t('projects.header.add'),
      title: t('projects.header.addProject'),
      ariaLabel: t('projects.header.addProject'),
      icon: <FiPlus />,
      onClick: () => setEditando('nuevo'),
    },
  ];

  useEffect(() => {
    if (!loading) {
      setCargaInicialTerminada(true);
    }
  }, [loading]);

  // ── Callbacks ──
  const handleGuardar = (
    datos,
    imagenesNuevas = [],
    imagenesAEliminar = [],
    documentosNuevos = [],
    documentosAEliminar = []
  ) => {
    const editandoActual = editando;
    const tarea = editandoActual === 'nuevo'
      ? crearNuevo(datos, imagenesNuevas, imagenesAEliminar, documentosNuevos, documentosAEliminar)
      : editarExistente(editandoActual.id || editandoActual.id_proyecto, datos, imagenesNuevas, imagenesAEliminar, documentosNuevos, documentosAEliminar);

    setEditando(null);
    setReposIniciales(null);

    tarea.catch(() => {});
    return tarea;
  };

  const handleAgregarNuevo = () => {
    setReposIniciales(null);
    setEditando('nuevo');
  };

  const handleAgregarConRepos = (selection) => {
    setReposIniciales(selection || null);
    setEditando('nuevo');
  };

  const handleEditar = (proyecto) => {
    setReposIniciales(null);
    setEditando(proyecto);
  };

  const handleCancelarEdicion = () => {
    setEditando(null);
    setReposIniciales(null);
  };

  const handleGuardarConfiguracion = (configuracion) => {
    if (!configurando) return;

    const tarea = actualizarConfiguracion(configurando.id, configuracion);
    setConfigurando(null);

    tarea.catch(() => {});
    return tarea;
  };

  const handleAbrirEstadoProyecto = (proyecto) => {
    setEstadoProyecto(proyecto);
    setEstadoSeleccionado(normalizarEstadoSeleccionable(proyecto?.estado));
    setEstadoError('');
  };

  const handleCerrarEstadoProyecto = () => {
    setEstadoProyecto(null);
    setEstadoSeleccionado('');
    setEstadoError('');
  };

  const handleGuardarEstadoProyecto = () => {
    if (!estadoProyecto) return;

    const estadoActual = normalizarEstadoSeleccionable(estadoProyecto.estado);
    const nuevoEstado = normalizarEstadoSeleccionable(estadoSeleccionado);

    if (!nuevoEstado) {
      setEstadoError(t('projects.validation.statusRequired'));
      return;
    }

    if (nuevoEstado !== estadoActual) {
      const tarea = editarExistente(
        estadoProyecto.id || estadoProyecto.id_proyecto,
        { ...estadoProyecto, estado: nuevoEstado }
      );

      tarea.catch(() => {});
    }

    setEstadoProyecto(null);
    setEstadoSeleccionado('');
    setEstadoError('');
  };

  // ── Derivados: filtrar + ordenar + contar ──
  const proyectosFiltrados = proyectos
    .filter(p => {
      if (filtro !== 'todos') {
        if (filtro === 'desarrollo') {
          if (!isEstadoEnDesarrollo(p.estado)) return false;
        } else if (p.estado !== filtro) {
          return false;
        }
      }

      if (busqueda) {
        const q = busqueda.toLowerCase();
        return (
          p.titulo.toLowerCase().includes(q) ||
          p.descripcion?.toLowerCase().includes(q) ||
          p.etiquetas?.some(t => t.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (orden === 'recientes') return (b.fecha_inicio || '') > (a.fecha_inicio || '') ? 1 : -1;
      if (orden === 'antiguos')  return (a.fecha_inicio || '') > (b.fecha_inicio || '') ? 1 : -1;
      if (orden === 'alfa')      return a.titulo.localeCompare(b.titulo);
      return 0;
    });

  const conteo = {
    todos:      proyectos.length,
    publicado:  proyectos.filter(p => p.estado === 'publicado').length,
    desarrollo: proyectos.filter(p => isEstadoEnDesarrollo(p.estado)).length,
    borrador:   proyectos.filter(p => p.estado === 'borrador').length,
    archivado:  proyectos.filter(p => p.estado === 'archivado').length,
  };

  const estadoActualProyecto = normalizarEstadoSeleccionable(estadoProyecto?.estado);
  const hayCambioEstado = estadoSeleccionado !== estadoActualProyecto;
  const loadingInicial = loading && !cargaInicialTerminada && proyectos.length === 0;
  const activityLabel = guardando
    ? t('projects.activity.saving')
    : loading
      ? t('projects.activity.loading')
      : '';

  // ── Loading ──
  if (loadingInicial) {
    return (
      <div className="prj-page">
        <Header title={t('projects.header.title')} actions={headerActions} />
        <div className="dash-loading dash-loading--page" role="status" aria-live="polite">
          <span className="dash-loading-spinner" />
          <span>{t('projects.loading.title')}...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="prj-page">

      <Header title={t('projects.header.title')} actions={headerActions} />

      <div className="prj-content">

        <ProjectsFilters
          busqueda={busqueda}   onBusqueda={setBusqueda}
          filtro={filtro}       onFiltro={setFiltro}
          orden={orden}         onOrden={setOrden}
          conteo={conteo}
          onAgregarConRepos={handleAgregarConRepos}
          onReposChanged={refrescar}
        />

        <ProjectsGrid
          proyectos={proyectosFiltrados}
          busqueda={busqueda}
          onEditar={handleEditar}
          onEliminar={(p)   => setConfirmDel(p)}
          onDesvincular={(p) => setConfirmDetach(p)}
          onConfigurar={(p) => setConfigurando(p)}
          onEstadoProyecto={handleAbrirEstadoProyecto}
          onAgregar={handleAgregarNuevo}
        />

      </div>

      {/* ── Modales ── */}

      {editando !== null && (
        <ProjectsEdit
          proyecto={editando === 'nuevo' ? null : editando}
          initialGithubRepos={editando === 'nuevo' ? reposIniciales : null}
          onGuardar={handleGuardar}
          onCancelar={handleCancelarEdicion}
          guardando={guardando}
        />
      )}

      {configurando && (
        <ProjectsConfigModal
          proyecto={configurando}
          guardando={guardando}
          onGuardar={handleGuardarConfiguracion}
          onCancelar={() => !guardando && setConfigurando(null)}
        />
      )}

      <ConfirmModal
        open={!!estadoProyecto}
        title={t('projects.statusModal.title')}
        subtitle={estadoProyecto?.titulo || t('projects.card.defaultTitle')}
        message={(
          <div className="prj-state-modal">
            <div className="prj-state-summary">
              {t('projects.statusModal.title')}: <strong>{getEstadoLabel(estadoActualProyecto, t)}</strong>
            </div>

            <div className="prj-state-options" role="radiogroup" aria-label={t('projects.statusModal.title')}>
              {ESTADO_SECCIONES.map((section) => (
                <div key={section.labelKey} className="prj-state-section">
                  <div className="prj-state-section-title">{t(section.labelKey)}</div>

                  <div className="prj-state-section-options">
                    {section.estados
                      .map(value => ESTADOS_PROYECTO.find(estado => estado.value === value))
                      .filter(Boolean)
                      .map((estado) => {
                        const selected = estadoSeleccionado === estado.value;
                        const current = estadoActualProyecto === estado.value;

                        return (
                          <button
                            key={estado.value}
                            type="button"
                            className={`prj-state-option ${selected ? 'active' : ''}`}
                            role="radio"
                            aria-checked={selected}
                            onClick={() => {
                              setEstadoSeleccionado(estado.value);
                              setEstadoError('');
                            }}
                            disabled={guardando}
                          >
                            <span className={`prj-state-dot ${estado.value}`} />
                            <span className="prj-state-option-main">
                              <span className="prj-state-label">{getProjectOptionLabel(estado, t)}</span>
                              <span className="prj-state-description">
                                {t(ESTADO_DETALLE[estado.value])}
                              </span>
                            </span>
                            {current && <span className="prj-state-current-badge">{t('projects.statusModal.current')}</span>}
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>

            {estadoError && (
              <div className="prj-state-error" role="alert">
                {estadoError}
              </div>
            )}
          </div>
        )}
        confirmLabel={!estadoSeleccionado ? t('projects.statusModal.select') : hayCambioEstado ? t('projects.statusModal.save') : t('projects.statusModal.save')}
        cancelLabel={t('projects.statusModal.cancel')}
        variant="blue"
        icon="info"
        onConfirm={handleGuardarEstadoProyecto}
        onClose={handleCerrarEstadoProyecto}
      />

      <ConfirmModal
        open={!!confirmDel}
        title={t('projects.confirm.deleteTitle')}
        message={t('projects.confirm.deleteMessage', { title: confirmDel?.titulo || t('projects.card.defaultTitle') })}
        confirmLabel={t('projects.confirm.delete')}
        variant="red"
        icon="warning"
        onConfirm={async () => { await eliminar(confirmDel.id); setConfirmDel(null); }}
        onClose={() => setConfirmDel(null)}
      />

      <ConfirmModal
        open={!!confirmDetach}
        title={t('projects.confirm.unlinkTitle')}
        message={t('projects.confirm.unlinkMessage', { title: confirmDetach?.titulo || t('projects.card.defaultTitle') })}
        confirmLabel={t('projects.confirm.unlink')}
        variant="blue"
        icon="warning"
        onConfirm={async () => { await desvincularParticipacion(confirmDetach.id); setConfirmDetach(null); }}
        onClose={() => setConfirmDetach(null)}
      />

      <ProjectsToast toast={toast} />
      <ProjectsBackgroundActivity active={!!activityLabel} label={activityLabel} />

    </div>
  );
}
