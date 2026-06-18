import { useEffect, useState } from 'react';
import { useLanguage } from '../../../../core/i18n';
import '../styles/projects.css';
import { useProjects } from '../hooks/useProjects';
import Header from '../../layout/Header';
import { DashboardAddIcon } from '../../layout/DashboardIcons';
import ProjectsFilters     from '../components/ProjectsFilters';
import ProjectsGrid        from '../components/ProjectsGrid';
import ProjectsEdit        from '../components/ProjectsEdit';
import ProjectsConfigModal from '../components/ProjectsConfigModal';
import ProjectsToast       from '../components/ProjectsToast';
import ConfirmModal from '../../../../shared/ui/ConfirmModal';
import BackgroundSaveIndicator from '../../../../shared/ui/BackgroundSaveIndicator';
import { ESTADOS_PROYECTO, getProjectOptionLabel } from '../model/projectsModel';
import {
  getProyectoConfiguracion,
  getProyectoDeletionPreview,
} from '../services/projectsService';

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
export default function ProjectsPage() {
  const { t } = useLanguage();
  const {
    proyectos, loading, guardando, savingProjectIds, toast,
    crearNuevo, editarExistente, eliminar, desvincularParticipacion, actualizarConfiguracion, refrescar,
  } = useProjects();

  // ── Estado UI puro ──
  const [editando,   setEditando]   = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [confirmDelTitle, setConfirmDelTitle] = useState('');
  const [confirmDelLoading, setConfirmDelLoading] = useState(false);
  const [confirmDelError, setConfirmDelError] = useState('');
  const [confirmDetach, setConfirmDetach] = useState(null);
  const [configurando, setConfigurando] = useState(null);
  const [cargandoConfiguracionId, setCargandoConfiguracionId] = useState(null);
  const [estadoProyecto, setEstadoProyecto] = useState(null);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');
  const [estadoError, setEstadoError] = useState('');
  const [filtro,     setFiltro]     = useState('todos');
  const [busqueda,   setBusqueda]   = useState('');
  const [orden,      setOrden]      = useState('recientes');
  const [reposIniciales, setReposIniciales] = useState(null);
  const [cargaInicialTerminada, setCargaInicialTerminada] = useState(false);
  const savingProjectIdSet = new Set((savingProjectIds || []).map(String));

  const headerActions = [
    {
      label: t('projects.header.add'),
      title: t('projects.header.addProject'),
      ariaLabel: t('projects.header.addProject'),
      icon: <DashboardAddIcon />,
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
    const id = proyecto?.id || proyecto?.id_proyecto;
    if (id && savingProjectIdSet.has(String(id))) return;

    setReposIniciales(null);
    setEditando(proyecto);
  };

  const handleAbrirEliminar = async (proyecto) => {
    const id = proyecto?.id || proyecto?.id_proyecto;
    if (!id || savingProjectIdSet.has(String(id))) return;

    setConfirmDelTitle('');
    setConfirmDelError('');
    setConfirmDelLoading(true);
    setConfirmDel({ ...proyecto, deletionPreview: null });

    try {
      const preview = await getProyectoDeletionPreview(id);
      setConfirmDel((current) => current ? { ...current, deletionPreview: preview } : current);
    } catch (error) {
      setConfirmDelError(error.message || 'No se pudo comprobar el tipo de eliminacion.');
    } finally {
      setConfirmDelLoading(false);
    }
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

  const handleAbrirConfiguracion = async (proyecto) => {
    const id = proyecto?.id || proyecto?.id_proyecto;
    if (!id || savingProjectIdSet.has(String(id)) || cargandoConfiguracionId !== null) return;

    setCargandoConfiguracionId(String(id));

    try {
      const data = await getProyectoConfiguracion(id);
      const permisos = data?.permisos || proyecto?.permisos || {};

      setConfigurando({
        ...proyecto,
        configuracion: data?.configuracion || proyecto?.configuracion || {},
        permisos,
        puede_editar: permisos.puede_editar ?? proyecto?.puede_editar,
        puede_configurar: permisos.puede_configurar ?? proyecto?.puede_configurar,
        puede_eliminar: permisos.puede_eliminar ?? proyecto?.puede_eliminar,
      });
    } catch (error) {
      await refrescar({ silent: true }).catch(() => {});
      window.alert(error.message || 'No se pudo cargar la configuración actual del proyecto.');
    } finally {
      setCargandoConfiguracionId(null);
    }
  };

  const handleAbrirEstadoProyecto = (proyecto) => {
    const id = proyecto?.id || proyecto?.id_proyecto;
    if (id && savingProjectIdSet.has(String(id))) return;

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
  const editandoId = editando && editando !== 'nuevo' ? (editando.id || editando.id_proyecto) : null;
  const editandoGuardando = editandoId ? savingProjectIdSet.has(String(editandoId)) : false;
  const configurandoId = configurando?.id || configurando?.id_proyecto;
  const configurandoGuardando = configurandoId ? savingProjectIdSet.has(String(configurandoId)) : false;
  const estadoProyectoId = estadoProyecto?.id || estadoProyecto?.id_proyecto;
  const estadoProyectoGuardando = estadoProyectoId ? savingProjectIdSet.has(String(estadoProyectoId)) : false;
  const confirmDelId = confirmDel?.id || confirmDel?.id_proyecto;
  const confirmDelGuardando = confirmDelId ? savingProjectIdSet.has(String(confirmDelId)) : false;
  const confirmDetachId = confirmDetach?.id || confirmDetach?.id_proyecto;
  const confirmDetachGuardando = confirmDetachId ? savingProjectIdSet.has(String(confirmDetachId)) : false;
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
          onEliminar={handleAbrirEliminar}
          onDesvincular={(p) => setConfirmDetach(p)}
          onConfigurar={handleAbrirConfiguracion}
          onEstadoProyecto={handleAbrirEstadoProyecto}
          onAgregar={handleAgregarNuevo}
          validatingConfigurationId={cargandoConfiguracionId}
        />

      </div>

      {/* ── Modales ── */}

      {editando !== null && (
        <ProjectsEdit
          proyecto={editando === 'nuevo' ? null : editando}
          initialGithubRepos={editando === 'nuevo' ? reposIniciales : null}
          onGuardar={handleGuardar}
          onCancelar={handleCancelarEdicion}
          guardando={editandoGuardando}
        />
      )}

      {configurando && (
        <ProjectsConfigModal
          proyecto={configurando}
          guardando={configurandoGuardando}
          onGuardar={handleGuardarConfiguracion}
          onCancelar={() => !configurandoGuardando && setConfigurando(null)}
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
                            disabled={estadoProyectoGuardando}
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
        message={confirmDel?.deletionPreview?.es_permanente ? (
          <div>
            <p>Este proyecto no tiene repositorios vinculados. La eliminacion sera permanente.</p>
            <label className="prj-label">
              Escribe exactamente <strong>{confirmDel?.titulo}</strong> para confirmar:
            </label>
            <input
              className="prj-input"
              value={confirmDelTitle}
              onChange={(event) => setConfirmDelTitle(event.target.value)}
              disabled={confirmDelGuardando}
              autoFocus
            />
            {confirmDelError && <div className="prj-detected-error">{confirmDelError}</div>}
          </div>
        ) : confirmDelLoading ? (
          'Comprobando el tipo de eliminacion...'
        ) : (
          t('projects.confirm.deleteMessage', { title: confirmDel?.titulo || t('projects.card.defaultTitle') })
        )}
        confirmLabel={t('projects.confirm.delete')}
        variant="red"
        icon="warning"
        loading={confirmDelGuardando || confirmDelLoading}
        confirmDisabled={
          Boolean(confirmDelError)
          || !confirmDel?.deletionPreview
          || (
            confirmDel?.deletionPreview?.es_permanente
            && confirmDelTitle.trim() !== String(confirmDel?.titulo || '').trim()
          )
        }
        onConfirm={async () => {
          try {
            await eliminar(confirmDelId, confirmDelTitle);
            setConfirmDel(null);
            setConfirmDelTitle('');
          } catch {}
        }}
        onClose={() => {
          if (confirmDelGuardando || confirmDelLoading) return;
          setConfirmDel(null);
          setConfirmDelTitle('');
          setConfirmDelError('');
        }}
      />

      <ConfirmModal
        open={!!confirmDetach}
        title={t('projects.confirm.unlinkTitle')}
        message={t('projects.confirm.unlinkMessage', { title: confirmDetach?.titulo || t('projects.card.defaultTitle') })}
        confirmLabel={t('projects.confirm.unlink')}
        variant="blue"
        icon="warning"
        loading={confirmDetachGuardando}
        onConfirm={async () => { await desvincularParticipacion(confirmDetachId); setConfirmDetach(null); }}
        onClose={() => !confirmDetachGuardando && setConfirmDetach(null)}
      />

      <ProjectsToast toast={toast} />
      <BackgroundSaveIndicator active={!!activityLabel} label={activityLabel} />

    </div>
  );
}
