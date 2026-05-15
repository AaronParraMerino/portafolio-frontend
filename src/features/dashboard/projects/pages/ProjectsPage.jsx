import { useState } from 'react';
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
import { ESTADOS_PROYECTO } from '../model/projectsModel';

const ESTADO_DETALLE = {
  publicado: 'Visible como proyecto publicado.',
  desarrollo: 'Trabajo activo o en progreso.',
  borrador: 'Guardado sin publicarse todavia.',
  archivado: 'Fuera del listado activo.',
};

function getEstadoLabel(value) {
  return ESTADOS_PROYECTO.find((estado) => estado.value === value)?.label || value || 'Borrador';
}

/* ════════════════════════════════════════
   ProjectsPage
   src/features/dashboard/projects/pages/ProjectsPage.jsx

   Solo orquesta: estado UI + callbacks.
   Toda la lógica de datos vive en useProjects.
   Toda la lógica de presentación vive en sus componentes.
════════════════════════════════════════ */
export default function ProjectsPage() {
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
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('borrador');
  const [filtro,     setFiltro]     = useState('todos');
  const [busqueda,   setBusqueda]   = useState('');
  const [orden,      setOrden]      = useState('recientes');
  const [reposIniciales, setReposIniciales] = useState(null);

  const headerActions = [
    {
      label: 'Agregar nuevo',
      title: 'Agregar nuevo proyecto',
      ariaLabel: 'Agregar nuevo proyecto',
      icon: <FiPlus />,
      onClick: () => setEditando('nuevo'),
    },
  ];

  // ── Callbacks ──
  const handleGuardar = async (
    datos,
    imagenesNuevas = [],
    imagenesAEliminar = [],
    documentosNuevos = [],
    documentosAEliminar = []
  ) => {
    if (editando === 'nuevo') {
      await crearNuevo(datos, imagenesNuevas, imagenesAEliminar, documentosNuevos, documentosAEliminar);
    } else {
      await editarExistente(editando.id, datos, imagenesNuevas, imagenesAEliminar, documentosNuevos, documentosAEliminar);
    }

    setEditando(null);
    setReposIniciales(null);
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
    if (guardando) return;
    setEditando(null);
    setReposIniciales(null);
  };

  const handleGuardarConfiguracion = async (configuracion) => {
    if (!configurando) return;
    await actualizarConfiguracion(configurando.id, configuracion);
    setConfigurando(null);
  };

  const handleAbrirEstadoProyecto = (proyecto) => {
    setEstadoProyecto(proyecto);
    setEstadoSeleccionado(proyecto?.estado || 'borrador');
  };

  const handleCerrarEstadoProyecto = () => {
    if (guardando) return;
    setEstadoProyecto(null);
    setEstadoSeleccionado('borrador');
  };

  const handleGuardarEstadoProyecto = async () => {
    if (!estadoProyecto) return;

    const estadoActual = estadoProyecto.estado || 'borrador';
    const nuevoEstado = estadoSeleccionado || estadoActual;

    if (nuevoEstado !== estadoActual) {
      await editarExistente(
        estadoProyecto.id || estadoProyecto.id_proyecto,
        { ...estadoProyecto, estado: nuevoEstado }
      );
    }

    setEstadoProyecto(null);
    setEstadoSeleccionado('borrador');
  };

  // ── Derivados: filtrar + ordenar + contar ──
  const proyectosFiltrados = proyectos
    .filter(p => {
      if (filtro !== 'todos' && p.estado !== filtro) return false;
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
    desarrollo: proyectos.filter(p => p.estado === 'desarrollo').length,
    borrador:   proyectos.filter(p => p.estado === 'borrador').length,
    archivado:  proyectos.filter(p => p.estado === 'archivado').length,
  };

  const estadoActualProyecto = estadoProyecto?.estado || 'borrador';
  const hayCambioEstado = estadoSeleccionado !== estadoActualProyecto;

  // ── Loading ──
  if (loading) {
    return (
      <div className="prj-page">
        <Header title="Mis Proyectos" actions={headerActions} />
        <div className="dash-loading dash-loading--page" role="status" aria-live="polite">
          <span className="dash-loading-spinner" />
          <span>Cargando proyectos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="prj-page">

      <Header title="Mis Proyectos" actions={headerActions} />

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
        title="Estado del proyecto"
        subtitle={estadoProyecto?.titulo || 'Proyecto'}
        message={(
          <div className="prj-state-modal">
            <div className="prj-state-summary">
              Estado actual: <strong>{getEstadoLabel(estadoActualProyecto)}</strong>
            </div>

            <div className="prj-state-options" role="radiogroup" aria-label="Estado del proyecto">
              {ESTADOS_PROYECTO.map((estado) => {
                const selected = estadoSeleccionado === estado.value;
                const current = estadoActualProyecto === estado.value;

                return (
                  <button
                    key={estado.value}
                    type="button"
                    className={`prj-state-option ${selected ? 'active' : ''}`}
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setEstadoSeleccionado(estado.value)}
                    disabled={guardando}
                  >
                    <span className={`prj-state-dot ${estado.value}`} />
                    <span className="prj-state-option-main">
                      <span className="prj-state-label">{estado.label}</span>
                      <span className="prj-state-description">
                        {ESTADO_DETALLE[estado.value]}
                      </span>
                    </span>
                    {current && <span className="prj-state-current-badge">Actual</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        confirmLabel={hayCambioEstado ? 'Guardar estado' : 'Mantener estado'}
        cancelLabel="Cancelar"
        variant="blue"
        icon="info"
        loading={guardando}
        onConfirm={handleGuardarEstadoProyecto}
        onClose={handleCerrarEstadoProyecto}
      />

      <ConfirmModal
        open={!!confirmDel}
        title="¿Eliminar proyecto?"
        message={`Estás por eliminar "${confirmDel?.titulo}". Esta acción es permanente y no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        variant="red"
        icon="warning"
        onConfirm={async () => { await eliminar(confirmDel.id); setConfirmDel(null); }}
        onClose={() => setConfirmDel(null)}
      />

      <ConfirmModal
        open={!!confirmDetach}
        title="¿Desvincular participación?"
        message={`Vas a quitar tu participación de "${confirmDetach?.titulo}". El proyecto seguirá existiendo para los demás participantes.`}
        confirmLabel="Sí, desvincularme"
        variant="blue"
        icon="warning"
        onConfirm={async () => { await desvincularParticipacion(confirmDetach.id); setConfirmDetach(null); }}
        onClose={() => setConfirmDetach(null)}
      />

      <ProjectsToast toast={toast} />

    </div>
  );
}
