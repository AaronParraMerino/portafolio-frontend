import { useState } from 'react';
import '../styles/projects.css';
import { useProjects } from '../hooks/useProjects';
import ProjectsHeader      from '../components/ProjectsHeader';
import ProjectsVisBanner   from '../components/ProjectsVisBanner';
import ProjectsFilters     from '../components/ProjectsFilters';
import ProjectsGrid        from '../components/ProjectsGrid';
import ProjectsEdit        from '../components/ProjectsEdit';
import ProjectsToast       from '../components/ProjectsToast';
import ConfirmModal        from '../../../../shared/ui/ConfirmModal';

/* ════════════════════════════════════════
   ProjectsPage
   src/features/dashboard/projects/pages/ProjectsPage.jsx

   Solo orquesta: estado UI + callbacks.
   Toda la lógica de datos vive en useProjects.
   Toda la lógica de presentación vive en sus componentes.
════════════════════════════════════════ */
export default function ProjectsPage() {
  const {
    proyectos, visGlobal, loading, guardando, toast,
    crearNuevo, editarExistente, eliminar,
    toggleVisibilidad, toggleVisibilidadGlobal,
  } = useProjects();

  // ── Estado UI puro ──
  const [editando,   setEditando]   = useState(null);
  const [confirmVis, setConfirmVis] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [filtro,     setFiltro]     = useState('todos');
  const [busqueda,   setBusqueda]   = useState('');
  const [orden,      setOrden]      = useState('recientes');

  // ── Callbacks ──
  const handleGuardar = async (datos, archivo) => {
    if (editando === 'nuevo') await crearNuevo(datos, archivo);
    else await editarExistente(editando.id, datos, archivo);
    setEditando(null);
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
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="prj-page prj-page-loading">
        <span className="prj-spinner prj-spinner-lg" />
      </div>
    );
  }

  return (
    <div className="prj-page">

      <ProjectsHeader onAgregar={() => setEditando('nuevo')} />

      <div className="prj-content">

        <ProjectsVisBanner
          visible={visGlobal}
          onToggle={toggleVisibilidadGlobal}
        />

        <ProjectsFilters
          busqueda={busqueda}   onBusqueda={setBusqueda}
          filtro={filtro}       onFiltro={setFiltro}
          orden={orden}         onOrden={setOrden}
          conteo={conteo}
        />

        <ProjectsGrid
          proyectos={proyectosFiltrados}
          busqueda={busqueda}
          onEditar={(p)     => setEditando(p)}
          onToggleVis={(p)  => setConfirmVis(p)}
          onEliminar={(p)   => setConfirmDel(p)}
          onAgregar={() => setEditando('nuevo')}
        />

      </div>

      {/* ── Modales ── */}

      {editando !== null && (
        <ProjectsEdit
          proyecto={editando === 'nuevo' ? null : editando}
          onGuardar={handleGuardar}
          onCancelar={() => !guardando && setEditando(null)}
          guardando={guardando}
        />
      )}

      <ConfirmModal
        open={!!confirmVis}
        title={confirmVis?.es_publico ? '¿Ocultar proyecto?' : '¿Publicar proyecto?'}
        message={confirmVis?.es_publico
          ? `"${confirmVis?.titulo}" quedará privado y no aparecerá en tu portafolio público.`
          : `"${confirmVis?.titulo}" será visible en tu portafolio público.`
        }
        confirmLabel={confirmVis?.es_publico ? 'Sí, ocultar' : 'Sí, publicar'}
        variant="blue"
        icon="check"
        onConfirm={() => { toggleVisibilidad(confirmVis.id); setConfirmVis(null); }}
        onClose={() => setConfirmVis(null)}
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

      <ProjectsToast toast={toast} />

    </div>
  );
}