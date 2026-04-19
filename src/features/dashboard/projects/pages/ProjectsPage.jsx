import { useState } from 'react';
import '../styles/projects.css';
import ProjectCard from '../components/ProjectCard';
import ProjectsEdit from '../components/ProjectsEdit';
import ConfirmModal from '../../../../shared/ui/ConfirmModal';
import { useProjects } from '../hooks/useProjects';

/* ════════════════════════════════════════
   ProjectsPage
   src/features/dashboard/projects/pages/ProjectsPage.jsx
   
   Solo orquesta: estado UI + modales.
   Toda la lógica de datos está en useProjects.
════════════════════════════════════════ */
export default function ProjectsPage() {
  const {
    proyectos, visGlobal, loading, guardando, toast,
    crearNuevo, editarExistente, eliminar,
    toggleVisibilidad, toggleVisibilidadGlobal,
  } = useProjects();

  // Estado UI puro
  const [editando,    setEditando]    = useState(null);  // null | proyecto | 'nuevo'
  const [confirmVis,  setConfirmVis]  = useState(null);  // proyecto a cambiar vis
  const [confirmDel,  setConfirmDel]  = useState(null);  // proyecto a eliminar
  const [filtro,      setFiltro]      = useState('todos');
  const [busqueda,    setBusqueda]    = useState('');
  const [orden,       setOrden]       = useState('recientes');

  /* ── Guardar (crear o editar) ── */
  const handleGuardar = async (datos, archivo) => {
    if (editando === 'nuevo') {
      await crearNuevo(datos, archivo);
    } else {
      await editarExistente(editando.id, datos, archivo);
    }
    setEditando(null);
  };

  /* ── Confirmar visibilidad individual ── */
  const handleConfirmarVis = () => {
    if (confirmVis) { toggleVisibilidad(confirmVis.id); setConfirmVis(null); }
  };

  /* ── Confirmar eliminación ── */
  const handleConfirmarDel = async () => {
    if (confirmDel) { await eliminar(confirmDel.id); setConfirmDel(null); }
  };

  /* ── Filtrar + ordenar (sin lógica extra de datos) ── */
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

  if (loading) {
    return (
      <div className="prj-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <span className="prj-spinner" style={{ width: 24, height: 24, borderWidth: 3, borderColor: 'var(--azul-mid)', borderTopColor: 'var(--azul)' }} />
      </div>
    );
  }

  return (
    <div className="prj-page">

      {/* ── Module Header ── */}
      <div className="prj-module-header">
        <div>
          <div className="prj-header-eyebrow">Portafolio</div>
          <div className="prj-header-title">Mis Proyectos</div>
        </div>
        <button className="prj-btn-add" onClick={() => setEditando('nuevo')}>
          <svg viewBox="0 0 12 12"><path d="M6 1v10M1 6h10"/></svg>
          Agregar nuevo
        </button>
      </div>

      {/* ── Content ── */}
      <div className="prj-content">

        {/* Visibility Banner */}
        <div className={`prj-vis-banner${!visGlobal ? ' privado' : ''}`}>
          <button className={`prj-toggle-pill${!visGlobal ? ' off' : ''}`} type="button" onClick={toggleVisibilidadGlobal} />
          <div className="prj-banner-info">
            <div className="prj-banner-title">Visibilidad del portafolio</div>
            <div className="prj-banner-sub">
              {visGlobal ? 'Tu portafolio es visible para empresas y reclutadores' : 'Tu portafolio está oculto — nadie puede verlo'}
            </div>
          </div>
          <div className="prj-banner-stat">
            <div className="prj-b-dot" />
            {visGlobal ? 'Público' : 'Privado'}
          </div>
        </div>

        {/* Search */}
        <div className="prj-search-wrap">
          <svg className="prj-search-icon" viewBox="0 0 16 16">
            <circle cx="6.5" cy="6.5" r="5"/>
            <path d="M10.5 10.5l3.5 3.5"/>
          </svg>
          <input
            className="prj-search-input"
            type="text"
            placeholder="Buscar por nombre, tecnología o estado..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <span className="prj-search-kbd">⌘ K</span>
        </div>

        {/* Filters */}
        <div className="prj-filter-row">
          <div className="prj-tab-grp">
            {[
              { id: 'todos',      label: 'Todos'          },
              { id: 'publicado',  label: 'Publicados'     },
              { id: 'desarrollo', label: 'En desarrollo'  },
              { id: 'borrador',   label: 'Borradores'     },
            ].map(tab => (
              <button
                key={tab.id}
                className={`prj-tab${filtro === tab.id ? ' active' : ''}`}
                onClick={() => setFiltro(tab.id)}
              >
                {tab.label}
                {conteo[tab.id] > 0 && <span className="prj-tab-count">{conteo[tab.id]}</span>}
              </button>
            ))}
          </div>
          <select className="prj-sort-select" value={orden} onChange={e => setOrden(e.target.value)}>
            <option value="recientes">Más recientes</option>
            <option value="antiguos">Más antiguos</option>
            <option value="alfa">Alfabético</option>
          </select>
        </div>

        {/* Grid */}
        <div className="prj-grid">
          {proyectosFiltrados.length === 0 ? (
            <div className="prj-empty">
              <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <div className="prj-empty-title">
                {busqueda ? `Sin resultados para "${busqueda}"` : 'Sin proyectos en esta categoría'}
              </div>
              <div className="prj-empty-sub">
                {busqueda ? 'Prueba con otro nombre o tecnología' : 'Agrega un proyecto para empezar'}
              </div>
            </div>
          ) : (
            proyectosFiltrados.map(p => (
              <ProjectCard
                key={p.id}
                proyecto={p}
                onEditar={(proj) => setEditando(proj)}
                onToggleVis={(proj) => setConfirmVis(proj)}
                onEliminar={(proj) => setConfirmDel(proj)}
              />
            ))
          )}

          {/* Card agregar */}
          <div className="prj-card-add" onClick={() => setEditando('nuevo')}>
            <div className="prj-add-icon">
              <svg viewBox="0 0 20 20"><path d="M10 4v12M4 10h12"/></svg>
            </div>
            <div className="prj-add-label">Agregar nuevo proyecto</div>
            <div className="prj-add-sub">Muestra tu siguiente trabajo al mundo</div>
          </div>
        </div>

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
        onConfirm={handleConfirmarVis}
        onClose={() => setConfirmVis(null)}
      />

      <ConfirmModal
        open={!!confirmDel}
        title="¿Eliminar proyecto?"
        message={`Estás por eliminar "${confirmDel?.titulo}". Esta acción es permanente y no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        variant="red"
        icon="warning"
        onConfirm={handleConfirmarDel}
        onClose={() => setConfirmDel(null)}
      />

      {/* Toast */}
      {toast && (
        <div className={`prj-toast ${toast.tipo}`}>
          {toast.tipo === 'ok'
            ? <svg viewBox="0 0 14 14"><path d="M2 7l3.5 3.5L12 3"/></svg>
            : <svg viewBox="0 0 14 14"><path d="M7 1L1 12h12L7 1z"/><path d="M7 5.5v3"/></svg>
          }
          {toast.msg}
        </div>
      )}

    </div>
  );
}